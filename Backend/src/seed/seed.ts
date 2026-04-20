import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const EXERCISES = [
  // PUSH
  { name: 'Bench Press',           category: 'PUSH', muscleGroups: ['Chest', 'Triceps', 'Shoulders'] },
  { name: 'Incline Dumbbell Press',category: 'PUSH', muscleGroups: ['Chest', 'Shoulders'] },
  { name: 'Overhead Press',        category: 'PUSH', muscleGroups: ['Shoulders', 'Triceps'] },
  { name: 'Lateral Raises',        category: 'PUSH', muscleGroups: ['Shoulders'] },
  { name: 'Cable Fly',             category: 'PUSH', muscleGroups: ['Chest'] },
  { name: 'Tricep Pushdown',       category: 'PUSH', muscleGroups: ['Triceps'] },
  // PULL
  { name: 'Pull-ups',              category: 'PULL', muscleGroups: ['Back', 'Biceps'] },
  { name: 'Barbell Row',           category: 'PULL', muscleGroups: ['Back', 'Biceps'] },
  { name: 'Seated Cable Row',      category: 'PULL', muscleGroups: ['Back'] },
  { name: 'Face Pull',             category: 'PULL', muscleGroups: ['Shoulders', 'Back'] },
  { name: 'Barbell Curl',          category: 'PULL', muscleGroups: ['Biceps'] },
  { name: 'Hammer Curl',           category: 'PULL', muscleGroups: ['Biceps'] },
  // LEGS
  { name: 'Squat',                 category: 'LEGS', muscleGroups: ['Quads', 'Glutes', 'Hamstrings'] },
  { name: 'Romanian Deadlift',     category: 'LEGS', muscleGroups: ['Hamstrings', 'Glutes'] },
  { name: 'Leg Press',             category: 'LEGS', muscleGroups: ['Quads', 'Glutes'] },
  { name: 'Walking Lunges',        category: 'LEGS', muscleGroups: ['Quads', 'Glutes'] },
  { name: 'Standing Calf Raises',  category: 'LEGS', muscleGroups: ['Calves'] },
];

const TEMPLATES = [
  {
    name: 'Push Day',
    type: 'PUSH' as const,
    sortOrder: 0,
    exercises: [
      { name: 'Bench Press',            targetSets: 4, targetReps: 5,  sortOrder: 0 },
      { name: 'Incline Dumbbell Press', targetSets: 3, targetReps: 8,  sortOrder: 1 },
      { name: 'Overhead Press',         targetSets: 4, targetReps: 6,  sortOrder: 2 },
      { name: 'Lateral Raises',         targetSets: 3, targetReps: 12, sortOrder: 3 },
      { name: 'Cable Fly',              targetSets: 3, targetReps: 12, sortOrder: 4 },
      { name: 'Tricep Pushdown',        targetSets: 3, targetReps: 12, sortOrder: 5 },
    ],
  },
  {
    name: 'Pull Day',
    type: 'PULL' as const,
    sortOrder: 1,
    exercises: [
      { name: 'Pull-ups',         targetSets: 4, targetReps: 8,  sortOrder: 0 },
      { name: 'Barbell Row',      targetSets: 4, targetReps: 6,  sortOrder: 1 },
      { name: 'Seated Cable Row', targetSets: 3, targetReps: 10, sortOrder: 2 },
      { name: 'Face Pull',        targetSets: 3, targetReps: 15, sortOrder: 3 },
      { name: 'Barbell Curl',     targetSets: 3, targetReps: 10, sortOrder: 4 },
      { name: 'Hammer Curl',      targetSets: 3, targetReps: 12, sortOrder: 5 },
    ],
  },
  {
    name: 'Leg Day',
    type: 'LEGS' as const,
    sortOrder: 2,
    exercises: [
      { name: 'Squat',                targetSets: 5, targetReps: 5,  sortOrder: 0 },
      { name: 'Romanian Deadlift',    targetSets: 3, targetReps: 8,  sortOrder: 1 },
      { name: 'Leg Press',            targetSets: 3, targetReps: 12, sortOrder: 2 },
      { name: 'Walking Lunges',       targetSets: 3, targetReps: 10, sortOrder: 3 },
      { name: 'Standing Calf Raises', targetSets: 4, targetReps: 15, sortOrder: 4 },
    ],
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Upsert all exercises
  const exerciseMap: Record<string, string> = {};
  for (const ex of EXERCISES) {
    const e = await prisma.exercise.upsert({
      where: { name: ex.name },
      create: ex,
      update: {},
    });
    exerciseMap[ex.name] = e.id;
    console.log(`  ✓ Exercise: ${ex.name}`);
  }

  // Delete and recreate templates
  await prisma.workoutTemplate.deleteMany();

  for (const tmpl of TEMPLATES) {
    const t = await prisma.workoutTemplate.create({
      data: {
        name: tmpl.name,
        type: tmpl.type,
        sortOrder: tmpl.sortOrder,
        exercises: {
          create: tmpl.exercises.map((ex) => ({
            exerciseId: exerciseMap[ex.name],
            targetSets: ex.targetSets,
            targetReps: ex.targetReps,
            sortOrder: ex.sortOrder,
          })),
        },
      },
    });
    console.log(`  ✓ Template: ${t.name}`);
  }

  console.log('✅ Seed complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());