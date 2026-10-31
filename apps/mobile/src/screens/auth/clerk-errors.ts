import { isClerkAPIResponseError } from "@clerk/expo";

export function authErrorMessage(error: unknown): string {
  if (isClerkAPIResponseError(error)) {
    return error.errors[0]?.longMessage ?? error.errors[0]?.message ?? "Authentication failed. Please try again.";
  }
  return "We couldn't complete that request. Check your connection and try again.";
}

export function requireAuthSuccess(result: { error: unknown }): void {
  if (result.error) throw result.error;
}
