import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { TemplateService } from './template.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('templates')
export class TemplateController {
  constructor(private templates: TemplateService) {}

  @Get()
  getAll() { return this.templates.getAll(); }

  @Get(':id')
  getOne(@Param('id') id: string) { return this.templates.getById(id); }
} 