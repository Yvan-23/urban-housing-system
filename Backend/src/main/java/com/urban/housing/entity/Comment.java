package com.urban.housing.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "comments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "workspace_id", nullable = false)
    private String workspaceId;

    @Column(name = "user_name", nullable = false)
    private String user;

    private String role;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String text;

    private String timestamp;
}
