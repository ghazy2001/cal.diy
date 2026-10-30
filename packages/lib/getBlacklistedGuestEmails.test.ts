import { afterEach, describe, expect, it } from "vitest";

import { getBlacklistedGuestEmails } from "./getBlacklistedGuestEmails";

describe("getBlacklistedGuestEmails", () => {
  const originalEnv = process.env.BLACKLISTED_GUEST_EMAILS;

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.BLACKLISTED_GUEST_EMAILS = originalEnv;
    } else {
      delete process.env.BLACKLISTED_GUEST_EMAILS;
    }
  });

  it("returns an empty array when env var is not set", () => {
    delete process.env.BLACKLISTED_GUEST_EMAILS;
    expect(getBlacklistedGuestEmails()).toEqual([]);
  });

  it("returns an empty array when env var is an empty string", () => {
    process.env.BLACKLISTED_GUEST_EMAILS = "";
    expect(getBlacklistedGuestEmails()).toEqual([]);
  });

  it("returns an empty array when env var contains only whitespace and commas", () => {
    process.env.BLACKLISTED_GUEST_EMAILS = "  ,  ,   ";
    expect(getBlacklistedGuestEmails()).toEqual([]);
  });

  it("trims whitespace around entries and converts to lowercase", () => {
    process.env.BLACKLISTED_GUEST_EMAILS = "  Blocked@Example.com , OTHER@SPAM.COM  ,bad@domain.com  ";
    expect(getBlacklistedGuestEmails()).toEqual([
      "blocked@example.com",
      "other@spam.com",
      "bad@domain.com",
    ]);
  });

  it("handles newline and comma separated entries and ignores empty items", () => {
    process.env.BLACKLISTED_GUEST_EMAILS = "first@spam.com\nsecond@spam.com,\r\n third@spam.com ,, ";
    expect(getBlacklistedGuestEmails()).toEqual([
      "first@spam.com",
      "second@spam.com",
      "third@spam.com",
    ]);
  });
});
