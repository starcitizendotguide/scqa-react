import { useState, useEffect } from 'react';

function setCookie(name, value) {
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax; Secure`;
}

function getCookie(name) {
  const cookieArr = document.cookie.split('; ');
  for (const cookie of cookieArr) {
    const [cookieName, cookieValue] = cookie.split('=');
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
}

export function useCookieState(key, initialValue) {
  const [state, setState] = useState(() => {
    const cookieValue = getCookie(key);
    if (cookieValue !== null) {
      try {
        return JSON.parse(cookieValue);
      } catch {
        return cookieValue; 
      }
    }
    return initialValue;
  });

  useEffect(() => {
    setCookie(key, JSON.stringify(state)); 
  }, [key, state]);

  return [state, setState];
}
