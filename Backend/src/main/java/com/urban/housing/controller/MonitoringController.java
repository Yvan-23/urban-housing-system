package com.urban.housing.controller;

import com.urban.housing.entity.Kpi;
import com.urban.housing.repository.KpiRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/monitoring")
public class MonitoringController {

    @Autowired
    private KpiRepository kpiRepository;

    @GetMapping("/kpis")
    public ResponseEntity<List<Kpi>> getKpis() {
        return ResponseEntity.ok(kpiRepository.findAll());
    }
}
