package com.urban.housing.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private String code;
    private String title;
    private String format;
    
    @Column(name = "created_date")
    private String createdDate;
    
    @Column(name = "generated_by")
    private String generatedBy;
}
