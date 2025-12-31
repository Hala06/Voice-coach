# Voice Learning Coach: Your AI-Powered Speaking Partner

## Inspiration
As a computer security student balancing multiple languages (English, Arabic, French, and Russian), I’ve experienced firsthand the frustration of practicing pronunciation alone. Apps give you text exercises, but real fluency comes from conversation—and finding a patient speaking partner at 2 AM is impossible.

Late-night Duolingo streaks helped with vocabulary, but I couldn’t practice speaking. Traditional language apps are one-sided; tutors are expensive; and peer practice requires coordination. We asked: What if your AI coach could actually talk to you?

That’s when ElevenLabs + Google AI clicked: combine human-like voice with intelligent responses to create an always-available conversation partner.

## What it does
Voice Learning Coach transforms language practice through natural conversation:

- Voice-first interface: click-to-record and get a spoken response.
- Intelligent responses: Google Gemini generates supportive coaching and corrections.
- Realistic voice: ElevenLabs generates human-quality speech.
- Corrections and polish: gentle feedback to improve clarity and confidence.
- Context awareness: keeps a session history so the conversation stays coherent.

## How we built it
- Frontend: Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, Lucide.
- Voice processing: ElevenLabs Speech-to-Text + Text-to-Speech.
- AI intelligence: Google Gemini (via `@google/generative-ai`).
- Authentication: Clerk for secure user sessions.
- Audio handling: browser MediaRecorder + base64 audio playback.

Architecture:
User Speech → ElevenLabs STT → Gemini (context + corrections) → ElevenLabs TTS → User hears response

Core routes:
- `/api/speech-to-text`
- `/api/ai-coach`
- `/api/text-to-speech`

## Challenges we ran into
- Real-time voice orchestration (STT → AI → TTS) without breaking UX.
- Audio format compatibility (browser WebM vs API expectations).
- Getting consistent structured outputs from the model.
- Staying inside free-tier limits while keeping responses useful.

## Accomplishments
- Shipped a full voice AI pipeline: recording → transcription → intelligence → voice synthesis.
- Polished UX with animated mic + waveform feedback.
- Production-ready auth and protected routes.

## What we learned
- Voice AI pipeline architecture (STT → NLP → TTS)
- Async orchestration + error handling
- Audio blob handling and API compatibility
- Prompt design for coaching-style responses

## Run locally
1) Install deps: `npm install`
2) Create `.env.local` with Clerk + ElevenLabs + Gemini keys
3) Start dev server: `npm run dev`
