export const COOKIE_CONSENT_VERSION = 1;
export const COOKIE_CONSENT_STORAGE_KEY = "cookie-consent-preferences";
export const COOKIE_CONSENT_OPEN_EVENT = "cookie-consent:open-preferences";
export const COOKIE_CONSENT_CHANGE_EVENT = "cookie-consent:changed";

export type CookieConsentCategory = "analytics" | "marketing";

export type CookieConsentPreferences = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

export type CookieConsentRecord = {
  version: number;
  updatedAt: string;
  preferences: CookieConsentPreferences;
};

export const DEFAULT_COOKIE_CONSENT_PREFERENCES: CookieConsentPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

export function createCookieConsentRecord(
  preferences: Partial<Omit<CookieConsentPreferences, "necessary">> = {}
): CookieConsentRecord {
  return {
    version: COOKIE_CONSENT_VERSION,
    updatedAt: new Date().toISOString(),
    preferences: {
      ...DEFAULT_COOKIE_CONSENT_PREFERENCES,
      ...preferences,
      necessary: true,
    },
  };
}

export function parseCookieConsent(rawValue: string | null): CookieConsentRecord | null {
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue) as Partial<CookieConsentRecord>;

    if (!parsed || parsed.version !== COOKIE_CONSENT_VERSION || !parsed.preferences) {
      return null;
    }

    return createCookieConsentRecord({
      analytics: Boolean(parsed.preferences.analytics),
      marketing: Boolean(parsed.preferences.marketing),
    });
  } catch {
    return null;
  }
}

export function readCookieConsent(): CookieConsentRecord | null {
  if (typeof window === "undefined") return null;

  return parseCookieConsent(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY));
}

export function writeCookieConsent(record: CookieConsentRecord) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(record));
  window.dispatchEvent(
    new CustomEvent(COOKIE_CONSENT_CHANGE_EVENT, {
      detail: record,
    })
  );
}

export function openCookiePreferences() {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new Event(COOKIE_CONSENT_OPEN_EVENT));
}

export function hasCookieConsent(category: CookieConsentCategory): boolean {
  const consent = readCookieConsent();

  return consent?.preferences[category] ?? false;
}