package com.urban.housing.controller;

import com.urban.housing.entity.Comment;
import com.urban.housing.entity.User;
import com.urban.housing.entity.Workspace;
import com.urban.housing.repository.CommentRepository;
import com.urban.housing.repository.UserRepository;
import com.urban.housing.repository.WorkspaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/collaboration")
public class CollaborationController {

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/workspaces")
    public ResponseEntity<List<Workspace>> getWorkspaces() {
        return ResponseEntity.ok(workspaceRepository.findAll());
    }

    @PostMapping("/workspaces")
    public ResponseEntity<?> createWorkspace(@RequestBody Map<String, String> payload, Authentication auth) {
        String name = payload.get("name");
        String description = payload.get("description");

        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Workspace name is required");
        }

        User currentUser = null;
        if (auth != null) {
            currentUser = userRepository.findByEmail(auth.getName()).orElse(null);
        }

        Workspace ws = Workspace.builder()
                .id(UUID.randomUUID())
                .name(name)
                .description(description)
                .createdAt(LocalDateTime.now())
                .createdBy(currentUser)
                .build();

        workspaceRepository.save(ws);
        return ResponseEntity.ok(ws);
    }

    @GetMapping("/comments")
    public ResponseEntity<List<Comment>> getComments(@RequestParam(required = false) String workspaceId) {
        if (workspaceId != null && !workspaceId.trim().isEmpty()) {
            return ResponseEntity.ok(commentRepository.findByWorkspaceId(workspaceId));
        }
        return ResponseEntity.ok(commentRepository.findAll());
    }

    @PostMapping("/comments")
    public ResponseEntity<?> createComment(@RequestBody Map<String, String> payload, Authentication auth) {
        String workspaceId = payload.get("workspaceId");
        String text = payload.get("text");

        if (workspaceId == null || text == null || text.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Workspace ID and comment text are required");
        }

        String userName = "External User";
        String role = "Stakeholder";

        if (auth != null) {
            User currentUser = userRepository.findByEmail(auth.getName()).orElse(null);
            if (currentUser != null) {
                userName = currentUser.getName();
                role = currentUser.getRole();
                if ("System Administrator".equalsIgnoreCase(role)) {
                    role = "Administrator";
                }
            }
        } else if (payload.containsKey("user")) {
            userName = payload.get("user");
            if (payload.containsKey("role")) {
                role = payload.get("role");
            }
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        String timestamp = LocalDateTime.now().format(formatter);

        Comment comment = Comment.builder()
                .id(UUID.randomUUID())
                .workspaceId(workspaceId)
                .user(userName)
                .role(role)
                .text(text)
                .timestamp(timestamp)
                .build();

        commentRepository.save(comment);
        return ResponseEntity.ok(comment);
    }
}
