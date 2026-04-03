export const routes = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  workouts: "/workouts",
  workoutNew: "/workouts/new",
  workout: (id: string) => `/workouts/${id}`,
  workoutEdit: (id: string) => `/workouts/${id}/edit`,
  progress: "/progress",
  body: "/body",
} as const;
