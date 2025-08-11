# Grispi İçe Aktarma Aracı

Bu proje, Grispi platformuna CSV dosyalarından veri içe aktarımını kolaylaştırmak için geliştirilmiş, çok adımlı bir masaüstü uygulamasıdır. Kullanıcı dostu bir arayüz ile veri yükleme, dinamik eşleme, kapsamlı doğrulama ve sonuç özetleme süreçlerini etkin bir şekilde yönetir.

## Proje Mimarisi

Uygulama, iki ana bölümden oluşmaktadır:

### Frontend
Frontend, kullanıcı deneyimini ve arayüz etkileşimlerini yönetir. React ve Ant Design kullanılarak geliştirilmiştir. Dosya yükleme, kolon eşleme ve sonuçların görselleştirilmesi gibi tüm kullanıcıya dönük işlemler bu kısımda gerçekleşir.

### Backend
Backend, standart bir Java uygulamasıdır. Maven tabanlı proje yönetim sistemi ile bağımlılıkları yönetir. Uygulamanın temel dosya okuma ve işleme mantığı bu kısımda bulunur.

## Temel Özellikler

* **Çok Adımlı Kılavuz:** Dosya yükleme, alan eşleme, özet ve sonuç ekranlarını içeren sezgisel bir akış sunar.
* **Dinamik Eşleme:** Yüklenen CSV dosyasının türüne (`Contact`, `Ticket`, `Organization`) göre ilgili Grispi alanlarını otomatik olarak eşleştirme seçenekleri sunar.
* **Gelişmiş Veri Doğrulama:** Zorunlu alanların eşleştirilmesini ve bu alanlardaki verilerin boş olup olmadığını satır bazında kontrol ederek güvenilir bir içe aktarım süreci sağlar.
* **Detaylı Sonuç Raporu:** İçe aktarma sonunda, başarılı ve hatalı satır sayılarını gösteren, hataların nedenlerini açıklayan kapsamlı bir özet sunar.
* **JSON Çıktısı:** Sadece başarılı bir şekilde doğrulanmış verileri içeren JSON çıktısını indirme imkanı tanır.

## Kullanılan Teknolojiler

* **Frontend:** React, Vite, Ant Design
* **Backend:** Java, Maven

## Kurulum ve Çalıştırma

Projenin hem frontend hem de backend kısımlarını ayrı ayrı çalıştırmanız gerekmektedir.

### Backend'i Başlatma

1.  IntelliJ IDEA veya tercih ettiğiniz bir Java IDE'sinde `backend` klasörünü açın.
2.  Maven bağımlılıklarını `pom.xml` üzerinden yükleyin.
3.  Uygulamanın ana sınıfını (`main` metodu içeren sınıf) çalıştırarak backend işlevselliğini başlatın.

### Frontend'i Başlatma

1.  VS Code veya tercih ettiğiniz bir editörde `frontend` klasörünü açın.
2.  Terminali açarak `frontend` klasörüne gidin.
3.  Tüm proje bağımlılıklarını yükleyin:
    ```bash
    npm install
    ```
4.  Uygulamayı geliştirme modunda başlatın:
    ```bash
    npm run dev
    ```
![Vite-React-Google-Chrome-2025-08-11-22-56-24](https://github.com/user-attachments/assets/1e72fa7f-3436-4fd4-9aaf-46d23ca321a1)

## Katkıda Bulunma

Geliştirme fikirlerine ve iyileştirmelere her zaman açığım. Yeni özellikler önermek veya hataları bildirmek için çekinmeden iletişime geçebilirsiniz.
