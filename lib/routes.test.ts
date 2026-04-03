import { describe, it, expect } from "vitest";
import { routes } from "./routes";

describe("routes", () => {
  it("static routes are correct strings", () => {
    expect(routes.home).toBe("/");
    expect(routes.login).toBe("/login");
    expect(routes.register).toBe("/register");
    expect(routes.dashboard).toBe("/dashboard");
    expect(routes.workouts).toBe("/workouts");
    expect(routes.workoutNew).toBe("/workouts/new");
    expect(routes.progress).toBe("/progress");
    expect(routes.body).toBe("/body");
  });

  it("workout() builds correct path", () => {
    expect(routes.workout("abc123")).toBe("/workouts/abc123");
    expect(routes.workout("xyz-456")).toBe("/workouts/xyz-456");
  });

  it("workoutEdit() builds correct path", () => {
    expect(routes.workoutEdit("abc123")).toBe("/workouts/abc123/edit");
    expect(routes.workoutEdit("xyz-456")).toBe("/workouts/xyz-456/edit");
  });

  it("workout() and workoutEdit() use the same id segment", () => {
    const id = "test-id-789";
    expect(routes.workoutEdit(id)).toBe(`${routes.workout(id)}/edit`);
  });
});
