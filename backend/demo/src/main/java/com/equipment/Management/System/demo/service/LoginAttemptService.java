package com.equipment.Management.System.demo.service;

import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    private static final int MAX_ATTEMPTS = 5;
    private static final long LOCK_TIME_MS = 5 * 60 * 1000; // 5 minutes

    private final ConcurrentHashMap<String, Integer> attempts = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Long> lockUntil = new ConcurrentHashMap<>();

    public boolean isBlocked(String key) {
        Long until = lockUntil.get(key);
        if (until == null) return false;

        // If lock expired, clear it
        if (System.currentTimeMillis() > until) {
            lockUntil.remove(key);
            attempts.remove(key);
            return false;
        }
        return true;
    }

    public long remainingLockMs(String key) {
        Long until = lockUntil.get(key);
        if (until == null) return 0;
        return Math.max(0, until - System.currentTimeMillis());
    }

    public void loginFailed(String key) {
        int count = attempts.getOrDefault(key, 0) + 1;
        attempts.put(key, count);

        if (count >= MAX_ATTEMPTS) {
            lockUntil.put(key, System.currentTimeMillis() + LOCK_TIME_MS);
        }
    }

    public void loginSucceeded(String key) {
        attempts.remove(key);
        lockUntil.remove(key);
    }
}
