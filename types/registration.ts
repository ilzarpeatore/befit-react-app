export interface UserRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: "" | "male" | "female" | "other";
  age: number;
  weightKg: number;
  heightCm: number;
  goal: string;
  activityLevel: string;
  experienceLevel: string;
  equipment: string;
  workoutFrequency: number;
}

export const INITIAL_REGISTRATION: UserRegistrationData = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  gender: "",
  age: 25,
  weightKg: 70,
  heightCm: 170,
  goal: "",
  activityLevel: "",
  experienceLevel: "",
  equipment: "",
  workoutFrequency: 3,
};

export const GOALS = {
  maintain: "Maintain weight",
  lose_mild: "Mild weight loss",
  lose: "Lose weight",
  lose_fast: "Intense weight loss",
  gain_mild: "Mild weight gain",
  gain: "Gain weight",
  muscle: "Build muscle",
} as const;

export const ACTIVITY_LEVELS = {
  sedentary: "Sedentary",
  light: "Lightly active",
  moderate: "Moderately active",
  active: "Active",
  very_active: "Very active",
  extra_active: "Extra active",
} as const;

export const EXPERIENCE_LEVELS = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
} as const;

export const EQUIPMENT_OPTIONS = {
  bodyweight: "Bodyweight",
  dumbbells: "Dumbbells",
  full_gym: "Full gym",
  machines: "Machines",
  kettlebells: "Kettlebells",
} as const;

export const calcStrength = (password: string): number => {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) || /[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
  return Math.min(Math.max(score, 1), 4);
};

export const getStrengthLabel = (strength: number): string => {
  const labels = ["", "Weak", "Fair", "Good", "Excellent"];
  return labels[strength] || "";
};

export const getStrengthColor = (strength: number): string => {
  if (strength <= 1) return "#F85365";
  if (strength === 2) return "#505EDC";
  return "#00F6A6";
};

export const calculateBMI = (weightKg: number, heightCm: number): number => {
  const m = heightCm / 100;
  if (m <= 0) return 0;
  return weightKg / (m * m);
};

export const getBMILabel = (bmi: number): string => {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
};
