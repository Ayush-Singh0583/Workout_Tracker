import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExerciseService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.exercise.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] });
  }
}