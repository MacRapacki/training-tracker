"use client";

import { useState, useTransition } from "react";
import {
  saveWorkout,
  updateWorkout,
  getRecentWorkouts,
  getWorkoutForClone,
  setExercisePreference,
  type SaveWorkoutInput,
} from "@/app/actions/workouts";
import { cn } from "@/lib/utils";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
  Loader2,
  MessageSquare,
  ClipboardList,
  X,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

type Template = {
  id: string;
  name: string;
  equipment: string;
  reaction: "LIKED" | "DISLIKED" | null;
};

type SetRow = {
  reps: string;
  weight: string;
  quality: "GREEN" | "YELLOW" | "RED" | null;
  notes: string;
};

type ExerciseRow = {
  id: string;
  templateId: string | null;
  templateName: string;
  machineSettings: string;
  notes: string;
  sets: SetRow[];
  expanded: boolean;
};

const defaultSet = (): SetRow => ({
  reps: "",
  weight: "",
  quality: null,
  notes: "",
});

const defaultExercise = (): ExerciseRow => ({
  id: crypto.randomUUID(),
  templateId: null,
  templateName: "",
  machineSettings: "",
  notes: "",
  sets: [defaultSet()],
  expanded: true,
});

function bwRatio(ex: ExerciseRow, bw: number): number | null {
  const max = Math.max(...ex.sets.map((s) => Number(s.weight)).filter((w) => w > 0));
  if (!isFinite(max) || max <= 0 || bw <= 0) return null;
  return max / bw;
}

const qualityConfig = {
  GREEN: { label: "Good", color: "bg-green-500" },
  YELLOW: { label: "OK", color: "bg-yellow-400" },
  RED: { label: "Hard", color: "bg-red-500" },
} as const;

type InitialData = {
  name: string;
  date: string;
  notes: string;
  exercises: ExerciseRow[];
};

type RecentWorkout = {
  id: string;
  name: string;
  date: Date;
  _count: { exercises: number };
};

export function WorkoutForm({
  templates,
  initialData,
  workoutId,
  defaultBodyWeight,
}: {
  templates: Template[];
  initialData?: InitialData;
  workoutId?: string;
  defaultBodyWeight?: number | null;
}) {
  const today = new Date().toISOString().slice(0, 10);

  const [name, setName] = useState(initialData?.name ?? "");
  const [date, setDate] = useState(initialData?.date ?? today);
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [bodyWeight, setBodyWeight] = useState(
    defaultBodyWeight != null ? String(defaultBodyWeight) : ""
  );
  const [exercises, setExercises] = useState<ExerciseRow[]>(
    initialData?.exercises ?? [defaultExercise()]
  );
  const [search, setSearch] = useState<Record<string, string>>({});
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Record<string, "LIKED" | "DISLIKED" | null>>(
    () => Object.fromEntries(templates.map((t) => [t.id, t.reaction]))
  );
  const [expandedSetNotes, setExpandedSetNotes] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [cloneModalOpen, setCloneModalOpen] = useState(false);
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([]);
  const [cloneLoading, setCloneLoading] = useState(false);

  // ── Exercise helpers ──────────────────────────────────────────

  function updateExercise(id: string, patch: Partial<ExerciseRow>) {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === id) return { ...ex, ...patch };
        if (patch.expanded === true) return { ...ex, expanded: false };
        return ex;
      })
    );
  }

  function removeExercise(id: string) {
    setExercises((prev) => prev.filter((ex) => ex.id !== id));
  }

  function addExercise() {
    const ex = { ...defaultExercise(), expanded: false };
    setExercises((prev) => [...prev, ex]);
  }

  function selectTemplate(exId: string, t: Template) {
    updateExercise(exId, { templateId: t.id, templateName: t.name });
    setSearch((prev) => ({ ...prev, [exId]: "" }));
    setOpenDropdownId(null);
  }

  function toggleSetNote(key: string) {
    setExpandedSetNotes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // ── Set helpers ───────────────────────────────────────────────

  function updateSet(exId: string, i: number, patch: Partial<SetRow>) {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exId
          ? {
              ...ex,
              sets: ex.sets.map((s, j) => (j === i ? { ...s, ...patch } : s)),
            }
          : ex
      )
    );
  }

  function addSet(exId: string) {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exId) return ex;
        const last = ex.sets[ex.sets.length - 1];
        return {
          ...ex,
          sets: [...ex.sets, { ...defaultSet(), weight: last?.weight ?? "" }],
        };
      })
    );
  }

  function removeSet(exId: string, i: number) {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exId ? { ...ex, sets: ex.sets.filter((_, j) => j !== i) } : ex
      )
    );
  }

  // ── Reactions ────────────────────────────────────────────────

  async function toggleReaction(templateId: string, reaction: "LIKED" | "DISLIKED") {
    const current = reactions[templateId] ?? null;
    const next = current === reaction ? null : reaction;
    setReactions((prev) => ({ ...prev, [templateId]: next }));
    await setExercisePreference(templateId, next);
  }

  // ── Clone ─────────────────────────────────────────────────────

  async function openCloneModal() {
    setCloneModalOpen(true);
    setCloneLoading(true);
    const workouts = await getRecentWorkouts();
    setRecentWorkouts(workouts as RecentWorkout[]);
    setCloneLoading(false);
  }

  async function applyClone(id: string) {
    setCloneLoading(true);
    const data = await getWorkoutForClone(id);
    setCloneLoading(false);
    if (!data) return;
    setName(data.name);
    setNotes(data.notes);
    setExercises(data.exercises);
    setCloneModalOpen(false);
  }

  // ── Submit ────────────────────────────────────────────────────

  function handleSubmit() {
    setError(null);

    if (!name.trim()) return setError("Workout name is required.");
    if (exercises.some((ex) => !ex.templateId && !ex.templateName.trim()))
      return setError("All exercises need a name.");
    if (exercises.some((ex) => ex.sets.length === 0))
      return setError("Each exercise needs at least one set.");
    if (exercises.some((ex) => ex.sets.some((s) => Number(s.reps) < 1)))
      return setError("All sets need at least 1 rep.");

    const payload: SaveWorkoutInput = {
      name: name.trim(),
      date,
      notes: notes.trim() || undefined,
      bodyWeight: bodyWeight ? Number(bodyWeight) : undefined,
      exercises: exercises.map((ex, i) => ({
        templateId: ex.templateId,
        customName: ex.templateName,
        order: i,
        machineSettings: ex.machineSettings.trim() || undefined,
        notes: ex.notes.trim() || undefined,
        sets: ex.sets.map((s) => ({
          reps: Number(s.reps),
          weight: Number(s.weight),
          unit: "kg" as const,
          quality: s.quality ?? undefined,
          notes: s.notes.trim() || undefined,
        })),
      })),
    };

    startTransition(async () => {
      const result = workoutId
        ? await updateWorkout(workoutId, payload)
        : await saveWorkout(payload);
      if (result?.error) setError(result.error);
    });
  }

  // ── Filtered templates by search query ───────────────────────

  function filtered(exId: string) {
    const q = (search[exId] ?? "").toLowerCase();
    if (!q) return templates.slice(0, 8);
    return templates
      .filter((t) => t.name.toLowerCase().includes(q))
      .slice(0, 8);
  }

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Clone button — only on new workout */}
      {!workoutId && (
        <button
          onClick={openCloneModal}
          className="border-border text-muted-foreground hover:border-foreground hover:text-foreground flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm transition-colors"
        >
          <ClipboardList className="size-4" />
          Clone previous workout
        </button>
      )}

      {/* Workout meta */}
      <div className="border-border bg-card space-y-3 rounded-xl border p-4">
        <div>
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            Workout name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Push Day, Leg Day…"
            className="border-border bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border-border bg-background focus:ring-ring rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            Body weight (kg, optional)
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={bodyWeight}
            onChange={(e) => setBodyWeight(e.target.value)}
            placeholder="e.g. 75"
            min={20}
            max={500}
            step={0.1}
            className="border-border bg-background focus:ring-ring rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="How did it go?"
            className="border-border bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          />
        </div>
      </div>

      {/* Exercises */}
      {exercises.map((ex, exIdx) => {
        const q = search[ex.id] ?? "";
        const showDropdown =
          !ex.templateId && ex.expanded && openDropdownId === ex.id;
        const bw = bodyWeight ? Number(bodyWeight) : 0;
        const ratio = bwRatio(ex, bw);

        return (
          <div key={ex.id} className="border-border bg-card rounded-xl border">
            {/* Exercise header */}
            <div className="border-border flex items-center gap-2 rounded-t-xl border-b px-4 py-3">
              <span className="text-muted-foreground w-5 shrink-0 text-xs font-semibold">
                {exIdx + 1}
              </span>

              <div className="relative min-w-0 flex-1">
                {ex.templateId || ex.templateName ? (
                  <button
                    onClick={() => {
                      updateExercise(ex.id, {
                        templateId: null,
                        templateName: "",
                      });
                      setOpenDropdownId(ex.id);
                    }}
                    className="bg-muted flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-sm font-medium"
                  >
                    <span className="truncate">{ex.templateName}</span>
                    <span className="text-muted-foreground ml-2 shrink-0 text-xs">
                      change
                    </span>
                  </button>
                ) : (
                  <div className="relative">
                    <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
                    <input
                      value={q}
                      onChange={(e) => {
                        setSearch((prev) => ({
                          ...prev,
                          [ex.id]: e.target.value,
                        }));
                        setOpenDropdownId(ex.id);
                      }}
                      onFocus={() => {
                        updateExercise(ex.id, { expanded: true });
                        setOpenDropdownId(ex.id);
                      }}
                      placeholder="Search exercise…"
                      className="border-border bg-background focus:ring-ring w-full rounded-lg border py-1.5 pr-3 pl-8 text-sm focus:ring-2 focus:outline-none"
                    />
                    {showDropdown && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenDropdownId(null)}
                        />
                        <div className="border-border bg-card absolute top-full left-0 z-20 mt-1 max-h-56 min-w-full max-w-[calc(100vw-2rem)] overflow-y-auto rounded-lg border shadow-lg">
                          {filtered(ex.id).map((t) => (
                            <div
                              key={t.id}
                              className="hover:bg-muted flex w-full items-center gap-1 px-2 py-1.5 text-sm"
                            >
                              <button
                                onClick={() => selectTemplate(ex.id, t)}
                                className="flex min-w-0 flex-1 items-center gap-2 text-left"
                              >
                                <span className="truncate">{t.name}</span>
                                <span className="text-muted-foreground shrink-0 text-[10px] uppercase">
                                  {t.equipment.toLowerCase()}
                                </span>
                              </button>
                              <div className="flex shrink-0 items-center gap-0.5">
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleReaction(t.id, "LIKED"); }}
                                  title="Lubię to ćwiczenie"
                                  className={cn(
                                    "rounded p-1 transition-colors",
                                    reactions[t.id] === "LIKED"
                                      ? "text-green-500"
                                      : "text-muted-foreground hover:text-green-500"
                                  )}
                                >
                                  <ThumbsUp className="size-3.5" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleReaction(t.id, "DISLIKED"); }}
                                  title="Nie lubię tego ćwiczenia"
                                  className={cn(
                                    "rounded p-1 transition-colors",
                                    reactions[t.id] === "DISLIKED"
                                      ? "text-red-500"
                                      : "text-muted-foreground hover:text-red-500"
                                  )}
                                >
                                  <ThumbsDown className="size-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                          {q && (
                            <button
                              onClick={() => {
                                updateExercise(ex.id, {
                                  templateId: null,
                                  templateName: q,
                                });
                                setSearch((prev) => ({ ...prev, [ex.id]: "" }));
                                setOpenDropdownId(null);
                              }}
                              className="hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-left text-sm"
                            >
                              <Plus className="text-muted-foreground size-3.5" />
                              Add &ldquo;{q}&rdquo;
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {ratio != null && (
                <span className="text-muted-foreground bg-muted shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium tabular-nums">
                  {ratio.toFixed(2)}× BW
                </span>
              )}

              <div className="ml-1 flex shrink-0 items-center gap-1">
                <button
                  onClick={() => removeExercise(ex.id)}
                  className="rounded-md p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50"
                  title="Remove exercise"
                >
                  <Trash2 className="size-4" />
                </button>
                <div className="bg-border mx-1 h-4 w-px" />
                <button
                  onClick={() =>
                    updateExercise(ex.id, { expanded: !ex.expanded })
                  }
                  className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-1.5 transition-colors"
                >
                  {ex.expanded ? (
                    <ChevronUp className="size-4" />
                  ) : (
                    <ChevronDown className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {ex.expanded && (
              <div className="space-y-3 p-4">
                {/* Machine settings */}
                <input
                  value={ex.machineSettings}
                  onChange={(e) =>
                    updateExercise(ex.id, { machineSettings: e.target.value })
                  }
                  placeholder="Machine settings (optional)"
                  className="border-border bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-xs focus:ring-2 focus:outline-none"
                />

                {/* Sets header */}
                <div className="text-muted-foreground grid grid-cols-[2rem_1fr_1fr_4rem_3rem] gap-2 px-1 text-[10px] font-medium uppercase">
                  <span>#</span>
                  <span>Weight (kg)</span>
                  <span>Reps</span>
                  <span>Quality</span>
                  <span />
                </div>

                {/* Sets */}
                {ex.sets.map((s, i) => {
                  const noteKey = `${ex.id}-${i}`;
                  const showNote = s.notes !== "" || expandedSetNotes.has(noteKey);
                  return (
                    <div key={i} className="space-y-1">
                      <div className="grid grid-cols-[2rem_1fr_1fr_4rem_3rem] items-center gap-2">
                        <span className="text-muted-foreground text-center text-xs font-medium">
                          {i + 1}
                        </span>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={s.weight}
                          onChange={(e) =>
                            updateSet(ex.id, i, { weight: e.target.value })
                          }
                          placeholder="0"
                          min={0}
                          className="border-border bg-background focus:ring-ring w-full rounded-lg border px-2 py-2 text-center text-sm focus:ring-2 focus:outline-none"
                        />
                        <input
                          type="number"
                          inputMode="numeric"
                          value={s.reps}
                          onChange={(e) =>
                            updateSet(ex.id, i, { reps: e.target.value })
                          }
                          placeholder="0"
                          min={0}
                          className="border-border bg-background focus:ring-ring w-full rounded-lg border px-2 py-2 text-center text-sm focus:ring-2 focus:outline-none"
                        />
                        {/* Quality toggle */}
                        <div className="flex justify-center gap-1">
                          {(["GREEN", "YELLOW", "RED"] as const).map((q) => (
                            <button
                              key={q}
                              title={qualityConfig[q].label}
                              onClick={() =>
                                updateSet(ex.id, i, {
                                  quality: s.quality === q ? null : q,
                                })
                              }
                              className={cn(
                                "size-3.5 rounded-full transition-all",
                                qualityConfig[q].color,
                                s.quality === q
                                  ? "opacity-100 ring-2 ring-current ring-offset-1"
                                  : "opacity-30"
                              )}
                            />
                          ))}
                        </div>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => toggleSetNote(noteKey)}
                            title="Add note"
                            className={cn(
                              "transition-colors",
                              showNote
                                ? "text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <MessageSquare className="size-3.5" />
                          </button>
                          <button
                            onClick={() => removeSet(ex.id, i)}
                            disabled={ex.sets.length === 1}
                            className="text-muted-foreground hover:text-destructive disabled:opacity-20"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                      {showNote && (
                        <div className="pl-8">
                          <input
                            value={s.notes}
                            onChange={(e) =>
                              updateSet(ex.id, i, { notes: e.target.value })
                            }
                            placeholder="Note for this set…"
                            className="border-border bg-background focus:ring-ring w-full rounded-lg border px-3 py-1.5 text-xs focus:ring-2 focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}

                <button
                  onClick={() => addSet(ex.id)}
                  className="border-border text-muted-foreground hover:border-foreground hover:text-foreground flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed px-3 py-2 text-xs transition-colors"
                >
                  <Plus className="size-3.5" />
                  Add set
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Add exercise */}
      <button
        onClick={addExercise}
        className="border-border text-muted-foreground hover:border-foreground hover:text-foreground flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3.5 text-sm transition-colors"
      >
        <Plus className="size-4" />
        Add Exercise
      </button>

      {error && (
        <p className="bg-destructive/10 text-destructive rounded-lg px-4 py-2 text-sm">
          {error}
        </p>
      )}

      {/* Save */}
      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="bg-primary text-primary-foreground flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Saving…
          </>
        ) : workoutId ? (
          "Update Workout"
        ) : (
          "Save Workout"
        )}
      </button>

      {/* Clone modal */}
      {cloneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setCloneModalOpen(false)}
          />
          <div className="relative z-10 flex w-full max-w-sm flex-col rounded-xl border border-border bg-card shadow-xl max-h-[70vh]">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold">Clone previous workout</h2>
              <button
                onClick={() => setCloneModalOpen(false)}
                className="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-2">
              {cloneLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : recentWorkouts.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  No previous workouts found
                </p>
              ) : (
                recentWorkouts.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => applyClone(w.id)}
                    className="w-full rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted"
                  >
                    <p className="text-sm font-medium">{w.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(w.date).toLocaleDateString()} ·{" "}
                      {w._count.exercises}{" "}
                      {w._count.exercises === 1 ? "exercise" : "exercises"}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
