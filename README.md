Grispi İletişim Aktarıcı (Contact Importer) - Backend Staj Projesi

Proje Tanımı
Projenin amacı, belirli bir Excel şablonundaki kişi verilerini okumak, Grispi API'si tarafından beklenen JSON formatına dönüştürmek ve aynı zamanda bir CSV raporu oluşturmaktır. Uygulama, veri doğrulama (e-posta formatı, telefon numarası E.164 formatı, zorunlu alanlar) ve eksik/hatalı kayıtların raporlanması gibi özelliklere sahiptir.

Kullanılan Teknolojiler
Java 23: Projenin temel programlama dili.
Maven: Proje bağımlılıklarını yönetmek ve build işlemlerini otomatikleştirmek için kullanılmıştır.
Apache POI: Excel dosyalarını (XLSX formatı) okumak ve içindeki verilere erişmek için kullanılmıştır.
Jackson Databind: Java nesnelerini JSON formatına dönüştürmek (serileştirmek) ve JSON'dan Java nesnelerine dönüştürmek (deserileştirmek) için kullanılmıştır.
java.util.Scanner: Konsol üzerinden kullanıcı girişi almak için kullanılmıştır.


Kurulum ve Çalıştırma
Önkoşullar
Java Development Kit (JDK) 17 veya üzeri: Sisteminizde kurulu olmalıdır.
Maven: Komut satırından mvn komutunun çalışıyor olması tavsiye edilir. IntelliJ IDEA genellikle kendi Maven sürümüyle gelir.
IntelliJ IDEA (önerilir): Geliştirme ortamı olarak kullanılmıştır.

Adımlar
1. Depoyu Klonlayın:   git clone <depo-adresiniz>
                    cd <proje-klasoru-adi>


2. Projenin kök dizininde bulunan src/main/resources klasörüne, Grispi tarafından sağlanan veya örnek verilerle doldurduğunuz Grispi Import Template (1).xlsx adlı Excel dosyasını yerleştirin.

Önemli: Excel dosyasındaki kişi verilerinin "Users" adlı bir sayfada bulunduğundan ve bu "Users" sayfasının Excel dosyasında 5. sırada (indeks 4) olduğundan emin olun. Eğer "Users" sayfası farklı bir indekste ise, Main.java dosyasındaki sheetIndexToRead değişkenini güncellemeyi unutmayın. Ayrıca, Phone sütunundaki numaraların Excel'de "Text" (Metin) formatında olduğundan emin olun (başında '+' işaretiyle E.164 formatına uygun olmaları gerekir, örn: +905321234567).

3. Bağımlılıkları Yükleyin (Maven):
IntelliJ IDEA kullanıyorsanız, projeyi açtığınızda Maven otomatik olarak bağımlılıkları indirecektir.

4.Uygulamayı Çalıştırın:
IntelliJ IDEA Üzerinden:
src/main/java/com/grispi/importer dizinindeki Main.java dosyasını açıp çalıştırın.

Uygulama çalıştığında, konsol üzerinden size sorular sorarak Excel sütunlarını Grispi alanlarıyla eşleştirmenizi isteyecektir.
Uygulama, okuduğu Excel dosyasının ilk birkaç satırını ve sütun başlıklarını gösterir.
Uygulama, Grispi Contact alanlarını (External ID, First Name, Email, vb.) listeleyecek ve her biri için Excel dosyanızdaki karşılık gelen sütun adını girmenizi isteyecektir.
Boş Bırakma: Eğer bir Grispi alanı için Excel'inizde karşılık gelen bir sütun yoksa veya o alanı eşleştirmek istemiyorsanız, ilgili soruya hiçbir şey yazmadan sadece Enter tuşuna basabilirsiniz. Uygulama o alanı boş geçecektir.
Tüm eşleştirmeleri yaptıktan sonra, uygulama size bu eşleştirmeleri bir şablon dosyası olarak kaydetmek isteyip istemediğinizi soracaktır (e/h).
e yazıp bir isim verirseniz (örn: MyUserTemplate), template_MyUserTemplate.json adlı bir dosya oluşturulur. Bir dahaki sefere uygulamayı çalıştırdığınızda, bu şablon dosyasını kullanarak eşleştirmeleri otomatik olarak yükleyebilirsiniz, böylece tekrar manuel giriş yapmanıza gerek kalmaz.

Çıktı Dosyaları
Uygulama, verileri işledikten sonra, projenizin ana dizinine (genellikle pom.xml dosyasının bulunduğu yer) iki çıktı dosyası kaydeder:
grispi_contacts_*.json: Dönüştürülen tüm kişileri içeren JSON formatında bir dosya. Grispi API'sine gönderilmeye hazır formatı temsil eder.
grispi_contacts_*.csv: İşlem raporunu ve her bir kaydın durumunu (başarılı/hatalı) içeren bir CSV dosyası. Hatalı kayıtlar için hangi doğrulama kurallarının ihlal edildiği belirtilir.

Uygulama, Grispi'nin belirlediği bazı temel doğrulama kurallarını uygular:
first_name ve last_name: Boş olamaz.
email veya phone: En az biri dolu olmalıdır.
email: Geçerli bir e-posta formatına sahip olmalıdır.
phone: E.164 formatında olmalıdır (örn: +905321234567). Eğer + işareti eksikse, uyarı verir ve kaydedilmez.
enabled: TRUE veya FALSE (büyük/küçük harf duyarsız) olmalıdır, aksi takdirde varsayılan olarak false kabul edilir.
tags ve groups: Virgülle ayrılmış stringler olarak beklenir ve JSON çıktısında string listelerine dönüştürülür.
