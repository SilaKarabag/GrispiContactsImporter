package com.grispi.importer;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import java.io.*;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public class Main {
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static final Scanner scanner = new Scanner(System.in);


    // Email ve Telefon için basit Regex patternleri
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$");
    // E.164 formatı için basit bir başlangıç (örn: +905...)
    private static final Pattern PHONE_E164_PATTERN = Pattern.compile("^\\+[1-9]\\d{1,14}$");




    // Grispi contact alanları
    private static final Map<String, String> GRISPI_FIELDS = new LinkedHashMap<>();
    static {
        GRISPI_FIELDS.put("external_id", "Harici ID (us.external_id)");
        GRISPI_FIELDS.put("first_name", "Ad (First Name)");
        GRISPI_FIELDS.put("last_name", "Soyad (Last Name)");
        GRISPI_FIELDS.put("email", "E-posta (Email)");
        GRISPI_FIELDS.put("phone", "Telefon (Phone)");
        GRISPI_FIELDS.put("organization", "Organizasyon (Organization)");
        GRISPI_FIELDS.put("language", "Dil (Language)");
        GRISPI_FIELDS.put("tags", "Etiketler (Tags)");
        GRISPI_FIELDS.put("groups", "Gruplar (Groups)");
        GRISPI_FIELDS.put("role", "Rol (Role)");
        GRISPI_FIELDS.put("enabled", "Aktif (Enabled)");
    }

    public static void main(String[] args) {
        objectMapper.enable(SerializationFeature.INDENT_OUTPUT);

        System.out.println("=== Grispi Contacts Importer ===");

        try {
            System.out.print("İçe aktarılacak dosya yolunu girin (.xlsx veya .csv): ");
            String filePath = scanner.nextLine().trim();

// Eğer yol çift veya tek tırnak ile başlıyorsa/sınırlanmışsa temizle
            if ((filePath.startsWith("\"") && filePath.endsWith("\"")) ||
                    (filePath.startsWith("'") && filePath.endsWith("'"))) {
                filePath = filePath.substring(1, filePath.length() - 1);
            }

            List<Map<String, Object>> data;
            if (filePath.toLowerCase().endsWith(".csv")) {
                data = loadCsvFile(filePath);
            } else {
                data = loadExcelFile(filePath);
            }

            if (data.isEmpty()) {
                System.err.println("Dosyadan veri okunamadı veya dosya boş!");
                return;
            }

            showPreview(data);

            Map<String, String> columnMapping = createColumnMapping(data.get(0).keySet());
            saveTemplateOption(columnMapping);

            List<Contact> contacts = transformData(data, columnMapping);

            saveResults(contacts);
            showReport(contacts);

        } catch (Exception e) {
            System.err.println("Hata oluştu: " + e.getMessage());
            e.printStackTrace();
        } finally {
            scanner.close();
        }
    }

    private static List<Map<String, Object>> loadExcelFile(String filePath) throws IOException {
        List<Map<String, Object>> data = new ArrayList<>();

        try (InputStream excelFile = new FileInputStream(filePath);
             Workbook workbook = new XSSFWorkbook(excelFile)) {

            // Boş olmayan ilk sheet'i bul
            Sheet sheet = null;
            for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
                Sheet candidate = workbook.getSheetAt(i);
                if (candidate.getPhysicalNumberOfRows() > 0) {
                    sheet = candidate;
                    break;
                }
            }
            if (sheet == null) return data;

            System.out.println("Okunan Sayfa Adı: " + sheet.getSheetName());

            Iterator<Row> rowIterator = sheet.iterator();
            if (!rowIterator.hasNext()) return data;

            Row headerRow = rowIterator.next();
            List<String> headers = new ArrayList<>();
            for (Cell cell : headerRow) {
                headers.add(cell.toString().trim());
            }

            while (rowIterator.hasNext()) {
                Row currentRow = rowIterator.next();
                Map<String, Object> rowData = new HashMap<>();
                boolean isRowEmpty = true;
                for (int i = 0; i < headers.size(); i++) {
                    Cell cell = currentRow.getCell(i);
                    Object value = getCellValue(cell);
                    rowData.put(headers.get(i), value);
                    if (value != null && !value.toString().trim().isEmpty()) {
                        isRowEmpty = false;
                    }
                }
                if (!isRowEmpty) data.add(rowData);
            }
        }
        return data;
    }

    private static List<Map<String, Object>> loadCsvFile(String filePath) throws IOException {
        List<Map<String, Object>> data = new ArrayList<>();
        try (BufferedReader br = new BufferedReader(new FileReader(filePath))) {
            String headerLine = br.readLine();
            if (headerLine == null) return data;
            String[] headers = Arrays.stream(headerLine.split(","))
                    .map(h -> h.trim())
                    .toArray(String[]::new);

            String line;
            while ((line = br.readLine()) != null) {
                String[] values = line.split(",");
                Map<String, Object> row = new HashMap<>();
                for (int i = 0; i < headers.length; i++) {
                    row.put(headers[i], i < values.length ? values[i].trim() : "");
                }
                data.add(row);
            }
        }
        return data;
    }

    private static Object getCellValue(Cell cell) {
        if (cell == null) return null;
        switch (cell.getCellType()) {
            case STRING: return cell.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().getTime();
                } else {
                    double numValue = cell.getNumericCellValue();
                    return (numValue == (long) numValue) ? (long) numValue : numValue;
                }
            case BOOLEAN: return cell.getBooleanCellValue();
            case FORMULA: return cell.getCellFormula();
            default: return null;
        }
    }



    private static void showPreview(List<Map<String, Object>> data) {
        System.out.println("\n=== VERİ ÖNİZLEMESİ ===");

        if (data.isEmpty()) {
            System.out.println("Önizlenecek veri yok.");
            return;
        }

        Set<String> columns = data.get(0).keySet();
        System.out.println("Bulunan sütunlar: " + columns);

        System.out.println("\nİlk 3 veri satırı:");
        for (int i = 0; i < Math.min(3, data.size()); i++) {
            System.out.println("\nSatır " + (i + 1) + ":");
            Map<String, Object> row = data.get(i);
            for (Map.Entry<String, Object> entry : row.entrySet()) {
                System.out.println("  " + entry.getKey() + ": " + entry.getValue());
            }
        }
        System.out.println();
    }



    private static Map<String, String> createColumnMapping(Set<String> excelColumns) {
        Map<String, String> mapping = new HashMap<>();
        Set<String> normalizedExcelColumns = excelColumns.stream()
                .map(c -> c.trim().toLowerCase())
                .collect(Collectors.toSet());

        for (Map.Entry<String, String> grispiField : GRISPI_FIELDS.entrySet()) {
            String grispiFieldName = grispiField.getKey();
            String grispiFieldDesc = grispiField.getValue();

            System.out.print(grispiFieldDesc + " için Excel sütunu: ");
            String input = scanner.nextLine().trim();
            if (!input.isEmpty()) {
                String normalizedInput = input.toLowerCase();
                if (normalizedExcelColumns.contains(normalizedInput)) {
                    // Orijinal sütun adını bul
                    String original = excelColumns.stream()
                            .filter(c -> c.trim().equalsIgnoreCase(input))
                            .findFirst().orElse(input);
                    mapping.put(original, grispiFieldName);
                } else {
                    System.out.println("⚠ Sütun bulunamadı, atlandı.");
                }
            }
        }
        return mapping;
    }

    private static void saveTemplateOption(Map<String, String> mapping) {
        System.out.print("\nBu eşleştirmeyi şablon olarak kaydetmek ister misiniz? (e/h): ");
        String answer = scanner.nextLine().trim().toLowerCase();

        if ("e".equals(answer) || "evet".equals(answer)) {
            try {
                System.out.print("Şablon için bir isim girin (örn: 'MyUserTemplate'): ");
                String templateName = scanner.nextLine().trim();
                if (templateName.isEmpty()) {
                    System.err.println("Şablon adı boş olamaz. Kaydedilmedi.");
                    return;
                }

                Map<String, Object> template = new HashMap<>();
                template.put("name", templateName);
                template.put("created_at", new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
                template.put("mapping", mapping);

                String fileName = "template_" + templateName.replaceAll("[^a-zA-Z0-9]", "_") + ".json";
                objectMapper.writeValue(new File(fileName), template);

                System.out.println("✓ Şablon kaydedildi: " + fileName);
            } catch (IOException e) {
                System.err.println("Şablon kaydedilemedi: " + e.getMessage());
            }
        }
    }

    private static List<Contact> transformData(List<Map<String, Object>> excelData,
                                               Map<String, String> columnMapping) {
        System.out.println("\n=== VERİ DÖNÜŞTÜRME ===");

        List<Contact> contacts = new ArrayList<>();
        int successCount = 0;
        int errorCount = 0;

        for (int i = 0; i < excelData.size(); i++) {
            Map<String, Object> excelRow = excelData.get(i);
            Contact contact = new Contact();
            contact.setRowNumber(i + 1); // Satır numarasını set et

            try {
                // Eşleştirilen sütunları dönüştür
                for (Map.Entry<String, String> mapping : columnMapping.entrySet()) {
                    String excelColumn = mapping.getKey();
                    String grispiField = mapping.getValue();
                    Object value = excelRow.get(excelColumn);

                    // Değeri String'e çevirirken null kontrolü yap
                    String stringValue = (value != null) ? value.toString() : null;

                    setContactField(contact, grispiField, stringValue);
                }

                // Zorunlu alanları kontrol et
                List<String> missingOrInvalidFields = validateContact(contact);
                if (!missingOrInvalidFields.isEmpty()) {
                    contact.setStatus("eksik/hatalı");
                    contact.setErrors(missingOrInvalidFields);
                    errorCount++;
                } else {
                    contact.setStatus("başarılı");
                    successCount++;
                }
                contacts.add(contact);

            } catch (Exception e) {
                // Genel dönüştürme hataları için
                contact.setStatus("genel_hata");
                // Mevcut hatalara ekle veya yeni liste oluştur
                List<String> currentErrors = contact.getErrors();
                if (currentErrors == null) {
                    currentErrors = new ArrayList<>();
                }
                currentErrors.add("İşleme hatası: " + e.getMessage());
                contact.setErrors(currentErrors);
                contacts.add(contact); // Hatalı kaydı da listeye ekle
                errorCount++;
            }
        }

        System.out.println("Dönüştürme tamamlandı!");
        System.out.println("Başarılı: " + successCount + ", Hatalı: " + errorCount);

        return contacts;
    }


    private static void setContactField(Contact contact, String field, String value) {
        if (value == null || value.trim().isEmpty()) {
            // Boş değerleri atla, null olarak kalabilirler veya Contact sınıfında varsayılan değerleri olabilir
            return;
        }
        switch (field) {
            case "external_id":
                contact.setExternalId(value);
                break;
            case "first_name":
                contact.setFirstName(value);
                break;
            case "last_name":
                contact.setLastName(value);
                break;
            case "email":
                contact.setEmail(value);
                break;
            case "phone":
                // Telefon formatını E.164'e dönüştürmeye çalış (örn: +905XXXXXXXXX)
                // Basit bir regex kontrolü, daha karmaşık dönüşümler gerekebilir
                String formattedPhone = formatPhoneToE164(value);
                contact.setPhone(formattedPhone);
                break;
            case "organization":
                contact.setOrganization(value);
                break;
            case "language":
                contact.setLanguage(value);
                break;
            case "tags":
                // Virgülle ayrılmış string'i List<String>'e dönüştür
                contact.setTags(Arrays.asList(value.split(",")).stream().map(String::trim).collect(Collectors.toList()));
                break;
            case "groups":
                // Virgülle ayrılmış string'i List<String>'e dönüştür
                contact.setGroups(Arrays.asList(value.split(",")).stream().map(String::trim).collect(Collectors.toList()));
                break;
            case "role":
                contact.setRole(value);
                break;
            case "enabled":
                // "true", "1", "yes" gibi değerleri true olarak kabul et
                contact.setEnabled("true".equalsIgnoreCase(value) || "1".equals(value) || "yes".equalsIgnoreCase(value));
                break;
            default:
                // Bilinmeyen alanları logla veya ignore et
                System.out.println("Uyarı: Bilinmeyen Grispi alanı: " + field);
                break;
        }
    }

    // Telefon numarasını E.164 formatına dönüştürmeye çalışan basit bir yardımcı metod
    private static String formatPhoneToE164(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return null;
        }
        // Tüm boşlukları ve parantezleri kaldır, sadece rakamları tut
        String cleanedPhone = phone.replaceAll("[\\s\\-\\(\\)]", "");

        // Eğer '+' ile başlamıyorsa ve 10 veya 11 haneliyse +90 eklemeye çalış
        if (!cleanedPhone.startsWith("+")) {
            if (cleanedPhone.length() == 10) { // Genellikle 05xx şeklinde başlar
                return "+90" + cleanedPhone.substring(cleanedPhone.startsWith("0") ? 1 : 0);
            } else if (cleanedPhone.length() == 11 && cleanedPhone.startsWith("0")) {
                return "+90" + cleanedPhone.substring(1);
            }
        }

        // Genel E.164 formatı kontrolü
        if (PHONE_E164_PATTERN.matcher(cleanedPhone).matches()) {
            return cleanedPhone;
        } else {
            // Eğer geçerli bir E.164 formatı değilse orijinal değeri dön, hata logla
            System.err.println("Uyarı: Telefon numarası E.164 formatına dönüştürülemedi veya geçersiz: " + phone);
            return phone; // Dönüştürülemezse orijinal haliyle geri dön (ya da null)
        }
    }

    // Contact nesnesini doğrulayan metodu güncelliyoruz
    private static List<String> validateContact(Contact contact) {
        List<String> errors = new ArrayList<>();

        // Zorunlu alanlar (Excel şablonuna göre varsayımlar)
        // Genellikle First Name, Last Name, ve Email/Phone'dan biri zorunludur.
        if (isNullOrEmpty(contact.getFirstName())) {
            errors.add("Ad (First Name) alanı boş olamaz.");
        }
        if (isNullOrEmpty(contact.getLastName())) {
            errors.add("Soyad (Last Name) alanı boş olamaz.");
        }

        // E-posta veya telefon en az birisi olmalı (Macenta başlık kuralı)
        boolean hasEmail = !isNullOrEmpty(contact.getEmail());
        boolean hasPhone = !isNullOrEmpty(contact.getPhone());

        if (!hasEmail && !hasPhone) {
            errors.add("E-posta veya telefon numarası alanlarından en az biri girilmelidir.");
        }

        // E-posta formatı kontrolü
        if (hasEmail && !EMAIL_PATTERN.matcher(contact.getEmail()).matches()) {
            errors.add("Geçersiz e-posta formatı: '" + contact.getEmail() + "'");
        }

        // Telefon formatı E.164 kontrolü (sadece varsa)
        if (hasPhone && !PHONE_E164_PATTERN.matcher(contact.getPhone()).matches()) {
            errors.add("Geçersiz telefon numarası formatı (E.164 bekleniyor): '" + contact.getPhone() + "'");
        }

        // Diğer alanların doğrulamaları buraya eklenebilir
        // Örneğin, language alanı belirli bir ISO kodu olmalı mı?

        return errors;
    }

    // Null veya boş string kontrolü için yardımcı metod
    private static boolean isNullOrEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }

    private static void saveResults(List<Contact> contacts) throws IOException {
        System.out.println("\n=== SONUÇLARI KAYDETME ===");

        // JSON formatında kaydet
        String jsonFileName = "grispi_contacts_" + System.currentTimeMillis() + ".json";
        objectMapper.writeValue(new File(jsonFileName), contacts);
        System.out.println("✓ JSON dosyası kaydedildi: " + jsonFileName);

        // CSV formatında kaydet (Daha sağlam CSV yazımı)
        String csvFileName = "grispi_contacts_" + System.currentTimeMillis() + ".csv";
        saveToCsv(contacts, csvFileName);
        System.out.println("✓ CSV dosyası kaydedildi: " + csvFileName);
    }

    private static void saveToCsv(List<Contact> contacts, String fileName) throws IOException {
        try (PrintWriter writer = new PrintWriter(new FileWriter(fileName))) {
            // Başlık satırı
            writer.println("satir_no,external_id,first_name,last_name,email,phone,organization,language,tags,groups,role,enabled,durum,hatalar");

            // Veri satırları
            for (Contact contact : contacts) {
                List<String> rowData = new ArrayList<>();
                rowData.add(String.valueOf(contact.getRowNumber()));
                rowData.add(nvl(contact.getExternalId()));
                rowData.add(nvl(contact.getFirstName()));
                rowData.add(nvl(contact.getLastName()));
                rowData.add(nvl(contact.getEmail()));
                rowData.add(nvl(contact.getPhone()));
                rowData.add(nvl(contact.getOrganization()));
                rowData.add(nvl(contact.getLanguage()));
                // List<String> olan tags ve groups'u virgülle ayrılmış string'e çevir
                rowData.add(contact.getTags() != null ? String.join(";", contact.getTags()) : "");
                rowData.add(contact.getGroups() != null ? String.join(";", contact.getGroups()) : "");
                rowData.add(nvl(contact.getRole()));
                rowData.add(String.valueOf(contact.isEnabled()));
                rowData.add(nvl(contact.getStatus()));
                rowData.add(contact.getErrors() != null ? String.join(";", contact.getErrors()) : ""); // Hatalar noktalı virgülle ayrılsın

                // CSV güvenli formatlama: Tırnak içine al ve tırnakları ikiye katla
                String csvRow = rowData.stream()
                        .map(s -> "\"" + (s != null ? s.replace("\"", "\"\"") : "") + "\"")
                        .collect(Collectors.joining(","));

                writer.println(csvRow);
            }
        }
    }

    private static String nvl(String value) {
        return value != null ? value : "";
    }

    // List<String> için nvl benzeri bir metod, eğer null ise boş liste değil, boş string dönsün CSV için
    private static String nvlList(List<String> list) {
        return list != null ? String.join(";", list) : "";
    }

    private static void showReport(List<Contact> contacts) {
        System.out.println("\n=== İŞLEM RAPORU ===");

        long successCount = contacts.stream().filter(c -> "başarılı".equals(c.getStatus())).count();
        long errorCount = contacts.stream().filter(c -> !"başarılı".equals(c.getStatus())).count();

        System.out.println("Toplam işlenen kayıt: " + contacts.size());
        System.out.println("Başarılı kayıt: " + successCount);
        System.out.println("Hatalı/Eksik kayıt: " + errorCount);
        System.out.println("Başarı oranı: %" + (contacts.size() > 0 ? (successCount * 100 / contacts.size()) : 0));

        if (errorCount > 0) {
            System.out.println("\nHatalı/Eksik ilk 5 kayıt detayı:");
            contacts.stream()
                    .filter(c -> !"başarılı".equals(c.getStatus()))
                    .limit(5)
                    .forEach(c -> {
                        System.out.println("  Satır " + c.getRowNumber() + ": Durum: " + c.getStatus() +
                                (c.getErrors() != null && !c.getErrors().isEmpty() ? " - Hatalar: " + String.join(", ", c.getErrors()) : ""));
                    });

            if (errorCount > 5) {
                System.out.println("... ve diğer " + (errorCount - 5) + " hatalı kayıt.");
            }
        }

        System.out.println("\nİşlem tamamlandı!");
    }
}