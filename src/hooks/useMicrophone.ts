'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseMicrophoneOptions {
  smoothing?: number;
  fftSize?: number;
  barCount?: number;
}

export function useMicrophone({ smoothing = 0.6, fftSize = 2048, barCount = 40 }: UseMicrophoneOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [levels, setLevels] = useState<number[]>(Array.from({ length: barCount }, () => 0));
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    streamRef.current = null;
    audioContextRef.current = null;
    analyserRef.current = null;
    setIsListening(false);
  }, []);

  const tick = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    const chunkSize = Math.floor(bufferLength / barCount);
    const newLevels = Array.from({ length: barCount }, (_, i) => {
      const slice = dataArray.slice(i * chunkSize, (i + 1) * chunkSize);
      const avg = slice.reduce((acc, val) => acc + Math.abs(val - 128), 0) / slice.length;
      return Math.min(1, avg / 64); // normalize roughly 0-1
    });

    setLevels(newLevels);
    rafRef.current = requestAnimationFrame(tick);
  }, [barCount]);

  const start = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.smoothingTimeConstant = smoothing;
      analyser.fftSize = fftSize;
      analyserRef.current = analyser;
      source.connect(analyser);

      setIsListening(true);
      tick();
    } catch (err) {
      console.error(err);
      setError('Microphone access denied. Please enable permissions.');
      stop();
    }
  }, [fftSize, smoothing, stop, tick]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    isListening,
    error,
    levels,
    start,
    stop,
  };
}
