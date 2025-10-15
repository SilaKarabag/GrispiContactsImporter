package com.grispi.importer;

import java.util.List;
import java.util.Map;

public class ValidationRequest {
    private List<Map<String, String>> data;
    private Map<String, String> mapping;
    private String importType;

    // Getter ve Setter'lar (burada gösterilmiyor ama mevcut olmalı)
    public List<Map<String, String>> getData() {
        return data;
    }

    public void setData(List<Map<String, String>> data) {
        this.data = data;
    }

    public Map<String, String> getMapping() {
        return mapping;
    }

    public void setMapping(Map<String, String> mapping) {
        this.mapping = mapping;
    }

    public String getImportType() {
        return importType;
    }

    public void setImportType(String importType) {
        this.importType = importType;
    }
}