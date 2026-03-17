// ─── Units ────────────────────────────────────────────────────────────────────

export type WeightUnit = 'lbs' | 'kg';

// ─── Exercise Library ─────────────────────────────────────────────────────────

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'glutes'
  | 'core'
  | 'cardio'
  | 'full_body'
  | 'other';

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'machine'
  | 'cable'
  | 'bodyweight'
  | 'kettlebell'
  | 'bands'
  | 'other';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  notes?: string;
  isCustom?: boolean;
}

// ─── Workout Plans ────────────────────────────────────────────────────────────

export interface PlannedExercise {
  exerciseId: string;
  /** Number of working sets */
  sets: number;
  /** Target reps — can be a range string like "8-12" */
  reps: string;
  /** Default rest between sets in seconds */
  restSeconds: number;
  notes?: string;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description?: string;
  exercises: PlannedExercise[];
  createdAt: string;
  updatedAt: string;
}

// ─── Timer Presets ────────────────────────────────────────────────────────────

export interface TimerPreset {
  id: string;
  seconds: number;
}

// ─── User Preferences ─────────────────────────────────────────────────────────

export interface UserPreferences {
  unit: WeightUnit;
  themeColor?: string;
  onboardingComplete?: boolean;
}
