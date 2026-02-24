import { describe, it, expect } from "vitest";
import { applyFiltersAndSort, DEFAULT_FILTER, DEFAULT_SORT } from "@/components/project/FilterSortBar";

const stories = [
  { id: "1", assigneeId: "user-a", status: "TODO",        priority: 0, dueDate: "2026-03-01" },
  { id: "2", assigneeId: "user-b", status: "IN_PROGRESS", priority: 2, dueDate: "2026-01-01" },
  { id: "3", assigneeId: null,     status: "TODO",        priority: 1, dueDate: null },
  { id: "4", assigneeId: "user-a", status: "DONE",        priority: 3, dueDate: "2026-06-01" },
];

describe("applyFiltersAndSort", () => {
  // ── Filtre assignee ────────────────────────────────────────────────────────

  it("retourne toutes les stories sans filtre", () => {
    expect(applyFiltersAndSort(stories, DEFAULT_FILTER, DEFAULT_SORT)).toHaveLength(4);
  });

  it("filtre par assignee", () => {
    const result = applyFiltersAndSort(stories, { assigneeIds: ["user-a"], statuses: [] }, DEFAULT_SORT);
    expect(result.map((s) => s.id)).toEqual(["1", "4"]);
  });

  it("filtre les stories non assignées avec 'unassigned'", () => {
    const result = applyFiltersAndSort(stories, { assigneeIds: ["unassigned"], statuses: [] }, DEFAULT_SORT);
    expect(result.map((s) => s.id)).toEqual(["3"]);
  });

  it("combine assignee et unassigned", () => {
    const result = applyFiltersAndSort(stories, { assigneeIds: ["user-b", "unassigned"], statuses: [] }, DEFAULT_SORT);
    expect(result.map((s) => s.id)).toEqual(["2", "3"]);
  });

  // ── Filtre statut ──────────────────────────────────────────────────────────

  it("filtre par statut", () => {
    const result = applyFiltersAndSort(stories, { assigneeIds: [], statuses: ["TODO"] }, DEFAULT_SORT);
    expect(result.map((s) => s.id)).toEqual(["1", "3"]);
  });

  it("filtre par plusieurs statuts", () => {
    const result = applyFiltersAndSort(stories, { assigneeIds: [], statuses: ["TODO", "DONE"] }, DEFAULT_SORT);
    expect(result.map((s) => s.id)).toEqual(["1", "3", "4"]);
  });

  // ── Tri priorité ──────────────────────────────────────────────────────────

  it("trie par priorité asc (critique d'abord)", () => {
    const result = applyFiltersAndSort(stories, DEFAULT_FILTER, { field: "priority", direction: "asc" });
    expect(result.map((s) => s.priority)).toEqual([0, 1, 2, 3]);
  });

  it("trie par priorité desc (basse d'abord)", () => {
    const result = applyFiltersAndSort(stories, DEFAULT_FILTER, { field: "priority", direction: "desc" });
    expect(result.map((s) => s.priority)).toEqual([3, 2, 1, 0]);
  });

  // ── Tri dueDate ───────────────────────────────────────────────────────────

  it("trie par dueDate asc (proche d'abord, nulls en dernier)", () => {
    const result = applyFiltersAndSort(stories, DEFAULT_FILTER, { field: "dueDate", direction: "asc" });
    expect(result.map((s) => s.id)).toEqual(["2", "1", "4", "3"]);
  });

  it("trie par dueDate desc (éloignée d'abord, nulls en dernier)", () => {
    const result = applyFiltersAndSort(stories, DEFAULT_FILTER, { field: "dueDate", direction: "desc" });
    expect(result.map((s) => s.id)).toEqual(["4", "1", "2", "3"]);
  });

  // ── Combinaison filtre + tri ───────────────────────────────────────────────

  it("combine filtre assignee et tri priorité", () => {
    const result = applyFiltersAndSort(
      stories,
      { assigneeIds: ["user-a"], statuses: [] },
      { field: "priority", direction: "asc" }
    );
    expect(result.map((s) => s.id)).toEqual(["1", "4"]);
  });

  // ── Cas limites ───────────────────────────────────────────────────────────

  it("retourne un tableau vide si aucune story ne correspond", () => {
    const result = applyFiltersAndSort(stories, { assigneeIds: [], statuses: ["ARCHIVED"] }, DEFAULT_SORT);
    expect(result).toHaveLength(0);
  });

  it("ne mute pas le tableau original", () => {
    const original = [...stories];
    applyFiltersAndSort(stories, DEFAULT_FILTER, { field: "priority", direction: "desc" });
    expect(stories).toEqual(original);
  });
});
