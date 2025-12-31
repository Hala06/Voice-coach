'use client';

import { useState, useRef, useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface CoachResponse {
  message: string;
  corrections?: string[];
  encouragement?: string;
  nextSteps?: string | null;
}

interface UseVoiceCoachOptions {
  goal?: string;
  mode?: 'live' | 'demo';
  onError?: (error: string) => void;
}

export function useVoiceCoach({ goal = 'language', mode = 'live', onError }: UseVoiceCoachOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const demoStepRef = useRef(0);
  const demoTurnsRef = useRef(
    [
      {
        user: 'Hi I wanna learn english',
        assistant:
          "Absolutely — let’s do it. Quick correction: say ‘Hi, I want to learn English.’\n\nWarm‑up question: What’s your name and where are you from?",
      },
      {
        user: 'my name is malone Im in the unites states',
        assistant:
          "Nice to meet you, Malone! Quick correction: ‘My name is Malone. I’m in the United States.’\n\nNow tell me: What do you do for work?",
      },
      {
        user: 'Im a developer practiing for client meatings',
        assistant:
          "Great goal. A few quick fixes:\n- ‘I’m’ (with the apostrophe)\n- ‘practicing’ (spelling)\n- ‘meetings’ (spelling)\n\nBest version: ‘I’m a developer practicing for client meetings.’\n\nSay it again slowly, then add: ‘I want to sound more confident.’",
      },
      {
        user: "I’m a developer practicing for client meetings. I want to sound more confident.",
        assistant:
          "Perfect. Here’s a client‑meeting phrase to practice:\n‘Just to clarify, the next step is…’\n\nTip: stress ‘clarify’ (CLA-ri-fy).\n\nYour turn: Finish the sentence with a realistic next step.",
      },
    ] as Array<{ user: string; assistant: string }>
  );

  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    setConversation((prev) => [
      ...prev,
      { role, content, timestamp: Date.now() },
    ]);
  }, []);

  const startListening = useCallback(async () => {
    try {
      setError(null);

      if (mode === 'demo') {
        setIsListening(true);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch {
      const errorMsg = 'Failed to access microphone';
      setError(errorMsg);
      onError?.(errorMsg);
    }
  }, [mode, onError]);

  const stopListeningDemo = useCallback(async () => {
    if (!isListening) return;

    setIsListening(false);
    setIsProcessing(true);
    setError(null);

    const turn = demoTurnsRef.current[demoStepRef.current % demoTurnsRef.current.length];
    demoStepRef.current += 1;

    try {
      addMessage('user', turn.user);
      addMessage('assistant', turn.assistant);

      const ttsResponse = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: turn.assistant }),
      });

      const data = await ttsResponse.json().catch(() => null);
      const audio = data?.audio as string | undefined;
      const mimeType = (data?.mimeType as string | undefined) || 'audio/mpeg';

      if (audio && audio.length > 0) {
        const audioData = `data:${mimeType};base64,${audio}`;
        setIsSpeaking(true);
        if (audioRef.current) {
          audioRef.current.pause();
        }

        const audioElement = new Audio(audioData);
        audioRef.current = audioElement;

        audioElement.onended = () => {
          setIsSpeaking(false);
        };

        audioElement.onerror = () => {
          setIsSpeaking(false);
        };

        await audioElement.play().catch(() => {
          setIsSpeaking(false);
        });
      }
    } catch {
      // Demo should never surface errors during a recording.
    } finally {
      setIsProcessing(false);
    }
  }, [addMessage, isListening]);

  const stopListeningLive = useCallback(async () => {
    if (!mediaRecorderRef.current) return;

    return new Promise<void>((resolve) => {
      const mediaRecorder = mediaRecorderRef.current!;

      mediaRecorder.onstop = async () => {
        setIsListening(false);
        setIsProcessing(true);

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());

        try {
          // Step 1: Speech-to-Text
          const formData = new FormData();
          formData.append('audio', audioBlob, 'audio.webm');

          const sttResponse = await fetch('/api/speech-to-text', {
            method: 'POST',
            body: formData,
          });

          if (!sttResponse.ok) {
            const data = await sttResponse.json().catch(() => ({}));
            throw new Error(data?.error || 'Speech recognition failed');
          }

          const { text } = await sttResponse.json();
          if (!text?.trim()) {
            throw new Error('No speech detected');
          }

          addMessage('user', text);

          // Step 2: AI Coach Response
          const aiResponse = await fetch('/api/ai-coach', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: text,
              history: conversation,
              goal,
            }),
          });

          if (!aiResponse.ok) {
            const data = await aiResponse.json().catch(() => ({}));
            throw new Error(data?.error || 'AI coach failed to respond');
          }

          const coachData: CoachResponse = await aiResponse.json();
          addMessage('assistant', coachData.message);

          // Step 3: Text-to-Speech
          const ttsResponse = await fetch('/api/text-to-speech', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: coachData.message }),
          });

          if (!ttsResponse.ok) {
            throw new Error('Speech synthesis failed');
          }

          const { audio, mimeType, note } = await ttsResponse.json();
          
          // Only play audio if it exists
          if (audio && audio.length > 0) {
            const audioData = `data:${mimeType};base64,${audio}`;

            // Play audio
            setIsSpeaking(true);
            if (audioRef.current) {
              audioRef.current.pause();
            }

            const audioElement = new Audio(audioData);
            audioRef.current = audioElement;

            audioElement.onended = () => {
              setIsSpeaking(false);
            };

            audioElement.onerror = () => {
              setIsSpeaking(false);
            };

            await audioElement.play();
          } else {
            // No audio available, just show text response
            console.log('TTS unavailable:', note || 'No audio generated');
          }
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : 'Something went wrong';
          setError(errorMsg);
          onError?.(errorMsg);
        } finally {
          setIsProcessing(false);
          resolve();
        }
      };

      mediaRecorder.stop();
    });
  }, [conversation, goal, addMessage, onError]);

  const stopListening = useCallback(async () => {
    if (mode === 'demo') {
      await stopListeningDemo();
      return;
    }
    await stopListeningLive();
  }, [mode, stopListeningDemo, stopListeningLive]);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
  }, []);

  const clearConversation = useCallback(() => {
    setConversation([]);
    setError(null);
  }, []);

  const runDemoConversation = useCallback(() => {
    setError(null);

    const now = Date.now();
    const demo: Message[] = [
      {
        role: 'user',
        content: 'Hi I wanna learn english',
        timestamp: now - 60_000,
      },
      {
        role: 'assistant',
        content:
          "Great! I’m here to help you practice. Quick correction: say ‘Hi, I want to learn English.’\n\nNow try this: Tell me one thing you did yesterday.",
        timestamp: now - 55_000,
      },
      {
        role: 'user',
        content: 'Yesterday I go to the store and buyed some apples',
        timestamp: now - 45_000,
      },
      {
        role: 'assistant',
        content:
          "Nice effort! Two small fixes:\n- ‘Yesterday I went to the store…’ (past of go = went)\n- ‘…and bought some apples.’ (past of buy = bought)\n\nCorrected sentence: ‘Yesterday, I went to the store and bought some apples.’\n\nYour turn: Say it again, slowly.",
        timestamp: now - 40_000,
      },
      {
        role: 'user',
        content: "Yesterday, I went to the store and bought some apples. Also I don't know how to say the 'th' sound",
        timestamp: now - 25_000,
      },
      {
        role: 'assistant',
        content:
          "Great sentence! One tiny edit: ‘Also, I don’t know how to pronounce the “th” sound.’\n\nPronunciation tip:\n- Put your tongue lightly between your teeth\n- Blow air gently: ‘thhh’\n\nTry: ‘think’ and ‘this’. Which one is harder for you?",
        timestamp: now - 20_000,
      },
    ];

    setConversation(demo);
  }, []);

  return {
    isListening,
    isProcessing,
    isSpeaking,
    conversation,
    error,
    startListening,
    stopListening,
    stopSpeaking,
    clearConversation,
    runDemoConversation,
  };
}
