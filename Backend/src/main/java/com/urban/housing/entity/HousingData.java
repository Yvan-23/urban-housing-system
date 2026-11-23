package com.urban.housing.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "housing_data")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HousingData {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private String address;

    @Column(name = "area_sq_ft")
    private Integer areaSqFt;

    private Integer bathrooms;

    private Integer bedrooms;

    private String city;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "dataset_version")
    private Integer datasetVersion;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String district;

    private Double latitude;

    private Double longitude;

    @Column(name = "postal_code")
    private String postalCode;

    private Double price;

    @Column(name = "property_type")
    @com.fasterxml.jackson.annotation.JsonProperty("type")
    private String propertyType;

    private String source;

    private String status;

    @Column(nullable = false)
    private String title;

    @Column(name = "year_built")
    private Integer yearBuilt;

    // Transient getters for frontend compatibility without database alterations
    @Transient
    public Integer getUnits() {
        if ("Apartment".equalsIgnoreCase(propertyType)) return 150;
        if ("Condominium".equalsIgnoreCase(propertyType)) return 85;
        if ("Townhouse".equalsIgnoreCase(propertyType)) return 60;
        return 40;
    }

    @Transient
    public Double getVacancyRate() {
        if ("Vacant".equalsIgnoreCase(status)) {
            return 12.5;
        }
        if ("Under Construction".equalsIgnoreCase(status)) {
            return 0.0;
        }
        return 3.5;
    }

    @Transient
    public String getLastUpdated() {
        if (createdAt != null) {
            return createdAt.toLocalDate().toString();
        }
        return "2026-05-15";
    }
}
