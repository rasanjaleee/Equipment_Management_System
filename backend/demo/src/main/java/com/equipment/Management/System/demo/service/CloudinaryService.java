package com.equipment.Management.System.demo.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

@Service
public class CloudinaryService {

    private static final Logger logger = LoggerFactory.getLogger(CloudinaryService.class);

    private final Cloudinary cloudinary;

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    private static final String LOCAL_UPLOAD_DIR = "uploads/";

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public boolean isConfigured() {
        return cloudName != null && !cloudName.trim().isEmpty();
    }

    /**
     * Uploads a MultipartFile (e.g., equipment photo, profile image)
     * If Cloudinary is configured, uploads to Cloudinary and returns secure HTTPS URL.
     * Otherwise, falls back to local uploads/ folder.
     */
    public String uploadImage(MultipartFile file, String folder) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }

        if (isConfigured()) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> uploadResult = cloudinary.uploader().upload(
                        file.getBytes(),
                        ObjectUtils.asMap(
                                "folder", folder != null ? folder : "equipment",
                                "resource_type", "image"
                        )
                );
                String secureUrl = (String) uploadResult.get("secure_url");
                logger.info("Uploaded image to Cloudinary: {}", secureUrl);
                return secureUrl;
            } catch (Exception e) {
                logger.error("Cloudinary upload failed, falling back to local storage: {}", e.getMessage());
            }
        }

        // Local fallback
        Files.createDirectories(Paths.get(LOCAL_UPLOAD_DIR));
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(LOCAL_UPLOAD_DIR + fileName);
        Files.write(filePath, file.getBytes());
        return filePath.toString();
    }

    /**
     * Uploads raw bytes (e.g., generated QR Code PNG)
     * If Cloudinary is configured, uploads to Cloudinary and returns secure HTTPS URL.
     * Otherwise, falls back to local uploads/qrcodes/ folder.
     */
    public String uploadBytes(byte[] imageBytes, String folder, String fileName) throws IOException {
        if (imageBytes == null || imageBytes.length == 0) {
            return null;
        }

        if (isConfigured()) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> uploadResult = cloudinary.uploader().upload(
                        imageBytes,
                        ObjectUtils.asMap(
                                "folder", folder != null ? folder : "qrcodes",
                                "public_id", fileName,
                                "resource_type", "image",
                                "overwrite", true
                        )
                );
                String secureUrl = (String) uploadResult.get("secure_url");
                logger.info("Uploaded QR Code to Cloudinary: {}", secureUrl);
                return secureUrl;
            } catch (Exception e) {
                logger.error("Cloudinary upload for QR failed, falling back to local storage: {}", e.getMessage());
            }
        }

        // Local fallback
        String qrDir = LOCAL_UPLOAD_DIR + "qrcodes/";
        Files.createDirectories(Paths.get(qrDir));
        Path filePath = Paths.get(qrDir + fileName + ".png");
        Files.write(filePath, imageBytes);
        return qrDir + fileName + ".png";
    }
}
