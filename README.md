# Grispi Data Importer 🚀

![Project Status](https://img.shields.io/badge/status-active-brightgreen)
![Frontend](https://img.shields.io/badge/Frontend-React%20%26%20Ant%20Design-blueviolet)
![Backend](https://img.shields.io/badge/Backend-Java%20%26%20Javalin-orange)

An advanced web application designed to streamline the process of importing and validating data from **Excel (.xlsx)** and **CSV** files into the Grispi platform. It features a modern, multi-step wizard to manage data loading, dynamic field mapping, comprehensive row-by-row validation, and result generation.

---

## ✨ Core Features

* **🪄 Multi-Step Wizard Interface:** Guides users seamlessly through the upload, preview, mapping, summary, and result steps for an intuitive experience.

* **📄 Universal File Support:** Natively handles both **Excel (.xlsx)** and **CSV** files without requiring any conversion.

* **🔗 Dynamic Field Mapping:** Provides a complete list of relevant Grispi fields based on the selected import type (`Contact`, `Ticket`, `Organization`), allowing for flexible data mapping.

* **✅ Advanced Backend Validation:**
    * Performs real-time, row-by-row validation via a powerful Java backend API.
    * Enforces mandatory field rules (e.g., `name` for Organization, or either `email`/`phone` for Contact).
    * Validates data formats, including **E.164 for phone numbers** and valid email structures.
    * Provides clear, **specific error messages for each incorrect row** (e.g., "Row 5: At least one of the mapped Email or Phone fields must be filled.").
    * Offers a **"Proceed Anyway"** option, allowing users to ignore faulty rows and continue with the valid data.

* **📊 Detailed Reporting & JSON Output:**
    * Presents a clear summary of successful and failed rows after validation.
    * Allows users to download **only the successfully validated data** as a clean JSON file, ready for import.

* **🌐 Internationalization (i18n):** The user interface is fully translated into English using `react-i18next`, with a structure that allows for easy addition of new languages in the future.

---

## 🛠️ Technology Stack

| Area      | Technologies                                                                 |
| :-------- | :--------------------------------------------------------------------------- |
| **Frontend** | `React`, `Vite`, `Ant Design 5.x`, `react-i18next`, `xlsx`                 |
| **Backend** | `Java 17`, `Javalin` (Web Server), `Maven`, `Jackson`, `libphonenumber` |

---

## 🏗️ Project Structure

```
GrispiContactsImporter/
├── backend/              # Java (Javalin) + Maven Backend API
│   └── src/main/java/com/grispi/importer/
│       ├── Server.java         # Javalin Web Server
│       └── Main.java           # Core Validation Logic
├── frontend/             # React + Vite Frontend
│   └── src/
│       ├── pages/          # Step components (Upload, Mapping, etc.)
│       └── i18n/           # Internationalization config
└── .gitignore
```

---

## 🚀 Setup and Running

You need to run both the frontend and backend parts of the project separately.

### 1. Backend (Javalin Server)

1.  Open the `backend` folder in IntelliJ IDEA.
2.  Allow Maven to download the dependencies from `pom.xml`.
3.  Run the `main` method in the **`Server.java`** class to start the server.
    > The backend will be running at `http://localhost:7000`.

### 2. Frontend (React App)

1.  Open the `frontend` folder in VS Code.
2.  Open a terminal and install all dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    > The frontend will be running at `http://localhost:5173`.

---

## 🔌 API Endpoints

This section documents the API endpoint provided by the backend server for the frontend to use.

| Method | Endpoint        | Description                                                  |
| :----- | :-------------- | :----------------------------------------------------------- |
| `POST` | `/api/validate` | Receives data, mapping, and import type. Returns a detailed, row-by-row validation result. |

---

## Contributing

I am always open to ideas and improvements. Feel free to contact me to suggest new features or report bugs by opening an issue.
