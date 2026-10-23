/**
 * useSessionTimeout.js
 *
 * Client-side inactivity session timeout hook with server-side JWT synchronization.
 *
 * - Reads the configured timeout from localStorage ("sessionTimeoutMinutes"),
 *   set at login from the server's admin settings.
 * - Resets the idle timer on user activity (mouse, keyboard, touch, scroll) with throttling.
 * - Automatically refreshes the backend JWT when the user is active, ensuring the
 *   JWT never expires while the user is actively working.
 * - Shows a warning dialog before expiry.
 * - On expiry, clears auth data and redirects to /login?reason=timeout.
 * - Synchronizes across browser tabs via the 'storage' event.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';

const WARNING_BEFORE_MS = 60 * 1000; // Show warning 60 seconds before logout
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
const ACTIVITY_THROTTLE_MS = 1000; // Only process activity at most once per second

export function useSessionTimeout() {
  const navigate = useNavigate();
  const location = useLocation();

  const logoutTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const warningShownRef = useRef(false);
  const countdownIntervalRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const lastRefreshTimeRef = useRef(Date.now());
  const isRefreshingRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const logout = useCallback((reason = 'manual') => {
    clearTimers();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('sessionTimeoutMinutes');
    delete axios.defaults.headers.common['Authorization'];
    warningShownRef.current = false;

    // Clean up warning dialog if visible
    const existing = document.getElementById('session-timeout-warning');
    if (existing) existing.remove();

    const redirectPath =
      reason === 'timeout'
        ? '/login?reason=timeout'
        : reason === 'maintenance'
        ? '/login?reason=maintenance'
        : '/login';

    navigate(redirectPath, { replace: true });
  }, [clearTimers, navigate]);

  // Request a fresh JWT token from backend
  const refreshToken = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token || isRefreshingRef.current) return;

    try {
      isRefreshingRef.current = true;
      const res = await axios.post(
        `${API_BASE_URL}/auth/refresh-token`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
        if (res.data.sessionTimeoutMinutes) {
          localStorage.setItem('sessionTimeoutMinutes', String(res.data.sessionTimeoutMinutes));
        }
        axios.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;
        lastRefreshTimeRef.current = Date.now();
      }
    } catch (err) {
      const status = err.response?.status;
      const isMaintenance = err.response?.data?.maintenance === true;
      if (status === 503 && isMaintenance) {
        logout('maintenance');
      } else if (status === 401) {
        logout('timeout');
      }
    } finally {
      isRefreshingRef.current = false;
    }
  }, [logout]);

  const showWarning = useCallback((timeoutMs, warningDurationMs) => {
    warningShownRef.current = true;

    // Remove any existing dialog first
    const existing = document.getElementById('session-timeout-warning');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'session-timeout-warning';
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 99999;
      background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    let remaining = Math.round(warningDurationMs / 1000);

    overlay.innerHTML = `
      <div style="
        background: white; border-radius: 16px; padding: 32px; max-width: 420px; width: 90%;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3); text-align: center;
      ">
        <div style="font-size: 48px; margin-bottom: 16px;">⏰</div>
        <h2 style="font-size: 20px; font-weight: 700; color: #1f2937; margin: 0 0 8px;">
          Session Expiring Soon
        </h2>
        <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px;">
          Your session will expire due to inactivity in
        </p>
        <p id="session-countdown" style="font-size: 28px; font-weight: 700; color: #f59e0b; margin: 0 0 24px;">
          ${remaining}s
        </p>
        <p style="font-size: 13px; color: #9ca3af; margin: 0 0 24px;">
          Move your mouse, press any key, or click below to stay logged in.
        </p>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button id="session-stay-btn" style="
            background: #f59e0b; color: white; border: none; border-radius: 10px;
            padding: 10px 24px; font-size: 14px; font-weight: 600; cursor: pointer;
            transition: background 0.2s;
          ">Stay Logged In</button>
          <button id="session-logout-btn" style="
            background: #f3f4f6; color: #374151; border: none; border-radius: 10px;
            padding: 10px 24px; font-size: 14px; font-weight: 600; cursor: pointer;
          ">Logout Now</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Countdown display
    const countdownEl = document.getElementById('session-countdown');
    countdownIntervalRef.current = setInterval(() => {
      remaining -= 1;
      if (countdownEl) countdownEl.textContent = `${Math.max(0, remaining)}s`;
      if (remaining <= 0) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }, 1000);

    // "Stay Logged In" resets the timer and refreshes backend JWT
    const stayBtn = document.getElementById('session-stay-btn');
    if (stayBtn) {
      stayBtn.addEventListener('click', () => {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        overlay.remove();
        warningShownRef.current = false;
        resetTimer();
        refreshToken();
      });
    }

    // "Logout Now" logs out immediately
    const logoutBtn = document.getElementById('session-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        overlay.remove();
        logout();
      });
    }
  }, [logout, refreshToken]);

  const resetTimer = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const timeoutMinutes = parseInt(localStorage.getItem('sessionTimeoutMinutes') || '30', 10);
    const timeoutMs = timeoutMinutes * 60 * 1000;

    // If warning was visible and user became active, dismiss it
    if (warningShownRef.current) {
      warningShownRef.current = false;
      const existing = document.getElementById('session-timeout-warning');
      if (existing) existing.remove();
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      // Proactively refresh token since user just returned from idle warning
      refreshToken();
    }

    clearTimers();

    const warningDurationMs = Math.min(WARNING_BEFORE_MS, timeoutMs / 2);
    const warningMs = Math.max(0, timeoutMs - warningDurationMs);

    if (warningMs > 0) {
      warningTimerRef.current = setTimeout(() => {
        showWarning(timeoutMs, warningDurationMs);
      }, warningMs);
    }

    logoutTimerRef.current = setTimeout(() => {
      logout('timeout');
    }, timeoutMs);
  }, [clearTimers, logout, showWarning, refreshToken]);

  // Handle throttled user activity
  const handleActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastActivityRef.current < ACTIVITY_THROTTLE_MS) {
      return;
    }
    lastActivityRef.current = now;

    resetTimer();

    // Check if the token is getting old (>= 50% through its validity window)
    const timeoutMinutes = parseInt(localStorage.getItem('sessionTimeoutMinutes') || '30', 10);
    const refreshThresholdMs = Math.max(60 * 1000, (timeoutMinutes * 60 * 1000) / 2);

    if (now - lastRefreshTimeRef.current >= refreshThresholdMs) {
      refreshToken();
    }
  }, [resetTimer, refreshToken]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      clearTimers();
      const existing = document.getElementById('session-timeout-warning');
      if (existing) existing.remove();
      return;
    }

    // Start or refresh timer on route transition / mount
    resetTimer();

    ACTIVITY_EVENTS.forEach((evt) => {
      window.addEventListener(evt, handleActivity, { passive: true });
    });

    // Multi-tab logout sync
    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        logout('timeout');
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearTimers();
      ACTIVITY_EVENTS.forEach((evt) => {
        window.removeEventListener(evt, handleActivity);
      });
      window.removeEventListener('storage', handleStorageChange);
      const existing = document.getElementById('session-timeout-warning');
      if (existing) existing.remove();
    };
  }, [location.pathname, resetTimer, handleActivity, clearTimers, logout]);
}
