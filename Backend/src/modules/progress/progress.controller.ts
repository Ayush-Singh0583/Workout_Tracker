import {
  Controller, Get, Param, Query, UseGuards, Request,
  ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('progress')
export class ProgressController {
  constructor(private progress: ProgressService) {}

  @Get('exercise/:id')
  forExercise(
    @Param('id') id: string,
    @Request() req: any,
    @Query('weeks', new DefaultValuePipe(12), ParseIntPipe) weeks: number,
  ) {
    return this.progress.getExerciseProgress(req.user.id, id, weeks);
  }

  @Get('overload')
  overload(@Request() req: any) {
    return this.progress.getOverloadSuggestions(req.user.id);
  }

  @Get('records')
  records(@Request() req: any) {
    return this.progress.getPersonalRecords(req.user.id);
  }

  @Get('heatmap')
  heatmap(
    @Request() req: any,
    @Query('days', new DefaultValuePipe(7), ParseIntPipe) days: number,
  ) {
    return this.progress.getVolumeByMuscleGroup(req.user.id, days);
  }
}