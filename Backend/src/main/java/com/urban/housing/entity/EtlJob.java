package com.urban.housing.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "etl_jobs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EtlJob {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "error_details", columnDefinition = "TEXT")
    private String errorDetails;

    @Column(name = "records_processed")
    private Integer recordsProcessed;

    @Column(name = "source_name", nullable = false)
    private String sourceName;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    private String status;
}
