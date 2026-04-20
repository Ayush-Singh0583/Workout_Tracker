import { IsString, IsInt, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class LogSetDto {
  @IsString()
  sessionId: string;

  @IsString()
  exerciseId: string;

  @IsInt()
  @Min(1)
  setNumber: number;

  @IsNumber()
  @Min(0)
  weight: number;

  @IsInt()
  @Min(1)
  reps: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  rpe?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateSetDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  reps?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  rpe?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}