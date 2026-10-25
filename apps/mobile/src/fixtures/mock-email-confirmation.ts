// Temporary UI preview only: no email delivery, account, or authenticated session.
export const mockEmailConfirmation = { code: "123456" } as const;

export function isPreviewEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
