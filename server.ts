import express, { Request, Response } from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy-initialize Gemini SDK to prevent crash if key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("⚠️ GEMINI_API_KEY is not defined. AI utilities will fallback to mock generating.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || 'MOCK_KEY_FALLBACK',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// REST API for AI Utilities (RPP, LKS, Uji Teori, Uji Praktek, Penilaian)
app.post('/api/ai/generate', async (req: Request, res: Response) => {
  const { task, name, context, rating, scoreTheory, scorePractice, scoreAttitude } = req.body;
  
  if (!task) {
    return res.status(400).json({ error: 'Parameter task wajib diisi!' });
  }

  // Fallback mocks if key is not defined, ensuring app remains 100% functional
  const isMock = !process.env.GEMINI_API_KEY;

  if (isMock) {
    console.log(`Running mock generation for task: ${task}`);
    let mockResult = '';
    
    if (task === 'paket_lengkap') {
      const pId = context || 'Materi Unggulan';
      mockResult = JSON.stringify({
        rpp: `### RENCANA PELAKSANAAN PEMBELAJARAN (RPP) AI
**Lembaga**: ${name || 'Kursus Keahlian'}  
**Topik Utama**: ${pId}  
**Durasi**: 4 Pertemuan (8 Jam Pembelajaran)  

#### I. TUJUAN PEMBELAJARAN
Siswa mampu memahami konsep dasar, mempraktekkan langkah fungsional, serta mengimplementasikan secara mandiri materi tentang "${pId}" secara profesional dan selaras dengan standar kompetensi kerja nasional.

#### II. LANGKAH-LANGKAH PEMBELAJARAN
1. **Teori Dasar & Demonstrasi** (120 Menit): Instruktur mengenalkan pilar utama dari "${pId}" dan memberikan paparan interaktif serta contoh nyata.
2. **Eksplorasi Lembar Kerja** (120 Menit): Siswa mendalami studi kasus melalui pengerjaan soal tantangan LKS secara mandiri.
3. **Praktek Studio & Evaluasi** (240 Menit): Ujian keterampilan langsung dalam skenario kerja riil / pembuatan portofolio terarah.

#### III. METODE PENILAIAN
Kombinasi Tes Tertulis (Uji Teori), Tes Perbuatan (Uji Praktek), dan Penilaian Karakter (Sikap Kerja).`,
        lks: `### LEMBAR KERJA SISWA (LKS) MANDIRI
**Bahasan Pokok**: Latihan Terapan - ${pId}  
**Sasaran**: Meningkatkan penalaran logis dan eksekusi praktek terarah.  

#### I. RINGKASAN INTISARI MATERI
Bacalah bab pengenalan tentang "${pId}" pada modul utama. Amati video tutorial dan catat poin-poin penting mengenai urutan kerja dan keselamatan operasional sebelum melangkah ke lembar tugas praktis.

#### II. PERTANYAAN ESSAY ANALITIS
1. Bagaimana cara Anda mendiagnosis kegagalan awal dalam menerapkan prosedur "${pId}"?
2. Sebutkan 3 aspek kritis yang paling menentukan kualitas keluaran (output) pada bahasan materi ini!
3. Mengapa keselamatan kerja (K3) atau kepatuhan SOP sangat ditekankan saat melakukan praktek mandiri?

#### III. TANTANGAN PROYEK PRAKTEK
Buatlah demo rancangan bertema "${pId}" menggunakan peralatan standar yang ada di kelas. Sampaikan dokumentasi kerja berupa log harian/screenshoot kepada instruktur untuk dinilai ke dalam porto-raport.`,
        uji_teori: `### LEMBAR UJIAN TEORI TERTULIS
**Materi**: Evaluasi Penguasaan Konsep - ${pId}  
**Waktu**: 45 Menit  

#### BAGIAN A: SOAL PILIHAN GANDA (Pilihlah salah satu opsi terbaik)
1. **Langkah awal yang mutlak dipersiapkan sebelum mengaplikasikan konsep ${pId} adalah...**
   * a) Langsung melakukan tanpa perencanaan terdokumentasi
   * b) Menganalisis kebutuhan, menyiapkan alat sesuai spesifikasi, dan mematuhi SOP (Jawaban Benar)
   * c) Menunggu instruktur melakukan semua pekerjaan
   * d) Melewati tahapan uji coba demi efisiensi

2. **Dampak utama dari ketidakdisiplinan siswa dalam merujuk pedoman kerja ${pId} adalah...**
   * a) Kecepatan penyelesaian kerja tuntas lebih cepat
   * b) Kualitas output di bawah standar kerja industri dan rawan kecelakaan (Jawaban Benar)
   * c) Nilai kualifikasi akreditasi lembaga meningkat otomatis
   * d) Bertambahnya durasi waktu magang

#### BAGIAN B: ESSAY URUTAN KERJA
1. Jelaskan urutan logis langkah demi langkah yang Anda lakukan dari persiapan hingga penyelesaian dalam topik "${pId}"!`,
        uji_praktek: `### LEMBAR UJIAN PRAKTEK & KINERJA NYATA
**Instruksi Kerja**: Demonstrasikan penguasaan fungsional ${pId}.

#### I. PRASYARAT SARANA PRASARANA
- Alat kerja utama dalam keadaan steril dan siap operasional.
- Lembar panduan penilaian kerja cetak.
- Jeda waktu maksimal pengerjaan: 90 menit tanpa interupsi eksternal.

#### II. LANGKAH PENGERJAAN MANDIRI
1. Siapkan peralatan utama sesuai dengan ceklis pra-SOP.
2. Selesaikan rancangan fungsional bertema "${pId}" di bawah pengawasan instruktur kelas.
3. Bersihkan kembali area kerja dan buat laporan tertulis ringkas hasil pemeriksaan kepatuhan.

#### III. MATRIKS RUBRIK SKOR (10-100)
- **Persiapan Kerja (20%)**: Kedisiplinan K3 dan pengaturan perkakas.
- **Penguasaan Teknis (50%)**: Presisi alur kerja dan penanganan kendala tak terduga.
- **Kualitas Akhir (30%)**: Kerapian, fungsionalitas produk, dan efisiensi waktu kerja.`,
        cara_penilaian: `### PANDUAN & CARA PENILAIAN LENGKAP
**Formula Kelulusan Paket**: ${pId}

#### I. BOBOT INDEKS KELULUSAN AKHIR (NA)
Sistem penilaian dirancang terpadu dengan proporsi pembobotan seimbang:
$$NA = (0.3 \\times S_{Teori}) + (0.5 \\times S_{Praktek}) + (0.2 \\times S_{Sikap})$$

Keterangan Bobot:
- **Skor Teori (S_Teori - 30%)**: Diambil dari hasil Lembar Ujian Teori tertulis.
- **Skor Praktek (S_Praktek - 50%)**: Diambil dari Rubrik Kinerja Ujian Praktek.
- **Skor Sikap (S_Sikap - 20%)**: Diukur melalui jurnal kepatuhan SOP, kedisiplinan kehadiran, dan kerapisan.

#### II. KRITERIA KETUNTASAN MINIMAL (KKM)
- Nilai minimal untuk dinyatakan Kompeten adalah **75.00**.
- Siswa dengan nilai di bawah 75.00 wajib mengikuti program remedial terstruktur dan pengerjaan ulang LKS.`
      });
    } else if (task === 'rpp') {
      mockResult = `### RENCANA PELAKSANAAN PEMBELAJARAN (RPP) AI
**Mata Pelajaran/Kursus**: ${name || 'Kursus Keahlian'}
**Materi Pembelajaran**: ${context || 'Pengenalan Fundamental'}

#### I. TUJUAN PEMBELAJARAN
Membantu siswa memahami dasar-dasar bidang ${name} secara teoritis dan praktis guna menumbuhkan kemandirian keahlian sesuai Standar Nasional Pendidikan (SNP) Indonesia.

#### II. METODE PEMBELAJARAN
- Ceramah & Studi Kasus Interaktif (20%)
- Demonstrasi terbimbing (30%)
- Praktek Mandiri Terarah (50%)

#### III. KEGIATAN PEMBELAJARAN
1. **Pendahuluan** (15 Menit): Motivasi, penyampaian tujuan materi ${context}, pre-test lisan singkat.
2. **Inti** (90 Menit): Penjelasan konsep dasar, pemutaran presentasi, demonstrasi praktek langsung menggunakan fasilitas sarana prasarana, tanya jawab interaktif.
3. **Penutup** (15 Menit): Resume materi, pengerjaan Lembar Kerja Siswa (LKS), penyampaian tugas rumah.

#### IV. SUMBER BELAJAR & MEDIA
Modul Lembaga Kursus internal, Video tutorial interaktif, slide presentasi.

#### V. PENILAIAN / EVALUASI
- **Teori**: Uji Pilihan Ganda & Isian Singkat.
- **Praktek**: Rubrik Hasil Portofolio & Kecepatan Kerja.
- **Sikap**: Observasi Kerajinan, Kedisiplinan, Keaktifan.

---
*Catatan: RPP ini dibuat otomatis oleh Asisten AI Pintar khusus untuk menyelaraskan dengan 8 SNP Akreditasi Lembaga Kursus.*`;
    } else if (task === 'lks') {
      mockResult = `### LEMBAR KERJA SISWA (LKS) AI
**Materi Mandiri**: ${context || 'Latihan Dasar'}  
**Nama Siswa**: ............................  
**Tanggal**: ............................

#### I. INFORMASI SINGKAT & RUJUKAN
Harap pelajari berkas materi utama serta amati demonstrasi instruktur sebelum menjawab pertanyaan. Gunakan sarana prasarana yang tersedia dengan tertib.

#### II. PERTANYAAN ESSAY PENALARAN
1. Jelaskan prinsip utama di balik penerapan **${context}** dalam aktivitas industri riil!
2. Gambarkan langkah-langkah prosedural dalam melakukan pemecahan masalah (troubleshooting) untuk kasus ini!
3. Sebutkan setidaknya 3 alat penunjang utama yang wajib dikondisikan sebelum memulai praktek materi ini!

#### III. LEMBAR TUGAS PRAKTEK MANDIRI
* **Instruksi**: Buatlah rancangan sederhana mengenai implementasi ${context}. Rekam/dokumentasikan hasil kerja Anda untuk diunggah sebagai bukti portfolio.
* **Rubrik Kelayakan**: Keselarasan Desain (40%), Ketepatan Eksekusi (40%), Sikap & Kerapian (20%).`;
    } else if (task === 'uji_teori') {
      mockResult = `### LEMBAR UJIAN TEORI AI
**Materi Uji**: ${context || 'Ujian Komparatif'}  
**Tingkat Kelas**: Menengah  
**Durasi Waktu**: 60 Menit

#### SOAL PILIHAN GANDA (Pilihlah jawaban yang paling tepat!)

**1. Manakah di bawah ini yang merupakan pilar fundamental utama dari ${context}?**
* a) Pengabaian proses dokumentasi reguler
* b) Struktur terencana, disiplin praktek, dan integrasi teori standar (Pilihan Tepat)
* c) Penggunaan metode instan tanpa evaluasi
* d) Hanya fokus pada teori lisan tanpa praktek

**2. Apa kendala terbesar yang sering dijumpai jika pelaksanaan ${context} tidak disertai pemenuhan sarana memadai?**
* a) Keaktifan siswa meningkat drastis
* b) Kurangnya pemahaman praktek fungsional yang berkualitas (Pilihan Tepat)
* c) Penghematan anggaran operasional secara masif
* d) Terlampauinya target akreditasi 8 SNP

**3. Manakah metode terbaik untuk melacak performa pemahaman siswa selain ujian akhir tulis?**
* a) Melakukan observasi jurnal dan pengisian LKS reguler (Pilihan Tepat)
* b) Membiarkan siswa belajar mandiri tanpa pengawasan
* c) Mengurangi jam pertemuan pengajar secara sepihak
* d) Menghapus kriteria standar sikap kelulusan

#### SOAL ESSAY / URAIAN
1. Jabarkan secara terperinci mengapa penguasaan **${context}** sangat vital dalam bersaing di pasar kerja modern saat ini!
2. Tuliskan analisis efektivitas penggabungan teori dan praktek dalam proses pembelajaran yang ideal menurut pendapat Anda!`;
    } else if (task === 'uji_praktek') {
      mockResult = `### LEMBAR UJIAN PRAKTEK AI
**Mata Pelajaran**: ${name || 'Kursus Keahlian'}  
**Topik Praktek**: $${context || 'Pengujian Keterampilan Kerja'}

#### I. ALAT & BAHAN PRAKTEK
Sebelum memulai proses ujian, pastikan sarana prasarana berikut siap digunakan dalam kondisi prima:
1. Lembar Prosedur Kerja Kerja Siswa
2. Perangkat Kerja Utama (Komputer / Mesin Jahit / Alat Tulis / Bahan Mentah sesuai program)
3. Stopwatch pengukur waktu pengerjaan

#### II. INSTRUKSI TUGAS PRAKTEK
Instruksikan siswa untuk mengeksekusi langkah-langkah pengerjaan:
1. Lakukan persiapan area kerja kerja dengan menerapkan aspek Keselamatan Kerja (K3).
2. Selesaikan rancangan desain fungsional bertema "${context}" dalam waktu maksimal 90 menit.
3. Lakukan pengujian mandiri (quality checking) sebelum menyerahkan hasil kepada instruktur penilai.

#### III. RUBRIK PENILAIAN (SKOR 10 - 100)
- **Aspek Persiapan & Kebersihan (Bobot 20%)**: Menilai ketepatan kesiapan alat serta perilaku tertib di ruang praktek.
- **Aspek Keterampilan Teknik (Bobot 50%)**: Keakuratan pengerjaan langkah demi langkah sesuai standar operasi baku (SOP).
- **Aspek Kecepatan & Ketepatan (Bobot 30%)**: Ketepatan waktu dalam menyelesaikan tugas dengan rapi tanpa cacat.`;
    } else if (task === 'evaluasi') {
      mockResult = `Siswa menunjukkan pemahaman teori yang sangat baik (skor ${scoreTheory}/100) dikombinasikan dengan keterampilan praktek yang mantap (skor ${scorePractice}/100). Sikap selama di kelas dinilai "${scoreAttitude}" yang mencerminkan kedisiplinan dan rasa tanggung jawab yang tinggi. Sangat direkomendasikan untuk melanjutkan ke level tingkat lanjut dan aktif berpartisipasi dalam program magang kerja kemitraan Lembaga Kursus.`;
    } else if (task === 'faq') {
      mockResult = JSON.stringify([
        {
          q: `Bagaimana sistem pembelajaran ${context || 'materi'} di LKP ${name || 'kami'}?`,
          a: `Pembelajaran ${context || 'kursus'} di LKP ${name || 'kami'} dirancang secara interaktif, mengedepankan praktek langsung (80%) and teori (20%) agar lulusan siap kerja dan kompeten.`
        },
        {
          q: `Apakah program ${context || 'kursus'} di LKP ${name || 'kami'} cocok untuk pemula?`,
          a: `Tentu sangat cocok! Kurikulum kami disusun terstruktur mulai dari materi dasar paling awal hingga mahir, lengkap dengan bimbingan personal dari instruktur berpengalaman.`
        },
        {
          q: `Bagaimana dengan penyaluran kerja setelah lulus menyelesaikan kelas ${context || 'keahlian'} ini?`,
          a: `Kami bermitra dengan sejumlah instansi dan perusahaan terkemuka untuk membantu menyalurkan lulusan berprestasi melalui program evaluasi berkala.`
        }
      ]);
    } else if (task === 'rights_duties') {
      mockResult = JSON.stringify({
        rights: `Mengusulkan program inovasi peningkatan mutu, mengkoordinir sarana internal divisi ${name || 'Kursus'}, serta mewakili lembaga dalam koordinasi operasional terkait.`,
        duties: `Menyusun rencana kerja unit ${name || 'Operasional LKP'}, mengawasi administrasi aktivitas belajar mengajar harian, serta melaporkan dokumentasi evaluasi berkala kepada direktur.`
      });
    } else if (task === 'sk') {
      const matchesLkp = context ? context.match(/Lembaga Kursus:\s*([^\n]+)/) : null;
      const matchesAddr = context ? context.match(/Alamat:\s*([^\n]+)/) : null;
      const matchesNpsn = context ? context.match(/NPSN:\s*([^\n]+)/) : null;
      const matchesIzin = context ? context.match(/Izin Operasional Dinas Pendidikan:\s*([^\n]+)/) : null;
      const matchesPimpName = context ? context.match(/Nama Pimpinan:\s*([^\n]+)/) : null;
      const matchesPimpRole = context ? context.match(/Jabatan Pimpinan:\s*([^\n]+)/) : null;
      const matchesPhone = context ? context.match(/Telepon:\s*([^\n]+)/) : null;
      const matchesEmail = context ? context.match(/Email:\s*([^\n]+)/) : null;
      const matchesDate = context ? context.match(/Tanggal SK:\s*([^\n]+)/) : null;

      const matchesName = context ? context.match(/Nama Personel:\s*([^\n]+)/) : null;
      const matchesRole = context ? context.match(/Jabatan\/Role:\s*([^\n]+)/) : null;
      const matchesNum = context ? context.match(/Nomor SK:\s*([^\n]+)/) : null;
      const matchesType = context ? context.match(/Tipe SK:\s*([^\n]+)/) : null;
      
      const lkpName = matchesLkp ? matchesLkp[1].trim() : 'Lembaga Pendidikan/Kursus';
      const address = matchesAddr ? matchesAddr[1].trim() : 'DIY Yogyakarta';
      const npsn = matchesNpsn ? matchesNpsn[1].trim() : 'K9998182';
      const izin = matchesIzin ? matchesIzin[1].trim() : '421.10/01-Disdik';
      const pimpName = matchesPimpName ? matchesPimpName[1].trim() : 'Pimpinan Lembaga';
      const pimpRole = matchesPimpRole ? matchesPimpRole[1].trim() : 'Direktur Utama';
      const phone = matchesPhone ? matchesPhone[1].trim() : '0812-3456-7890';
      const email = matchesEmail ? matchesEmail[1].trim() : 'info@lembaga.com';
      const skDateText = matchesDate ? matchesDate[1].trim() : '22 Juni 2026';

      const pName = matchesName ? matchesName[1].trim() : 'Staf LKP';
      const pRole = matchesRole ? matchesRole[1].trim() : 'Staf Operasional';
      const pNum = matchesNum ? matchesNum[1].trim() : '142/SK-DIR/LKP-WN/VI/2026';
      const pType = matchesType ? matchesType[1].trim() : 'SK Pengangkatan Jabatan';

      mockResult = `KOP SURAT RESMI INSTITUSI
==================================================
${lkpName.toUpperCase()}
Izin Dinas: ${izin} | NPSN: ${npsn}
Alamat: ${address}
Telepon: ${phone} | Email: ${email}
==================================================

SURAT KEPUTUSAN PIMPINAN ${lkpName.toUpperCase()}
Nomor: ${pNum}

TENTANG
${pType.toUpperCase()}

Menimbang:
1. Bahwa untuk menjamin kelancaran tata laksana kerja, diperlukan kejelasan status hukum personil yang kompeten.
2. Bahwa personil yang tercantum di bawah ini memenuhi syarat profesionalisme dan dedikasi penuh.

Mengingat:
1. UU RI No. 20 Tahun 2003 tentang Sistem Pendidikan Nasional.
2. Peraturan Pemerintah RI No. 17 Tahun 2010 tentang Penyelenggaraan Pendidikan.

MEMUTUSKAN:

Menetapkan:
KESATU: Mengangkat dan menetapkan secara resmi:
Penerima Tugas: 👉 ${pName} 👈
Jabatan/Role: ${pRole}

KEDUA: Menugaskan yang bersangkutan bekerja profesional sesuai standar operasional yang berlaku di lembaga.

KETIGA: Memberikan seluruh hak-hak kesejahteraan, kewenangan, dan pengakuan tugas fungsional yang relevan.

KEEMPAT: Keputusan ini berlaku sejak tanggal ditetapkan, dan jika terdapat kekeliruan akan diperbaiki sebagaimana mestinya.

Ditetapkan di: Yogyakarta
Pada Tanggal: ${skDateText}

Pimpinan ${lkpName},


${pimpName}
${pimpRole}`;
    }

    // Delay slightly to simulate AI API Call latencies
    await new Promise(resolve => setTimeout(resolve, 1200));
    return res.json({ result: mockResult });
  }

  // Real Gemini Service Action
  try {
    const ai = getGeminiClient();
    let prompt = '';
    let systemInstruction = 'Anda adalah konsultan pendidikan dan asisten instruktur cerdas untuk Lembaga Kursus resmi di Indonesia yang menyelaraskan materi dengan 8 Standar Nasional Pendidikan (SNP) Akreditasi.';

    if (task === 'paket_lengkap') {
      prompt = `Buatlah SATU PAKET PEMBELAJARAN LENGKAP untuk kursus/mata pelajaran "${name}" bertema utama: "${context}".
Paket ini harus berisi 5 dokumen terpisah yang saling menyatu secara holistik dan logis:
1. "rpp": Rencana Pelaksanaan Pembelajaran (RPP) formal dan detail (Identitas, Tujuan, Metode, Alur Belajar Pendahuluan/Inti/Penutup, Media).
2. "lks": Lembar Kerja Siswa (LKS) siap print (Ringkasan materi kontekstual, 3 soal kritis, 1 tantangan proyek).
3. "uji_teori": Lembar Ujian Teori (2 Soal Pilihan Ganda dengan kunci jawaban, dan 1 Soal Essay analitis).
4. "uji_praktek": Lembar Ujian Praktek (Instruksi kerja praktek mandiri, alat bahasan, rubrik penilaian detail).
5. "cara_penilaian": Kriteria dan Cara Pembobotan Penilaian (Sistem penilaian akhir, formula proporsi gabungan teori-praktek-sikap, dan KKM standar).

Seluruh bagian wajib ditulis dalam Bahasa Indonesia yang profesional dan akademis. Anda wajib menghasilkan output dalam format JSON objek dengan kunci string format markdown yang rapi:
{
  "rpp": "...isi RPP dalam markdown...",
  "lks": "...isi LKS dalam markdown...",
  "uji_teori": "...isi Uji Teori dalam markdown...",
  "uji_praktek": "...isi Uji Praktek dalam markdown...",
  "cara_penilaian": "...isi Cara Penilaian dalam markdown..."
}`;
    } else if (task === 'rpp') {
      prompt = `Buatlah Rencana Pelaksanaan Pembelajaran (RPP) yang sangat detail, formal, rapi, dan terstruktur untuk kursus ${name}.
Topik materi: "${context}".
RPP harus mencakup: Identitas Kursus, Tujuan Pembelajaran, Metode, Langkah-Langkah Pembelajaran (Pendahuluan, Inti, Penutup dengan alokasi menit yang logis), Media/Sumber Belajar, dan Metode Penilaian Pembelajaran. Gunakan format Markdown Indonesia yang rapi.`;
    } else if (task === 'lks') {
      prompt = `Buatlah Lembar Kerja Siswa (LKS) profesional dan printable untuk kursus ${name}.
Materi Bahasan: "${context}".
LKS harus mencakup ringkasan instruksi kontekstual, 3-5 pertanyaan essay yang membutuhkan penalaran kritis, serta instruksi tugas praktek mandiri yang menantang kreativitas siswa. Gunakan format Markdown Indonesia yang menarik dan siap dicetak.`;
    } else if (task === 'uji_teori') {
      prompt = `Buatlah Lembar Ujian Teori tertulis yang bermutu untuk kursus ${name}.
Materi Uji: "${context}".
Buatlah 3 soal Pilihan Ganda (sertakan indikasi pilihan jawaban yang tepat) dan 2 soal Essay yang mendalam. Gunakan bahasa Indonesia standar akademis yang jelas dan rapi.`;
    } else if (task === 'uji_praktek') {
      prompt = `Buatlah Lembar Ujian Praktek / Keterampilan Kerja untuk kursus ${name}.
Materi Praktek: "${context}".
Berikan rincian Alat & Bahan yang dibutuhkan, Instruksi Langkah-Langkah Pengerjaan Tugas Praktek, serta Rubrik Penilaian detail dengan pembobotan nilai yang adil (misal Persiapan, Keterampilan Teknis, Penggunaan Alat, Hasil Akhir/Kerapisan).`;
    } else if (task === 'evaluasi') {
      prompt = `Berikan kalimat ulasan raport (AI Raport Feedback) yang profesional, formal, dan konstruktif dalam bahasa Indonesia untuk siswa dengan hasil belajar berikut:
- Nilai Ujian Teori: ${scoreTheory} dari 100
- Nilai Ujian Praktek: ${scorePractice} dari 100
- Nilai Sikap / Perilaku: "${scoreAttitude}"
Ulasan harus setebal 2-3 kalimat, objektif, memuji keberhasilan, ramah, dan memberikan saran peningkatan karir di masa depan.`;
    } else if (task === 'faq') {
      prompt = `Buatlah 3 pasang pertanyaan dan jawaban (FAQ - Frequently Asked Questions) yang profesional, informatif, dan ramah untuk calon siswa atau pendaftar Lembaga Kursus Pelatihan (LKP) bernama "${name}".
Fokus topik/konteks FAQ yang diinginkan: "${context || 'Umum'}".
Jawaban harus meyakinkan, profesional, mendalam namun mudah dipahami, dan memberikan kejelasan penuh mengenai LKP tersebut.
Format output wajib berupa JSON Array dengan objek yang memiliki kunci "q" (pertanyaan) dan "a" (jawaban).`;
    } else if (task === 'rights_duties') {
      prompt = `Berikan rekomendasi Hak & Kewenangan Jabatan serta Kewajiban & Tugas Pokok Jabatan untuk posisi/jabatan bernama "${name}" pada Lembaga Kursus dan Pelatihan (LKP).
Atas Nama Pengurus/Staf: "${context || 'Pengurus LKP'}".
Berikan ulasan yang sangat bermutu, formal, konkret untuk operasional LKP di Indonesia sesuai Standar Kompetensi Administrasi Manajemen Pendidikan Nonformal.
Format output harus berupa objek JSON dengan kunci "rights" (hak/kewenangan secara detail) and "duties" (kewajiban/tugas pokok secara detail).`;
    } else if (task === 'sk') {
      prompt = context;
      systemInstruction = 'Anda adalah staf legalitas dan konsultan hukum organisasi nonformal khusus Lembaga Kursus dan Pelatihan (LKP). Buatlah draf Surat Keputusan (SK) formal yang sah, ringkas, padat, langsung ke intinya (tidak bertele-tele), rapi, menggunakan format kop surat dan tanda tangan yang sesuai profil lembaga.';
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: (task === 'faq' || task === 'rights_duties' || task === 'paket_lengkap') ? 'application/json' : undefined,
        responseSchema: task === 'faq' ? {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              q: { type: Type.STRING, description: 'Pertanyaan eksplisit untuk calon pendaftar LKP' },
              a: { type: Type.STRING, description: 'Jawaban penjelasan ramah dan profesional' }
            },
            required: ['q', 'a']
          }
        } : task === 'rights_duties' ? {
          type: Type.OBJECT,
          properties: {
            rights: { type: Type.STRING, description: 'Rekomendasi hak & kewenangan jabatan operasional LKP dalam kalimat terstruktur' },
            duties: { type: Type.STRING, description: 'Rekomendasi kewajiban & tugas pokok harian pengurus LKP dalam kalimat terstruktur' }
          },
          required: ['rights', 'duties']
        } : task === 'paket_lengkap' ? {
          type: Type.OBJECT,
          properties: {
            rpp: { type: Type.STRING, description: 'Rencana Pelaksanaan Pembelajaran (RPP) dalam format Markdown Indonesia' },
            lks: { type: Type.STRING, description: 'Lembar Kerja Siswa (LKS) dalam format Markdown Indonesia' },
            uji_teori: { type: Type.STRING, description: 'Lembar Ujian Teori dalam format Markdown Indonesia' },
            uji_praktek: { type: Type.STRING, description: 'Lembar Ujian Praktek dalam format Markdown Indonesia' },
            cara_penilaian: { type: Type.STRING, description: 'Panduan & Cara Penilaian dalam format Markdown Indonesia' }
          },
          required: ['rpp', 'lks', 'uji_teori', 'uji_praktek', 'cara_penilaian']
        } : undefined
      }
    });

    const resultText = response.text || 'Gagal menghasilkan konten dari asisten AI.';
    return res.json({ result: resultText });
    
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ 
      error: 'Terjadi kesalahan sistem saat menghubungi asisten AI.',
      details: error.message 
    });
  }
});

// Setup Vite Dev server or static asset serving in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
