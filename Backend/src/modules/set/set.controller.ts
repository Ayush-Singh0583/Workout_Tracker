import {
  Controller, Post, Delete, Param, Body, UseGuards, Request,
} from '@nestjs/common';
import { SetService } from './set.service';
import { LogSetDto } from './dto/set.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('sets')
export class SetController {
  constructor(private sets: SetService) {}

  @Post('log')
  log(@Request() req: any, @Body() dto: LogSetDto) {
    return this.sets.logSetSafe(req.user.id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: any) {
    return this.sets.deleteSet(id, req.user.id);
  }
}