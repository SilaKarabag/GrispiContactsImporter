package com.grispi.importer;

import io.javalin.Javalin;
import io.javalin.http.staticfiles.Location;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;

public class Server {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static void main(String[] args) {
        var app = Javalin.create(config -> {
            config.http.defaultContentType = "application/json";
            config.plugins.enableCors(cors -> cors.add(it -> it.anyHost()));
            config.staticFiles.add("/public", Location.CLASSPATH);
        });

        app.get("/", ctx -> ctx.result("Grispi Importer Backend is running."));

        app.post("/api/validate", ctx -> {
            try {
                // Gelen isteği ValidationRequest POJO'suna map'le
                ValidationRequest request = ctx.bodyAsClass(ValidationRequest.class);

                // Main validasyon metodunu çağır
                List<Map<String, Object>> validationResults = Main.transformAndValidateData(
                        request.getData(),
                        request.getMapping(),
                        request.getImportType()
                );

                ctx.json(validationResults);
            } catch (Exception e) {
                System.err.println("Error processing request: " + e.getMessage());
                e.printStackTrace();
                ctx.status(500).result("{\"error\":\"Request processing failed: " + e.getMessage().replace("\"", "'") + "\"}");
            }
        });

        app.start(7000);
    }
}