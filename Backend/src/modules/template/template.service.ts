import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TemplateService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.workoutTemplate.findMany({
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getById(id: string) {
    return this.prisma.workoutTemplate.findUnique({
      where: { id },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }
}