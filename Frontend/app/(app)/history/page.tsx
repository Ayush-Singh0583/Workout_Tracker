'use client';
import { motion } from 'framer-motion';
import { useWorkoutHistory } from '../../../hooks/useWorkout';
import Link from 'next/link';

const TYPE_BADGES: Record<string, string> = {
  PUSH: 'text-violet-400 bg-violet-400/10 border-violet-400/30',
  PULL: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  LEGS: 'text-green-400 bg-green-400/10 border-green-400/30',
};

export default function HistoryPage() {
  const { data: sessions, isLoading } = useWorkoutHistory(30);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold mb-6">Workout History</h1>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-zinc-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : !sessions?.length ? (
          <div className="text-center py-16 text-zinc-500">
            <p className="text-4xl mb-3">🏋️</p>
            <p>No workouts logged yet. Start your first session!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session: any, i: number) => {
              const totalVolume = session.sets.reduce(
                (acc: number, s: any) => acc + s.weight * s.reps,
                0,
              );
              const setCount = session.sets.length;

              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link href={`/workout/${session.id}`}>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-600 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                                TYPE_BADGES[session.template?.type ?? ''] ??
                                'text-zinc-400 border-zinc-700'
                              }`}
                            >
                              {session.template?.type ?? '—'}
                            </span>
                            {session.completed && (
                              <span className="text-[10px] text-green-400">✓ DONE</span>
                            )}
                          </div>
                          <h3 className="font-semibold text-sm">
                            {session.template?.name ?? 'Custom Workout'}
                          </h3>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            {new Date(session.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'short',
                              day: 'numeric',
                            })}
                            {session.durationMin && ` · ${session.durationMin} min`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono text-amber-400">
                            {(totalVolume / 1000).toFixed(1)}k kg
                          </p>
                          <p className="text-xs text-zinc-500">{setCount} sets</p>
                        </div>
                      </div>

                      {session.sets.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {Object.values(
                            session.sets.reduce((acc: any, s: any) => {
                              acc[s.exerciseId] = s.exercise?.name ?? 'Exercise';
                              return acc;
                            }, {} as Record<string, string>),
                          )
                            .slice(0, 4)
                            .map((name: any, ni) => (
                              <span
                                key={ni}
                                className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded"
                              >
                                {name}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}