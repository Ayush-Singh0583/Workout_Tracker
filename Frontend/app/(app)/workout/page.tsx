'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTemplates, useStartWorkout, useTodaySession } from '../../../hooks/useWorkout';
import { useRouter } from 'next/navigation';

const TYPE_COLORS: Record<string, string> = {
  PUSH: 'text-violet-400 bg-violet-400/10 border-violet-400/30',
  PULL: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  LEGS: 'text-green-400 bg-green-400/10 border-green-400/30',
};

export default function WorkoutPage() {
  const router = useRouter();
  const { data: templates, isLoading } = useTemplates();
  const { data: todaySession } = useTodaySession();
  const { mutateAsync: start, isPending } = useStartWorkout();
  const [starting, setStarting] = useState<string | null>(null);

  const handleStart = async (templateId: string) => {
    setStarting(templateId);
    try {
      const session = await start({ templateId });
      router.push(`/workout/${session.id}`);
    } catch {
      setStarting(null);
    }
  };

  if (todaySession) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-5 mb-6">
          <h2 className="font-bold text-amber-400 mb-1">Workout In Progress</h2>
          <p className="text-sm text-zinc-400">
            You have an active {todaySession.template?.name ?? 'workout'} session today.
          </p>
          <button
            onClick={() => router.push(`/workout/${todaySession.id}`)}
            className="mt-3 bg-amber-400 text-black font-bold px-4 py-2 rounded-lg text-sm hover:bg-amber-300 transition-colors"
          >
            Continue Workout →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-2">Start a Workout</h1>
        <p className="text-zinc-400 mb-6">Choose a template to begin today's session.</p>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-zinc-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {templates?.map((tmpl: any) => (
              <motion.div
                key={tmpl.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 cursor-pointer hover:border-zinc-600 transition-colors"
                onClick={() => handleStart(tmpl.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{tmpl.name}</h3>
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded border ${
                        TYPE_COLORS[tmpl.type] ?? 'text-zinc-400'
                      }`}
                    >
                      {tmpl.type}
                    </span>
                  </div>
                  {starting === tmpl.id ? (
                    <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="text-zinc-400 text-xl">→</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {tmpl.exercises.map((te: any) => (
                    <div key={te.id} className="text-xs text-zinc-500 flex justify-between">
                      <span>{te.exercise.name}</span>
                      <span className="text-zinc-600 font-mono">
                        {te.targetSets}×{te.targetReps}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}