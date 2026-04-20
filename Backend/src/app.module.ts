import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { WorkoutModule } from './modules/workout/workout.module';
import { SetModule } from './modules/set/set.module';
import { ProgressModule } from './modules/progress/progress.module';
import { TemplateModule } from './modules/template/template.module';
import { ExerciseModule } from './modules/exercise/exercise.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    WorkoutModule,
    SetModule,
    ProgressModule,
    TemplateModule,
    ExerciseModule,
  ],
})
export class AppModule {}