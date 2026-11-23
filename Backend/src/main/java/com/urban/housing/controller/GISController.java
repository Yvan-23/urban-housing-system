package com.urban.housing.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/api/maps")
public class GISController {

    @GetMapping("/districts")
    public ResponseEntity<?> getDistrictGeoJson() {
        Map<String, Object> geoJson = new HashMap<>();
        geoJson.put("type", "FeatureCollection");

        List<Map<String, Object>> features = new ArrayList<>();

        features.add(createFeature("Downtown Central", 30, -1.944078, 30.061885));
        features.add(createFeature("North Valley", 45, -1.914078, 30.081885));
        features.add(createFeature("East Meadows", 15, -1.964078, 30.111885));

        geoJson.put("features", features);
        return ResponseEntity.ok(geoJson);
    }

    private Map<String, Object> createFeature(String name, double value, double lat, double lon) {
        Map<String, Object> feature = new HashMap<>();
        feature.put("type", "Feature");

        Map<String, Object> properties = new HashMap<>();
        properties.put("name", name);
        properties.put("density", value);
        feature.put("properties", properties);

        Map<String, Object> geometry = new HashMap<>();
        geometry.put("type", "Point");
        geometry.put("coordinates", Arrays.asList(lon, lat));
        feature.put("geometry", geometry);

        return feature;
    }
}
