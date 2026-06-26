import React, { useState, useEffect, useRef } from 'react';
import { 
  DUMMY_INSTITUTIONS, 
  INITIAL_SNP_STANDARDS 
} from './utils/dummyData';
import { Institution, Student, RaportCard, Program, Facility, Teacher } from './types';
import { 
  Sparkles, KeyRound, LogOut, CheckCircle, ShieldAlert, ShieldCheck,
  Calendar, Layers, Users, TrendingUp, HelpCircle, Database,
  BookOpen, Plus, Trash2, Eye, EyeOff, CalendarRange, Clock, Lock, X, User, Search,
  Building, FolderKanban, ClipboardCheck, MapPin, Landmark, Percent, 
  FileSpreadsheet, Download, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, FileText, BrainCircuit
} from 'lucide-react';

import AIAssistance from './components/AIAssistance';
import AdminModules from './components/AdminModules';
import PendaftaranSiswa from './components/PendaftaranSiswa';
import RaportPrint from './components/RaportPrint';
import PublicLandingPage from './components/PublicLandingPage';

import { loadInstitutions, sanitizeForFirestore } from './utils/firebaseSync';
import { db } from './utils/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';


export default function App() {
  // Public visitor state for seeing a single institution landing website, initialized from URL
  const [selectedPublicLkpId, setSelectedPublicLkpId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('lkp');
  });

  // 1. Core database state initialized from Firestore with fallback
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const prevInstitutionsRef = useRef<Institution[]>([]);

  useEffect(() => {
    async function init() {
      try {
        const data = await loadInstitutions();
        setInstitutions(data);
        prevInstitutionsRef.current = data;

        // Cocokkan query param ?lkp=id-lembaga dengan data riil dari Firestore setelah data dimuat
        const params = new URLSearchParams(window.location.search);
        const lkpParam = params.get('lkp');
        if (lkpParam) {
          const found = data.find(i => i.id.toLowerCase() === lkpParam.toLowerCase());
          if (found) {
            setSelectedPublicLkpId(found.id);
          } else {
            setSelectedPublicLkpId(null);
          }
        }
      } catch (e) {
        console.error("Gagal inisialisasi database:", e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Sync state ke URL secara real-time
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (selectedPublicLkpId) {
      params.set('lkp', selectedPublicLkpId);
    } else {
      params.delete('lkp');
    }
    const newRelativePathQuery = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState(null, '', newRelativePathQuery);
  }, [selectedPublicLkpId]);

  // Firebase database storage capacity state for superadmin (default simulation limit is 100 KB)
  const [storageLimitKb, setStorageLimitKb] = useState<number>(100);

  // Estimasi ukuran database berdasarkan kompresi JSON + metadata overhead
  const dbSizeBytes = institutions.reduce((sum, inst) => {
    return sum + JSON.stringify(inst).length + 150;
  }, 0);
  const dbSizeKb = Number((dbSizeBytes / 1024).toFixed(2));
  const storageLimitBytes = storageLimitKb * 1024;
  const usagePercentage = Math.min(100, Number(((dbSizeBytes / storageLimitBytes) * 100).toFixed(1)));
  const remainingPercentage = Number((100 - usagePercentage).toFixed(1));
  const isLowCapacity = remainingPercentage < 10;

  // 2. Auth Session states
  const [currentUser, setCurrentUser] = useState<{
    role: 'superadmin' | 'lembaga';
    id?: string; // institution ID
    subRole?: 'pimpinan' | 'staf_admin' | 'pengajar' | 'bendahara';
    selectedTeacherId?: string;
    staffName?: string;
    staffUsername?: string;
  } | null>(() => {
    const savedSession = localStorage.getItem('user_session');
    if (savedSession) {
      const parsed = JSON.parse(savedSession);
      if (parsed && parsed.role === 'lembaga' && !parsed.subRole) {
        parsed.subRole = 'pimpinan';
      }
      return parsed;
    }
    return null;
  });

  // 3. Navigation inside Institution dashboard
  const [activeSidebar, setActiveSidebar] = useState<'dashboard' | 'administrasi' | 'asisten_ai' | 'registrasi' | 'raport'>('dashboard');
  const [activeModule, setActiveModule] = useState<string>('profil');
  const [activeAITab, setActiveAITab] = useState<'rpp' | 'lks' | 'teori' | 'praktek' | 'penilaian'>('rpp');
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [aiDropdownOpen, setAiDropdownOpen] = useState(false);
  const [dismissedLicenseWarningLkpId, setDismissedLicenseWarningLkpId] = useState<string | null>(null);

  // Accordion open/collapse group tracking
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  // Sidebar collapsed state (compact navigation)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('is_sidebar_collapsed');
    return saved === 'true';
  });

  // 4. Login inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState<'superadmin' | 'lembaga'>('lembaga');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginError, setLoginError] = useState('');

  // 5. Signup / Registration inputs for NEW course institution (multi-tenancy)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [regSkillField, setRegSkillField] = useState('Tata Busana');
  const [regSkillCustom, setRegSkillCustom] = useState('');
  const [regEnableAI, setRegEnableAI] = useState(true);
  const [regIsGenerating, setRegIsGenerating] = useState(false);
  const [regGenStatus, setRegGenStatus] = useState('');

  // 6. Superadmin and creation form states
  const [superNewLkpName, setSuperNewLkpName] = useState('');
  const [superNewLkpEmail, setSuperNewLkpEmail] = useState('');
  const [superNewLkpPass, setSuperNewLkpPass] = useState('');
  const [superNewLkpConfirm, setSuperNewLkpConfirm] = useState('');
  const [superNewLkpDuration, setSuperNewLkpDuration] = useState('2026-12-31');

  // Student routing helpers
  const [navigationStudentId, setNavigationStudentId] = useState('');

  // Modals for landing page
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  
  // Carousel/Slider states for registered institutions
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [carouselVisibleCards, setCarouselVisibleCards] = useState(2);
  const [carouselIsHovering, setCarouselIsHovering] = useState(false);
  const [disableTransition, setDisableTransition] = useState(false);
  
  // Search state for filtering registered institutions
  const [searchQuery, setSearchQuery] = useState('');
  
  // Search state for superadmin dashboard
  const [superadminSearchQuery, setSuperadminSearchQuery] = useState('');
  const [superadminStatusFilter, setSuperadminStatusFilter] = useState<'all' | 'active' | 'expired'>('all');

  // Forgot Password feature states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotVerificationAnswer, setForgotVerificationAnswer] = useState(''); // NPSN or LKP Name
  const [forgotStep, setForgotStep] = useState<1 | 2>(1); // 1: Verify Account, 2: Reset/View Pass
  const [forgotMatchedLkp, setForgotMatchedLkp] = useState<Institution | null>(null);
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotNewPassConfirm, setForgotNewPassConfirm] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  // States for Editing Own Profile & Password
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileOldPassword, setProfileOldPassword] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileConfirmPassword, setProfileConfirmPassword] = useState('');
  const [profileShowOldPass, setProfileShowOldPass] = useState(false);
  const [profileShowNewPass, setProfileShowNewPass] = useState(false);
  const [profileShowConfirmPass, setProfileShowConfirmPass] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Synchronize profile form states when modal opens
  useEffect(() => {
    if (showProfileModal && currentUser) {
      const activeLkp = institutions.find(inst => inst.id === currentUser?.id);
      if (currentUser.role === 'superadmin') {
        setProfileName('Superadmin');
        setProfileEmail(currentUser.staffUsername || 'superadmin');
      } else if (currentUser.subRole === 'pimpinan' && activeLkp) {
        setProfileName(activeLkp.name);
        setProfileEmail(activeLkp.email);
      } else if (activeLkp) {
        const staff = activeLkp.staffCredentials?.find(
          s => s.role === currentUser.subRole && s.username.toLowerCase() === currentUser.staffUsername?.toLowerCase()
        );
        if (staff) {
          setProfileName(staff.name);
          setProfileEmail(staff.username);
        } else {
          setProfileName(currentUser.staffName || '');
          setProfileEmail(currentUser.staffUsername || '');
        }
      }
      setProfileOldPassword('');
      setProfilePassword('');
      setProfileConfirmPassword('');
      setProfileShowOldPass(false);
      setProfileShowNewPass(false);
      setProfileShowConfirmPass(false);
      setProfileError('');
      setProfileSuccess('');
    }
  }, [showProfileModal, currentUser, institutions]);

  const handleSaveProfileChanges = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    // Validate double entry for new password
    if (profilePassword || profileConfirmPassword) {
      if (!profilePassword || !profileConfirmPassword) {
        setProfileError('⚠️ Kedua kolom kata sandi baru wajib diisi (Kata Sandi Baru & Konfirmasi Kata Sandi Baru)!');
        return;
      }
    }

    // Verify old password if profilePassword is being changed
    if (profilePassword) {
      if (!profileOldPassword) {
        setProfileError('⚠️ Silakan masukkan kata sandi lama Anda terlebih dahulu!');
        return;
      }

      if (currentUser?.role === 'superadmin') {
        if (profileOldPassword !== 'superadmin123') {
          setProfileError('⚠️ Kata sandi lama Superadmin salah!');
          return;
        }
      } else {
        const activeLkp = institutions.find(inst => inst.id === currentUser?.id);
        if (!activeLkp) {
          setProfileError('⚠️ Gagal menemukan data lembaga!');
          return;
        }

        if (currentUser?.subRole === 'pimpinan') {
          if (profileOldPassword !== activeLkp.password) {
            setProfileError('⚠️ Kata sandi lama Pimpinan salah!');
            return;
          }
        } else {
          const staffList = activeLkp.staffCredentials || [];
          const targetStaff = staffList.find(
            s => s.role === currentUser?.subRole && s.username.toLowerCase() === currentUser?.staffUsername?.toLowerCase()
          );
          if (!targetStaff || profileOldPassword !== targetStaff.password) {
            setProfileError('⚠️ Kata sandi lama Staff salah!');
            return;
          }
        }
      }
    }

    if (profilePassword && profilePassword.length < 6) {
      setProfileError('⚠️ Kata sandi baru minimal harus 6 karakter!');
      return;
    }

    if (profilePassword !== profileConfirmPassword) {
      setProfileError('⚠️ Konfirmasi kata sandi baru tidak cocok!');
      return;
    }

    if (currentUser?.role === 'superadmin') {
      setProfileSuccess('🎉 Profil Superadmin berhasil diperbarui!');
      setCurrentUser({
        ...currentUser,
        staffName: profileName || 'Superadmin',
        staffUsername: profileEmail || 'superadmin'
      });
      localStorage.setItem('user_session', JSON.stringify({
        ...currentUser,
        staffName: profileName || 'Superadmin',
        staffUsername: profileEmail || 'superadmin'
      }));
      return;
    }

    const activeLkp = institutions.find(inst => inst.id === currentUser?.id);
    if (!activeLkp) {
      setProfileError('⚠️ Gagal menemukan data lembaga!');
      return;
    }

    if (currentUser?.subRole === 'pimpinan') {
      const emailLower = profileEmail.toLowerCase();
      const isEmailTaken = institutions.some(
        inst => inst.id !== activeLkp.id && inst.email.toLowerCase() === emailLower
      );
      if (isEmailTaken || emailLower === 'superadmin') {
        setProfileError('⚠️ Email sudah digunakan oleh lembaga lain atau dilindungi!');
        return;
      }

      const updatedLkp: Institution = {
        ...activeLkp,
        name: profileName,
        email: emailLower,
      };
      if (profilePassword) {
        updatedLkp.password = profilePassword;
      }

      updateCurrentLkp(updatedLkp);
      
      setCurrentUser({
        ...currentUser,
        staffName: profileName,
        staffUsername: emailLower
      });

      setProfileSuccess('🎉 Profil & Password Lembaga berhasil diperbarui!');
      setProfilePassword('');
      setProfileConfirmPassword('');
    } else {
      const staffList = activeLkp.staffCredentials || [];
      const staffMemberIndex = staffList.findIndex(
        s => s.role === currentUser?.subRole && s.username.toLowerCase() === currentUser?.staffUsername?.toLowerCase()
      );

      if (staffMemberIndex === -1) {
        setProfileError('⚠️ Akun staff tidak ditemukan!');
        return;
      }

      const userLower = profileEmail.toLowerCase();
      const isUsernameTakenByLkp = institutions.some(
        inst => inst.email.toLowerCase() === userLower
      );
      let isUsernameTakenByStaff = false;
      for (const inst of institutions) {
        if (inst.staffCredentials) {
          const found = inst.staffCredentials.find(
            s => s.username.toLowerCase() === userLower && (inst.id !== activeLkp.id || s.role !== currentUser?.subRole)
          );
          if (found) {
            isUsernameTakenByStaff = true;
            break;
          }
        }
      }

      if (isUsernameTakenByLkp || isUsernameTakenByStaff || userLower === 'superadmin') {
        setProfileError('⚠️ Nama pengguna / email sudah digunakan!');
        return;
      }

      const updatedStaffList = [...staffList];
      const targetStaff = updatedStaffList[staffMemberIndex];
      updatedStaffList[staffMemberIndex] = {
        ...targetStaff,
        name: profileName,
        username: userLower,
      };
      if (profilePassword) {
        updatedStaffList[staffMemberIndex].password = profilePassword;
      }

      updateCurrentLkp({
        ...activeLkp,
        staffCredentials: updatedStaffList
      });

      setCurrentUser({
        ...currentUser,
        staffName: profileName,
        staffUsername: userLower
      });

      setProfileSuccess('🎉 Profil & Password Staff berhasil diperbarui!');
      setProfilePassword('');
      setProfileConfirmPassword('');
    }
  };

  // Global custom alert modal states (to work around iframe alert blocks)
  const [globalAlert, setGlobalAlert] = useState<{ message: string; type: 'info' | 'success' | 'warning' } | null>(null);

  const isModuleLocked = (sidebar: string, module: string): boolean => {
    if (!currentUser || currentUser.role !== 'lembaga') return false;
    const subRole = currentUser.subRole || 'pimpinan';
    
    if (subRole === 'pimpinan') return false;
    
    // Dashboard ringkasan hanya bisa diakses pimpinan lembaga kursus saja
    if (sidebar === 'dashboard') return true;
    
    if (subRole === 'staf_admin') {
      if (sidebar === 'administrasi' && ['rab', 'jurnal', 'voucher'].includes(module)) {
        return true;
      }
    }
    
    if (subRole === 'pengajar') {
      if (sidebar === 'registrasi') return true;
      if (sidebar === 'administrasi') {
        if (!['absensi', 'kalender', 'jadwal'].includes(module)) {
          return true;
        }
      }
    }

    if (subRole === 'bendahara') {
      if (['registrasi', 'asisten_ai', 'raport'].includes(sidebar)) return true;
      if (sidebar === 'administrasi') {
        if (!['rab', 'jurnal', 'voucher', 'program'].includes(module)) {
          return true;
        }
      }
    }
    
    return false;
  };

  const renderLockedScreen = (sidebar: string, module: string) => {
    const subRole = currentUser?.subRole || 'pimpinan';
    let allowedRoleLabel = 'Pimpinan Lembaga Kursus';
    let lockedModuleName = '';

    if (sidebar === 'dashboard') lockedModuleName = 'Dashboard Ringkasan';
    else if (sidebar === 'registrasi') lockedModuleName = 'Pendaftaran Siswa Baru';
    else if (sidebar === 'raport') lockedModuleName = 'Cetak Raport Siswa';
    else if (sidebar === 'asisten_ai') lockedModuleName = 'Asisten AI RPP';
    else {
      switch (module) {
        case 'profil': lockedModuleName = 'Profil & Visi Misi'; allowedRoleLabel = 'Pimpinan & Staf Admin'; break;
        case 'struktur': lockedModuleName = 'Struktur Organisasi'; allowedRoleLabel = 'Pimpinan & Staf Admin'; break;
        case 'sarpras': lockedModuleName = 'Sarana Prasarana'; allowedRoleLabel = 'Pimpinan & Staf Admin'; break;
        case 'program': lockedModuleName = 'Program & Harga'; allowedRoleLabel = 'Pimpinan, Staf Admin & Bendahara'; break;
        case 'kalender': lockedModuleName = 'Kalender Akademik'; allowedRoleLabel = 'Pimpinan & Staf Admin'; break;
        case 'jadwal': lockedModuleName = 'Jadwal & Pengajar'; allowedRoleLabel = 'Pimpinan & Staf Admin'; break;
        case 'absensi': lockedModuleName = 'Absensi Siswa'; allowedRoleLabel = 'Pimpinan, Staf Admin & Pengajar'; break;
        case 'rab': lockedModuleName = 'Anggaran & RAB Keuangan'; allowedRoleLabel = 'Pimpinan & Bendahara Lembaga Kursus'; break;
        case 'jurnal': lockedModuleName = 'Jurnal Keuangan Buku Kas'; allowedRoleLabel = 'Pimpinan & Bendahara Lembaga Kursus'; break;
        case 'voucher': lockedModuleName = 'Voucher Program & Promosi'; allowedRoleLabel = 'Pimpinan & Bendahara Lembaga Kursus'; break;
        case 'snp': lockedModuleName = 'Pemenuhan 8 SNP'; allowedRoleLabel = 'Pimpinan & Staf Admin'; break;
        case 'backup': lockedModuleName = 'Backup & Restore'; allowedRoleLabel = 'Pimpinan Lembaga Kursus'; break;
        case 'kredensial': lockedModuleName = 'Kredensial Akses'; allowedRoleLabel = 'Pimpinan Lembaga Kursus'; break;
      }
    }

    let subRoleLabel = 'Staf Administrasi';
    if (subRole === 'pengajar') subRoleLabel = 'Pengajar / Instruktur';
    if (subRole === 'bendahara') subRoleLabel = 'Bendahara Lembaga Kursus';

    return (
      <div className="bg-white p-12 text-center border border-neutral-150 rounded-3xl space-y-5 shadow-3xs animate-fade-in max-w-2xl mx-auto my-8">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto border border-red-100 text-red-600">
          <Lock className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <span className="bg-red-50 text-red-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-red-100 uppercase tracking-wider">
            Akses Ditolak (Restricted)
          </span>
          <h3 className="font-extrabold text-xl text-neutral-800">Modul "{lockedModuleName}" Terkunci</h3>
          <p className="text-xs text-neutral-500 leading-relaxed max-w-md mx-auto">
            Peran Anda saat ini sebagai <strong className="text-neutral-800 font-bold">{subRoleLabel}</strong> tidak memiliki izin untuk membuka modul ini. Hal ini bertujuan menjaga integritas data dan membatasi pengelolaan di luar wewenang kerja Anda.
          </p>
        </div>
        <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 text-left space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-neutral-450 font-bold">Wewenang Otoritas:</span>
            <span className="font-bold text-neutral-800">{allowedRoleLabel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-450 font-bold">Metode Keamanan:</span>
            <span className="font-mono text-neutral-600">Role-Based Access Control (RBAC)</span>
          </div>
        </div>
        <div className="pt-2">
          <button 
            onClick={() => {
              if (subRole === 'pengajar') {
                setActiveSidebar('asisten_ai');
                setActiveAITab('rpp');
              } else if (subRole === 'bendahara') {
                setActiveSidebar('administrasi');
                setActiveModule('rab');
              } else {
                setActiveSidebar('dashboard');
              }
            }}
            className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-3xs transition-all cursor-pointer"
          >
            Kembali ke Menu Otoritas Anda
          </button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    window.alert = (msg: string) => {
      let type: 'info' | 'success' | 'warning' = 'info';
      const cleanMsg = msg.toLowerCase();
      if (
        msg.includes('⚠️') || 
        msg.includes('maaf') || 
        msg.includes('Maaf') || 
        msg.includes('Gagal') || 
        msg.includes('gagal') || 
        msg.includes('melebihi') || 
        msg.includes('error') || 
        msg.includes('Salah') || 
        msg.includes('salah') ||
        cleanMsg.includes('tidak boleh kosong') ||
        cleanMsg.includes('wajib diisi') ||
        cleanMsg.includes('harus lebih besar') ||
        cleanMsg.includes('lengkapi data') ||
        cleanMsg.includes('terlalu besar')
      ) {
        type = 'warning';
      } else if (
        msg.includes('🎉') || 
        msg.includes('✅') || 
        msg.includes('berhasil') || 
        msg.includes('Berhasil') || 
        msg.includes('Selamat') || 
        msg.includes('selamat')
      ) {
        type = 'success';
      }
      setGlobalAlert({ message: msg, type });
    };
  }, []);

  // Save institutions to Firestore and localStorage on any state modification
  useEffect(() => {
    if (loading) return; // Prevent overwriting during load

    // LocalStorage fallback
    localStorage.setItem('lkp_institutions', JSON.stringify(institutions));

    const prev = prevInstitutionsRef.current;

    // 1. Find deleted institutions
    const deleted = prev.filter(p => !institutions.some(curr => curr.id === p.id));
    deleted.forEach(async (inst) => {
      try {
        await deleteDoc(doc(db, "institutions", inst.id));
        console.log(`Deleted ${inst.name} from Firestore`);
      } catch (e) {
        console.error("Gagal menghapus dari Firestore:", e);
      }
    });

    // 2. Find added or updated institutions
    const addedOrUpdated = institutions.filter(curr => {
      const p = prev.find(item => item.id === curr.id);
      if (!p) return true; // Newly added
      return JSON.stringify(p) !== JSON.stringify(curr);
    });

    addedOrUpdated.forEach(async (inst) => {
      try {
        await setDoc(doc(db, "institutions", inst.id), sanitizeForFirestore(inst));
        console.log(`Saved/Updated ${inst.name} to Firestore`);
      } catch (e) {
        console.error("Gagal menyimpan ke Firestore:", e);
      }
    });

    // Sync ref
    prevInstitutionsRef.current = institutions;
  }, [institutions, loading]);

  // Persist login session
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('user_session', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('user_session');
    }
  }, [currentUser]);

  // Auto-route on mount or currentUser change if activeSidebar is locked
  useEffect(() => {
    if (currentUser && currentUser.role === 'lembaga') {
      const subRole = currentUser.subRole || 'pimpinan';
      if (subRole !== 'pimpinan' && activeSidebar === 'dashboard') {
        if (subRole === 'pengajar') {
          setActiveSidebar('asisten_ai');
          setActiveAITab('rpp');
        } else if (subRole === 'bendahara') {
          setActiveSidebar('administrasi');
          setActiveModule('rab');
        } else if (subRole === 'staf_admin') {
          setActiveSidebar('registrasi');
        }
      }
    }
  }, [currentUser, activeSidebar]);

  // Handle Login Action
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const inputUser = loginEmail.trim().toLowerCase();

    if (inputUser === 'superadmin') {
      if (loginPassword === 'superadmin123') {
        setCurrentUser({ role: 'superadmin' });
        setLoginEmail('');
        setLoginPassword('');
        setShowLoginModal(false);
      } else {
        setLoginError('⚠️ Sandi Superadmin salah!');
      }
    } else {
      // Find institutional match
      const matchingLkp = institutions.find(
        inst => inst.email.toLowerCase() === inputUser && inst.password === loginPassword
      );

      // Find staff match in any institution
      let matchedStaffLkp: Institution | undefined = undefined;
      let matchedStaffMember: any = undefined;

      for (const inst of institutions) {
        if (inst.staffCredentials) {
          const staff = inst.staffCredentials.find(
            s => s.username.toLowerCase() === inputUser && s.password === loginPassword
          );
          if (staff) {
            matchedStaffLkp = inst;
            matchedStaffMember = staff;
            break;
          }
        }
      }

      if (matchingLkp) {
        setCurrentUser({ 
          role: 'lembaga', 
          id: matchingLkp.id, 
          subRole: 'pimpinan',
          staffName: 'Pimpinan Lembaga Kursus',
          staffUsername: matchingLkp.email
        });
        setLoginEmail('');
        setLoginPassword('');
        setActiveSidebar('dashboard');
        setShowLoginModal(false);
      } else if (matchedStaffLkp && matchedStaffMember) {
        if (!matchedStaffMember.active) {
          setLoginError('⚠️ Akses ditangguhkan! Akun staff ini sedang dinonaktifkan oleh Pimpinan Lembaga Kursus.');
          return;
        }
        setCurrentUser({ 
          role: 'lembaga', 
          id: matchedStaffLkp.id, 
          subRole: matchedStaffMember.role,
          selectedTeacherId: matchedStaffMember.id.startsWith('staff-teacher-') 
            ? matchedStaffMember.id.replace('staff-teacher-', '') 
            : undefined,
          staffName: matchedStaffMember.name,
          staffUsername: matchedStaffMember.username
        });
        setLoginEmail('');
        setLoginPassword('');
        
        // Route staff directly to their active working zones
        if (matchedStaffMember.role === 'pengajar') {
          setActiveSidebar('asisten_ai');
          setActiveAITab('rpp');
        } else if (matchedStaffMember.role === 'bendahara') {
          setActiveSidebar('administrasi');
          setActiveModule('rab');
        } else {
          setActiveSidebar('registrasi');
        }
        
        setShowLoginModal(false);
      } else {
        setLoginError('⚠️ Email, Username staff, atau Sandi salah! Hubungi Pimpinan Lembaga Kursus jika lupa kredensial Anda.');
      }
    }
  };

  // Handle New Course Registration (Public Tenant Signup)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regName || !regEmail || !regPassword) {
      setRegError('⚠️ Semua kolom pendaftaran wajib diisi!');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('⚠️ Kata sandi minimal harus terdiri dari 6 karakter!');
      return;
    }

    if (regPassword !== regConfirm) {
      setRegError('⚠️ Konfirmasi sandi tidak cocok!');
      return;
    }

    // Check email availability
    const isEmailTaken = institutions.some(
      inst => inst.email.toLowerCase() === regEmail.toLowerCase()
    );
    if (isEmailTaken || regEmail.toLowerCase() === 'superadmin') {
      setRegError('⚠️ Alamat email ini sudah terdaftar di sistem!');
      return;
    }

    // Provision new institution
    const defaultExpiry = new Date();
    defaultExpiry.setMonth(defaultExpiry.getMonth() + 6); // free 6 months
    const expiryStr = defaultExpiry.toISOString().split('T')[0];

    let aiProfile = {
      vision: 'Menjadi Lembaga Kursus yang unggul dan bermartabat.',
      mission: 'Mengembangkan kompetensi terbaik.',
      programs: [] as any[],
      facilities: [] as any[],
      teachers: [] as any[]
    };

    if (regEnableAI) {
      setRegIsGenerating(true);
      setRegGenStatus('✨ Asisten AI sedang merancang kurikulum dan profil LKP Anda...');
      try {
        const skillSelected = regSkillField === 'Lainnya' ? regSkillCustom : regSkillField;
        const response = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task: 'lkp_generate',
            name: regName,
            context: skillSelected || 'Umum'
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.result) {
            const parsed = JSON.parse(data.result);
            if (parsed.vision) aiProfile.vision = parsed.vision;
            if (parsed.mission) aiProfile.mission = parsed.mission;
            if (Array.isArray(parsed.programs)) aiProfile.programs = parsed.programs;
            if (Array.isArray(parsed.facilities)) aiProfile.facilities = parsed.facilities;
            if (Array.isArray(parsed.teachers)) aiProfile.teachers = parsed.teachers;
          }
        }
      } catch (err) {
        console.error('Error generating AI profile:', err);
      } finally {
        setRegIsGenerating(false);
      }
    }

    const mappedPrograms: Program[] = aiProfile.programs.map((p: any, idx: number) => ({
      id: 'pr_' + Date.now() + '_' + idx,
      name: p.name || 'Program Kursus',
      price: 1500000,
      regFee: 100000,
      tuitionFee: 1200000,
      monthlyFee: 200000,
      duration: p.duration || '3 Bulan (120 Jam)',
      description: p.description || 'Program keterampilan komprehensif.',
      status: 'Aktif'
    }));

    if (mappedPrograms.length === 0) {
      const skillSelected = regSkillField === 'Lainnya' ? regSkillCustom : regSkillField;
      mappedPrograms.push({
        id: 'pr_' + Date.now(),
        name: `Kursus ${skillSelected || 'Keahlian'} Dasar`,
        price: 1500000,
        regFee: 100000,
        tuitionFee: 1200000,
        monthlyFee: 200000,
        duration: '3 Bulan (120 Jam)',
        description: 'Materi dasar penunjang kemandirian vokasi.',
        status: 'Aktif'
      });
    }

    const mappedFacilities: Facility[] = aiProfile.facilities.map((f: any, idx: number) => ({
      id: 'fa_' + Date.now() + '_' + idx,
      name: f.name || 'Sarana Praktikum',
      quantity: f.count || 5,
      condition: 'Baik',
      location: 'Ruang Lab / Praktikum Utama'
    }));

    const mappedTeachers: Teacher[] = aiProfile.teachers.map((t: any, idx: number) => ({
      id: 'tc_' + Date.now() + '_' + idx,
      name: t.name || 'Instruktur AI',
      specialty: regSkillField === 'Lainnya' ? regSkillCustom : regSkillField
    }));

    const staffCreds = aiProfile.teachers.map((t: any, idx: number) => {
      const username = (t.name || 'instruktur').toLowerCase().replace(/[^a-z0-9]/g, '');
      return {
        id: 'staff_' + Date.now() + '_' + idx,
        name: t.name || 'Instruktur AI',
        username: username,
        role: 'pengajar' as const,
        active: true,
        password: 'sandi' + username.substring(0, 4)
      };
    });

    const newLkp: Institution = {
      id: 'lkp_' + Date.now(),
      name: regName,
      email: regEmail,
      password: regPassword,
      activeUntil: expiryStr,
      profile: {
        address: 'Jl. Pemuda No. 45, Sleman, Yogyakarta',
        phone: '0812-3456-7890',
        email: regEmail,
        vision: aiProfile.vision,
        mission: aiProfile.mission,
        specialty: regSkillField === 'Lainnya' ? regSkillCustom : regSkillField
      },
      structure: [
        { id: 'st_' + Date.now() + '_1', name: 'Pimpinan Lembaga Kursus', role: 'Direktur', parentId: null },
        ...staffCreds.map((s, idx) => ({
          id: 'st_' + Date.now() + '_teacher_' + idx,
          name: s.name,
          role: 'Instruktur Utama',
          parentId: 'st_' + Date.now() + '_1'
        }))
      ],
      programs: mappedPrograms,
      calendar: [
        { id: 'cal_' + Date.now() + '_1', title: 'Orientasi Siswa Baru', date: new Date().toISOString().split('T')[0], type: 'Kegiatan' },
        { id: 'cal_' + Date.now() + '_2', title: 'Ujian Tengah Semester', date: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0], type: 'Ujian' }
      ],
      teachers: mappedTeachers,
      schedule: [],
      attendance: [],
      facilities: mappedFacilities,
      budget: [],
      journal: [],
      vouchers: [],
      snpStandards: INITIAL_SNP_STANDARDS(),
      students: [],
      raportCards: [],
      staffCredentials: [
        {
          id: 'staff_pimp_' + Date.now(),
          name: 'Pimpinan ' + regName,
          username: 'pimpinan',
          role: 'staf_admin',
          active: true,
          password: 'pimpinan123'
        },
        ...staffCreds
      ]
    };

    setInstitutions([...institutions, newLkp]);
    
    let successMsg = `🎉 Kursus "${regName}" berhasil terdaftar!`;
    if (regEnableAI && mappedPrograms.length > 0) {
      successMsg += `\n\n✨ Asisten AI juga telah menggenerasi 3 program studi (${mappedPrograms.map(p => p.name).join(', ')}), ${mappedFacilities.length} sarana prasarana utama, dan 2 instruktur pengajar fiktif berserta kredensial login mereka secara cerdas!`;
    }
    successMsg += `\n\nSilakan login sekarang menggunakan email LKP Anda atau username staf Anda (misal: "pimpinan" dengan sandi "pimpinan123").`;
    
    setRegSuccess(successMsg);
    
    // Clear forms
    setRegName('');
    setRegEmail('');
    setRegPassword('');
    setRegConfirm('');
    setRegSkillCustom('');
  };

  // Handle Forgot Password - Step 1: Verify Email
  const handleForgotVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    const email = forgotEmail.trim().toLowerCase();
    if (!email) {
      setForgotError('⚠️ Masukkan alamat email lembaga terlebih dahulu!');
      return;
    }

    if (email === 'superadmin') {
      setForgotMatchedLkp({
        id: 'superadmin',
        name: 'Superadmin Pengawas',
        email: 'superadmin',
        password: 'superadmin123',
        activeUntil: '2099-12-31',
        profile: { npsn: '12345678', address: '', phone: '', email: '', vision: '', mission: '' },
        structure: [],
        programs: [],
        calendar: [],
        teachers: [],
        schedule: [],
        attendance: [],
        facilities: [],
        budget: [],
        journal: [],
        vouchers: [],
        snpStandards: [],
        students: [],
        raportCards: []
      });
      setForgotStep(2);
      return;
    }

    const matched = institutions.find(inst => inst.email.toLowerCase() === email);
    if (!matched) {
      setForgotError('⚠️ Alamat email lembaga tidak terdaftar di sistem SaaS Lembaga Kursus ini! Silakan hubungi pengawas atau daftar baru.');
      return;
    }

    setForgotMatchedLkp(matched);
    setForgotStep(2);
  };

  // Handle Forgot Password - Step 2: Verification Challenge & Password Recovery
  const handleForgotResetConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotMatchedLkp) return;

    // Challenge check using registered Phone, NPSN, or Name
    const chalAnswer = forgotVerificationAnswer.trim().replace(/[-\s()]/g, '');
    const checkAnswerRaw = forgotVerificationAnswer.trim().toLowerCase();
    const officialPhone = (forgotMatchedLkp.profile?.phone || '').replace(/[-\s()]/g, '');
    const officialNpsn = (forgotMatchedLkp.profile?.npsn || '').toLowerCase().trim();
    const officialName = (forgotMatchedLkp.name || '').toLowerCase().trim();

    const matchesPhone = officialPhone && (chalAnswer === officialPhone || checkAnswerRaw === officialPhone);
    const matchesNpsn = officialNpsn && checkAnswerRaw === officialNpsn;
    const matchesName = checkAnswerRaw === officialName;

    if (!matchesPhone && !matchesNpsn && !matchesName) {
      setForgotError('⚠️ Verifikasi Gagal! Nomor Telepon, NPSN, atau Nama Lembaga yang Anda masukkan tidak cocok.');
      return;
    }

    // If they want to write a new password
    if (forgotNewPass) {
      if (forgotNewPass.length < 6) {
        setForgotError('⚠️ Kata sandi baru minimal harus terdiri dari 6 karakter!');
        return;
      }
      if (forgotNewPass !== forgotNewPassConfirm) {
        setForgotError('⚠️ Konfirmasi kata sandi baru tidak sesuai!');
        return;
      }

      if (forgotMatchedLkp.id === 'superadmin') {
        alert('ℹ️ Akun Pengawas (superadmin) dilindungi dan tidak dapat diganti kata sandinya di sandbox ini. Kata sandi tetap: superadmin123');
        setShowForgotModal(false);
        return;
      }

      const updated = institutions.map(inst => {
        if (inst.id === forgotMatchedLkp.id) {
          return { ...inst, password: forgotNewPass };
        }
        return inst;
      });

      setInstitutions(updated);
      alert(`🎉 Kata sandi untuk Lembaga Kursus "${forgotMatchedLkp.name}" berhasil disetel ulang! Silakan masuk menggunakan kata sandi baru Anda.`);
      setShowForgotModal(false);
    } else {
      // Just expose current password and state it clearly
      setForgotSuccess(`Sandi Anda ditemukan! Kata sandi saat ini: "${forgotMatchedLkp.password}"`);
      alert(`🔑 Verifikasi Berhasil!\n\nKata sandi Lembaga Kursus "${forgotMatchedLkp.name}" saat ini adalah:\n👉 "${forgotMatchedLkp.password}" 👈\n\nAnda dapat menggunakannya sekarang atau mengisi formulir di bawah ini untuk menyetel ulang ke kata sandi baru.`);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // ----------------------------------------------------
  // Superadmin Actions
  // ----------------------------------------------------
  const handleSuperAddLkp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!superNewLkpName || !superNewLkpEmail || !superNewLkpPass) {
      alert('Semua data Lembaga Kursus baru wajib diisi!');
      return;
    }

    if (superNewLkpPass.length < 6) {
      alert('Sandi minimal 6 karakter!');
      return;
    }

    if (superNewLkpPass !== superNewLkpConfirm) {
      alert('Konfirmasi sandi tidak sesuai!');
      return;
    }

    const newLkp: Institution = {
      id: 'lkp_' + Date.now(),
      name: superNewLkpName,
      email: superNewLkpEmail,
      password: superNewLkpPass,
      activeUntil: superNewLkpDuration,
      profile: {
        address: 'Alamat Baru',
        phone: '08123',
        email: superNewLkpEmail,
        vision: 'Mewujudkan profesionalisme unggul.',
        mission: '1. Memberikan pengajaran teori dan praktek seimbang.'
      },
      structure: [
        { id: 'st_' + Date.now(), name: 'Pimpinan Baru', role: 'Direktur', parentId: null }
      ],
      programs: [],
      calendar: [],
      teachers: [],
      schedule: [],
      attendance: [],
      facilities: [],
      budget: [],
      journal: [],
      vouchers: [],
      snpStandards: INITIAL_SNP_STANDARDS(),
      students: [],
      raportCards: []
    };

    setInstitutions([...institutions, newLkp]);
    alert(`Berhasil menambahkan Lembaga Kursus "${superNewLkpName}" ke sistem!`);
    
    // Reset inputs
    setSuperNewLkpName('');
    setSuperNewLkpEmail('');
    setSuperNewLkpPass('');
    setSuperNewLkpConfirm('');
  };

  const deleteInstitution = (id: string, name: string) => {
    if (confirm(`Yakin ingin MENGHAPUS Lembaga Kursus "${name}" secara permanen? Tindakan ini tidak dapat dikembalikan!`)) {
      setInstitutions(institutions.filter(inst => inst.id !== id));
    }
  };

  const adjustActiveUntilDate = (id: string, newDate: string) => {
    setInstitutions(institutions.map(inst => {
      if (inst.id === id) {
        return {
          ...inst,
          activeUntil: newDate
        };
      }
      return inst;
    }));
  };

  // ----------------------------------------------------
  // Individual Institution (Tenant) Actions & Calculations
  // ----------------------------------------------------
  const currentLkp = institutions.find(inst => inst.id === currentUser?.id);

  const updateCurrentLkp = (updatedLkp: Institution) => {
    setInstitutions(institutions.map(inst => inst.id === updatedLkp.id ? updatedLkp : inst));
  };

  const handlePublicRegisterStudent = (lembagaId: string, newStudent: Student) => {
    setInstitutions(prev => prev.map(inst => {
      if (inst.id === lembagaId) {
        return {
          ...inst,
          students: [...inst.students, newStudent]
        };
      }
      return inst;
    }));
  };

  const handleAddNewStudent = (newStudent: Student) => {
    if (!currentLkp) return;
    updateCurrentLkp({
      ...currentLkp,
      students: [...currentLkp.students, newStudent]
    });
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    if (!currentLkp) return;
    updateCurrentLkp({
      ...currentLkp,
      students: currentLkp.students.map(s => s.id === updatedStudent.id ? updatedStudent : s)
    });
  };

  const handleAddRaportCard = (newRaport: RaportCard) => {
    if (!currentLkp) return;
    // Remove if duplicate existing
    const filtered = currentLkp.raportCards.filter(
      r => !(r.studentId === newRaport.studentId && r.period === newRaport.period)
    );
    updateCurrentLkp({
      ...currentLkp,
      raportCards: [...filtered, newRaport]
    });
  };

  const handleRemoveRaportCard = (id: string) => {
    if (!currentLkp) return;
    const reportItem = currentLkp.raportCards.find(r => r.id === id);
    const studentName = currentLkp.students ? (currentLkp.students.find(s => s.id === reportItem?.studentId)?.name || 'Siswa') : 'Siswa';
    if (confirm(`Yakin ingin menghapus Lembar Raport milik "${studentName}" (${reportItem?.period || 'Periode'})? Tindakan ini tidak dapat dibatalkan.`)) {
      updateCurrentLkp({
        ...currentLkp,
        raportCards: currentLkp.raportCards.filter(r => r.id !== id)
      });
    }
  };

  // Expiration checking logic
  const isLembagaExpired = (inst: Institution) => {
    const today = new Date();
    const expiry = new Date(inst.activeUntil);
    return today > expiry;
  };

  const getDaysRemaining = (dateStr: string) => {
    const today = new Date();
    const expiry = new Date(dateStr);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDaysRemainingStr = (dateStr: string) => {
    const today = new Date();
    const expiry = new Date(dateStr);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Habis Masa Aktif';
    return `${diffDays} Hari Terhitung`;
  };

  const getActiveStaffName = () => {
    if (!currentUser) return '';
    if (currentUser.role === 'superadmin') return 'Pengawas Lembaga Kursus';
    if (currentUser.staffName) return currentUser.staffName;
    if (currentUser.subRole === 'pimpinan') return 'Pimpinan Lembaga Kursus';
    // Fallback lookup from currentLkp
    if (currentLkp && currentLkp.staffCredentials) {
      const staff = currentLkp.staffCredentials.find(s => s.role === currentUser.subRole);
      if (staff) return staff.name;
    }
    return 'Staf Lembaga Kursus';
  };

  const filteredInstitutions = institutions.filter(inst => {
    const query = searchQuery.toLowerCase();
    return inst.name.toLowerCase().includes(query) || 
           inst.profile.address.toLowerCase().includes(query) ||
           inst.programs.some(p => p.name.toLowerCase().includes(query));
  });

  // Carousel resize & auto-scroll effect
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCarouselVisibleCards(1);
      } else if (window.innerWidth < 1024) {
        setCarouselVisibleCards(2);
      } else {
        setCarouselVisibleCards(3);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setCarouselIndex(0);
  }, [searchQuery, filteredInstitutions.length]);

  const getCategoryMeta = (specialty: string | undefined) => {
    const clean = (specialty || 'Lainnya').toLowerCase();
    if (clean.includes('busana') || clean.includes('fashion') || clean.includes('jahit')) {
      return {
        label: specialty || 'Tata Busana',
        icon: '🧵',
        bgClass: 'bg-rose-50 text-rose-800 border-rose-150',
      };
    }
    if (clean.includes('otomotif') || clean.includes('mekanik') || clean.includes('motor')) {
      return {
        label: specialty || 'Teknik Otomotif',
        icon: '🔧',
        bgClass: 'bg-amber-50 text-amber-800 border-amber-150',
      };
    }
    if (clean.includes('rias') || clean.includes('kecantikan') || clean.includes('mua')) {
      return {
        label: specialty || 'Tata Rias',
        icon: '💄',
        bgClass: 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-150',
      };
    }
    if (clean.includes('teknologi') || clean.includes('komputer') || clean.includes('it') || clean.includes('informasi') || clean.includes('pemrograman')) {
      return {
        label: specialty || 'Teknologi Informasi',
        icon: '💻',
        bgClass: 'bg-blue-50 text-blue-800 border-blue-150',
      };
    }
    if (clean.includes('kuliner') || clean.includes('boga') || clean.includes('masak')) {
      return {
        label: specialty || 'Seni Kuliner',
        icon: '🍳',
        bgClass: 'bg-orange-50 text-orange-800 border-orange-150',
      };
    }
    if (clean.includes('bahasa') || clean.includes('english') || clean.includes('asing') || clean.includes('komunikasi')) {
      return {
        label: specialty || 'Bahasa Asing',
        icon: '🗣️',
        bgClass: 'bg-indigo-50 text-indigo-800 border-indigo-150',
      };
    }
    return {
      label: specialty || 'Lainnya',
      icon: '🎓',
      bgClass: 'bg-neutral-50 text-neutral-800 border-neutral-150',
    };
  };

  // Chunking filteredInstitutions into rows for vertical rolling
  const carouselRows: Institution[][] = [];
  for (let i = 0; i < filteredInstitutions.length; i += carouselVisibleCards) {
    carouselRows.push(filteredInstitutions.slice(i, i + carouselVisibleCards));
  }

  // To achieve an infinite loop, if there is more than 1 row, we append the first row at the end as a clone
  const displayRows = carouselRows.length > 1 
    ? [...carouselRows, carouselRows[0]] 
    : carouselRows;

  useEffect(() => {
    if (carouselRows.length <= 1 || carouselIsHovering) return;
    
    const interval = setInterval(() => {
      setCarouselIndex((prev) => prev + 1);
    }, 8000);
    
    return () => clearInterval(interval);
  }, [carouselRows.length, carouselIsHovering]);

  useEffect(() => {
    if (disableTransition) {
      const raf = requestAnimationFrame(() => {
        setDisableTransition(false);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [disableTransition]);

  const filteredSuperadminInstitutions = institutions.filter(inst => {
    // Status Filter
    const expired = isLembagaExpired(inst);
    if (superadminStatusFilter === 'active' && expired) return false;
    if (superadminStatusFilter === 'expired' && !expired) return false;

    // Search Query Filter
    const query = superadminSearchQuery.toLowerCase().trim();
    if (!query) return true;
    
    const nameMatch = inst.name?.toLowerCase().includes(query) || false;
    const emailMatch = inst.email?.toLowerCase().includes(query) || false;
    const idMatch = inst.id?.toLowerCase().includes(query) || false;
    const npsnMatch = inst.profile?.npsn?.toLowerCase().includes(query) || false;
    const addressMatch = inst.profile?.address?.toLowerCase().includes(query) || false;
    const programMatch = inst.programs?.some(p => p.name?.toLowerCase().includes(query)) || false;
    
    return nameMatch || emailMatch || idMatch || npsnMatch || addressMatch || programMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 select-none animate-fade-in">
        <div className="bg-white p-8 md:p-12 border border-neutral-150 rounded-3xl max-w-md w-full text-center space-y-6 shadow-3xs">
          {/* Glowing Animated Icon */}
          <div className="relative mx-auto w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100">
            <Layers className="w-8 h-8 text-emerald-600 animate-spin animate-pulse" style={{ animationDuration: '3s' }} />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-black font-display text-neutral-900 tracking-tight uppercase">
              Sinkronisasi Cloud Database
            </h3>
            <p className="text-xs text-neutral-500 font-medium">
              Menghubungkan ke Google Firebase Firestore...
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden relative">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full absolute left-0 top-0 w-3/4 animate-pulse" />
          </div>

          <p className="text-[10px] text-neutral-400 font-mono tracking-wider uppercase">
            Sistem Tata Kelola Lembaga Kursus Smart
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-emerald-500 selection:text-white flex flex-col justify-between">
      
      {/* 1. Header (Navbar) - Hidden when entering a specific public institution landing page */}
      {!(selectedPublicLkpId && !currentUser) && (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-100 py-1.5 sm:py-2.5 px-3 sm:px-5 flex flex-col md:flex-row md:items-center justify-between gap-y-2 md:gap-y-0 no-print shadow-xs animate-fade-in">
          {/* Row 1: Logo & Title (left), and interactive back/login controls (right on mobile) */}
          <div className="flex items-center justify-between w-full md:w-auto gap-2 sm:gap-3 min-w-0 mr-0 md:mr-4">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="bg-emerald-600 p-1.5 sm:p-2 rounded-lg text-white flex-shrink-0 shadow-xs">
                <Layers className="w-3.5 h-3.5 sm:w-4 h-4 text-white" />
              </div>
              
              {currentUser ? (
                currentUser.role === 'superadmin' ? (
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <h1 className="font-extrabold text-[11px] sm:text-xs md:text-sm tracking-tight text-neutral-900 font-display truncate">
                      TATA KELOLA LEMBAGA KURSUS SMART
                    </h1>
                    <span className="hidden md:inline-block text-[9px] uppercase font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-bold border border-emerald-100/50">Superadmin</span>
                  </div>
                ) : currentLkp ? (
                  <div className="flex flex-col min-w-0">
                    <h1 className="font-black text-[11px] sm:text-xs md:text-sm tracking-tight text-neutral-900 font-display uppercase truncate max-w-[120px] xs:max-w-[200px] sm:max-w-md">
                      {currentLkp.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[9px] sm:text-[10px] md:text-xs text-neutral-500 font-medium mt-0.5">
                      <span className="flex items-center gap-1 truncate max-w-[100px] xs:max-w-[180px] sm:max-w-none">📍 {currentLkp.profile.address}</span>
                      <span className="text-neutral-300 hidden sm:inline">•</span>
                      <span className="flex items-center gap-1 font-mono hidden sm:inline">📞 {currentLkp.profile.phone}</span>
                    </div>
                  </div>
                ) : null
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <h1 className="font-black text-xs sm:text-sm md:text-base tracking-tight text-neutral-900 font-display uppercase truncate">SMART KURSUS</h1>
                  <span className="hidden sm:inline-block text-[9px] uppercase font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-bold border border-emerald-150">Portal</span>
                </div>
              )}
            </div>

            {/* "Masuk" button ONLY shown here in the first row on mobile when not logged in */}
            {!currentUser && (
              <div className="flex md:hidden items-center gap-1.5 matches-first-row">
                {selectedPublicLkpId && (
                  <button
                    onClick={() => setSelectedPublicLkpId(null)}
                    className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-extrabold text-xs px-2.5 py-1.5 rounded-xl transition-all cursor-pointer border border-neutral-205 shadow-3xs"
                  >
                    <span>←</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setLoginRole('lembaga');
                    setLoginError('');
                    setShowLoginModal(true);
                    setShowRegisterModal(false);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-750 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all shadow-xs active:scale-98 cursor-pointer flex items-center gap-1 focus:outline-none"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Masuk</span>
                </button>
              </div>
            )}
          </div>

          {/* Row 2 on Mobile (spans full width), or Right Side actions on Desktop */}
          <div className="flex items-center gap-1.5 sm:gap-2 w-full md:w-auto justify-end flex-shrink-0 animate-fade-in">
            {currentUser && (
              <div className="flex items-center gap-2 sm:gap-2.5 mr-2 border-r border-neutral-100 pr-3 sm:pr-4 py-0.5 text-left">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 shadow-4xs">
                  {currentUser.role === 'superadmin' ? '🔍' : (
                    currentUser.subRole === 'pimpinan' ? '👑' : 
                    currentUser.subRole === 'bendahara' ? '💰' : 
                    currentUser.subRole === 'pengajar' ? '🎓' : '💼'
                  )}
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-black text-neutral-800 leading-tight">
                    {currentUser.role === 'superadmin' ? 'Superadmin' : getActiveStaffName()}
                  </p>
                  <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-emerald-600 leading-none mt-0.5 uppercase tracking-wide">
                    {currentUser.role === 'superadmin' ? 'Pengawas Lembaga Kursus' : (
                      currentUser.subRole === 'pimpinan' ? 'Pimpinan Lembaga Kursus' :
                      currentUser.subRole === 'staf_admin' ? 'Staf Admin' :
                      currentUser.subRole === 'bendahara' ? 'Bendahara Lembaga Kursus' :
                      currentUser.subRole === 'pengajar' ? 'Instruktur / Pengajar' : 'Staf Lembaga Kursus'
                    )}
                  </p>
                </div>
              </div>
            )}

            {currentUser ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="bg-white hover:bg-neutral-50 border border-neutral-250 text-neutral-700 font-extrabold text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-4xs"
                  title="Ubah Profil & Kata Sandi"
                >
                  <User className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="hidden sm:inline">Ubah Profil</span>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-white font-bold text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-white" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-1.5 sm:gap-2 w-full md:w-auto">
                {/* On Desktop: Show full "Masuk" and back home controls (hidden on Mobile since it shifted to row 1) */}
                <div className="hidden md:flex items-center gap-1.5 sm:gap-2">
                  {selectedPublicLkpId && (
                    <button
                      onClick={() => setSelectedPublicLkpId(null)}
                      className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-extrabold text-xs px-2.5 py-1.5 rounded-xl transition-all cursor-pointer border border-neutral-200 shadow-3xs flex items-center gap-1"
                    >
                      <span>←</span>
                      <span>Beranda</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setLoginRole('lembaga');
                      setLoginError('');
                      setShowLoginModal(true);
                      setShowRegisterModal(false);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-750 text-white font-bold text-xs sm:text-sm px-3 py-1.5 rounded-xl transition-all shadow-xs active:scale-98 cursor-pointer flex items-center gap-1.5 focus:outline-none"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Masuk Sistem</span>
                  </button>
                </div>

                {/* "Registrasi Lembaga Baru" button: Full-width underneath on mobile, inline button on desktop */}
                <button
                  onClick={() => {
                    setRegError('');
                    setRegSuccess('');
                    setShowRegisterModal(true);
                    setShowLoginModal(false);
                  }}
                  className="w-full md:w-auto bg-neutral-900 hover:bg-neutral-850 text-white font-bold text-xs sm:text-sm px-3 py-2 md:py-1.5 rounded-xl border border-neutral-800 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 shadow-3xs focus:outline-none"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Registrasi Lembaga Baru</span>
                </button>
              </div>
            )}
          </div>
        </header>
      )}

      {/* 2. Main Content Router */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
        
        {/* VIEW: UNAUTHENTICATED (MINIMALIST LANDING PAGE WITH POPUPS) */}
        {!currentUser && (
          selectedPublicLkpId ? (() => {
            const publicLkp = institutions.find(i => i.id === selectedPublicLkpId);
            if (!publicLkp) {
              setSelectedPublicLkpId(null);
              return null;
            }
            return (
              <div className="max-w-5xl mx-auto w-full animate-fade-in">
                <PublicLandingPage
                  lembaga={publicLkp}
                  onBack={() => setSelectedPublicLkpId(null)}
                  onRegisterStudent={(student) => handlePublicRegisterStudent(publicLkp.id, student)}
                />
              </div>
            );
          })() : (
            <div className="space-y-8 py-4 max-w-5xl mx-auto animate-fade-in">
              
              {/* Elegant header description section - more compact */}
              <div className="bg-gradient-to-br from-emerald-600 to-teal-900 text-white rounded-2xl py-3 px-5 md:py-3.5 md:px-6 shadow-xs border border-emerald-600 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center md:text-left z-10 max-w-3xl">
                  <div className="mb-1">
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wider font-mono bg-emerald-800/80 text-emerald-100 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      Penyelarasan Mutu & Tata Kelola Digital Lembaga Kursus
                    </span>
                  </div>
                  <h2 className="text-base md:text-lg font-black tracking-tight font-display uppercase leading-snug text-white">
                    🏫 Selamat Datang di Smart Kursus
                  </h2>
                  <p className="text-[11px] md:text-xs text-emerald-100/95 leading-relaxed font-sans max-w-3xl">
                    Sistem informasi tata kelola digital premium terintegrasi 8 Standar Nasional Pendidikan (SNP) Akreditasi, pembukuan debit kredit terpilah, RPP asisten AI, dan pendaftaran online akademik mandiri.
                  </p>
                </div>
                <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 hidden md:block z-10 flex-shrink-0">
                  <Layers className="w-6 h-6 text-emerald-100" />
                </div>
                
                {/* Visual accents */}
                <div className="absolute -right-16 -top-16 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />
              </div>

              {/* DIREKTORI LEMBAGA KURSUS - more compact */}
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
                  <div className="space-y-1">
                    <h3 className="text-base md:text-lg font-black text-neutral-900 tracking-tight font-display uppercase flex flex-wrap items-center gap-2">
                      <span>🏫 DIREKTORI LEMBAGA KURSUS</span>
                      <span className="text-[10px] font-mono bg-emerald-100/80 text-emerald-800 px-2.5 py-0.5 rounded-md border border-emerald-150 font-bold">
                        {filteredInstitutions.length} Lembaga Kursus Terdaftar
                      </span>
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Pilih salah satu lembaga di bawah ini untuk melihat profil pelatih, program kursus unggulan, sarana fasilitas, serta melakukan <strong>pendaftaran siswa baru secara online</strong>.
                    </p>
                  </div>
                  
                  {/* Search bar input box - more compact */}
                  <div className="relative w-full md:w-82 flex-shrink-0 shadow-3xs">
                    <input
                      type="text"
                      className="w-full text-xs py-2.5 pl-9 pr-14 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-semibold text-neutral-800"
                      placeholder="Cari nama lembaga, alamat, atau program..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-450">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                      </svg>
                    </div>
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-500 hover:text-neutral-800 bg-neutral-100 hover:bg-neutral-200 px-2 py-0.5 rounded-md transition-colors border border-neutral-200 shadow-3xs"
                      >
                        Batal
                      </button>
                    )}
                  </div>
                </div>

                {filteredInstitutions.length === 0 ? (
                  <div className="bg-white border border-neutral-200 py-20 px-8 rounded-3xl text-center space-y-4 shadow-sm">
                    <div className="bg-neutral-50 p-4 rounded-full inline-block text-neutral-400 border border-neutral-100">
                      <Building className="w-10 h-10" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-base sm:text-lg font-bold text-neutral-900">Tidak ada lembaga kursus yang cocok</p>
                      <p className="text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
                        Maaf, tidak ada lembaga terdaftar dengan kata kunci pencarian <span className="font-semibold text-neutral-850">"{searchQuery}"</span>. Silakan coba pencarian lain atau tampilkan seluruh lembaga.
                      </p>
                    </div>
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl border border-emerald-200 transition-all cursor-pointer shadow-3xs"
                    >
                      Tampilkan Semua Lembaga
                    </button>
                  </div>
                ) : (
                  <div 
                    className="relative"
                    onMouseEnter={() => setCarouselIsHovering(true)}
                    onMouseLeave={() => setCarouselIsHovering(false)}
                  >
                    {/* Optional hover indicator / pause notice */}

                    {/* Carousel Wrapper */}
                    <div 
                      className="relative overflow-hidden rounded-2xl p-1 bg-neutral-50/20 border border-neutral-150/40"
                      style={{ height: "192px" }}
                    >
                      
                      {/* Vertical Control Arrows on Right Edge */}
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
                        <button
                          onClick={() => {
                            if (carouselIndex === 0) {
                              setCarouselIndex(carouselRows.length - 1);
                            } else {
                              setCarouselIndex(prev => prev - 1);
                            }
                          }}
                          className="w-9 h-9 bg-white/95 hover:bg-emerald-50 text-neutral-800 hover:text-emerald-700 rounded-full flex items-center justify-center shadow-md transition-all border border-neutral-200 cursor-pointer hover:scale-105 active:scale-95 focus:outline-none"
                          title="Atas"
                        >
                          <ChevronUp className="w-5 h-5 stroke-[2.5]" />
                        </button>

                        <button
                          onClick={() => {
                            setCarouselIndex(prev => prev + 1);
                          }}
                          className="w-9 h-9 bg-white/95 hover:bg-emerald-50 text-neutral-800 hover:text-emerald-700 rounded-full flex items-center justify-center shadow-md transition-all border border-neutral-200 cursor-pointer hover:scale-105 active:scale-95 focus:outline-none"
                          title="Bawah"
                        >
                          <ChevronDown className="w-5 h-5 stroke-[2.5]" />
                        </button>
                      </div>

                      {/* Sliding track container */}
                      <div className="overflow-hidden h-full">
                        <div 
                          className={`flex flex-col ${disableTransition ? 'transition-none' : 'transition-transform duration-500 ease-out'}`}
                          style={{ 
                            transform: `translateY(-${carouselIndex * 197}px)` 
                          }}
                          onTransitionEnd={() => {
                            if (carouselIndex >= carouselRows.length) {
                              setDisableTransition(true);
                              setCarouselIndex(0);
                            }
                          }}
                        >
                          {displayRows.map((row, rowIdx) => (
                            <div 
                              key={rowIdx} 
                              className="grid gap-4 shrink-0 transition-all duration-300 h-[185px] mb-3"
                              style={{
                                gridTemplateColumns: `repeat(${carouselVisibleCards}, minmax(0, 1fr))`
                              }}
                            >
                              {row.map(inst => (
                                <div 
                                  key={inst.id}
                                  className="bg-white border border-neutral-150 p-3.5 md:p-4 rounded-2xl hover:border-emerald-400 hover:shadow-2xs hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between h-full group text-left"
                                >
                                  <div className="space-y-2">
                                    {/* Logo and Status */}
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="w-11 h-11 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-center shrink-0 overflow-hidden shadow-3xs">
                                        {inst.profile.logoUrl ? (
                                          <img 
                                            src={inst.profile.logoUrl} 
                                            alt="Logo" 
                                            className="w-full h-full object-contain p-1"
                                            referrerPolicy="no-referrer"
                                          />
                                        ) : (
                                          <Building className="w-5 h-5 text-emerald-600" />
                                        )}
                                      </div>
                                      <span className="text-[8px] font-extrabold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-lg border border-emerald-100 shrink-0 uppercase tracking-wider">
                                        {inst.programs.length} Program
                                      </span>
                                    </div>

                                    {/* Details Compact */}
                                    <div className="space-y-0.5">
                                      <h4 className="font-extrabold text-neutral-900 text-xs md:text-sm tracking-tight uppercase group-hover:text-emerald-700 transition-colors truncate">
                                        {inst.name}
                                      </h4>
                                      {inst.profile.specialty && (
                                        <div className="flex items-center gap-1.5 mt-0.5 mb-1">
                                          {(() => {
                                            const meta = getCategoryMeta(inst.profile.specialty);
                                            return (
                                              <span className={`inline-flex items-center gap-1 text-[9.5px] font-extrabold px-2 py-0.5 rounded-md border ${meta.bgClass}`}>
                                                <span>{meta.icon}</span>
                                                <span>{meta.label}</span>
                                              </span>
                                            );
                                          })()}
                                        </div>
                                      )}
                                      <p className="flex items-start gap-1 text-[10px] text-neutral-500 font-medium line-clamp-1">
                                        <span className="text-neutral-400 select-none">📍</span>
                                        <span>{inst.profile.address}</span>
                                      </p>
                                    </div>
                                  </div>

                                  {/* Footer (Contact and Action) */}
                                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2 shrink-0">
                                    <span className="flex items-center gap-1 font-mono text-[9px] text-neutral-450 font-semibold truncate max-w-[65%]">
                                      <span className="text-neutral-400 select-none">📞</span>
                                      <span>{inst.profile.phone}</span>
                                    </span>
                                    <button
                                      onClick={() => {
                                        setSelectedPublicLkpId(inst.id);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                      }}
                                      className="bg-neutral-950 hover:bg-emerald-600 active:scale-98 text-white font-black text-[9px] px-3.5 py-2.5 rounded-xl transition-all cursor-pointer shadow-3xs flex items-center justify-center gap-0.5 shrink-0 animate-pulse-subtle"
                                    >
                                      <span>Lihat</span>
                                      <span className="text-[8px] font-mono text-emerald-300">→</span>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Pagination Dots */}
                    {carouselRows.length > 1 && (
                      <div className="flex justify-center items-center gap-1.5 mt-3">
                        {carouselRows.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCarouselIndex(idx)}
                            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                              (carouselIndex % carouselRows.length) === idx 
                                ? 'w-6 bg-emerald-600 shadow-3xs' 
                                : 'w-2 bg-neutral-250 hover:bg-neutral-400'
                            }`}
                            title={`Halaman ${idx + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        )}

            {/* Floating popups (modals) */}
            {/* 1. LOGIN POPUP MODAL */}
            {showLoginModal && (
              <div className="fixed inset-0 z-50 flex justify-center items-start overflow-y-auto p-4 bg-neutral-950/65 backdrop-blur-md animate-fade-in text-left">
                {/* Backdrop closer click */}
                <div className="absolute inset-0 min-h-screen" onClick={() => setShowLoginModal(false)} />

                <div className="relative bg-white rounded-3xl border border-neutral-100 shadow-2xl w-full max-w-md overflow-hidden z-10 transition-transform transform scale-100 p-6 md:p-8 space-y-5 my-auto">
                  
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <div>
                      <h4 className="font-bold text-neutral-900 text-base">Masuk Ke Sistem</h4>
                      <p className="text-[10px] text-neutral-450 uppercase font-mono tracking-wider">Akses Portal Smart Administrasi & Pengawas</p>
                    </div>
                    <button 
                      onClick={() => setShowLoginModal(false)}
                      className="p-1.5 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Form login inputs */}
                  {loginError && (
                    <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 text-red-700" />
                      <span>{loginError}</span>
                    </div>
                  )}



                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                        Email Lembaga Kursus
                      </label>
                      <input
                        type="text"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="admin@lembagacoding.com"
                        className="w-full text-xs p-3 border border-neutral-200 rounded-xl focus:outline-emerald-600 focus:bg-white bg-neutral-50 transition-colors"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Kata Sandi</label>
                        <button
                          type="button"
                          onClick={() => {
                            setShowLoginModal(false);
                            setForgotEmail('');
                            setForgotVerificationAnswer('');
                            setForgotStep(1);
                            setForgotMatchedLkp(null);
                            setForgotNewPass('');
                            setForgotNewPassConfirm('');
                            setForgotError('');
                            setForgotSuccess('');
                            setShowForgotModal(true);
                          }}
                          className="text-[10px] font-extrabold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                        >
                          Lupa Sandi?
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showLoginPass ? 'text' : 'password'}
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full text-xs p-3 pr-10 border border-neutral-200 rounded-xl focus:outline-emerald-600 focus:bg-white bg-neutral-50 font-mono transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPass(!showLoginPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                        >
                          {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer mt-2"
                    >
                      Verifikasi & Masuk Dashboard
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* 2. REGISTER POPUP MODAL */}
            {showRegisterModal && (
              <div className="fixed inset-0 z-50 flex justify-center items-start overflow-y-auto p-4 bg-neutral-950/65 backdrop-blur-md animate-fade-in text-left">
                {/* Backdrop closer click */}
                <div className="absolute inset-0 min-h-screen" onClick={() => setShowRegisterModal(false)} />

                <div className="relative bg-white rounded-3xl border border-neutral-100 shadow-2xl w-full max-w-lg overflow-hidden z-10 transition-transform transform scale-100 p-6 md:p-8 space-y-4 my-auto">
                  
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <div>
                      <h4 className="font-bold text-neutral-900 text-base">Registrasi Lembaga Baru</h4>
                      <p className="text-[10px] text-neutral-450 uppercase font-mono tracking-wider">Pendaftaran Mandiri SaaS</p>
                    </div>
                    <button 
                      onClick={() => setShowRegisterModal(false)}
                      className="p-1.5 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {regError && (
                    <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-semibold text-left">
                      {regError}
                    </div>
                  )}

                  {regSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold text-left space-y-2">
                      <p>{regSuccess}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setShowRegisterModal(false);
                          setShowLoginModal(true);
                          setLoginRole('lembaga');
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg inline-block cursor-pointer"
                      >
                        Buka Form Login
                      </button>
                    </div>
                  )}

                  {!regSuccess && (
                    <form onSubmit={handleRegister} className="space-y-3.5">
                      <div>
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">Nama Lembaga Kursus</span>
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="Misal: Lembaga Kursus Busana Elok"
                          className="w-full text-xs p-3 border border-neutral-200 rounded-xl focus:outline-emerald-600 focus:bg-white bg-neutral-50 transition-colors"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-neutral-550 block mb-1">Email Penanggungjawab</span>
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="admin@lembagabusana.com"
                          className="w-full text-xs p-3 border border-neutral-200 rounded-xl focus:outline-emerald-600 focus:bg-white bg-neutral-50 transition-colors"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-neutral-550 block mb-1">Kata Sandi Baru (Min 6 Karakter)</span>
                        <div className="relative">
                          <input
                            type={showRegPass ? 'text' : 'password'}
                            required
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="Min 6 karakter"
                            className="w-full text-xs p-3 pr-10 border border-neutral-200 rounded-xl font-mono focus:outline-emerald-600 focus:bg-white bg-neutral-50 transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPass(!showRegPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                          >
                            {showRegPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      
                      {/* CONFIRM PASSWORD ONCE */}
                      <div>
                        <span className="text-[10px] font-bold text-neutral-550 block mb-1">Konfirmasi Kata Sandi</span>
                        <div className="relative">
                          <input
                            type={showRegPass ? 'text' : 'password'}
                            required
                            value={regConfirm}
                            onChange={(e) => setRegConfirm(e.target.value)}
                            placeholder="Ulangi kata sandi"
                            className="w-full text-xs p-3 pr-10 border border-neutral-200 rounded-xl font-mono focus:outline-emerald-600 focus:bg-white bg-neutral-50 transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPass(!showRegPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                          >
                            {showRegPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* BIDANG KETERAMPILAN & AI REGENERATION */}
                      <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100/80 space-y-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                          <span className="text-xs font-bold text-emerald-800">Bidang Keterampilan & Asisten AI</span>
                        </div>
                        
                        <div>
                          <span className="text-[10px] font-bold text-neutral-600 block mb-1">Pilih Bidang Utama LKP</span>
                          <select
                            value={regSkillField}
                            onChange={(e) => setRegSkillField(e.target.value)}
                            className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-white focus:outline-emerald-600"
                          >
                            <option value="Tata Busana">Tata Busana / Fashion Design</option>
                            <option value="Otomotif">Teknik Otomotif / Mekanik Motor & Mobil</option>
                            <option value="Tata Rias Kecantikan">Tata Rias & Kecantikan / MUA</option>
                            <option value="Teknologi Informasi">Teknologi Informasi / Komputer & Pemrograman</option>
                            <option value="Seni Kuliner">Seni Kuliner / Tata Boga</option>
                            <option value="Bahasa Asing">Bahasa Asing & Komunikasi</option>
                            <option value="Lainnya">Lainnya (Tulis Kustom...)</option>
                          </select>
                        </div>

                        {regSkillField === 'Lainnya' && (
                          <div className="animate-fade-in">
                            <span className="text-[10px] font-bold text-neutral-600 block mb-1">Tulis Bidang Keterampilan Kustom</span>
                            <input
                              type="text"
                              required
                              value={regSkillCustom}
                              onChange={(e) => setRegSkillCustom(e.target.value)}
                              placeholder="Misal: Desain Grafis Kreatif, Perhotelan"
                              className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-white focus:outline-emerald-600"
                            />
                          </div>
                        )}

                        <div className="flex items-start gap-2 pt-1">
                          <input
                            type="checkbox"
                            id="regEnableAI"
                            checked={regEnableAI}
                            onChange={(e) => setRegEnableAI(e.target.checked)}
                            className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer h-3.5 w-3.5"
                          />
                          <label htmlFor="regEnableAI" className="text-[11px] text-neutral-600 cursor-pointer leading-tight select-none">
                            <strong>Gunakan Agen AI untuk Merancang LKP</strong> (Otomatis membuat visi, misi, 3 program kurikulum awal, fasilitas, dan instruktur sesuai bidang keahlian)
                          </label>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={regIsGenerating}
                        className={`w-full text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md cursor-pointer mt-2 flex items-center justify-center gap-2 ${
                          regIsGenerating 
                            ? 'bg-neutral-400 cursor-not-allowed' 
                            : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg'
                        }`}
                      >
                        {regIsGenerating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>{regGenStatus || 'Sedang memproses...'}</span>
                          </>
                        ) : (
                          <span>Selesaikan Registrasi Baru</span>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* 3. FORGOT PASSWORD POPUP MODAL */}
            {showForgotModal && (
              <div className="fixed inset-0 z-50 flex justify-center items-start overflow-y-auto p-4 bg-neutral-950/65 backdrop-blur-md animate-fade-in text-left">
                {/* Backdrop closer click */}
                <div className="absolute inset-0 min-h-screen" onClick={() => setShowForgotModal(false)} />

                <div className="relative bg-white rounded-3xl border border-neutral-100 shadow-2xl w-full max-w-md overflow-hidden z-10 transition-transform transform scale-100 p-6 md:p-8 space-y-4 my-auto">
                  
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                        <KeyRound className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900 text-sm">Pemulihan Sandi Lembaga Kursus</h4>
                        <p className="text-[9px] text-neutral-400 uppercase font-mono tracking-wider">Lupa Kata Sandi Sistem SaaS</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowForgotModal(false)}
                      className="p-1.5 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {forgotError && (
                    <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 text-red-700" />
                      <span>{forgotError}</span>
                    </div>
                  )}

                  {forgotSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0 text-emerald-700" />
                      <span>{forgotSuccess}</span>
                    </div>
                  )}

                  {forgotStep === 1 ? (
                    /* Step 1: Input registered institute email/username */
                    <form onSubmit={handleForgotVerifyEmail} className="space-y-4">
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        Masukkan <b>Username atau Alamat Email</b> lembaga Anda yang sudah terdaftar di sistem. Kami akan mencocokkan kredensial keamanan lembaga Anda.
                      </p>
                      
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                          Username / Email Terdaftar
                        </label>
                        <input
                          type="text"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="admin@lembagaanda.com atau username"
                          className="w-full text-xs p-3 border border-neutral-200 rounded-xl focus:outline-indigo-600 focus:bg-white bg-neutral-50 transition-colors"
                        />
                      </div>

                      <div className="flex gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowForgotModal(false);
                            setShowLoginModal(true);
                          }}
                          className="w-1/3 text-center border border-neutral-250 hover:bg-neutral-50 text-neutral-600 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                        >
                          Kembali
                        </button>
                        <button
                          type="submit"
                          className="w-2/3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all cursor-pointer"
                        >
                          Cari Akun Lembaga
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Step 2: Challenge Phone, NPSN, or Name, print existing, and optionally set a new password */
                    <form onSubmit={handleForgotResetConfirm} className="space-y-4">
                      <div className="bg-neutral-50 rounded-2xl p-3 border border-neutral-100 space-y-1">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 leading-none">Lembaga Terdeteksi:</p>
                        <p className="text-xs font-extrabold text-neutral-800">{forgotMatchedLkp?.name}</p>
                        <p className="text-[10px] font-mono text-neutral-400 italic">({forgotMatchedLkp?.email})</p>
                      </div>

                      <p className="text-xs text-neutral-500 leading-relaxed font-semibold">
                        Keamanan Lembaga: Tunjukkan kepemilikan Anda dengan mengetikkan <b>Nomor Telepon Lembaga</b> (atau NPSN/Nama Lembaga) yang terdaftar pada profil Lembaga Kursus ini.
                      </p>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block mb-1">
                          No. Telepon / NPSN / Nama Lembaga
                        </label>
                        <input
                          type="text"
                          required
                          value={forgotVerificationAnswer}
                          onChange={(e) => setForgotVerificationAnswer(e.target.value)}
                          placeholder="Masukkan No. Telepon atau NPSN terdaftar"
                          className="w-full text-xs p-3 border border-indigo-200 rounded-xl focus:outline-indigo-600 focus:bg-white bg-indigo-50/10 font-medium transition-colors"
                        />
                      </div>

                      {/* Display Reset Option if verified successfully / or general reset option built into form action */}
                      <div className="pt-2 border-t border-neutral-100 space-y-3">
                        <p className="text-[10px] font-bold text-neutral-450 uppercase tracking-wide">💡 Ingin Sekalian Mengganti Kata Sandi?</p>
                        
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                            Kata Sandi Baru (Opsional, minimal 6 karakter)
                          </label>
                          <input
                            type="password"
                            value={forgotNewPass}
                            onChange={(e) => setForgotNewPass(e.target.value)}
                            placeholder="Isi hanya jika ingin diganti..."
                            className="w-full text-xs p-3 border border-neutral-200 rounded-xl focus:outline-indigo-600 focus:bg-white bg-neutral-50 font-mono transition-colors"
                          />
                        </div>

                        {forgotNewPass && (
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                              Konfirmasi Kata Sandi Baru
                            </label>
                            <input
                              type="password"
                              value={forgotNewPassConfirm}
                              onChange={(e) => setForgotNewPassConfirm(e.target.value)}
                              placeholder="Ulangi kata sandi baru"
                              className="w-full text-xs p-3 border border-neutral-200 rounded-xl focus:outline-indigo-600 focus:bg-white bg-neutral-50 font-mono transition-colors"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setForgotStep(1)}
                          className="px-4 text-center border border-neutral-250 hover:bg-neutral-50 text-neutral-600 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                        >
                          Ulangi
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all cursor-pointer"
                        >
                          {forgotNewPass ? 'Reset & Simpan Sandi Baru' : 'Ambil Kata Sandi Saya'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* 4. EDIT PROFILE AND PASSWORD MODAL */}
            {showProfileModal && (
              <div className="fixed inset-0 z-50 flex justify-center items-start overflow-y-auto p-4 bg-neutral-950/65 backdrop-blur-md animate-fade-in text-left">
                {/* Backdrop closer click */}
                <div className="absolute inset-0 min-h-screen" onClick={() => setShowProfileModal(false)} />

                <div className="relative bg-white rounded-3xl border border-neutral-150 shadow-2xl w-full max-w-md overflow-hidden z-10 transition-all scale-100 p-6 md:p-8 space-y-4 my-auto">
                  
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-neutral-900 tracking-tight">Pengaturan Profil Saya</h3>
                        <p className="text-[10px] text-neutral-450 uppercase font-bold tracking-wider">
                          {currentUser?.role === 'superadmin' ? 'Superadmin' : (
                            currentUser?.subRole === 'pimpinan' ? 'Pimpinan LKP' : 'Akses Staff'
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowProfileModal(false)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {profileError && (
                    <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
                      <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                      <span>{profileError}</span>
                    </div>
                  )}

                  {profileSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{profileSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveProfileChanges} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-neutral-650 block mb-1.5">Nama Lengkap / Nama Lembaga</label>
                      <input 
                        type="text" 
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="Ketik nama lengkap Anda"
                        className="w-full text-xs border border-neutral-200 rounded-xl p-3 bg-neutral-50/50 focus:ring-1 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all font-semibold text-neutral-800" 
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-neutral-650 block mb-1.5">Email / Username Login</label>
                      <input 
                        type="text" 
                        required
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        placeholder="Ketik username atau email login"
                        className="w-full text-xs border border-neutral-200 rounded-xl p-3 bg-neutral-50/50 focus:ring-1 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all font-semibold text-neutral-800" 
                      />
                    </div>

                    <div className="border-t border-dashed border-neutral-200 pt-3 mt-3">
                      <h4 className="text-[10px] font-black text-neutral-450 uppercase tracking-wider mb-2.5">Keamanan / Ganti Sandi Baru</h4>
                      
                      <div className="space-y-3">
                        <div className="relative">
                          <label className="text-xs font-bold text-neutral-650 block mb-1">Kata Sandi Lama</label>
                          <div className="relative">
                            <input 
                              type={profileShowOldPass ? 'text' : 'password'} 
                              value={profileOldPassword}
                              onChange={(e) => setProfileOldPassword(e.target.value)}
                              placeholder="Masukkan sandi saat ini"
                              className="w-full text-xs border border-neutral-200 rounded-xl p-3 pr-10 bg-neutral-50/50 focus:ring-1 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all font-mono" 
                            />
                            <button
                              type="button"
                              onClick={() => setProfileShowOldPass(!profileShowOldPass)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                            >
                              {profileShowOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="relative">
                          <label className="text-xs font-bold text-neutral-650 block mb-1">Kata Sandi Baru</label>
                          <div className="relative">
                            <input 
                              type={profileShowNewPass ? 'text' : 'password'} 
                              value={profilePassword}
                              onChange={(e) => setProfilePassword(e.target.value)}
                              placeholder="Kosongkan jika tidak ingin diubah"
                              className="w-full text-xs border border-neutral-200 rounded-xl p-3 pr-10 bg-neutral-50/50 focus:ring-1 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all font-mono" 
                            />
                            <button
                              type="button"
                              onClick={() => setProfileShowNewPass(!profileShowNewPass)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                            >
                              {profileShowNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="relative">
                          <label className="text-xs font-bold text-neutral-650 block mb-1">Konfirmasi Kata Sandi Baru</label>
                          <div className="relative">
                            <input 
                              type={profileShowConfirmPass ? 'text' : 'password'} 
                              value={profileConfirmPassword}
                              onChange={(e) => setProfileConfirmPassword(e.target.value)}
                              placeholder="Ulangi kata sandi baru Anda"
                              className="w-full text-xs border border-neutral-200 rounded-xl p-3 pr-10 bg-neutral-50/50 focus:ring-1 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all font-mono" 
                            />
                            <button
                              type="button"
                              onClick={() => setProfileShowConfirmPass(!profileShowConfirmPass)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                            >
                              {profileShowConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => setShowProfileModal(false)}
                        className="flex-1 bg-neutral-100 hover:bg-neutral-200 active:scale-98 text-neutral-700 font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer border border-neutral-200 text-center"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-xs py-3 rounded-xl shadow-3xs transition-all cursor-pointer text-center"
                      >
                        Simpan Perubahan
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

        {/* VIEW: LOGGED IN ROLE -> SUPERADMIN PANEL */}
        {currentUser && currentUser.role === 'superadmin' && (
          <div className="space-y-6" id="superadmin-canvas">
            {/* Notifikasi Peringatan Sisa Kapasitas < 10% */}
            {isLowCapacity && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-3xl shadow-sm flex items-start gap-3.5 text-left animate-bounce-subtle">
                <div className="bg-red-100 p-2.5 rounded-2xl text-red-700 shrink-0 shadow-2xs">
                  <span className="text-xl">⚠️</span>
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-red-950 text-sm">Peringatan Kapasitas Penyimpanan Firebase Hampir Habis!</h4>
                  <p className="text-xs text-red-700 leading-relaxed font-sans">
                    Sisa kapasitas penyimpanan database Firebase saat ini adalah <strong className="font-black text-red-900">{remainingPercentage}%</strong> ({dbSizeKb} KB dari {storageLimitKb} KB). Kapasitas penyimpanan berada di bawah batas aman 10%! Silakan hapus data lembaga yang tidak diperlukan atau tingkatkan limit penyimpanan di bawah untuk menghindari penolakan tulis (Write Rejection) dari Firestore.
                  </p>
                </div>
              </div>
            )}

            {/* Header info */}
            <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full">
                  Superadmin Dashboard
                </span>
                <h2 className="text-2xl font-black text-neutral-900 tracking-tight font-display mt-2">Daftar Pengawasan Lembaga Terdaftar</h2>
                <p className="text-xs text-neutral-500 mt-1">Super administrator mengontrol penambahan, limit pemakaian subskripsi, serta pelulusan akses semua institusi.</p>
              </div>
              
              <div className="flex gap-4">
                <div className="p-3 bg-neutral-50 border border-neutral-150 rounded-2xl min-w-[120px] text-center">
                  <p className="text-[10px] font-mono font-bold text-neutral-400">TOTAL LEMBAGA</p>
                  <p className="text-xl font-black text-neutral-900">{institutions.length}</p>
                </div>
                <div className="p-3 bg-neutral-50 border border-neutral-150 rounded-2xl min-w-[120px] text-center">
                  <p className="text-[10px] font-mono font-bold text-neutral-400">TOTAL SISWA</p>
                  <p className="text-xl font-black text-emerald-600">
                    {institutions.reduce((sum, inst) => sum + inst.students.length, 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* MONITOR KAPASITAS PENYIMPANAN FIREBASE (Superadmin-Only) */}
            <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm space-y-4 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl transition-all ${isLowCapacity ? 'bg-red-50 text-red-650 animate-pulse border border-red-200/50' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-neutral-900 text-sm tracking-tight">Kapasitas Penyimpanan Firebase (Firestore)</h3>
                    <p className="text-[11px] text-neutral-500">Pemantauan ukuran penyimpanan data riil di Firebase Cloud.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-500">Batas Simulasi:</span>
                  <select
                    value={storageLimitKb}
                    onChange={(e) => setStorageLimitKb(Number(e.target.value))}
                    className="p-1.5 px-2.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-3xs cursor-pointer transition-all"
                  >
                    <option value="50">50 KB (Sangat Ketat)</option>
                    <option value="100">100 KB (Demo Default)</option>
                    <option value="200">200 KB (Menengah)</option>
                    <option value="1024">1 MB (Skala Kecil)</option>
                    <option value="1048576">1 GB (Paket Spark Free Tier)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Stat 1 */}
                <div className="bg-neutral-50/50 p-4 rounded-2xl border border-neutral-100 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-wider block">Kapasitas Terpakai</span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-neutral-850 font-mono">{dbSizeKb}</span>
                    <span className="text-xs font-bold text-neutral-500">KB</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 mt-1 block">Diestimasi dari isi payload dokumen aktif</span>
                </div>

                {/* Stat 2 */}
                <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                  isLowCapacity ? 'bg-red-50/40 border-red-200' : 'bg-neutral-50/50 border-neutral-100'
                }`}>
                  <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-wider block">Sisa Kapasitas</span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className={`text-2xl font-black font-mono ${isLowCapacity ? 'text-red-700' : 'text-emerald-700'}`}>
                      {remainingPercentage}%
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold mt-1 block">
                    {isLowCapacity ? '⚠️ Sisa di bawah batas aman 10%!' : '✅ Status kapasitas aman'}
                  </span>
                </div>

                {/* Stat 3 */}
                <div className="bg-neutral-50/50 p-4 rounded-2xl border border-neutral-100 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-wider block">Batas Maksimum</span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-neutral-850 font-mono">
                      {storageLimitKb >= 1024 ? `${(storageLimitKb/1024).toFixed(0)} MB` : `${storageLimitKb} KB`}
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400 mt-1 block">Ubah limit untuk menguji notifikasi</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold text-neutral-500 font-mono">
                  <span>Usage Progress ({usagePercentage}%)</span>
                  <span>{dbSizeKb} KB / {storageLimitKb} KB</span>
                </div>
                <div className="w-full bg-neutral-100 h-3 rounded-full overflow-hidden border border-neutral-150 p-0.5">
                  <div
                    style={{ width: `${usagePercentage}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      isLowCapacity 
                        ? 'bg-red-600 animate-pulse' 
                        : usagePercentage > 75 
                          ? 'bg-amber-500' 
                          : 'bg-emerald-600'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              
              {/* List Lembaga & Pengaturan Masa Pemakian */}
              <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-4">
                <div className="flex flex-col gap-4 border-b border-neutral-100 pb-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-neutral-900 text-sm">Status & Konfigurasi Batas Akses</h3>
                      <p className="text-[11px] text-neutral-400 mt-0.5">Kelola batas tanggal aktif lisensi dan akses operasional lembaga.</p>
                    </div>
                    
                    {/* Search Bar */}
                    <div className="relative w-full md:w-80">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                        <Search className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        placeholder="Cari nama, email, NPSN, program..."
                        value={superadminSearchQuery}
                        onChange={(e) => setSuperadminSearchQuery(e.target.value)}
                        className="w-full text-xs pl-10 pr-9 py-2.5 bg-neutral-50 hover:bg-neutral-100/70 border border-neutral-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white shadow-3xs transition-all"
                      />
                      {superadminSearchQuery && (
                        <button
                          onClick={() => setSuperadminSearchQuery('')}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status Filter Pills */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={() => setSuperadminStatusFilter('all')}
                      className={`text-[11px] px-3.5 py-1.5 rounded-full font-bold border transition-all cursor-pointer flex items-center gap-2 ${
                        superadminStatusFilter === 'all'
                          ? 'bg-neutral-900 text-white border-neutral-900 shadow-3xs'
                          : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      <span>Semua LKP</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                        superadminStatusFilter === 'all' ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700'
                      }`}>
                        {institutions.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setSuperadminStatusFilter('active')}
                      className={`text-[11px] px-3.5 py-1.5 rounded-full font-bold border transition-all cursor-pointer flex items-center gap-2 ${
                        superadminStatusFilter === 'active'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-3xs'
                          : 'bg-emerald-50/50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/50'
                      }`}
                    >
                      <span>LKP Aktif</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                        superadminStatusFilter === 'active' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {institutions.filter(inst => !isLembagaExpired(inst)).length}
                      </span>
                    </button>

                    <button
                      onClick={() => setSuperadminStatusFilter('expired')}
                      className={`text-[11px] px-3.5 py-1.5 rounded-full font-bold border transition-all cursor-pointer flex items-center gap-2 ${
                        superadminStatusFilter === 'expired'
                          ? 'bg-red-600 text-white border-red-600 shadow-3xs'
                          : 'bg-red-50/50 text-red-750 border-red-100 hover:bg-red-100/50'
                      }`}
                    >
                      <span>Masa Habis</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                        superadminStatusFilter === 'expired' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-800'
                      }`}>
                        {institutions.filter(inst => isLembagaExpired(inst)).length}
                      </span>
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {filteredSuperadminInstitutions.length === 0 ? (
                    <div className="p-10 border border-dashed border-neutral-200 rounded-2xl text-center space-y-3 bg-neutral-50/20 max-w-md mx-auto my-4 animate-fade-in">
                      <div className="mx-auto w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-450">
                        <Search className="w-5 h-5 text-neutral-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-neutral-800">Tidak ada lembaga kursus yang cocok</p>
                        <p className="text-xs text-neutral-400">
                          {superadminSearchQuery && superadminStatusFilter !== 'all'
                            ? `Pencarian "${superadminSearchQuery}" dengan filter status "${superadminStatusFilter === 'active' ? 'LKP Aktif' : 'Masa Habis'}" tidak membuahkan hasil.`
                            : superadminSearchQuery
                            ? `Pencarian untuk "${superadminSearchQuery}" tidak ditemukan.`
                            : `Tidak ada lembaga dengan status "${superadminStatusFilter === 'active' ? 'LKP Aktif' : 'Masa Habis'}" saat ini.`}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSuperadminSearchQuery('');
                          setSuperadminStatusFilter('all');
                        }}
                        className="mt-2 text-xs font-bold bg-neutral-950 hover:bg-neutral-800 text-white px-4 py-2 rounded-xl transition-all cursor-pointer shadow-3xs inline-flex items-center gap-1.5"
                      >
                        Reset Pencarian & Filter
                      </button>
                    </div>
                  ) : (
                    filteredSuperadminInstitutions.map(inst => {
                      const expired = isLembagaExpired(inst);
                      
                      return (
                        <div key={inst.id} className="p-4 border border-neutral-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-50/20 hover:border-neutral-200 transition-all">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-neutral-800 text-sm">{inst.name}</h4>
                              <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                                expired ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              }`}>
                                {expired ? 'Masa Habis' : 'Aktif'}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-400 mt-1 font-mono">{inst.email} | Sandi: {inst.password}</p>
                            <div className="flex gap-3 text-[10px] text-neutral-500 mt-2">
                              <span>Siswa: <strong>{inst.students?.length || 0}</strong></span>
                              <span>Guru: <strong>{inst.teachers?.length || 0}</strong></span>
                              <span>Program: <strong>{inst.programs?.length || 0}</strong></span>
                            </div>
                          </div>

                          {/* Controls: Edit Masa Pemakaian, Delete Lembaga Kursus */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <div className="text-xs text-neutral-600">
                              <span className="block text-[9px] font-semibold uppercase text-neutral-400">Atur Masa Pemakaian Expiry</span>
                              <input
                                type="date"
                                value={inst.activeUntil}
                                onChange={(e) => adjustActiveUntilDate(inst.id, e.target.value)}
                                className="p-1.5 border border-neutral-200 rounded text-xs bg-white mt-1 shadow-3xs"
                              />
                              <p className="text-[10px] text-neutral-400 italic mt-1 font-mono">
                                ({getDaysRemainingStr(inst.activeUntil)})
                              </p>
                            </div>

                            <button
                              onClick={() => deleteInstitution(inst.id, inst.name)}
                              className="bg-red-50 hover:bg-red-100 text-red-650 border border-red-200 p-2.5 rounded-xl text-red-650 flex items-center justify-center transition-colors"
                              title="Hapus Lembaga"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW: LOGGED IN ROLE -> INSTITUTION / LEMBAGA WORKSPACE */}
        {currentUser && currentUser.role === 'lembaga' && currentLkp && (
          <div className="space-y-6" id="lembaga-workspace">
            
            {/* Expiration Banner Warning */}
            {isLembagaExpired(currentLkp) && (
              <div className="p-4 bg-red-50 text-red-800 border-l-4 border-red-600 rounded-r-2xl text-xs space-y-1 shadow-sm">
                <p className="font-bold flex items-center gap-1 text-sm">
                  <ShieldAlert className="w-4.5 h-4.5 text-red-700 animate-bounce" />
                  <span>MASA PEMAKAIAN KURSUS ANDA SUDAH EXPIRED/HABIS!</span>
                </p>
                <p>Fitur asisten AI dan administrative dinonaktifkan sementara. Silakan hubungi <strong>Superadmin</strong> untuk memperpanjang batas lisensi operasional aplikasi Anda.</p>
              </div>
            )}


            {/* TWO-COLUMN WORKSPACE: LEFT SIDEBAR & RIGHT STAGE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: Premium Vertical Sidebar Nav with Submenu Dropdown */}
              <div className={`${isSidebarCollapsed ? 'lg:col-span-1 xl:col-span-1' : 'lg:col-span-3'} space-y-4 no-print w-full transition-all duration-300`}>
                <div className={`bg-white rounded-3xl border border-neutral-100 shadow-3xs space-y-1.5 animate-fade-in transition-all duration-300 ${isSidebarCollapsed ? 'p-2' : 'p-4'}`}>
                  <div className={`border-b border-neutral-50 mb-2 flex items-center ${isSidebarCollapsed ? 'justify-center py-2' : 'justify-between px-3 py-2'}`}>
                    {!isSidebarCollapsed && (
                      <h3 className="text-[10px] uppercase font-mono tracking-widest font-black text-neutral-400">Navigasi Kerja</h3>
                    )}
                    <button 
                      onClick={() => {
                        const nextState = !isSidebarCollapsed;
                        setIsSidebarCollapsed(nextState);
                        localStorage.setItem('is_sidebar_collapsed', String(nextState));
                      }}
                      className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 transition-colors cursor-pointer"
                      title={isSidebarCollapsed ? "Perbesar Navigasi" : "Kecilkan Navigasi"}
                    >
                      {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* 1. Dashboard Ringkasan */}
                  {(currentUser?.role === 'superadmin' || currentUser?.subRole === 'pimpinan') && (
                    <button
                      onClick={() => {
                        setActiveSidebar('dashboard');
                        setNavigationStudentId('');
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold rounded-2xl transition-all cursor-pointer text-left ${
                        activeSidebar === 'dashboard'
                          ? 'bg-emerald-600 text-white shadow-3xs'
                          : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                      } ${isSidebarCollapsed ? 'justify-center lg:px-1' : ''}`}
                      title="Dashboard Ringkasan"
                    >
                      <TrendingUp className="w-4 h-4 flex-shrink-0" />
                      {!isSidebarCollapsed && <span className="truncate">Dashboard Ringkasan</span>}
                    </button>
                  )}

                  {/* 2. Pendaftaran Siswa */}
                  <button
                    onClick={() => {
                      setActiveSidebar('registrasi');
                      setNavigationStudentId('');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-2xl transition-all cursor-pointer text-left ${
                      activeSidebar === 'registrasi'
                        ? 'bg-emerald-600 text-white shadow-3xs'
                        : isModuleLocked('registrasi', '')
                          ? 'text-neutral-400 bg-neutral-50/40 opacity-70'
                          : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                    } ${isSidebarCollapsed ? 'justify-center lg:px-1' : ''}`}
                    title="Pendaftaran Siswa"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 flex-shrink-0" />
                      {!isSidebarCollapsed && <span className="truncate">Pendaftaran Siswa</span>}
                    </div>
                    {!isSidebarCollapsed && isModuleLocked('registrasi', '') && (
                      <Lock className="w-3.5 h-3.5 text-neutral-400" />
                    )}
                  </button>

                  {/* Divider */}
                  <div className="h-px bg-neutral-100 my-3" />

                  <div className="space-y-1.5">
                    {([
                      {
                        type: 'accordion',
                        id: 'kelembagaan',
                        title: 'Profil & Kelembagaan',
                        icon: Building,
                        items: [
                          { id: 'profil', label: 'Profil & Visi Misi', icon: Building, sidebar: 'administrasi' },
                          { id: 'struktur', label: 'Struktur Organisasi', icon: Users, sidebar: 'administrasi' },
                          { id: 'sarpras', label: 'Sarana Prasarana', icon: MapPin, sidebar: 'administrasi' },
                        ]
                      },
                      {
                        type: 'accordion',
                        id: 'akademik',
                        title: 'Akademik & KBM',
                        icon: BookOpen,
                        items: [
                          { id: 'program', label: 'Program & Harga', icon: FolderKanban, sidebar: 'administrasi' },
                          { id: 'asisten_ai', label: 'RPP, LKS, Uji', icon: Sparkles, sidebar: 'asisten_ai' },
                          { id: 'kalender', label: 'Kalender Akademik', icon: Calendar, sidebar: 'administrasi' },
                          { id: 'jadwal', label: 'Jadwal & Pengajar', icon: Clock, sidebar: 'administrasi' },
                          { id: 'absensi', label: 'Absensi Siswa', icon: ClipboardCheck, sidebar: 'administrasi' },
                          { id: 'raport', label: 'Cetak Raport Siswa', icon: FileText, sidebar: 'raport' }
                        ]
                      },
                      {
                        type: 'accordion',
                        id: 'keuangan',
                        title: 'Keuangan & Promosi',
                        icon: Landmark,
                        items: [
                          { id: 'rab', label: 'Anggaran & RAB', icon: FileSpreadsheet, sidebar: 'administrasi' },
                          { id: 'jurnal', label: 'Jurnal Keuangan', icon: Landmark, sidebar: 'administrasi' },
                          { id: 'voucher', label: 'Voucher Program', icon: Percent, sidebar: 'administrasi' },
                        ]
                      },
                      {
                        type: 'menu',
                        id: 'snp',
                        label: 'Pemenuhan 8 SNP',
                        icon: BookOpen,
                        sidebar: 'administrasi'
                      },
                      {
                        type: 'accordion',
                        id: 'pemeliharaan',
                        title: 'Pemeliharaan',
                        icon: KeyRound,
                        items: [
                          { id: 'backup', label: 'Backup & Restore', icon: Download, sidebar: 'administrasi' },
                          { id: 'kredensial', label: 'Kredensial Akses', icon: KeyRound, sidebar: 'administrasi' },
                        ]
                      }
                    ] as any[]).map((group) => {
                      if (group.type === 'menu') {
                        const ItemIcon = group.icon;
                        const isActive = activeSidebar === group.sidebar && activeModule === group.id;
                        const isLocked = isModuleLocked(group.sidebar, group.id);
                        return (
                          <button
                            key={group.id}
                            onClick={() => {
                              setActiveSidebar(group.sidebar as any);
                              if (group.sidebar === 'administrasi') {
                                setActiveModule(group.id);
                              }
                              setNavigationStudentId('');
                            }}
                            className={`w-full flex items-center justify-between transition-all cursor-pointer text-left border ${
                              isActive
                                ? 'bg-emerald-600 text-white shadow-3xs border-emerald-650'
                                : isLocked
                                  ? 'text-neutral-400 bg-neutral-50/40 opacity-70 border-neutral-150'
                                  : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 border-neutral-100 bg-white shadow-4xs'
                            } ${isSidebarCollapsed ? 'justify-center p-2.5 rounded-2xl' : 'px-3.5 py-2.5 text-xs font-bold rounded-2xl'}`}
                            title={group.label}
                          >
                            <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                              {isLocked ? (
                                <Lock className="w-4 h-4 flex-shrink-0 text-neutral-400" />
                              ) : (
                                <ItemIcon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
                              )}
                              {!isSidebarCollapsed && <span className="truncate">{group.label}</span>}
                            </div>
                            {!isSidebarCollapsed && (
                              isLocked ? (
                                <span className="text-[10px] text-neutral-400">🔒</span>
                              ) : (
                                <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${
                                  isActive 
                                    ? 'bg-emerald-700/50 text-white border-emerald-500' 
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}>
                                  8 SNP
                                </span>
                              )
                            )}
                          </button>
                        );
                      }

                      const GroupIcon = group.icon;
                      const isOpen = openGroup === group.id;
                      const isAnyActive = group.items.some((item: any) => {
                        if (item.sidebar === 'asisten_ai') return activeSidebar === 'asisten_ai';
                        if (item.sidebar === 'raport') return activeSidebar === 'raport';
                        return activeSidebar === 'administrasi' && activeModule === item.id;
                      });

                      return (
                        <div key={group.id} className="border border-neutral-100 rounded-2xl overflow-hidden bg-neutral-50/50 animate-fade-in">
                          {/* Accordion Trigger/Header */}
                          <button
                            onClick={() => {
                              if (isSidebarCollapsed) {
                                setIsSidebarCollapsed(false);
                                localStorage.setItem('is_sidebar_collapsed', 'false');
                                setOpenGroup(group.id);
                              } else {
                                setOpenGroup(isOpen ? null : group.id);
                              }
                            }}
                            className={`w-full flex items-center transition-all cursor-pointer text-left ${
                              isSidebarCollapsed 
                                ? 'justify-center p-2.5 hover:bg-neutral-50' 
                                : `justify-between px-3.5 py-2.5 text-xs font-bold ${
                                    isAnyActive 
                                      ? 'bg-emerald-50 text-emerald-800 border-l-2 border-emerald-500 pl-3' 
                                      : 'text-neutral-700 hover:bg-neutral-50'
                                  }`
                            }`}
                            title={group.title}
                          >
                            <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                              <GroupIcon className={`w-4 h-4 flex-shrink-0 ${isAnyActive ? 'text-emerald-600' : 'text-neutral-450'}`} />
                              {!isSidebarCollapsed && <span className="truncate">{group.title}</span>}
                            </div>
                            {!isSidebarCollapsed && (
                              isOpen ? (
                                <ChevronUp className="w-3.5 h-3.5 opacity-75 mr-0.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 opacity-75 mr-0.5" />
                              )
                            )}
                          </button>

                          {/* Accordion Content */}
                          {isOpen && !isSidebarCollapsed && (
                            <div className="p-1.5 bg-white space-y-0.5 border-t border-neutral-100 animate-fade-in">
                              {group.items.map((item: any) => {
                                const ItemIcon = item.icon;
                                const isActive = item.sidebar === 'raport' 
                                  ? activeSidebar === 'raport'
                                  : (item.sidebar === 'asisten_ai'
                                    ? activeSidebar === 'asisten_ai'
                                    : (activeSidebar === 'administrasi' && activeModule === item.id));

                                const isLocked = isModuleLocked(item.sidebar, item.id);

                                return (
                                  <button
                                    key={item.id}
                                    onClick={() => {
                                      setActiveSidebar(item.sidebar as any);
                                      if (item.sidebar === 'administrasi') {
                                        setActiveModule(item.id);
                                      }
                                      setNavigationStudentId('');
                                    }}
                                    className={`w-full flex items-center justify-between px-2.5 py-2 text-[11px] rounded-xl transition-all cursor-pointer text-left ${
                                      isActive
                                        ? 'bg-emerald-600 text-white font-extrabold shadow-4xs'
                                        : isLocked
                                          ? 'text-neutral-400 bg-neutral-50/40 opacity-70'
                                          : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 font-semibold'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      {isLocked ? (
                                        <Lock className="w-3 h-3 text-neutral-400" />
                                      ) : (
                                        <ItemIcon className="w-3.5 h-3.5 flex-shrink-0" />
                                      )}
                                      <span>{item.label}</span>
                                    </div>
                                    {isLocked && <span className="text-[9px] text-neutral-400">🔒</span>}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                </div>
              </div>

              {/* RIGHT COLUMN: Active Module Content Stage */}
              <div className={`${isSidebarCollapsed ? 'lg:col-span-11 xl:col-span-11' : 'lg:col-span-9'} w-full transition-all duration-300`}>

            {/* Expired block for all non-essential actions */}
            {isLembagaExpired(currentLkp) && activeSidebar !== 'dashboard' ? (
              <div className="bg-white p-12 text-center border border-neutral-100 rounded-3xl space-y-4">
                <Lock className="w-12 h-12 text-red-400 mx-auto" />
                <h3 className="font-bold text-lg text-neutral-800">Modul Kerja Terkunci</h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">
                  Aplikasi tata kelola kursus {currentLkp.name} ditangguhkan sementara karena melampaui tenggat pemakaian yang diizinkan superadmin. Silakan lakukan perpanjangan lisensi.
                </p>
              </div>
            ) : (
              <div className="transition-all animate-fade-in">
                
                {/* 1. INTERNAL VIEW: CORE INSTITUTION DASHBOARD (VISUAL CHARTS) */}
                {activeSidebar === 'dashboard' && (
                  isModuleLocked('dashboard', '') ? <div className="text-center py-12 text-xs font-bold text-neutral-400">Menyiapkan modul kerja Anda...</div> : (
                    <div className="space-y-6 text-left">
                    

                    {/* Warm Reminder / Expiry warning inside admin dashboard */}
                    {(() => {
                      const daysRemaining = getDaysRemaining(currentLkp.activeUntil);
                      const isApproaching = daysRemaining <= 14;
                      const isExpired = daysRemaining < 0;
                      if (!isApproaching && !isExpired) return null;
                      
                      return (
                        <div className={`p-5 rounded-2xl border transition-all ${
                          isExpired 
                            ? 'bg-red-50 border-red-200 text-red-950' 
                            : 'bg-amber-50/80 border-amber-200/60 text-amber-950'
                        }`}>
                          <div className="flex flex-col sm:flex-row items-start gap-4">
                            <div className={`p-2.5 rounded-xl shrink-0 ${isExpired ? 'bg-red-650 text-white' : 'bg-amber-500 text-amber-950'}`}>
                              <ShieldAlert className="w-5 h-5" />
                            </div>
                            <div className="space-y-1.5 flex-1">
                              <h4 className="font-extrabold text-xs uppercase tracking-wider flex items-center gap-2">
                                <span>⚠️ {isExpired ? 'LISENSI SYSTEM TELAH BERAKHIR' : 'PENGINGAT MASA PAKAI APLIKASI'}</span>
                                <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-widest ${
                                  isExpired ? 'bg-red-200/60 text-red-800' : 'bg-amber-200/65 text-amber-800'
                                }`}>
                                  {daysRemaining < 0 ? 'Expired' : `${daysRemaining} Hari Tersisa`}
                                </span>
                              </h4>
                              <p className="text-xs leading-relaxed text-neutral-700 font-medium">
                                {isExpired ? (
                                  <span>
                                    Masa berlaku operasional sistem Anda telah <strong>berakhir pada tanggal ({currentLkp.activeUntil})</strong>.
                                    Harap segera hubungi pembuat/pengembang aplikasi untuk memperpanjang lisensi Anda agar seluruh modul sistem dan asisten guru AI dapat terus digunakan tanpa kendala.
                                  </span>
                                ) : (
                                  <span>
                                    Masa berlaku operasional sistem Lembaga Kursus Anda tersisa <strong className="text-amber-800">{daysRemaining} hari</strong> lagi (aktif s/d <strong>{currentLkp.activeUntil}</strong>).
                                    Silakan segera hubungi pembuat/pengembang aplikasi untuk memperpanjang masa pakai sistem agar proses tata kelola instansi tetap berjalan lancar.
                                  </span>
                                )}
                              </p>
                              <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-extrabold">
                                <a 
                                  href="https://wa.me/6281234567890" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className={`inline-flex items-center gap-1.5 hover:underline ${isExpired ? 'text-red-700' : 'text-amber-800'}`}
                                >
                                  <span>💬 Hubungi Pembuat Aplikasi (WhatsApp)</span>
                                </a>
                                <span className="text-neutral-300 hidden sm:inline">|</span>
                                <span className="text-neutral-500">Masa Aktif s/d: <strong className="text-neutral-800">{currentLkp.activeUntil}</strong></span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Visual cards widgets */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      
                      <div className="p-4 bg-white rounded-3xl border border-neutral-100 shadow-3xs flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-bold">Siswa Aktif</p>
                          <p className="text-2xl font-black text-neutral-800 mt-1">
                            {currentLkp.students.filter(s => s.status === 'Aktif').length}
                          </p>
                          <p className="text-[10px] text-neutral-450 mt-1">Dari total {currentLkp.students.length} terdaftar</p>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>

                      <div className="p-4 bg-white rounded-3xl border border-neutral-100 shadow-3xs flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-bold">Program Kursus</p>
                          <p className="text-2xl font-black text-neutral-800 mt-1">
                            {currentLkp.programs.length} Kelas
                          </p>
                          <p className="text-[10px] text-neutral-450 mt-1">Siap dipasarkan Lembaga Kursus</p>
                        </div>
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                          <Layers className="w-5 h-5 text-indigo-600" />
                        </div>
                      </div>

                      <div className="p-4 bg-white rounded-3xl border border-neutral-100 shadow-3xs flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-bold">Buku Kas Jurnal</p>
                          <p className="text-2xl font-black text-neutral-800 mt-1">
                            Rp {(
                              currentLkp.journal.filter(j => j.type === 'Debit').reduce((s,t) => s+t.amount, 0) -
                              currentLkp.journal.filter(j => j.type === 'Kredit').reduce((s,t) => s+t.amount, 0)
                            ).toLocaleString('id-ID')}
                          </p>
                          <p className="text-[10px] text-emerald-600 font-bold mt-1">Sisa saldo kas lancar</p>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                          <TrendingUp className="w-5 h-5 text-emerald-600" />
                        </div>
                      </div>

                      <div className="p-4 bg-white rounded-3xl border border-neutral-100 shadow-3xs flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-bold">8 SNP Akreditasi</p>
                          <p className="text-2xl font-black text-neutral-800 mt-1">
                            {Math.round(currentLkp.snpStandards.reduce((acc, curr) => acc + curr.percentage, 0) / currentLkp.snpStandards.length)}%
                          </p>
                          <p className="text-[10px] text-neutral-450 mt-1">Persentase kecukupan bukti</p>
                        </div>
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                          <BookOpen className="w-5 h-5 text-purple-600" />
                        </div>
                      </div>

                    </div>

                    {/* Visual Analytics / Mini-chart Section in CSS */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* Financial statistics bar chart simulated */}
                      <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-neutral-100 shadow-3xs space-y-4">
                        <div className="flex justify-between items-center border-b border-neutral-50 pb-3">
                          <div>
                            <h4 className="font-bold text-neutral-800 text-sm">Visual Laporan Keuangan Casflow harian</h4>
                            <p className="text-[11px] text-neutral-400">Log transaksi debit vs pengeluaran kredit terakhir.</p>
                          </div>
                          <span className="text-xs bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full text-emerald-800 font-bold">
                            Live Ledger Balance
                          </span>
                        </div>

                        {/* Chart implementation */}
                        <div className="py-2.5">
                          <div className="h-[180px] w-full flex items-end justify-between gap-6 px-4 border-b border-neutral-200">
                            {currentLkp.journal.slice(-6).map((j, i) => {
                              const proportion = Math.min(Math.round((j.amount / 4000000) * 100), 100);
                              return (
                                <div key={j.id} className="flex-1 flex flex-col items-center group relative cursor-help">
                                  {/* Tooltip */}
                                  <span className="absolute top-[-30px] bg-neutral-900 border border-neutral-800 text-neutral-100 text-[10px] font-mono p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 white-space-nowrap">
                                    Rp {j.amount.toLocaleString('id-ID')}
                                  </span>
                                  <div 
                                    className={`w-full rounded-t-lg transition-all hover:brightness-95 ${
                                      j.type === 'Debit' ? 'bg-emerald-500' : 'bg-red-400'
                                    }`}
                                    style={{ height: `${Math.max(proportion, 15)}%` }}
                                  ></div>
                                  <span className="text-[9px] text-neutral-400 font-mono mt-1 text-center max-w-[80px] truncate">
                                    {j.description.substring(0, 10)}..
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex justify-center gap-4 mt-3 text-[10px]">
                            <span className="flex items-center gap-1 text-emerald-600 font-bold">
                              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span> Debit (Uang Masuk)
                            </span>
                            <span className="flex items-center gap-1 text-red-550 font-bold">
                              <span className="w-2.5 h-2.5 bg-red-400 rounded-full"></span> Kredit (Pengeluaran)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Vision & Mission Summary card */}
                      <div className="lg:col-span-4 bg-gradient-to-br from-neutral-900 to-neutral-800 text-neutral-100 p-6 rounded-3xl justify-between flex flex-col">
                        <div>
                          <Layers className="w-6 h-6 text-emerald-400 mb-3" />
                          <h4 className="font-extrabold text-sm tracking-tight text-white uppercase font-display">Visi Lembaga Kursus</h4>
                          <p className="text-xs text-neutral-300 italic leading-relaxed mt-2.5">
                            "{currentLkp.profile.vision}"
                          </p>
                        </div>
                        <div className="border-t border-neutral-800 pt-3 mt-4 text-[10px] text-neutral-400 flex items-center justify-between">
                          <span>Instansi Terakreditasi</span>
                          <span>Mitra Kerja Lembaga Kursus</span>
                        </div>
                      </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Active agenda items */}
                      <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-3xs space-y-4">
                        <div className="flex justify-between items-center border-b border-neutral-50 pb-2">
                          <h4 className="font-bold text-neutral-800 text-xs sm:text-sm">Agenda & Sesi Kelas Terdekat</h4>
                          <Calendar className="w-4 h-4 text-neutral-400" />
                        </div>
                        <div className="space-y-3">
                          {currentLkp.calendar.slice(0, 3).map(ev => (
                            <div key={ev.id} className="flex justify-between items-center text-xs p-2.5 rounded-xl hover:bg-neutral-50">
                              <span className="font-semibold text-neutral-800">{ev.title}</span>
                              <span className="text-neutral-400 font-mono">{ev.date}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Programs pricing preview */}
                      <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-3xs space-y-4">
                        <div className="flex justify-between items-center border-b border-neutral-50 pb-2">
                          <h4 className="font-bold text-neutral-800 text-xs sm:text-sm uppercase tracking-tight">Daftar Paket Program & Rincian Biaya</h4>
                          <HelpCircle className="w-4 h-4 text-neutral-400" />
                        </div>
                        <div className="space-y-4">
                          {currentLkp.programs.map(p => (
                            <div key={p.id} className="pb-3 border-b border-neutral-50 space-y-1.5 last:border-b-0 last:pb-0">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-neutral-900 text-xs uppercase tracking-tight">{p.name} ({p.duration})</span>
                                <span className="text-emerald-600 font-extrabold text-xs">Rp {p.price.toLocaleString('id-ID')}</span>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-[10px] text-neutral-500 bg-neutral-50 p-2 rounded-xl border border-neutral-100/50">
                                <div>
                                  <span className="block text-neutral-450 font-bold text-[8px] uppercase">Daftar</span>
                                  <span className="font-bold text-neutral-800 font-mono">Rp {(p.regFee || 0).toLocaleString('id-ID')}</span>
                                </div>
                                <div>
                                  <span className="block text-neutral-450 font-bold text-[8px] uppercase">Kursus</span>
                                  <span className="font-bold text-neutral-800 font-mono">Rp {(p.tuitionFee || p.price || 0).toLocaleString('id-ID')}</span>
                                </div>
                                <div>
                                  <span className="block text-neutral-450 font-bold text-[8px] uppercase">Bulanan</span>
                                  <span className="font-bold text-neutral-800 font-mono">Rp {(p.monthlyFee || 0).toLocaleString('id-ID')}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                  )
                )}

                {/* 2. REGISTRASI ONLINE/OFFLINE SISWA */}
                {activeSidebar === 'registrasi' && (
                  isModuleLocked('registrasi', '') ? renderLockedScreen('registrasi', '') : (
                    <PendaftaranSiswa
                      lembaga={currentLkp}
                      students={currentLkp.students}
                      onAddStudent={handleAddNewStudent}
                      onUpdateStudent={handleUpdateStudent}
                      onNavigateToRaport={(id) => {
                        setNavigationStudentId(id);
                        setActiveSidebar('raport');
                      }}
                    />
                  )
                )}

                {/* 3. ADMINISTRASI SUBMODULES */}
                {activeSidebar === 'administrasi' && (
                  isModuleLocked('administrasi', activeModule) ? renderLockedScreen('administrasi', activeModule) : (
                    <AdminModules
                      lembaga={currentLkp}
                      students={currentLkp.students}
                      onUpdateLembaga={updateCurrentLkp}
                      activeModule={activeModule}
                      setActiveModule={setActiveModule}
                    />
                  )
                )}

                {/* 4. ASISTEN GURU AI (Gemini) */}
                {activeSidebar === 'asisten_ai' && (
                  isModuleLocked('asisten_ai', '') ? renderLockedScreen('asisten_ai', '') : (
                    <AIAssistance
                      lembaga={currentLkp}
                      students={currentLkp.students}
                      onAddRaportCard={handleAddRaportCard}
                      activeTab={activeAITab}
                      setActiveTab={setActiveAITab}
                    />
                  )
                )}

                {/* 5. BUKU RAPORT & PRINT */}
                {activeSidebar === 'raport' && (
                  isModuleLocked('raport', '') ? renderLockedScreen('raport', '') : (
                    <RaportPrint
                      lembaga={currentLkp}
                      students={currentLkp.students}
                      onAddRaportCard={handleAddRaportCard}
                      onRemoveRaportCard={handleRemoveRaportCard}
                      preselectedStudentId={navigationStudentId}
                    />
                  )
                )}

              </div>
            )}

          </div>
        </div>

          </div>
        )}

        {/* POPUP NOTIFIKASI JELANG EXPIRED / MASA AKTIF LISENSI */}
        {currentUser && currentUser.role === 'lembaga' && currentLkp && (() => {
          const daysRemaining = getDaysRemaining(currentLkp.activeUntil);
          const isExpired = daysRemaining < 0;
          const isExpiringSoon = daysRemaining >= 0 && daysRemaining <= 14;
          const shouldShowPopup = (isExpired || isExpiringSoon) && dismissedLicenseWarningLkpId !== currentLkp.id;

          if (!shouldShowPopup) return null;

          return (
            <div className="fixed inset-0 z-50 flex justify-center items-start overflow-y-auto p-4 bg-neutral-950/65 backdrop-blur-md animate-fade-in text-left">
              <div className="absolute inset-0 min-h-screen" onClick={() => setDismissedLicenseWarningLkpId(currentLkp.id)} />
              
              <div className="relative bg-white rounded-3xl border border-neutral-100 shadow-2xl w-full max-w-md overflow-hidden z-20 p-6 md:p-8 space-y-5 my-auto">
                
                {/* Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
                  <div className={`p-2 rounded-xl text-white ${isExpired ? 'bg-red-650' : 'bg-amber-500'}`}>
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-neutral-900 text-sm tracking-tight uppercase">
                      {isExpired ? 'Lisensi Telah Berakhir' : 'Pengingat Masa Aktif'}
                    </h4>
                    <p className="text-[10px] text-neutral-400 uppercase font-mono tracking-wider">
                      Informasi Lisensi Operasional SaaS
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3 text-xs leading-relaxed text-neutral-600">
                  <p>
                    Yth. Pengelola <strong>{currentLkp.name}</strong>,
                  </p>
                  {isExpired ? (
                    <p className="bg-red-50 text-red-800 p-3.5 rounded-2xl border border-red-100 font-medium">
                      Masa berlaku lisensi operasional sistem Anda telah <strong>berakhir ({currentLkp.activeUntil})</strong>. 
                      Beberapa fitur administratif dan kecerdasan buatan dinonaktifkan sementara.
                    </p>
                  ) : (
                    <p className="bg-amber-50 text-amber-800 p-3.5 rounded-2xl border border-amber-100 font-medium">
                      Masa berlaku lisensi operasional sistem Anda tersisa <strong>{daysRemaining} hari</strong> lagi, 
                      dan akan berakhir pada tanggal <strong>{currentLkp.activeUntil}</strong>.
                    </p>
                  )}
                  <p>
                    Harap segera melakukan koordinasi dengan <strong>Super Administrator</strong> untuk perpanjangan lisensi agar operasional tata kelola lembaga dapat terus berjalan lancar tanpa kendala.
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setDismissedLicenseWarningLkpId(currentLkp.id)}
                    className={`font-semibold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-colors ${
                      isExpired 
                        ? 'bg-neutral-950 hover:bg-neutral-900 text-white' 
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    }`}
                  >
                    Saya Mengerti, Tutup
                  </button>
                </div>

              </div>
            </div>
          );
        })()}

      </main>

      {/* 3. Footer */}
      <footer className="bg-white border-t border-neutral-100 py-6 px-6 text-center text-xs text-neutral-400 no-print mt-12 shadow-3xs">
        <p>© 2026 Lembaga Kursus Smart Tata Kelola Kursus Inc. Mutu Terakreditasi 8 Standar Nasional Pendidikan (SNP).</p>
        <p className="text-[10px] mt-1 text-neutral-400 italic">Diselaraskan dengan rekomendasi asisten pendidikan bertenaga AI.</p>
      </footer>

      {/* CUSTOM GLOBAL ALERT POPUP (INTERCEPTS WINDOW.ALERT FOR IFRAME COMPATIBILITY) */}
      {globalAlert && (
        <div className="fixed inset-0 z-[9999] flex justify-center items-start overflow-y-auto p-4 bg-neutral-950/70 backdrop-blur-sm animate-fade-in text-left">
          <div className="absolute inset-0 min-h-screen" onClick={() => setGlobalAlert(null)} />
          <div className="relative bg-white rounded-3xl border border-neutral-100 shadow-2xl w-full max-w-sm overflow-hidden z-20 p-6 space-y-4 my-auto">
            
            <div className="flex items-center gap-3 pb-2.5 border-b border-neutral-100">
              <div className={`p-2.5 rounded-xl text-white ${
                globalAlert.type === 'warning' 
                  ? 'bg-amber-500' 
                  : globalAlert.type === 'success' 
                    ? 'bg-emerald-650' 
                    : 'bg-indigo-600'
              }`}>
                {globalAlert.type === 'warning' && <ShieldAlert className="w-5 h-5" />}
                {globalAlert.type === 'success' && <CheckCircle className="w-5 h-5" />}
                {globalAlert.type === 'info' && <BrainCircuit className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="font-extrabold text-neutral-900 text-sm tracking-tight uppercase">
                  {globalAlert.type === 'warning' && 'Peringatan'}
                  {globalAlert.type === 'success' && 'Berhasil'}
                  {globalAlert.type === 'info' && 'Informasi'}
                </h4>
                <p className="text-[9px] text-neutral-400 uppercase font-mono tracking-wider">
                  Sistem Tata Kelola Lembaga Kursus Smart
                </p>
              </div>
            </div>

            <div className="text-xs text-neutral-600 font-semibold leading-relaxed whitespace-pre-line">
              {globalAlert.message}
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setGlobalAlert(null)}
                className={`font-black text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-colors text-white shadow-xs ${
                  globalAlert.type === 'warning' 
                    ? 'bg-neutral-900 hover:bg-neutral-800' 
                    : globalAlert.type === 'success' 
                      ? 'bg-emerald-600 hover:bg-emerald-700' 
                      : 'bg-indigo-650 hover:bg-indigo-750'
                }`}
              >
                Dimengerti, Oke
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
