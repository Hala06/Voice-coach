'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, BookOpen, Zap, Users, MessageCircle } from 'lucide-react';
import { Container, Button, Card, Waveform } from '@/components';
import { useMicrophone } from '@/hooks/useMicrophone';

const goals = [
  {
    id: 'language',
    title: 'Learn a New Language',
    description: 'Start from basics and build fluency',
    icon: BookOpen,
    color: 'from-purple-400 to-purple-600',
  },
  {
    id: 'pronunciation',
    title: 'Improve Pronunciation',
    description: 'Master correct accent and articulation',
    icon: Zap,
    color: 'from-blue-400 to-blue-600',
  },
  {
    id: 'presentation',
    title: 'Practice Presentations',
    description: 'Gain confidence in public speaking',
    icon: Users,
    color: 'from-cyan-400 to-cyan-600',
  },
  {
    id: 'conversation',
    title: 'Casual Conversation',
    description: 'Chat naturally on everyday topics',
    icon: MessageCircle,
    color: 'from-pink-400 to-pink-600',
  },
];

interface OnboardingClientProps {
  initialGoal?: string | null;
  userName?: string | null;
}

export default function OnboardingClient({ initialGoal = null, userName }: OnboardingClientProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(initialGoal);
  const [transcript, setTranscript] = useState('');
  const [saving, setSaving] = useState(false);
  const { isListening, error, levels, start, stop } = useMicrophone({ barCount: 28 });

  useEffect(() => {
    setSelectedGoal(initialGoal ?? null);
  }, [initialGoal]);

  const heading = useMemo(() => {
    if (step === 1) return 'What are you here for?';
    if (isListening) return 'Listening...';
    if (transcript) return 'We heard you!';
    return 'Test Your Voice';
  }, [isListening, step, transcript]);

  const handleGoalSelect = (goalId: string) => {
    setSelectedGoal(goalId);
  };

  const handleStartVoiceTest = async () => {
    if (isListening) {
      stop();
      return;
    }

    setTranscript('');
    await start();
    setTimeout(() => {
      setTranscript('We picked up your voice loud and clear.');
      stop();
    }, 3200);
  };

  const handleCompleteOnboarding = async () => {
    setSaving(true);
    try {
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: selectedGoal ?? 'language' }),
      });
      router.push('/app/dashboard');
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  return (
    <Container gradient="hero" ambientVariant="both" className="relative overflow-hidden">
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Progress indicator */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2].map((i) => (
                <motion.div
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    step >= i ? 'bg-gradient-to-r from-purple-400 to-blue-400' : 'bg-white/20'
                  }`}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.2 }}
                />
              ))}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{heading}</h1>
            <p className="text-gray-400">Step {step} of 2</p>
            {userName && <p className="text-sm text-gray-500">Hey {userName}, let’s set you up.</p>}
          </motion.div>

          <AnimatePresence mode="wait">
            {/* Step 1: Goal Selection */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goals.map((goal, index) => {
                    const Icon = goal.icon;
                    return (
                      <motion.button
                        key={goal.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        onClick={() => handleGoalSelect(goal.id)}
                        className={`relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 ${
                          selectedGoal === goal.id
                            ? 'ring-2 ring-blue-400 shadow-xl shadow-blue-500/30'
                            : 'hover:shadow-lg hover:shadow-purple-500/20'
                        }`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${goal.color} opacity-0 transition-opacity ${selectedGoal === goal.id ? 'opacity-5' : ''}`} />
                        <div className="relative z-10">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${goal.color} bg-opacity-20`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-white mb-1">{goal.title}</h3>
                              <p className="text-sm text-gray-400">{goal.description}</p>
                            </div>
                          </div>
                          {selectedGoal === goal.id && (
                            <motion.div
                              layoutId="selection"
                              className="absolute top-4 right-4"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 200 }}
                            >
                              <div className="w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full" />
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Next button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex gap-4 mt-8"
                >
                  <Button
                    variant="outline"
                    size="md"
                    className="flex-1"
                    onClick={() => router.push('/')}
                  >
                    Back
                  </Button>
                  <Button
                    size="md"
                    className="flex-1 group"
                    disabled={!selectedGoal}
                    onClick={() => setStep(2)}
                  >
                    Continue
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </Button>
                </motion.div>
              </motion.div>
            )}

            {/* Step 2: Voice Test */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <Card glass className="text-center space-y-6 py-8">
                  {/* Microphone button */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 100 }}
                  >
                    <button
                      onClick={handleStartVoiceTest}
                      className="relative w-32 h-32 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center mx-auto group overflow-hidden cursor-pointer"
                    >
                      <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 blur-xl"
                        animate={
                          isListening
                            ? { opacity: [0.5, 0.8, 0.5] }
                            : { opacity: 0 }
                        }
                        transition={isListening ? { duration: 1.5, repeat: Infinity } : {}}
                      />
                      {isListening &&
                        [0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="absolute inset-0 rounded-full border-2 border-white/30"
                            animate={{
                              scale: [1, 1.5, 2],
                              opacity: [1, 0.5, 0],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: i * 0.5,
                            }}
                          />
                        ))}
                      <svg
                        className="w-16 h-16 text-white relative z-10"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z" />
                      </svg>
                    </button>
                  </motion.div>

                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-white">
                      {isListening ? 'Listening...' : transcript ? 'Got it!' : 'Test Your Microphone'}
                    </h2>
                    <p className="text-gray-400">
                      {isListening
                        ? 'Speak naturally and clearly'
                        : transcript
                          ? 'Your microphone is working great!'
                          : 'Click the microphone and say something'}
                    </p>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                  </div>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Waveform isActive={isListening || Boolean(transcript)} size="md" barCount={levels.length} levels={levels} />
                  </motion.div>

                  {transcript && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/10 border border-white/20 rounded-lg p-4 mt-4"
                    >
                      <p className="text-gray-300 italic">"{transcript}"</p>
                    </motion.div>
                  )}
                </Card>

                {/* Action buttons */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex gap-4"
                >
                  <Button
                    variant="outline"
                    size="md"
                    className="flex-1"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    size="md"
                    className="flex-1"
                    onClick={handleCompleteOnboarding}
                    isLoading={saving}
                    disabled={saving}
                  >
                    Get Started
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Container>
  );
}
