import { useState, useEffect } from 'react';

function setCookie(name, value) {
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax; Secure`;
}

function getCookie(name) {
  if (typeof document === 'undefined') {
    return null;
  }
  const cookieArr = document.cookie.split('; ');
  for (const cookie of cookieArr) {
    const [cookieName, cookieValue] = cookie.split('=');
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
}

function parse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

// --- starts with `initialValue` so the first render matches the pre-rendered page; the cookie is applied after hydration
export function useCookieState(key, initialValue) {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    const cookieValue = getCookie(key);
    if (cookieValue !== null) {
      setState(parse(cookieValue));
      setCookie(key, cookieValue);
    }
  }, [key]);

  const update = (value) => {
    setCookie(key, JSON.stringify(value));
    setState(value);
  };

  return [state, update];
}
