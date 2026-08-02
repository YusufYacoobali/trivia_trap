import * as StoreReview from 'expo-store-review';

/**
 * Thin wrapper over the native in-app review prompt.
 *
 * All the "should we ask" policy lives in src/game/rating.ts - this file only
 * knows how to ask. Keeping them apart means the placement rules stay testable
 * without a device, since StoreReview no-ops everywhere except a real build.
 */
export async function requestNativeReview(): Promise<boolean> {
  try {
    if (!(await StoreReview.isAvailableAsync())) return false;
    // hasAction() is false when there is no store to point at (Expo Go, some
    // sideloaded builds), in which case requesting would be a silent no-op.
    if (!(await StoreReview.hasAction())) return false;
    await StoreReview.requestReview();
    return true;
  } catch {
    return false;
  }
}

/** Store listing to open when someone wants to leave a review by hand. */
export async function openStoreListing(): Promise<void> {
  try {
    const url = await StoreReview.storeUrl();
    if (!url) return;
    const { Linking } = await import('react-native');
    await Linking.openURL(url);
  } catch {
    // nothing to do - the caller already thanked them
  }
}
