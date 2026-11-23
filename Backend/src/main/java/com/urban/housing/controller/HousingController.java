package com.urban.housing.controller;

import com.urban.housing.entity.HousingData;
import com.urban.housing.repository.HousingDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/housing")
public class HousingController {

    @Autowired
    private HousingDataRepository housingDataRepository;

    @GetMapping
    public ResponseEntity<List<HousingData>> getHousingData(@RequestParam(required = false) String district) {
        if (district != null && !district.equalsIgnoreCase("All")) {
            return ResponseEntity.ok(housingDataRepository.findByDistrict(district));
        }
        return ResponseEntity.ok(housingDataRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<HousingData> createHousingRecord(@RequestBody HousingData record) {
        if (record.getId() == null) {
            record.setId(UUID.randomUUID());
        }
        if (record.getCreatedAt() == null) {
            record.setCreatedAt(java.time.LocalDateTime.now());
        }
        if (record.getDatasetVersion() == null) {
            record.setDatasetVersion(1);
        }
        HousingData saved = housingDataRepository.save(record);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDataset(@RequestParam("file") MultipartFile file, @RequestParam(required = false) String uploadedBy) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please upload a file");
        }

        List<HousingData> records = new ArrayList<>();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            boolean isHeader = true;
            while ((line = br.readLine()) != null) {
                if (isHeader) {
                    isHeader = false;
                    continue; // Skip CSV Header
                }
                
                String[] values = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
                if (values.length >= 5) {
                    HousingData data = HousingData.builder()
                            .id(UUID.randomUUID())
                            .title(clean(values[0]))
                            .price(tryParseDouble(values[1], 150000.0))
                            .district(clean(values[2]))
                            .propertyType(clean(values[3]))
                            .status(clean(values[4]))
                            .createdAt(LocalDateTime.now())
                            .datasetVersion(1)
                            .build();
                    records.add(data);
                }
            }

            housingDataRepository.saveAll(records);
            return ResponseEntity.ok(records);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error parsing CSV: " + e.getMessage());
        }
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearHousingData() {
        housingDataRepository.deleteAll();
        return ResponseEntity.ok("All housing records have been cleared.");
    }

    private String clean(String str) {
        if (str == null) return "";
        return str.replace("\"", "").trim();
    }

    private Double tryParseDouble(String str, Double fallback) {
        try {
            return Double.parseDouble(clean(str));
        } catch (Exception e) {
            return fallback;
        }
    }
}
