
package com.smarthostel.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.Set;

@Service
public class NoticeFileService {

    private final Path uploadDirectory =
            Paths.get("uploads", "notices").toAbsolutePath().normalize();

    private static final Set<String> ALLOWED_TYPES = Set.of(
        "image/jpeg",
        "image/png"
    );

    public NoticeFileService() throws IOException {
        Files.createDirectories(uploadDirectory);
    }

    public String saveImage(MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please select an image.");
        }

        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException(
                "Only JPG, JPEG and PNG images are allowed."
            );
        }

        String originalName = file.getOriginalFilename();

        String extension = "";

        if (originalName != null && originalName.lastIndexOf('.') >= 0) {
            extension = originalName.substring(
                originalName.lastIndexOf('.')
            ).toLowerCase();
        }

        if (!Set.of(".jpg", ".jpeg", ".png").contains(extension)) {
            throw new IllegalArgumentException("Invalid image extension.");
        }

        String fileName = UUID.randomUUID() + extension;

        Path target = uploadDirectory.resolve(fileName).normalize();

        if (!target.startsWith(uploadDirectory)) {
            throw new IllegalArgumentException("Invalid file name.");
        }

        Files.copy(file.getInputStream(), target);

        return "/uploads/notices/" + fileName;
    }
}
