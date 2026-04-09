package com.equipment.Management.System.demo.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class QrCodeService {

    private static final String QR_UPLOAD_DIR = "uploads/qrcodes/";

    public String generateQrCodeImage(String text, Long equipmentId) throws IOException, WriterException {
        Files.createDirectories(Paths.get(QR_UPLOAD_DIR));

        String fileName = "equipment_" + equipmentId + ".png";
        Path filePath = Paths.get(QR_UPLOAD_DIR + fileName);

        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, 250, 250);

        MatrixToImageWriter.writeToPath(bitMatrix, "PNG", filePath);

        return QR_UPLOAD_DIR + fileName;
    }
}