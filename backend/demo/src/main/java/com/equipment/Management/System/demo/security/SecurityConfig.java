package com.equipment.Management.System.demo.security;

import com.equipment.Management.System.demo.filter.JwtFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@EnableMethodSecurity
@Configuration
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth

                        // PUBLIC
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // LAB APIs
                        .requestMatchers("/api/lab/**").permitAll()

                        // ADMIN
                        .requestMatchers("/api/admin/**").hasAnyRole("SUPER_ADMIN", "ADMIN")

                        // EQUIPMENT (Public read for QR scans/catalog, restricted write)
                        .requestMatchers(HttpMethod.GET, "/api/equipment/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/equipment/**").hasAnyRole("SUPER_ADMIN", "ADMIN", "TECHNICIAN")
                        .requestMatchers(HttpMethod.PUT, "/api/equipment/**").hasAnyRole("SUPER_ADMIN", "ADMIN", "TECHNICIAN")
                        .requestMatchers(HttpMethod.DELETE, "/api/equipment/**").hasAnyRole("SUPER_ADMIN", "ADMIN", "TECHNICIAN")

                        // EQUIPMENT ACCESSORIES
                        .requestMatchers(HttpMethod.GET, "/api/equipment-accessories/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/equipment-accessories/**")
                        .hasAnyRole("SUPER_ADMIN", "ADMIN", "TECHNICIAN")
                        .requestMatchers(HttpMethod.PUT, "/api/equipment-accessories/**")
                        .hasAnyRole("SUPER_ADMIN", "ADMIN", "TECHNICIAN")
                        .requestMatchers(HttpMethod.DELETE, "/api/equipment-accessories/**")
                        .hasAnyRole("SUPER_ADMIN", "ADMIN", "TECHNICIAN")

                        // MAINTENANCE
                        .requestMatchers(HttpMethod.GET, "/api/maintenance/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/maintenance/**").hasAnyRole("SUPER_ADMIN", "ADMIN", "TECHNICIAN")
                        .requestMatchers(HttpMethod.PUT, "/api/maintenance/**").hasAnyRole("SUPER_ADMIN", "ADMIN", "TECHNICIAN")
                        .requestMatchers(HttpMethod.DELETE, "/api/maintenance/**").hasAnyRole("SUPER_ADMIN", "ADMIN", "TECHNICIAN")

                        // ACTIVITY LOGS
                        .requestMatchers(HttpMethod.GET, "/api/activity-logs/**").hasAnyRole("SUPER_ADMIN", "ADMIN", "TECHNICIAN")

                                // ISSUANCES

// Logged-in user can view only their own issuances
                                .requestMatchers(HttpMethod.GET, "/api/issuances/my")
                                .authenticated()

// Admins can view all other issuance endpoints
                                .requestMatchers(HttpMethod.GET, "/api/issuances/**")
                                .hasAnyRole("SUPER_ADMIN", "ADMIN")

                                .requestMatchers(HttpMethod.POST, "/api/issuances/**")
                                .hasAnyRole("SUPER_ADMIN", "ADMIN")

                                .requestMatchers(HttpMethod.PUT, "/api/issuances/**")
                                .hasAnyRole("SUPER_ADMIN", "ADMIN")

                                .requestMatchers(HttpMethod.DELETE, "/api/issuances/**")
                                .hasAnyRole("SUPER_ADMIN", "ADMIN")

                                // BORROW REQUESTS

// Logged-in users can view their own borrow requests
                                .requestMatchers(HttpMethod.GET, "/api/borrow-requests/my")
                                .authenticated()

// Only admins can view all borrow requests
                                .requestMatchers(HttpMethod.GET, "/api/borrow-requests/**")
                                .hasAnyRole("SUPER_ADMIN", "ADMIN")

// Logged-in users can create borrow requests
                                .requestMatchers(HttpMethod.POST, "/api/borrow-requests/**")
                                .authenticated()

// Only admins can approve/reject requests
                                .requestMatchers(HttpMethod.PATCH, "/api/borrow-requests/**")
                                .hasAnyRole("SUPER_ADMIN", "ADMIN")

                        // REPORTS
                        .requestMatchers(HttpMethod.GET, "/api/reports/**").hasAnyRole("SUPER_ADMIN", "ADMIN")

                        // NOTIFICATIONS
                        .requestMatchers(HttpMethod.GET, "/api/notifications/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/notifications/**").authenticated()

                        .anyRequest().authenticated()
                )

                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .formLogin(form -> form.disable());

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOriginPatterns(List.of(
                "http://localhost:*",
                "https://*.choreoapps.dev",
                "https://*.choreo.org",
                "https://*.vercel.app",
                "https://*.onrender.com"
        ));

        configuration.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));

        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}