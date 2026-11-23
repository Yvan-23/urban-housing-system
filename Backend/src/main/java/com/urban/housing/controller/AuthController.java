package com.urban.housing.controller;

import com.urban.housing.dto.LoginRequest;
import com.urban.housing.dto.LoginResponse;
import com.urban.housing.dto.RegisterRequest;
import com.urban.housing.entity.User;
import com.urban.housing.repository.UserRepository;
import com.urban.housing.security.JwtTokenUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        final String token = jwtTokenUtil.generateToken(userDetails);

        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();

        // Normalize roles: if DB role is "System Administrator", return "Administrator" for frontend compatibility
        String role = user.getRole();
        if ("System Administrator".equalsIgnoreCase(role)) {
            role = "Administrator";
        }

        return ResponseEntity.ok(new LoginResponse(
                token,
                user.getEmail(),
                user.getName(),
                role
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email is already in use");
        }

        String role = request.getRole();
        if ("Administrator".equalsIgnoreCase(role)) {
            role = "System Administrator";
        }

        User user = User.builder()
                .id(UUID.randomUUID())
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .department(request.getDepartment())
                .organization(request.getOrganization())
                .phone(request.getPhone())
                .failedLoginAttempts(0)
                .isLocked(false)
                .isMfaEnabled(false)
                .build();

        userRepository.save(user);

        return ResponseEntity.ok("Registration successful! You can now log in.");
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestHeader("Authorization") String authorizationHeader) {
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7);
            String username = jwtTokenUtil.getUsernameFromToken(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (jwtTokenUtil.validateToken(token, userDetails)) {
                String newToken = jwtTokenUtil.generateToken(userDetails);
                User user = userRepository.findByEmail(username).orElseThrow();
                
                String role = user.getRole();
                if ("System Administrator".equalsIgnoreCase(role)) {
                    role = "Administrator";
                }

                return ResponseEntity.ok(new LoginResponse(
                        newToken,
                        user.getEmail(),
                        user.getName(),
                        role
                ));
            }
        }
        return ResponseEntity.badRequest().body("Invalid or expired token");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String email, @RequestParam String newPassword) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null) {
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            return ResponseEntity.ok("Password reset successful.");
        }
        return ResponseEntity.badRequest().body("User not found.");
    }
}
