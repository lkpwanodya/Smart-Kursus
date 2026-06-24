import React, { useState } from 'react';
import { 
  Sparkles, 
  Printer, 
  Copy, 
  RotateCcw, 
  FileText, 
  CheckCircle, 
  BrainCircuit, 
  Layers, 
  ClipboardCheck, 
  BookOpen, 
  Edit3, 
  Eye, 
  Download, 
  Check, 
  AlertCircle, 
  ArrowRight,
  TrendingUp,
  Award,
  Users,
  Save,
  Trash2
} from 'lucide-react';
import { Institution, Student } from '../types';

interface AIAssistanceProps {
  lembaga: Institution;
  students: Student[];
  onAddRaportCard?: (raport: any) => void;
  activeTab?: 'rpp' | 'lks' | 'teori' | 'praktek' | 'penilaian';
  setActiveTab?: (tab: 'rpp' | 'lks' | 'teori' | 'praktek' | 'penilaian') => void;
}

export default function AIAssistance({ 
  lembaga, 
  students, 
  onAddRaportCard,
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab
}: AIAssistanceProps) {
  // Navigation tabs (synchronized with prop or local state)
  const [localActiveTab, setLocalActiveTab] = useState<'rpp' | 'lks' | 'teori' | 'praktek' | 'penilaian'>('rpp');
  const activeTab = propActiveTab || localActiveTab;
  const setActiveTab = propSetActiveTab || setLocalActiveTab;

  // Single curriculum topic input that unifies the whole lesson package
  const [mainTopic, setMainTopic] = useState('Pembuatan Landing Page Responsif dengan Tailwind CSS');
  
  // Custom presets for instructors to choose from instantly
  const presets = [
    { label: 'Web Desain (Tailwind)', value: 'Pembuatan Landing Page Responsif dengan Tailwind CSS' },
    { label: 'Excel Perkantoran', value: 'Instalasi Rumus Excel Dinamis, PivotTable, dan Dashboard Laporan' },
    { label: 'Desain Grafis (Figma)', value: 'Slicing Desain UI/UX Figma menjadi Prototype Mobile Interaktif' },
    { label: 'Rakit PC & Jaringan', value: 'Topologi Jaringan Lokal, Konfigurasi Router MikroTik, dan Rakit PC' },
    { label: 'Bahasa Inggris Bisnis', value: 'Pelatihan English Speaking untuk Presentasi Kerja dan Wawancara Bisnis' }
  ];

  // Raw draft content states (allows direct real-time editing)
  const [rppContent, setRppContent] = useState<string>(`### RENCANA PELAKSANAAN PEMBELAJARAN (RPP)
**Lembaga**: ${lembaga.name}  
**Topik Utama**: Pembuatan Landing Page Responsif dengan Tailwind CSS  
**Alokasi Waktu**: 1 Pertemuan (3 Jam Pelajaran / 120 Menit)  

#### I. TUJUAN PEMBELAJARAN
1. Siswa mampu memahami struktur grid dan utilitas layout modern Tailwind CSS.
2. Siswa secara mandiri mampu merancang dan menyusun tata letak landing page responsif (desktop, tablet, mobile).
3. Siswa dapat mendiagnosis kesalahan responsive breakpoint secara mandiri.

#### II. METODE PEMBELAJARAN
- 20% Pemaparan Teori & Demo Desain oleh Instruktur.
- 50% Eksperimen & Slicing Mandiri (Hands-on Lab).
- 30% Review Portfolio & Evaluasi Hasil Akhir.

#### III. ALUR KEGIATAN PEMBELAJARAN
1. **Pendahuluan** (15 Menit): Motivasi karir UI Developer, penjelasan konsep mobile-first design, pre-test interaktif.
2. **Kegiatan Inti** (90 Menit): Slicing kustom hero section, mengatur container, grid-cols-* dan flexbox, menambahkan dark-mode switcher, debugging media query.
3. **Penutup** (15 Menit): Re-cap utilitas css, evaluasi pembelajaran, dan pendistribusian Lembar Kerja Siswa (LKS).

#### IV. SUMBER BELAJAR & MEDIA
- Dokumentasi Resmi tailwindcss.com
- Slide presentasi interaktif dan video slicing.
- Kode pre-template di GitHub.`);

  const [lksContent, setLksContent] = useState<string>(`### LEMBAR KERJA SISWA (LKS) MANDIRI
**Bahasan Pokok**: Slicing Figma menjadi HTML CSS Hebat - Landing Page  
**Sasaran**: Meningkatkan pemikiran logis tata letak responsif.  

#### I. RINGKASAN INTISARI MATERI
Sebelum memulai, buka berkas Figma mock-up yang diberikan di kelas. Amati bagaimana transisi layout dari lebar desktop (1440px) menuju lebar mobile (375px). Pastikan instalasi Node.js dan CLI tailwindcss berjalan lancar di komputer masing-masing.

#### II. PERTANYAAN ESSAY ANALITIS
1. Mengapa kaidah **Mobile-First Design** sangat direkomendasikan saat menulis kelas utilitas Tailwind? Jelaskan keunggulannya dibanding Desktop-First!
2. Jika sebuah grid tampak rapi di desktop namun terlalu sempit di ponsel, kelas utilitas apa yang Anda gunakan untuk mengatasinya?
3. Terangkan fungsi dari utilitas \`container mx-auto px-4\` dalam menjaga visual konten!

#### III. TANTANGAN PROYEK PRAKTEK
Gunakan Tailwind CSS untuk merancang sebuah personal portofolio berfitur dark-mode. Unggah berkas HTML & CSS Anda ke repository Github masing-masing sebagai pengumpulan kelengkapan nilai.`);

  const [teoriContent, setTeoriContent] = useState<string>(`### LEMBAR UJIAN TEORI TERTULIS
**Materi**: Konsep Responsivitas & Flexbox Grid - Tailwind CSS  
**Waktu**: 45 Menit  

#### BAGIAN A: PILIHAN GANDA
1. ** breakpoint default untuk lebar minimal tablet (768px) pada Tailwind CSS disimbolkan dengan modifier...**
   * a) sm:
   * b) md: (Jawaban Benar)
   * c) lg:
   * d) xl:

2. **Manakah utilitas yang tepat untuk menyusun konten agar berada tepat di tengah secara vertikal dan horizontal dalam flexbox layout?**
   * a) flex items-center justify-center (Jawaban Benar)
   * b) block text-center align-middle
   * c) grid justify-items-end items-end
   * d) inline-block float-center

#### BAGIAN B: ESSAY ANALISIS
1. Mengapa penggunaan unit relatif (seperti \`rem\`, \`em\`, atau \`vh/vw\`) lebih disukai dalam desain web responsif dibandingkan unit statis seperti piksel (\`px\`)? Jelaskan dengan contoh!`);

  const [praktekContent, setPraktekContent] = useState<string>(`### LEMBAR UJIAN PRAKTEK & RUBRIK KINERJA
**Kasus Praktek**: Slicing Portofolio Sederhana responsif dari desain static.  

#### I. SPESIFIKASI ALAT & BAHAN
1. VS Code atau Editor Kode pilihan siswa.
2. Browser Google Chrome dengan fitur Developer Tools diaktifkan.
3. Kemitraan akses internet untuk memuat CDN Tailwind jika diperlukan.

#### II. INSTRUKSI LANGKAH KERJA
1. Atur berkas direktori projek dan aktifkan compiler Tailwind CLI.
2. Implementasikan struktur: Hero Section, Feature Grid, Testimonial Slider, dan Contact Form.
3. Pastikan tidak ada konten yang terpotong (overflow horizontal) di ukuran layar smartphone 320px.

#### III. PANDUAN SKOR PENILAIAN
* **Aspek Responsivitas (40%)**: Layout menyesuaikan secara halus di semua media breakpoint.
* **Kerapian Kode (30%)**: Pengorganisasian tag HTML semantik dan penghindaran kelas berulang yang mubazir.
* **Kesesuaian Visual (30%)**: Tingkat kemiripan dengan rancangan mockup figma awal.`);

  const [penilaianContent, setPenilaianContent] = useState<string>(`### PANDUAN & CARA PENILAIAN LENGKAP
**Formula Kelulusan Paket**: Web Design Responsive dengan Tailwind CSS

#### I. FORMULA BOBOT DATA NILAI AKHIR (NA)
Sistem perekaman nilai menggunakan algoritma terintegrasi:
$$NA = (0.3 \\times S_{Teori}) + (0.5 \\times S_{Praktek}) + (0.2 \\times S_{Sikap})$$

Keterangan Pembobotan:
1. **Skor Ujian Teori (S_Teori - 30%)**: Dinilai dari keakuratan hasil Lembar Ujian Teori tertulis.
2. **Skor Kinerja Praktek (S_Praktek - 50%)**: Diambil berdasarkan skor Rubrik Ujian Praktek / Portfolio Slicing.
3. **Skor Sikap & Kehadiran (S_Sikap - 20%)**: Dinilai instruktur berdasarkan kedisiplinan pengumpulan tugas, ketaatan SOP ruangan, dan motivasi kerja.

#### II. STANDARD KELULUSAN KKM
Siswa dinyatakan memenuhi standar kompetensi industri jika memperoleh minimal nilai akhir (NA) **75.00**.`);

  // Active view mode within tabs ('view' or 'edit')
  const [viewModes, setViewModes] = useState<Record<string, 'view' | 'edit'>>({
    rpp: 'view',
    lks: 'view',
    teori: 'view',
    praktek: 'view',
    penilaian: 'view'
  });

  // Grading states
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [scoreTheory, setScoreTheory] = useState(85);
  const [scorePractice, setScorePractice] = useState(90);
  const [scoreAttitude, setScoreAttitude] = useState<'A' | 'B' | 'C' | 'D'>('A');

  const [loading, setLoading] = useState(false);
  const [generateMode, setGenerateMode] = useState<'single' | 'package'>('package');
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Save & Load System for Lesson Packages
  interface LessonPackage {
    id: string;
    topic: string;
    rpp: string;
    lks: string;
    teori: string;
    praktek: string;
    penilaian: string;
    updatedAt: string;
  }

  const [savedPackages, setSavedPackages] = useState<LessonPackage[]>(() => {
    const key = `lkp_lessons_${lembaga.id}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Gagal load paket pembelajaran:", e);
      }
    }
    return [];
  });

  const saveCurrentPackage = () => {
    if (!mainTopic.trim()) {
      alert("Masukkan nama topik terlebih dahulu!");
      return;
    }

    const key = `lkp_lessons_${lembaga.id}`;
    const updated = [...savedPackages];
    const existingIndex = updated.findIndex(p => p.topic.toLowerCase() === mainTopic.trim().toLowerCase());

    const newPkg: LessonPackage = {
      id: existingIndex >= 0 ? updated[existingIndex].id : 'pkg_' + Date.now(),
      topic: mainTopic.trim(),
      rpp: rppContent,
      lks: lksContent,
      teori: teoriContent,
      praktek: praktekContent,
      penilaian: penilaianContent,
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      updated[existingIndex] = newPkg;
      showToast("Berhasil memperbarui Paket Pembelajaran!");
    } else {
      updated.push(newPkg);
      showToast("Berhasil menyimpan Paket Pembelajaran Baru!");
    }

    setSavedPackages(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const loadPackage = (pkg: LessonPackage) => {
    setMainTopic(pkg.topic);
    setRppContent(pkg.rpp || '');
    setLksContent(pkg.lks || '');
    setTeoriContent(pkg.teori || '');
    setPraktekContent(pkg.praktek || '');
    setPenilaianContent(pkg.penilaian || '');
    showToast(`Berhasil memuat paket belajar: "${pkg.topic}"`);
  };

  const deletePackage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deletingId !== id) {
      setDeletingId(id);
      return;
    }
    const key = `lkp_lessons_${lembaga.id}`;
    const filtered = savedPackages.filter(p => p.id !== id);
    setSavedPackages(filtered);
    localStorage.setItem(key, JSON.stringify(filtered));
    setDeletingId(null);
    showToast("Paket Pembelajaran berhasil dihapus!");
  };

  // Auto-fill active editor content state helper
  const getActiveContent = () => {
    switch (activeTab) {
      case 'rpp': return rppContent;
      case 'lks': return lksContent;
      case 'teori': return teoriContent;
      case 'praktek': return praktekContent;
      case 'penilaian': return penilaianContent;
      default: return '';
    }
  };

  const setActiveContent = (val: string) => {
    switch (activeTab) {
      case 'rpp': setRppContent(val); break;
      case 'lks': setLksContent(val); break;
      case 'teori': setTeoriContent(val); break;
      case 'praktek': setPraktekContent(val); break;
      case 'penilaian': setPenilaianContent(val); break;
    }
  };

  const toggleViewMode = () => {
    setViewModes(prev => ({
      ...prev,
      [activeTab]: prev[activeTab] === 'view' ? 'edit' : 'view'
    }));
  };

  // Convert simple markdown strings into beautifully rendered HTML content
  const formatMarkdownToHtml = (text: string) => {
    if (!text) return '<span class="text-neutral-400 italic font-medium font-sans">Belum ada konten. Silakan gunakan tombol generate AI di panel samping kiri.</span>';
    return text
      .split('\n')
      .map(line => {
        let trimmed = line.trim();
        if (trimmed.startsWith('### ')) {
          return `<h4 class="text-[15px] font-extrabold text-neutral-900 mt-5 mb-2.5 border-b border-neutral-200 pb-1.5 flex items-center gap-2 font-sans uppercase tracking-wide"><span class="w-1.5 h-3.5 bg-emerald-600 rounded-sm"></span>${trimmed.substring(4)}</h4>`;
        }
        if (trimmed.startsWith('#### ')) {
          return `<h5 class="text-[13px] font-bold text-teal-800 mt-4 mb-2 uppercase tracking-wide font-sans">${trimmed.substring(5)}</h5>`;
        }
        if (trimmed.startsWith('## ')) {
          return `<h3 class="text-[17px] font-black text-neutral-950 mt-6 mb-3 border-l-4 border-teal-600 pl-3 font-sans">${trimmed.substring(3)}</h3>`;
        }
        if (trimmed.startsWith('# ')) {
          return `<h2 class="text-[20px] font-black text-slate-900 mt-7 mb-4 pb-2 border-b-2 border-neutral-900 font-sans uppercase tracking-tight">${trimmed.substring(2)}</h2>`;
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          let content = trimmed.substring(2);
          // Highlight correct answers in Uji Teori
          if (content.includes('(Jawaban Benar)') || content.includes('(Pilihan Tepat)') || content.includes('[KUNCI JAWABAN]')) {
            const anchor = content.includes('(Jawaban Benar)') ? '(Jawaban Benar)' : (content.includes('(Pilihan Tepat)') ? '(Pilihan Tepat)' : '[KUNCI JAWABAN]');
            content = content.replace(anchor, '<span class="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded ml-2 border border-teal-200 inline-badge-jawaban text-center">✓ KUNCI JAWABAN</span>');
          }
          return `<li class="text-[12.5px] text-neutral-700 leading-relaxed ml-6 list-disc pl-1.5 py-1 font-medium font-sans">${content}</li>`;
        }
        if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
          return `<p class="my-3 font-extrabold text-[12.5px] text-emerald-950 bg-emerald-50/50 px-4 py-2.5 rounded-xl border border-emerald-150">${trimmed.replace(/\*\*/g, '')}</p>`;
        }
        let formatted = line
          .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-neutral-900">$1</strong>')
          .replace(/\`([^`]+)\`/g, '<code class="bg-neutral-100 text-neutral-800 border border-neutral-200 font-mono text-[10px] px-1.5 py-0.5 rounded">$1</code>');
        return trimmed ? `<p class="text-[12.5px] text-neutral-700 leading-relaxed font-sans font-medium my-1.5">${formatted}</p>` : '<div class="h-2"></div>';
      })
      .join('');
  };

  // Generate complete unified lesson packages at once
  const generateUnifiedPackage = async () => {
    setLoading(true);
    setGenerateMode('package');
    try {
      const resp = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'paket_lengkap',
          name: lembaga.name,
          context: mainTopic
        })
      });
      const data = await resp.json();
      if (data.error) {
        throw new Error(data.error);
      }
      const parsed = JSON.parse(data.result);
      setRppContent(parsed.rpp || '');
      setLksContent(parsed.lks || '');
      setTeoriContent(parsed.uji_teori || '');
      setPraktekContent(parsed.uji_praktek || '');
      setPenilaianContent(parsed.cara_penilaian || '');
      
      showToast('Berhasil Menyusun Lengkap 5 Dokumen Pembelajaran!');
    } catch (e: any) {
      alert(`Gagal membuat paket pembelajaran: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Regenerate individual selected section
  const regenerateSingleSection = async () => {
    setLoading(true);
    setGenerateMode('single');
    try {
      let taskType = '';
      if (activeTab === 'rpp') taskType = 'rpp';
      else if (activeTab === 'lks') taskType = 'lks';
      else if (activeTab === 'teori') taskType = 'uji_teori';
      else if (activeTab === 'praktek') taskType = 'uji_praktek';
      else if (activeTab === 'penilaian') taskType = 'evaluasi'; // fallback feedback or eval

      const resp = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: taskType === 'evaluasi' ? 'rpp' : taskType, // fallback for evaluation structure page
          name: lembaga.name,
          context: mainTopic
        })
      });
      const data = await resp.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setActiveContent(data.result);
      showToast(`Berhasil memperbarui dokumen ${activeTab.toUpperCase()}!`);
    } catch (e: any) {
      alert(`Gagal memuat ulang bagian ini: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setSavedSuccess(msg);
    setTimeout(() => {
      setSavedSuccess('');
    }, 4000);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(getActiveContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Copy whole composite package text 
  const handleCopyWholePackage = () => {
    const composite = `=========================================
PAKET PEMBELAJARAN LENGKAP: ${mainTopic}
Lembaga: ${lembaga.name}
=========================================

--- DOKUMEN I: RENCANA PEMBELAJARAN (RPP) ---
${rppContent}

--- DOKUMEN II: LEMBAR KERJA SISWA (LKS) ---
${lksContent}

--- DOKUMEN III: LEMBAR UJIAN TEORI TERTULIS ---
${teoriContent}

--- DOKUMEN IV: LEMBAR UJIAN PRAKTEK & RUBRIK ---
${praktekContent}

--- DOKUMEN V: PANDUAN & CARA PENILAIAN LENGKAP ---
${penilaianContent}
`;
    navigator.clipboard.writeText(composite);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Seluruh Paket Pembelajaran Berhasil Disalin!');
  };

  // Helper print view for single document
  const handlePrintSingle = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${activeTab.toUpperCase()} - ${lembaga.name}</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #0f172a; line-height: 1.6; background-color: #ffffff; }
            h2 { font-size: 20px; font-weight: 900; color: #0f172a; border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-top: 25px; margin-bottom: 15px; text-transform: uppercase; }
            h3 { font-size: 17px; font-weight: 800; color: #0d9488; border-left: 3.5px solid #0d9488; padding-left: 12px; margin-top: 22px; margin-bottom: 12px; }
            h4 { font-size: 15px; font-weight: 800; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-top: 20px; margin-bottom: 15px; text-transform: uppercase; }
            h5 { font-size: 13.5px; font-weight: 700; color: #0d9488; margin-top: 15px; margin-bottom: 8px; text-transform: uppercase; }
            p { font-size: 12px; color: #334155; margin: 8px 0; line-height: 1.6; }
            li { font-size: 12px; color: #334155; margin: 6px 0; line-height: 1.6; list-style-type: none; position: relative; padding-left: 15px; }
            li::before { content: "•"; position: absolute; left: 0; color: #0d9488; font-weight: bold; }
            pre { background: #f8fafc; padding: 14px; border-radius: 8px; white-space: pre-wrap; font-family: monospace; border: 1px solid #e2e8f0; font-size: 10px; }
            code { background-color: #f1f5f9; color: #0f172a; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 11px; border: 1px solid #e2e8f0; }
            .inline-badge-jawaban { font-weight: bold; color: #0d9488; font-size: 10px; background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 1px 6px; border-radius: 4px; margin-left: 8px; display: inline-block; }
            
            .letterhead { text-align: center; border-bottom: 4px double #1e293b; padding-bottom: 12px; margin-bottom: 25px; }
            .letterhead .gov { font-size: 10px; font-weight: 800; letter-spacing: 0.1em; color: #475569; margin-bottom: 2px; }
            .letterhead h1 { margin: 3px 0; font-size: 21px; font-weight: 950; border-bottom: none; text-transform: uppercase; color: #0f172a; }
            .letterhead p { margin: 4px 0; color: #475569; font-size: 11px; font-weight: 600; }
            .letterhead .addr { margin: 2px 0 0 0; color: #64748b; font-size: 10px; font-style: italic; }
            .doc-info { margin-bottom: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; font-size: 10px; color: #475569; }
            .signature-block { margin-top: 50px; page-break-inside: avoid; }
            .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; font-size: 11px; color: #334155; }
            .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 60px; color: rgba(13, 148, 136, 0.04); font-weight: 900; z-index: -1; pointer-events: none; white-space: nowrap; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="watermark">DOKUMEN RESMI 8 SNP</div>
          
          <div class="letterhead">
            <div class="gov">KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI</div>
            <h1>LEMBAGA KURSUS DAN PELATIHAN (LKP) ${lembaga.name.toUpperCase()}</h1>
            <p>Izin Operasional No: ${lembaga.profile?.skDisdik || '421.9/120-Disdik/2026'} | NPSN: ${lembaga.profile?.npsn || 'K9998124'} | Akreditasi Peringkat: ${lembaga.profile?.accreditationRating || 'A'}</p>
            <div class="addr">Alamat: ${lembaga.profile?.address || 'Alamat Kantor Utama'} | Telp: ${lembaga.profile?.phone || 'Telepon'} | Email: ${lembaga.profile?.email || 'Email'}</div>
          </div>

          <div class="doc-info">
            <div>
              <strong>DOKUMEN:</strong> ${activeTab.toUpperCase()} lampiran kurikulum  
            </div>
            <div>
              <strong>TANGGAL CETAK:</strong> ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}  
            </div>
          </div>

          <div>
            ${formatMarkdownToHtml(getActiveContent())}
          </div>

          <div class="signature-block">
            <div class="signature-grid">
              <div>
                <p style="margin-bottom: 2px;">Mengetahui,</p>
                <p style="font-weight: bold; margin-top: 0;">Pimpinan LKP ${lembaga.name}</p>
                <div style="height: 60px;"></div>
                <p style="font-weight: 800; text-decoration: underline; margin-bottom: 2px;">${lembaga.structure?.find(n => n.role.toLowerCase().includes('kepala') || n.role.toLowerCase().includes('pimpinan') || n.role.toLowerCase().includes('direktur'))?.name || 'Direktur LKP'}</p>
                <p style="font-size: 9px; color: #64748b; margin-top: 0;">NIP/NIDN. Penyelenggara Kursus</p>
              </div>
              <div style="text-align: right;">
                <p style="margin-bottom: 2px;">Ditetapkan di: Jakarta, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p style="font-weight: bold; margin-top: 0;">Instruktur Pengampu Pembelajaran</p>
                <div style="height: 60px;"></div>
                <p style="font-weight: 800; text-decoration: underline; margin-bottom: 2px;">${lembaga.teachers?.[0]?.name || 'Nama Instruktur Utama'}</p>
                <p style="font-size: 9px; color: #64748b; margin-top: 0;">Sertifikasi: ${lembaga.teachers?.[0]?.specialty || 'Pengajar Tersertifikasi'}</p>
              </div>
            </div>
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Helper print view for entire package integrated
  const handlePrintAll = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Paket Pembelajaran Lengkap - ${mainTopic}</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #0f172a; line-height: 1.6; background-color: #ffffff; }
            .section-page { page-break-after: always; padding-bottom: 25px; border-bottom: 2px dashed #cbd5e1; margin-bottom: 35px; }
            .section-page:last-child { page-break-after: avoid; border-bottom: none; margin-bottom: 0; }
            
            h2 { font-size: 20px; font-weight: 900; color: #0f172a; border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-top: 25px; margin-bottom: 15px; text-transform: uppercase; }
            h3 { font-size: 17px; font-weight: 800; color: #0d9488; border-left: 3.5px solid #0d9488; padding-left: 12px; margin-top: 22px; margin-bottom: 12px; }
            h4 { font-size: 15px; font-weight: 800; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-top: 20px; margin-bottom: 15px; text-transform: uppercase; }
            h5 { font-size: 13.5px; font-weight: 700; color: #0d9488; margin-top: 15px; margin-bottom: 8px; text-transform: uppercase; }
            p { font-size: 12px; color: #334155; margin: 8px 0; line-height: 1.6; }
            li { font-size: 12px; color: #334155; margin: 6px 0; line-height: 1.6; list-style-type: none; position: relative; padding-left: 15px; }
            li::before { content: "•"; position: absolute; left: 0; color: #0d9488; font-weight: bold; }
            pre { background: #f8fafc; padding: 12px; border-radius: 6px; white-space: pre-wrap; font-family: monospace; border: 1px solid #e2e8f0; font-size: 10px; }
            code { background-color: #f1f5f9; color: #0f172a; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 11px; border: 1px solid #e2e8f0; }
            .inline-badge-jawaban { font-weight: bold; color: #0d9488; font-size: 10px; background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 1px 6px; border-radius: 4px; margin-left: 8px; display: inline-block; }
            
            .letterhead { text-align: center; border-bottom: 4px double #1e293b; padding-bottom: 12px; margin-bottom: 25px; }
            .letterhead .gov { font-size: 10px; font-weight: 800; letter-spacing: 0.1em; color: #475569; margin-bottom: 2px; }
            .letterhead h1 { margin: 3px 0; font-size: 21px; font-weight: 950; border-bottom: none; text-transform: uppercase; color: #0f172a; }
            .letterhead p { margin: 4px 0; color: #475569; font-size: 11px; font-weight: 600; }
            .letterhead .addr { margin: 2px 0 0 0; color: #64748b; font-size: 10px; font-style: italic; }
            
            .doc-info { margin-bottom: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; font-size: 10px; color: #475569; }
            .signature-block { margin-top: 40px; page-break-inside: avoid; }
            .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; font-size: 11px; color: #334155; }
            .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 60px; color: rgba(13, 148, 136, 0.035); font-weight: 900; z-index: -1; pointer-events: none; white-space: nowrap; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="watermark">DOKUMEN INTEGRAL 8 SNP</div>
          
          <div class="letterhead">
            <div class="gov">KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI</div>
            <h1>LEMBAGA KURSUS DAN PELATIHAN (LKP) ${lembaga.name.toUpperCase()}</h1>
            <p>Izin Operasional No: ${lembaga.profile?.skDisdik || '421.9/120-Disdik/2026'} | NPSN: ${lembaga.profile?.npsn || 'K9998124'} | Akreditasi Peringkat: ${lembaga.profile?.accreditationRating || 'A'}</p>
            <div class="addr">Alamat: ${lembaga.profile?.address || 'Alamat Kantor Utama'} | Telp: ${lembaga.profile?.phone || 'Telepon'} | Email: ${lembaga.profile?.email || 'Email'}</div>
          </div>

          <div class="doc-info">
            <div>
              <strong>MATERI PELATIHAN:</strong> ${mainTopic}  
            </div>
            <div>
              <strong>TANGGAL PENYUSUNAN:</strong> ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}  
            </div>
          </div>
          
          <div class="section-page">
            <h1 style="color: #0d9488; border-bottom: 2.5px solid #0d9488; padding-bottom: 8px; font-size: 15px; font-weight: 900; text-transform: uppercase; margin-top: 0; margin-bottom: 15px;">LAMPIRAN I: RENCANA PELAKSANAAN PEMBELAJARAN (RPP)</h1>
            <div style="margin-top: 15px; background: #fff;">
              ${formatMarkdownToHtml(rppContent)}
            </div>
          </div>
          
          <div class="section-page">
            <h1 style="color: #0d9488; border-bottom: 2.5px solid #0d9488; padding-bottom: 8px; font-size: 15px; font-weight: 900; text-transform: uppercase; margin-top: 0; margin-bottom: 15px;">LAMPIRAN II: LEMBAR KERJA SISWA (LKS) MANDIRI</h1>
            <div style="margin-top: 15px; background: #fff;">
              ${formatMarkdownToHtml(lksContent)}
            </div>
          </div>
          
          <div class="section-page">
            <h1 style="color: #0d9488; border-bottom: 2.5px solid #0d9488; padding-bottom: 8px; font-size: 15px; font-weight: 900; text-transform: uppercase; margin-top: 0; margin-bottom: 15px;">LAMPIRAN III: LEMBAR EVALUASI UJIAN TEORI</h1>
            <div style="margin-top: 15px; background: #fff;">
              ${formatMarkdownToHtml(teoriContent)}
            </div>
          </div>
          
          <div class="section-page">
            <h1 style="color: #0d9488; border-bottom: 2.5px solid #0d9488; padding-bottom: 8px; font-size: 15px; font-weight: 900; text-transform: uppercase; margin-top: 0; margin-bottom: 15px;">LAMPIRAN IV: LEMBAR EVALUASI UJIAN PRAKTEK & KINERJA</h1>
            <div style="margin-top: 15px; background: #fff;">
              ${formatMarkdownToHtml(praktekContent)}
            </div>
          </div>
          
          <div class="section-page">
            <h1 style="color: #0d9488; border-bottom: 2.5px solid #0d9488; padding-bottom: 8px; font-size: 15px; font-weight: 900; text-transform: uppercase; margin-top: 0; margin-bottom: 15px;">LAMPIRAN V: KRITERIA DAN METODE PEMBOBOTAN PENILAIAN</h1>
            <div style="margin-top: 15px; background: #fff;">
              ${formatMarkdownToHtml(penilaianContent)}
            </div>
          </div>

          <div class="signature-block">
            <div class="signature-grid">
              <div>
                <p style="margin-bottom: 2px;">Mengetahui & Mengesahkan,</p>
                <p style="font-weight: bold; margin-top: 0;">Pimpinan LKP ${lembaga.name}</p>
                <div style="height: 60px;"></div>
                <p style="font-weight: 800; text-decoration: underline; margin-bottom: 2px;">${lembaga.structure?.find(n => n.role.toLowerCase().includes('kepala') || n.role.toLowerCase().includes('pimpinan') || n.role.toLowerCase().includes('direktur'))?.name || 'Direktur LKP'}</p>
                <p style="font-size: 9px; color: #64748b; margin-top: 0;">NIP/NIDN. Penyelenggara Kursus tingkat Nasional</p>
              </div>
              <div style="text-align: right;">
                <p style="margin-bottom: 2px;">Ditetapkan di: Jakarta, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p style="font-weight: bold; margin-top: 0;">Instruktur Pengampu Pembelajaran</p>
                <div style="height: 60px;"></div>
                <p style="font-weight: 800; text-decoration: underline; margin-bottom: 2px;">${lembaga.teachers?.[0]?.name || 'Nama Instruktur Utama'}</p>
                <p style="font-size: 9px; color: #64748b; margin-top: 0;">Sertifikasi: ${lembaga.teachers?.[0]?.specialty || 'Pengajar Tersertifikasi'}</p>
              </div>
            </div>
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    showToast('Membuka PDF Cetak Paket Lengkap...');
  };

  // Append evaluated grade data straight to student Raport
  const applyFeedbackToReport = () => {
    if (!selectedStudentId) return;
    if (onAddRaportCard) {
      const student = students.find(s => s.id === selectedStudentId);
      
      const scoreAverage = Math.round((scoreTheory * 0.3) + (scorePractice * 0.5) + (scoreAttitude === 'A' ? 95 : scoreAttitude === 'B' ? 85 : scoreAttitude === 'C' ? 70 : 55) * 0.2);

      const aiFeedbackGenerated = `Siswa menunjukkan pemahaman aspek teori yang mencukupi dengan pencapaian skor ${scoreTheory}/100. Pada ketangkasan motorik/praktek, siswa memperoleh nilai ${scorePractice}/100 atas pengerjaan "${mainTopic}". Dengan kualifikasi sikap tingkat "${scoreAttitude === 'A' ? 'Amat Baik (A)' : scoreAttitude === 'B' ? 'Baik (B)' : 'Cukup (C)'}", siswa dinilai sanggup lulus KKM program dengan akumulasi Nilai Akhir (NA) ${scoreAverage}.`;

      const newRaport = {
        id: 'r_ai_' + Date.now(),
        studentId: selectedStudentId,
        period: 'Semester Gasal ' + new Date().getFullYear(),
        theoryScore: scoreTheory,
        practicalScore: scorePractice,
        attitudeScore: scoreAttitude,
        aiFeedback: aiFeedbackGenerated,
        teacherNotes: `Dibuat & diverifikasi dari lembar penilaian instan AI. Formula: 30% Teori + 50% Praktek + 20% Sikap. KKM Terpenuhi. (Materi: ${mainTopic})`,
        issueDate: new Date().toISOString().split('T')[0]
      };
      
      onAddRaportCard(newRaport);
      showToast(`Berhasil menerbitkan Buku Raport siswa ${student?.name || ''}!`);
    }
  };

  return (
    <div className="bg-slate-50 rounded-2xl shadow-sm border border-neutral-200/80 overflow-hidden" id="asisten-ai-section">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/15 shadow-sm">
            <BrainCircuit className="w-6 h-6 text-emerald-100 animate-pulse" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg tracking-tight font-sans">Kopilot Guru & Studio Pembelajaran Terpadu</h2>
            <p className="text-emerald-100 text-[11px] font-medium">1 Paket Dokumen Cerdas: RPP, LKS, Ujian Teori, Panduan Praktek & Rubrik Penilaian</p>
          </div>
        </div>
        <div className="bg-white/10 px-3 py-1 rounded-full border border-white/20 text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-xs">
          Twin-Engine Generative 3.5
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
        
        {/* Left Control Panel: Topic definition and Auto Generation triggers */}
        <div className="lg:col-span-4 border-r border-neutral-200/80 p-5 bg-neutral-50 flex flex-col justify-between">
          <div className="space-y-5">
            
            {/* Input Materi Pokok */}
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-3xs space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-neutral-700 tracking-wider font-mono">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                <span>Materi & Kurikulum Utama</span>
              </div>
              
              {/* Presets List - Placed below header */}
              <div className="space-y-1.5">
                <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider block">Pilih Kerangka Preset Guru</span>
                <div className="grid grid-cols-2 gap-1">
                  {presets.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setMainTopic(p.value)}
                      className={`text-[9px] text-left p-1.5 rounded-md border font-medium transition-all ${
                        mainTopic === p.value 
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-extrabold' 
                          : 'border-neutral-200 hover:bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">Topik Paket Pembelajaran</label>
                <textarea
                  rows={3}
                  value={mainTopic}
                  onChange={(e) => setMainTopic(e.target.value)}
                  className="w-full text-xs font-semibold text-neutral-800 border border-neutral-200 rounded-lg p-2.5 focus:border-emerald-500 focus:outline-none bg-neutral-50/50 leading-relaxed resize-none animate-none"
                  placeholder="Contoh: Pembuatan Landing Page Responsif dengan Tailwind CSS..."
                />
              </div>

              {/* Buat 1 Paket - Placed directly below the Topic container */}
              <div className="pt-1 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={generateUnifiedPackage}
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 text-white font-extrabold text-[11px] py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs transition-all uppercase tracking-wide font-mono"
                  title="Buat 5 lampiran kurikulum lengkap sekaligus berbasis topik di atas"
                >
                  <Sparkles className="w-3.5 h-3.5 animate-pulse text-emerald-200" />
                  <span>{loading && generateMode === 'package' ? 'Menyusun paket...' : '✨ Buat 1 Paket'}</span>
                </button>
              </div>

            </div>

            {/* Simpan Paket - Placed directly above saved list */}
            <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-3xs">
              <button
                type="button"
                onClick={saveCurrentPackage}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs transition-all uppercase tracking-wider font-mono"
                title="Simpan draf paket belajar aktif ini ke penyimpanan lokal"
              >
                <Save className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simpan Paket</span>
              </button>
            </div>

            {/* Saved Packages List */}
            {savedPackages.length > 0 && (
              <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-3xs space-y-3.5">
                <div className="flex items-center justify-between text-xs font-bold uppercase text-neutral-700 tracking-wider font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-600">📁</span>
                    <span>Paket Tersimpan ({savedPackages.length})</span>
                  </div>
                </div>
                <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                  {savedPackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => loadPackage(pkg)}
                      className={`group flex items-center justify-between p-2 rounded-lg border text-left cursor-pointer transition-all ${
                        mainTopic === pkg.topic
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                          : 'border-neutral-100 hover:border-neutral-300 hover:bg-neutral-50/50 text-neutral-600'
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="text-[10px] font-semibold truncate leading-tight">{pkg.topic}</p>
                        <p className="text-[8px] text-neutral-400 font-mono mt-0.5">
                          {new Date(pkg.updatedAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {deletingId === pkg.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingId(null);
                            }}
                            className="text-[9px] bg-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded hover:bg-neutral-300 font-bold transition-all transition-colors cursor-pointer"
                            title="Batal"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={(e) => deletePackage(pkg.id, e)}
                            className="text-[9px] bg-red-650 text-white px-1.5 py-0.5 rounded bg-red-600 hover:bg-red-700 font-bold transition-all transition-colors cursor-pointer"
                            title="Konfirmasi Hapus"
                          >
                            Ya
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => deletePackage(pkg.id, e)}
                          className="text-neutral-400 hover:text-red-600 p-1 rounded-md hover:bg-white transition-all shadow-3xs/0 hover:shadow-3xs cursor-pointer"
                          title="Hapus paket"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Helper Info */}
            <div className="p-3.5 bg-amber-50/80 border border-amber-100 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-extrabold text-amber-850 tracking-wider font-mono">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Konsep Satu Paket Terpadu</span>
              </div>
              <p className="text-[10px] text-neutral-600 leading-normal font-semibold">
                Sistem menghasilkan <strong>5 Dokumen Lengkap (RPP, LKS, Uji Teori, Uji Praktek, Kriteria Nilai)</strong> yang seirama secara paralel agar standar 8 SNP kurikulum Anda beres instan.
              </p>
            </div>

          </div>

          {/* Bottom attribution */}
          <div className="pt-4 mt-4 border-t border-neutral-200/60 text-[9px] text-neutral-400 font-mono flex items-center gap-1 font-semibold">
            <CheckCircle className="w-3 h-3 text-emerald-500" />
            <span>Tersinkron dengan Database Raport LKP</span>
          </div>
        </div>

        {/* Right Workspace Side: Elegant interactive tabs card & text editor */}
        <div className="lg:col-span-8 p-6 flex flex-col justify-between bg-white">
          
          <div className="space-y-4 flex-1 flex flex-col h-full">
            
            {/* 5 Tabs on Top of Document */}
            <div className="flex border-b border-neutral-200 overflow-x-auto gap-1 pb-1 scrollbar-none">
              {[
                { id: 'rpp', label: '📝 RPP', desc: 'Rencana Belajar' },
                { id: 'lks', label: '📖 LKS', desc: 'Lembar Siswa' },
                { id: 'teori', label: '✍️ Uji Teori', desc: 'Ujian Tulis' },
                { id: 'praktek', label: '🛠️ Uji Praktek', desc: 'Aspek Kinerja' },
                { id: 'penilaian', label: '📊 Penilaian', desc: 'Cara & Rubrik' }
              ].map((t) => {
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActiveTab(t.id as any);
                    }}
                    className={`px-3 py-2 rounded-t-xl text-left border-t border-x transition-all shrink-0 cursor-pointer ${
                      isActive 
                        ? 'bg-neutral-900 text-white border-neutral-900 font-bold' 
                        : 'bg-neutral-50/70 text-neutral-500 border-neutral-200/80 hover:bg-neutral-100 hover:text-neutral-800'
                    }`}
                  >
                    <div className="text-[11px] font-bold tracking-wide">{t.label}</div>
                    <div className={`text-[8px] font-mono ${isActive ? 'text-emerald-300' : 'text-neutral-450'}`}>{t.desc}</div>
                  </button>
                );
              })}
            </div>

            {/* Document Header Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-50 px-4 py-2.5 rounded-xl border border-neutral-200/80 font-semibold text-xs">
              
              {/* Dual Mode View vs Edit */}
              <div className="inline-flex bg-neutral-200/80 p-0.5 rounded-lg border border-neutral-300/40">
                <button
                  type="button"
                  onClick={() => setViewModes(p => ({ ...p, [activeTab]: 'view' }))}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                    viewModes[activeTab] === 'view' 
                      ? 'bg-white text-neutral-900 shadow-3xs' 
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Pratinjau A4</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewModes(p => ({ ...p, [activeTab]: 'edit' }))}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                    viewModes[activeTab] === 'edit'
                      ? 'bg-emerald-600 text-white shadow-3xs'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit langsung</span>
                </button>
              </div>

              {/* Action utilities */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="px-2.5 py-1.5 border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-600 hover:text-neutral-850 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Salin halaman ini saja"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin' : 'Salin Bab'}</span>
                </button>

                {/* regen bab moved next to salin bab */}
                <button
                  type="button"
                  onClick={regenerateSingleSection}
                  disabled={loading}
                  className="px-2.5 py-1.5 border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:bg-neutral-100 disabled:text-neutral-400 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Buat ulang hanya bab/tab yang sedang aktif ini saja"
                >
                  <RotateCcw className={`w-3.5 h-3.5 text-emerald-600 ${loading && generateMode === 'single' ? 'animate-spin' : ''}`} />
                  <span>{loading && generateMode === 'single' ? 'Proses...' : 'Regen Bab'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintSingle}
                  className="px-2.5 py-1.5 border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-600 hover:text-neutral-850 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Cetak format cetakan PDF bab ini"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Bab</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintAll}
                  className="px-3 py-1.5 bg-neutral-900 hover:bg-amber-850 text-white rounded-lg text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                  title="Simpan & Cetak RPP,LKS,Uji Teori,Praktek secara berurutan sekaligus"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-500" />
                  <span>🖨️ Cetak Paket</span>
                </button>
              </div>
            </div>

            {/* Toast notification message */}
            {savedSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-150-strong rounded-xl text-emerald-800 text-[11px] font-bold animate-fade-in flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 animate-bounce" />
                <span>{savedSuccess}</span>
              </div>
            )}

            {/* Document Workspace Panel */}
            <div className="flex-1 flex flex-col justify-between border border-neutral-200/90 rounded-2xl overflow-hidden shadow-2xs">
              
              {/* Working Area - Highly stable constant height locks prevent layout jumping */}
              <div className="flex-1 bg-neutral-100/70 p-4 sm:p-6 overflow-y-auto h-[530px] min-h-[530px] max-h-[530px] scrollbar-thin">
                {viewModes[activeTab] === 'edit' ? (
                  // Editor mode: Real-time interactive multi-line direct editor
                  <div className="space-y-2 h-full flex flex-col bg-white p-4 rounded-xl border border-neutral-200">
                    <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono font-bold uppercase tracking-wider">
                      <span>✏️ Mode Edit Aktif</span>
                      <span>Karakter: {getActiveContent().length}</span>
                    </div>
                    <textarea
                      rows={14}
                      value={getActiveContent()}
                      onChange={(e) => setActiveContent(e.target.value)}
                      className="w-full flex-1 font-mono text-xs p-4 border border-neutral-300 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 bg-neutral-50/50 text-neutral-800 leading-relaxed outline-none"
                    />
                    <div className="flex items-center gap-1.5 text-[9px] text-neutral-400 font-semibold font-mono font-black">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      <span>Perubahan tersimpan otomatis di browser dalam sesi ini.</span>
                    </div>
                  </div>
                ) : (
                  // Viewer mode: Elegant display (Simulated Official Institutional Paper)
                  <div className="bg-white mx-auto shadow-md border border-neutral-2xl/80 rounded-sm p-6 sm:p-10 text-neutral-800 max-w-[720px] relative overflow-hidden min-h-[660px] font-sans">
                    
                    {/* Decorative Watermark Seal */}
                    <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 pointer-events-none select-none text-[26px] font-black text-emerald-600/3 opacity-2 tracking-widest font-mono text-center uppercase leading-none">
                      DOKUMEN RESMI LKP<br/>
                      8 STANDAR NASIONAL PENDIDIKAN<br/>
                      ✓ VALIDASI INTEGRITAS AI
                    </div>

                    {/* Letterhead (Kop Surat Resmi) */}
                    <div className="text-center border-b-[3px] border-double border-slate-900 pb-3 mb-5 select-none text-slate-805">
                      <div className="text-[8px] font-extrabold uppercase tracking-widest text-[#0d9488]">
                        KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI
                      </div>
                      <h4 className="text-sm font-black uppercase tracking-tight font-sans mt-0.5 leading-tight">
                        LEMBAGA KURSUS DAN PELATIHAN {lembaga.name}
                      </h4>
                      <p className="text-[9px] font-semibold text-neutral-500 mt-1 leading-normal">
                        Izin Operasional No: <span className="font-mono text-neutral-600">{lembaga.profile?.skDisdik || 'No: 421.9/120-Disdik/2026'}</span> | NPSN: <span className="font-mono text-neutral-600">{lembaga.profile?.npsn || 'K9998124'}</span> | Akreditasi Peringkat: <span className="font-extrabold underline text-teal-700">{lembaga.profile?.accreditationRating || 'A'}</span>
                      </p>
                      <p className="text-[8px] text-neutral-400 mt-0.5">
                        Alamat: {lembaga.profile?.address || 'Alamat Kantor Utama'} | Telpon: {lembaga.profile?.phone || 'Telepon'} | Surel: {lembaga.profile?.email || 'Email'}
                      </p>
                    </div>

                    {/* Official Document Sub-header metadata badges */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 bg-slate-50/85 px-3 py-2 rounded-lg border border-slate-200/60 mb-5 text-[9px] font-mono select-none">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span className="text-neutral-500">Berkas No:</span>
                        <span className="font-bold text-slate-800">LKP/8-SNP/{activeTab.toUpperCase()}/{new Date().getFullYear()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-teal-100 text-[#0d9488] font-black px-1.5 py-0.5 rounded uppercase font-sans text-[8px] tracking-wide">
                          ✓ STANDAR 8 SNP
                        </span>
                        <span className="text-neutral-300 font-bold">|</span>
                        <span className="text-neutral-500">Update:</span>
                        <span className="font-extrabold text-neutral-700">{new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}</span>
                      </div>
                    </div>

                    {/* Core Dynamic Content Body */}
                    <div className="prose max-w-none text-xs font-sans text-neutral-750 leading-relaxed font-normal min-h-[300px]">
                      <div 
                        className="space-y-4 pb-8"
                        dangerouslySetInnerHTML={{ __html: formatMarkdownToHtml(getActiveContent()) }} 
                      />
                    </div>

                    {/* Signatures Section */}
                    <div className="border-t border-dashed border-neutral-200 pt-5 mt-8 grid grid-cols-2 gap-4 text-[9px] font-bold text-neutral-600 select-none">
                      <div>
                        <p className="m-0 text-neutral-400 font-mono font-bold uppercase tracking-wider">Mengesahkan,</p>
                        <p className="font-bold text-neutral-700 mt-1">Pimpinan Lembaga LKP {lembaga.name}</p>
                        {/* Seal Watermark Stamp */}
                        <div className="h-10 relative flex items-center">
                          <div className="absolute left-2 w-9 h-9 border border-emerald-600/30 rounded-full flex items-center justify-center text-[6px] text-emerald-600/45 font-black rotate-12 pointer-events-none uppercase leading-3 text-center">
                            LKP {lembaga.name.substring(0, 5)}<br/>
                            ✓ SAH
                          </div>
                        </div>
                        <p className="font-extrabold text-slate-900 underline">
                          {lembaga.structure?.find(n => n.role.toLowerCase().includes('kepala') || n.role.toLowerCase().includes('pimpinan') || n.role.toLowerCase().includes('direktur'))?.name || 'Direktur LKP'}
                        </p>
                        <p className="text-[8px] text-neutral-400 mt-0.5 font-mono">ID Penyelenggara Nasional</p>
                      </div>
                      <div className="text-right">
                        <p className="m-0 text-neutral-400 font-mono font-bold uppercase tracking-wider">Penyusun Kurikulum,</p>
                        <p className="font-bold text-neutral-700 mt-1">Instruktur Pengampu Pembelajaran</p>
                        <div className="h-10 relative flex items-center justify-end">
                          <code className="text-[7px] bg-slate-50 text-slate-600 px-1 py-0.5 border border-slate-100 rounded opacity-60 font-mono">Secured by AI-Assistant</code>
                        </div>
                        <p className="font-extrabold text-slate-900 underline">
                          {lembaga.teachers?.[0]?.name || 'Nama Instruktur Utama'}
                        </p>
                        <p className="text-[8px] text-neutral-400 mt-0.5 font-mono">Specialist: {lembaga.teachers?.[0]?.specialty || 'Pengasar LKP'}</p>
                      </div>
                    </div>

                  </div>
                )}
              </div>

            </div>

            {/* Evaluation & Class Sync (Exclusively rendered on Tab 5 "Cara Penilaian" for great modular UX) */}
            {activeTab === 'penilaian' && (
              <div className="p-4 bg-emerald-50/40 border border-emerald-200/60 rounded-2xl space-y-3.5 shadow-3xs">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-xs font-extrabold text-emerald-850 uppercase tracking-widest font-mono">
                      <Users className="w-4 h-4 text-emerald-600" />
                      <span>Input Nilai Integrasi Buku Raport</span>
                    </div>
                    <p className="text-[10px] text-neutral-550 leading-normal font-semibold">
                      Gunakan formula penilaian di atas untuk memproses Nilai Akhir siswa dan mengirimkannya langsung ke Raport Siswa LKP.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={applyFeedbackToReport}
                    disabled={!selectedStudentId}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] font-mono uppercase px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs inline-flex items-center gap-1 px-4 self-start md:self-center"
                  >
                    <span>✓ Kirim ke Raport</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-neutral-200/80">
                  <div>
                    <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Pilih Siswa</label>
                    <select
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      className="w-full text-xs font-semibold border-neutral-200 border rounded-lg p-2 bg-neutral-50/50 cursor-pointer"
                    >
                      <option value="">-- Pilih Siswa --</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Skor Teori (30%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={scoreTheory}
                      onChange={(e) => setScoreTheory(Math.max(0, Math.min(100, Number(e.target.value))))}
                      className="w-full text-xs font-semibold border-neutral-200 border rounded-lg p-1.5 bg-neutral-50/50"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Skor Praktek (50%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={scorePractice}
                      onChange={(e) => setScorePractice(Math.max(0, Math.min(100, Number(e.target.value))))}
                      className="w-full text-xs font-semibold border-neutral-200 border rounded-lg p-1.5 bg-neutral-50/50"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Skor Sikap (20%)</label>
                    <select
                      value={scoreAttitude}
                      onChange={(e) => setScoreAttitude(e.target.value as any)}
                      className="w-full text-xs font-semibold border-neutral-200 border rounded-lg p-1.5 bg-neutral-50/50 cursor-pointer"
                    >
                      <option value="A">Amat Baik (A)</option>
                      <option value="B">Baik Sekali (B)</option>
                      <option value="C">Cukup (C)</option>
                      <option value="D">Perlu Bimbingan (D)</option>
                    </select>
                  </div>
                </div>

              </div>
            )}

            {/* composite packet actions when active tab is not penilaian */}
            {activeTab !== 'penilaian' && (
              <div className="flex justify-end pr-1">
                <button
                  type="button"
                  onClick={handleCopyWholePackage}
                  className="bg-neutral-800 hover:bg-neutral-900 text-white font-extrabold text-[10px] font-mono uppercase px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                >
                  <span>📋 Salin 1 Paket</span>
                </button>
              </div>
            )}

          </div>

          <div className="border-t border-neutral-200/80 pt-3 mt-4 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
            <span>Sandi Status: Berkas Pembelajaran Terintegrasi</span>
            <span className="font-semibold uppercase text-emerald-600">Terbuka di {lembaga.name} Workspace</span>
          </div>

        </div>

      </div>
    </div>
  );
}
