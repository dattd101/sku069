"use client";

import { useEffect } from "react";

const DEFAULT_REDIRECT_MINUTES = 180;
const DEFAULT_REDIRECT_URL = "https://www.youtube.com/@trannguyenanhduong0803";
const SESSION_STARTED_KEY = "movie_blog_session_started_at";

function getRedirectMinutes() {
  const value = Number(process.env.NEXT_PUBLIC_SESSION_REDIRECT_MINUTES);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_REDIRECT_MINUTES;
}

function getRedirectUrl() {
  return process.env.NEXT_PUBLIC_SESSION_REDIRECT_URL || DEFAULT_REDIRECT_URL;
}

export default function SessionRedirect() {
  useEffect(() => {
    const redirectAfterMs = getRedirectMinutes() * 60 * 1000;
    const redirectUrl = getRedirectUrl();

    let startedAt = Number(sessionStorage.getItem(SESSION_STARTED_KEY));

    if (!Number.isFinite(startedAt) || startedAt <= 0 || startedAt > Date.now()) {
      startedAt = Date.now();
      sessionStorage.setItem(SESSION_STARTED_KEY, String(startedAt));
    }

    const redirectIfExpired = () => {
      const elapsed = Date.now() - startedAt;
      if (elapsed >= redirectAfterMs) {
        window.location.replace(redirectUrl);
        return true;
      }
      return false;
    };

    if (redirectIfExpired()) return;

    const remaining = Math.max(0, redirectAfterMs - (Date.now() - startedAt));
    const timer = window.setTimeout(() => {
      window.location.replace(redirectUrl);
    }, remaining);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        redirectIfExpired();
      }
    };

    window.addEventListener("focus", redirectIfExpired);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", redirectIfExpired);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
