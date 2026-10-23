package com.equipment.Management.System.demo.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    private static final String SECRET =
            "equipment_secret_key_123456789012345678901234567890";

    private final Key SECRET_KEY = Keys.hmacShaKeyFor(SECRET.getBytes());

    public String generateToken(String username, String role) {
        return generateToken(username, role, 30);
    }

    public String generateToken(String username, String role, int expirationMinutes) {
        if (expirationMinutes <= 0) {
            expirationMinutes = 30;
        }
        String normalizedRole = role == null ? "" : role.trim().toUpperCase();
        if (normalizedRole.startsWith("ROLE_")) {
            normalizedRole = normalizedRole.substring("ROLE_".length());
        }
        logger.info("Generating token for username: {} with role: {}, expiration: {} minutes", username, role, expirationMinutes);
        long expirationMillis = (long) expirationMinutes * 60 * 1000;
        return Jwts.builder()
                .setSubject(username)
                .claim("role", normalizedRole)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMillis))
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
                .compact();
    }

    // Extract username
    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    // Extract role (USED BY JwtFilter)
    public String extractRole(String token) {
        String role = extractAllClaims(token).get("role", String.class);
        logger.debug("Extracted role from token: {}", role);
        return role;
    }

    // Validate token
    public boolean validateToken(String token, String username) {
        try {
            final String extractedUsername = extractUsername(token);
            boolean isValid = extractedUsername.equals(username) && !isTokenExpired(token);
            logger.debug("Token validation for user {}: {}", username, isValid);
            return isValid;
        } catch (Exception e) {
            logger.error("Token validation failed", e);
            return false;
        }
    }

    // MUST be public (used internally + by extractRole)
    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private boolean isTokenExpired(String token) {
        return extractAllClaims(token)
                .getExpiration()
                .before(new Date());
    }
}