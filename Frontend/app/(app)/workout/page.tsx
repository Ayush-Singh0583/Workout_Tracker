'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTemplates, useStartWorkout, useTodaySession } from '../../../hooks/useWorkout';
import { useRouter } from 'next/navigation';

const TYPE_COLORS: Record<string, string> = {
  PUSH: 'text-violet-400 bg-violet-400/10 border-violet-400/30',
  PULL: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  LEGS: 'text-green-400 bg-green-400/10 border-green-400/30',
};

const TYPE_ICONS: Record<string, string> = {
  PUSH: '💪',
  PULL: '🏋️',
  LEGS: '🦵',
};

export default function WorkoutPage() {
  const router = useRouter();
  const { data: templates, isLoading: templatesLoading } = useTemplates();
  const { data: todaySession, isLoading: todayLoading } = useTodaySession();
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

  // Show loading state while checking for existing session
  if (todayLoading) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // If there's an active session today, show continue prompt + template list below
  const hasActiveSession = !!todaySession;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-2">
          {hasActiveSession ? 'Workout In Progress' : 'Start a Workout'}
        </h1>
        <p className="text-zinc-400 mb-6">
          {hasActiveSession
            ? 'You have an active session. Continue or start a new one.'
            : 'Choose a template to begin today\'s session.'}
        </p>

        {/* Active session banner */}
        <AnimatePresence>
          {hasActiveSession && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-5 mb-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-amber-400 mb-1">
                    {todaySession.template?.name ?? 'Workout'} — Active
                  </h2>
                  <p className="text-sm text-zinc-400">
                    {todaySession.sets?.length ?? 0} sets logged ·{' '}
                    {new Date(todaySession.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <button
                  onClick={() => router.push(`/workout/${todaySession.id}`)}
                  className="bg-amber-400 text-black font-bold px-5 py-2.5 rounded-lg text-sm hover:bg-amber-300 transition-colors"
                >
                  Continue →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Template list */}
        {templatesLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 bg-zinc-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : !templates?.length ? (
          <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-xl">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-lg font-semibold mb-2">No Workout Templates Found</p>
            <p className="text-sm text-zinc-500 max-w-xs mx-auto">
              Run <code className="text-amber-400 bg-zinc-800 px-1.5 py-0.5 rounded text-xs">npm run seed</code>{' '}
              in the backend to load the Push/Pull/Legs program.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((tmpl: any, idx: number) => (
              <motion.div
                key={tmpl.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 cursor-pointer hover:border-zinc-600 transition-colors"
                onClick={() => handleStart(tmpl.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{TYPE_ICONS[tmpl.type] ?? '🏋️'}</span>
                      <h3 className="font-bold text-lg">{tmpl.name}</h3>
                    </div>
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

                {/* Exercise list */}
                <div className="grid grid-cols-2 gap-1.5 mt-3">
                  {tmpl.exercises.map((te: any) => (
                    <div
                      key={te.id}
                      className="text-xs flex justify-between bg-zinc-800/50 rounded px-3 py-2"
                    >
                      <span className="text-zinc-300">{te.exercise.name}</span>
                      <span className="text-zinc-500 font-mono ml-2">
                        {te.targetSets}×{te.targetReps}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="flex gap-4 mt-3 pt-3 border-t border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                    {tmpl.exercises.length} exercises
                  </span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                    {tmpl.exercises.reduce((a: number, e: any) => a + e.targetSets, 0)} total sets
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}