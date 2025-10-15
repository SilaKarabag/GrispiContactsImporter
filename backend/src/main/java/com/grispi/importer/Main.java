package com.grispi.importer;

import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.Phonenumber;
import jakarta.mail.internet.InternetAddress;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

public class Main {
    private static final PhoneNumberUtil phoneUtil = PhoneNumberUtil.getInstance();
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,6}$",
            Pattern.CASE_INSENSITIVE
    );

    public static List<Map<String, Object>> transformAndValidateData(
            List<Map<String, String>> data,
            Map<String, String> mapping,
            String importType
    ) {
        List<Map<String, Object>> validationResults = new ArrayList<>();

        for (int i = 0; i < data.size(); i++) {
            Map<String, String> row = data.get(i);
            Map<String, Object> result = new HashMap<>();
            result.put("rowNumber", i + 1); // Frontend'deki 0-bazlı indexe +1 ekleyerek satır no veriyoruz

            List<String> errors = new ArrayList<>();
            Map<String, String> transformedData = new HashMap<>();

            // 1. Veri Transformasyonu: mapping'e göre gelen veriyi yeni bir map'e aktar
            for (Map.Entry<String, String> entry : mapping.entrySet()) {
                String columnIndex = entry.getKey(); // "0", "1", "2"...
                String grispiField = entry.getValue(); // "email", "first_name"...
                String value = row.get(columnIndex);

                if (value != null && !value.trim().isEmpty()) {
                    transformedData.put(grispiField, value.trim());
                }
            }

            // 2. Doğrulama (Validation)
            validateRow(importType, transformedData, mapping, errors);

            // Sonuç yapısını oluştur
            result.put("transformed", transformedData);
            if (errors.isEmpty()) {
                result.put("status", "başarılı");
            } else {
                result.put("status", "hatalı");
                result.put("errors", errors);
            }
            validationResults.add(result);
        }
        return validationResults;
    }

    // Main.java içinde...

    private static void validateRow(String importType, Map<String, String> transformedData, Map<String, String> mapping, List<String> errors) {
        // General format checks
        String email = transformedData.get("email");
        if (email != null && !email.isEmpty() && !isValidEmail(email)) {
            // ESKİ: "Geçersiz Email formatı: " + email
            errors.add("Invalid Email format: " + email);
        }

        String phone = transformedData.get("phone");
        if (phone != null && !phone.isEmpty() && !isValidPhone(phone, "TR")) {
            // ESKİ: "Geçersiz Telefon numarası formatı..."
            errors.add("Invalid Phone Number format (region code may be required): " + phone);
        }

        // Type-specific requirement checks
        switch (importType) {
            case "contact":
                boolean isEmailMapped = mapping.containsValue("email");
                boolean isPhoneMapped = mapping.containsValue("phone");

                if (isEmailMapped || isPhoneMapped) {
                    boolean hasEmailData = email != null && !email.isEmpty();
                    boolean hasPhoneData = phone != null && !phone.isEmpty();

                    if (!hasEmailData && !hasPhoneData) {
                        // ESKİ: "Eşleştirilen Email veya Telefon alanlarından en az biri dolu olmalıdır."
                        errors.add("At least one of the mapped Email or Phone fields must be filled.");
                    }
                }
                break;

            case "organization":
                if (transformedData.get("name") == null || transformedData.get("name").isEmpty()) {
                    // ESKİ: "Zorunlu Alan: 'name' alanı boş olamaz."
                    errors.add("Required Field: 'name' cannot be empty.");
                }
                break;

            case "ticket":
                checkRequiredField(transformedData, "subject", errors);
                checkRequiredField(transformedData, "creator", errors);
                checkRequiredField(transformedData, "requester", errors);
                checkRequiredField(transformedData, "status", errors);
                break;
        }
    }

    // checkRequiredField metodunu da güncelleyelim
    private static void checkRequiredField(Map<String, String> data, String fieldName, List<String> errors) {
        if (data.get(fieldName) == null || data.get(fieldName).isEmpty()) {
            // ESKİ: "Zorunlu Alan: '" + fieldName + "' alanı boş olamaz."
            errors.add("Required Field: '" + fieldName + "' cannot be empty.");
        }
    }

    private static boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) return true; // Boşsa kontrol etme
        try {
            new InternetAddress(email).validate();
            return EMAIL_PATTERN.matcher(email).matches();
        } catch (Exception e) {
            return false;
        }
    }

    private static boolean isValidPhone(String phone, String defaultRegion) {
        if (phone == null || phone.trim().isEmpty()) return true; // Boşsa kontrol etme
        try {
            Phonenumber.PhoneNumber phoneNumber = phoneUtil.parse(phone, defaultRegion);
            return phoneUtil.isValidNumber(phoneNumber);
        } catch (Exception e) {
            return false;
        }
    }
}