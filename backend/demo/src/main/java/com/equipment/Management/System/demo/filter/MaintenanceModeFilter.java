package com.equipment.Management.System.demo.filter;

import com.equipment.Management.System.demo.service.AdminSettingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

@Component
public class MaintenanceModeFilter extends OncePerRequestFilter {

    @Autowired
    private AdminSettingService adminSettingService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final Set<String> ALLOWED_PREFIXES = Set.of(
            "/auth",
            "/api/auth",
            "/api/admin/settings/maintenance-status",
            "/error",
            "/favicon.ico"
    );

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // Always allow CORS preflight requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        // Check if maintenance mode is active
        if (!adminSettingService.isMaintenanceActive()) {
            filterChain.doFilter(request, response);
            return;
        }

        // Strip any deployed context path so the allowlist works both locally
        // and when the application is hosted below a URL prefix.
        String requestUri = request.getRequestURI();
        String contextPath = request.getContextPath();
        String path = requestUri.startsWith(contextPath)
                ? requestUri.substring(contextPath.length())
                : requestUri;
        if (path.isBlank()) {
            path = "/";
        }

        // Allow public authentication & maintenance status endpoints
        for (String allowed : ALLOWED_PREFIXES) {
            if (path.startsWith(allowed)) {
                filterChain.doFilter(request, response);
                return;
            }
        }

        // Allow authorized administrators during maintenance
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            boolean isAdmin = auth.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .anyMatch(role -> role.equals("ROLE_ADMIN") || role.equals("ROLE_SUPER_ADMIN"));

            if (isAdmin) {
                filterChain.doFilter(request, response);
                return;
            }
        }

        // Block all ordinary users and non-admin requests with HTTP 503
        response.setStatus(HttpStatus.SERVICE_UNAVAILABLE.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        String maintenanceMessage = adminSettingService.getSettingsDTO().getMaintenanceMessage();
        if (maintenanceMessage == null || maintenanceMessage.isBlank()) {
            maintenanceMessage = "The system is currently undergoing scheduled maintenance. Please check back later.";
        }

        Map<String, Object> errorBody = Map.of(
                "status", HttpStatus.SERVICE_UNAVAILABLE.value(),
                "error", "Service Unavailable",
                "maintenance", true,
                "message", maintenanceMessage
        );

        response.getWriter().write(objectMapper.writeValueAsString(errorBody));
    }
}
