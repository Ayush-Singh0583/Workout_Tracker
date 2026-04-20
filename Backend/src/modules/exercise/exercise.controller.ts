import { Controller, Get, UseGuards } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('exercises')
export class ExerciseController {
  constructor(private exercises: ExerciseService) {}

  @Get()
  getAll() { return this.exercises.getAll(); }
}