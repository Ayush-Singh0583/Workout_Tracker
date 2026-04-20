'use client';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLogSet } from '../hooks/useWorkout';
import { calc1RM } from '../lib/progression';

interface SetState {
  weight: string;
  reps: string;
  rpe: string;
  done: boolean;
}

interface Props {
  sessionId: string;
  exercise: { id: string; name: string; category: string; muscleGroups: string[] };
  targetSets: number;
  targetReps: number;
  loggedSets: Array<{ weight: number; reps: number; rpe?: number; setNumber: number }>;
  index: number;
}

export function WorkoutLogger({ sessionId, exercise, targetSets, targetReps, loggedSets, index }: Props) {
  const { mutate: logSet, isPending } = useLogSet();
  const [prFlash, setPrFlash] = useState(false);

  const initialSets: SetState[] = Array.from({ length: targetSets }, (_, i) => {
    const logged = loggedSets.find((s) => s.setNumber === i + 1);
    return {
      weight: logged ? String(logged.weight) : '',
      reps:   logged ? String(logged.reps)   : '',
      rpe:    logged ? String(logged.rpe ?? '') : '',
      done:   !!logged,
    };
  });

  const [sets, setSets] = useState<SetState[]>(initialSets);
  const [collapsed, setCollapsed] = useState(loggedSets.length === targetSets);

  const updateSet = useCallback((i: number, field: keyof SetState, value: string) => {
    setSets((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  }, []);

  const adjustWeight = (delta: number) => {
    setSets((prev) =>
      prev.map((s) => {
        const current = parseFloat(s.weight) || 0;
        return { ...s, weight: String(Math.max(0, Math.round((current + delta) * 10) / 10)) };
      }),
    );
  };

  const duplicatePrev = (i: number) => {
    if (i === 0) return;
    const prev = sets[i - 1];
    setSets((s) => {
      const next = [...s];
      next[i] = { ...prev, done: false };
      return next;
    });
  };

  const markDone = (i: number) => {
    const s = sets[i];
    const w = parseFloat(s.weight);
    const r = parseInt(s.reps);
    if (!w || !r) return;

    logSet(
      {
        sessionId,
        exerciseId: exercise.id,
        setNumber: i + 1,
        weight: w,
        reps: r,
        rpe: parseFloat(s.rpe) || undefined,
      },
      {
        onSuccess: (data) => {
          setSets((prev) => {
            const next = [...prev];
            next[i] = { ...next[i], done: true };
            return next;
          });
          if (data.pr?.isAnyPR) {
            setPrFlash(true);
            setTimeout(() => setPrFlash(false), 2500);
          }
        },
      },
    );
  };

  const completedCount = sets.filter((s) => s.done).length;
  const allDone = completedCount === targetSets;

  const lastDoneSet = sets.filter((s) => s.done).at(-1);
  const estimated1RM =
    lastDoneSet && parseFloat(lastDoneSet.weight) && parseInt(lastDoneSet.reps)
      ? calc1RM(parseFloat(lastDoneSet.weight), parseInt(lastDoneSet.reps))
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`bg-zinc-900 border rounded-xl overflow-hidden transition-colors ${
        allDone ? 'border-green-500/40' : prFlash ? 'border-amber-400' : 'border-zinc-800'
      }`}
    >
      {/* PR Flash */}
      <AnimatePresence>
        {prFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-amber-400/20 text-amber-400 text-xs font-bold text-center py-1.5 tracking-wider"
          >
            🏆 NEW PERSONAL RECORD!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        onClick={() => setCollapsed((v) => !v)}
      >
        <div>
          <h3 className="font-semibold text-sm">{exercise.name}</h3>
          <p className="text-xs text-zinc-500 mt-0.5 font-mono">
            {targetSets}×{targetReps}
            {estimated1RM && (
              <span className="text-amber-400 ml-2">~{estimated1RM}kg 1RM</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">
            {completedCount}/{targetSets}
          </span>
          <motion.span
            animate={{ rotate: collapsed ? -90 : 0 }}
            className="text-zinc-500 text-xs"
          >
            ▾
          </motion.span>
        </div>
      </div>

      {/* Body */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4 space-y-2">
              {/* Column headers */}
              <div className="grid grid-cols-[28px_1fr_1fr_56px_36px] gap-2 text-[10px] text-zinc-600 uppercase tracking-wider pb-1">
                <div></div>
                <div className="text-center">Weight (kg)</div>
                <div className="text-center">Reps</div>
                <div className="text-center">RPE</div>
                <div></div>
              </div>

              {sets.map((s, i) => (
                <SetRow
                  key={i}
                  index={i}
                  set={s}
                  isPending={isPending}
                  onChange={(field, value) => updateSet(i, field, value)}
                  onDuplicate={() => duplicatePrev(i)}
                  onDone={() => markDone(i)}
                />
              ))}

              {/* Weight buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => adjustWeight(-2.5)}
                  className="bg-zinc-800 text-amber-400 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs font-mono font-bold hover:bg-zinc-700 transition-colors"
                >
                  −2.5
                </button>
                <button
                  onClick={() => adjustWeight(2.5)}
                  className="bg-zinc-800 text-amber-400 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs font-mono font-bold hover:bg-zinc-700 transition-colors"
                >
                  +2.5
                </button>
                <button
                  onClick={() => {
                    const lastFilled = sets.map((s, i) => ({ s, i }))
                      .filter(({ s }) => s.weight && s.reps)
                      .at(-1);
                    if (lastFilled) duplicatePrev(lastFilled.i + 1 < sets.length ? lastFilled.i + 1 : lastFilled.i);
                  }}
                  className="bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs hover:bg-zinc-700 transition-colors"
                >
                  DUP SET
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Set Row ──────────────────────────────────────────────────────────────────

function SetRow({
  index, set, isPending, onChange, onDuplicate, onDone,
}: {
  index: number;
  set: SetState;
  isPending: boolean;
  onChange: (field: keyof SetState, value: string) => void;
  onDuplicate: () => void;
  onDone: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`grid grid-cols-[28px_1fr_1fr_56px_36px] gap-2 items-center ${
        set.done ? 'opacity-60' : ''
      }`}
    >
      <span className="text-xs text-zinc-600 text-center font-mono">{index + 1}</span>

      <input
        type="number"
        value={set.weight}
        onChange={(e) => onChange('weight', e.target.value)}
        readOnly={set.done}
        placeholder="kg"
        step={2.5}
        className={`text-center text-sm font-mono py-2 rounded-lg border bg-zinc-800 focus:outline-none transition-colors w-full ${
          set.done
            ? 'border-green-500/30 text-green-400'
            : 'border-zinc-700 text-zinc-100 focus:border-amber-400'
        }`}
      />

      <input
        type="number"
        value={set.reps}
        onChange={(e) => onChange('reps', e.target.value)}
        readOnly={set.done}
        placeholder="reps"
        className={`text-center text-sm font-mono py-2 rounded-lg border bg-zinc-800 focus:outline-none transition-colors w-full ${
          set.done
            ? 'border-green-500/30 text-green-400'
            : 'border-zinc-700 text-zinc-100 focus:border-amber-400'
        }`}
      />

      <input
        type="number"
        value={set.rpe}
        onChange={(e) => onChange('rpe', e.target.value)}
        readOnly={set.done}
        placeholder="—"
        min={1}
        max={10}
        className="text-center text-xs font-mono py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-400 focus:outline-none focus:border-amber-400 w-full"
      />

      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={onDone}
        disabled={set.done || isPending}
        className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all ${
          set.done
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-zinc-600 text-zinc-500 hover:border-amber-400 hover:text-amber-400'
        }`}
      >
        {set.done ? '✓' : '○'}
      </motion.button>
    </motion.div>
  );
}