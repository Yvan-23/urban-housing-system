package com.urban.housing.controller;

import com.urban.housing.entity.Report;
import com.urban.housing.entity.User;
import com.urban.housing.repository.ReportRepository;
import com.urban.housing.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Report>> getReports() {
        List<Report> allReports = reportRepository.findAll();
        allReports.sort((r1, r2) -> r2.getCode().compareTo(r1.getCode()));
        return ResponseEntity.ok(allReports);
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateReport(@RequestBody Map<String, Object> request, Authentication auth) {
        String title = (String) request.getOrDefault("title", "New Ad-hoc Report");
        String format = (String) request.getOrDefault("format", "PDF");

        String author = "System Admin";
        if (auth != null) {
            User currentUser = userRepository.findByEmail(auth.getName()).orElse(null);
            if (currentUser != null) {
                author = currentUser.getName();
            }
        }

        long count = reportRepository.count();
        String code = "R-" + (101 + count);

        Report report = Report.builder()
                .id(UUID.randomUUID())
                .code(code)
                .title(title)
                .format(format)
                .createdDate(LocalDate.now().toString())
                .generatedBy(author)
                .build();

        reportRepository.save(report);
        return ResponseEntity.ok(report);
    }
}
