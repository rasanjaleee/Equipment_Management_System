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
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // Public endpoints
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/uploads/**").permitAll()

                        // Preflight requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Admin management
                        .requestMatchers("/api/admin/**").hasRole("SUPER_ADMIN")

                        // Equipment
                        .requestMatchers(HttpMethod.GET, "/api/equipment/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/equipment/**").hasAnyRole("SUPER_ADMIN", "ADMIN", "TECHNICIAN")
                        .requestMatchers(HttpMethod.PUT, "/api/equipment/**").hasAnyRole("SUPER_ADMIN", "ADMIN", "TECHNICIAN")
                        .requestMatchers(HttpMethod.DELETE, "/api/equipment/**").hasAnyRole("SUPER_ADMIN", "ADMIN", "TECHNICIAN")

                        // Activity logs
                        .requestMatchers(HttpMethod.GET, "/api/activity-logs/**").hasAnyRole("SUPER_ADMIN", "ADMIN", "TECHNICIAN")

                        // Issuances
                        .requestMatchers(HttpMethod.GET, "/api/issuances/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/issuances/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/issuances/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/issuances/**").hasRole("ADMIN")

                        // Borrow requests
                        .requestMatchers(HttpMethod.GET, "/api/borrow-requests/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/borrow-requests/**").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/borrow-requests/**").hasRole("ADMIN")

                        // Maintenance
                        .requestMatchers(HttpMethod.GET, "/api/maintenance/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/maintenance/**").hasAnyRole("SUPER_ADMIN", "ADMIN", "TECHNICIAN")
                        .requestMatchers(HttpMethod.PUT, "/api/maintenance/**").hasAnyRole("SUPER_ADMIN", "ADMIN", "TECHNICIAN")
                        .requestMatchers(HttpMethod.DELETE, "/api/maintenance/**").hasAnyRole("SUPER_ADMIN", "ADMIN", "TECHNICIAN")

                        // Reports
                        .requestMatchers(HttpMethod.GET, "/api/reports/**").hasAnyRole("SUPER_ADMIN", "ADMIN")

                        // Everything else
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .formLogin(form -> form.disable());

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://localhost:3000"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(false);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}