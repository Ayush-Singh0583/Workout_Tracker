'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workoutApi, setApi, templateApi } from '../lib/api';

export function useTemplates() {
  return useQuery({ queryKey: ['templates'], queryFn: templateApi.getAll, staleTime: Infinity });
}

export function useWeeklyStats() {
  return useQuery({
    queryKey: ['workouts', 'weekly'],
    queryFn: workoutApi.getWeeklyStats,
    refetchInterval: 30_000,
  });
}

export function useTodaySession() {
  return useQuery({
    queryKey: ['workouts', 'today'],
    queryFn: workoutApi.getToday,
    refetchInterval: 10_000,
  });
}

export function useSession(id: string) {
  return useQuery({
    queryKey: ['workouts', id],
    queryFn: () => workoutApi.getOne(id),
    enabled: !!id,
    refetchInterval: 5_000, // poll for auto-save reflection
  });
}

export function useWorkoutHistory(limit = 20) {
  return useQuery({
    queryKey: ['workouts', 'history', limit],
    queryFn: () => workoutApi.getAll({ limit }),
  });
}

export function useStartWorkout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: workoutApi.start,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
}

export function useCompleteWorkout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, durationMin }: { id: string; durationMin: number }) =>
      workoutApi.update(id, { completed: true, durationMin }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
}

export function useLogSet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: setApi.log,
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['workouts', variables.sessionId] });
      qc.invalidateQueries({ queryKey: ['progress'] });
      qc.invalidateQueries({ queryKey: ['records'] });
    },
  });
}

export function usePersonalRecords() {
  return useQuery({
    queryKey: ['records'],
    queryFn: () => import('../lib/api').then((m) => m.progressApi.records()),
  });
}

export function useOverloadSuggestions() {
  return useQuery({
    queryKey: ['overload'],
    queryFn: () => import('../lib/api').then((m) => m.progressApi.overload()),
    staleTime: 60_000,
  });
}

export function useExerciseProgress(exerciseId: string, weeks = 12) {
  return useQuery({
    queryKey: ['progress', exerciseId, weeks],
    queryFn: () => import('../lib/api').then((m) => m.progressApi.forExercise(exerciseId, weeks)),
    enabled: !!exerciseId,
  });
}