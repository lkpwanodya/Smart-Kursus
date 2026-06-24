import { Institution, SnpStandard } from '../types';

export const INITIAL_SNP_STANDARDS = (): SnpStandard[] => [
  {
    id: 1,
    title: 'Standar Standar Isi',
    percentage: 80,
    checklist: [
      { id: '1a', task: 'Dokumen KTSP / Kurikulum Satuan Pendidikan tersedia', checked: true, evidence: 'Dokumen_KTSP_2026.pdf' },
      { id: '1b', task: 'Silabus setiap program kursus disahkan pimpinan', checked: true, evidence: 'Silabus_WebDev_signed.pdf' },
      { id: '1c', task: 'Beban belajar terstruktur dengan jam pembelajaran jelas', checked: false, evidence: '' }
    ]
  },
  {
    id: 2,
    title: 'Standar Proses',
    percentage: 66,
    checklist: [
      { id: '2a', task: 'RPP (Rencana Pelaksanaan Pembelajaran) dibuat oleh pengajar', checked: true, evidence: 'RPP_Disimpan_Sistem.pdf' },
      { id: '2b', task: 'Rasio instruktur dan siswa seimbang (< 1:20)', checked: true, evidence: 'Data_Siswa_Aktif.xlsx' },
      { id: '2c', task: 'Pelaksanaan evaluasi proses pembelajaran harian', checked: false, evidence: '' }
    ]
  },
  {
    id: 3,
    title: 'Standar Kompetensi Lulusan',
    percentage: 100,
    checklist: [
      { id: '3a', task: 'Adanya kualifikasi minimal kelulusan tes teori/praktek', checked: true, evidence: 'SK_Manajemen_Kelulusan.pdf' },
      { id: '3b', task: 'Dokumen penilaian sikap / perilaku budi pekerti lulusan', checked: true, evidence: 'Instrumen_Penilaian_Sikap.pdf' }
    ]
  },
  {
    id: 4,
    title: 'Standar Pendidik & Tenaga Kependidikan',
    percentage: 50,
    checklist: [
      { id: '4a', task: 'Instruktur memiliki sertifikat kompetensi keahlian relevan', checked: true, evidence: 'Sertifikat_Kompetensi_BNSP.pdf' },
      { id: '4b', task: 'Tenaga Kependidikan / staf administrasi minimal lulusan SMA', checked: false, evidence: '' }
    ]
  },
  {
    id: 5,
    title: 'Standar Sarana Prasarana',
    percentage: 75,
    checklist: [
      { id: '5a', task: 'Memiliki gedung mandiri/sewa minimal luas memadai', checked: true, evidence: 'Sertifikat_Sewa_Gedung.pdf' },
      { id: '5b', task: 'Ketersediaan sarana praktek utama sesuai kapasitas kelas', checked: true, evidence: 'Inventaris_Lab_Aktif.pdf' },
      { id: '5c', task: 'Ruang administrasi dan sanitasi terpisah dan layak', checked: false, evidence: '' }
    ]
  },
  {
    id: 6,
    title: 'Standar Pengelolaan',
    percentage: 100,
    checklist: [
      { id: '6a', task: 'Papan nama lembaga dipasang jelas di depan gedung', checked: true, evidence: 'Foto_Papan_Nama.jpg' },
      { id: '6b', task: 'Izin Operasional / NPSN terdaftar di Kesharlindung / Kemendikbud', checked: true, evidence: 'SK_Izin_Dinas_Pendidikan.pdf' }
    ]
  },
  {
    id: 7,
    title: 'Standar Pembiayaan',
    percentage: 100,
    checklist: [
      { id: '7a', task: 'Rencana Anggaran & Belanja (RAB) lembaga tahunan lengkap', checked: true, evidence: 'RAB_Lembaga_2026.xlsx' },
      { id: '7b', task: 'Pencatatan kas masuk & kas keluar (Jurnal Keuangan) harian', checked: true, evidence: 'Ledger_Keuangan_Sistem.xlsx' }
    ]
  },
  {
    id: 8,
    title: 'Standar Penilaian Pendidikan',
    percentage: 50,
    checklist: [
      { id: '8a', task: 'Pelaksanaan ujian akhir kelulusan teori dan praktek', checked: true, evidence: 'Bank_Soal_Ujian.pdf' },
      { id: '8b', task: 'Penerbitan Buku Raport hasil belajar siswa resmi', checked: false, evidence: '' }
    ]
  }
];

export const DUMMY_INSTITUTIONS = (): Institution[] => [
  {
    id: 'lkp-tech',
    name: 'Lembaga Kursus Computer Tech',
    email: 'tech@lkp.id',
    password: 'password123',
    activeUntil: '2026-12-31',
    profile: {
      address: 'Jl. Merdeka No. 45, Bandung',
      phone: '022-4217890',
      email: 'tech@lkp.id',
      vision: 'Menjadi pusat pelatihan teknologi informasi terdepan dan mencetak profesional IT yang kompeten, kreatif, serta siap kerja.',
      mission: '1. Menyelenggarakan kursus pemrograman modern yang sesuai kebutuhan industri.\n2. Menyediakan sarana praktek berteknologi mutakhir.\n3. Mengembangkan kerjasama dengan berbagai perusahaan nasional untuk penyerapan lulusan.'
    },
    students: [
      { id: 's1', name: 'Rian Syah', nik: '3273012903020005', email: 'rian@gmail.com', phone: '08123456789', programId: 'p1', registrationType: 'Offline', joinDate: '2026-01-10', status: 'Aktif' },
      { id: 's2', name: 'Andini Putri', nik: '3273055507010002', email: 'andini@gmail.com', phone: '08219876543', programId: 'p1', registrationType: 'Online', joinDate: '2026-01-12', status: 'Aktif' },
      { id: 's3', name: 'Fikri Aditya', nik: '3273091112030008', email: 'fikri@gmail.com', phone: '08778844221', programId: 'p2', registrationType: 'Online', joinDate: '2026-02-05', status: 'Aktif' },
      { id: 's4', name: 'Meitha Sari', nik: '3273081504020001', email: 'meitha@gmail.com', phone: '08561122334', programId: 'p2', registrationType: 'Offline', joinDate: '2026-02-06', status: 'Lulus' }
    ],
    teachers: [
      { id: 't1', name: 'Budi Santoso, M.T.', specialty: 'Web Development / Fullstack' },
      { id: 't2', name: 'Siti Aminah, S.Kom.', specialty: 'Desain Grafis / UI/UX' },
      { id: 't3', name: 'Samsul Arifin', specialty: 'Jaringan & Hardware' }
    ],
    programs: [
      { id: 'p1', name: 'Web Developer Fullstack', price: 3500000, regFee: 200000, tuitionFee: 2700000, monthlyFee: 200000, duration: '3 Bulan', description: 'Belajar HTML, CSS, React, NodeJS, Express, dan basis data SQL/NoSQL sampai mahir.', status: 'Aktif' },
      { id: 'p2', name: 'UI/UX & Graphic Design', price: 2800000, regFee: 150000, tuitionFee: 2200000, monthlyFee: 150000, duration: '2 Bulan', description: 'Penguasaan alat Figma, Photoshop, Illustrator, serta fundamental desain visual.', status: 'Aktif' },
      { id: 'p3', name: 'Digital Marketing Specialist', price: 2500000, regFee: 150000, tuitionFee: 2000000, monthlyFee: 150000, duration: '2 Bulan', description: 'Facebook Ads, SEO/SEM, Google Analytics, Copywriting, dan strategi media sosial.', status: 'Aktif' }
    ],
    structure: [
      { id: 'st1', name: 'Heri Gunawan', role: 'Direktur Lembaga Kursus', parentId: null, rights: 'Memberikan keputusan keputusan strategis, menyetujui rancangan alokasi dana belanja (RAB), serta menandatangani ijazah kelulusan siswa.', duties: 'Memimpin keseluruhan jalannya operasional Lembaga Kursus, memastikan kepatuhan administrasi terhadap dinas pendidikan, serta mengayomi staf pengajar.' },
      { id: 'st2', name: 'Rismawati, S.E.', role: 'Sekretaris & Admin', parentId: 'st1', rights: 'Mengatur arsip keperdataan siswa, mengakses pendaftaran sistem, dan memvalidasi data registrasi.', duties: 'Mengelola persuratan lembaga, mendata pendaftaran siswa, mengarsipkan dokumen kemitraan, serta melayani tamu.' },
      { id: 'st3', name: 'Kartika Sari', role: 'Bendahara Keuangan', parentId: 'st1', rights: 'Mencairkan pengeluaran operasional yang disetujui pimpinan, memegang kas utama, dan memeriksa keselarasan kuitansi.', duties: 'Melakukan pencatatan jurnal transaksi harian, menagih tunggakan SPP siswa, serta merekap neraca keuangan periodik.' },
      { id: 'st4', name: 'Budi Santoso, M.T.', role: 'Koordinator Instruktur', parentId: 'st1', rights: 'Mengevaluasi keselarasan modul ajar harian milik guru dan mengusulkan pembaruan standar operasional pembelajaran.', duties: 'Menyusun penempatan jadwal mengajar mingguan, memastikan ketersediaan bahan praktek laboratorium, serta membimbing penyusunan raport belajar siswa.' }
    ],
    calendar: [
      { id: 'c1', title: 'Orientasi Pembelajaran Gelombang 1', date: '2026-07-01', type: 'Akademik' },
      { id: 'c2', title: 'Mulai Kelas Web Developer', date: '2026-07-03', type: 'Akademik' },
      { id: 'c3', title: 'Uji Teori Pembuatan API', date: '2026-08-15', type: 'Ujian' },
      { id: 'c4', title: 'Libur Hari Kemerdekaan RI', date: '2026-08-17', type: 'Libur' },
      { id: 'c5', title: 'Ujian Praktek Portofolio Akhir', date: '2026-09-25', type: 'Ujian' }
    ],
    schedule: [
      { id: 'sc1', programId: 'p1', teacherId: 't1', day: 'Senin', time: '09:00 - 12:00', room: 'Lab Komputer A' },
      { id: 'sc2', programId: 'p1', teacherId: 't1', day: 'Rabu', time: '09:00 - 12:00', room: 'Lab Komputer A' },
      { id: 'sc3', programId: 'p2', teacherId: 't2', day: 'Selasa', time: '13:00 - 15:30', room: 'Lab Multimedia' },
      { id: 'sc4', programId: 'p2', teacherId: 't2', day: 'Kamis', time: '13:00 - 15:30', room: 'Lab Multimedia' }
    ],
    attendance: [
      { id: 'a1', studentId: 's1', date: '2026-06-15', status: 'Hadir' },
      { id: 'a2', studentId: 's2', date: '2026-06-15', status: 'Hadir' },
      { id: 'a3', studentId: 's3', date: '2026-06-15', status: 'Izin', notes: 'Urusan Keluarga' },
      { id: 'a4', studentId: 's1', date: '2026-06-16', status: 'Hadir' },
      { id: 'a5', studentId: 's2', date: '2026-06-16', status: 'Sakit', notes: 'Surat dokter' },
      { id: 'a6', studentId: 's3', date: '2026-06-16', status: 'Hadir' }
    ],
    facilities: [
      { id: 'f1', name: 'Komputer PC Core i7 RAM 16GB', quantity: 20, condition: 'Baik', location: 'Lab Komputer A' },
      { id: 'f2', name: 'AC Daikin 1.5 PK', quantity: 2, condition: 'Baik', location: 'Lab Komputer A' },
      { id: 'f3', name: 'Projektor EPSON 3200 Lumens', quantity: 1, condition: 'Baik', location: 'Lab Komputer A' },
      { id: 'f4', name: 'Pen Tablet Wacom Intuos', quantity: 10, condition: 'Baik', location: 'Lab Multimedia' }
    ],
    budget: [
      { id: 'b1', code: 'A.1', activity: 'Honor Mengajar Instruktur Web Dev', volume: 3, unit: 'Bulan', unitPrice: 3000000, total: 9000000 },
      { id: 'b2', code: 'A.2', activity: 'Biaya Wifi Fiber Indihome 100Mbps', volume: 12, unit: 'Bulan', unitPrice: 550000, total: 6600000 },
      { id: 'b3', code: 'A.3', activity: 'Pemeliharaan AC dan Lab', volume: 4, unit: 'Kali', unitPrice: 400000, total: 1600000 },
      { id: 'b4', code: 'B.1', activity: 'Pemasaran Sosial Media & Brosur', volume: 1, unit: 'Paket', unitPrice: 2000000, total: 2000000 }
    ],
    journal: [
      { id: 'j1', date: '2026-06-01', description: 'Pajak & Biaya Iklan Instagram Ads', type: 'Kredit', category: 'Pemasaran', amount: 800000 },
      { id: 'j2', date: '2026-06-02', description: 'DP Pendaftaran Siswa Baru Rian Syah', type: 'Debit', category: 'Siswa Baru', amount: 1500000 },
      { id: 'j3', date: '2026-06-05', description: 'Pelunasan Biaya Kursus Andini Putri', type: 'Debit', category: 'Siswa Baru', amount: 3500000 },
      { id: 'j4', date: '2026-06-10', description: 'Pembayaran Bulanan Listrik PLN Lab A', type: 'Kredit', category: 'Operasional', amount: 1250000 },
      { id: 'j5', date: '2026-06-12', description: 'Kas Masuk Penjualan Modul Web Modern', type: 'Debit', category: 'Modul/Materi', amount: 900000 }
    ],
    vouchers: [
      { id: 'v1', code: 'TEKNOBARU', discount: 250000, type: 'Nominal', expiryDate: '2026-08-31', quota: 15 },
      { id: 'v2', code: 'HEMAT10', discount: 10, type: 'Persen', expiryDate: '2026-07-15', quota: 30 }
    ],
    snpStandards: INITIAL_SNP_STANDARDS(),
    raportCards: [
      { id: 'r1', studentId: 's4', period: 'Semester Ganjil 2026', theoryScore: 88, practicalScore: 92, attitudeScore: 'A', aiFeedback: 'Siswa atas nama Meitha Sari menunjukkan kompetensi yang luar biasa hebat dalam praktik pembuatan tata letak UI/UX. Desainnya fungsional dan estetis. Terus pertahankan semangat belajarnya!', teacherNotes: 'Sangat giat dan berprestasi, ramah serta rajin berdiskusi.', issueDate: '2026-06-10' }
    ],
    staffCredentials: [
      {
        id: 'staff-1',
        name: 'Andi Saputra',
        username: 'admin@wanodya.lkp',
        role: 'staf_admin',
        active: true,
        password: 'password123'
      },
      {
        id: 'staff-2',
        name: 'Siti Rahma, A.Md',
        username: 'bendahara@wanodya.lkp',
        role: 'bendahara',
        active: true,
        password: 'password123'
      },
      {
        id: 'staff-teacher-t1',
        name: 'Budi Santoso, M.T.',
        username: 'budi@wanodya.lkp',
        role: 'pengajar',
        active: true,
        password: 'password123'
      }
    ]
  },
  {
    id: 'lkp-english',
    name: 'Lembaga Kursus English Corner',
    email: 'english@lkp.id',
    password: 'password123',
    activeUntil: '2026-10-31',
    profile: {
      address: 'Jl. Sudirman No. 80, Yogyakarta',
      phone: '0274-567890',
      email: 'english@lkp.id',
      vision: 'Menembus batas dunia dengan kemampuan bahasa global yang mumpuni, komunikatif, dan berlisensi standar internasional.',
      mission: '1. Menyajikan metode penguasaan bahasa lisan praktis, menyenangkan, dan relevan.\n2. Memberikan pendampingan intensif untuk ujian IELTS & TOEFL.\n3. Menyediakan atmosfer belajar full English environment harian.'
    },
    students: [
      { id: 'se1', name: 'Dina Mariana', nik: '3404011202020003', email: 'dina@gmail.com', phone: '08112233445', programId: 'pe1', registrationType: 'Online', joinDate: '2026-03-01', status: 'Aktif' },
      { id: 'se2', name: 'Farhan Azhar', nik: '3404051608010009', email: 'farhan@gmail.com', phone: '08122883344', programId: 'pe2', registrationType: 'Offline', joinDate: '2026-03-05', status: 'Aktif' }
    ],
    teachers: [
      { id: 'te1', name: 'Mark Higgins, B.A.', specialty: 'Native Speaker / TOEFL Preparation' },
      { id: 'te2', name: 'Siti Rahayu, M.Hum.', specialty: 'Grammar and English Academic Writing' }
    ],
    programs: [
      { id: 'pe1', name: 'Spoken English for Professional', price: 1800000, regFee: 100000, tuitionFee: 1400000, monthlyFee: 150000, duration: '2 Bulan', description: 'Kursus pemantapan kelancaran pidato, debat, presentasi bisnis dalam Bahasa Inggris.', status: 'Aktif' },
      { id: 'pe2', name: 'IELTS Preparation Intensive', price: 3200000, regFee: 200000, tuitionFee: 2500000, monthlyFee: 250000, duration: '3 Bulan', description: 'Pelatihan 4 pilar ujian IELTS (Reading, Listening, Writing, Speaking) untuk target skor 7.0+.', status: 'Aktif' }
    ],
    structure: [
      { id: 'st_e1', name: 'Yusuf Mansur, Ph.D.', role: 'Kepala Sekolah', parentId: null, rights: 'Memformulasikan visi akademis, menandatangani sertifikasi siswa, dan menentukan pemenang beasiswa belajar.', duties: 'Mengoordinasikan strategi pemasaran program bahasa inggris, mengawasi kepatuhan instruktur, dan memimpin rapat bulanan.' },
      { id: 'st_e2', name: 'Ahmad Syafii', role: 'Wakil & Kurikulum', parentId: 'st_e1', rights: 'Merancang komposisi penilaian teori, merevisi pembagian materi modul harian, serta mengatur pembagian kuesioner balik.', duties: 'Mengontrol implementasi silabus harian, mendata kebutuhan ujian berkala, serta menangani konsultasi masalah akademis siswa.' }
    ],
    calendar: [
      { id: 'ce1', title: 'Placement Test Bulanan', date: '2026-07-02', type: 'Akademik' },
      { id: 'ce2', title: 'English Fun Camping', date: '2026-07-20', type: 'Kegiatan' }
    ],
    schedule: [
      { id: 'sce1', programId: 'pe1', teacherId: 'te1', day: 'Selasa', time: '16:00 - 18:00', room: 'Hall Room' },
      { id: 'sce2', programId: 'pe2', teacherId: 'te2', day: 'Jumat', time: '09:00 - 11:30', room: 'Room 101' }
    ],
    attendance: [
      { id: 'ae1', studentId: 'se1', date: '2026-06-15', status: 'Hadir' },
      { id: 'ae2', studentId: 'se2', date: '2026-06-15', status: 'Hadir' }
    ],
    facilities: [
      { id: 'fe1', name: 'Headphone Noise Cancelling Sony', quantity: 15, condition: 'Baik', location: 'Lab Listening' },
      { id: 'fe2', name: 'TV Smart LED LG 55"', quantity: 2, condition: 'Baik', location: 'Room 101' }
    ],
    budget: [
      { id: 'be1', code: 'X.1', activity: 'Gaji Native Speaker Bulanan', volume: 6, unit: 'Bulan', unitPrice: 8000000, total: 48000000 }
    ],
    journal: [
      { id: 'je1', date: '2026-06-05', description: 'Pemasukan Kas Placement Test Dina', type: 'Debit', category: 'Pendaftaran', amount: 150000 }
    ],
    vouchers: [
      { id: 've1', code: 'YESENGLISH', discount: 15, type: 'Persen', expiryDate: '2026-12-31', quota: 20 }
    ],
    snpStandards: INITIAL_SNP_STANDARDS(),
    raportCards: []
  },
  {
    id: 'lkp-busana',
    name: 'Lembaga Kursus Tata Busana Cantika',
    email: 'cantika@lkp.id',
    password: 'password123',
    activeUntil: '2026-09-15',
    profile: {
      address: 'Jl. Pemuda No. 12, Surabaya',
      phone: '031-5321456',
      email: 'cantika@lkp.id',
      vision: 'Mewujudkan wirausaha muda tata busana dan desainer terkemuka tingkat nasional yang memiliki jiwa kemandirian seni.',
      mission: '1. Memberikan kompetensi teknik jahit berkualitas tinggi, presisi, dan indah.\n2. Melatih pemahaman pola baju klasik dan modern.\n3. Melahirkan kompetensi bisnis fesyen mandiri bagi alumni.'
    },
    students: [
      { id: 'sb1', name: 'Wulan Sari', nik: '3578014502010007', email: 'wulan@gmail.com', phone: '08119922883', programId: 'pb1', registrationType: 'Offline', joinDate: '2026-04-10', status: 'Aktif' }
    ],
    teachers: [
      { id: 'tb1', name: 'Hj. Fatimah, S.Pd.', specialty: 'Seni Jahit Gaun & Kebaya Modern' }
    ],
    programs: [
      { id: 'pb1', name: 'Seni Membuat Kebaya Tradisional & Modern', price: 2100000, regFee: 100000, tuitionFee: 1700000, monthlyFee: 150000, duration: '2.5 Bulan', description: 'Belajar mandiri mendesain pola, bordir halus, payet, dan jahit kebaya nusantara berstandar pengantin.', status: 'Aktif' }
    ],
    structure: [
      { id: 'st_b1', name: 'Hj. Fatimah, S.Pd.', role: 'Pemilik Lembaga', parentId: null, rights: 'Mengatur arah investasi aset jahit, menyetujui pengadaan kebaya, serta memegang hak cipta pola orisinal baju.', duties: 'Menjaga keakuratan keteknikan kurikulum busana pengantin, mengasuh sesi workshop mandiri, serta mereview portofolio kelulusan siswa.' }
    ],
    calendar: [
      { id: 'cb1', title: 'Fashion Show Hasil Karya Siswa', date: '2026-08-10', type: 'Kegiatan' }
    ],
    schedule: [
      { id: 'scb1', programId: 'pb1', teacherId: 'tb1', day: 'Sabtu', time: '08:00 - 13:00', room: 'Ruang Workshop Utama' }
    ],
    attendance: [
      { id: 'ab1', studentId: 'sb1', date: '2026-06-15', status: 'Hadir' }
    ],
    facilities: [
      { id: 'f_b1', name: 'Mesin Jahit Portabel Digital SINGER 4423', quantity: 12, condition: 'Baik', location: 'Bengkel Jahit B' },
      { id: 'f_b2', name: 'Mesin Obras Highspeed JUKI', quantity: 3, condition: 'Baik', location: 'Bengkel Jahit B' }
    ],
    budget: [
      { id: 'bb1', code: 'TB-1', activity: 'Pembelian Benang, Kain & Peralatan Jahit', volume: 10, unit: 'Paket', unitPrice: 250000, total: 2500000 }
    ],
    journal: [
      { id: 'jb1', date: '2026-06-10', description: 'Beli Bahan Kain Kebaya Sifon Kelas', type: 'Kredit', category: 'Bahan Praktek', amount: 500000 }
    ],
    vouchers: [],
    snpStandards: INITIAL_SNP_STANDARDS(),
    raportCards: []
  }
];

export const getDynamicSnpStandards = (lembaga: Institution): SnpStandard[] => {
  const standards = [
    {
      id: 1,
      title: 'Standar Isi (Kurikulum)',
      checklist: [
        { 
          id: '1a', 
          task: 'Dokumen KTSP / Kurikulum Satuan Pendidikan tersedia', 
          checked: (lembaga.programs || []).length > 0, 
          evidence: (lembaga.programs || []).length > 0 ? `KTSP_Program_${(lembaga.programs || [])[0]?.name.replace(/[^a-zA-Z0-9]/g, '_') || ''}.pdf` : '' 
        },
        { 
          id: '1b', 
          task: 'Silabus setiap program kursus disahkan pimpinan', 
          checked: (lembaga.programs || []).length > 0, 
          evidence: (lembaga.programs || []).length > 0 ? 'Silabus_Kurikulum_Lembaga.pdf' : '' 
        },
        { 
          id: '1c', 
          task: 'Beban belajar terstruktur dengan jam pembelajaran jelas', 
          checked: (lembaga.schedule || []).length > 0, 
          evidence: (lembaga.schedule || []).length > 0 ? `Jadwal_Belajar_Terstruktur.pdf` : '' 
        }
      ]
    },
    {
      id: 2,
      title: 'Standar Proses',
      checklist: [
        { 
          id: '2a', 
          task: 'RPP (Rencana Pelaksanaan Pembelajaran) dibuat oleh pengajar', 
          checked: (lembaga.programs || []).length > 0, 
          evidence: (lembaga.programs || []).length > 0 ? 'RPP_Sistem_Terintegrasi.pdf' : '' 
        },
        { 
          id: '2b', 
          task: 'Rasio instruktur dan siswa seimbang (< 1:20)', 
          checked: (lembaga.teachers || []).length > 0 && ((lembaga.students || []).length / (lembaga.teachers || []).length) < 20, 
          evidence: (lembaga.teachers || []).length > 0 ? `Rasio_1_${Math.round((lembaga.students || []).length / (lembaga.teachers || []).length) || 1}_Siswa_Guru.pdf` : '' 
        },
        { 
          id: '2c', 
          task: 'Pelaksanaan evaluasi proses pembelajaran harian', 
          checked: (lembaga.attendance || []).length > 0, 
          evidence: (lembaga.attendance || []).length > 0 ? `Rekap_Presensi_Harian.pdf` : '' 
        }
      ]
    },
    {
      id: 3,
      title: 'Standar Kompetensi Lulusan',
      checklist: [
        { 
          id: '3a', 
          task: 'Adanya kualifikasi minimal kelulusan tes teori/praktek', 
          checked: (lembaga.raportCards || []).length > 0 || (lembaga.students || []).some(s => s.status === 'Lulus'), 
          evidence: (lembaga.raportCards || []).length > 0 ? 'SK_Manajemen_Kelulusan.pdf' : '' 
        },
        { 
          id: '3b', 
          task: 'Dokumen penilaian sikap / perilaku budi pekerti lulusan', 
          checked: (lembaga.raportCards || []).some(r => !!r.attitudeScore) || (lembaga.students || []).some(s => s.status === 'Lulus'), 
          evidence: (lembaga.raportCards || []).length > 0 ? 'Instrumen_Penilaian_Sikap.pdf' : '' 
        }
      ]
    },
    {
      id: 4,
      title: 'Standar Pendidik & Tenaga Kependidikan',
      checklist: [
        { 
          id: '4a', 
          task: 'Instruktur memiliki sertifikat kompetensi keahlian relevan', 
          checked: (lembaga.teachers || []).length > 0, 
          evidence: (lembaga.teachers || []).length > 0 ? `Sertifikat_Kompetensi_${(lembaga.teachers || []).length}_Instruktur.pdf` : '' 
        },
        { 
          id: '4b', 
          task: 'Tenaga Kependidikan / staf administrasi minimal lulusan SMA', 
          checked: (lembaga.teachers || []).length > 1 || (lembaga.structure && (lembaga.structure || []).length > 0), 
          evidence: (lembaga.teachers || []).length > 1 ? 'Ijazah_Staff_Lembaga.pdf' : '' 
        }
      ]
    },
    {
      id: 5,
      title: 'Standar Sarana Prasarana',
      checklist: [
        { 
          id: '5a', 
          task: 'Memiliki gedung mandiri/sewa minimal luas memadai', 
          checked: (lembaga.facilities || []).length > 0, 
          evidence: (lembaga.facilities || []).length > 0 ? 'Sertifikat_Sewa_Gedung.pdf' : '' 
        },
        { 
          id: '5b', 
          task: 'Ketersediaan sarana praktek utama sesuai kapasitas kelas', 
          checked: (lembaga.facilities || []).some(f => f.quantity > 0 && f.condition === 'Baik'), 
          evidence: (lembaga.facilities || []).some(f => f.quantity > 0) ? 'Inventaris_Sarana_Praktek.pdf' : '' 
        },
        { 
          id: '5c', 
          task: 'Ruang administrasi dan sanitasi terpisah dan layak', 
          checked: Array.from(new Set((lembaga.facilities || []).map(f => f.location).filter(Boolean))).length > 1, 
          evidence: (lembaga.facilities || []).length > 1 ? 'Denah_Tata_Ruang_LKP.pdf' : '' 
        }
      ]
    },
    {
      id: 6,
      title: 'Standar Pengelolaan',
      checklist: [
        { 
          id: '6a', 
          task: 'Papan nama lembaga dipasang jelas di depan gedung', 
          checked: !!lembaga.profile?.address && !!lembaga.profile?.phone, 
          evidence: 'Foto_Papan_Nama_Lembaga.jpg' 
        },
        { 
          id: '6b', 
          task: 'Izin Operasional / NPSN terdaftar di Kesharlindung / Kemendikbud', 
          checked: !!lembaga.profile?.email, 
          evidence: 'SK_Izin_Dinas_Pendidikan.pdf' 
        }
      ]
    },
    {
      id: 7,
      title: 'Standar Pembiayaan',
      checklist: [
        { 
          id: '7a', 
          task: 'Rencana Anggaran & Belanja (RAB) lembaga tahunan lengkap', 
          checked: (lembaga.budget || []).length > 0, 
          evidence: (lembaga.budget || []).length > 0 ? `RAB_Lembaga_${(lembaga.budget || []).length}_Mata_Anggaran.pdf` : '' 
        },
        { 
          id: '7b', 
          task: 'Pencatatan kas masuk & kas keluar (Jurnal Keuangan) harian', 
          checked: (lembaga.journal || []).length > 0, 
          evidence: (lembaga.journal || []).length > 0 ? `Ledger_Buku_Kas_${(lembaga.journal || []).length}_Transaksi.pdf` : '' 
        }
      ]
    },
    {
      id: 8,
      title: 'Standar Penilaian Pendidikan',
      checklist: [
        { 
          id: '8a', 
          task: 'Pelaksanaan ujian akhir kelulusan teori dan praktek', 
          checked: (lembaga.raportCards || []).length > 0, 
          evidence: (lembaga.raportCards || []).length > 0 ? 'Berkas_Soal_Ujian.pdf' : '' 
        },
        { 
          id: '8b', 
          task: 'Penerbitan Buku Raport hasil belajar siswa resmi', 
          checked: (lembaga.raportCards || []).length > 0, 
          evidence: (lembaga.raportCards || []).length > 0 ? 'Raport_Digital_Lembaga.pdf' : '' 
        }
      ]
    }
  ];

  return standards.map(std => {
    const checkedCount = std.checklist.filter(c => c.checked).length;
    const totalCount = std.checklist.length;
    const percentage = Math.round((checkedCount / totalCount) * 100);
    return {
      ...std,
      percentage
    };
  });
};

