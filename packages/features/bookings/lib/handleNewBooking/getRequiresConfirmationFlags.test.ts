import dayjs from "@calcom/dayjs";
import { describe, expect, it, vi } from "vitest";

vi.mock("@calcom/features/watchlist/lib/freeEmailDomainCheck/checkIfFreeEmailDomain", () => ({
  checkIfFreeEmailDomain: vi.fn().mockResolvedValue(false),
}));

import { getRequiresConfirmationFlags } from "./getRequiresConfirmationFlags";

describe("getRequiresConfirmationFlags", () => {
  const baseEventType = {
    metadata: {
      requiresConfirmationThreshold: {
        time: 2,
        unit: "hours" as const,
      },
    },
    requiresConfirmation: true,
    requiresConfirmationForFreeEmail: false,
  };

  it("should mark isConfirmedByDefault as true when notice meets or exceeds threshold (e.g. 2h30m for 2h threshold)", async () => {
    vi.useFakeTimers();
    const now = dayjs("2026-11-14T10:00:00Z");
    vi.setSystemTime(now.toDate());
    const bookingStartTime = now.add(2, "hours").add(30, "minutes").toISOString();

    const flags = await getRequiresConfirmationFlags({
      eventType: baseEventType,
      bookingStartTime,
      userId: 1,
      paymentAppData: { price: 0 },
      originalRescheduledBookingOrganizerId: undefined,
      bookerEmail: "user@example.com",
    });

    expect(flags.isConfirmedByDefault).toBe(true);
    vi.useRealTimers();
  });

  it("should mark isConfirmedByDefault as true when notice is exactly threshold (e.g. 2h for 2h threshold)", async () => {
    vi.useFakeTimers();
    const now = dayjs("2026-11-14T10:00:00Z");
    vi.setSystemTime(now.toDate());
    const bookingStartTime = now.add(2, "hours").toISOString();

    const flags = await getRequiresConfirmationFlags({
      eventType: baseEventType,
      bookingStartTime,
      userId: 1,
      paymentAppData: { price: 0 },
      originalRescheduledBookingOrganizerId: undefined,
      bookerEmail: "user@example.com",
    });

    expect(flags.isConfirmedByDefault).toBe(true);
    vi.useRealTimers();
  });

  it("should mark isConfirmedByDefault as false when notice is less than threshold (e.g. 1h45m for 2h threshold)", async () => {
    vi.useFakeTimers();
    const now = dayjs("2026-11-14T10:00:00Z");
    vi.setSystemTime(now.toDate());
    const bookingStartTime = now.add(1, "hours").add(45, "minutes").toISOString();

    const flags = await getRequiresConfirmationFlags({
      eventType: baseEventType,
      bookingStartTime,
      userId: 1,
      paymentAppData: { price: 0 },
      originalRescheduledBookingOrganizerId: undefined,
      bookerEmail: "user@example.com",
    });

    expect(flags.isConfirmedByDefault).toBe(false);
    vi.useRealTimers();
  });
});
