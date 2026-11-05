# FUTUREPATH

Website statis untuk eksplorasi pendidikan dan karier siswa SMA/MA serta SMK/MAK.
Tidak perlu npm, proses build, akun pengguna, backend, atau database server.

## Struktur halaman

| File | Isi |
| --- | --- |
| `index.html` | Beranda dan pintu masuk eksplorasi |
| `explore.html` | Lima pertanyaan minat dan ringkasan hasil |
| `sma.html` | Rumpun bidang ilmu lintas minat |
| `smk.html` | Contoh program keahlian dan pengembangan kompetensi |
| `careers.html` | Pencarian, filter, bookmark, dan perbandingan profesi |
| `universities.html` | Contoh pendidikan dan tautan resmi |
| `skills.html` | Tantangan keterampilan dan refleksi |
| `pathways.html` | Empat pilihan jalur dan langkah awal |

## CSS

- `css/style.css`: variabel tema, tipografi, navigasi, dan tata letak halaman.
- `css/components.css`: tombol, kartu, formulir, dialog, dan ilustrasi.
- `css/responsive.css`: penyesuaian tablet dan ponsel.

Teks utama desktop berukuran 18 px; pengantar halaman 20 px; teks pendukung 15-17 px.
Tidak ada efek blur pada teks. Ukuran ilustrasi tidak memengaruhi ketajaman teks konten.

## JavaScript

- `js/main.js`: utilitas, pemuatan data JSON, penyimpanan browser, dialog, halaman bidang, dan keterampilan.
- `js/navigation.js`: header dan footer bersama, menu, dan penanda halaman aktif.
- `js/quiz.js`: pertanyaan aktivitas, kemajuan, hasil, serta penyimpanan hasil terakhir.
- `js/careers.js`: pencarian/filter, kartu profesi, dan perbandingan dua atau tiga profesi.
- `js/universities.js`: kategori pendidikan dan kartu dari JSON.
- `js/pathways.js`: pemilihan jalur dan tombol panduan PDF.

`main.js` dimuat sebelum file JS lainnya. Utilitas bersama tersedia melalui `window.FP`.
Tidak menggunakan JavaScript module agar sederhana untuk hosting statis.

## Mengubah konten

Data utama hanya disimpan di file berikut, tanpa salinan data dalam HTML:

- `data/careers.json`: identitas profesi, deskripsi, tugas, keterampilan, pendidikan, industri, langkah awal, dan contoh pengembangan.
- `data/universities.json`: objek kategori `akademik`, `vokasi`, dan `mandiri`; setiap item punya `name`, `meta`, `description`, dan `url`.
- `data/study-programs.json`: kategori SMA/SMK, bidang, materi, studi, keterampilan, dan ID profesi terkait.
- `data/skills.json`: ID, nama keterampilan, dan tantangan.
- `data/pathways.json`: ID jalur, judul, langkah, dan catatan.

Pertahankan ID yang sudah digunakan. ID profesi terkait pada `study-programs.json` harus ada di `careers.json`.
JSON harus valid: gunakan tanda kutip ganda, tanpa komentar atau koma setelah item terakhir.
Kategori filter profesi pada HTML harus disesuaikan bila menambah kategori baru.
Pertanyaan kuis berada di bagian `questions` pada `js/quiz.js`. Empat kategori ringkasan kuis bersifat pengantar, bukan asesmen psikologis.

## Mengganti panduan PDF

Semua tombol **Unduh panduan lengkap PDF** menunjuk ke:

`assets/documents/panduan-futurepath.pdf`

Cara termudah menggantinya:

1. Siapkan PDF final milikmu.
2. Beri nama **panduan-futurepath.pdf**.
3. Timpa file lama pada `assets/documents/`.
4. Unggah ulang folder website ke hosting. Tidak perlu mengubah HTML atau JavaScript.

Jika ingin nama berbeda, sesuaikan tautan PDF pada seluruh HTML dan nilai `guideURL` pada `js/main.js`.
PDF dalam paket ini berisi panduan siswa dan lembar rencana. PDF tidak otomatis dibuat ulang ketika JSON diedit: revisi PDF sendiri bila mengubah materi yang relevan.

Tidak ada fitur upload PDF untuk pengunjung. Memilih file dari komputer melalui formulir saja tidak akan menyimpannya ke hosting. Pengelola cukup mengganti file proyek seperti langkah di atas.

## Aset

- `assets/icons/favicon.svg`: ikon tab browser.
- `assets/documents/`: panduan PDF terpisah.
- `assets/images/`, `assets/fonts/`, dan `assets/audio/`: folder yang disiapkan untuk pengembangan; belum memerlukan aset tambahan.

Ilustrasi beranda dibuat dengan HTML, CSS, dan SVG, sehingga tidak membutuhkan gambar eksternal.

## Penyimpanan dan privasi

Bookmark memakai kunci `fp-saved` dan hasil terakhir memakai `fp-quiz` di localStorage.
Data tidak dikirim ke server dan tidak otomatis tersinkronisasi. Simpanan dapat hilang bila data browser dihapus.
Menu **Tentang & referensi** menyediakan tombol penghapusan.
Pada browser yang memblokir localStorage, tampil pemberitahuan; pilihan sementara tidak dijamin bertahan saat pindah halaman.

## Publikasi sendiri

Unggah seluruh isi folder `futurepath` dengan struktur tetap utuh ke hosting statis seperti GitHub Pages.
`index.html` harus berada pada root folder publik yang dipilih. Jangan hanya mengunggah file HTML.
Tidak memerlukan service worker atau konfigurasi backend.

## Catatan konten

Prototipe edukasi; bukan produk resmi instansi dan bukan asesmen psikologis.
Validasi materi bersama guru BK dan pihak sekolah sebelum dipakai untuk pembelajaran resmi.
Kampus dan profesi adalah contoh awal, bukan daftar lengkap atau jaminan kecocokan.
Informasi penerimaan, biaya, beasiswa, dan sertifikasi harus diperiksa pada sumber resmi terbaru.
