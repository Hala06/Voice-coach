'use client';

import { SignIn } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Container, Card, Waveform } from '@/components';

export default function LoginScreen() {
  return (
    <Container gradient="hero" ambientVariant="both" className="relative overflow-hidden">
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
              Voice Coach
            </h1>
            <p className="text-gray-400">Welcome back</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <Waveform isActive={true} size="sm" barCount={30} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card glass className="backdrop-blur-xl border border-white/20">
              <SignIn
                signUpUrl="/signup"
                forceRedirectUrl="/onboarding"
                appearance={{
                  elements: {
                    rootBox: 'w-full',
                    card: 'bg-transparent shadow-none border-0',
                    headerTitle: 'text-white text-xl font-semibold',
                    headerSubtitle: 'text-gray-400 text-sm',
                    formButtonPrimary:
                      'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 hover:shadow-lg hover:shadow-purple-500/40',
                  },
                  layout: {
                    helpPageUrl: '#',
                    socialButtonsPlacement: 'bottom',
                  },
                }}
              />
            </Card>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center text-xs text-gray-500 mt-4"
          >
            Need an account?{' '}
            <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-semibold">
              Sign up
            </Link>
          </motion.p>
        </div>
      </div>
    </Container>
  );
}
