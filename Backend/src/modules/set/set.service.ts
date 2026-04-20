import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LogSetDto, UpdateSetDto } from './dto/set.dto';
import { calc1RM } from '../../shared/progression';

@Injectable()
export class SetService {
  constructor(private prisma: PrismaService) {}

  async logSet(userId: string, dto: LogSetDto) {
    // Verify session belongs to user
    const session = await this.prisma.workoutSession.findUnique({
      where: { id: dto.sessionId },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.userId !== userId) throw new ForbiddenException();

    // Upsert the set (allow re-logging same set number)
    const set = await this.prisma.set.upsert({
      where: {
        // We'll use a compound unique on sessionId+exerciseId+setNumber (add to schema or use findFirst/create)
        // For now: delete existing then create
        id: await this.findExistingSetId(dto.sessionId, dto.exerciseId, dto.setNumber),
      },
      create: {
        sessionId: dto.sessionId,
        exerciseId: dto.exerciseId,
        setNumber: dto.setNumber,
        weight: dto.weight,
        reps: dto.reps,
        rpe: dto.rpe,
        notes: dto.notes,
      },
      update: {
        weight: dto.weight,
        reps: dto.reps,
        rpe: dto.rpe,
        notes: dto.notes,
        loggedAt: new Date(),
      },
      include: { exercise: true },
    });

    // Check and update PR
    const prResult = await this.checkAndUpdatePR(userId, dto.exerciseId, dto.weight, dto.reps);

    return { set, pr: prResult };
  }

  private async findExistingSetId(
    sessionId: string,
    exerciseId: string,
    setNumber: number,
  ): Promise<string> {
    const existing = await this.prisma.set.findFirst({
      where: { sessionId, exerciseId, setNumber },
    });
    return existing?.id ?? 'nonexistent_cuid_placeholder';
  }

  async logSetSafe(userId: string, dto: LogSetDto) {
    const session = await this.prisma.workoutSession.findUnique({
      where: { id: dto.sessionId },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.userId !== userId) throw new ForbiddenException();

    const existing = await this.prisma.set.findFirst({
      where: {
        sessionId: dto.sessionId,
        exerciseId: dto.exerciseId,
        setNumber: dto.setNumber,
      },
    });

    let set;
    if (existing) {
      set = await this.prisma.set.update({
        where: { id: existing.id },
        data: {
          weight: dto.weight,
          reps: dto.reps,
          rpe: dto.rpe,
          notes: dto.notes,
          loggedAt: new Date(),
        },
        include: { exercise: true },
      });
    } else {
      set = await this.prisma.set.create({
        data: {
          sessionId: dto.sessionId,
          exerciseId: dto.exerciseId,
          setNumber: dto.setNumber,
          weight: dto.weight,
          reps: dto.reps,
          rpe: dto.rpe,
          notes: dto.notes,
        },
        include: { exercise: true },
      });
    }

    const prResult = await this.checkAndUpdatePR(userId, dto.exerciseId, dto.weight, dto.reps);
    return { set, pr: prResult };
  }

  private async checkAndUpdatePR(
    userId: string,
    exerciseId: string,
    weight: number,
    reps: number,
  ) {
    const volume = weight * reps;
    const estimated1RM = calc1RM(weight, reps);

    const current = await this.prisma.personalRecord.findUnique({
      where: { userId_exerciseId: { userId, exerciseId } },
    });

    const isWeightPR = weight > (current?.maxWeight ?? 0);
    const isRepsPR = reps > (current?.maxReps ?? 0);
    const isVolumePR = volume > (current?.maxVolume ?? 0);
    const isORMPR = estimated1RM > (current?.estimated1RM ?? 0);
    const isAnyPR = isWeightPR || isRepsPR || isVolumePR || isORMPR;

    if (isAnyPR) {
      await this.prisma.personalRecord.upsert({
        where: { userId_exerciseId: { userId, exerciseId } },
        create: {
          userId,
          exerciseId,
          maxWeight: Math.max(weight, current?.maxWeight ?? 0),
          maxReps: Math.max(reps, current?.maxReps ?? 0),
          maxVolume: Math.max(volume, current?.maxVolume ?? 0),
          estimated1RM: Math.max(estimated1RM, current?.estimated1RM ?? 0),
          dateAchieved: new Date(),
        },
        update: {
          maxWeight: Math.max(weight, current?.maxWeight ?? 0),
          maxReps: Math.max(reps, current?.maxReps ?? 0),
          maxVolume: Math.max(volume, current?.maxVolume ?? 0),
          estimated1RM: Math.max(estimated1RM, current?.estimated1RM ?? 0),
          dateAchieved: new Date(),
        },
      });
    }

    return { isWeightPR, isRepsPR, isVolumePR, isORMPR, isAnyPR };
  }

  async deleteSet(id: string, userId: string) {
    const set = await this.prisma.set.findUnique({
      where: { id },
      include: { session: true },
    });
    if (!set) throw new NotFoundException();
    if (set.session.userId !== userId) throw new ForbiddenException();
    await this.prisma.set.delete({ where: { id } });
    return { success: true };
  }
}