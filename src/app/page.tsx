'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Mic, Brain, Globe } from 'lucide-react';
import { Container, Button, Card } from '@/components';

const HeroMicrophone = dynamic(
  () => import('@/components/AnimatedMicrophone').then((m) => m.AnimatedMicrophone),
  {
    ssr: false,
    loading: () => (
      <div className="w-36 h-36 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
        <div className="w-12 h-12 text-white/80">Loading…</div>
      </div>
    ),
  }
);

export default function Home() {
  return (
    <Container gradient="hero" className="relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"
          animate={{ y: [0, 50, 0], x: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"
          animate={{ y: [0, -50, 0], x: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
        />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-4xl w-full">
          <div className="text-center space-y-8">
            {/* Animated heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-4"
            >
              <h1 className="text-5xl md:text-7xl font-bold bg-linear-to-r from-purple-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent leading-tight">
                Speak Fluently. Learn Naturally.
              </h1>
              <p className="text-xl md:text-2xl text-blue-200/80">
                Your AI conversation partner that listens, responds, and adapts to you
              </p>
            </motion.div>

            {/* Animated Microphone */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center py-8"
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 rounded-full bg-linear-to-r from-purple-500 to-blue-500 blur-xl opacity-30"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <HeroMicrophone size="xl" isActive={true} isListening={false} />
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link href="/onboarding">
                <Button size="lg" className="group pulse-glow">
                  Start Speaking
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </Button>
              </Link>
            </motion.div>

            {/* Features Section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="pt-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                {/* Feature 1 */}
                <Card delay={0.8}>
                  <div className="flex flex-col items-center text-center space-y-3">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="p-3 bg-purple-500/20 rounded-lg"
                    >
                      <Mic className="w-8 h-8 text-purple-300" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-white">Real-time Conversation</h3>
                    <p className="text-sm text-gray-300">Talk naturally, get instant responses</p>
                  </div>
                </Card>

                {/* Feature 2 */}
                <Card delay={0.95}>
                  <div className="flex flex-col items-center text-center space-y-3">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                      className="p-3 bg-blue-500/20 rounded-lg"
                    >
                      <Brain className="w-8 h-8 text-blue-300" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-white">Smart Corrections</h3>
                    <p className="text-sm text-gray-300">Pronunciation feedback that adapts to you</p>
                  </div>
                </Card>

                {/* Feature 3 */}
                <Card delay={1.1}>
                  <div className="flex flex-col items-center text-center space-y-3">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                      className="p-3 bg-cyan-500/20 rounded-lg"
                    >
                      <Globe className="w-8 h-8 text-cyan-300" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-white">Always Available</h3>
                    <p className="text-sm text-gray-300">Practice anytime, anywhere</p>
                  </div>
                </Card>
              </div>
            </motion.div>

            {/* Sign Up CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="pt-6"
            >
              <p className="text-gray-300 mb-4">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
                  Sign in
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="text-gray-400 text-sm">Scroll to explore</div>
      </motion.div>
    </Container>
  );
}
