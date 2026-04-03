import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  formatTonnage,
  formatRelativeDate,
  formatDate,
  startOfWeek,
} from "./date";

describe("formatTonnage", () => {
  it("returns kg for values under 1000", () => {
    expect(formatTonnage(0)).toBe("0kg");
    expect(formatTonnage(80)).toBe("80kg");
    expect(formatTonnage(999)).toBe("999kg");
  });

  it("returns tonnes for values >= 1000", () => {
    expect(formatTonnage(1000)).toBe("1.0t");
    expect(formatTonnage(1500)).toBe("1.5t");
    expect(formatTonnage(10000)).toBe("10.0t");
  });

  it("rounds kg values", () => {
    expect(formatTonnage(80.6)).toBe("81kg");
    expect(formatTonnage(80.4)).toBe("80kg");
  });
});

describe("formatRelativeDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "Today" for same day', () => {
    expect(formatRelativeDate(new Date("2025-06-15T08:00:00Z"))).toBe("Today");
  });

  it('returns "Yesterday" for 1 day ago', () => {
    expect(formatRelativeDate(new Date("2025-06-14T08:00:00Z"))).toBe(
      "Yesterday"
    );
  });

  it("returns days ago for 2-6 days", () => {
    expect(formatRelativeDate(new Date("2025-06-12T08:00:00Z"))).toBe(
      "3 days ago"
    );
    expect(formatRelativeDate(new Date("2025-06-09T08:00:00Z"))).toBe(
      "6 days ago"
    );
  });

  it("returns weeks ago for 7-29 days", () => {
    expect(formatRelativeDate(new Date("2025-06-08T08:00:00Z"))).toBe(
      "1 weeks ago"
    );
    expect(formatRelativeDate(new Date("2025-05-25T08:00:00Z"))).toBe(
      "3 weeks ago"
    );
  });

  it("returns formatted date for 30+ days ago", () => {
    const result = formatRelativeDate(new Date("2025-04-01T08:00:00Z"));
    expect(result).toContain("Apr");
    expect(result).toContain("1");
  });
});

describe("formatDate", () => {
  it("includes weekday, month, day and year", () => {
    const result = formatDate(new Date("2025-01-15T12:00:00Z"));
    expect(result).toMatch(/\w+,\s+\w+\s+\d+,\s+\d{4}/);
  });
});

describe("startOfWeek", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("returns Monday when today is Wednesday", () => {
    vi.setSystemTime(new Date("2025-06-11T12:00:00Z")); // Wednesday
    const result = startOfWeek();
    expect(result.getDay()).toBe(1); // Monday
  });

  it("returns Monday when today is Monday", () => {
    vi.setSystemTime(new Date("2025-06-09T12:00:00Z")); // Monday
    const result = startOfWeek();
    expect(result.getDay()).toBe(1);
  });

  it("returns previous Monday when today is Sunday", () => {
    vi.setSystemTime(new Date("2025-06-15T12:00:00Z")); // Sunday
    const result = startOfWeek();
    expect(result.getDay()).toBe(1);
  });

  it("returns date with time set to midnight", () => {
    vi.setSystemTime(new Date("2025-06-11T15:30:00Z"));
    const result = startOfWeek();
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
  });
});
