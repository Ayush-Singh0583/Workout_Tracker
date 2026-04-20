import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  calc1RM, calcVolume, generateOverloadSuggestion,
  getProgressStatus, SessionSummary,
} from '../../shared/progression';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async getExerciseProgress(userId: string, exerciseId: string, weeks = 12) {
    const since = new Date();
    since.setDate(since.getDate() - weeks * 7);

    const sets = await this.prisma.set.findMany({
      where: {
        exerciseId,
        session: { userId, date: { gte: since } },
      },
      include: { session: { select: { date: true, templateId: true } } },
      orderBy: { session: { date: 'asc' } },
    });

    // Group by session
    const bySession = new Map<string, typeof sets>();
    for (const s of sets) {
      const key = s.sessionId;
      if (!bySession.has(key)) bySession.set(key, []);
      bySession.get(key)!.push(s);
    }

    const dataPoints = Array.from(bySession.entries()).map(([sessionId, sessionSets]) => {
      const date = sessionSets[0].session.date;
      const volume = calcVolume(sessionSets.map((s) => ({ weight: s.weight, reps: s.reps })));
      const maxWeight = Math.max(...sessionSets.map((s) => s.weight));
      const maxReps = Math.max(...sessionSets.map((s) => s.reps));
      const estimated1RM = Math.max(
        ...sessionSets.map((s) => calc1RM(s.weight, s.reps)),
      );
      return { sessionId, date, volume, maxWeight, maxReps, estimated1RM };
    });

    // Status comparison (improvement/equal/regression)
    const withStatus = dataPoints.map((dp, i) => {
      const prev = dataPoints[i - 1];
      let status: string;
      if (!prev) {
        status = 'IMPROVEMENT';
      } else if (dp.volume > prev.volume || dp.estimated1RM > prev.estimated1RM) {
        status = 'IMPROVEMENT';
      } else if (dp.volume === prev.volume && dp.estimated1RM === prev.estimated1RM) {
        status = 'EQUAL';
      } else {
        status = 'REGRESSION';
      }
      return { ...dp, status };
    });

    return withStatus;
  }

  async getOverloadSuggestions(userId: string) {
    // Get all exercises that user has logged at least once
    const exerciseIds = await this.prisma.set.findMany({
      where: { session: { userId } },
      select: { exerciseId: true },
      distinct: ['exerciseId'],
    });

    const suggestions = await Promise.all(
      exerciseIds.map(async ({ exerciseId }) => {
        // Get last 10 sessions for this exercise
        const recentSets = await this.prisma.set.findMany({
          where: { exerciseId, session: { userId } },
          include: {
            session: {
              include: {
                template: {
                  include: {
                    exercises: {
                      where: { exerciseId },
                      select: { targetSets: true, targetReps: true },
                    },
                  },
                },
              },
            },
          },
          orderBy: { session: { date: 'desc' } },
          take: 50,
        });

        if (!recentSets.length) return null;

        // Group by session
        const bySession = new Map<string, typeof recentSets>();
        for (const s of recentSets) {
          if (!bySession.has(s.sessionId)) bySession.set(s.sessionId, []);
          bySession.get(s.sessionId)!.push(s);
        }

        const sessions: SessionSummary[] = Array.from(bySession.values())
          .slice(0, 10)
          .reverse()
          .map((sessionSets) => {
            const target = sessionSets[0].session.template?.exercises[0];
            const repsPerSet = sessionSets.map((s) => s.reps);
            const weight = sessionSets[0].weight;
            return {
              exerciseId,
              weight,
              repsPerSet,
              targetReps: target?.targetReps ?? 5,
              targetSets: target?.targetSets ?? 3,
              volume: calcVolume(sessionSets.map((s) => ({ weight: s.weight, reps: s.reps }))),
              estimated1RM: Math.max(...sessionSets.map((s) => calc1RM(s.weight, s.reps))),
              date: sessionSets[0].session.date,
            };
          });

        const exercise = await this.prisma.exercise.findUnique({
          where: { id: exerciseId },
          select: { name: true, id: true },
        });

        return {
          exercise,
          suggestion: generateOverloadSuggestion(sessions),
        };
      }),
    );

    return suggestions.filter(Boolean);
  }

  async getPersonalRecords(userId: string) {
    return this.prisma.personalRecord.findMany({
      where: { userId },
      include: { exercise: { select: { name: true, category: true } } },
      orderBy: { dateAchieved: 'desc' },
    });
  }

  async getVolumeByMuscleGroup(userId: string, days = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const sets = await this.prisma.set.findMany({
      where: { session: { userId, date: { gte: since } } },
      include: { exercise: { select: { muscleGroups: true, category: true } } },
    });

    const byGroup: Record<string, number> = {};
    for (const s of sets) {
      for (const mg of s.exercise.muscleGroups) {
        byGroup[mg] = (byGroup[mg] ?? 0) + s.weight * s.reps;
      }
    }

    return Object.entries(byGroup)
      .map(([group, volume]) => ({ group, volume: Math.round(volume) }))
      .sort((a, b) => b.volume - a.volume);
  }
}