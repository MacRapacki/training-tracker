import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

const exercises = [
  // CHEST
  { name: "Barbell Bench Press", equipment: "BARBELL", primaryMuscle: "CHEST" },
  { name: "Incline Barbell Bench Press", equipment: "BARBELL", primaryMuscle: "CHEST" },
  { name: "Decline Barbell Bench Press", equipment: "BARBELL", primaryMuscle: "CHEST" },
  { name: "Dumbbell Bench Press", equipment: "DUMBBELL", primaryMuscle: "CHEST" },
  { name: "Dumbbell Flyes", equipment: "DUMBBELL", primaryMuscle: "CHEST" },
  { name: "Pec Deck Machine", equipment: "MACHINE", primaryMuscle: "CHEST" },
  { name: "Chest Press Machine", equipment: "MACHINE", primaryMuscle: "CHEST" },
  { name: "Push-Up", equipment: "BODYWEIGHT", primaryMuscle: "CHEST" },

  // BACK
  { name: "Deadlift", equipment: "BARBELL", primaryMuscle: "BACK" },
  { name: "Barbell Row", equipment: "BARBELL", primaryMuscle: "BACK" },
  { name: "Dumbbell Row", equipment: "DUMBBELL", primaryMuscle: "BACK" },
  { name: "Pull-Up", equipment: "BODYWEIGHT", primaryMuscle: "BACK" },
  { name: "Lat Pulldown", equipment: "CABLE", primaryMuscle: "BACK" },
  { name: "Seated Cable Row", equipment: "CABLE", primaryMuscle: "BACK" },
  { name: "Machine Row", equipment: "MACHINE", primaryMuscle: "BACK" },

  // SHOULDERS
  { name: "Overhead Press (OHP)", equipment: "BARBELL", primaryMuscle: "SHOULDERS" },
  { name: "Dumbbell Shoulder Press", equipment: "DUMBBELL", primaryMuscle: "SHOULDERS" },
  { name: "Dumbbell Lateral Raise", equipment: "DUMBBELL", primaryMuscle: "SHOULDERS" },
  { name: "Dumbbell Rear Delt Fly", equipment: "DUMBBELL", primaryMuscle: "SHOULDERS" },
  { name: "Shoulder Press Machine", equipment: "MACHINE", primaryMuscle: "SHOULDERS" },
  { name: "Cable Lateral Raise", equipment: "CABLE", primaryMuscle: "SHOULDERS" },

  // BICEPS
  { name: "Barbell Curl", equipment: "BARBELL", primaryMuscle: "BICEPS" },
  { name: "Alternating Dumbbell Curl", equipment: "DUMBBELL", primaryMuscle: "BICEPS" },
  { name: "Simultaneous Dumbbell Curl", equipment: "DUMBBELL", primaryMuscle: "BICEPS" },
  { name: "Cable Curl", equipment: "CABLE", primaryMuscle: "BICEPS" },
  { name: "Bicep Curl Machine", equipment: "MACHINE", primaryMuscle: "BICEPS" },

  // TRICEPS
  { name: "Close-Grip Bench Press", equipment: "BARBELL", primaryMuscle: "TRICEPS" },
  { name: "French Press (Skull Crusher)", equipment: "BARBELL", primaryMuscle: "TRICEPS" },
  { name: "Cable Tricep Pushdown", equipment: "CABLE", primaryMuscle: "TRICEPS" },
  { name: "Dips", equipment: "BODYWEIGHT", primaryMuscle: "TRICEPS" },
  { name: "Dumbbell Kickback", equipment: "DUMBBELL", primaryMuscle: "TRICEPS" },

  // LEGS
  { name: "Barbell Back Squat", equipment: "BARBELL", primaryMuscle: "LEGS" },
  { name: "Hack Squat Machine", equipment: "MACHINE", primaryMuscle: "LEGS" },
  { name: "Leg Press", equipment: "MACHINE", primaryMuscle: "LEGS" },
  { name: "Leg Extension", equipment: "MACHINE", primaryMuscle: "LEGS" },
  { name: "Lying Leg Curl", equipment: "MACHINE", primaryMuscle: "LEGS" },
  { name: "Seated Leg Curl", equipment: "MACHINE", primaryMuscle: "LEGS" },
  { name: "Barbell Lunge", equipment: "BARBELL", primaryMuscle: "LEGS" },
  { name: "Dumbbell Lunge", equipment: "DUMBBELL", primaryMuscle: "LEGS" },
  { name: "Romanian Deadlift (RDL)", equipment: "BARBELL", primaryMuscle: "LEGS" },

  // GLUTES
  { name: "Barbell Hip Thrust", equipment: "BARBELL", primaryMuscle: "GLUTES" },
  { name: "Hip Thrust Machine", equipment: "MACHINE", primaryMuscle: "GLUTES" },
  { name: "Hip Abduction Machine", equipment: "MACHINE", primaryMuscle: "GLUTES" },

  // CORE
  { name: "Plank", equipment: "BODYWEIGHT", primaryMuscle: "CORE" },
  { name: "Crunches", equipment: "BODYWEIGHT", primaryMuscle: "CORE" },
  { name: "Ab Wheel Rollout", equipment: "OTHER", primaryMuscle: "CORE" },
  { name: "Cable Crunch", equipment: "CABLE", primaryMuscle: "CORE" },

  // CALVES
  { name: "Standing Calf Raise Machine", equipment: "MACHINE", primaryMuscle: "CALVES" },
  { name: "Seated Calf Raise Machine", equipment: "MACHINE", primaryMuscle: "CALVES" },
  { name: "Barbell Calf Raise", equipment: "BARBELL", primaryMuscle: "CALVES" },
] as const;

async function main() {
  console.log("Seeding exercises...");

  for (const ex of exercises) {
    await prisma.exerciseTemplate.upsert({
      where: {
        name_isGlobal: { name: ex.name, isGlobal: true },
      },
      update: {},
      create: {
        name: ex.name,
        equipment: ex.equipment,
        primaryMuscle: ex.primaryMuscle,
        isGlobal: true,
      },
    });
  }

  console.log(`Done — ${exercises.length} exercises seeded.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
