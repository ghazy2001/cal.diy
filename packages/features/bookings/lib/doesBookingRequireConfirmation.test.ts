import dayjs from "@calcom/dayjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { doesBookingRequireConfirmation } from "./doesBookingRequireConfirmation";

describe("doesBookingRequireConfirmation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-14T10:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should not require confirmation when booked with exactly the threshold notice (hours)", () => {
    const now = dayjs();
    const startTime = now.add(2, "hours").toDate();

    const result = doesBookingRequireConfirmation({
      booking: {
        startTime,
        eventType: {
          requiresConfirmation: true,
          metadata: {
            requiresConfirmationThreshold: {
              time: 2,
              unit: "hours",
            },
          },
        },
      },
    });

    expect(result).toBe(false);
  });

  it("should not require confirmation when booked with notice between X and X+1 units (e.g. 2h30m for 2 hours threshold)", () => {
    const now = dayjs();
    const startTime = now.add(2, "hours").add(30, "minutes").toDate();

    const result = doesBookingRequireConfirmation({
      booking: {
        startTime,
        eventType: {
          requiresConfirmation: true,
          metadata: {
            requiresConfirmationThreshold: {
              time: 2,
              unit: "hours",
            },
          },
        },
      },
    });

    expect(result).toBe(false);
  });

  it("should require confirmation when booked with less than threshold notice (e.g. 1h59m for 2 hours threshold)", () => {
    const now = dayjs();
    const startTime = now.add(1, "hours").add(59, "minutes").toDate();

    const result = doesBookingRequireConfirmation({
      booking: {
        startTime,
        eventType: {
          requiresConfirmation: true,
          metadata: {
            requiresConfirmationThreshold: {
              time: 2,
              unit: "hours",
            },
          },
        },
      },
    });

    expect(result).toBe(true);
  });

  it("should not require confirmation when notice meets threshold in minutes (e.g. 30m for 30 minutes threshold)", () => {
    const now = dayjs();
    const startTime = now.add(30, "minutes").toDate();

    const result = doesBookingRequireConfirmation({
      booking: {
        startTime,
        eventType: {
          requiresConfirmation: true,
          metadata: {
            requiresConfirmationThreshold: {
              time: 30,
              unit: "minutes",
            },
          },
        },
      },
    });

    expect(result).toBe(false);
  });

  it("should not require confirmation when notice is between X and X+1 minutes (e.g. 30m30s for 30 minutes threshold)", () => {
    const now = dayjs();
    const startTime = now.add(30, "minutes").add(30, "seconds").toDate();

    const result = doesBookingRequireConfirmation({
      booking: {
        startTime,
        eventType: {
          requiresConfirmation: true,
          metadata: {
            requiresConfirmationThreshold: {
              time: 30,
              unit: "minutes",
            },
          },
        },
      },
    });

    expect(result).toBe(false);
  });

  it("should require confirmation when notice is less than threshold in minutes (e.g. 29m for 30 minutes threshold)", () => {
    const now = dayjs();
    const startTime = now.add(29, "minutes").toDate();

    const result = doesBookingRequireConfirmation({
      booking: {
        startTime,
        eventType: {
          requiresConfirmation: true,
          metadata: {
            requiresConfirmationThreshold: {
              time: 30,
              unit: "minutes",
            },
          },
        },
      },
    });

    expect(result).toBe(true);
  });

  it("should respect requiresConfirmation: false when threshold is not met", () => {
    const now = dayjs();
    const startTime = now.add(1, "hours").toDate();

    const result = doesBookingRequireConfirmation({
      booking: {
        startTime,
        eventType: {
          requiresConfirmation: false,
          metadata: {
            requiresConfirmationThreshold: {
              time: 2,
              unit: "hours",
            },
          },
        },
      },
    });

    expect(result).toBe(false);
  });

  it("should respect requiresConfirmation: true when no threshold is set", () => {
    const now = dayjs();
    const startTime = now.add(10, "hours").toDate();

    const result = doesBookingRequireConfirmation({
      booking: {
        startTime,
        eventType: {
          requiresConfirmation: true,
          metadata: {},
        },
      },
    });

    expect(result).toBe(true);
  });
});
