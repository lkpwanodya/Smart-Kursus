import React, { useState } from 'react';
import { 
  ArrowLeft, CheckCircle, Mail, Phone, MapPin, 
  BookOpen, Calendar, Building, HelpCircle, UserCheck, 
  Layers, ShieldCheck, Heart, Award, Sparkles,
  Laptop, Users, ArrowRight, ChevronDown, ChevronUp, MessageSquare, Briefcase, Check, GraduationCap, Info,
  Clock, Link
} from 'lucide-react';
import { Institution, Student, Program } from '../types';

interface PublicLandingPageProps {
  lembaga: Institution;
  onBack: () => void;
  onRegisterStudent: (student: Student) => void;
}

export default function PublicLandingPage({ lembaga, onBack, onRegisterStudent }: PublicLandingPageProps) {
  // Form states
  const [name, setName] = useState('');
  const [nik, setNik] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedProgramId, setSelectedProgramId] = useState(lembaga.programs[0]?.id || '');
  const [registrationSuccess, setRegistrationSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = window.location.origin + window.location.pathname + '?lembaga=' + encodeURIComponent(lembaga.id);
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // Interactive FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Form submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !nik || !email || !phone || !selectedProgramId) {
      alert('🔒 Semua kolom wajib diisi untuk pendaftaran online!');
      return;
    }

    if (nik.length < 16) {
      alert('⚠️ Mohon periksa kembali: NIK harus terdiri dari 16 digit sesuai KTP/KK!');
      return;
    }

    const selectedProgram = lembaga.programs.find(p => p.id === selectedProgramId);

    const newStudent: Student = {
      id: 's_pub_' + Date.now(),
      name: name.trim(),
      nik: nik.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      programId: selectedProgramId,
      registrationType: 'Online',
      joinDate: new Date().toISOString().split('T')[0],
      status: 'Aktif'
    };

    onRegisterStudent(newStudent);

    setRegistrationSuccess(
      `🎉 Selamat! Pendaftaran online Anda di "${lembaga.name}" telah diterima secara langsung. Kelas pilihan Anda adalah "${selectedProgram?.name || 'Program Kelas'}". Harap segera catat nomor kontak pengelola (${lembaga.profile.phone}) untuk petunjuk pendaftaran lanjutan.`
    );

    // Reset form
    setName('');
    setNik('');
    setEmail('');
    setPhone('');
  };

  // Scroll smooth anchor
  const scrollToRegister = () => {
    const el = document.getElementById('daftar-online-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Hitung Kepatuhan Rata-Rata Standard Nasional Pendidikan (SNP)
  const averageSnp = lembaga.snpStandards && lembaga.snpStandards.length > 0
    ? Math.round(lembaga.snpStandards.reduce((acc, st) => acc + st.percentage, 0) / lembaga.snpStandards.length)
    : 85;

  // Generate nice deterministic details for legality
  const npsnHash = lembaga.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const npsn = lembaga.profile.npsn || ('K99' + (10000 + (npsnHash * 17) % 90000));
  const skNo = lembaga.profile.skDisdik || `421.9/${100 + (npsnHash % 400)}-Disdik/2024`;
  const akreditasi = lembaga.profile.accreditationRating || 'Terakreditasi B (Sangat Baik) oleh BAN-PDM';

  const highlightsList = lembaga.profile.highlights || [
    { title: "Peralatan & Lab Modern", description: "Praktek intensif menggunakan fasilitas laboratorium komputer modern." },
    { title: "Sertifikat Resmi Kelulusan", description: "Setiap siswa memperoleh sertifikat kompetensi resmi terakreditasi." },
    { title: "Instruktur Profesional", description: "Kompetensi maksimal dibina oleh pengajar bersertifikat ahli di bidangnya." },
    { title: "Kesiapan Kerja Nyata", description: "Kami bekerja sama dengan berbagai industri dunia usaha terdekat." }
  ];

  const highlightIcons = [Laptop, GraduationCap, Users, Briefcase];

  const faqList = lembaga.profile.faqs || [
    {
      q: "Apakah pemula tanpa dasar keahlian bisa ikut?",
      a: "Tentu saja! Materi pembelajaran di kursus ini disusun secara sistematis mulai dari nol (basic) hingga mahir, dengan bimbingan penuh dari instruktur pendamping."
    },
    {
      q: "Bagaimana penentuan jadwal pelatihannya?",
      a: "Jadwal belajar sangat fleksibel dan diistirahatkan merata. Anda bisa berdiskusi langsung dengan instruktur setelah formulir pendaftaran terverifikasi."
    },
    {
      q: "Apakah kelulusan disertai sertifikat resmi?",
      a: `Ya, setiap siswa yang menyelesaikan tugas & evaluasi mendapatkan Sertifikat Resmi berlisensi dari Lembaga ${lembaga.name} untuk mendaftar kerja.`
    },
    {
      q: "Bagaimana dengan kelengkapan modul & praktek?",
      a: "Seluruh modul materi, alat peraga praktek, serta akses penuh laboratorium dan AC sudah termasuk tanpa ada biaya tambahan/biaya tersembunyi."
    }
  ];

  // Check open/closed status: Monday-Friday (1-5) 08:00-16:00, Saturday (6) 08:05-13:00
  const getCurrentStatus = () => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const hours = now.getHours();
    
    if (day >= 1 && day <= 5) {
      if (hours >= 8 && hours < 16) {
        return { isOpen: true, badge: 'Buka Sekarang', desc: 'Senin - Jumat s/d 16:00 WIB' };
      }
      return { isOpen: false, badge: 'Sudah Tutup', desc: 'Buka besok pukul 08:00 WIB' };
    } else if (day === 6) {
      if (hours >= 8 && hours < 13) {
        return { isOpen: true, badge: 'Buka Sekarang', desc: 'Sabtu s/d 13:00 WIB' };
      }
      return { isOpen: false, badge: 'Sudah Tutup', desc: 'Buka Senin pkl 08:00 WIB' };
    } else {
      return { isOpen: false, badge: 'Tutup (Minggu)', desc: 'Buka Senin pkl 08:00 WIB' };
    }
  };

  const operationalStatus = getCurrentStatus();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const isMobile = window.innerWidth < 1024;
      const offset = isMobile ? 115 : 75;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-neutral-800 pb-12">
      
      {/* 1. Header Navigation - Sticky/Fixed, Compact & Modern */}
      <div className="sticky top-0 z-50 bg-white p-3 px-4 md:px-6 -mx-4 md:-mx-8 -mt-4 md:-mt-8 border-b border-neutral-200 shadow-sm flex items-center justify-between gap-3 animate-fade-in">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-bold text-neutral-700 hover:text-emerald-700 bg-neutral-100/85 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer border border-neutral-200/60 shadow-4xs shrink-0"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Kembali</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 text-xs font-bold text-neutral-700 hover:text-emerald-750 bg-neutral-100/85 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer border border-neutral-200/60 shadow-4xs shrink-0"
          >
            <Link className={`w-3 h-3 ${copied ? 'text-emerald-600 animate-bounce' : 'text-neutral-500'}`} />
            <span>{copied ? 'Tautan Disalin!' : 'Salin Tautan'}</span>
          </button>
          
          <div className="flex items-center gap-1.5 border-l border-neutral-250 pl-2 min-w-0">
            {lembaga.profile.logoUrl ? (
              <img 
                src={lembaga.profile.logoUrl} 
                alt="Logo" 
                className="w-5 h-5 rounded-md object-contain bg-neutral-50/80 p-0.5 border border-neutral-200/50 shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-5 h-5 bg-emerald-600 text-white rounded-md flex items-center justify-center font-black text-[9px] shrink-0 uppercase">
                {lembaga.name.charAt(0)}
              </div>
            )}
            <span className="hidden sm:inline-block font-black text-xs uppercase tracking-wider text-neutral-800 truncate max-w-[150px] md:max-w-[240px]">
              {lembaga.name.replace(/Lembaga Kursus/gi, '').trim()}
            </span>
          </div>
        </div>

        {/* Navigation Actions aligned to the right with improved hierarchy */}
        <div className="flex items-center gap-1.5 sm:gap-4 justify-end ml-auto">
          {/* Menu links - Hidden on mobile/tablet, shown on desktop (lg and up) to avoid bar clutter */}
          <div className="hidden lg:flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => scrollToSection('tentang-section')}
              className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-emerald-600 hover:bg-emerald-50/50 px-2 py-1.5 rounded-lg transition-all cursor-pointer"
            >
              Tentang
            </button>
            <button
              onClick={() => scrollToSection('legalitas-section')}
              className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-emerald-600 hover:bg-emerald-50/50 px-2 py-1.5 rounded-lg transition-all cursor-pointer"
            >
              Legalitas
            </button>
            <button
              onClick={() => scrollToSection('program-section')}
              className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-emerald-600 hover:bg-emerald-50/50 px-2 py-1.5 rounded-lg transition-all cursor-pointer"
            >
              Program
            </button>
            <button
              onClick={() => scrollToSection('jadwal-section')}
              className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-emerald-600 hover:bg-emerald-50/50 px-2 py-1.5 rounded-lg transition-all cursor-pointer"
            >
              Agenda
            </button>
            <button
              onClick={() => scrollToSection('tanya-section')}
              className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-emerald-600 hover:bg-emerald-50/50 px-2 py-1.5 rounded-lg transition-all cursor-pointer"
            >
              Tanya
            </button>

            {/* Elegant separation line */}
            <div className="h-5 w-px bg-neutral-200 mx-1.5" />
          </div>

          {/* Highlighted primary action button */}
          <button
            onClick={scrollToRegister}
            className="bg-emerald-600 hover:bg-emerald-500 active:scale-97 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all shadow-xs hover:shadow-sm cursor-pointer flex items-center gap-1 sm:gap-1.5 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
            <span>Daftar Kursus</span>
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Horizontal Sub-Navigation Slider - Sticky on mobile screen right under main header */}
      <div className="lg:hidden sticky top-[48px] sm:top-[53px] z-40 bg-white -mx-4 px-4 py-2 border-b border-neutral-150 flex items-center gap-1.5 overflow-x-auto scrollbar-none scroll-smooth">
        {[
          { id: 'tentang-section', label: 'Tentang' },
          { id: 'legalitas-section', label: 'Legalitas' },
          { id: 'program-section', label: 'Program' },
          { id: 'jadwal-section', label: 'Agenda' },
          { id: 'tanya-section', label: 'Tanya' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-neutral-500 hover:text-emerald-600 active:scale-95 px-3 py-1.5 rounded-xl border border-neutral-150 bg-neutral-50/50 hover:bg-emerald-50 hover:border-emerald-200 transition-all cursor-pointer shrink-0"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 2. Hero Section - Compact & Elegant */}
      <div 
        className="relative rounded-2xl p-5 md:p-6 text-white overflow-hidden shadow-xs bg-cover bg-center min-h-[180px] flex flex-col justify-end"
        style={lembaga.profile.bannerUrl ? { backgroundImage: `url(${lembaga.profile.bannerUrl})` } : {}}
      >
        {!lembaga.profile.bannerUrl && (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-850 to-neutral-950 rounded-2xl" />
        )}
        <div className="absolute top-0 right-0 p-6 transform translate-x-12 -translate-y-12 opacity-5 pointer-events-none">
          <Layers className="w-48 h-48" />
        </div>

        {/* Content Box - Rendered with beautiful semi-transparent glass panel only when banner exists to ensure readability, otherwise clean and direct */}
        <div className={`relative z-10 w-full rounded-xl flex flex-col justify-between ${
          lembaga.profile.bannerUrl 
            ? 'bg-neutral-950/65 backdrop-blur-xs p-4 md:p-5 border border-white/10 shadow-lg' 
            : 'space-y-4'
        }`}>
          <div className="flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
            <div className="max-w-3xl space-y-2.5">
              <h2 className="text-xl md:text-2xl font-black font-display tracking-tight uppercase leading-tight text-white drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.8)]">
                {lembaga.name}
              </h2>

              <p className="text-xs md:text-sm text-neutral-100 font-medium leading-relaxed font-sans max-w-2xl drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {lembaga.profile.vision || 'Menyelenggarakan kursus bernilai tinggi untuk menciptakan lulusan profesional dan siap bersaing di pasar kerja global.'}
              </p>
            </div>

            {lembaga.profile.logoUrl && (
              <div className="shrink-0 bg-white/20 backdrop-blur-xs p-1.5 rounded-2xl border border-white/20 shadow-md">
                <img 
                  src={lembaga.profile.logoUrl} 
                  alt="Logo" 
                  className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-contain bg-white p-1"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </div>

          <div className={`flex flex-wrap gap-y-1.5 gap-x-4 text-[11px] text-white font-semibold ${
            lembaga.profile.bannerUrl ? 'pt-2.5 mt-2.5 border-t border-white/15' : 'pt-3 mt-3 border-t border-white/20'
          }`}>
            <span className="flex items-center gap-1.5 bg-black/45 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/10 drop-shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{lembaga.profile.address}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-black/45 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/10 drop-shadow-sm">
              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{lembaga.profile.phone}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-black/45 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/10 drop-shadow-sm">
              <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{lembaga.profile.email}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Visi & Misi, Jam Operasional, & Peta Lokasi (Compact Bento Layout) */}
      <div id="tentang-section" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 scroll-mt-20">
        
        {/* Visi & Misi Card */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-3xs space-y-3.5 flex flex-col justify-between">
          <div className="border-b border-neutral-100 pb-2">
            <h3 className="font-extrabold text-xs uppercase font-mono tracking-wider text-emerald-700">Visi & Misi Lembaga</h3>
          </div>
          
          <div className="space-y-3 flex-1 flex flex-col justify-center">
            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-150 relative flex flex-col justify-center">
              <span className="absolute top-1 right-2 text-4xl font-serif text-emerald-200/35 pointer-events-none select-none">“</span>
              <h4 className="font-extrabold text-neutral-800 text-[10px] mb-1 uppercase tracking-wider font-mono">Visi Utama</h4>
              <p className="text-xs text-neutral-600 italic leading-relaxed">
                "{lembaga.profile.vision || 'Menciptakan ruang belajar kursus terbaik bertenaga teknologi tinggi.'}"
              </p>
            </div>
            
            <div className="p-0.5">
              <h4 className="font-extrabold text-neutral-850 text-[10px] mb-1.5 uppercase tracking-wider font-mono">Misi Utama</h4>
              <ul className="space-y-1.5 text-xs text-neutral-600 leading-normal">
                {lembaga.profile.mission ? (
                   lembaga.profile.mission.split('\n').filter(line => line.trim() !== '').slice(0, 3).map((m, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded text-[8px] mt-0.5 shrink-0">{idx + 1}</span>
                      <span className="line-clamp-2">{m}</span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-mono font-bold shrink-0">•</span>
                      <span>Menyelenggarakan pembelajaran berkualitas tinggi bersertifikasi resmi.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-650 font-mono font-bold shrink-0">•</span>
                      <span>Menyediakan sarana praktek yang kondusif & instruktur berpengalaman.</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Jam Operasional Card */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-3xs space-y-3.5 flex flex-col justify-between">
          <div className="border-b border-neutral-100 pb-2 flex items-center justify-between">
            <h3 className="font-extrabold text-xs uppercase font-mono tracking-wider text-emerald-700">Jam Operasional</h3>
            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase font-mono border ${
              operationalStatus.isOpen 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                : 'bg-neutral-50 text-neutral-500 border-neutral-150'
            }`}>
              {operationalStatus.badge}
            </span>
          </div>

          <div className="space-y-3 flex-1 flex flex-col justify-center">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-1.5 text-xs">
                <span className="font-semibold text-neutral-600">Senin - Jumat</span>
                <span className="font-mono font-extrabold text-neutral-800">08:00 - 16:00 WIB</span>
              </div>
              <div className="flex items-center justify-between border-b border-neutral-100 pb-1.5 text-xs">
                <span className="font-semibold text-neutral-600">Sabtu</span>
                <span className="font-mono font-extrabold text-neutral-800">08:00 - 13:00 WIB</span>
              </div>
              <div className="flex items-center justify-between border-b border-neutral-100 pb-1.5 text-xs">
                <span className="font-semibold text-neutral-550">Minggu & Libur</span>
                <span className="font-bold text-neutral-400 italic">Tutup</span>
              </div>
            </div>

            <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-150 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-[10px] text-neutral-500 leading-normal">
                {operationalStatus.isOpen 
                  ? `Kantor administrasi kami siap melayani Anda di lokasi saat ini (${operationalStatus.desc}).` 
                  : `Kantor saat ini sedang tutup (${operationalStatus.desc}). Namun Anda tetap dapat mendaftar online secara instan 24 jam.`}
              </p>
            </div>
          </div>
        </div>

        {/* Google Maps Map Card */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-3xs flex flex-col justify-between space-y-2 lg:col-span-1 md:col-span-2 lg:md:col-span-1">
          <div className="border-b border-neutral-100 pb-2">
            <h3 className="font-extrabold text-xs uppercase font-mono tracking-wider text-emerald-700">Peta Lokasi Lembaga</h3>
          </div>
          
          <div className="flex-1 w-full min-h-[140px] relative rounded-xl overflow-hidden border border-neutral-200 shadow-4xs">
            <iframe
              title="Google Map Lembaga"
              width="100%"
              height="100%"
              className="absolute inset-0 border-0"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(lembaga.profile.mapQuery || lembaga.profile.address || lembaga.name)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
            />
          </div>
          
          <p className="text-[10px] text-neutral-500 font-medium flex items-center gap-1 leading-tight">
            <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="truncate">{lembaga.profile.address}</span>
          </p>
        </div>
      </div>

      {/* 3.1. Fasilitas & Kelebihan Unggulan */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-3xs space-y-4 animate-fade-in">
        <div className="border-b border-neutral-100 pb-2 flex items-center justify-between">
          <h3 className="font-extrabold text-xs uppercase font-mono tracking-wider text-emerald-700">Mengapa Memilih {lembaga.name}?</h3>
          <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {highlightsList.slice(0, 4).map((h, idx) => {
            const IconComponent = highlightIcons[idx] || Laptop;
            return (
              <div key={idx} className="flex gap-3">
                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0 border border-emerald-100">
                  <IconComponent className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-neutral-800 text-xs">{h.title}</h4>
                  <p className="text-[10px] sm:text-[11px] text-neutral-500 leading-normal">{h.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3.2. Legalitas & Kredibilitas Lembaga - scroll-mt-20 */}
      <div id="legalitas-section" className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-3xs space-y-4 scroll-mt-20">
        <div className="border-b border-neutral-100 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <h3 className="font-extrabold text-xs uppercase font-mono tracking-wider text-emerald-700">Legalitas & Kredibilitas Lembaga</h3>
          </div>
          <span className="text-[10px] font-extrabold text-emerald-800 uppercase bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-mono">
            Izin Operasional Valid
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Izin Resmi & Dokumen Hukum */}
          <div className="lg:col-span-5 space-y-4">
            <div className="space-y-3">
              <h4 className="font-black text-neutral-900 text-sm tracking-tight uppercase">Izin Resmi Terdaftar</h4>
              <p className="text-xs text-neutral-500 leading-relaxed font-medium">
                Lembaga kami adalah satuan pendidikan non-formal resmi yang patuh hukum dan terdaftar di kementerian terkait dengan izin operasional aktif.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
              <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-150 flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-mono text-neutral-400 font-bold leading-none mb-1">NPSN (Kemendikbud)</p>
                  <p className="text-xs font-extrabold text-neutral-800 truncate font-mono">{npsn}</p>
                </div>
              </div>

              <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-150 flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-mono text-neutral-400 font-bold leading-none mb-1">Izin Operasional Dinas</p>
                  <p className="text-xs font-extrabold text-neutral-800 truncate font-mono">{skNo}</p>
                </div>
              </div>

              <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-150 flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-mono text-neutral-400 font-bold leading-none mb-1">Akreditasi Satuan</p>
                  <p className="text-xs font-extrabold text-emerald-700 truncate">{akreditasi}</p>
                </div>
              </div>

              <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-150 flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-mono text-neutral-400 font-bold leading-none mb-1">Aktif Berlaku S/D</p>
                  <p className="text-xs font-extrabold text-neutral-800 truncate font-mono">
                    {new Date(lembaga.activeUntil).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Kepatuhan Standar Nasional Pendidikan (SNP) */}
          <div className="lg:col-span-7 bg-neutral-50 p-4 rounded-xl border border-neutral-150 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between gap-3 border-b border-neutral-200 pb-2">
              <div className="space-y-0.5">
                <h4 className="font-black text-neutral-905 text-sm tracking-tight uppercase">Pemenuhan Standar Nasional (SNP)</h4>
                <p className="text-[10px] text-neutral-500 font-medium font-sans">Berdasarkan hasil asesmen kelayakan 8 standar pendidikan non-formal secara MANDIRI</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] uppercase font-mono font-bold text-neutral-400 leading-none">Rata-Rata Kepatuhan</p>
                <p className="text-lg font-black text-emerald-600 font-mono">{averageSnp}%</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 justify-center py-1">
              {lembaga.snpStandards && lembaga.snpStandards.length > 0 ? (
                lembaga.snpStandards.slice(0, 8).map((std) => (
                  <div key={std.id} className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-neutral-700">
                      <span className="truncate max-w-[170px] font-sans">{std.title}</span>
                      <span className="font-mono text-emerald-600 shrink-0">{std.percentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                        style={{ width: `${std.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center text-xs text-neutral-400 py-6">
                  Data pemenuhan SNP terintegrasi untuk {lembaga.name} belum diatur.
                </div>
              )}
            </div>

            <p className="text-[11px] text-neutral-500 border-t border-neutral-200 pt-2 flex items-center gap-1.5 font-medium leading-normal font-sans">
              <Info className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Sertifikasi kelayakan & kesesuaian mengacu pada instrumen BAN-PDM Republik Indonesia secara kontinu.</span>
            </p>
          </div>
        </div>
      </div>

      {/* 4. Programs & Classes Grid */}
      <div id="program-section" className="space-y-6 scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-neutral-200 pb-4">
          <div className="space-y-1">
            <h3 className="font-black text-neutral-900 text-lg md:text-xl uppercase tracking-tight">Program Pelatihan Pilihan</h3>
            <p className="text-sm text-neutral-500">Kompetensi dan sertifikasi keahlian unggulan di {lembaga.name}.</p>
          </div>
          <span className="text-xs text-neutral-700 font-bold uppercase font-mono tracking-wider bg-neutral-100 px-3.5 py-1.5 rounded-full border border-neutral-200 self-start">
            {lembaga.programs.length} Kelas Tersedia
          </span>
        </div>

        {lembaga.programs.length === 0 ? (
          <div className="p-12 bg-white border border-neutral-200 rounded-3xl text-center text-neutral-500 italic text-sm">
            Belum ada program kursus aktif yang ditambahkan oleh admin lembaga ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {lembaga.programs.map((prog) => (
              <div 
                key={prog.id} 
                className={`bg-white rounded-3xl border border-neutral-200 p-7 flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden group ${
                  prog.status === 'Non-Aktif' ? 'opacity-60' : ''
                }`}
              >
                {prog.status === 'Non-Aktif' && (
                  <div className="absolute top-3 right-3 bg-neutral-100 border border-neutral-200 text-neutral-500 text-[10px] px-2.5 py-1 rounded-md font-bold uppercase">
                    Penuh / Tutup
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1 rounded-full text-[11px] font-bold font-mono tracking-wider uppercase inline-block">
                    {prog.duration}
                  </div>
                  <h4 className="font-black text-neutral-900 text-lg uppercase leading-snug group-hover:text-emerald-700 transition-colors">
                    {prog.name}
                  </h4>
                  <p className="text-sm text-neutral-500 leading-relaxed line-clamp-3">
                    {prog.description || 'Kursus berstandardisasi dikoordinasikan langsung bersama instruktur berpengalaman di bidang keahlian.'}
                  </p>
                </div>

                <div className="border-t border-neutral-150 pt-4 mt-5 space-y-2 text-sm text-neutral-600">
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-neutral-500">Biaya Daftar:</span>
                    <span className="font-bold text-neutral-800 font-mono">Rp {(prog.regFee || 0).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-neutral-500">Biaya Kursus:</span>
                    <span className="font-bold text-neutral-800 font-mono">Rp {(prog.tuitionFee || prog.price || 0).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-neutral-500">Iuran Bulanan:</span>
                    <span className="font-bold text-neutral-800 font-mono">Rp {(prog.monthlyFee || 0).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between border-t border-neutral-150 pt-3.5 mt-3 items-center">
                    <div>
                      <p className="text-[10px] text-neutral-500 uppercase font-mono tracking-wider font-extrabold mb-0.5">Total Biaya</p>
                      <p className="text-lg md:text-xl font-black text-emerald-600 font-display">
                        Rp {prog.price.toLocaleString('id-ID')}
                      </p>
                    </div>

                    {prog.status === 'Aktif' ? (
                      <button
                        onClick={() => {
                          setSelectedProgramId(prog.id);
                          scrollToRegister();
                        }}
                        className="bg-neutral-950 hover:bg-neutral-850 text-white font-extrabold text-xs uppercase cursor-pointer tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-3xs"
                      >
                        Pilih Kelas Ini
                      </button>
                    ) : (
                      <span className="text-xs text-neutral-400 font-extrabold">Tidak Tersedia</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Agenda Kursus Terdekat */}
      <div id="jadwal-section" className="max-w-xl mx-auto w-full scroll-mt-20">
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
            <h4 className="font-extrabold text-neutral-850 text-sm flex items-center gap-2 uppercase tracking-wide">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span>Agenda Pembelajaran Terdekat</span>
            </h4>
            <span className="text-xs text-neutral-500 font-mono uppercase bg-neutral-100 border border-neutral-200 px-2.5 py-0.5 rounded-lg">Jadwal Aktif</span>
          </div>
          {lembaga.calendar && lembaga.calendar.length > 0 ? (
            <div className="grid grid-cols-1 gap-2.5 max-h-[200px] overflow-y-auto pr-1">
              {lembaga.calendar.map(event => (
                <div key={event.id} className="flex justify-between items-center p-3 bg-neutral-50 rounded-xl text-sm border border-neutral-150">
                  <div>
                    <p className="font-extrabold text-neutral-850 text-sm">{event.title}</p>
                    <span className="text-xs text-neutral-450 font-medium">{event.type}</span>
                  </div>
                  <span className="font-mono text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded font-bold border border-emerald-100">
                    {event.date}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-400 italic text-center py-6">
              Sistem pengajaran dijalankan regular & bertahap disesuaikan dengan kuota pendaftaran masing-masing program.
            </p>
          )}
        </div>
      </div>

      {/* 5.1. Panduan Calon Siswa (Tanya Jawab & Alur Pendaftaran) */}
      <div id="tanya-section" className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in scroll-mt-20">
        
        {/* FAQ Card */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-3xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="border-b border-neutral-100 pb-2.5 flex items-center gap-2 mb-3">
              <HelpCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <h4 className="font-extrabold text-neutral-850 text-xs sm:text-sm uppercase tracking-wide">Tanya Jawab Calon Siswa (FAQ)</h4>
            </div>
            
            <div className="space-y-2">
              {faqList.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} className="border border-neutral-150 rounded-xl overflow-hidden transition-all bg-neutral-50/50">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-3 flex justify-between items-center text-left text-xs font-bold text-neutral-800 hover:text-emerald-700 hover:bg-neutral-55 transition-all"
                    >
                      <span className="pr-4">{item.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-neutral-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="p-3 pt-1 border-t border-neutral-150 text-[11px] text-neutral-600 bg-white leading-relaxed animate-fade-in font-medium font-sans">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Alur Pendaftaran Card */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-3xs space-y-4 flex flex-col justify-between">
          <div className="border-b border-neutral-100 pb-2 flex items-center gap-2">
            <span className="w-5.5 h-5.5 bg-emerald-50 text-emerald-700 font-mono font-bold rounded-lg flex items-center justify-center text-xs shrink-0 border border-emerald-100">
              ✓
            </span>
            <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-wide text-neutral-850">3 Langkah Mudah Mendaftar</h3>
          </div>
          
          <div className="flex-1 justify-center flex flex-col space-y-4 pt-1">
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 bg-neutral-150 text-neutral-700 font-bold rounded-full flex items-center justify-center text-[10px] shrink-0 font-mono border border-neutral-200">
                1
              </div>
              <div>
                <p className="font-bold text-xs text-neutral-805">Isi Formulir Singkat</p>
                <p className="text-[10px] sm:text-[11px] text-neutral-500 leading-normal">Pilih program lalu lengkapi nama, NIK, dan nomor kontak aktif pada formulir di bawah.</p>
              </div>
            </div>
            
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 bg-emerald-100 text-emerald-800 font-bold rounded-full flex items-center justify-center text-[10px] shrink-0 font-mono border border-emerald-150">
                2
              </div>
              <div>
                <p className="font-bold text-xs text-neutral-850">Konfirmasi Admin Lembaga</p>
                <p className="text-[10px] sm:text-[11px] text-neutral-500 leading-normal">Staf administrasi kami akan mengkonfirmasikan syarat pendaftaran dan kuota siswa baru Anda.</p>
              </div>
            </div>
            
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 bg-neutral-900 text-white font-bold rounded-full flex items-center justify-center text-[10px] shrink-0 font-mono">
                3
              </div>
              <div>
                <p className="font-bold text-xs text-neutral-850">Kelas Pembelajaran Kick-off</p>
                <p className="text-[10px] sm:text-[11px] text-neutral-500 leading-normal">Ambil modul atau buku materi di kantor Lembaga dan kelas kursus belajar siap dimulai.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Whatsapp Quick Advisory Board */}
      <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-150 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-4xs">
        <div className="space-y-1">
          <h5 className="text-xs font-black text-emerald-950 uppercase tracking-tight flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Butuh Bantuan / Konsultasi Langsung?</span>
          </h5>
          {/* Keterangan dihilangkan sesuai permintaan */}
        </div>
        <a
          href={`https://wa.me/${lembaga.profile.phone.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] sm:text-xs uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all shadow-4xs hover:shadow-3xs flex items-center justify-center gap-1.5 self-stretch sm:self-auto text-center"
        >
          <Phone className="w-3.5 h-3.5 animate-pulse" />
          <span>Tanya via WhatsApp</span>
        </a>
      </div>

      {/* 6. Form Registrasi Online Card */}
      <div id="daftar-online-form" className="bg-white p-6 md:p-8 rounded-3xl border border-neutral-200 shadow-md max-w-xl mx-auto space-y-6 relative overflow-hidden">
        
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-full transform translate-x-6 -translate-y-6" />

        <div className="border-b border-neutral-150 pb-4 text-center">
          <div className="mx-auto w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-2 border border-emerald-100">
            <UserCheck className="w-5 h-5" />
          </div>
          <h3 className="font-black text-xl text-neutral-900 uppercase tracking-tight">Pendaftaran Siswa Baru</h3>
          <p className="text-sm text-neutral-400">Hubungkan masa depan Anda sekarang, tanpa perlu kata sandi rujukan.</p>
        </div>

        {registrationSuccess ? (
          <div className="p-6 bg-emerald-50 border border-emerald-250 rounded-3xl space-y-4 animate-fade-in text-center">
            <div className="mx-auto w-14 h-14 bg-white rounded-full flex items-center justify-center text-emerald-600 border border-emerald-200 shadow-xs">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h4 className="font-black text-emerald-900 text-sm uppercase">Pendaftaran Terkirim Secara Live!</h4>
              <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed font-semibold">
                {registrationSuccess}
              </p>
            </div>
            <button
              onClick={() => setRegistrationSuccess('')}
              className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all shadow-3xs cursor-pointer"
            >
              Kirim Pendaftaran Baru Lagi
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-wrap">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                  Nama Lengkap Siswa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Andi Wijaya"
                  className="w-full text-sm p-3.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none bg-neutral-50 focus:bg-white transition-all shadow-3xs text-neutral-800 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                  Nomor NIK KTP / KK (16 Digit) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                  placeholder="327301xxxxxxxxxx"
                  className="w-full text-sm p-3.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none bg-neutral-50 focus:bg-white font-mono transition-all shadow-3xs text-neutral-800 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-wrap">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                  Alamat Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="andi@gmail.com"
                  className="w-full text-sm p-3.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none bg-neutral-50 focus:bg-white transition-all shadow-3xs text-neutral-800 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                  Nomor Telepon / WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08123456789"
                  className="w-full text-sm p-3.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none bg-neutral-50 focus:bg-white transition-all shadow-3xs text-neutral-800 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                Pilih Program Kelas Yang Diinginkan <span className="text-red-500">*</span>
              </label>
              {lembaga.programs.length === 0 ? (
                <div className="text-sm text-red-500 p-3.5 bg-red-50 rounded-xl border border-red-100 font-semibold">
                  Maaf, belum ada kelas yang dapat dipilih sementara ini.
                </div>
              ) : (
                <select
                  value={selectedProgramId}
                  onChange={(e) => setSelectedProgramId(e.target.value)}
                  className="w-full text-sm p-3.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none bg-neutral-50 focus:bg-white font-bold transition-all shadow-3xs text-neutral-850"
                >
                  {lembaga.programs.filter(p => p.status === 'Aktif').map((prog) => (
                    <option key={prog.id} value={prog.id} className="font-bold">
                      {prog.name.toUpperCase()} (Daftar: Rp {(prog.regFee || 0).toLocaleString('id-ID')} | Kursus: Rp {(prog.tuitionFee || prog.price || 0).toLocaleString('id-ID')} | Bulanan: Rp {(prog.monthlyFee || 0).toLocaleString('id-ID')} - {prog.duration})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 text-xs text-neutral-500 leading-relaxed flex gap-3 items-start">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Dengan menekan tombol kirim pendaftaran, Anda menyetujui bahwa data Anda akan diserahkan langsung pada sistem manajemen dan administrasi Lembaga Kursus <strong>{lembaga.name}</strong> untuk diverifikasi pembukaan kelas barunya.
              </span>
            </div>

            <button
              type="submit"
              disabled={lembaga.programs.length === 0}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm py-4 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4.5 h-4.5 text-emerald-100" />
              <span>Verifikasi & Kirim Formulir Pendaftaran Live</span>
            </button>
          </form>
        )}
      </div>

    </div>
  );
}
