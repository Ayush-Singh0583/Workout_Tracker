'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PRESETS = [60, 90, 120, 180, 240];

export function RestTimer() {
  const [duration, setDuration] = useState(180);
  const [remaining, setRemaining] = useState(180);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            setRunning(false);
            // Vibrate if supported
            if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const reset = (d?: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const target = d ?? duration;
    setDuration(target);
    setRemaining(target);
    setRunning(false);
  };

  const toggle = () => {
    if (remaining === 0) { reset(); return; }
    setRunning((v) => !v);
  };

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const progress = remaining / duration;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Rest Timer</h3>
        <div className="flex gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => reset(p)}
              className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                duration === p
                  ? 'border-amber-400 text-amber-400'
                  : 'border-zinc-700 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {p < 60 ? `${p}s` : `${p / 60}m`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Circular progress */}
        <div className="relative w-16 h-16 shrink-0">
          <svg viewBox="0 0 64 64" className="rotate-[-90deg]">
            <circle cx="32" cy="32" r="28" fill="none" stroke="#27272a" strokeWidth="4" />
            <motion.circle
              cx="32" cy="32" r="28"
              fill="none"
              stroke={remaining === 0 ? '#4ade80' : running ? '#f59e0b' : '#52525b'}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 28}`}
              animate={{ strokeDashoffset: `${2 * Math.PI * 28 * (1 - progress)}` }}
              transition={{ duration: 0.3 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-sm font-bold">
              {mins}:{secs.toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={toggle}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              running
                ? 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                : remaining === 0
                ? 'bg-green-500 text-white hover:bg-green-400'
                : 'bg-amber-400 text-black hover:bg-amber-300'
            }`}
          >
            {remaining === 0 ? 'Reset' : running ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={() => reset()}
            className="px-3 py-2 rounded-lg text-sm text-zinc-500 border border-zinc-700 hover:text-zinc-300 transition-colors"
          >
            ↺
          </button>
        </div>
      </div>
    </div>
  );
}