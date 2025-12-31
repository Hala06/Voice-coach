'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';
import { Suspense, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Waveform } from './Waveform';
import { ErrorBoundary } from './ErrorBoundary';

interface AnimatedMicrophoneProps {
  isActive?: boolean;
  isListening?: boolean;
  onClick?: () => void;
  size?: 'md' | 'lg' | 'xl';
  levels?: number[];
}

const SIZE_MAP = {
  md: { button: 'w-20 h-20', icon: 1.8 },
  lg: { button: 'w-28 h-28', icon: 2.2 },
  xl: { button: 'w-36 h-36', icon: 2.8 },
} as const;

function MicIconFallback() {
  return (
    <svg className="w-12 h-12 text-white relative z-10 mx-auto my-auto" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z" />
      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
    </svg>
  );
}

function ThreeErrorFallback({ onFail }: { onFail: () => void }) {
  useEffect(() => {
    onFail();
  }, [onFail]);

  return (
    <div className="flex items-center justify-center w-full h-full">
      <MicIconFallback />
    </div>
  );
}

function MicrophoneModel({ scale = 1 }) {
  const { scene } = useGLTF('/mic.glb');
  const { gl } = useThree();

  useEffect(() => {
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      console.log('WebGL context lost, will restore');
    };

    const handleContextRestored = () => {
      console.log('WebGL context restored');
    };

    const canvas = gl.domElement;
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [gl]);

  return <primitive object={scene} scale={scale} />;
}

useGLTF.preload('/mic.glb');

export function AnimatedMicrophone({
  isActive = false,
  isListening = false,
  onClick,
  size = 'lg',
  levels,
}: AnimatedMicrophoneProps) {
  const [has3DError, setHas3DError] = useState(false);

  const handle3DFailure = useCallback(() => {
    setHas3DError(true);
  }, []);

  const scale = SIZE_MAP[size].icon;
  const shouldRender3D = !has3DError && (isListening || isActive);

  return (
    <motion.div className="flex flex-col items-center gap-4">
      <motion.button
        onClick={onClick}
        className={`${SIZE_MAP[size].button} rounded-full bg-linear-to-r from-purple-600 to-blue-600 flex items-center justify-center relative overflow-hidden group cursor-pointer transition-all`}
        animate={isListening ? { scale: [1, 1.05, 1] } : {}}
        transition={isListening ? { duration: 1.5, repeat: Infinity } : {}}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-linear-to-r from-purple-600 to-blue-600 opacity-0 blur-xl"
          animate={isListening ? { opacity: [0.5, 0.8, 0.5] } : { opacity: 0 }}
          transition={isListening ? { duration: 1.5, repeat: Infinity } : {}}
        />

        {/* Ripple effect */}
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

        {/* 3D Microphone */}
        <div className="relative z-10 w-full h-full">
          {!shouldRender3D ? (
            <MicIconFallback />
          ) : (
            <ErrorBoundary fallback={<ThreeErrorFallback onFail={handle3DFailure} />}>
              <Suspense
                fallback={
                  <div className="flex items-center justify-center w-full h-full text-white/80 text-sm">
                    Loading...
                  </div>
                }
              >
                <Canvas
                  camera={{ position: [0, 0, 6], fov: 45 }}
                  dpr={[1, 2]}
                  onCreated={({ gl }) => {
                    const canvas = gl.domElement;
                    const onLost = (e: Event) => {
                      e.preventDefault();
                      handle3DFailure();
                    };
                    canvas.addEventListener('webglcontextlost', onLost);
                  }}
                >
                  <ambientLight intensity={0.6} />
                  <directionalLight position={[5, 5, 5]} intensity={1.2} />
                  <Stage intensity={0.4} environment="city" preset="soft">
                    <MicrophoneModel scale={scale} />
                  </Stage>
                  <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1} />
                </Canvas>
              </Suspense>
            </ErrorBoundary>
          )}
        </div>
      </motion.button>

      {(isListening || isActive) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">
          <Waveform isActive={true} size="sm" barCount={levels ? levels.length : 20} levels={levels} />
        </motion.div>
      )}
    </motion.div>
  );
}
