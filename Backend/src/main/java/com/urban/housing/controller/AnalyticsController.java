package com.urban.housing.controller;

import com.urban.housing.entity.HousingData;
import com.urban.housing.repository.HousingDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private HousingDataRepository housingDataRepository;

    @GetMapping("/forecast")
    public ResponseEntity<?> getForecast(@RequestParam(defaultValue = "All") String district, @RequestParam(defaultValue = "5") int years) {
        List<HousingData> records;
        if (district != null && !district.equalsIgnoreCase("All")) {
            records = housingDataRepository.findByDistrict(district);
        } else {
            records = housingDataRepository.findAll();
        }

        // Calculate actual base supply and demand from database records
        double totalUnits = records.stream().mapToDouble(r -> r.getUnits() != null ? r.getUnits() : 40.0).sum();
        double occupiedUnits = records.stream()
                .filter(r -> "Occupied".equalsIgnoreCase(r.getStatus()))
                .mapToDouble(r -> r.getUnits() != null ? r.getUnits() : 40.0)
                .sum();
        
        // Base supply is the actual units in the database
        double baseSupply = totalUnits;
        // Base demand can be estimated: occupied units + 12% growth/buffer
        double baseDemand = occupiedUnits * 1.12;
        if (baseDemand < baseSupply) {
            baseDemand = baseSupply * 1.05; // default buffer
        }

        List<Map<String, Object>> forecastData = new ArrayList<>();
        int currentYear = 2026;
        
        for (int i = 0; i <= years; i++) {
            Map<String, Object> dataPoint = new HashMap<>();
            int year = currentYear + i;
            dataPoint.put("year", String.valueOf(year));
            
            // Grow demand and supply using standard growth models, starting from database base values
            double yearDemand = baseDemand * Math.pow(1.045, i);
            double yearSupply = baseSupply * Math.pow(1.038, i);
            
            dataPoint.put("demand", Math.round(yearDemand));
            dataPoint.put("supply", Math.round(yearSupply));
            forecastData.add(dataPoint);
        }
        
        return ResponseEntity.ok(forecastData);
    }
}
