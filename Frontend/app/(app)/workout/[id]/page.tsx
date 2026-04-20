'use client';
import { useParams } from 'next/navigation';
import { useSession, useCompleteWorkout } from '../../../../hooks/useWorkout';
import { WorkoutLogger } from '../../../../components/WorkoutLogger';
import { RestTimer } from '../../../../components/RestTimer';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function SessionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, isLoading } = useSession(id);
  const { mutateAsync: complete, isPending } = useCompleteWorkout();

  const startRef = useRef(Date.now());
  const [showTimer, setShowTimer] = useState(false);

  const handleFinish = async () => {
    const durationMin = Math.round((Date.now() - startRef.current) / 60000);
    await complete({ id, durationMin });
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  // Group sets already logged by exerciseId
  const loggedByExercise: Record<string, any[]> = {};
  for (const set of session.sets ?? []) {
    if (!loggedByExercise[set.exerciseId]) loggedByExercise[set.exerciseId] = [];
    loggedByExercise[set.exerciseId].push(set);
  }

  const exercises = session.template?.exercises ?? [];

  return (
    <div className="p-4 max-w-2xl mx-auto pb-32">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-xl font-bold">{session.template?.name ?? 'Workout'}</h1>
          <p className="text-sm text-zinc-400">
            {new Date(session.date).toLocaleDateString('en-US', {
              weekday: 'long', month: 'short', day: 'numeric',
            })}
          </p>
        </div>
        <button
          onClick={() => setShowTimer((v) => !v)}
          className="text-xs bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-lg text-zinc-300 hover:text-amber-400 transition-colors"
        >
          ⏱ Timer
        </button>
      </motion.div>

      {showTimer && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4"
        >
          <RestTimer />
        </motion.div>
      )}

      <div className="space-y-4">
        {exercises.map((te: any, idx: number) => (
          <WorkoutLogger
            key={te.id}
            sessionId={id}
            exercise={te.exercise}
            targetSets={te.targetSets}
            targetReps={te.targetReps}
            loggedSets={loggedByExercise[te.exercise.id] ?? []}
            index={idx}
          />
        ))}
      </div>

      {/* Finish button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-950/90 backdrop-blur border-t border-zinc-800">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleFinish}
            disabled={isPending}
            className="w-full bg-amber-400 text-black font-bold py-3 rounded-xl hover:bg-amber-300 transition-colors disabled:opacity-50"
          >
            {isPending ? 'Saving...' : 'Finish Workout ✓'}
          </button>
        </div>
      </div>
    </div>
  );
}