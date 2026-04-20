'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ProgressChart } from '../../../components/ProgressChart';
import { useQuery } from '@tanstack/react-query';
import { exerciseApi } from '../../../lib/api';

const METRIC_OPTIONS = [
  { value: 'estimated1RM', label: 'Est. 1RM' },
  { value: 'volume', label: 'Volume' },
  { value: 'maxWeight', label: 'Max Weight' },
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  PUSH: 'text-violet-400',
  PULL: 'text-blue-400',
  LEGS: 'text-green-400',
};

export default function ProgressPage() {
  const { data: exercises } = useQuery({
    queryKey: ['exercises'],
    queryFn: exerciseApi.getAll,
    staleTime: Infinity,
  });

  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [metric, setMetric] = useState<'estimated1RM' | 'volume' | 'maxWeight'>('estimated1RM');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filtered = exercises?.filter(
    (e: any) => selectedCategory === 'ALL' || e.category === selectedCategory,
  ) ?? [];

  const selectedEx = exercises?.find((e: any) => e.id === selectedExercise);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold mb-6">Progress</h1>

        <div className="grid lg:grid-cols-[220px_1fr] gap-6">
          {/* Sidebar: exercise list */}
          <div className="space-y-4">
            {/* Category filter */}
            <div className="flex gap-2 flex-wrap">
              {['ALL', 'PUSH', 'PULL', 'LEGS'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    selectedCategory === cat
                      ? 'bg-amber-400 text-black border-amber-400 font-bold'
                      : 'border-zinc-700 text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              {filtered.map((ex: any, i: number) => (
                <button
                  key={ex.id}
                  onClick={() => setSelectedExercise(ex.id)}
                  className={`w-full text-left px-4 py-3 text-sm border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800 transition-colors flex items-center justify-between ${
                    selectedExercise === ex.id ? 'bg-zinc-800' : ''
                  }`}
                >
                  <span className={selectedExercise === ex.id ? 'text-amber-400' : ''}>
                    {ex.name}
                  </span>
                  <span className={`text-[10px] ${CATEGORY_COLORS[ex.category]}`}>
                    {ex.category}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Main chart area */}
          <div className="space-y-4">
            {/* Metric selector */}
            <div className="flex gap-2">
              {METRIC_OPTIONS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMetric(m.value)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    metric === m.value
                      ? 'bg-zinc-700 text-zinc-100 border-zinc-600'
                      : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {selectedExercise ? (
              <ProgressChart
                exerciseId={selectedExercise}
                exerciseName={selectedEx?.name ?? ''}
                metric={metric}
              />
            ) : (
              <div className="h-64 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-xl">
                <p className="text-zinc-500 text-sm">Select an exercise to view progress</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}