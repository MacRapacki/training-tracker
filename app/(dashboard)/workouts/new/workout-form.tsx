"use client";

import { useState, useTransition } from "react";
import { saveWorkout, type SaveWorkoutInput } from "@/app/actions/workouts";
import { cn } from "@/lib/utils";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
  Loader2,
} from "lucide-react";

type Template = { id: string; name: string; equipment: string };

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

const qualityConfig = {
  GREEN: { label: "Good", color: "bg-green-500" },
  YELLOW: { label: "OK", color: "bg-yellow-400" },
  RED: { label: "Hard", color: "bg-red-500" },
} as const;

export function NewWorkoutForm({ templates }: { templates: Template[] }) {
  const today = new Date().toISOString().slice(0, 10);

  const [name, setName] = useState("");
  const [date, setDate] = useState(today);
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState<ExerciseRow[]>([defaultExercise()]);
  const [search, setSearch] = useState<Record<string, string>>({});
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

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
        ex.id === exId
          ? { ...ex, sets: ex.sets.filter((_, j) => j !== i) }
          : ex
      )
    );
  }

  // ── Submit ────────────────────────────────────────────────────

  function handleSubmit() {
    setError(null);

    if (!name.trim()) return setError("Workout name is required.");
    if (exercises.some((ex) => !ex.templateId && !ex.templateName.trim()))
      return setError("All exercises need a name.");
    if (exercises.some((ex) => ex.sets.length === 0))
      return setError("Each exercise needs at least one set.");

    const payload: SaveWorkoutInput = {
      name: name.trim(),
      date,
      notes: notes.trim() || undefined,
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

    startTransition(() => saveWorkout(payload));
  }

  // ── Filtered templates by search query ───────────────────────

  function filtered(exId: string) {
    const q = (search[exId] ?? "").toLowerCase();
    if (!q) return templates.slice(0, 8);
    return templates.filter((t) => t.name.toLowerCase().includes(q)).slice(0, 8);
  }

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Workout meta */}
      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Workout name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Push Day, Leg Day…"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="How did it go?"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Exercises */}
      {exercises.map((ex, exIdx) => {
        const q = search[ex.id] ?? "";
        const showDropdown = !ex.templateId && ex.expanded && openDropdownId === ex.id;

        return (
          <div key={ex.id} className="rounded-xl border border-border bg-card">

            {/* Exercise header */}
            <div className="flex items-center gap-2 rounded-t-xl px-4 py-3 border-b border-border">
              <span className="text-xs font-semibold text-muted-foreground w-5 shrink-0">
                {exIdx + 1}
              </span>

              <div className="relative flex-1">
                {ex.templateId || ex.templateName ? (
                  <button
                    onClick={() => {
                      updateExercise(ex.id, {
                        templateId: null,
                        templateName: "",
                      });
                      setOpenDropdownId(ex.id);
                    }}
                    className="flex w-full items-center justify-between rounded-lg bg-muted px-3 py-1.5 text-sm font-medium"
                  >
                    <span className="truncate">{ex.templateName}</span>
                    <span className="text-xs text-muted-foreground ml-2 shrink-0">
                      change
                    </span>
                  </button>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <input
                      value={q}
                      onChange={(e) => {
                        setSearch((prev) => ({ ...prev, [ex.id]: e.target.value }));
                        setOpenDropdownId(ex.id);
                      }}
                      onFocus={() => {
                        updateExercise(ex.id, { expanded: true });
                        setOpenDropdownId(ex.id);
                      }}
                      placeholder="Search exercise…"
                      className="w-full rounded-lg border border-border bg-background py-1.5 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    {showDropdown && (
                      <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenDropdownId(null)}
                      />
                      <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-lg border border-border bg-card shadow-lg overflow-y-auto max-h-56">
                        {filtered(ex.id).map((t) => (
                          <button
                            key={t.id}
                            onClick={() => selectTemplate(ex.id, t)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                          >
                            <span className="flex-1 truncate">{t.name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase shrink-0">
                              {t.equipment.toLowerCase()}
                            </span>
                          </button>
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
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                          >
                            <Plus className="size-3.5 text-muted-foreground" />
                            Add &ldquo;{q}&rdquo;
                          </button>
                        )}
                      </div>
                      </>

                    )}
                  </div>
                )}
              </div>

              <div className="ml-1 flex items-center gap-1 shrink-0">
                <button
                  onClick={() => removeExercise(ex.id)}
                  className="rounded-md p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50"
                  title="Remove exercise"
                >
                  <Trash2 className="size-4" />
                </button>
                <div className="w-px h-4 bg-border mx-1" />
                <button
                  onClick={() =>
                    updateExercise(ex.id, { expanded: !ex.expanded })
                  }
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
              <div className="p-4 space-y-3">
                {/* Machine settings */}
                <input
                  value={ex.machineSettings}
                  onChange={(e) =>
                    updateExercise(ex.id, { machineSettings: e.target.value })
                  }
                  placeholder="Machine settings (optional)"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                />

                {/* Sets header */}
                <div className="grid grid-cols-[2rem_1fr_1fr_4rem_1.5rem] gap-2 px-1 text-[10px] font-medium uppercase text-muted-foreground">
                  <span>#</span>
                  <span>Weight (kg)</span>
                  <span>Reps</span>
                  <span>Quality</span>
                  <span />
                </div>

                {/* Sets */}
                {ex.sets.map((s, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[2rem_1fr_1fr_4rem_1.5rem] items-center gap-2"
                  >
                    <span className="text-center text-xs font-medium text-muted-foreground">
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
                      className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <input
                      type="number"
                      inputMode="numeric"
                      value={s.reps}
                      onChange={(e) =>
                        updateSet(ex.id, i, { reps: e.target.value })
                      }
                      placeholder="0"
                      className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    {/* Quality toggle */}
                    <div className="flex gap-1 justify-center">
                      {(
                        ["GREEN", "YELLOW", "RED"] as const
                      ).map((q) => (
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
                              ? "opacity-100 ring-2 ring-offset-1 ring-current"
                              : "opacity-30"
                          )}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => removeSet(ex.id, i)}
                      disabled={ex.sets.length === 1}
                      className="text-muted-foreground hover:text-destructive disabled:opacity-20"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => addSet(ex.id)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
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
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3.5 text-sm text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
      >
        <Plus className="size-4" />
        Add Exercise
      </button>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Save */}
      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Saving…
          </>
        ) : (
          "Save Workout"
        )}
      </button>
    </div>
  );
}
