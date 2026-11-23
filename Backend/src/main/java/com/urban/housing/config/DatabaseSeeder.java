package com.urban.housing.config;

import com.urban.housing.entity.User;
import com.urban.housing.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private HousingDataRepository housingDataRepository;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private ScenarioRepository scenarioRepository;

    @Autowired
    private KpiRepository kpiRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {

        // ─────────────────────────────────────────────────────────────────────
        // STEP 1: Remove ALL previously seeded demo data
        // ─────────────────────────────────────────────────────────────────────
        auditLogRepository.deleteAll();
        commentRepository.deleteAll();
        taskRepository.deleteAll();
        kpiRepository.deleteAll();
        workspaceRepository.deleteAll();
        scenarioRepository.deleteAll();
        reportRepository.deleteAll();
        housingDataRepository.deleteAll();

        // ─────────────────────────────────────────────────────────────────────
        // STEP 2: Remove ALL users from the database to clean out any old test accounts
        // ─────────────────────────────────────────────────────────────────────
        userRepository.deleteAll();

        // ─────────────────────────────────────────────────────────────────────
        // STEP 3: Ensure one System Admin account exists for initial login
        // ─────────────────────────────────────────────────────────────────────
        if (!userRepository.existsByEmail("admin@urbanai.gov")) {
            userRepository.save(User.builder()
                    .id(UUID.randomUUID())
                    .name("System Admin")
                    .email("admin@urbanai.gov")
                    .password(passwordEncoder.encode("password123"))
                    .role("System Administrator")
                    .failedLoginAttempts(0)
                    .isLocked(false)
                    .isMfaEnabled(false)
                    .build());
        }

        // Ensure admin password is always correct
        userRepository.findByEmail("admin@urbanai.gov").ifPresent(user -> {
            user.setPassword(passwordEncoder.encode("password123"));
            userRepository.save(user);
        });

        System.out.println("✅ Database clean: demo data & demo users removed. Only real users remain.");
    }
}
