import type { CalendarEvent } from "@calcom/types/Calendar";
import type { CredentialPayload } from "@calcom/types/Credential";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@calcom/prisma", () => ({
  default: {},
  prisma: {},
}));

import { OAuthManager } from "../../_utils/oauth/OAuthManager";
import BuildCrmService from "../lib/CrmService";

describe("Pipedrive CRM Service", () => {
  const mockCredential: CredentialPayload = {
    id: 1,
    type: "pipedrive-crm_crm",
    key: {
      access_token: "mock-token",
      api_domain: "https://api.pipedrive.com",
    },
    userId: 1,
    appId: "pipedrive-crm",
    teamId: null,
    invalid: false,
    user: {
      email: "user@example.com",
    },
    delegationCredentialId: null,
    encryptedKey: null,
  };

  const mockEvent: CalendarEvent = {
    type: "test-event",
    title: "Pipedrive Sync Meeting",
    startTime: "2026-11-09T20:00:00.000Z",
    endTime: "2026-11-09T20:30:00.000Z",
    uid: "test-booking-uid",
    organizer: {
      language: {
        translate: (key: string) => key,
      },
    } as any,
    attendees: [
      {
        id: 1,
        name: "Test Attendee",
        email: "attendee@example.com",
        timeZone: "Asia/Kolkata",
      } as any,
    ],
  } as any;

  const mockContacts = [
    {
      id: "999",
      name: "Test Attendee",
      email: "attendee@example.com",
    },
  ];

  let requestSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.spyOn(OAuthManager.prototype, "getTokenObjectOrFetch").mockResolvedValue({
      token: {
        access_token: "mock-access-token",
        api_domain: "https://api.pipedrive.com",
      },
    } as any);

    requestSpy = vi.spyOn(OAuthManager.prototype, "request").mockResolvedValue({
      response: new Response(),
      json: {
        success: true,
        data: {
          id: 12345,
          subject: "Pipedrive Sync Meeting",
          due_date: "2026-11-09",
          due_time: "20:00",
        },
      },
      text: "",
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends due_time and due_date in UTC on createEvent even when local timezone is non-UTC", async () => {
    // Simulate a non-UTC local environment (e.g. Asia/Kolkata where 20:00 UTC is 01:30 local next day)
    const originalToTimeString = Date.prototype.toTimeString;
    vi.spyOn(Date.prototype, "toTimeString").mockReturnValue("01:30:00 GMT+0530 (India Standard Time)");

    try {
      const crm = BuildCrmService(mockCredential);
      const result = await crm.createEvent(mockEvent, mockContacts);

      expect(result.id).toBe("12345");
      expect(requestSpy).toHaveBeenCalledTimes(1);

      const callArgs = requestSpy.mock.calls[0][0];
      expect(callArgs.url).toBe("https://api.pipedrive.com/api/v1/activities");
      expect(callArgs.options?.method).toBe("POST");

      const parsedBody = JSON.parse(callArgs.options?.body as string);
      expect(parsedBody.due_date).toBe("2026-11-09");
      expect(parsedBody.due_time).toBe("20:00");
    } finally {
      Date.prototype.toTimeString = originalToTimeString;
    }
  });

  it("sends due_time and due_date in UTC on updateEvent even when local timezone is non-UTC", async () => {
    const originalToTimeString = Date.prototype.toTimeString;
    vi.spyOn(Date.prototype, "toTimeString").mockReturnValue("01:30:00 GMT+0530 (India Standard Time)");

    try {
      const crm = BuildCrmService(mockCredential);
      const result = await crm.updateEvent("12345", mockEvent);

      expect(result.id).toBe("12345");
      expect(requestSpy).toHaveBeenCalledTimes(1);

      const callArgs = requestSpy.mock.calls[0][0];
      expect(callArgs.url).toBe("https://api.pipedrive.com/api/v1/activities/12345");
      expect(callArgs.options?.method).toBe("PUT");

      const parsedBody = JSON.parse(callArgs.options?.body as string);
      expect(parsedBody.due_date).toBe("2026-11-09");
      expect(parsedBody.due_time).toBe("20:00");
    } finally {
      Date.prototype.toTimeString = originalToTimeString;
    }
  });
});
