'use client';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceDot, CartesianGrid,
} from 'recharts';
import { motion } from 'framer-motion';
import { useExerciseProgress } from '../hooks/useWorkout';
import { statusColor, type ProgressStatus } from '../lib/progression';

interface Props {
  exerciseId: string;
  exerciseName: string;
  metric?: 'volume' | 'estimated1RM' | 'maxWeight';
}

const METRIC_LABELS = {
  volume: 'Volume (kg)',
  estimated1RM: 'Estimated 1RM (kg)',
  maxWeight: 'Max Weight (kg)',
};

export function ProgressChart({ exerciseId, exerciseName, metric = 'estimated1RM' }: Props) {
  const { data, isLoading } = useExerciseProgress(exerciseId);

  if (isLoading) {
    return <div className="h-48 bg-zinc-800 rounded-xl animate-pulse" />;
  }

  if (!data?.length) {
    return (
      <div className="h-48 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-500">
        No data yet — log some sets first
      </div>
    );
  }

  const chartData = data.map((d: any) => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: Math.round(d[metric] * 10) / 10,
    status: d.status as ProgressStatus,
  }));

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const color =
      payload.status === 'IMPROVEMENT'
        ? '#4ade80'
        : payload.status === 'REGRESSION'
        ? '#f87171'
        : '#fbbf24';
    return <circle cx={cx} cy={cy} r={4} fill={color} stroke="none" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm">{exerciseName}</h3>
          <p className="text-xs text-zinc-500">{METRIC_LABELS[metric]}</p>
        </div>
        {data.at(-1) && (
          <span
            className={`text-xs font-mono ${statusColor(data.at(-1)?.status as ProgressStatus)}`}
          >
            {Math.round((data.at(-1)?.[metric] ?? 0) * 10) / 10}kg
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#52525b' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#52525b' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: '#18181b',
              border: '1px solid #27272a',
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: '#a1a1aa' }}
            itemStyle={{ color: '#f59e0b' }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={<CustomDot />}
            activeDot={{ r: 6, fill: '#f59e0b' }}
            animationDuration={600}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}