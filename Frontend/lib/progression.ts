// ─── Core Formulas ────────────────────────────────────────────────────────────

export function calc1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

export function calcVolume(sets: { weight: number; reps: number }[]): number {
  return sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProgressStatus = 'IMPROVEMENT' | 'EQUAL' | 'REGRESSION' | 'PLATEAU';
export type OverloadAction = 'INCREASE_WEIGHT' | 'INCREASE_REPS' | 'MAINTAIN' | 'DELOAD';

export interface SessionSummary {
  exerciseId: string;
  weight: number;
  repsPerSet: number[];
  targetReps: number;
  targetSets: number;
  volume: number;
  estimated1RM: number;
  date: Date;
}

export interface OverloadSuggestion {
  exerciseId: string;
  action: OverloadAction;
  suggestedWeight: number;
  suggestedReps: number;
  reason: string;
  status: ProgressStatus;
  estimated1RM: number;
}

// ─── Status Detection ─────────────────────────────────────────────────────────

export function detectPlateau(sessions: SessionSummary[], lookback = 3): boolean {
  if (sessions.length < lookback) return false;
  const recent = sessions.slice(-lookback);
  const noVolumeGain = recent.every((s, i) => i === 0 || s.volume <= recent[i - 1].volume);
  const noORMGain = recent.every(
    (s, i) => i === 0 || s.estimated1RM <= recent[i - 1].estimated1RM,
  );
  return noVolumeGain && noORMGain;
}

export function getProgressStatus(
  current: Pick<SessionSummary, 'volume' | 'estimated1RM'>,
  previous?: Pick<SessionSummary, 'volume' | 'estimated1RM'>,
): ProgressStatus {
  if (!previous) return 'IMPROVEMENT';
  if (current.volume > previous.volume || current.estimated1RM > previous.estimated1RM)
    return 'IMPROVEMENT';
  if (current.volume === previous.volume && current.estimated1RM === previous.estimated1RM)
    return 'EQUAL';
  return 'REGRESSION';
}

// ─── Overload Engine ──────────────────────────────────────────────────────────

export function generateOverloadSuggestion(
  history: SessionSummary[],
  incrementKg = 2.5,
): OverloadSuggestion | null {
  if (!history.length) return null;

  const current = history[history.length - 1];
  const previous = history[history.length - 2];

  const isPlateau = detectPlateau(history);
  const allSetsCompleted = current.repsPerSet.length >= current.targetSets;
  const allRepsHit = current.repsPerSet.every((r) => r >= current.targetReps);
  const minReps = Math.min(...current.repsPerSet);

  if (isPlateau && history.length >= 3) {
    const deloadWeight = Math.round(current.weight * 0.9 * 4) / 4;
    return {
      exerciseId: current.exerciseId,
      action: 'DELOAD',
      suggestedWeight: deloadWeight,
      suggestedReps: current.targetReps,
      reason: 'No progress for 3 sessions — deload 10% and rebuild',
      status: 'PLATEAU',
      estimated1RM: calc1RM(deloadWeight, current.targetReps),
    };
  }

  if (allSetsCompleted && allRepsHit) {
    const newWeight = current.weight + incrementKg;
    return {
      exerciseId: current.exerciseId,
      action: 'INCREASE_WEIGHT',
      suggestedWeight: newWeight,
      suggestedReps: current.targetReps,
      reason: `All ${current.targetSets}×${current.targetReps} reps completed — add ${incrementKg}kg`,
      status: 'IMPROVEMENT',
      estimated1RM: calc1RM(newWeight, current.targetReps),
    };
  }

  if (!allRepsHit) {
    return {
      exerciseId: current.exerciseId,
      action: 'INCREASE_REPS',
      suggestedWeight: current.weight,
      suggestedReps: Math.min(minReps + 1, current.targetReps),
      reason: `Missed target (hit ${minReps}/${current.targetReps}) — build reps first`,
      status: previous ? getProgressStatus(current, previous) : 'EQUAL',
      estimated1RM: calc1RM(current.weight, minReps),
    };
  }

  return {
    exerciseId: current.exerciseId,
    action: 'MAINTAIN',
    suggestedWeight: current.weight,
    suggestedReps: current.targetReps,
    reason: 'Hold current load',
    status: previous ? getProgressStatus(current, previous) : 'EQUAL',
    estimated1RM: current.estimated1RM,
  };
}

// ─── UI Helpers ──────────────────────────────────────────────────────────────

export function statusColor(status: ProgressStatus) {
  return {
    IMPROVEMENT: 'text-green-400',
    EQUAL:       'text-yellow-400',
    REGRESSION:  'text-red-400',
    PLATEAU:     'text-orange-400',
  }[status];
}

export function statusBg(status: ProgressStatus) {
  return {
    IMPROVEMENT: 'bg-green-400/10 border-green-400/30',
    EQUAL:       'bg-yellow-400/10 border-yellow-400/30',
    REGRESSION:  'bg-red-400/10 border-red-400/30',
    PLATEAU:     'bg-orange-400/10 border-orange-400/30',
  }[status];
}

export function statusLabel(status: ProgressStatus) {
  return {
    IMPROVEMENT: '▲ Improving',
    EQUAL:       '= Maintained',
    REGRESSION:  '▼ Regression',
    PLATEAU:     '◈ Plateau',
  }[status];
}