package com.urban.housing.controller;

import com.urban.housing.entity.Scenario;
import com.urban.housing.entity.User;
import com.urban.housing.repository.ScenarioRepository;
import com.urban.housing.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/policy")
public class PolicyController {

    @Autowired
    private ScenarioRepository scenarioRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @GetMapping("/scenarios")
    public ResponseEntity<List<Scenario>> getAllScenarios() {
        return ResponseEntity.ok(scenarioRepository.findAll());
    }

    @PostMapping("/simulate")
    public ResponseEntity<?> runSimulation(@RequestBody Map<String, Object> payload, Authentication auth) {
        String name = (String) payload.getOrDefault("name", "New Scenario " + System.currentTimeMillis());
        String description = (String) payload.getOrDefault("description", "Policy simulation run");
        
        double growthRate = Double.parseDouble(payload.getOrDefault("growthRate", "2.5").toString());
        double budget = Double.parseDouble(payload.getOrDefault("budget", "150").toString());
        boolean ecoFriendly = Boolean.parseBoolean(payload.getOrDefault("ecoFriendly", "false").toString());

        double projectedDeficit = (growthRate * 1200) - (budget * 5.2);
        if (ecoFriendly) {
            projectedDeficit += 100;
        }

        Map<String, Object> results = new HashMap<>();
        results.put("housingDeficitReduction", Math.max(0, Math.round(5000 - projectedDeficit)));
        results.put("requiredInfrastructureMUSD", budget * 0.35);
        results.put("estimatedTimeframeYears", ecoFriendly ? 6 : 4);
        results.put("sustainabilityIndex", ecoFriendly ? 92.5 : 55.0);

        String username = auth.getName();
        User currentUser = userRepository.findByEmail(username).orElse(null);

        String paramsJson = "";
        String resultsJson = "";
        try {
            paramsJson = objectMapper.writeValueAsString(payload);
            resultsJson = objectMapper.writeValueAsString(results);
        } catch (Exception e) {
            paramsJson = payload.toString();
            resultsJson = results.toString();
        }

        Scenario scenario = Scenario.builder()
                .id(UUID.randomUUID())
                .name(name)
                .description(description)
                .parameters(paramsJson)
                .results(resultsJson)
                .status("Completed")
                .createdAt(LocalDateTime.now())
                .createdBy(currentUser)
                .build();

        scenarioRepository.save(scenario);

        return ResponseEntity.ok(scenario);
    }

    @GetMapping("/simulate/{id}")
    public ResponseEntity<?> getSimulationResult(@PathVariable UUID id) {
        Scenario scenario = scenarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Scenario not found"));
        return ResponseEntity.ok(scenario);
    }

    @DeleteMapping("/scenarios/{id}")
    public ResponseEntity<?> deleteScenario(@PathVariable UUID id) {
        scenarioRepository.deleteById(id);
        return ResponseEntity.ok("Scenario deleted successfully");
    }

    @PutMapping("/scenarios/{id}/status")
    public ResponseEntity<?> updateScenarioStatus(@PathVariable UUID id, @RequestBody Map<String, String> payload) {
        Scenario scenario = scenarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Scenario not found"));
        String status = payload.get("status");
        if (status != null) {
            scenario.setStatus(status);
            scenarioRepository.save(scenario);
        }
        return ResponseEntity.ok(scenario);
    }
}
