# Grispi Veri İçe Aktarma Aracı 🚀

![Proje Durumu](https://img.shields.io/badge/durum-aktif-brightgreen)
![Frontend](https://img.shields.io/badge/Frontend-React%20%26%20Ant%20Design-blueviolet)
![Backend](https://img.shields.io/badge/Backend-Java%20%26%20Javalin-orange)

Bu proje, Grispi platformuna **Excel (.xlsx)** ve **CSV** dosyalarından veri içe aktarımını kolaylaştırmak için geliştirilmiş, modern bir web uygulamasıdır. Kullanıcı dostu, çok adımlı bir sihirbaz arayüzü ile veri yükleme, dinamik alan eşleştirme, kapsamlı satır bazında doğrulama ve sonuç üretme süreçlerini etkin bir şekilde yönetir.

---

## ✨ Temel Özellikler

* **🪄 Çok Adımlı Sihirbaz Arayüzü:** Kullanıcıları; yükleme, önizleme, eşleştirme, özet ve sonuç adımlarında sorunsuz bir şekilde yönlendirerek sezgisel bir deneyim sunar.

* **📄 Evrensel Dosya Desteği:** Hem **Excel (.xlsx)** hem de **CSV** dosyalarını herhangi bir dönüştürme işlemine gerek kalmadan doğrudan işler.

* **🔗 Akıllı ve Esnek Alan Eşleştirme:**
    * **Otomatik Eşleştirme Önerisi:** Excel dosyasındaki kolon başlıklarını analiz ederek olası Grispi alanlarını otomatik olarak önerir ve zamandan kazandırır.
    * **Şablon Sistemi:** Kullanıcıların yaptıkları kolon eşleştirme ayarlarını şablon olarak kaydetmelerine ve gelecekteki içe aktarımlarda tek tıkla yüklemelerine olanak tanır.
    * **Özel Alan Desteği (Custom Fields):** Standart alanların dışında, `ui.renk` gibi özel alanların manuel olarak eklenmesine izin vererek tam esneklik sağlar.

* **✅ Gelişmiş Backend Doğrulaması:**
    * Güçlü bir Java API'si aracılığıyla gerçek zamanlı ve satır bazında doğrulama yapar.
    * Zorunlu alan kurallarını uygular (Örn: `Contact` için `email` VEYA `phone` zorunluluğu).
    * **E.164 telefon formatı** ve geçerli e-posta yapıları gibi veri formatlarını kontrol eder.
    * Her hatalı satır için **spesifik ve anlaşılır hata mesajları** üretir (Örn: "Satır 5: Eşleştirilen Email veya Telefon alanlarından en az biri dolu olmalıdır.").
    * **"Yine de Devam Et"** seçeneği ile kullanıcının hatalı satırları göz ardı ederek geçerli verilerle ilerlemesine olanak tanır.

* **📊 Detaylı Raporlama ve Çıktı Seçenekleri:**
    * Doğrulama sonrası başarılı ve hatalı satır sayılarını net bir özetle sunar.
    * Kullanıcıların **sadece başarıyla doğrulanmış verileri** hem **JSON** hem de **CSV** formatında indirmesine imkan tanır.

* **🌐 Uluslararasılaştırma (i18n):** Arayüz, `react-i18next` altyapısı kullanılarak tamamen İngilizce'ye çevrilmiştir ve gelecekte yeni dillerin eklenmesi için uygun bir yapıya sahiptir.

---

##  Demo

![gif2](https://github.com/user-attachments/assets/6b58903a-5f5b-4bd3-8509-d50651d7b4c9)

---

## 🛠️ Kullanılan Teknolojiler

| Alan      | Teknolojiler                                                                 |
| :-------- | :--------------------------------------------------------------------------- |
| **Frontend** | `React`, `Vite`, `Ant Design 5.x`, `react-i18next`, `xlsx`                 |
| **Backend** | `Java 17`, `Javalin` (Web Sunucusu), `Maven`, `Jackson`, `libphonenumber` |

---

## 🏗️ Proje Mimarisi

```
GrispiContactsImporter/
├── backend/              # Java (Javalin) + Maven Backend API'si
│   └── src/main/java/com/grispi/importer/
│       ├── Server.java         # Javalin Web Sunucusu
│       └── Main.java           # Temel Doğrulama Mantığı
├── frontend/             # React + Vite Frontend Uygulaması
│   └── src/
│       ├── pages/          # Adım bileşenleri (Upload, Mapping, vb.)
│       └── i18n/           # Uluslararasılaştırma yapılandırması
└── .gitignore
```

---

## 🚀 Kurulum ve Çalıştırma

Projenin hem frontend hem de backend kısımlarını ayrı ayrı çalıştırmanız gerekmektedir.

### 1. Backend (Javalin Sunucusu)

1.  `backend` klasörünü IntelliJ IDEA'da açın.
2.  Maven'in `pom.xml` dosyasındaki bağımlılıkları indirmesine izin verin.
3.  **`Server.java`** sınıfındaki `main` metodunu çalıştırarak sunucuyu başlatın.
    > Backend `http://localhost:7000` adresinde çalışmaya başlayacaktır.

### 2. Frontend (React Uygulaması)

1.  `frontend` klasörünü VS Code'da açın.
2.  Bir terminal açın ve tüm bağımlılıkları yükleyin:
    ```bash
    npm install
    ```
3.  Uygulamayı geliştirme modunda başlatın:
    ```bash
    npm run dev
    ```
    > Frontend, terminalde gösterilen adreste (genellikle `http://localhost:5173`) çalışmaya başlayacaktır.

---

## 🔌 API Uç Noktaları

Bu bölüm, backend sunucusunun frontend tarafından kullanılmak üzere sağladığı API uç noktasını belgeler.

| Metod | Uç Nokta        | Açıklama                                                  |
| :---- | :-------------- | :----------------------------------------------------------- |
| `POST` | `/api/validate` | Veri, eşleştirme ve içe aktarma tipini alır. Detaylı, satır bazında bir doğrulama sonucu döndürür. |

---

## Katkıda Bulunma

Geliştirme fikirlerine ve iyileştirmelere her zaman açığım. Yeni özellikler önermek veya hataları bildirmek için çekinmeden bir "issue" açarak iletişime geçebilirsiniz.
