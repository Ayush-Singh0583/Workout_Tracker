'use client';
import { motion } from 'framer-motion';

interface Props {
  exerciseName: string;
  maxWeight: number;
  maxReps: number;
  estimated1RM: number;
  dateAchieved: string;
  isNew?: boolean;
}

export function PRBadge({ exerciseName, maxWeight, maxReps, estimated1RM, dateAchieved, isNew }: Props) {
  return (
    <motion.div
      initial={isNew ? { scale: 0.8, opacity: 0 } : {}}
      animate={isNew ? { scale: 1, opacity: 1 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`relative bg-zinc-900 border rounded-xl p-4 overflow-hidden ${
        isNew ? 'border-amber-400 bg-amber-400/5' : 'border-zinc-800'
      }`}
    >
      {isNew && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: 2 }}
          className="absolute inset-0 bg-amber-400/10 pointer-events-none"
        />
      )}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">🏆</span>
            {isNew && (
              <span className="text-[10px] bg-amber-400 text-black font-bold px-1.5 py-0.5 rounded">
                NEW PR
              </span>
            )}
          </div>
          <h3 className="font-semibold text-sm">{exerciseName}</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            {new Date(dateAchieved).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-amber-400 font-bold">
            {maxWeight}kg × {maxReps}
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">
            ~{Math.round(estimated1RM)}kg 1RM
          </p>
        </div>
      </div>
    </motion.div>
  );
}