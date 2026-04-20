import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSessionDto, UpdateSessionDto } from './dto/workout.dto';

@Injectable()
export class WorkoutService {
  constructor(private prisma: PrismaService) {}

  async startSession(userId: string, dto: CreateSessionDto) {
    const session = await this.prisma.workoutSession.create({
      data: {
        userId,
        templateId: dto.templateId ?? null,
        date: dto.date ? new Date(dto.date) : new Date(),
        notes: dto.notes,
      },
      include: {
        template: {
          include: {
            exercises: {
              include: { exercise: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
        sets: { include: { exercise: true }, orderBy: { setNumber: 'asc' } },
      },
    });
    return session;
  }

  async getSessions(userId: string, limit = 20, before?: string) {
    return this.prisma.workoutSession.findMany({
      where: {
        userId,
        ...(before ? { date: { lt: new Date(before) } } : {}),
      },
      orderBy: { date: 'desc' },
      take: limit,
      include: {
        template: { select: { name: true, type: true } },
        sets: {
          include: { exercise: { select: { name: true, category: true } } },
        },
      },
    });
  }

  async getSessionById(id: string, userId: string) {
    const session = await this.prisma.workoutSession.findUnique({
      where: { id },
      include: {
        template: {
          include: {
            exercises: {
              include: { exercise: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
        sets: {
          include: { exercise: true },
          orderBy: [{ exerciseId: 'asc' }, { setNumber: 'asc' }],
        },
      },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.userId !== userId) throw new ForbiddenException();
    return session;
  }

  async updateSession(id: string, userId: string, dto: UpdateSessionDto) {
    await this.getSessionById(id, userId);
    return this.prisma.workoutSession.update({
      where: { id },
      data: dto,
    });
  }

  async deleteSession(id: string, userId: string) {
    await this.getSessionById(id, userId);
    await this.prisma.workoutSession.delete({ where: { id } });
    return { success: true };
  }

  async getTodaySession(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.workoutSession.findFirst({
      where: {
        userId,
        date: { gte: today, lt: tomorrow },
      },
      include: {
        template: {
          include: {
            exercises: {
              include: { exercise: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
        sets: { include: { exercise: true }, orderBy: { setNumber: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getWeeklyStats(userId: string) {
    const monday = new Date();
    monday.setDate(monday.getDate() - monday.getDay() + 1);
    monday.setHours(0, 0, 0, 0);

    const sessions = await this.prisma.workoutSession.findMany({
      where: { userId, date: { gte: monday } },
      include: { sets: true, template: { select: { type: true, name: true } } },
    });

    const totalVolume = sessions.reduce((acc, s) =>
      acc + s.sets.reduce((a, set) => a + set.weight * set.reps, 0), 0
    );

    const streak = await this.getStreak(userId);

    return { sessions, totalVolume: Math.round(totalVolume), streak };
  }

  private async getStreak(userId: string): Promise<number> {
    const sessions = await this.prisma.workoutSession.findMany({
      where: { userId, completed: true },
      orderBy: { date: 'desc' },
      select: { date: true },
      take: 60,
    });

    if (!sessions.length) return 0;

    let streak = 0;
    let current = new Date();
    current.setHours(0, 0, 0, 0);

    for (const s of sessions) {
      const d = new Date(s.date);
      d.setHours(0, 0, 0, 0);
      const diff = Math.round((current.getTime() - d.getTime()) / 86400000);
      if (diff === 0 || diff === 1) {
        streak++;
        current = d;
      } else {
        break;
      }
    }
    return streak;
  }
}