package com.urban.housing.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "kpis")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Kpi {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "actual_value")
    private Double actualValue;

    private String category;

    private String district;

    @Column(nullable = false)
    private String name;

    @Column(name = "target_value")
    private Double targetValue;

    private String unit;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "scenario_id")
    private Scenario scenario;
}
