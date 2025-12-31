'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Settings, Volume2, VolumeX, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { Container, AnimatedMicrophone, Card, ErrorBoundary } from '@/components';
import { useVoiceCoach } from '@/hooks/useVoiceCoach';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [showMenu, setShowMenu] = useState(false);
  const userGoal = typeof user?.publicMetadata?.goal === 'string' ? user.publicMetadata.goal : 'language';

  const {
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
  } = useVoiceCoach({
    goal: userGoal,
    mode: 'demo',
    onError: (err) => console.error('Voice coach error:', err),
  });

  const handleMicClick = async () => {
    if (isListening) {
      await stopListening();
    } else if (!isProcessing && !isSpeaking) {
      await startListening();
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const isActive = isListening || isProcessing || isSpeaking;

  return (
    <ErrorBoundary>
      <Container gradient="subtle" ambientVariant="stars" className="relative overflow-hidden">
        <div className="relative z-10 h-screen flex flex-col">
          {/* Top Navigation */}
          <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="border-b border-white/10 bg-black/30 backdrop-blur-md"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
              <div className="text-2xl font-bold bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Voice Coach
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={runDemoConversation}
                  disabled={isActive}
                  className="text-gray-400 hover:text-white transition text-sm px-3 py-2 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-transparent"
                  title={isActive ? 'Stop the current session to run demo' : 'Load a demo conversation'}
                >
                  Demo
                </button>
                <button
                  onClick={clearConversation}
                  className="text-gray-400 hover:text-white transition text-sm px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm">{user?.firstName || 'Profile'}</span>
                  </button>

                  <AnimatePresence>
                    {showMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-slate-900 border border-white/20 rounded-lg overflow-hidden shadow-xl z-100"
                      >
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            router.push('/profile');
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-white/10 transition flex items-center gap-2 text-gray-300"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </button>
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            handleSignOut();
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-white/10 transition flex items-center gap-2 text-red-400"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.nav>

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Conversation Area */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {conversation.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex items-center justify-center text-center"
                  >
                    <div className="space-y-4 max-w-md">
                      <h2 className="text-2xl font-bold text-white">Demo conversation</h2>
                      <p className="text-gray-400">
                        Press the microphone once to start, then press again to get the AI response.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <AnimatePresence>
                    {conversation.map((msg, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                      >
                        {msg.role === 'assistant' && (
                          <div className="shrink-0">
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold">
                              AI
                            </div>
                          </div>
                        )}

                        <div
                          className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                            msg.role === 'user' ? 'items-end' : 'items-start'
                          } space-y-2`}
                        >
                          <div
                            className={`px-4 py-3 rounded-2xl ${
                              msg.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white/10 border border-white/20 text-gray-100'
                            }`}
                          >
                            <p className="text-sm md:text-base">{msg.content}</p>
                          </div>
                          <p className="text-xs text-gray-500 px-2">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}

                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4"
                  >
                    <div className="shrink-0">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-400 to-blue-400 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="px-4 py-3 rounded-2xl bg-white/10 border border-white/20">
                        <p className="text-sm text-gray-300">Processing your message...</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Input Area */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="border-t border-white/10 bg-black/30 backdrop-blur-md p-6"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-4">
                    <AnimatedMicrophone size="lg" isListening={isActive} onClick={handleMicClick} />
                    {isSpeaking && (
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        onClick={stopSpeaking}
                        className="p-4 rounded-full bg-red-500/20 border border-red-400 hover:bg-red-500/30 transition"
                      >
                        <VolumeX className="w-6 h-6 text-red-400" />
                      </motion.button>
                    )}
                  </div>

                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-white">
                      {isListening
                        ? '🎤 Listening...'
                        : isProcessing
                          ? '⏳ Processing...'
                          : isSpeaking
                            ? '🔊 AI Speaking...'
                            : 'Click to speak'}
                    </p>
                    {error && <p className="text-xs text-red-400">{error}</p>}
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Sidebar - Session Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-80 border-l border-white/10 p-6 space-y-6 overflow-y-auto hidden lg:flex flex-col bg-black/20"
            >
              {/* Session Stats */}
              <Card glass={true}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-white">📊 Live Session</h4>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="text-xs text-gray-400 mb-1">Total Messages</div>
                      <div className="text-2xl font-bold text-white font-mono">{conversation.length}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {conversation.filter(m => m.role === 'user').length} from you, {conversation.filter(m => m.role === 'assistant').length} from AI
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="text-xs text-gray-400 mb-1">Your Goal</div>
                      <div className="text-lg font-semibold text-white capitalize">{userGoal.replace(/_/g, ' ')}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="text-xs text-gray-400 mb-1">Status</div>
                      <div className="text-sm font-medium text-green-400">
                        {isListening ? '🎤 Recording...' : isProcessing ? '⚙️ Thinking...' : isSpeaking ? '🔊 Speaking...' : '✅ Ready'}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Tips */}
              <Card glass={true}>
                <div className="space-y-3">
                  <h4 className="font-semibold text-white text-sm">💡 Quick Tip</h4>
                  <p className="text-sm text-gray-300">
                    Click the mic and speak naturally. Your voice is transcribed in real-time, and the AI coach responds with personalized feedback!
                  </p>
                </div>
              </Card>

              {isSpeaking && (
                <Card glass={true}>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                      <Volume2 className="w-4 h-4 animate-pulse" />
                      AI is speaking
                    </h4>
                    <p className="text-sm text-gray-300">Listen carefully to the pronunciation and intonation.</p>
                  </div>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </Container>
    </ErrorBoundary>
  );
}
