import {
  Controller, Get, Post, Patch, Delete, Param, Body,
  UseGuards, Request, Query, ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common';
import { WorkoutService } from './workout.service';
import { CreateSessionDto, UpdateSessionDto } from './dto/workout.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('workouts')
export class WorkoutController {
  constructor(private workout: WorkoutService) {}

  @Post('start')
  start(@Request() req: any, @Body() dto: CreateSessionDto) {
    return this.workout.startSession(req.user.id, dto);
  }

  @Get()
  getAll(
    @Request() req: any,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('before') before?: string,
  ) {
    return this.workout.getSessions(req.user.id, limit, before);
  }

  @Get('today')
  getToday(@Request() req: any) {
    return this.workout.getTodaySession(req.user.id);
  }

  @Get('weekly-stats')
  getWeekly(@Request() req: any) {
    return this.workout.getWeeklyStats(req.user.id);
  }

  @Get(':id')
  getOne(@Param('id') id: string, @Request() req: any) {
    return this.workout.getSessionById(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdateSessionDto,
  ) {
    return this.workout.updateSession(id, req.user.id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: any) {
    return this.workout.deleteSession(id, req.user.id);
  }
}