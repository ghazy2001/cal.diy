/**
 * Retrieves and normalizes the list of blacklisted guest emails from the environment variable.
 * Handles comma-separated values, whitespace around entries, newlines, and case normalization.
 */
export const getBlacklistedGuestEmails = (): string[] => {
  const rawList = process.env.BLACKLISTED_GUEST_EMAILS;
  if (!rawList) return [];

  return rawList
    .split(/[,\r\n]+/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
};
