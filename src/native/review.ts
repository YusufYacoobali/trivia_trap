import * as StoreReview from 'expo-store-review';

// In-app review pacing: prompt at most once every other day (48h), and only
// at a natural moment (right after finishing a round). Returns the new
// lastReviewRequest timestamp if a prompt was shown, otherwise undefined.

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

export function isReviewDue(lastReviewRequest: number | undefined, now = Date.now()): boolean {
  if (!lastReviewRequest) return true;
  return now - lastReviewRequest >= TWO_DAYS_MS;
}

export async function maybeRequestReview(
  lastReviewRequest: number | undefined,
): Promise<number | undefined> {
  try {
    if (!isReviewDue(lastReviewRequest)) return undefined;
    const available = await StoreReview.isAvailableAsync();
    if (!available) return undefined;
    const hasAction = await StoreReview.hasAction();
    if (!hasAction) return undefined;

    await StoreReview.requestReview();
    return Date.now();
  } catch {
    return undefined;
  }
}
