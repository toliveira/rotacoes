import { getFirebaseClientApp } from "./firebaseClient";
import { isSupported, getAnalytics } from "firebase/analytics";
import { getPerformance } from "firebase/performance";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

export async function initFirebaseClientEnhancers() {
  if (typeof window === "undefined") return;
  const app = getFirebaseClientApp();

  try {
    const supported = await isSupported();
    if (supported) getAnalytics(app);
  } catch {}

  try {
    getPerformance(app);
  } catch {}

  const key = process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_KEY;
  if (key) {
    try {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(key),
        isTokenAutoRefreshEnabled: true,
      });
    } catch {}
  }
}

