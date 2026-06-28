import React, { useState, useEffect, useRef } from 'react';
import { 
  Building, Users, FolderKanban, Calendar, Clock, ClipboardCheck, 
  MapPin, Landmark, BookOpen, Download, Upload, ShieldAlert, KeyRound,
  Percent, FileSpreadsheet, Sparkles, Loader2, Printer, Plus, Trash2, Eye, EyeOff, Save, Pencil, X,
  FileText, FileUp, Camera, Award, LayoutGrid, List, ChevronDown, ChevronUp, Home, Lock, Shield, Check
} from 'lucide-react';
import { Institution, Student, Program, Teacher, Facility, CalendarEvent, OrgNode, BudgetItem, JournalEntry, Voucher, SnpStandard, ScheduleItem } from '../types';
import { getDynamicSnpStandards } from '../utils/dummyData';

interface AdminModulesProps {
  lembaga: Institution;
  students: Student[];
  onUpdateLembaga: (updated: Institution) => void;
  activeModule?: string;
  setActiveModule?: (module: string) => void;
}

export default function AdminModules({ 
  lembaga, 
  students, 
  onUpdateLembaga,
  activeModule: propActiveModule,
  setActiveModule: propSetActiveModule
}: AdminModulesProps) {
  const [localActiveModule, setLocalActiveModule] = useState<string>('profil');
  const activeModule = propActiveModule || localActiveModule;
  const setActiveModule = propSetActiveModule || setLocalActiveModule;

  // Modular addition form states
  const [newProgram, setNewProgram] = useState<Partial<Program>>({ name: '', price: 0, regFee: 0, tuitionFee: 0, monthlyFee: 0, duration: '', description: '', status: 'Aktif' });
  const [newTeacher, setNewTeacher] = useState<Partial<Teacher>>({ name: '', specialty: '' });
  const [newFacility, setNewFacility] = useState<Partial<Facility>>({ name: '', quantity: 1, condition: 'Baik', location: '' });
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({ title: '', date: '', type: 'Akademik' });
  const [newNode, setNewNode] = useState<Partial<OrgNode>>({ name: '', role: '', parentId: '' });
  const [newBudget, setNewBudget] = useState<Partial<BudgetItem>>({ code: '', activity: '', volume: 1, unit: '', unitPrice: 0 });
  const [newJournal, setNewJournal] = useState<Partial<JournalEntry>>({ date: '', description: '', type: 'Debit', category: '', amount: 0 });
  const [newVoucher, setNewVoucher] = useState<Partial<Voucher>>({ code: '', discount: 0, type: 'Nominal', expiryDate: '', quota: 10 });
  const [newSchedule, setNewSchedule] = useState<any>({ programId: '', teacherId: '', day: 'Senin', time: '08:00 - 10:00', room: 'Lab A' });
  
  const [facilityViewMode, setFacilityViewMode] = useState<'grouped' | 'flat'>('grouped');
  const [expandedLocations, setExpandedLocations] = useState<Record<string, boolean>>({});
  const [emptyRooms, setEmptyRooms] = useState<string[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [showAddRoomInline, setShowAddRoomInline] = useState(false);
  
  const [snpAutoSync, setSnpAutoSync] = useState<boolean>(true);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  // Auto-sync SNP compliance whenever any dynamic data changes
  useEffect(() => {
    if (snpAutoSync) {
      const dynamicSnp = getDynamicSnpStandards(lembaga);
      const currentHash = JSON.stringify((lembaga.snpStandards || []).map(s => s.percentage));
      const dynamicHash = JSON.stringify(dynamicSnp.map(s => s.percentage));
      if (currentHash !== dynamicHash) {
        onUpdateLembaga({
          ...lembaga,
          snpStandards: dynamicSnp
        });
      }
    }
  }, [
    snpAutoSync,
    lembaga.students,
    lembaga.programs,
    lembaga.teachers,
    lembaga.schedule,
    lembaga.attendance,
    lembaga.facilities,
    lembaga.budget,
    lembaga.journal,
    lembaga.raportCards,
    lembaga.profile,
    lembaga.structure
  ]);
  
  // Auto-initialize staff credentials if empty when rendering Kredensial Akses
  useEffect(() => {
    if (activeModule === 'kredensial' && (!lembaga.staffCredentials || lembaga.staffCredentials.length === 0)) {
      const initialStaff = [
        {
          id: 'staff-1',
          name: 'Andi Saputra',
          username: 'admin@wanodya.lembaga',
          role: 'staf_admin' as const,
          active: true,
          password: 'password123'
        },
        {
          id: 'staff-2',
          name: 'Siti Rahma, A.Md',
          username: 'bendahara@wanodya.lembaga',
          role: 'bendahara' as const,
          active: true,
          password: 'password123'
        },
        ...(lembaga.teachers || []).map((t, idx) => ({
          id: `staff-teacher-${t.id}`,
          name: t.name,
          username: `${t.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@wanodya.lembaga`,
          role: 'pengajar' as const,
          active: true,
          password: 'password123'
        }))
      ];
      saveLembaga({ staffCredentials: initialStaff });
    }
  }, [activeModule, lembaga.staffCredentials, lembaga.teachers]);

  // States of items currently being edited
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [editProgramData, setEditProgramData] = useState<Partial<Program>>({});

  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [editTeacherName, setEditTeacherName] = useState('');
  const [editTeacherSpecialty, setEditTeacherSpecialty] = useState('');

  const [editingFacilityId, setEditingFacilityId] = useState<string | null>(null);
  const [editFacilityData, setEditFacilityData] = useState<Partial<Facility>>({});

  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editEventData, setEditEventData] = useState<Partial<CalendarEvent>>({});

  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editNodeData, setEditNodeData] = useState<Partial<OrgNode>>({});

  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [editBudgetData, setEditBudgetData] = useState<Partial<BudgetItem>>({});

  const [editingJournalId, setEditingJournalId] = useState<string | null>(null);
  const [editJournalData, setEditJournalData] = useState<Partial<JournalEntry>>({});

  const [editingVoucherId, setEditingVoucherId] = useState<string | null>(null);
  const [editVoucherData, setEditVoucherData] = useState<Partial<Voucher>>({});

  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [editScheduleData, setEditScheduleData] = useState<any>({});

  const [activeAddModal, setActiveAddModal] = useState<string | null>(null);
  const [activeFacilityPhotoPreview, setActiveFacilityPhotoPreview] = useState<string | null>(null);
  const [expandedNodeIds, setExpandedNodeIds] = useState<Record<string, boolean>>({});

  const toggleNodeExpansion = (id: string) => {
    setExpandedNodeIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getRoleTemplate = (role: string) => {
    const normalized = (role || '').toLowerCase();
    if (normalized.includes('direktur') || normalized.includes('pimpinan') || normalized.includes('kepala') || normalized.includes('owner') || normalized.includes('pemilik') || normalized.includes('ketua') || normalized.includes('ceo') || normalized.includes('rektor')) {
      return {
        rights: 'Mengambil keputusan-keputusan strategis kelembagaan secara mandiri, menyetujui rancangan alokasi anggaran pendapatan belanja (RAB), mewakili lembaga dalam penandatanganan kemitraan hukum eksternal, menetapkan sanksi staf, serta menandatangi sertifikat kelulusan ijazah siswa baru.',
        duties: 'Memimpin implementasi operasional Lembaga secara harian menyeluruh, mengawasi keterlayanan administrasi sesuai standar dinas pendidikan setempat, menetapkan visi misi lembaga, merangkul kerja tim, serta memimpin forum musyawarah berkala.'
      };
    }
    if (normalized.includes('sekretaris') || normalized.includes('admin') || normalized.includes('administrasi') || normalized.includes('tata usaha') || normalized.includes('tu') || normalized.includes('customer service') || normalized.includes('cs')) {
      return {
        rights: 'Mendata pendaftaran dan berkas administratif calon siswa di portal pangkalan data, memberikan verifikasi awal kesesuaian berkas registrasi, menyusun alur pengarsipan berkas dinas, serta mengoperasikan akun resmi platform SaaS Lembaga.',
        duties: 'Mengelola aktivitas persuratan reguler lembaga, menyusun kelengkapan berkas fisik/digital kelembagaan, melayani pendaftaran konsultasi langsung tatap muka siswa baru, menjadwalkan agenda rapat pimpinan, serta merangkum notulen rapat evaluasi.'
      };
    }
    if (normalized.includes('bendahara') || normalized.includes('keuangan') || normalized.includes('kasir') || normalized.includes('finance') || normalized.includes('akuntansi')) {
      return {
        rights: 'Menerima pembayaran SPP, cicilan uang gedung, dan registrasi pendaftaran siswa, menolak pengeluaran di luar keselarasan RAB operasional, serta mencairkan anggaran belanja taktis atas otorisasi pimpinan.',
        duties: 'Melakukan pencatatan pembukuan kas jurnal masuk dan keluar secara teliti, menyusun draf laporan kas periodik mingguan/bulanan, menangani penagihan tunggakan iuran, serta mengamankan kelancaran transaksi pembayaran transfer bank.'
      };
    }
    if (normalized.includes('instruktur') || normalized.includes('koordinator') || normalized.includes('pengajar') || normalized.includes('guru') || normalized.includes('tutor') || normalized.includes('dosen')) {
      return {
        rights: 'Menentukan metode pendekatan pengajaran yang interaktif dan sesuai target silabus, mengakses seluruh kelengkapan alat praktek di laboratorium computer/keterampilan, serta menerbitkan persentase nilai raport siswa.',
        duties: 'Menyampaikan pemaparan materi ajar secara ramah dan profesional, mengisi daftar lembar presensi mengajar dan kehadiran siswa, memberikan bimbingan konsultasi teknis pemecahan masalah materi, serta mengevaluasi tugas ujian berkala.'
      };
    }
    if (normalized.includes('humas') || normalized.includes('marketing') || normalized.includes('pemasaran') || normalized.includes('sales') || normalized.includes('promosi')) {
      return {
        rights: 'Menyusun naskah visual pamflet promosi program kursus di media sosial, merujuk target audiens pemasaran kelas baru, serta merintis MoU kemitraan awal dengan dinas/dunia industri.',
        duties: 'Menyebarluaskan info pendaftaran Lembaga kepada target khalayak sekolah, mengelola tanggapan admin di kolom komentar publik, menyelenggarakan kegiatan open house, serta menjembatani proses penyaluran kerja alumni.'
      };
    }
    if (normalized.includes('sarpras') || normalized.includes('logistik') || normalized.includes('sarana') || normalized.includes('umum') || normalized.includes('inventaris')) {
      return {
        rights: 'Menguji ketersediaan fisik alat laboratorium baru yang dikirimkan, mengusulkan pengadaan perbaikan ruang kelas yang rusak, serta mendistribusikan barang habis pakai untuk kebutuhan administrasi.',
        duties: 'Melakukan sensus pendataan inventaris sarana prasarana berkala, merawat kebersihan gedung dan ruang kelas praktik belajar, memeriksa stabilitas koneksi wifi internet & kelistrikan laboratorium, serta membantu instruktur merapikan alat pasca-praktek.'
      };
    }
    if (normalized.includes('kurikulum') || normalized.includes('akademik')) {
      return {
        rights: 'Menilai kualitas modul silabus ajar yang diantarkan instruktur pengajar, merevisi pembobotan ujian tengah/akhir kursus, serta mendesain kriteria standar kelulusan kompetensi minimal.',
        duties: 'Mengharmonisasikan kurikulum materi Lembaga dengan perkembangan dunia usaha industri terbaru, memetakan keselarasan kalender akademik gelombang belajar, serta menyelenggarakan penilaian ujian akhir berskala lokal.'
      };
    }
    return {
      rights: 'Mengakses sarana utilitas kantor pendukung pelaksanaan pekerjaan sehari-hari, mengajukan masukan kreatif penyempurnaan operasional, serta berkonsultasi mengenai hambatan teknis kerja bersama koordinator.',
      duties: 'Menuntaskan target penugasan kerja operasional dari pimpinan dengan tertib presisi, menjaga keamanan kerahasiaan dokumen organisasi, serta merawat kekompakan tim kerja Lembaga.'
    };
  };

  const autoFillAllEmptyNodeDetails = () => {
    let changed = false;
    const updated = lembaga.structure.map(n => {
      const rightsEmpty = !n.rights || n.rights.trim() === '';
      const dutiesEmpty = !n.duties || n.duties.trim() === '';
      if (rightsEmpty || dutiesEmpty) {
        changed = true;
        const template = getRoleTemplate(n.role);
        return {
          ...n,
          rights: rightsEmpty ? template.rights : n.rights,
          duties: dutiesEmpty ? template.duties : n.duties
        };
      }
      return n;
    });

    if (changed) {
      saveLembaga({ structure: updated });
      alert('✨ Berhasil mengisikan hak & kewajiban default profesional untuk semua jabatan yang kosong!');
    } else {
      alert('ℹ️ Seluruh jabatan saat ini sudah memiliki rincian Hak & Kewajiban yang lengkap.');
    }
  };

  const handleAIGenerateNodeDetails = async (
    role: string,
    name: string,
    isEdit: 'new' | 'edit' | 'info'
  ) => {
    if (!role.trim()) {
      alert('⚠️ Tuliskan Nama Jabatan terlebih dahulu agar AI dapat merekomendasikan hak & tugas pokok!');
      return;
    }

    if (isEdit === 'edit') {
      setAiEditNodeLoading(true);
    } else if (isEdit === 'info') {
      setAiInfoNodeLoading(true);
    } else {
      setAiNewNodeLoading(true);
    }

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'rights_duties',
          name: role,
          context: name || 'Pengurus Lembaga'
        })
      });

      if (!res.ok) {
        throw new Error('Gagal menghubungi asisten AI.');
      }

      const data = await res.json();
      if (data.result) {
        const parsed = JSON.parse(data.result);
        if (parsed.rights && parsed.duties) {
          if (isEdit === 'edit') {
            setEditNodeData(prev => ({
              ...prev,
              rights: parsed.rights,
              duties: parsed.duties
            }));
          } else if (isEdit === 'info') {
            setInfoNodeData(prev => ({
              ...prev,
              rights: parsed.rights,
              duties: parsed.duties
            }));
          } else {
            setNewNode(prev => ({
              ...prev,
              rights: parsed.rights,
              duties: parsed.duties
            }));
          }
        } else {
          throw new Error('Format respon AI tidak mengembalikan "rights" dan "duties".');
        }
      } else {
        throw new Error('Respon AI kosong.');
      }
    } catch (err: any) {
      console.error(err);
      alert('⚠️ Terjadi masalah saat memanggil asisten AI: ' + err.message);
    } finally {
      if (isEdit === 'edit') {
        setAiEditNodeLoading(false);
      } else if (isEdit === 'info') {
        setAiInfoNodeLoading(false);
      } else {
        setAiNewNodeLoading(false);
      }
    }
  };

  const renderOrgTreeNodes = (
    parentId: string | null,
    highlightId?: string,
    draftParentId?: string | null,
    draftNode?: { name: string; role: string }
  ): React.JSX.Element | null => {
    const actualChildren = lembaga.structure.filter(n => n.parentId === parentId);
    const draftInjected: any[] = [];
    if (draftNode && draftParentId === parentId) {
      draftInjected.push({
        id: 'draft_preview_node',
        name: draftNode.name || 'Nama Pengurus (Preview)',
        role: draftNode.role || 'Nama Jabatan (Preview)',
        parentId: parentId,
        isDraft: true
      });
    }

    const allChildren = [...actualChildren, ...draftInjected];

    if (allChildren.length === 0) return null;

    return (
      <div className="flex gap-6 mt-6 relative items-start justify-center">
        {allChildren.map((child) => {
          const isDraft = 'isDraft' in child;
          const nodeChildren = isDraft ? [] : lembaga.structure.filter(n => n.parentId === child.id);
          const hasChildren = nodeChildren.length > 0 || (draftNode && draftParentId === child.id);
          
          return (
            <div key={child.id} className="flex flex-col items-center relative">
              {/* Connector Top Line */}
              {parentId !== null && (
                <div className="absolute top-[-24px] left-1/2 -translate-x-1/2 w-[2px] h-[24px] bg-neutral-300"></div>
              )}
              
              {/* The Node Card */}
              <div 
                onClick={() => {
                  if (!isDraft) {
                    setInfoNode(child);
                    setInfoNodeData({ ...child });
                    setInfoNodeIsEditing(false);
                  }
                }}
                className={`rounded-xl p-3 shadow-xs text-center min-w-[130px] max-w-[180px] border transition-all ${
                  isDraft
                    ? 'bg-amber-50 border-dashed border-amber-400 text-amber-950 animate-pulse font-semibold'
                    : child.id === highlightId
                      ? 'bg-blue-600 text-white border-blue-700 font-bold scale-105 shadow-md cursor-pointer hover:scale-107'
                      : !child.parentId
                        ? 'bg-emerald-600 text-white border-emerald-700 font-bold cursor-pointer hover:scale-105 hover:bg-emerald-700 hover:shadow-md'
                        : 'bg-white text-neutral-800 border-neutral-200 cursor-pointer hover:scale-105 hover:border-emerald-500 hover:shadow-md'
                }`}
              >
                <p className="font-semibold text-xs truncate" title={child.name}>{child.name}</p>
                <p className={`text-[10px] truncate ${
                  isDraft
                    ? 'text-amber-700 font-medium'
                    : !child.parentId
                      ? 'text-emerald-100'
                      : child.id === highlightId
                        ? 'text-blue-100'
                        : 'text-neutral-500 font-semibold'
                }`} title={child.role}>
                  {child.role}
                </p>
                {(child.rights || child.duties) && (
                  <span className={`mt-1 block text-[7px] uppercase tracking-wider font-extrabold font-mono ${
                    child.id === highlightId ? 'text-blue-200' : 'text-emerald-600'
                  }`}>
                    • Detail Hak & Tugas
                  </span>
                )}
              </div>

              {/* Children connector and recursive call */}
              {hasChildren && (
                <div className="w-full flex flex-col items-center">
                  {/* Vertical Line down to horizontal split */}
                  <div className="w-[2px] h-[12px] bg-neutral-300"></div>
                  {renderOrgTreeNodes(child.id, highlightId, draftParentId, draftNode)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderCompleteOrgTree = (
    highlightId?: string,
    draftParentId?: string | null,
    draftNode?: { name: string; role: string }
  ) => {
    const roots = lembaga.structure.filter(n => !n.parentId);
    const draftInjectedRoots: any[] = [];
    if (draftNode && (draftParentId === null || draftParentId === undefined || draftParentId === '')) {
      draftInjectedRoots.push({
        id: 'draft_preview_node',
        name: draftNode.name || 'Nama Pengurus (Preview)',
        role: draftNode.role || 'Nama Jabatan (Preview)',
        parentId: null,
        isDraft: true
      });
    }

    const allRoots = [...roots, ...draftInjectedRoots];

    if (allRoots.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-xs text-neutral-400 italic font-mono">Belum ada data struktur organisasi.</p>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap justify-center gap-12 py-4">
        {allRoots.map(root => {
          const isDraft = 'isDraft' in root;
          const rootChildren = isDraft ? [] : lembaga.structure.filter(n => n.parentId === root.id);
          const hasChildren = rootChildren.length > 0 || (draftNode && draftParentId === root.id);

          return (
            <div key={root.id} className="flex flex-col items-center relative">
              <div 
                onClick={() => {
                  if (!isDraft) {
                    setInfoNode(root);
                    setInfoNodeData({ ...root });
                    setInfoNodeIsEditing(false);
                  }
                }}
                className={`rounded-xl p-3.5 shadow-sm text-center min-w-[140px] max-w-[200px] border transition-all ${
                  isDraft
                    ? 'bg-amber-50 border-dashed border-amber-400 text-amber-950 animate-pulse font-semibold'
                    : root.id === highlightId
                      ? 'bg-blue-600 text-white border-blue-700 font-bold scale-105 shadow-md cursor-pointer hover:scale-107'
                      : 'bg-emerald-600 text-white border-emerald-700 font-bold cursor-pointer hover:scale-105 hover:bg-emerald-700 hover:shadow-md'
                }`}
              >
                <p className="font-semibold text-sm truncate" title={root.name}>{root.name}</p>
                <p className={`text-[9px] uppercase tracking-wider font-extrabold ${isDraft ? 'text-amber-700' : root.id === highlightId ? 'text-blue-100' : 'text-emerald-100'}`} title={root.role}>
                  {root.role}
                </p>
                {(root.rights || root.duties) && (
                  <span className={`mt-1 block text-[7px] uppercase tracking-wider font-mono font-extrabold ${root.id === highlightId ? 'text-blue-200' : 'text-emerald-250'}`}>
                    • Detail Hak & Tugas
                  </span>
                )}
              </div>

              {hasChildren && (
                <div className="w-full flex flex-col items-center">
                  <div className="w-[2px] h-[12px] bg-neutral-300"></div>
                  {renderOrgTreeNodes(root.id, highlightId, draftParentId, draftNode)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Credentials edit states (Min 6 chars, invisible/visible toggle, 2-times verification)
  const [emailInput, setEmailInput] = useState(lembaga.email);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Staff Credentials management states
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [editStaffPassword, setEditStaffPassword] = useState('');
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffUsername, setNewStaffUsername] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'staf_admin' | 'pengajar' | 'bendahara'>('staf_admin');
  const [newStaffPassword, setNewStaffPassword] = useState('');

  // Attendance batch editing states
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Landing Page sub-tabs editing states
  const [activeProfileTab, setActiveProfileTab] = useState<'profil_utama' | 'sk_lembaga' | 'legalitas' | 'keunggulan' | 'faq'>('profil_utama');
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [isDraggingBanner, setIsDraggingBanner] = useState(false);

  // AI FAQ Generator States
  const [aiFaqTopic, setAiFaqTopic] = useState('Pendaftaran & Biaya');
  const [aiFaqCustomTopic, setAiFaqCustomTopic] = useState('');
  const [aiFaqLoading, setAiFaqLoading] = useState(false);
  const [aiGeneratedFaqs, setAiGeneratedFaqs] = useState<{ q: string; a: string; selected?: boolean }[]>([]);
  const [aiNewNodeLoading, setAiNewNodeLoading] = useState(false);
  const [aiEditNodeLoading, setAiEditNodeLoading] = useState(false);
  const [infoNode, setInfoNode] = useState<OrgNode | null>(null);
  const [infoNodeIsEditing, setInfoNodeIsEditing] = useState(false);
  const [infoNodeData, setInfoNodeData] = useState<Partial<OrgNode>>({});
  const [aiInfoNodeLoading, setAiInfoNodeLoading] = useState(false);

  // AI SK Generator States
  const [isSkGenModalOpen, setIsSkGenModalOpen] = useState(false);
  const [skGenTarget, setSkGenTarget] = useState<'new' | 'edit' | 'info'>('new');
  const [skGenType, setSkGenType] = useState<'pengangkatan' | 'penugasan'>('pengangkatan');
  const [skGenNumber, setSkGenNumber] = useState('');
  const [skGenDate, setSkGenDate] = useState('2026-06-21');
  const [generatedSkText, setGeneratedSkText] = useState('');
  const [isSkGenerating, setIsSkGenerating] = useState(false);
  const [skGenActiveTab, setSkGenActiveTab] = useState<'editor' | 'preview'>('editor');

  // AI Profile SK Generator States
  const [skLembagaActiveSubTab, setSkLembagaActiveSubTab] = useState<'profil_visi' | 'struktur'>('profil_visi');
  const [skProfilNumberInput, setSkProfilNumberInput] = useState('');
  const [skProfilDateInput, setSkProfilDateInput] = useState('');
  const [skProfilDraftText, setSkProfilDraftText] = useState('');
  const [isSkProfilGenerating, setIsSkProfilGenerating] = useState(false);
  const [isSkProfilEditing, setIsSkProfilEditing] = useState(false);

  // AI Struktur Organisasi SK Generator States
  const [skStrukturNumberInput, setSkStrukturNumberInput] = useState('');
  const [skStrukturDateInput, setSkStrukturDateInput] = useState('');
  const [skStrukturDraftText, setSkStrukturDraftText] = useState('');
  const [isSkStrukturGenerating, setIsSkStrukturGenerating] = useState(false);
  const [isSkStrukturEditing, setIsSkStrukturEditing] = useState(false);

  useEffect(() => {
    if (lembaga?.profile) {
      if (!skProfilNumberInput && lembaga.profile.skProfilNumber) {
        setSkProfilNumberInput(lembaga.profile.skProfilNumber);
      } else if (!skProfilNumberInput) {
        setSkProfilNumberInput(`01/SK-DIR/Lembaga-WN/${new Date().getFullYear()}`);
      }
      
      if (!skProfilDateInput && lembaga.profile.skProfilDate) {
        setSkProfilDateInput(lembaga.profile.skProfilDate);
      } else if (!skProfilDateInput) {
        setSkProfilDateInput(new Date().toISOString().split('T')[0]);
      }
      
      if (!skProfilDraftText && lembaga.profile.skProfilText) {
        setSkProfilDraftText(lembaga.profile.skProfilText);
      }

      // Initialize SK Struktur Organisasi States
      if (!skStrukturNumberInput && lembaga.profile.skStrukturNumber) {
        setSkStrukturNumberInput(lembaga.profile.skStrukturNumber);
      } else if (!skStrukturNumberInput) {
        setSkStrukturNumberInput(`02/SK-DIR/Lembaga-WN/${new Date().getFullYear()}`);
      }

      if (!skStrukturDateInput && lembaga.profile.skStrukturDate) {
        setSkStrukturDateInput(lembaga.profile.skStrukturDate);
      } else if (!skStrukturDateInput) {
        setSkStrukturDateInput(new Date().toISOString().split('T')[0]);
      }

      if (!skStrukturDraftText && lembaga.profile.skStrukturText) {
        setSkStrukturDraftText(lembaga.profile.skStrukturText);
      }
    }
  }, [lembaga?.profile]);

  // States for Document Preview / Print popup
  const [previewDoc, setPreviewDoc] = useState<{
    title: string;
    type: string;
    file: string;
    number: string;
    filename: string;
  } | null>(null);
  const [printOriginal, setPrintOriginal] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    label: string;
    onConfirm: () => void;
  } | null>(null);

  // Helper to convert base64 data to blob URL for sandbox-friendly preview and print
  const convertBase64ToBlobUrl = (dataURI: string): string => {
    if (!dataURI) return '';
    if (!dataURI.startsWith('data:')) {
      return dataURI;
    }
    try {
      const parts = dataURI.split(';base64,');
      if (parts.length < 2) return dataURI;
      const contentType = parts[0].split(':')[1];
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      const blob = new Blob([uInt8Array], { type: contentType });
      return URL.createObjectURL(blob);
    } catch (e) {
      console.error('Error generating blob URL:', e);
      return dataURI;
    }
  };

  const [blobPreviewUrl, setBlobPreviewUrl] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (previewDoc && previewDoc.file) {
      const url = convertBase64ToBlobUrl(previewDoc.file);
      setBlobPreviewUrl(url);
      return () => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      };
    } else {
      setBlobPreviewUrl('');
    }
  }, [previewDoc]);

  const printPreviewDocument = () => {
    if (!previewDoc) return;
    
    // Find pimpinan info for clean signature block
    const pimpNode = lembaga.structure.find(n => {
      const r = n.role.toLowerCase();
      return r.includes('direktur') || r.includes('pimpinan') || r.includes('kepala') || r.includes('owner') || r.includes('pemilik') || r.includes('ketua') || r.includes('ceo') || r.includes('rektor');
    });
    const pimpinanName = pimpNode?.name || 'Pimpinan Lembaga';
    const pimpinanRole = pimpNode?.role || 'Direktur Utama';

    // For SK Text or any text document
    if (previewDoc.type === 'sk_text' || !previewDoc.file.startsWith('data:')) {
      const textHtml = `
        <div style="font-family: 'Times New Roman', Times, serif; font-size: 14px; line-height: 1.8; color: #000; padding: 20px; text-align: justify; max-width: 800px; margin: 0 auto; white-space: pre-wrap;">
          ${previewDoc.file}
        </div>
      `;
      const fullHtml = `
        <html>
          <head>
            <title>${previewDoc.title}</title>
            <style>
              body { font-family: 'Times New Roman', serif; padding: 40px; color: #000; line-height: 1.8; }
              .header { text-align: center; border-bottom: 3.5px double #000; padding-bottom: 12px; margin-bottom: 30px; }
              .footer { text-align: right; margin-top: 50px; font-size: 14px; font-family: 'Times New Roman', serif; page-break-inside: avoid; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0; font-size: 21px; text-transform: uppercase;">${lembaga.name}</h1>
              <p style="margin: 4px 0 0 0; font-size: 11px;">${lembaga.profile.address} | Telp: ${lembaga.profile.phone}</p>
            </div>
            ${textHtml}
            <div class="footer">
              <p>Ditetapkan di: Yogyakarta</p>
              <p>Pada Tanggal: ${new Date().toLocaleDateString('id-ID')}</p>
              <p>Pimpinan ${lembaga.name},</p>
              <br/><br/><br/>
              <p><strong>${pimpinanName}</strong></p>
              <p style="margin: 0;">${pimpinanRole}</p>
            </div>
            <script>window.onload = function() { setTimeout(function() { window.print(); }, 400); }</script>
          </body>
        </html>
      `;
      printContentSecurely(previewDoc.title, fullHtml);
      return;
    }

    // For images
    if (previewDoc.file.startsWith('data:image/') || previewDoc.file.includes('image/')) {
      const fullHtml = `
        <html>
          <head>
            <title>${previewDoc.title}</title>
            <style>
              body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: #fff; }
              img { max-width: 100%; max-height: 100vh; object-fit: contain; }
              @media print {
                body, img { max-width: 100% !important; height: auto !important; }
              }
            </style>
          </head>
          <body>
            <img src="${blobPreviewUrl || previewDoc.file}" />
            <script>window.onload = function() { setTimeout(function() { window.print(); }, 400); }</script>
          </body>
        </html>
      `;
      printContentSecurely(previewDoc.title, fullHtml);
      return;
    }

    // Fallback for PDFs or other documents
    try {
      const w = window.open(blobPreviewUrl || previewDoc.file, '_blank');
      if (!w) {
        // If window.open is blocked, create hidden iframe and print it
        const frameId = "secure-print-pdf-frame";
        let printFrame = document.getElementById(frameId) as HTMLIFrameElement;
        if (printFrame) printFrame.remove();
        printFrame = document.createElement('iframe') as HTMLIFrameElement;
        printFrame.id = frameId;
        printFrame.style.position = "absolute";
        printFrame.style.top = "-100000px";
        printFrame.style.left = "-100000px";
        printFrame.style.width = "100%";
        printFrame.style.height = "100%";
        printFrame.src = blobPreviewUrl || previewDoc.file;
        document.body.appendChild(printFrame);
        setTimeout(() => {
          try {
            printFrame.contentWindow?.focus();
            printFrame.contentWindow?.print();
          } catch (pdfPrintErr) {
            console.error("PDF Print failed:", pdfPrintErr);
          }
        }, 1000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Helper to handle legal document file upload
  const handleDocFileUpload = (file: File, id: 'npsn' | 'skDisdik' | 'accreditation' | 'akta' | 'npwp') => {
    if (!file) return;

    if (file.size > 1.0 * 1024 * 1024) {
      alert('Mohon maaf, ukuran berkas dokumen legalitas yang Anda pilih melebihi batas maksimal 1 MB. Silakan unggah berkas yang lebih kecil agar penyimpanan berjalan lancar.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      if (base64Data) {
        const updatedProfile = { ...lembaga.profile };
        if (id === 'npsn') {
          updatedProfile.npsnFile = base64Data;
          updatedProfile.npsnFileName = file.name;
        } else if (id === 'skDisdik') {
          updatedProfile.skDisdikFile = base64Data;
          updatedProfile.skDisdikFileName = file.name;
        } else if (id === 'accreditation') {
          updatedProfile.accreditationFile = base64Data;
          updatedProfile.accreditationFileName = file.name;
        } else if (id === 'akta') {
          updatedProfile.aktaFile = base64Data;
          updatedProfile.aktaFileName = file.name;
        } else if (id === 'npwp') {
          updatedProfile.npwpFile = base64Data;
          updatedProfile.npwpFileName = file.name;
        }
        saveLembaga({ profile: updatedProfile });
      }
    };
    reader.readAsDataURL(file);
  };

  // Helper to remove legal document file
  const handleDocFileRemove = (id: 'npsn' | 'skDisdik' | 'accreditation' | 'akta' | 'npwp') => {
    const docLabels: Record<string, string> = {
      npsn: 'Nomor Pokok Sekolah Nasional (NPSN)',
      skDisdik: 'SK Izin Operasional Dinas Pendidikan',
      accreditation: 'Sertifikat Akreditasi Lembaga',
      akta: 'Akta Pendirian Lembaga',
      npwp: 'NPWP Lembaga Kursus'
    };
    setDeleteConfirm({
      label: docLabels[id] || 'Berkas Dokumen Legalitas',
      onConfirm: () => {
        const updatedProfile = { ...lembaga.profile };
        if (id === 'npsn') {
          updatedProfile.npsnFile = undefined;
          updatedProfile.npsnFileName = undefined;
        } else if (id === 'skDisdik') {
          updatedProfile.skDisdikFile = undefined;
          updatedProfile.skDisdikFileName = undefined;
        } else if (id === 'accreditation') {
          updatedProfile.accreditationFile = undefined;
          updatedProfile.accreditationFileName = undefined;
        } else if (id === 'akta') {
          updatedProfile.aktaFile = undefined;
          updatedProfile.aktaFileName = undefined;
        } else if (id === 'npwp') {
          updatedProfile.npwpFile = undefined;
          updatedProfile.npwpFileName = undefined;
        }
        saveLembaga({ profile: updatedProfile });
      }
    });
  };

  const handleHighlightFileUpload = (file: File, index: number) => {
    if (!file) return;

    if (file.size > 1.0 * 1024 * 1024) {
      alert('Mohon maaf, ukuran berkas bukti keunggulan melebihi batas maksimal 1 MB. Silakan pilih berkas yang lebih ringkas demi kenyamanan akses pengunjung website.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      if (base64Data) {
        const highlightsList = lembaga.profile.highlights || [
          { title: "Peralatan & Lab Modern", description: "Praktek intensif menggunakan fasilitas laboratorium komputer modern." },
          { title: "Sertifikat Resmi Kelulusan", description: "Setiap siswa memperoleh sertifikat kompetensi resmi terakreditasi." },
          { title: "Instruktur Profesional", description: "Diajar langsung oleh instruktur yang berpengalaman praktis dan bersertifikat." },
          { title: "Penyaluran Kerja", description: "Bekerja sama dengan berbagai instansi dunia industri dalam menyerap lulusan." },
        ];
        const nextHighlights = [...highlightsList];
        nextHighlights[index] = { 
          ...nextHighlights[index], 
          file: base64Data, 
          fileName: file.name 
        };
        saveLembaga({ profile: { ...lembaga.profile, highlights: nextHighlights } });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleHighlightFileRemove = (index: number) => {
    const highlightsList = lembaga.profile.highlights || [
      { title: "Peralatan & Lab Modern", description: "Praktek intensif menggunakan fasilitas laboratorium komputer modern." },
      { title: "Sertifikat Resmi Kelulusan", description: "Setiap siswa memperoleh sertifikat kompetensi resmi terakreditasi." },
      { title: "Instruktur Profesional", description: "Diajar langsung oleh instruktur yang berpengalaman praktis dan bersertifikat." },
      { title: "Penyaluran Kerja", description: "Bekerja sama dengan berbagai instansi dunia industri dalam menyerap lulusan." },
    ];
    setDeleteConfirm({
      label: `Berkas Pendukung Keunggulan "${highlightsList[index]?.title || ''}"`,
      onConfirm: () => {
        const nextHighlights = [...highlightsList];
        nextHighlights[index] = { 
          ...nextHighlights[index], 
          file: undefined, 
          fileName: undefined 
        };
        saveLembaga({ profile: { ...lembaga.profile, highlights: nextHighlights } });
      }
    });
  };

  const handleLogoFile = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('⚠️ Hanya berkas gambar yang didukung (PNG, JPG, JPEG, GIF, SVG, WEBP)!');
      return;
    }
    if (file.size > 1.0 * 1024 * 1024) {
      alert('Mohon maaf, ukuran logo lembaga Anda melebihi batas maksimal 1 MB. Silakan kompres atau perkecil resolusi gambar logo terlebih dahulu.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target?.result as string;
      if (base64Data) {
        saveLembaga({ profile: { ...lembaga.profile, logoUrl: base64Data } });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBannerFile = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('⚠️ Hanya berkas gambar yang didukung (PNG, JPG, JPEG, GIF, SVG, WEBP)!');
      return;
    }
    if (file.size > 1.0 * 1024 * 1024) {
      alert('Mohon maaf, ukuran berkas gambar banner melebihi batas maksimal 1 MB. Silakan optimalkan gambarnya terlebih dahulu agar pemuatan profil website Lembaga menjadi lebih cepat.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target?.result as string;
      if (base64Data) {
        saveLembaga({ profile: { ...lembaga.profile, bannerUrl: base64Data } });
      }
    };
    reader.readAsDataURL(file);
  };

  // Utility to handle updates back to main App.tsx
  const saveLembaga = (updatedFields: Partial<Institution>) => {
    onUpdateLembaga({
      ...lembaga,
      ...updatedFields
    });
  };

  // Helper additions
  const addProgram = () => {
    if (!newProgram.name) return alert('Lengkapi data program!');
    const regFee = Number(newProgram.regFee) || 0;
    const tuitionFee = Number(newProgram.tuitionFee) || 0;
    const monthlyFee = Number(newProgram.monthlyFee) || 0;
    const totalCost = regFee + tuitionFee + monthlyFee;
    
    if (totalCost <= 0) {
      return alert('Total biaya program harus lebih besar dari Rp 0!');
    }

    const add: Program = {
      id: 'p_' + Date.now(),
      name: newProgram.name,
      price: totalCost,
      regFee: regFee,
      tuitionFee: tuitionFee,
      monthlyFee: monthlyFee,
      duration: newProgram.duration || '1 Bulan',
      description: newProgram.description || '',
      status: 'Aktif'
    };
    saveLembaga({ programs: [...lembaga.programs, add] });
    setNewProgram({ name: '', price: 0, regFee: 0, tuitionFee: 0, monthlyFee: 0, duration: '', description: '', status: 'Aktif' });
    setActiveAddModal(null);
  };

  const removeProgram = (id: string) => {
    const item = lembaga.programs.find(p => p.id === id);
    setDeleteConfirm({
      label: item ? `Program Kursus "${item.name}"` : 'Program Kursus',
      onConfirm: () => {
        saveLembaga({ programs: lembaga.programs.filter(p => p.id !== id) });
      }
    });
  };

  const removeTeacher = (id: string) => {
    const item = lembaga.teachers.find(t => t.id === id);
    setDeleteConfirm({
      label: item ? `Instruktur "${item.name}"` : 'Instruktur',
      onConfirm: () => {
        saveLembaga({ teachers: lembaga.teachers.filter(t => t.id !== id) });
      }
    });
  };

  const removeFacility = (id: string) => {
    const item = lembaga.facilities.find(f => f.id === id);
    setDeleteConfirm({
      label: item ? `Sarana "${item.name}"` : 'Sarana / Inventaris',
      onConfirm: () => {
        saveLembaga({ facilities: lembaga.facilities.filter(f => f.id !== id) });
      }
    });
  };

  const removeEvent = (id: string) => {
    const item = lembaga.calendar.find(e => e.id === id);
    setDeleteConfirm({
      label: item ? `Agenda/Kegiatan "${item.title}"` : 'Agenda/Kegiatan',
      onConfirm: () => {
        saveLembaga({ calendar: lembaga.calendar.filter(e => e.id !== id) });
      }
    });
  };

  const removeOrgNode = (id: string) => {
    const item = lembaga.structure.find(n => n.id === id);
    setDeleteConfirm({
      label: item ? `Jabatan/Anggota "${item.name} (${item.role})"` : 'Anggota Struktur Organisasi',
      onConfirm: () => {
        saveLembaga({ structure: lembaga.structure.filter(n => n.id !== id) });
      }
    });
  };

  const removeBudget = (id: string) => {
    const item = lembaga.budget.find(b => b.id === id);
    setDeleteConfirm({
      label: item ? `Pos Anggaran Belanja "${item.activity}"` : 'Anggaran Belanja',
      onConfirm: () => {
        saveLembaga({ budget: lembaga.budget.filter(b => b.id !== id) });
      }
    });
  };

  const removeJournal = (id: string) => {
    const item = lembaga.journal.find(j => j.id === id);
    setDeleteConfirm({
      label: item ? `Catatan Transaksi "${item.description}"` : 'Transaksi Keuangan',
      onConfirm: () => {
        saveLembaga({ journal: lembaga.journal.filter(j => j.id !== id) });
      }
    });
  };

  const removeVoucher = (id: string) => {
    const item = lembaga.vouchers.find(v => v.id === id);
    setDeleteConfirm({
      label: item ? `Voucher Promo "${item.code}"` : 'Voucher/Promo',
      onConfirm: () => {
        saveLembaga({ vouchers: lembaga.vouchers.filter(v => v.id !== id) });
      }
    });
  };

  const removeSchedule = (id: string) => {
    const item = lembaga.schedule.find(s => s.id === id);
    const prog = item ? lembaga.programs.find(p => p.id === item.programId) : null;
    const teacher = item ? lembaga.teachers.find(t => t.id === item.teacherId) : null;
    const labelText = prog && teacher ? `Jadwal Kelas: ${prog.name} (${teacher.name} - ${item?.day || ''})` : 'Jadwal Jadwal';
    setDeleteConfirm({
      label: labelText,
      onConfirm: () => {
        saveLembaga({ schedule: lembaga.schedule.filter(s => s.id !== id) });
      }
    });
  };

  const addTeacher = () => {
    if (!newTeacher.name) return;
    const add: Teacher = { id: 't_' + Date.now(), name: newTeacher.name, specialty: newTeacher.specialty || 'Instruktur' };
    saveLembaga({ teachers: [...lembaga.teachers, add] });
    setNewTeacher({ name: '', specialty: '' });
    setActiveAddModal(null);
  };

  const addFacility = () => {
    if (!newFacility.name || !newFacility.quantity) return;
    const add: Facility = {
      id: 'f_' + Date.now(),
      name: newFacility.name,
      quantity: Number(newFacility.quantity),
      condition: (newFacility.condition as any) || 'Baik',
      location: newFacility.location || 'Ruang Kelas',
      photoUrl: newFacility.photoUrl,
      documentUrl: newFacility.documentUrl
    };
    saveLembaga({ facilities: [...lembaga.facilities, add] });
    setNewFacility({ name: '', quantity: 1, condition: 'Baik', location: '', photoUrl: '', documentUrl: '' });
    setActiveAddModal(null);
  };

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date) return;
    const add: CalendarEvent = {
      id: 'e_' + Date.now(),
      title: newEvent.title,
      date: newEvent.date,
      type: (newEvent.type as any) || 'Akademik'
    };
    saveLembaga({ calendar: [...lembaga.calendar, add] });
    setNewEvent({ title: '', date: '', type: 'Akademik' });
    setActiveAddModal(null);
  };

  const handleNodeFileUpload = (file: File, type: 'sk_pengangkatan' | 'sk_penugasan' | 'cert', isEdit: boolean) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target?.result as string;
      if (isEdit) {
        if (type === 'sk_pengangkatan') {
          setInfoNodeData(prev => ({ ...prev, skPengangkatanFile: base64Data, skPengangkatanFileName: file.name }));
        } else if (type === 'sk_penugasan') {
          setInfoNodeData(prev => ({ ...prev, skPenugasanFile: base64Data, skPenugasanFileName: file.name }));
        } else {
          setInfoNodeData(prev => ({ ...prev, certFile: base64Data, certFileName: file.name }));
        }
      } else {
        if (type === 'sk_pengangkatan') {
          setNewNode(prev => ({ ...prev, skPengangkatanFile: base64Data, skPengangkatanFileName: file.name }));
        } else if (type === 'sk_penugasan') {
          setNewNode(prev => ({ ...prev, skPenugasanFile: base64Data, skPenugasanFileName: file.name }));
        } else {
          setNewNode(prev => ({ ...prev, certFile: base64Data, certFileName: file.name }));
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleNodeFileRemove = (type: 'sk_pengangkatan' | 'sk_penugasan' | 'cert', isEdit: boolean) => {
    if (isEdit) {
      if (type === 'sk_pengangkatan') {
        setInfoNodeData(prev => ({ 
          ...prev, 
          skPengangkatanFile: undefined, 
          skPengangkatanFileName: undefined,
          skPengangkatanText: undefined,
          skFile: undefined,
          skFileName: undefined
        }));
      } else if (type === 'sk_penugasan') {
        setInfoNodeData(prev => ({ 
          ...prev, 
          skPenugasanFile: undefined, 
          skPenugasanFileName: undefined,
          skPenugasanText: undefined
        }));
      } else {
        setInfoNodeData(prev => ({ 
          ...prev, 
          certFile: undefined, 
          certFileName: undefined 
        }));
      }
    } else {
      if (type === 'sk_pengangkatan') {
        setNewNode(prev => ({ 
          ...prev, 
          skPengangkatanFile: undefined, 
          skPengangkatanFileName: undefined,
          skPengangkatanText: undefined 
        }));
      } else if (type === 'sk_penugasan') {
        setNewNode(prev => ({ 
          ...prev, 
          skPenugasanFile: undefined, 
          skPenugasanFileName: undefined,
          skPenugasanText: undefined
        }));
      } else {
        setNewNode(prev => ({ 
          ...prev, 
          certFile: undefined, 
          certFileName: undefined 
        }));
      }
    }
  };

  const addOrgNode = () => {
    if (!newNode.name || !newNode.role) return;
    const add: OrgNode = {
      id: 'st_' + Date.now(),
      name: newNode.name,
      role: newNode.role,
      parentId: newNode.parentId || null,
      rights: newNode.rights || '',
      duties: newNode.duties || '',
      skPengangkatanFile: newNode.skPengangkatanFile || undefined,
      skPengangkatanFileName: newNode.skPengangkatanFileName || undefined,
      skPenugasanFile: newNode.skPenugasanFile || undefined,
      skPenugasanFileName: newNode.skPenugasanFileName || undefined,
      certFile: newNode.certFile || undefined,
      certFileName: newNode.certFileName || undefined,
      skPengangkatanText: newNode.skPengangkatanText || undefined,
      skPenugasanText: newNode.skPenugasanText || undefined
    };
    saveLembaga({ structure: [...lembaga.structure, add] });
    setNewNode({ name: '', role: '', parentId: '', rights: '', duties: '', skPengangkatanFile: undefined, skPengangkatanFileName: undefined, skPenugasanFile: undefined, skPenugasanFileName: undefined, certFile: undefined, certFileName: undefined, skPengangkatanText: undefined, skPenugasanText: undefined });
    setActiveAddModal(null);
  };

  const getPimpinanInfo = () => {
    const pimpinanNode = lembaga.structure.find(n => {
      const r = (n.role || '').toLowerCase();
      return r.includes('direktur') || r.includes('pimpinan') || r.includes('kepala') || r.includes('owner') || r.includes('pemilik') || r.includes('ketua') || r.includes('ceo') || r.includes('rektor');
    });
    return {
      name: pimpinanNode?.name || 'Pimpinan Lembaga',
      role: pimpinanNode?.role || 'Direktur Utama'
    };
  };

  const autoApplySKText = (txt: string) => {
    const filename = skGenType === 'pengangkatan' ? 'SK_Pengangkatan_AI.pdf' : 'SK_Penugasan_AI.pdf';
    
    if (skGenTarget === 'new') {
      if (skGenType === 'pengangkatan') {
        setNewNode(prev => ({
          ...prev,
          skPengangkatanText: txt,
          skPengangkatanFileName: filename
        }));
      } else {
        setNewNode(prev => ({
          ...prev,
          skPenugasanText: txt,
          skPenugasanFileName: filename
        }));
      }
    } else if (skGenTarget === 'info') {
      if (skGenType === 'pengangkatan') {
        setInfoNodeData(prev => ({
          ...prev,
          skPengangkatanText: txt,
          skPengangkatanFileName: filename
        }));
        const updated = lembaga.structure.map(n => n.id === infoNode?.id ? {
          ...n,
          skPengangkatanText: txt,
          skPengangkatanFileName: filename
        } : n);
        saveLembaga({ structure: updated });
        if (infoNode) {
          setInfoNode({
            ...infoNode,
            skPengangkatanText: txt,
            skPengangkatanFileName: filename
          });
        }
      } else {
        setInfoNodeData(prev => ({
          ...prev,
          skPenugasanText: txt,
          skPenugasanFileName: filename
        }));
        const updated = lembaga.structure.map(n => n.id === infoNode?.id ? {
          ...n,
          skPenugasanText: txt,
          skPenugasanFileName: filename
        } : n);
        saveLembaga({ structure: updated });
        if (infoNode) {
          setInfoNode({
            ...infoNode,
            skPenugasanText: txt,
            skPenugasanFileName: filename
          });
        }
      }
    } else {
      if (skGenType === 'pengangkatan') {
        setEditNodeData(prev => ({
          ...prev,
          skPengangkatanText: txt,
          skPengangkatanFileName: filename
        }));
      } else {
        setEditNodeData(prev => ({
          ...prev,
          skPenugasanText: txt,
          skPenugasanFileName: filename
        }));
      }
    }
  };

  const generateLocalSKText = (
    name: string,
    role: string,
    type: 'pengangkatan' | 'penugasan',
    number: string,
    date: string,
    rights: string,
    duties: string
  ): string => {
    const formattedDate = new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const formattedRights = rights ? rights.split('\n').filter(Boolean).map(l => `  - ${l}`).join('\n') : '  - Melaksanakan kewenangan operasional jabatan secara terstruktur harian.\n  - Menentukan langkah strategis pembinaan tingkat divisi.';
    const formattedDuties = duties ? duties.split('\n').filter(Boolean).map(l => `  - ${l}`).join('\n') : '  - Menjaga integritas, visi & misi utama lembaga.\n  - Menyampaikan laporan bulanan kepada pimpinan tertinggi.';

    const pimpinan = getPimpinanInfo();
    const lembagaName = lembaga.name || 'Lembaga Pendidikan/Kursus';
    const address = lembaga.profile.address || 'Bekasi - Jawa Barat';
    const npsn = lembaga.profile.npsn ? `NPSN: ${lembaga.profile.npsn}` : 'NPSN: Belum Diisi';
    const skDisdik = lembaga.profile.skDisdik ? `Izin Operasional Disdik: ${lembaga.profile.skDisdik}` : 'Izin Operasional Dinas Pendidikan';
    const phone = lembaga.profile.phone ? ` | Telp: ${lembaga.profile.phone}` : '';
    const accState = lembaga.profile.accreditationRating ? ` | Akreditasi: ${lembaga.profile.accreditationRating}` : '';

    if (type === 'pengangkatan') {
      return `KOP SURAT RESMI
LEMBAGA KURSUS DAN PELATIHAN ${lembagaName.toUpperCase()}
${npsn} | ${skDisdik}${accState}
Alamat: ${address}${phone}

========================================================================
SURAT KEPUTUSAN PIMPINAN Lembaga ${lembagaName.toUpperCase()}
Nomor: ${number}

TENTANG
PENGANGKATAN PEGAWAI DALAM JABATAN STRUKTUR ORGANISASI
PADA ${lembagaName.toUpperCase()} TAHUN AJARAN ${new Date().getFullYear()}/${new Date().getFullYear() + 1}

Menimbang:
1. Bahwa demi kelancaran manajemen dan aktivitas administrasi serta koordinasi kerja yang tuntas, perlu ditetapkan kepengurusan fungsional lembaga.
2. Bahwa Saudara/i ${name || '[Nama Personel]'} dipandang cakap, memiliki rekam jejak loyalitas, kualifikasi serta integritas tinggi untuk mengemban tugas tersebut.
3. Bahwa yang bersangkutan telah menyatakan komitmennya dalam memajukan mutu akademis lembaga kursus.

Mengingat:
1. Undang-Undang Republik Indonesia Nomor 20 Tahun 2003 tentang Sistem Pendidikan Nasional.
2. Peraturan Pemerintah No. 17 Tahun 2010 tentang Pengelolaan dan Penyelenggaraan Pendidikan.
3. Anggaran Dasar & Anggaran Rumah Tangga (AD/ART) serta Rencana Mutu Pembelajaran Lembaga ${lembagaName}.

MEMUTUSKAN:

Menetapkan:
KESATU: Mengangkat secara resmi Saudara/i ${name || '[Nama Personel]'} dalam jabatan fungsional sebagai:
         👉 ${role || '[Nama Jabatan]'} 👈
KEDUA: Terhitung sejak ditandatanganinya keputusan ini, yang bersangkutan diberikan kekuasaan penuh serta hak-hak administratif sebagai berikut:
${formattedRights}
KETIGA: Atas ketetapan amanat tersebut, yang bersangkutan wajib mengemban tanggung jawab dan tugas pokok operasional harian:
${formattedDuties}
KEEMPAT: Surat Keputusan ini berlaku sejak tanggal ditetapkan, dan apabila dikemudian hari didapatkan kesalahan, keputusan ini akan diperbaiki sebagaimana mestinya secara mufakat.

Ditetapkan di: Bekasi
Pada Tanggal: ${formattedDate}

Pimpinan Lembaga ${lembagaName},



${pimpinan.name}
${pimpinan.role}`;
    } else {
      return `KOP SURAT RESMI
LEMBAGA Kursus dan Pelatihan ${lembagaName.toUpperCase()}
${npsn} | ${skDisdik}${accState}
Alamat: ${address}${phone}

========================================================================
SURAT KEPUTUSAN PENGANGKATAN PENUGASAN KERJA
Nomor: ${number}

TENTANG
PENUGASAN KERJA DAN INSTRUKTUR TIM PEMBINA AKADEMIS
PADA ${lembagaName.toUpperCase()} TAHUN AJARAN ${new Date().getFullYear()}/${new Date().getFullYear() + 1}

Menimbang:
1. Bahwa untuk menunjang rasio interaksi belajar-mengajar, standarisasi pembelajaran instruksional yang relevan, dipandang perlu menerbitkan SK Penugasan Kerja pengajaran.
2. Bahwa Saudara/i ${name || '[Nama Instruktur]'} dinilai menguasai bidang keilmuan yang diajarkan, memiliki sertifikasi kompetensi relevan, serta dedikasi pengajaran maksimal.

Mengingat:
1. Undang-Undang Republik Indonesia Nomor 20 Tahun 2003 tentang Sistem Pendidikan Nasional.
2. Standar Nasional Kependidikan (SNP) terkait Guru dan Tenaga Kependidikan Lembaga Pendidikan Non-Formal.
3. Silabus Kurikulum Kejuruan Terapan Lembaga ${lembagaName} yang Berorientasi Kebutuhan Industri Kerja.

MEMUTUSKAN:

Menetapkan:
KESATU: Memberikan amanah penugasan kerja instruksional mengajar kepada Saudara/i ${name || '[Nama Instruktur]'} sebagai berikut:
         👉 ${role || '[Nama Jabatan/Instruktur]'} 👈
KEDUA: Penugasan tersebut memberikan kewenangan pembelajaran kelas pendampingan terstruktur:
${formattedRights}
KETIGA: Mewajibkan yang bersangkutan untuk menyelesaikan tugas dan kewajiban mengajar harian secara profesional:
${formattedDuties}
KEEMPAT: Keputusan ini berlaku mengikat dari tanggal ditetapkan, dikerjakan penuh amanah untuk kemandirian lulusan siswa Lembaga ${lembagaName}.

Ditetapkan di: Bekasi
Pada Tanggal: ${formattedDate}

Pimpinan Lembaga ${lembagaName},



${pimpinan.name}
${pimpinan.role}`;
    }
  };

  const openSkGenerator = (target: 'new' | 'edit' | 'info', type: 'pengangkatan' | 'penugasan') => {
    setSkGenTarget(target);
    setSkGenType(type);
    setSkGenActiveTab('editor');
    
    const randomNo = Math.floor(100 + Math.random() * 900);
    const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    const curMonth = romanMonths[new Date().getMonth()];
    const curYear = new Date().getFullYear();
    const cleanLembagaInit = (lembaga.name || 'WN').split(' ').map(w => w[0]).join('').toUpperCase();
    const generatedNumber = `${randomNo}/SK-DIR/${cleanLembagaInit}/${curMonth}/${curYear}`;
    
    setSkGenNumber(generatedNumber);
    setSkGenDate(new Date().toISOString().split('T')[0]);

    let activeName = '';
    let activeRole = '';
    let activeRights = '';
    let activeDuties = '';

    if (target === 'new') {
      activeName = newNode.name || '';
      activeRole = newNode.role || '';
      activeRights = newNode.rights || '';
      activeDuties = newNode.duties || '';
    } else if (target === 'info') {
      activeName = infoNodeData.name || infoNode?.name || '';
      activeRole = infoNodeData.role || infoNode?.role || '';
      activeRights = infoNodeData.rights || infoNode?.rights || '';
      activeDuties = infoNodeData.duties || infoNode?.duties || '';
    } else {
      activeName = editNodeData.name || '';
      activeRole = editNodeData.role || '';
      activeRights = editNodeData.rights || '';
      activeDuties = editNodeData.duties || '';
    }

    let existingText = '';
    if (target === 'new') {
      existingText = type === 'pengangkatan' ? newNode.skPengangkatanText || '' : newNode.skPenugasanText || '';
    } else if (target === 'info') {
      existingText = type === 'pengangkatan' ? infoNode?.skPengangkatanText || '' : infoNode?.skPenugasanText || '';
    } else {
      existingText = type === 'pengangkatan' ? editNodeData.skPengangkatanText || '' : editNodeData.skPenugasanText || '';
    }

    if (existingText) {
      setGeneratedSkText(existingText);
    } else {
      const generated = generateLocalSKText(activeName, activeRole, type, generatedNumber, new Date().toISOString().split('T')[0], activeRights, activeDuties);
      setGeneratedSkText(generated);
      
      // Auto save initial draft to parent state
      const filename = type === 'pengangkatan' ? 'SK_Pengangkatan_AI.pdf' : 'SK_Penugasan_AI.pdf';
      if (target === 'new') {
        if (type === 'pengangkatan') {
          setNewNode(prev => ({ ...prev, skPengangkatanText: generated, skPengangkatanFileName: filename }));
        } else {
          setNewNode(prev => ({ ...prev, skPenugasanText: generated, skPenugasanFileName: filename }));
        }
      } else if (target === 'info') {
        const updated = lembaga.structure.map(n => n.id === infoNode?.id ? {
          ...n,
          [type === 'pengangkatan' ? 'skPengangkatanText' : 'skPenugasanText']: generated,
          [type === 'pengangkatan' ? 'skPengangkatanFileName' : 'skPenugasanFileName']: filename
        } : n);
        saveLembaga({ structure: updated });
        if (infoNode) {
          setInfoNode({
            ...infoNode,
            [type === 'pengangkatan' ? 'skPengangkatanText' : 'skPenugasanText']: generated,
            [type === 'pengangkatan' ? 'skPengangkatanFileName' : 'skPenugasanFileName']: filename
          });
        }
      } else {
        setEditNodeData(prev => ({
          ...prev,
          [type === 'pengangkatan' ? 'skPengangkatanText' : 'skPenugasanText']: generated,
          [type === 'pengangkatan' ? 'skPengangkatanFileName' : 'skPenugasanFileName']: filename
        }));
      }
    }

    setIsSkGenModalOpen(true);
  };

  const handleAIEnhanceSK = async () => {
    setIsSkGenerating(true);
    let activeName = '';
    let activeRole = '';
    let activeRights = '';
    let activeDuties = '';

    if (skGenTarget === 'new') {
      activeName = newNode.name || '';
      activeRole = newNode.role || '';
      activeRights = newNode.rights || '';
      activeDuties = newNode.duties || '';
    } else if (skGenTarget === 'info') {
      activeName = infoNodeData.name || infoNode?.name || '';
      activeRole = infoNodeData.role || infoNode?.role || '';
      activeRights = infoNodeData.rights || infoNode?.rights || '';
      activeDuties = infoNodeData.duties || infoNode?.duties || '';
    } else {
      activeName = editNodeData.name || '';
      activeRole = editNodeData.role || '';
      activeRights = editNodeData.rights || '';
      activeDuties = editNodeData.duties || '';
    }

    const pimpinan = getPimpinanInfo();
    const lembagaName = lembaga.name || 'Lembaga Pendidikan/Kursus';
    const address = lembaga.profile.address || 'Bekasi - Jawa Barat';
    const npsn = lembaga.profile.npsn || 'Belum Terisi';
    const skDisdik = lembaga.profile.skDisdik || 'Belum Terisi';
    const accreditationRating = lembaga.profile.accreditationRating || 'Belum Terakreditasi';
    const phone = lembaga.profile.phone || '-';
    const email = lembaga.profile.email || lembaga.email;

    try {
      const promptText = `Tuliskan Surat Keputusan Resmi (SK) untuk:
Lembaga Kursus: ${lembagaName}
Alamat: ${address}
NPSN: ${npsn}
Izin Operasional Dinas Pendidikan: ${skDisdik}
Akreditasi: ${accreditationRating}
Telepon: ${phone}
Email: ${email}

Tanda Tangan Pimpinan SK:
Nama Pimpinan: ${pimpinan.name}
Jabatan Pimpinan: ${pimpinan.role}

Tipe SK: ${skGenType === 'pengangkatan' ? 'SK Pengangkatan Jabatan' : 'SK Penugasan Kerja/Mengajar'}
Penerima Surat Keputusan:
Nama Personel: ${activeName || 'Pengurus Lembaga'}
Jabatan/Role: ${activeRole || 'Staf Operasional'}
Nomor SK: ${skGenNumber}
Tanggal SK: ${skGenDate}
Hak & Wewenang: ${activeRights || 'Melakukan tata kelola internal'}
Tugas & Tanggung Jawab: ${activeDuties || 'Melaksanakan operasional harian'}

Tuliskan dalam gaya bahasa hukum (legal draft) Indonesia asli yang sangat formal, rapi, memuat bagian KOP SURAT resmi untuk lembaga ${lembagaName}, TENTANG, MENIMBANG, MENGINGAT, MEMUTUSKAN, MENETAPKAN (KESATU, KEDUA, KETIGA, KEEMPAT) dan penutup tanda tangan oleh ${pimpinan.name} sebagai ${pimpinan.role}. Pastikan draft ini terlihat sangat profesional, presisi, proporsional dan siap cetak di kertas A4 hukum.`;

      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'sk',
          name: lembagaName,
          context: promptText
        })
      });

      if (!res.ok) throw new Error('Query gagal.');
      const data = await res.json();
      if (data.result) {
        setGeneratedSkText(data.result);
        autoApplySKText(data.result); // Auto-save newly enhanced AI SK text!
      } else {
        alert('Gagal mendapatkan respon dari AI.');
      }
    } catch (err) {
      console.error(err);
      alert('Gagal menghubungi AI. Menggunakan draft lokal berkualitas.');
    } finally {
      setIsSkGenerating(false);
    }
  };

  const handleApplyGeneratedSK = () => {
    const filename = skGenType === 'pengangkatan' ? 'SK_Pengangkatan_AI.pdf' : 'SK_Penugasan_AI.pdf';
    
    if (skGenTarget === 'new') {
      if (skGenType === 'pengangkatan') {
        setNewNode(prev => ({
          ...prev,
          skPengangkatanText: generatedSkText,
          skPengangkatanFileName: filename
        }));
      } else {
        setNewNode(prev => ({
          ...prev,
          skPenugasanText: generatedSkText,
          skPenugasanFileName: filename
        }));
      }
    } else if (skGenTarget === 'info') {
      if (skGenType === 'pengangkatan') {
        setInfoNodeData(prev => ({
          ...prev,
          skPengangkatanText: generatedSkText,
          skPengangkatanFileName: filename
        }));
        const updated = lembaga.structure.map(n => n.id === infoNode?.id ? {
          ...n,
          skPengangkatanText: generatedSkText,
          skPengangkatanFileName: filename
        } : n);
        saveLembaga({ structure: updated });
        if (infoNode) {
          setInfoNode({
            ...infoNode,
            skPengangkatanText: generatedSkText,
            skPengangkatanFileName: filename
          });
        }
      } else {
        setInfoNodeData(prev => ({
          ...prev,
          skPenugasanText: generatedSkText,
          skPenugasanFileName: filename
        }));
        const updated = lembaga.structure.map(n => n.id === infoNode?.id ? {
          ...n,
          skPenugasanText: generatedSkText,
          skPenugasanFileName: filename
        } : n);
        saveLembaga({ structure: updated });
        if (infoNode) {
          setInfoNode({
            ...infoNode,
            skPenugasanText: generatedSkText,
            skPenugasanFileName: filename
          });
        }
      }
    } else {
      if (skGenType === 'pengangkatan') {
        setEditNodeData(prev => ({
          ...prev,
          skPengangkatanText: generatedSkText,
          skPengangkatanFileName: filename
        }));
      } else {
        setEditNodeData(prev => ({
          ...prev,
          skPenugasanText: generatedSkText,
          skPenugasanFileName: filename
        }));
      }
    }
    setIsSkGenModalOpen(false);
  };

  const handleAIGenerateProfileSK = async () => {
    setIsSkProfilGenerating(true);
    const pimpinan = getPimpinanInfo();
    const lembagaName = lembaga.name || 'Lembaga Pendidikan/Kursus';
    const address = lembaga.profile.address || 'DIY Yogyakarta';
    const npsn = lembaga.profile.npsn || 'Belum Terisi';
    const skDisdik = lembaga.profile.skDisdik || 'Belum Terisi';
    const phone = lembaga.profile.phone || '-';
    const email = lembaga.profile.email || lembaga.email;
    const vision = lembaga.profile.vision || 'Menjadi lembaga yang berintegritas dan unggul.';
    const mission = lembaga.profile.mission || 'Melatih kemandirian dan keterampilan praktis.';

    const promptText = `Tuliskan Surat Keputusan Resmi (SK) Penetapan Profil, Logo, dan Visi Misi Lembaga untuk:
Lembaga Kursus: ${lembagaName}
Alamat: ${address}
NPSN: ${npsn}
Izin Operasional Dinas Pendidikan: ${skDisdik}
Telepon: ${phone}
Email: ${email}

Pimpinan/Director: ${pimpinan.name} (Jabatan: ${pimpinan.role})
Nomor SK: ${skProfilNumberInput}
Tanggal SK: ${skProfilDateInput}

Visi Lembaga: ${vision}
Misi Lembaga:
${mission}

Tuliskan dalam gaya bahasa hukum (legal draft) Indonesia asli yang sangat formal, rapi, memuat bagian KOP SURAT resmi untuk lembaga ${lembagaName}, TENTANG PENETAPAN PROFIL, LOGO, DAN VISI MISI LEMBAGA, MENIMBANG, MENGINGAT, MEMUTUSKAN, MENETAPKAN (KESATU, KEDUA, KETIGA, KEEMPAT) dan penutup tanda tangan oleh ${pimpinan.name} sebagai ${pimpinan.role}. 
Tambahkan juga bagian LAMPIRAN SURAT KEPUTUSAN di bawahnya yang merinci secara formal: LOGO RESMI LEMBAGA, VISI LEMBAGA, dan poin-poin MISI LEMBAGA yang baru ditetapkan, sehingga dokumen ini menjadi satu kesatuan draf hukum yang kokoh dan siap cetak di kertas A4 hukum.`;

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'sk',
          name: lembagaName,
          context: promptText
        })
      });

      if (!res.ok) throw new Error('Query gagal.');
      const data = await res.json();
      if (data.result) {
        setSkProfilDraftText(data.result);
        saveLembaga({
          profile: {
            ...lembaga.profile,
            skProfilText: data.result,
            skProfilNumber: skProfilNumberInput,
            skProfilDate: skProfilDateInput
          }
        });
      } else {
        alert('Gagal mendapatkan respon dari AI.');
      }
    } catch (err) {
      console.error(err);
      alert('Gagal menghubungi AI. Silakan gunakan draft standar atau coba beberapa saat lagi.');
    } finally {
      setIsSkProfilGenerating(false);
    }
  };

  const handlePrintProfileSK = () => {
    if (!skProfilDraftText) return;
    
    const pimpinanName = getPimpinanInfo().name;

    // Split the text into lines
    const rawLines = skProfilDraftText.split('\n');
    
    // Find where the document body actually starts (skip Kop Surat lines in the generated draft since we draw a beautiful native one)
    let startIndex = 0;
    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i].trim().toLowerCase();
      if (line.includes('surat keputusan') || line.includes('keputusan direktur') || line.includes('keputusan pimpinan') || line.includes('keputusan kepala')) {
        startIndex = i;
        break;
      }
    }

    const bodyLines = rawLines.slice(startIndex);

    // Process the text to recreate the beautiful printable layout
    const linesHTML = bodyLines.map((line, idx) => {
      let trimmed = line.trim();
      const upperTrimmed = trimmed.toUpperCase();
      
      // Remove horizontal dividers
      if (trimmed.match(/^[=\-*_#\s]{3,}$/)) {
        return '';
      }
      
      // Clean markdown heading symbols from the beginning
      trimmed = trimmed.replace(/^#+\s*/, '');
      
      // Clean emojis or strange markers
      trimmed = trimmed.replace(/👉|👈|⚠️|●|✨|🖨️/g, '');
      
      // Check for document title / metadata lines using clean string (strip spaces, asterisks, underscores)
      const cleanUpper = trimmed.replace(/[\*\s_#]/g, '').toUpperCase();
      const isDocTitle = cleanUpper.startsWith('SURATKEPUTUSAN') || 
                          cleanUpper.startsWith('KEPUTUSANDIREKTUR') ||
                          cleanUpper.startsWith('KEPUTUSANPIMPINAN') ||
                          cleanUpper.startsWith('KEPUTUSANKEPALA') ||
                          cleanUpper.startsWith('NOMOR') || 
                          cleanUpper.startsWith('N0MOR') || 
                          cleanUpper.includes('NOMOR:') ||
                          cleanUpper === 'TENTANG' || 
                          (idx < 5 && (cleanUpper.includes('PENETAPAN') || cleanUpper.includes('PROFIL') || cleanUpper.includes('VISIMISI') || cleanUpper.includes('VISIDANMISI') || cleanUpper.includes('KEPUTUSAN')));
      
      if (isDocTitle) {
        // Strip markdown bold and header markers from display
        let displayTitle = trimmed.replace(/^\*\*([\s\S]+)\*\*$/, '$1')
                                  .replace(/^\*([\s\S]+)\*$/, '$1')
                                  .replace(/^#+\s*/, '')
                                  .trim();
        // Also ensure any remaining ** inside is clean
        displayTitle = displayTitle.replace(/\*\*([^*]+)\*\*/g, '$1');
        
        return `
          <div style="text-align: center; font-weight: bold; font-family: 'Arial', sans-serif; font-size: ${displayTitle.toLowerCase().includes('surat keputusan') || displayTitle.toLowerCase().includes('keputusan') ? '14px' : '11.5px'}; margin: 6px 0; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.4;">
            ${displayTitle}
          </div>
        `;
      }
      
      // Major sections
      const isHeader = cleanUpper.startsWith('MENIMBANG') || 
                       cleanUpper.startsWith('MENGINGAT') || 
                       cleanUpper.startsWith('MEMUTUSKAN') || 
                       cleanUpper.startsWith('MENETAPKAN');
                       
      if (isHeader) {
        // Strip markdown bold and other markers from header title
        let displayHeader = trimmed.replace(/^\*\*([\s\S]+)\*\*$/, '$1')
                                   .replace(/^\*([\s\S]+)\*$/, '$1')
                                   .replace(/^#+\s*/, '')
                                   .trim();
        // Also remove any inner bolding or trailing colons for elegance
        displayHeader = displayHeader.replace(/\*\*([^*]+)\*\*/g, '$1');
        
        return `
          <div style="font-weight: bold; font-family: 'Arial', sans-serif; font-size: 11.5px; margin-top: 18px; margin-bottom: 6px; text-transform: uppercase; border-bottom: 1.5px solid #000000; padding-bottom: 2px; width: fit-content;">
            ${displayHeader}
          </div>
        `;
      }
      
      // Check for Lampiran (Attachment) / Page Break
      if (upperTrimmed.includes('LAMPIRAN') || upperTrimmed.startsWith('LAMPIRAN') || trimmed.toLowerCase().startsWith('lampiran')) {
        let logoHTML = '';
        if (lembaga.profile.logoUrl) {
          logoHTML = `
            <div style="text-align: center; margin: 20px 0;">
              <p style="font-size: 10px; font-weight: bold; color: #475569; font-family: sans-serif; margin-bottom: 5px;">LOGO RESMI LEMBAGA:</p>
              <img src="${lembaga.profile.logoUrl}" style="max-height: 90px; max-width: 180px; object-fit: contain; margin: 0 auto; display: block;" />
            </div>
          `;
        }
        return `
          <div style="page-break-before: always; border-top: 2px dashed #000000; padding-top: 20px; margin-top: 35px; text-align: center; font-weight: bold; font-size: 13px; font-family: 'Arial', sans-serif; text-transform: uppercase;">
            ${trimmed}
          </div>
          ${logoHTML}
        `;
      }
      
      // Signature Block at the end
      const totalLines = bodyLines.length;
      const isPimpinanMatch = pimpinanName && trimmed.includes(pimpinanName);
      const isSignLine = idx >= totalLines - 10 && (
        trimmed.startsWith('Ditetapkan') || 
        trimmed.startsWith('Pada Tanggal') || 
        trimmed.startsWith('Pada tanggal') || 
        trimmed.startsWith('Pimpinan') || 
        isPimpinanMatch || 
        trimmed.includes('Direktur') || 
        trimmed.includes('Kepala') || 
        trimmed.includes('S.Pd.')
      );
      
      if (isSignLine) {
        const isSignee = trimmed.includes('S.Pd.') || isPimpinanMatch || trimmed.includes('Direktur') || trimmed.includes('Kepala') || trimmed.includes('Pimpinan');
        return `
          <div style="width: 280px; margin-left: auto; text-align: left; font-family: 'Arial', sans-serif; font-size: 11.5px; padding-left: 15px; margin-top: ${isSignee ? '55px; font-weight: bold; text-decoration: underline;' : '3px;'}; line-height: 1.4;">
            ${trimmed}
          </div>
        `;
      }
      
      // Clean up leading bullet list indicators
      let cleanText = trimmed.replace(/^[\s\-\*•]+\s*/, '');
      
      // Strip starting asterisks for regex matching
      const matchText = cleanText.replace(/^\*\*+/, '').trim();
      
      // Convert markdown bold/italic inside cleanText to HTML
      cleanText = cleanText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      cleanText = cleanText.replace(/_([^_]+)_/g, '<em>$1</em>');
      
      // Format numbered/capitalized legal clauses beautifully with indented look
      const isNumberedOrCapitalPoint = matchText.match(/^(KESATU|KEDUA|KETIGA|KEEMPAT|KELIMA|KEENAM|KETUJUH|KEDELAPAN|Pertama|Kedua|Ketiga|Keempat|Kelima|Keenam|Ketujuh|Kedelapan|[0-9]+\.|\-[a-zA-Z]\.)/);
      if (isNumberedOrCapitalPoint) {
        return `
          <p style="text-align: justify; font-size: 11.5px; margin: 6px 0; line-height: 1.6; font-family: 'Times New Roman', serif; padding-left: 20px; text-indent: -20px;">
            ${cleanText}
          </p>
        `;
      }
      
      // Standard paragraph line
      return `
        <p style="text-align: justify; font-size: 11.5px; margin: 4px 0; line-height: 1.6; font-family: 'Times New Roman', serif;">
          ${cleanText}
        </p>
      `;
    }).filter(p => p !== '').join('');

    // Prepend a stunning professional Indonesian Kop Surat header
    const kopSuratHTML = `
      <div style="text-align: center; font-family: 'Arial', 'Helvetica', sans-serif; border-bottom: 3px double #000000; padding-bottom: 10px; margin-bottom: 25px;">
        ${lembaga.profile.logoUrl ? `
          <div style="float: left; width: 85px; height: 85px; margin-right: -85px;">
            <img src="${lembaga.profile.logoUrl}" style="max-height: 85px; max-width: 85px; object-fit: contain;" />
          </div>
        ` : ''}
        <div style="${lembaga.profile.logoUrl ? 'padding-left: 95px; padding-right: 15px;' : ''}">
          <div style="font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.2;">
            ${lembaga.name.toUpperCase()}
          </div>
          <div style="font-size: 13px; font-weight: 700; text-transform: uppercase; color: #1e293b; margin-top: 3px;">
            LEMBAGA KURSUS DAN PELATIHAN
          </div>
          <div style="font-size: 10.5px; color: #334155; margin-top: 5px; line-height: 1.4;">
            ${lembaga.profile.address ? `Alamat: ${lembaga.profile.address}` : ''}
            ${lembaga.profile.phone ? ` | Telp: ${lembaga.profile.phone}` : ''}
            ${(lembaga.profile.email || lembaga.email) ? ` | Email: ${lembaga.profile.email || lembaga.email}` : ''}
          </div>
          <div style="font-size: 10px; font-weight: 600; color: #475569; margin-top: 2px;">
            ${lembaga.profile.npsn ? `NPSN: ${lembaga.profile.npsn}` : ''}
            ${lembaga.profile.skDisdik ? ` | Izin Operasional: ${lembaga.profile.skDisdik}` : ''}
          </div>
        </div>
        <div style="clear: both;"></div>
      </div>
    `;

    const fullHtml = `
      <html>
        <head>
          <title>SK_PENETAPAN_PROFIL_VISI_MISI_${lembaga.name.toUpperCase()}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
            body { 
              font-family: 'Times New Roman', serif; 
              padding: 40px 60px; 
              color: #000000; 
              line-height: 1.5; 
              background-color: #ffffff;
              max-width: 21cm;
              margin: 0 auto;
            }
            @media print {
              body { padding: 25px 40px; }
            }
          </style>
        </head>
        <body>
          <div style="padding: 10px; position: relative; min-height: 29.7cm; box-sizing: border-box;">
            ${kopSuratHTML}
            ${linesHTML}
          </div>
        </body>
      </html>
    `;
    
    printContentSecurely('SK_PENETAPAN_PROFIL_VISI_MISI_' + lembaga.name.toUpperCase(), fullHtml);
  };

  const handleAIGenerateStrukturSK = async () => {
    setIsSkStrukturGenerating(true);
    const pimpinan = getPimpinanInfo();
    const lembagaName = lembaga.name || 'Lembaga Pendidikan/Kursus';
    const address = lembaga.profile.address || 'DIY Yogyakarta';
    const npsn = lembaga.profile.npsn || 'Belum Terisi';
    const skDisdik = lembaga.profile.skDisdik || 'Belum Terisi';
    const phone = lembaga.profile.phone || '-';
    const email = lembaga.profile.email || lembaga.email;
    
    const structureListText = lembaga.structure.length > 0 
      ? lembaga.structure.map((node, i) => `${i + 1}. Jabatan: ${node.role} - Pejabat: ${node.name}`).join('\n')
      : '(Belum ada data struktur organisasi. Mohon tambahkan pengurus di tab Struktur Organisasi terlebih dahulu)';

    const promptText = `Tuliskan Surat Keputusan Resmi (SK) Penetapan Struktur Organisasi dan Susunan Pengurus Lembaga untuk:
Lembaga Kursus: ${lembagaName}
Alamat: ${address}
NPSN: ${npsn}
Izin Operasional Dinas Pendidikan: ${skDisdik}
Telepon: ${phone}
Email: ${email}

Pimpinan/Director: ${pimpinan.name} (Jabatan: ${pimpinan.role})
Nomor SK: ${skStrukturNumberInput}
Tanggal SK: ${skStrukturDateInput}

Daftar Struktur Pengurus yang ditetapkan:
${structureListText}

Tuliskan dalam gaya bahasa hukum (legal draft) Indonesia asli yang sangat formal, rapi, memuat bagian KOP SURAT resmi untuk lembaga ${lembagaName}, TENTANG PENETAPAN STRUKTUR ORGANISASI DAN SUSUNAN PENGURUS LEMBAGA, MENIMBANG, MENGINGAT, MEMUTUSKAN, MENETAPKAN (KESATU, KEDUA, KETIGA, KEEMPAT) dan penutup tanda tangan oleh ${pimpinan.name} sebagai ${pimpinan.role}. 
Tambahkan juga bagian LAMPIRAN SURAT KEPUTUSAN di bawahnya yang merinci secara formal tabel atau daftar Susunan Pengurus yang baru ditetapkan beserta uraian tugas pokok (Tupoksi) mereka secara komprehensif, sehingga dokumen ini menjadi satu kesatuan draf hukum yang kokoh dan siap cetak di kertas A4 hukum.`;

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'sk',
          name: lembagaName,
          context: promptText
        })
      });

      if (!res.ok) throw new Error('Query gagal.');
      const data = await res.json();
      if (data.result) {
        setSkStrukturDraftText(data.result);
        saveLembaga({
          profile: {
            ...lembaga.profile,
            skStrukturText: data.result,
            skStrukturNumber: skStrukturNumberInput,
            skStrukturDate: skStrukturDateInput
          }
        });
      } else {
        alert('Gagal mendapatkan respon dari AI.');
      }
    } catch (err) {
      console.error(err);
      alert('Gagal menghubungi AI. Silakan gunakan draf standar atau coba beberapa saat lagi.');
    } finally {
      setIsSkStrukturGenerating(false);
    }
  };

  const handlePrintStrukturSK = () => {
    if (!skStrukturDraftText) return;
    
    const pimpinanName = getPimpinanInfo().name;

    // Split the text into lines
    const rawLines = skStrukturDraftText.split('\n');
    
    // Find where the document body actually starts
    let startIndex = 0;
    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i].trim().toLowerCase();
      if (line.includes('surat keputusan') || line.includes('keputusan direktur') || line.includes('keputusan pimpinan') || line.includes('keputusan kepala')) {
        startIndex = i;
        break;
      }
    }

    const bodyLines = rawLines.slice(startIndex);

    // Process the text to recreate the beautiful printable layout
    const linesHTML = bodyLines.map((line, idx) => {
      let trimmed = line.trim();
      const upperTrimmed = trimmed.toUpperCase();
      
      // Remove horizontal dividers
      if (trimmed.match(/^[=\-*_#\s]{3,}$/)) {
        return '';
      }
      
      // Clean markdown heading symbols from the beginning
      trimmed = trimmed.replace(/^#+\s*/, '');
      
      // Clean emojis or strange markers
      trimmed = trimmed.replace(/👉|👈|⚠️|●|✨|🖨️/g, '');
      
      // Check for document title / metadata lines using clean string
      const cleanUpper = trimmed.replace(/[\*\s_#]/g, '').toUpperCase();
      const isDocTitle = cleanUpper.startsWith('SURATKEPUTUSAN') || 
                          cleanUpper.startsWith('KEPUTUSANDIREKTUR') ||
                          cleanUpper.startsWith('KEPUTUSANPIMPINAN') ||
                          cleanUpper.startsWith('KEPUTUSANKEPALA') ||
                          cleanUpper.startsWith('NOMOR') || 
                          cleanUpper.startsWith('N0MOR') || 
                          cleanUpper.includes('NOMOR:') ||
                          cleanUpper === 'TENTANG' || 
                          (idx < 5 && (cleanUpper.includes('PENETAPAN') || cleanUpper.includes('STRUKTUR') || cleanUpper.includes('ORGANISASI') || cleanUpper.includes('SUSUNAN') || cleanUpper.includes('PENGURUS') || cleanUpper.includes('KEPUTUSAN')));
      
      if (isDocTitle) {
        // Strip markdown bold and header markers from display
        let displayTitle = trimmed.replace(/^\*\*([\s\S]+)\*\*$/, '$1')
                                  .replace(/^\*([\s\S]+)\*$/, '$1')
                                  .replace(/^#+\s*/, '')
                                  .trim();
        // Also ensure any remaining ** inside is clean
        displayTitle = displayTitle.replace(/\*\*([^*]+)\*\*/g, '$1');
        
        return `
          <div style="text-align: center; font-weight: bold; font-family: 'Arial', sans-serif; font-size: ${displayTitle.toLowerCase().includes('surat keputusan') || displayTitle.toLowerCase().includes('keputusan') ? '14px' : '11.5px'}; margin: 6px 0; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.4;">
            ${displayTitle}
          </div>
        `;
      }
      
      // Major sections
      const isHeader = cleanUpper.startsWith('MENIMBANG') || 
                       cleanUpper.startsWith('MENGINGAT') || 
                       cleanUpper.startsWith('MEMUTUSKAN') || 
                       cleanUpper.startsWith('MENETAPKAN');
                       
      if (isHeader) {
        // Strip markdown bold and other markers from header title
        let displayHeader = trimmed.replace(/^\*\*([\s\S]+)\*\*$/, '$1')
                                   .replace(/^\*([\s\S]+)\*$/, '$1')
                                   .replace(/^#+\s*/, '')
                                   .trim();
        // Also remove any inner bolding or trailing colons for elegance
        displayHeader = displayHeader.replace(/\*\*([^*]+)\*\*/g, '$1');
        
        return `
          <div style="font-weight: bold; font-family: 'Arial', sans-serif; font-size: 11.5px; margin-top: 18px; margin-bottom: 6px; text-transform: uppercase; border-bottom: 1.5px solid #000000; padding-bottom: 2px; width: fit-content;">
            ${displayHeader}
          </div>
        `;
      }
      
      // Check for Lampiran (Attachment) / Page Break
      if (upperTrimmed.includes('LAMPIRAN') || upperTrimmed.startsWith('LAMPIRAN') || trimmed.toLowerCase().startsWith('lampiran')) {
        let logoHTML = '';
        if (lembaga.profile.logoUrl) {
          logoHTML = `
            <div style="text-align: center; margin: 20px 0;">
              <p style="font-size: 10px; font-weight: bold; color: #475569; font-family: sans-serif; margin-bottom: 5px;">LOGO RESMI LEMBAGA:</p>
              <img src="${lembaga.profile.logoUrl}" style="max-height: 90px; max-width: 180px; object-fit: contain; margin: 0 auto; display: block;" />
            </div>
          `;
        }
        return `
          <div style="page-break-before: always; border-top: 2px dashed #000000; padding-top: 20px; margin-top: 35px; text-align: center; font-weight: bold; font-size: 13px; font-family: 'Arial', sans-serif; text-transform: uppercase;">
            ${trimmed}
          </div>
          ${logoHTML}
        `;
      }
      
      // Signature Block at the end
      const totalLines = bodyLines.length;
      const isPimpinanMatch = pimpinanName && trimmed.includes(pimpinanName);
      const isSignLine = idx >= totalLines - 10 && (
        trimmed.startsWith('Ditetapkan') || 
        trimmed.startsWith('Pada Tanggal') || 
        trimmed.startsWith('Pada tanggal') || 
        trimmed.startsWith('Pimpinan') || 
        isPimpinanMatch || 
        trimmed.includes('Direktur') || 
        trimmed.includes('Kepala') || 
        trimmed.includes('S.Pd.')
      );
      
      if (isSignLine) {
        const isSignee = trimmed.includes('S.Pd.') || isPimpinanMatch || trimmed.includes('Direktur') || trimmed.includes('Kepala') || trimmed.includes('Pimpinan');
        return `
          <div style="width: 280px; margin-left: auto; text-align: left; font-family: 'Arial', sans-serif; font-size: 11.5px; padding-left: 15px; margin-top: ${isSignee ? '55px; font-weight: bold; text-decoration: underline;' : '3px;'}; line-height: 1.4;">
            ${trimmed}
          </div>
        `;
      }
      
      // Clean up leading bullet list indicators
      let cleanText = trimmed.replace(/^[\s\-\*•]+\s*/, '');
      
      // Strip starting asterisks for regex matching
      const matchText = cleanText.replace(/^\*\*+/, '').trim();
      
      // Convert markdown bold/italic inside cleanText to HTML
      cleanText = cleanText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      cleanText = cleanText.replace(/_([^_]+)_/g, '<em>$1</em>');
      
      // Format numbered/capitalized legal clauses beautifully with indented look
      const isNumberedOrCapitalPoint = matchText.match(/^(KESATU|KEDUA|KETIGA|KEEMPAT|KELIMA|KEENAM|KETUJUH|KEDELAPAN|Pertama|Kedua|Ketiga|Keempat|Kelima|Keenam|Ketujuh|Kedelapan|[0-9]+\.|\-[a-zA-Z]\.)/);
      if (isNumberedOrCapitalPoint) {
        return `
          <p style="text-align: justify; font-size: 11.5px; margin: 6px 0; line-height: 1.6; font-family: 'Times New Roman', serif; padding-left: 20px; text-indent: -20px;">
            ${cleanText}
          </p>
        `;
      }
      
      // Standard paragraph line
      return `
        <p style="text-align: justify; font-size: 11.5px; margin: 4px 0; line-height: 1.6; font-family: 'Times New Roman', serif;">
          ${cleanText}
        </p>
      `;
    }).filter(p => p !== '').join('');

    // Prepend Indonesian Kop Surat header
    const kopSuratHTML = `
      <div style="text-align: center; font-family: 'Arial', 'Helvetica', sans-serif; border-bottom: 3px double #000000; padding-bottom: 10px; margin-bottom: 25px;">
        ${lembaga.profile.logoUrl ? `
          <div style="float: left; width: 85px; height: 85px; margin-right: -85px;">
            <img src="${lembaga.profile.logoUrl}" style="max-height: 85px; max-width: 85px; object-fit: contain;" />
          </div>
        ` : ''}
        <div style="${lembaga.profile.logoUrl ? 'padding-left: 95px; padding-right: 15px;' : ''}">
          <div style="font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.2;">
            ${lembaga.name.toUpperCase()}
          </div>
          <div style="font-size: 13px; font-weight: 700; text-transform: uppercase; color: #1e293b; margin-top: 3px;">
            LEMBAGA KURSUS DAN PELATIHAN
          </div>
          <div style="font-size: 10.5px; color: #334155; margin-top: 5px; line-height: 1.4;">
            ${lembaga.profile.address ? `Alamat: ${lembaga.profile.address}` : ''}
            ${lembaga.profile.phone ? ` | Telp: ${lembaga.profile.phone}` : ''}
            ${(lembaga.profile.email || lembaga.email) ? ` | Email: ${lembaga.profile.email || lembaga.email}` : ''}
          </div>
          <div style="font-size: 10px; font-weight: 600; color: #475569; margin-top: 2px;">
            ${lembaga.profile.npsn ? `NPSN: ${lembaga.profile.npsn}` : ''}
            ${lembaga.profile.skDisdik ? ` | Izin Operasional: ${lembaga.profile.skDisdik}` : ''}
          </div>
        </div>
        <div style="clear: both;"></div>
      </div>
    `;

    const fullHtml = `
      <html>
        <head>
          <title>SK_STRUKTUR_ORGANISASI_${lembaga.name.toUpperCase()}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
            body { 
              font-family: 'Times New Roman', serif; 
              padding: 40px 60px; 
              color: #000000; 
              line-height: 1.5; 
              background-color: #ffffff;
              max-width: 21cm;
              margin: 0 auto;
            }
            @media print {
              body { padding: 25px 40px; }
            }
          </style>
        </head>
        <body>
          <div style="padding: 10px; position: relative; min-height: 29.7cm; box-sizing: border-box;">
            ${kopSuratHTML}
            ${linesHTML}
          </div>
        </body>
      </html>
    `;
    
    printContentSecurely('SK_STRUKTUR_ORGANISASI_' + lembaga.name.toUpperCase(), fullHtml);
  };

  const handlePrintSKDraft = () => {
    if (!generatedSkText) return;
    
    const pimpinanName = getPimpinanInfo().name;

    // Split the text into lines
    const rawLines = generatedSkText.split('\n');
    
    // Find where the document body actually starts (skip Kop Surat lines in the generated draft since we draw a beautiful native one)
    let startIndex = 0;
    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i].trim().toLowerCase();
      if (line.includes('surat keputusan') || line.includes('keputusan direktur') || line.includes('keputusan pimpinan') || line.includes('keputusan kepala')) {
        startIndex = i;
        break;
      }
    }

    const bodyLines = rawLines.slice(startIndex);

    // Process the text to recreate the beautiful printable layout
    const linesHTML = bodyLines.map((line, idx) => {
      let trimmed = line.trim();
      const upperTrimmed = trimmed.toUpperCase();
      
      // Remove horizontal dividers
      if (trimmed.match(/^[=\-*_#\s]{3,}$/)) {
        return '';
      }
      
      // Clean markdown heading symbols from the beginning
      trimmed = trimmed.replace(/^#+\s*/, '');
      
      // Clean emojis or strange markers
      trimmed = trimmed.replace(/👉|👈|⚠️|●|✨|🖨️/g, '');
      
      // Check for document title / metadata lines using clean string (strip spaces, asterisks, underscores)
      const cleanUpper = trimmed.replace(/[\*\s_#]/g, '').toUpperCase();
      const isDocTitle = cleanUpper.startsWith('SURATKEPUTUSAN') || 
                          cleanUpper.startsWith('KEPUTUSANDIREKTUR') ||
                          cleanUpper.startsWith('KEPUTUSANPIMPINAN') ||
                          cleanUpper.startsWith('KEPUTUSANKEPALA') ||
                          cleanUpper.startsWith('NOMOR') || 
                          cleanUpper.startsWith('N0MOR') || 
                          cleanUpper.includes('NOMOR:') ||
                          cleanUpper === 'TENTANG' || 
                          (idx < 5 && (cleanUpper.includes('PENETAPAN') || cleanUpper.includes('PROFIL') || cleanUpper.includes('VISIMISI') || cleanUpper.includes('VISIDANMISI') || cleanUpper.includes('KEPUTUSAN')));
      
      if (isDocTitle) {
        // Strip markdown bold and header markers from display
        let displayTitle = trimmed.replace(/^\*\*([\s\S]+)\*\*$/, '$1')
                                  .replace(/^\*([\s\S]+)\*$/, '$1')
                                  .replace(/^#+\s*/, '')
                                  .trim();
        // Also ensure any remaining ** inside is clean
        displayTitle = displayTitle.replace(/\*\*([^*]+)\*\*/g, '$1');
        
        return `
          <div style="text-align: center; font-weight: bold; font-family: 'Arial', sans-serif; font-size: ${displayTitle.toLowerCase().includes('surat keputusan') || displayTitle.toLowerCase().includes('keputusan') ? '14px' : '11.5px'}; margin: 6px 0; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.4;">
            ${displayTitle}
          </div>
        `;
      }
      
      // Major sections
      const isHeader = cleanUpper.startsWith('MENIMBANG') || 
                       cleanUpper.startsWith('MENGINGAT') || 
                       cleanUpper.startsWith('MEMUTUSKAN') || 
                       cleanUpper.startsWith('MENETAPKAN');
                       
      if (isHeader) {
        // Strip markdown bold and other markers from header title
        let displayHeader = trimmed.replace(/^\*\*([\s\S]+)\*\*$/, '$1')
                                   .replace(/^\*([\s\S]+)\*$/, '$1')
                                   .replace(/^#+\s*/, '')
                                   .trim();
        // Also remove any inner bolding or trailing colons for elegance
        displayHeader = displayHeader.replace(/\*\*([^*]+)\*\*/g, '$1');
        
        return `
          <div style="font-weight: bold; font-family: 'Arial', sans-serif; font-size: 11.5px; margin-top: 18px; margin-bottom: 6px; text-transform: uppercase; border-bottom: 1.5px solid #000000; padding-bottom: 2px; width: fit-content;">
            ${displayHeader}
          </div>
        `;
      }
      
      // Check for Lampiran (Attachment) / Page Break
      if (upperTrimmed.includes('LAMPIRAN') || upperTrimmed.startsWith('LAMPIRAN') || trimmed.toLowerCase().startsWith('lampiran')) {
        let logoHTML = '';
        if (lembaga.profile.logoUrl) {
          logoHTML = `
            <div style="text-align: center; margin: 20px 0;">
              <p style="font-size: 10px; font-weight: bold; color: #475569; font-family: sans-serif; margin-bottom: 5px;">LOGO RESMI LEMBAGA:</p>
              <img src="${lembaga.profile.logoUrl}" style="max-height: 90px; max-width: 180px; object-fit: contain; margin: 0 auto; display: block;" />
            </div>
          `;
        }
        return `
          <div style="page-break-before: always; border-top: 2px dashed #000000; padding-top: 20px; margin-top: 35px; text-align: center; font-weight: bold; font-size: 13px; font-family: 'Arial', sans-serif; text-transform: uppercase;">
            ${trimmed}
          </div>
          ${logoHTML}
        `;
      }
      
      // Signature Block at the end
      const totalLines = bodyLines.length;
      const isPimpinanMatch = pimpinanName && trimmed.includes(pimpinanName);
      const isSignLine = idx >= totalLines - 10 && (
        trimmed.startsWith('Ditetapkan') || 
        trimmed.startsWith('Pada Tanggal') || 
        trimmed.startsWith('Pada tanggal') || 
        trimmed.startsWith('Pimpinan') || 
        isPimpinanMatch || 
        trimmed.includes('Direktur') || 
        trimmed.includes('Kepala') || 
        trimmed.includes('S.Pd.')
      );
      
      if (isSignLine) {
        const isSignee = trimmed.includes('S.Pd.') || isPimpinanMatch || trimmed.includes('Direktur') || trimmed.includes('Kepala') || trimmed.includes('Pimpinan');
        return `
          <div style="width: 280px; margin-left: auto; text-align: left; font-family: 'Arial', sans-serif; font-size: 11.5px; padding-left: 15px; margin-top: ${isSignee ? '55px; font-weight: bold; text-decoration: underline;' : '3px;'}; line-height: 1.4;">
            ${trimmed}
          </div>
        `;
      }
      
      // Clean up leading bullet list indicators
      let cleanText = trimmed.replace(/^[\s\-\*•]+\s*/, '');
      
      // Strip starting asterisks for regex matching
      const matchText = cleanText.replace(/^\*\*+/, '').trim();
      
      // Convert markdown bold/italic inside cleanText to HTML
      cleanText = cleanText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      cleanText = cleanText.replace(/_([^_]+)_/g, '<em>$1</em>');
      
      // Format numbered/capitalized legal clauses beautifully with indented look
      const isNumberedOrCapitalPoint = matchText.match(/^(KESATU|KEDUA|KETIGA|KEEMPAT|KELIMA|KEENAM|KETUJUH|KEDELAPAN|Pertama|Kedua|Ketiga|Keempat|Kelima|Keenam|Ketujuh|Kedelapan|[0-9]+\.|\-[a-zA-Z]\.)/);
      if (isNumberedOrCapitalPoint) {
        return `
          <p style="text-align: justify; font-size: 11.5px; margin: 6px 0; line-height: 1.6; font-family: 'Times New Roman', serif; padding-left: 20px; text-indent: -20px;">
            ${cleanText}
          </p>
        `;
      }
      
      // Standard paragraph line
      return `
        <p style="text-align: justify; font-size: 11.5px; margin: 4px 0; line-height: 1.6; font-family: 'Times New Roman', serif;">
          ${cleanText}
        </p>
      `;
    }).filter(p => p !== '').join('');

    // Prepend a stunning professional Indonesian Kop Surat header
    const kopSuratHTML = `
      <div style="text-align: center; font-family: 'Arial', 'Helvetica', sans-serif; border-bottom: 3px double #000000; padding-bottom: 10px; margin-bottom: 25px;">
        ${lembaga.profile.logoUrl ? `
          <div style="float: left; width: 85px; height: 85px; margin-right: -85px;">
            <img src="${lembaga.profile.logoUrl}" style="max-height: 85px; max-width: 85px; object-fit: contain;" />
          </div>
        ` : ''}
        <div style="${lembaga.profile.logoUrl ? 'padding-left: 95px; padding-right: 15px;' : ''}">
          <div style="font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.2;">
            ${lembaga.name.toUpperCase()}
          </div>
          <div style="font-size: 13px; font-weight: 700; text-transform: uppercase; color: #1e293b; margin-top: 3px;">
            LEMBAGA KURSUS DAN PELATIHAN
          </div>
          <div style="font-size: 10.5px; color: #334155; margin-top: 5px; line-height: 1.4;">
            ${lembaga.profile.address ? `Alamat: ${lembaga.profile.address}` : ''}
            ${lembaga.profile.phone ? ` | Telp: ${lembaga.profile.phone}` : ''}
            ${(lembaga.profile.email || lembaga.email) ? ` | Email: ${lembaga.profile.email || lembaga.email}` : ''}
          </div>
          <div style="font-size: 10px; font-weight: 600; color: #475569; margin-top: 2px;">
            ${lembaga.profile.npsn ? `NPSN: ${lembaga.profile.npsn}` : ''}
            ${lembaga.profile.skDisdik ? ` | Izin Operasional: ${lembaga.profile.skDisdik}` : ''}
          </div>
        </div>
        <div style="clear: both;"></div>
      </div>
    `;

    const fullHtml = `
      <html>
        <head>
          <title>SURAT_KEPUTUSAN_RESMI_${lembaga.name.toUpperCase()}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
            body { 
              font-family: 'Times New Roman', serif; 
              padding: 40px 60px; 
              color: #000000; 
              line-height: 1.5; 
              background-color: #ffffff;
              max-width: 21cm;
              margin: 0 auto;
            }
            @media print {
              body { padding: 25px 40px; }
            }
          </style>
        </head>
        <body>
          <div style="padding: 10px; position: relative; min-height: 29.7cm; box-sizing: border-box;">
            ${kopSuratHTML}
            ${linesHTML}
          </div>
        </body>
      </html>
    `;
    
    printContentSecurely('SURAT_KEPUTUSAN_RESMI_' + lembaga.name.toUpperCase(), fullHtml);
  };

  const addBudget = () => {
    if (!newBudget.activity || !newBudget.unitPrice) return;
    const vol = Number(newBudget.volume) || 1;
    const price = Number(newBudget.unitPrice) || 0;
    const add: BudgetItem = {
      id: 'b_' + Date.now(),
      code: newBudget.code || 'X',
      activity: newBudget.activity,
      volume: vol,
      unit: newBudget.unit || 'Unit',
      unitPrice: price,
      total: vol * price
    };
    saveLembaga({ budget: [...lembaga.budget, add] });
    setNewBudget({ code: '', activity: '', volume: 1, unit: '', unitPrice: 0 });
    setActiveAddModal(null);
  };

  const addJournal = () => {
    if (!newJournal.description || !newJournal.amount) return;
    const add: JournalEntry = {
      id: 'j_' + Date.now(),
      date: newJournal.date || new Date().toISOString().split('T')[0],
      description: newJournal.description,
      type: (newJournal.type as any) || 'Debit',
      category: newJournal.category || 'Operasional',
      amount: Number(newJournal.amount)
    };
    saveLembaga({ journal: [...lembaga.journal, add] });
    setNewJournal({ date: '', description: '', type: 'Debit', category: '', amount: 0 });
    setActiveAddModal(null);
  };

  const addVoucher = () => {
    if (!newVoucher.code || !newVoucher.discount) return;
    const add: Voucher = {
      id: 'v_' + Date.now(),
      code: newVoucher.code.toUpperCase(),
      discount: Number(newVoucher.discount),
      type: (newVoucher.type as any) || 'Nominal',
      expiryDate: newVoucher.expiryDate || new Date().toISOString().split('T')[0],
      quota: Number(newVoucher.quota) || 10
    };
    saveLembaga({ vouchers: [...lembaga.vouchers, add] });
    setNewVoucher({ code: '', discount: 0, type: 'Nominal', expiryDate: '', quota: 10 });
    setActiveAddModal(null);
  };

  const addSchedule = () => {
    if (!newSchedule.programId || !newSchedule.teacherId) {
      alert('⚠️ Pilih Program dan Instruktur terlebih dahulu!');
      return;
    }
    const add: ScheduleItem = {
      id: 'sch_' + Date.now(),
      programId: newSchedule.programId,
      teacherId: newSchedule.teacherId,
      day: newSchedule.day || 'Senin',
      time: newSchedule.time || '08:00 - 10:00',
      room: newSchedule.room || 'Lab A'
    };
    saveLembaga({ schedule: [...lembaga.schedule, add] });
    setNewSchedule({ programId: '', teacherId: '', day: 'Senin', time: '08:00 - 10:00', room: 'Lab A' });
    setActiveAddModal(null);
  };

  // Individual Update / Edit Handlers
  const startEditProgram = (p: Program) => {
    setEditingProgramId(p.id);
    setEditProgramData({ ...p });
  };
  const cancelEditProgram = () => {
    setEditingProgramId(null);
    setEditProgramData({});
  };
  const updateProgram = () => {
    if (!editProgramData.name) return alert('Nama program wajib diisi!');
    const regFee = Number(editProgramData.regFee) || 0;
    const tuitionFee = Number(editProgramData.tuitionFee) || 0;
    const monthlyFee = Number(editProgramData.monthlyFee) || 0;
    const totalCost = regFee + tuitionFee + monthlyFee;
    
    if (totalCost <= 0) return alert('Total biaya program harus lebih besar dari Rp 0!');
    
    const updated = lembaga.programs.map(p => p.id === editingProgramId ? {
      ...p,
      ...editProgramData,
      price: totalCost,
      regFee,
      tuitionFee,
      monthlyFee
    } as Program : p);
    saveLembaga({ programs: updated });
    cancelEditProgram();
  };

  const startEditTeacher = (t: Teacher) => {
    setEditingTeacherId(t.id);
    setEditTeacherName(t.name);
    setEditTeacherSpecialty(t.specialty);
  };
  const updateTeacher = () => {
    if (!editTeacherName) return alert('Nama instruktur tidak boleh kosong!');
    const updated = lembaga.teachers.map(t => t.id === editingTeacherId ? {
      ...t,
      name: editTeacherName,
      specialty: editTeacherSpecialty
    } : t);
    saveLembaga({ teachers: updated });
    setEditingTeacherId(null);
  };

  const startEditFacility = (f: Facility) => {
    setEditingFacilityId(f.id);
    setEditFacilityData({ ...f });
  };
  const handleFacilityFileUpload = (file: File, type: 'photo' | 'document', isEdit: boolean) => {
    if (!file) return;

    if (file.size > 1.0 * 1024 * 1024) {
      alert('Mohon maaf, ukuran berkas yang Anda pilih melebihi batas maksimal 1 MB. Silakan unggah berkas yang lebih kecil.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      if (base64Data) {
        if (isEdit) {
          if (type === 'photo') {
            setEditFacilityData(prev => ({ ...prev, photoUrl: base64Data }));
          } else {
            setEditFacilityData(prev => ({ ...prev, documentUrl: base64Data }));
          }
        } else {
          if (type === 'photo') {
            setNewFacility(prev => ({ ...prev, photoUrl: base64Data }));
          } else {
            setNewFacility(prev => ({ ...prev, documentUrl: base64Data }));
          }
        }
      }
    };
    reader.readAsDataURL(file);
  };
  const updateFacility = () => {
    if (!editFacilityData.name || !editFacilityData.quantity) return alert('Nama & jumlah wajib diisi!');
    const updated = lembaga.facilities.map(f => f.id === editingFacilityId ? {
      ...f,
      ...editFacilityData,
      quantity: Number(editFacilityData.quantity)
    } as Facility : f);
    saveLembaga({ facilities: updated });
    setEditingFacilityId(null);
  };

  const startEditEvent = (e: CalendarEvent) => {
    setEditingEventId(e.id);
    setEditEventData({ ...e });
  };
  const updateEvent = () => {
    if (!editEventData.title || !editEventData.date) return alert('Judul & tanggal wajib diisi!');
    const updated = lembaga.calendar.map(e => e.id === editingEventId ? {
      ...e,
      ...editEventData
    } as CalendarEvent : e);
    saveLembaga({ calendar: updated });
    setEditingEventId(null);
  };

  const startEditNode = (n: OrgNode) => {
    setEditingNodeId(n.id);
    setEditNodeData({ ...n });
  };
  const updateNode = () => {
    if (!editNodeData.name || !editNodeData.role) return alert('Nama & jabatan wajib diisi!');
    const updated = lembaga.structure.map(n => n.id === editingNodeId ? {
      ...n,
      ...editNodeData
    } as OrgNode : n);
    saveLembaga({ structure: updated });
    setEditingNodeId(null);
  };

  const startEditBudget = (b: BudgetItem) => {
    setEditingBudgetId(b.id);
    setEditBudgetData({ ...b });
  };
  const updateBudget = () => {
    if (!editBudgetData.activity || !editBudgetData.unitPrice) return alert('Kegiatan & harga wajib diisi!');
    const vol = Number(editBudgetData.volume) || 1;
    const price = Number(editBudgetData.unitPrice) || 0;
    const updated = lembaga.budget.map(b => b.id === editingBudgetId ? {
      ...b,
      ...editBudgetData,
      volume: vol,
      unitPrice: price,
      total: vol * price
    } as BudgetItem : b);
    saveLembaga({ budget: updated });
    setEditingBudgetId(null);
  };

  const startEditJournal = (j: JournalEntry) => {
    setEditingJournalId(j.id);
    setEditJournalData({ ...j });
  };
  const updateJournal = () => {
    if (!editJournalData.description || !editJournalData.amount) return alert('Deskripsi & nominal wajib diisi!');
    const updated = lembaga.journal.map(j => j.id === editingJournalId ? {
      ...j,
      ...editJournalData,
      amount: Number(editJournalData.amount)
    } as JournalEntry : j);
    saveLembaga({ journal: updated });
    setEditingJournalId(null);
  };

  const startEditVoucher = (v: Voucher) => {
    setEditingVoucherId(v.id);
    setEditVoucherData({ ...v });
  };
  const updateVoucher = () => {
    if (!editVoucherData.code || !editVoucherData.discount) return alert('Kode & diskon wajib diisi!');
    const updated = lembaga.vouchers.map(v => v.id === editingVoucherId ? {
      ...v,
      ...editVoucherData,
      code: editVoucherData.code!.toUpperCase(),
      discount: Number(editVoucherData.discount),
      quota: Number(editVoucherData.quota) || 10
    } as Voucher : v);
    saveLembaga({ vouchers: updated });
    setEditingVoucherId(null);
  };

  const startEditSchedule = (s: ScheduleItem) => {
    setEditingScheduleId(s.id);
    setEditScheduleData({ ...s });
  };
  const updateSchedule = () => {
    if (!editScheduleData.programId || !editScheduleData.teacherId) return alert('Pilih program & pengajar!');
    const updated = lembaga.schedule.map(s => s.id === editingScheduleId ? {
      ...s,
      ...editScheduleData
    } as ScheduleItem : s);
    saveLembaga({ schedule: updated });
    setEditingScheduleId(null);
  };

  // Toggle Standard Accreditation state
  const toggleSnpTask = (standardId: number, taskId: string) => {
    const updated = lembaga.snpStandards.map(std => {
      if (std.id === standardId) {
        const checkMap = std.checklist.map(chk => {
          if (chk.id === taskId) {
            return { ...chk, checked: !chk.checked, evidence: !chk.checked ? 'dokumen_bukti.pdf' : '' };
          }
          return chk;
        });
        // Recalculate percent completion
        const checkedCount = checkMap.filter(c => c.checked).length;
        const totalCount = checkMap.length;
        const newPercent = Math.round((checkedCount / totalCount) * 100);
        return { ...std, checklist: checkMap, percentage: newPercent };
      }
      return std;
    });
    saveLembaga({ snpStandards: updated });
  };

  // Student Attendance handler
  const handleAttendanceChange = (studentId: string, status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpha') => {
    const existingIndex = lembaga.attendance.findIndex(a => a.studentId === studentId && a.date === attendanceDate);
    let updatedAttendance = [...lembaga.attendance];
    
    if (existingIndex > -1) {
      updatedAttendance[existingIndex] = {
        ...updatedAttendance[existingIndex],
        status
      };
    } else {
      updatedAttendance.push({
        id: 'att_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        studentId,
        date: attendanceDate,
        status
      });
    }
    saveLembaga({ attendance: updatedAttendance });
  };

  // Update Access Password Check (min 6 char, double confirmation, show/hide)
  const saveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword.length > 0 && newPassword.length < 6) {
      setErrorMsg('⚠️ Sandi baru minimal harus 6 karakter!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('⚠️ Konfirmasi kata sandi tidak cocok!');
      return;
    }

    const updated: Partial<Institution> = { email: emailInput };
    if (newPassword) {
      updated.password = newPassword;
    }

    saveLembaga(updated);
    setNewPassword('');
    setConfirmPassword('');
    setSuccessMsg('✅ Kredensial berhasil diperbarui secara aman!');
  };

  // Print view helpers
  const printContentSecurely = (title: string, fullHtml: string) => {
    // 1. Set title temporarily for printing
    const originalTitle = document.title;
    document.title = title;

    // 2. Clear or create special printing overlay container
    let overlay = document.getElementById('print-overlay-container');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'print-overlay-container';
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = fullHtml;

    // 3. Trigger printing of current page (will print overlay solely due to our media query rules)
    try {
      window.focus();
      window.print();
    } catch (e) {
      console.warn("Direct window.print() failed, trying iframe print fallback.", e);
    }

    // Fallback: iframe printing for absolute resilience
    const frameId = "secure-print-frame";
    let printFrame = document.getElementById(frameId) as HTMLIFrameElement;
    if (printFrame) {
      printFrame.remove();
    }
    
    printFrame = document.createElement('iframe') as HTMLIFrameElement;
    printFrame.id = frameId;
    printFrame.style.position = "absolute";
    printFrame.style.top = "-100000px";
    printFrame.style.left = "-100000px";
    printFrame.style.width = "0px";
    printFrame.style.height = "0px";
    document.body.appendChild(printFrame);
    
    const frameDoc = printFrame.contentWindow ? printFrame.contentWindow.document : (printFrame.contentDocument ? printFrame.contentDocument : null);
    if (frameDoc) {
      frameDoc.open();
      frameDoc.write(fullHtml);
      frameDoc.close();
      
      setTimeout(() => {
        try {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
        } catch (printErr) {
          console.error("Iframe printing failed:", printErr);
        }
      }, 500);
    }

    // 4. Secure Fail-safe Fallback: If inside an iframe (like the AI Studio development preview),
    // trigger an automatic download of the beautifully formatted HTML file with auto-print script.
    // This allows the user to open the file locally in a new tab and print it perfectly with zero restrictions!
    const isInsideIframe = window.self !== window.top;
    if (isInsideIframe) {
      try {
        let printableHtml = fullHtml;
        if (!printableHtml.includes('window.print()')) {
          printableHtml = printableHtml.replace('</body>', '<script>window.onload = function() { setTimeout(function() { window.print(); }, 500); }</script></body>');
        }
        
        const blob = new Blob([printableHtml], { type: 'text/html;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/[^a-zA-Z0-9_\u0600-\u06FF]+/g, '_')}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Non-intrusive friendly guidance alert
        alert(
          `🖨️ Mengaktifkan Dialog Cetak...\n\n` +
          `Karena Anda sedang membuka aplikasi di dalam panel pratinjau AI Studio, beberapa browser membatasi dialog cetak langsung demi keamanan.\n\n` +
          `Berkas dokumen cetak "${title}.html" telah diunduh otomatis ke komputer Anda. Silakan klik/buka berkas tersebut untuk mencetak dokumen dengan tata letak kop surat resmi yang sempurna!`
        );
      } catch (err) {
        console.error("HTML fallback download failed:", err);
      }
    }

    // 5. Reset document title and clean up DOM elements shortly after print dialog opens
    setTimeout(() => {
      document.title = originalTitle;
      const overlayToClean = document.getElementById('print-overlay-container');
      if (overlayToClean) {
        overlayToClean.innerHTML = '';
        overlayToClean.remove();
      }
      const frameToClean = document.getElementById(frameId);
      if (frameToClean) {
        frameToClean.remove();
      }
    }, 2000);
  };

  const handlePrintDocument = (title: string, htmlContent: string) => {
    const fullHtml = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.6; }
            h1, h2, h3 { color: #1a1a1a; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { bg-color: #f5f5f5; font-weight: bold; }
            .header { text-align: center; border-bottom: 3px double #333; padding-bottom: 12px; margin-bottom: 30px; }
            .footer { text-align: right; margin-top: 40px; font-size: 13px; }
            .no-print { display: none; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0; font-size: 24px; text-transform: uppercase;">${lembaga.name}</h1>
            <p style="margin: 4px 0 0 0; color: #555;">${lembaga.profile.address} | Telp: ${lembaga.profile.phone}</p>
          </div>
          <h2>${title}</h2>
          Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}
          <hr/>
          ${htmlContent}
          <div class="footer">
            <p>Disahkan oleh,</p>
            <br/><br/>
            <p><strong>_____________________</strong></p>
            <p>Pimpinan Lembaga Kursus</p>
          </div>
          <script>window.onload = function() { setTimeout(function() { window.print(); }, 400); }</script>
        </body>
      </html>
    `;
    printContentSecurely(title, fullHtml);
  };

  // Print budget tables
  const printRAB = () => {
    const totalRAB = lembaga.budget.reduce((acc, curr) => acc + curr.total, 0);
    const rows = lembaga.budget.map(b => `
      <tr>
        <td>${b.code}</td>
        <td>${b.activity}</td>
        <td>${b.volume} ${b.unit}</td>
        <td>Rp ${b.unitPrice.toLocaleString('id-ID')}</td>
        <td>Rp ${b.total.toLocaleString('id-ID')}</td>
      </tr>
    `).join('');
    
    const content = `
      <h3>Daftar Rencana Anggaran & Belanja (RAB) Tahunan</h3>
      <table>
        <thead>
          <tr>
            <th>Kode</th>
            <th>Program Kegiatan</th>
            <th>Volume</th>
            <th>Harga Satuan</th>
            <th>Jumlah Total</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
          <tr style="font-weight: bold; background: #eee;">
            <td colspan="4" style="text-align: right;">GRAND TOTAL ANGGRAN:</td>
            <td>Rp ${totalRAB.toLocaleString('id-ID')}</td>
          </tr>
        </tbody>
      </table>
    `;
    handlePrintDocument('LAPORAN_ANGGRAN_RAB_' + lembaga.name.toUpperCase(), content);
  };

  // Print Financial Journal ledger
  const printLedger = () => {
    const dSum = lembaga.journal.filter(j => j.type === 'Debit').reduce((s, j) => s + j.amount, 0);
    const kSum = lembaga.journal.filter(j => j.type === 'Kredit').reduce((s, j) => s + j.amount, 0);
    const bal = dSum - kSum;
    
    const rows = lembaga.journal.map(j => `
      <tr>
        <td>${j.date}</td>
        <td>${j.description}</td>
        <td>${j.category}</td>
        <td style="color: green;">${j.type === 'Debit' ? 'Rp ' + j.amount.toLocaleString('id-ID') : '-'}</td>
        <td style="color: red;">${j.type === 'Kredit' ? 'Rp ' + j.amount.toLocaleString('id-ID') : '-'}</td>
      </tr>
    `).join('');

    const content = `
      <h3>Ledger Buku Pengeluaran & Penerimaan Kas Jurnal</h3>
      <table>
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Keterangan Deskripsi</th>
            <th>Kategori</th>
            <th>Penerimaan (Debit)</th>
            <th>Pengeluaran (Kredit)</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
          <tr style="font-weight: bold; background: #fbfbfb;">
            <td colspan="3" style="text-align: right;">Total Kas Masuk (Debit):</td>
            <td style="color: green;">Rp ${dSum.toLocaleString('id-ID')}</td>
            <td>-</td>
          </tr>
          <tr style="font-weight: bold; background: #fbfbfb;">
            <td colspan="3" style="text-align: right;">Total Kas Keluar (Kredit):</td>
            <td>-</td>
            <td style="color: red;">Rp ${kSum.toLocaleString('id-ID')}</td>
          </tr>
          <tr style="font-weight: bold; background: #eee;">
            <td colspan="3" style="text-align: right;">SALDO AKHIR KAS (BALANCE):</td>
            <td colspan="2" style="font-size: 16px; color: ${bal >= 0 ? 'green' : 'red'};">
              Rp ${bal.toLocaleString('id-ID')}
            </td>
          </tr>
        </tbody>
      </table>
    `;
    handlePrintDocument('LAPORAN_JURNAL_KEUANGAN_' + lembaga.name.toUpperCase(), content);
  };

  // Print Org Chart and Job Descriptions
  const printOrgChart = () => {
    const generateTreeHTML = (parentId: string | null): string => {
      const children = lembaga.structure.filter(n => n.parentId === parentId);
      if (children.length === 0) return '';
      return `
        <ul>
          ${children.map(child => `
            <li>
              <div class="tree-node">
                <p class="node-name" style="margin: 0; font-size: 11px; font-weight: bold; color: #1e293b;">${child.name}</p>
                <p class="node-role" style="margin: 2px 0 0 0; font-size: 8.5px; font-weight: 800; color: #0d9488; text-transform: uppercase;">${child.role}</p>
              </div>
              ${generateTreeHTML(child.id)}
            </li>
          `).join('')}
        </ul>
      `;
    };

    const roots = lembaga.structure.filter(n => !n.parentId);
    if (roots.length === 0) {
      alert('⚠️ Belum ada data personil dalam struktur organisasi untuk dicetak.');
      return;
    }

    const treeHTML = `
      <div class="tree">
        <ul>
          ${roots.map(root => `
            <li>
              <div class="tree-node" style="border: 2px solid #065f46; background-color: #f0fdf4;">
                <p class="node-name" style="margin: 0; font-size: 12.5px; font-weight: 800; color: #064e3b;">${root.name}</p>
                <p class="node-role" style="margin: 2px 0 0 0; font-size: 9.5px; font-weight: 900; color: #047857; text-transform: uppercase;">${root.role}</p>
              </div>
              ${generateTreeHTML(root.id)}
            </li>
          `).join('')}
        </ul>
      </div>
    `;

    const detailHTML = lembaga.structure.map(node => `
      <div style="page-break-inside: avoid; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 22px; background: #fafafa;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 8px; margin-bottom: 12px;">
          <h3 style="margin: 0; font-size: 14px; color: #0f172a; font-weight: 850; text-transform: uppercase; font-family: 'Inter', sans-serif;">💼 ${node.role}</h3>
          <span style="font-size: 11.5px; color: #475569; font-weight: 600;">Nama Pejabat: <strong style="color: #0f172a;">${node.name}</strong></span>
        </div>
        <div style="margin-bottom: 15px; font-size: 11px;">
          <strong style="text-transform: uppercase; color: #64748b; font-weight: 700; font-size: 9px; display: block; margin-bottom: 2px; letter-spacing: 0.5px;">Atasan Struktural</strong>
          <p style="margin: 0; color: #334155; font-weight: 600;">
            ${node.parentId ? (lembaga.structure.find(p => p.id === node.parentId) ? `${lembaga.structure.find(p => p.id === node.parentId)?.role} (${lembaga.structure.find(p => p.id === node.parentId)?.name})` : 'Atasan Struktural') : 'Pimpinan Tertinggi Lembaga (Tanpa Atasan)'}
          </p>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 11px;">
          <div>
            <strong style="text-transform: uppercase; color: #2563eb; font-weight: 750; font-size: 9px; display: block; margin-bottom: 4px; letter-spacing: 0.5px;">🔑 HAK & KEWENANGAN JABATAN</strong>
            <p style="margin: 0; color: #334155; white-space: pre-line; padding: 10px; border-radius: 8px; border: 1px solid #dbeafe; background-color: #f8fafc; font-weight: 500; line-height: 1.5;">${node.rights || '<em style="color: #94a3b8;">Belum ditentukan</em>'}</p>
          </div>
          <div>
            <strong style="text-transform: uppercase; color: #0d9488; font-weight: 750; font-size: 9px; display: block; margin-bottom: 4px; letter-spacing: 0.5px;">📋 KEWAJIBAN & TUGAS POKOK</strong>
            <p style="margin: 0; color: #334155; white-space: pre-line; padding: 10px; border-radius: 8px; border: 1px solid #ccfbf1; background-color: #f8fafc; font-weight: 500; line-height: 1.5;">${node.duties || '<em style="color: #94a3b8;">Belum ditentukan</em>'}</p>
          </div>
        </div>
      </div>
    `).join('');

    const fullHtml = `
      <html>
        <head>
          <title>BAGAN_STRUKTUR_ORGANISASI_${lembaga.name.toUpperCase()}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
            body { 
              font-family: 'Inter', sans-serif; 
              padding: 40px; 
              color: #1e293b; 
              line-height: 1.6; 
              background-color: #ffffff;
            }
            .header-kop { 
              text-align: center; 
              border-bottom: 3.5px double #1e293b; 
              padding-bottom: 12px; 
              margin-bottom: 30px; 
            }
            .title-section {
              text-align: center;
              margin-bottom: 40px;
            }
            .title-section h2 {
              margin: 0;
              font-size: 18px;
              font-weight: 800;
              color: #0f172a;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .title-section p {
              margin: 4px 0 0 0;
              font-size: 11px;
              color: #64748b;
              font-weight: 500;
            }
            
            /* CSS Elegant Org Tree Layout suitable for printing */
            .tree, .tree ul, .tree li {
              position: relative;
              margin: 0;
              padding: 0;
              list-style: none;
            }
            .tree {
              display: flex;
              justify-content: center;
              text-align: center;
              margin-bottom: 50px;
              page-break-after: always;
            }
            .tree ul {
              display: flex;
              justify-content: center;
              padding-top: 18px;
              position: relative;
            }
            .tree li {
              padding: 18px 6px 0 6px;
              position: relative;
            }
            .tree li::before, .tree li::after {
              content: '';
              position: absolute;
              top: 0;
              right: 50%;
              border-top: 1.5px solid #475569;
              width: 50%;
              height: 18px;
            }
            .tree li::after {
              right: auto;
              left: 50%;
              border-left: 1.5px solid #475569;
            }
            .tree li:only-child::after, .tree li:only-child::before {
              display: none;
            }
            .tree li:only-child {
              padding-top: 0;
            }
            .tree li:first-child::before {
              border: 0 none;
            }
            .tree li:last-child::after {
              border-right: 0 none;
              border-left: 1.5px solid #475569;
            }
            .tree li:first-child::after {
              border-radius: 4px 0 0 0;
            }
            .tree li:last-child::before {
              border-radius: 0 4px 0 0;
            }
            .tree ul::before {
              content: '';
              position: absolute;
              top: 0;
              left: 50%;
              border-left: 1.5px solid #475569;
              width: 0;
              height: 18px;
            }
            
            .tree-node {
              display: inline-block;
              border: 1.5px solid #10b981;
              background-color: #ffffff;
              border-radius: 8px;
              padding: 8px 12px;
              text-decoration: none;
              box-shadow: 0 1px 3px rgba(0,0,0,0.04);
              min-width: 100px;
              max-width: 130px;
            }
            
            .footer { 
              text-align: right; 
              margin-top: 50px; 
              font-size: 13px; 
              page-break-inside: avoid;
            }
            
            @media print {
              body { padding: 20px; font-size: 11px; }
              .tree-node { box-shadow: none; border-color: #0f172a !important; }
            }
          </style>
        </head>
        <body>
          <div class="header-kop">
            <h1 style="margin: 0; font-size: 21px; text-transform: uppercase; font-weight: 900; color: #0f172a;">${lembaga.name}</h1>
            <p style="margin: 4px 0 0 0; color: #475569; font-size: 11px; font-weight: 550;">${lembaga.profile.address} | Telp: ${lembaga.profile.phone}</p>
          </div>
          
          <div class="title-section">
            <h2>Bagan Struktur Organisasi & Tata Kelola Jabatan</h2>
            <p>Sesuai Standar Kompetensi Administrasi Manajemen Pendidikan Nonformal - Lembaga Indonesia - Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}</p>
          </div>
          
          <!-- BAGIAN 1: BAGAN VISUAL -->
          <div style="font-size: 12px; font-weight: bold; border-left: 4px solid #059669; padding-left: 10px; margin-bottom: 25px; color: #0f172a;">
            I. BAGAN STRUKTUR ORGANISASI UTAMA
          </div>
          ${treeHTML}
          
          <!-- BAGIAN 2: RINCIAN TUGAS JABATAN -->
          <div style="font-size: 12px; font-weight: bold; border-left: 4px solid #2563eb; padding-left: 10px; margin-top: 40px; margin-bottom: 25px; color: #0f172a;">
            II. RINCIAN HAK, TANGGUNG JAWAB & TUGAS POKOK JABATAN
          </div>
          ${detailHTML}
          
          <div class="footer">
            <p>Disahkan secara resmi oleh,</p>
            <br/><br/><br/>
            <p><strong>_____________________</strong></p>
            <p style="margin: 2px 0 0 0; font-weight: 700; color: #0f172a;">Pimpinan Lembaga Kursus</p>
          </div>
          
          <script>
            window.onload = function() { 
              setTimeout(function() {
                window.print(); 
              }, 400);
            }
          </script>
        </body>
      </html>
    `;
    printContentSecurely('BAGAN_STRUKTUR_ORGANISASI_' + lembaga.name.toUpperCase(), fullHtml);
  };

  // Backup & Restore: Export & Import of state
  const exportInstitutionData = () => {
    const dataStr = JSON.stringify(lembaga, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BACKUP_${lembaga.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.0 * 1024 * 1024) {
      alert('Mohon maaf, ukuran berkas cadangan (JSON) yang Anda pilih melebihi batas maksimal 1 MB. Pastikan Anda memilih berkas cadangan Lembaga yang benar dan berukuran kecil.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.id || !parsed.name || !parsed.profile) {
          alert('⚠️ File JSON TIDAK VALID untuk format tata kelola Lembaga Kursus ini!');
          return;
        }
        
        // Re-inject backup
        onUpdateLembaga({
          ...parsed,
          id: lembaga.id, // preserve ID to avoid tenant separation issue
          password: parsed.password || lembaga.password,
          activeUntil: parsed.activeUntil || lembaga.activeUntil
        });
        alert('🎉 Backup data lembaga berhasil dipulihkan!');
      } catch (err) {
        alert('⚠️ Gagal membaca data backup JSON: format berkas rusak.');
      }
    };
    reader.readAsText(file);
  };

  const isUnified = !!propActiveModule;

  return (
    <div className={isUnified ? "w-full animate-fade-in" : "grid grid-cols-1 md:grid-cols-12 gap-6"} id="admin-workspace">
      {/* Sidebar Navigation */}
      {!isUnified && (
        <div className="md:col-span-3 bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm space-y-4 h-fit">
          <div className="border-b border-neutral-100 pb-2 mb-2">
            <h3 className="text-xs font-black text-neutral-800 uppercase tracking-wider px-1">Menu Administrasi</h3>
            <p className="text-[10px] text-neutral-450 px-1 mt-0.5">Kelola data dan kelengkapan Lembaga</p>
          </div>
          {[
            {
              title: "Profil & Kelembagaan",
              items: [
                { id: 'profil', label: 'Profil & Visi', icon: Building },
                { id: 'struktur', label: 'Struktur Organisasi', icon: Users },
                { id: 'sarpras', label: 'Sarana Prasarana', icon: MapPin },
              ]
            },
            {
              title: "Akademik & KBM",
              items: [
                { id: 'program', label: 'Program & Harga', icon: FolderKanban },
                { id: 'kalender', label: 'Kalender Akademik', icon: Calendar },
                { id: 'jadwal', label: 'Jadwal & Pengajar', icon: Clock },
                { id: 'absensi', label: 'Absensi Siswa', icon: ClipboardCheck },
              ]
            },
            {
              title: "Keuangan & Promosi",
              items: [
                { id: 'rab', label: 'Anggaran & RAB', icon: FileSpreadsheet },
                { id: 'jurnal', label: 'Jurnal Keuangan', icon: Landmark },
                { id: 'voucher', label: 'Voucher Program', icon: Percent },
              ]
            },
            {
              title: "Standar Nasional Pendidikan",
              items: [
                { id: 'snp', label: 'Pemenuhan 8 SNP', icon: BookOpen },
              ]
            },
            {
              title: "Pemeliharaan",
              items: [
                { id: 'backup', label: 'Backup & Restore', icon: Download },
                { id: 'kredensial', label: 'Kredensial Akses', icon: KeyRound },
              ]
            }
          ].map((group, idx) => (
            <div key={idx} className="space-y-1">
              <h4 className="text-[10px] font-black text-neutral-450 uppercase tracking-widest px-2.5 py-1 bg-neutral-100/60 rounded-lg">
                {group.title}
              </h4>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveModule(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs rounded-xl transition-all ${
                        activeModule === item.id 
                          ? 'bg-emerald-600 text-white font-extrabold shadow-4xs' 
                          : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 font-semibold'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Module Content Area */}
      <div className={isUnified ? "bg-white p-6 rounded-3xl border border-neutral-100 shadow-3xs min-h-[480px]" : "md:col-span-9 bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm min-h-[480px]"}>
        
        {/* MODULE: PROFIL & VISI (UPGRADED WITH COMPREHENSIVE LANDING PAGE CONTENT EDITOR) */}
        {activeModule === 'profil' && (() => {
          const highlightsList = lembaga.profile.highlights || [
            { title: "Peralatan & Lab Modern", description: "Praktek intensif menggunakan fasilitas laboratorium komputer modern." },
            { title: "Sertifikat Resmi Kelulusan", description: "Setiap siswa memperoleh sertifikat kompetensi resmi terakreditasi." },
            { title: "Instruktur Profesional", description: "Kompetensi maksimal dibina oleh pengajar bersertifikat ahli di bidangnya." },
            { title: "Kesiapan Kerja Nyata", description: "Kami bekerja sama dengan berbagai industri dunia usaha terdekat." }
          ];

          const fAQList = lembaga.profile.faqs || [
            { q: "Apakah pemula tanpa dasar keahlian bisa ikut?", a: "Tentu saja! Materi pembelajaran di kursus ini disusun secara sistematis mulai dari nol (basic) hingga mahir, dengan bimbingan penuh dari instruktur pendamping." },
            { q: "Bagaimana penentuan jadwal pelatihannya?", a: "Jadwal belajar sangat fleksibel dan diistirahatkan merata. Anda bisa berdiskusi langsung dengan instruktur setelah formulir pendaftaran terverifikasi." },
            { q: "Apakah kelulusan disertai sertifikat resmi?", a: `Ya, setiap siswa yang menyelesaikan tugas & evaluasi mendapatkan Sertifikat Resmi berlisensi dari Lembaga ${lembaga.name} untuk mendaftar kerja.` },
            { q: "Bagaimana dengan kelengkapan modul & praktek?", a: "Seluruh modul materi, alat peraga praktek, serta akses penuh laboratorium dan AC sudah termasuk tanpa ada biaya tambahan/biaya tersembunyi." }
          ];

          const handleUpdateHighlight = (index: number, field: 'title' | 'description', value: string) => {
            const nextHighlights = [...highlightsList];
            nextHighlights[index] = { ...nextHighlights[index], [field]: value };
            saveLembaga({ profile: { ...lembaga.profile, highlights: nextHighlights } });
          };

          const handleAddFaq = (e: React.FormEvent) => {
            e.preventDefault();
            if (!newFaqQ.trim() || !newFaqA.trim()) {
              alert('⚠️ Sila isi pertanyaan dan jawaban FAQ terlebih dahulu!');
              return;
            }
            const nextFaqs = [...fAQList, { q: newFaqQ.trim(), a: newFaqA.trim() }];
            saveLembaga({ profile: { ...lembaga.profile, faqs: nextFaqs } });
            setNewFaqQ('');
            setNewFaqA('');
          };

          const handleDeleteFaq = (index: number) => {
            const item = fAQList[index];
            setDeleteConfirm({
              label: item ? `Tanya Jawab: "${item.q}"` : 'Tanya Jawab (FAQ)',
              onConfirm: () => {
                const nextFaqs = fAQList.filter((_, i) => i !== index);
                saveLembaga({ profile: { ...lembaga.profile, faqs: nextFaqs } });
              }
            });
          };

          const handleAIGenerateFaq = async () => {
            const finalTopic = aiFaqTopic === 'Custom' ? aiFaqCustomTopic : aiFaqTopic;
            if (!finalTopic.trim()) {
              alert('⚠️ Tuliskan topik atau fokus FAQ terlebih dahulu!');
              return;
            }

            setAiFaqLoading(true);
            try {
              const res = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  task: 'faq',
                  name: lembaga.name,
                  context: finalTopic
                })
              });

              if (!res.ok) {
                throw new Error('Gagal menghubungi asisten AI.');
              }

              const data = await res.json();
              if (data.result) {
                const parsed = JSON.parse(data.result);
                if (Array.isArray(parsed)) {
                  setAiGeneratedFaqs(parsed.map(item => ({ ...item, selected: true })));
                } else {
                  throw new Error('Format respon AI tidak sesuai.');
                }
              } else {
                throw new Error('Respon AI kosong.');
              }
            } catch (err: any) {
              console.error(err);
              alert('⚠️ Terjadi masalah: ' + err.message);
            } finally {
              setAiFaqLoading(false);
            }
          };

          const handleImportAIFaqs = () => {
            const selectedItems = aiGeneratedFaqs.filter(f => f.selected);
            if (selectedItems.length === 0) {
              alert('⚠️ Silakan pilih setidaknya satu tanya jawab hasil AI untuk diimpor.');
              return;
            }

            const newFaqsToImport = selectedItems.map(f => ({ q: f.q, a: f.a }));
            const nextFaqs = [...fAQList, ...newFaqsToImport];
            saveLembaga({ profile: { ...lembaga.profile, faqs: nextFaqs } });
            setAiGeneratedFaqs([]);
            alert(`🎉 Berhasil mengimpor ${selectedItems.length} Tanya Jawab (FAQ) baru dari AI!`);
          };

          return (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-neutral-100 pb-4 gap-2">
                <div>
                  <h3 className="text-lg font-black text-neutral-905 font-display uppercase tracking-tight">⚙️ Pengaturan Website & Landing Page</h3>
                  <p className="text-xs text-neutral-500">Sesuaikan seluruh teks, visi-misi, koordinat peta Google Maps, legalitas akreditasi, keunggulan, dan FAQ Lembaga Anda.</p>
                </div>
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-150 px-2.5 py-1 rounded-xl text-xs font-bold font-mono w-fit">
                  Live View Sync
                </div>
              </div>

              {/* ALAMAT WEB LEMBAGA & TOMBOL SALIN */}
              <div className="bg-emerald-50/45 border border-emerald-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/65 px-2 py-0.5 rounded-md border border-emerald-200/50 uppercase tracking-wider">
                    Tautan Web Lembaga Anda
                  </span>
                  <p className="text-xs font-bold text-neutral-800 select-all font-mono break-all mt-1">
                    {window.location.origin + window.location.pathname + '?lembaga=' + encodeURIComponent(lembaga.id)}
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    Gunakan tautan khusus di atas agar pengunjung/calon siswa yang mengklik link ini langsung diarahkan masuk ke halaman profil/pendaftaran Lembaga Anda secara instan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const url = window.location.origin + window.location.pathname + '?lembaga=' + encodeURIComponent(lembaga.id);
                    navigator.clipboard.writeText(url).then(() => {
                      setCopiedUrl(true);
                      setTimeout(() => setCopiedUrl(false), 2000);
                    });
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-3xs shrink-0 self-start sm:self-center"
                >
                  {copiedUrl ? '🎉 Berhasil Disalin!' : '🔗 Salin Tautan Web'}
                </button>
              </div>

              {/* Sub-tabs Navigation */}
              <div className="flex flex-wrap gap-1.5 p-1 bg-neutral-100 rounded-2xl w-fit">
                {[
                  { id: 'profil_utama', label: '1. Profil & Visi Misi' },
                  { id: 'sk_lembaga', label: '2. SK Lembaga' },
                  { id: 'legalitas', label: '3. Legalitas & Izin' },
                  { id: 'keunggulan', label: '4. Keunggulan Lembaga' },
                  { id: 'faq', label: '5. Tanya Jawab (FAQ)' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveProfileTab(tab.id as any)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      activeProfileTab === tab.id
                        ? 'bg-emerald-600 text-white shadow-3xs'
                        : 'text-neutral-600 hover:text-neutral-950 hover:bg-white/50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: PROFIL UTAMA */}
              {activeProfileTab === 'profil_utama' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in text-left">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Nama Lembaga Kursus</label>
                      <input 
                        type="text" 
                        value={lembaga.name}
                        onChange={(e) => saveLembaga({ name: e.target.value })}
                        className="w-full text-xs font-bold border border-neutral-200 rounded-xl p-3 bg-neutral-50 focus:bg-white focus:outline-emerald-600 transition-colors uppercase" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Telepon Pengelola Lembaga</label>
                      <input 
                        type="text" 
                        value={lembaga.profile.phone}
                        onChange={(e) => saveLembaga({ profile: { ...lembaga.profile, phone: e.target.value } })}
                        className="w-full text-xs font-semibold border border-neutral-200 rounded-xl p-3 bg-neutral-50 focus:bg-white focus:outline-emerald-600 transition-colors" 
                        placeholder="Misal: 0812-3456-7890"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Email Publik Lembaga</label>
                      <input 
                        type="email" 
                        value={lembaga.profile.email || ''}
                        onChange={(e) => saveLembaga({ profile: { ...lembaga.profile, email: e.target.value } })}
                        className="w-full text-xs font-semibold border border-neutral-200 rounded-xl p-3 bg-neutral-50 focus:bg-white focus:outline-emerald-600 transition-colors" 
                        placeholder="Misal: info@lembaga.com"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Alamat Fisik / Instansi Lengkap</label>
                      <textarea 
                        rows={2}
                        value={lembaga.profile.address}
                        onChange={(e) => saveLembaga({ profile: { ...lembaga.profile, address: e.target.value } })}
                        className="w-full text-xs font-semibold border border-neutral-200 rounded-xl p-3 bg-neutral-50 focus:bg-white focus:outline-emerald-600 transition-colors" 
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Visi Lembaga Kursus</label>
                      <textarea 
                        rows={3}
                        value={lembaga.profile.vision}
                        onChange={(e) => saveLembaga({ profile: { ...lembaga.profile, vision: e.target.value } })}
                        className="w-full text-xs font-medium border border-neutral-200 rounded-xl p-3 bg-neutral-50 focus:bg-white focus:outline-emerald-600 transition-colors leading-relaxed" 
                        placeholder="Tulis visi utama Lembaga Anda di sini..."
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Misi Lembaga (Tulis per baris baru / Enter)</label>
                      <textarea 
                        rows={3}
                        value={lembaga.profile.mission}
                        onChange={(e) => saveLembaga({ profile: { ...lembaga.profile, mission: e.target.value } })}
                        className="w-full text-xs font-medium border border-neutral-200 rounded-xl p-3 bg-neutral-50 focus:bg-white focus:outline-emerald-600 transition-colors leading-relaxed" 
                        placeholder="Misi 1&#10;Misi 2&#10;Misi 3"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Kueri Lokator Google Map</label>
                        <span className="text-[9px] text-neutral-450 italic font-medium">Bila kosong, menggunakan Alamat Fisik</span>
                      </div>
                      <input 
                        type="text" 
                        value={lembaga.profile.mapQuery || ''}
                        onChange={(e) => saveLembaga({ profile: { ...lembaga.profile, mapQuery: e.target.value } })}
                        className="w-full text-xs border border-neutral-200 rounded-xl p-3 bg-neutral-50 focus:bg-white focus:outline-emerald-600 transition-colors" 
                        placeholder="Contoh nama Lembaga atau koordinat peta: Lembaga Utama Yogyakarta"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Logo Lembaga (Unggah Gambar / Masukkan URL)</label>
                      
                      {/* Drag and Drop Zone */}
                      <div 
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingLogo(true);
                        }}
                        onDragLeave={() => {
                          setIsDraggingLogo(false);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingLogo(false);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            handleLogoFile(e.dataTransfer.files[0]);
                          }
                        }}
                        className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all ${
                          isDraggingLogo 
                            ? 'border-emerald-500 bg-emerald-50/45' 
                            : 'border-neutral-250 bg-neutral-50/30 hover:border-emerald-400 hover:bg-neutral-50'
                        } cursor-pointer relative group`}
                      >
                        <input 
                          id="logo-file-upload"
                          type="file" 
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleLogoFile(e.target.files[0]);
                            }
                          }}
                          className="hidden" 
                        />
                        <label htmlFor="logo-file-upload" className="cursor-pointer block space-y-1.5 focus:outline-none">
                          <div className="flex justify-center">
                            <div className="w-9 h-9 bg-emerald-50/80 rounded-xl flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform duration-250">
                              <Upload className="w-4 h-4 text-emerald-600 animate-pulse" />
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-neutral-800">
                              Tarik & lepas logo di sini, atau <span className="text-emerald-600 underline">pilih berkas</span>
                            </p>
                            <p className="text-[10px] text-neutral-450 mt-0.5">
                              Mendukung format PNG, JPG, JPEG, WEBP, atau SVG (Maks. 1MB)
                            </p>
                          </div>
                        </label>
                      </div>

                      {/* URL input field as fallback */}
                      <div className="mt-3.5 space-y-1">
                        <label className="text-[9px] font-extrabold uppercase text-neutral-400 block">Atau masukkan URL gambar jika disimpan di tempat lain:</label>
                        <div className="flex gap-2.5 items-center">
                          <div className="w-10 h-10 bg-neutral-100 rounded-xl border border-neutral-200 flex items-center justify-center overflow-hidden shrink-0">
                            {lembaga.profile.logoUrl ? (
                              <img 
                                src={lembaga.profile.logoUrl} 
                                alt="Logo Preview" 
                                className="w-full h-full object-contain p-1"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="text-neutral-400 text-sm font-black">{lembaga.name.charAt(0)}</div>
                            )}
                          </div>
                          <input 
                            type="text" 
                            value={lembaga.profile.logoUrl || ''}
                            onChange={(e) => saveLembaga({ profile: { ...lembaga.profile, logoUrl: e.target.value } })}
                            className="w-full text-xs border border-neutral-200 rounded-xl p-2.5 bg-neutral-50 focus:bg-white focus:outline-emerald-600 transition-colors" 
                            placeholder="Salin/Tempel URL Gambar di sini (contoh: https://...)" 
                          />
                        </div>
                      </div>
                      
                      {/* Logo Presets Selection */}
                      <div className="mt-2.5">
                        <span className="text-[9px] font-extrabold uppercase text-neutral-400 block mb-1.5">Preset Logo Populer Lembaga:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { name: '🎓 Akademik', url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=60' },
                            { name: '💻 Komputer/IT', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&auto=format&fit=crop&q=60' },
                            { name: '✒️ Kejuruan/Seni', url: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?w=120&auto=format&fit=crop&q=60' },
                            { name: '👔 Bisnis/Karir', url: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=120&auto=format&fit=crop&q=60' },
                            { name: '✂️ Tata Busana', url: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=120&auto=format&fit=crop&q=60' },
                          ].map((preset) => (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => saveLembaga({ profile: { ...lembaga.profile, logoUrl: preset.url } })}
                              className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                                lembaga.profile.logoUrl === preset.url 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-3xs' 
                                  : 'bg-white hover:bg-neutral-50 text-neutral-600 border-neutral-200'
                              }`}
                            >
                              {preset.name}
                            </button>
                          ))}
                          {lembaga.profile.logoUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteConfirm({
                                  label: 'Logo Lembaga',
                                  onConfirm: () => {
                                    saveLembaga({ profile: { ...lembaga.profile, logoUrl: '' } });
                                  }
                                });
                              }}
                              className="text-[10px] font-bold px-2.5 py-1 rounded-lg border bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
                            >
                              Hapus Logo
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* NEW: Latar Belakang Bar / Banner Lembaga Section */}
                    <div className="border-t border-neutral-100 pt-5 mt-5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Gambar Latar Belakang Bar / Banner Lembaga (Unggah / Pilih Preset)</label>
                      
                      {/* Drag and Drop Zone for Banner */}
                      <div 
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingBanner(true);
                        }}
                        onDragLeave={() => {
                          setIsDraggingBanner(false);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingBanner(false);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            handleBannerFile(e.dataTransfer.files[0]);
                          }
                        }}
                        className={`border-2 border-dashed rounded-2xl p-4.5 text-center transition-all ${
                          isDraggingBanner 
                            ? 'border-emerald-500 bg-emerald-50/45' 
                            : 'border-neutral-250 bg-neutral-50/30 hover:border-emerald-400 hover:bg-neutral-50'
                        } cursor-pointer relative group`}
                      >
                        <input 
                          id="banner-file-upload"
                          type="file" 
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleBannerFile(e.target.files[0]);
                            }
                          }}
                          className="hidden" 
                        />
                        <label htmlFor="banner-file-upload" className="cursor-pointer block space-y-1.5 focus:outline-none">
                          <div className="flex justify-center">
                            <div className="w-9 h-9 bg-emerald-50/80 rounded-xl flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform duration-250">
                              <Upload className="w-4 h-4 text-emerald-600 animate-pulse" />
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-neutral-800">
                              Tarik & lepas foto latar belakang di sini, atau <span className="text-emerald-600 underline">pilih berkas</span>
                            </p>
                            <p className="text-[10px] text-neutral-450 mt-0.5">
                              Ukuran banner ideal rasio lebar (contoh: 1200x400) maks. 1MB
                            </p>
                          </div>
                        </label>
                      </div>

                      {/* URL input field for Banner */}
                      <div className="mt-3.5 space-y-1">
                        <label className="text-[9px] font-extrabold uppercase text-neutral-400 block block">Atau masukkan URL gambar custom:</label>
                        <div className="flex gap-2.5 items-center">
                          <div className="w-14 h-10 bg-neutral-100 rounded-xl border border-neutral-200 flex items-center justify-center overflow-hidden shrink-0">
                            {lembaga.profile.bannerUrl ? (
                              <img 
                                src={lembaga.profile.bannerUrl} 
                                alt="Banner Preview" 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="text-neutral-400 text-[10px] font-bold">Default</div>
                            )}
                          </div>
                          <input 
                            type="text" 
                            value={lembaga.profile.bannerUrl || ''}
                            onChange={(e) => saveLembaga({ profile: { ...lembaga.profile, bannerUrl: e.target.value } })}
                            className="w-full text-xs border border-neutral-200 rounded-xl p-2.5 bg-neutral-50 focus:bg-white focus:outline-emerald-600 transition-colors" 
                            placeholder="Salin/Tempel URL Gambar Latar Belakang (contoh: https://images.unsplash.com/photo-...)" 
                          />
                        </div>
                      </div>

                      {/* Banner Presets Selection */}
                      <div className="mt-2.5">
                        <span className="text-[9px] font-extrabold uppercase text-neutral-400 block mb-1.5">Preset Background Populer Lembaga:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { name: '🏫 Kelas Modern', url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1000&auto=format&fit=crop&q=80' },
                            { name: '💻 Lab Komputer', url: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1000&auto=format&fit=crop&q=80' },
                            { name: '🤝 Ruang Diskusi', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1000&auto=format&fit=crop&q=80' },
                            { name: '👗 Desain & Busana', url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1000&auto=format&fit=crop&q=80' },
                            { name: '🌟 Gelombang Premium', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80' },
                          ].map((preset) => (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => saveLembaga({ profile: { ...lembaga.profile, bannerUrl: preset.url } })}
                              className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                                lembaga.profile.bannerUrl === preset.url 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-3xs' 
                                  : 'bg-white hover:bg-neutral-50 text-neutral-600 border-neutral-200'
                              }`}
                            >
                              {preset.name}
                            </button>
                          ))}
                          {lembaga.profile.bannerUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteConfirm({
                                  label: 'Gambar Latar Belakang / Banner Lembaga',
                                  onConfirm: () => {
                                    saveLembaga({ profile: { ...lembaga.profile, bannerUrl: '' } });
                                  }
                                });
                              }}
                              className="text-[10px] font-bold px-2.5 py-1 rounded-lg border bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
                            >
                              Hapus Latar Belakang (Default)
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: SK LEMBAGA */}
              {activeProfileTab === 'sk_lembaga' && (
                <div className="border border-neutral-200/60 bg-slate-50/50 rounded-3xl p-6 animate-fade-in text-left">
                  {/* SUB-TABS SELECTOR */}
                  <div className="flex flex-wrap items-center gap-1 bg-neutral-100 p-1 rounded-2xl w-fit mb-6">
                    <button
                      type="button"
                      onClick={() => setSkLembagaActiveSubTab('profil_visi')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        skLembagaActiveSubTab === 'profil_visi'
                          ? 'bg-white text-indigo-700 shadow-xs'
                          : 'text-neutral-500 hover:text-neutral-800'
                      }`}
                    >
                      📄 SK Profil & Visi Misi
                    </button>
                    <button
                      type="button"
                      onClick={() => setSkLembagaActiveSubTab('struktur')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        skLembagaActiveSubTab === 'struktur'
                          ? 'bg-white text-indigo-700 shadow-xs'
                          : 'text-neutral-500 hover:text-neutral-800'
                      }`}
                    >
                      👥 SK Struktur & Pengurus
                    </button>
                  </div>

                  {skLembagaActiveSubTab === 'profil_visi' ? (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider mb-2">
                            <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> Surat Keputusan (SK) Lembaga
                          </span>
                          <h4 className="text-sm font-bold text-neutral-800">SK Penetapan Profil, Logo & Visi Misi</h4>
                          <p className="text-xs text-neutral-500 mt-1">Dokumen legalitas formal yang mengesahkan identitas, logo, serta visi-misi perjuangan Lembaga Anda.</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {skProfilDraftText ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                              ● Draf SK Tersedia
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                              ⚠️ Draf Belum Dibuat
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start mt-4">
                        {/* LEFT FORM COLUMN */}
                        <div className="bg-white border border-neutral-200 p-4.5 rounded-2xl space-y-4">
                          <h5 className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">1. Atribut & Legalitas SK</h5>
                          
                          <div>
                            <label className="block text-[9px] uppercase font-extrabold tracking-wide text-neutral-500 mb-1">Nomor SK Penetapan</label>
                            <input
                              type="text"
                              value={skProfilNumberInput}
                              onChange={(e) => setSkProfilNumberInput(e.target.value)}
                              placeholder="Contoh: 01/SK-DIR/Lembaga-WN/2026"
                              className="w-full text-xs p-3 border border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:outline-indigo-600 font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] uppercase font-extrabold tracking-wide text-neutral-500 mb-1">Tanggal Penetapan SK</label>
                            <input
                              type="date"
                              value={skProfilDateInput}
                              onChange={(e) => setSkProfilDateInput(e.target.value)}
                              className="w-full text-xs p-3 border border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:outline-indigo-600 font-mono"
                            />
                          </div>

                          <div className="border-t border-neutral-100 pt-3">
                            <button
                              type="button"
                              onClick={handleAIGenerateProfileSK}
                              disabled={isSkProfilGenerating}
                              className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-extrabold text-[10px] uppercase font-mono px-4 py-3 rounded-xl shadow-xs transition-all cursor-pointer"
                            >
                              {isSkProfilGenerating ? (
                                <>
                                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                  <span>Merumuskan Draf...</span>
                                </>
                              ) : (
                                <>
                                  <span>✨ Rumuskan SK dengan AI</span>
                                </>
                              )}
                            </button>
                            <p className="text-[9.5px] text-neutral-400 mt-2 text-center leading-relaxed">AI akan merangkum visi, misi, dan detail profil Anda ke dalam format legalitas formal.</p>
                          </div>
                        </div>

                        {/* RIGHT DRAF COLUMN */}
                        <div className="md:col-span-2 bg-white border border-neutral-200 rounded-2xl p-4.5 flex flex-col min-h-[380px]">
                          <div className="flex items-center justify-between border-b border-neutral-150 pb-3 mb-3">
                            <h5 className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">2. Isi Draf & Pratinjau SK</h5>
                            <div className="flex items-center gap-1.5">
                              {skProfilDraftText && (
                                <button
                                  type="button"
                                  onClick={() => setIsSkProfilEditing(!isSkProfilEditing)}
                                  className="px-2.5 py-1 text-[10px] font-bold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all cursor-pointer"
                                >
                                  {isSkProfilEditing ? "Selesai Edit" : "Edit Manual"}
                                </button>
                              )}
                            </div>
                          </div>

                          {skProfilDraftText ? (
                            <div className="flex-1 flex flex-col">
                              {isSkProfilEditing ? (
                                <textarea
                                  value={skProfilDraftText}
                                  onChange={(e) => {
                                    setSkProfilDraftText(e.target.value);
                                    saveLembaga({
                                      profile: {
                                        ...lembaga.profile,
                                        skProfilText: e.target.value
                                      }
                                    });
                                  }}
                                  rows={12}
                                  className="w-full flex-1 p-3 border border-neutral-200 rounded-xl bg-neutral-50 text-xs font-mono focus:bg-white focus:outline-indigo-600 leading-relaxed resize-none"
                                />
                              ) : (
                                <div className="flex-1 bg-neutral-50 border border-neutral-100 p-4 rounded-xl text-xs font-mono text-neutral-700 whitespace-pre-wrap overflow-y-auto max-h-[280px] leading-relaxed select-text">
                                  {skProfilDraftText}
                                </div>
                              )}

                              <div className="flex flex-wrap sm:flex-nowrap gap-2.5 mt-4 pt-3 border-t border-neutral-100">
                                <button
                                  type="button"
                                  onClick={handlePrintProfileSK}
                                  className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] uppercase font-mono px-4 py-3 rounded-xl shadow-xs transition-all cursor-pointer"
                                >
                                  <Download className="w-3.5 h-3.5 text-white" />
                                  <span>Cetak SK Sekarang</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    saveLembaga({
                                      profile: {
                                        ...lembaga.profile,
                                        skProfilText: skProfilDraftText,
                                        skProfilNumber: skProfilNumberInput,
                                        skProfilDate: skProfilDateInput
                                      }
                                    });
                                    alert('SK Berhasil Disimpan sebagai Ketetapan Resmi!');
                                  }}
                                  className="px-4 py-3 text-[10px] font-extrabold uppercase font-mono text-neutral-700 border border-neutral-200 hover:bg-neutral-50 rounded-xl transition-all cursor-pointer"
                                >
                                  Simpan SK
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-neutral-50/50 border border-dashed border-neutral-200 rounded-xl">
                              <BookOpen className="w-8 h-8 text-neutral-300 mb-2.5" />
                              <p className="text-xs font-bold text-neutral-600">Draf SK Belum Dirumuskan</p>
                              <p className="text-[11px] text-neutral-400 mt-1 max-w-[280px]">Gunakan tombol di panel kiri untuk merumuskan draf SK menggunakan asisten AI secara instan.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider mb-2">
                            <Users className="w-3.5 h-3.5 text-indigo-600" /> Surat Keputusan (SK) Lembaga
                          </span>
                          <h4 className="text-sm font-bold text-neutral-800">SK Penetapan Struktur Organisasi & Susunan Pengurus</h4>
                          <p className="text-xs text-neutral-500 mt-1">Dokumen legalitas formal yang menetapkan bagan pengurus, penanggung jawab, serta pembagian tugas kerja Lembaga.</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {skStrukturDraftText ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                              ● Draf SK Tersedia
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                              ⚠️ Draf Belum Dibuat
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start mt-4">
                        {/* LEFT FORM COLUMN */}
                        <div className="bg-white border border-neutral-200 p-4.5 rounded-2xl space-y-4">
                          <h5 className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">1. Atribut & Legalitas SK</h5>
                          
                          <div>
                            <label className="block text-[9px] uppercase font-extrabold tracking-wide text-neutral-500 mb-1">Nomor SK Struktur</label>
                            <input
                              type="text"
                              value={skStrukturNumberInput}
                              onChange={(e) => setSkStrukturNumberInput(e.target.value)}
                              placeholder="Contoh: 02/SK-DIR/Lembaga-WN/2026"
                              className="w-full text-xs p-3 border border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:outline-indigo-600 font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] uppercase font-extrabold tracking-wide text-neutral-500 mb-1">Tanggal Penetapan SK</label>
                            <input
                              type="date"
                              value={skStrukturDateInput}
                              onChange={(e) => setSkStrukturDateInput(e.target.value)}
                              className="w-full text-xs p-3 border border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:outline-indigo-600 font-mono"
                            />
                          </div>

                          <div className="border-t border-neutral-100 pt-3">
                            <button
                              type="button"
                              onClick={handleAIGenerateStrukturSK}
                              disabled={isSkStrukturGenerating}
                              className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-extrabold text-[10px] uppercase font-mono px-4 py-3 rounded-xl shadow-xs transition-all cursor-pointer"
                            >
                              {isSkStrukturGenerating ? (
                                <>
                                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                  <span>Merumuskan Draf...</span>
                                </>
                              ) : (
                                <>
                                  <span>✨ Rumuskan SK dengan AI</span>
                                </>
                              )}
                            </button>
                            <p className="text-[9.5px] text-neutral-400 mt-2 text-center leading-relaxed">AI akan merumuskan SK Susunan Pengurus lengkap dengan daftar nama personil Lembaga saat ini.</p>
                          </div>
                        </div>

                        {/* RIGHT DRAF COLUMN */}
                        <div className="md:col-span-2 bg-white border border-neutral-200 rounded-2xl p-4.5 flex flex-col min-h-[380px]">
                          <div className="flex items-center justify-between border-b border-neutral-150 pb-3 mb-3">
                            <h5 className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">2. Isi Draf & Pratinjau SK</h5>
                            <div className="flex items-center gap-1.5">
                              {skStrukturDraftText && (
                                <button
                                  type="button"
                                  onClick={() => setIsSkStrukturEditing(!isSkStrukturEditing)}
                                  className="px-2.5 py-1 text-[10px] font-bold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all cursor-pointer"
                                >
                                  {isSkStrukturEditing ? "Selesai Edit" : "Edit Manual"}
                                </button>
                              )}
                            </div>
                          </div>

                          {skStrukturDraftText ? (
                            <div className="flex-1 flex flex-col">
                              {isSkStrukturEditing ? (
                                <textarea
                                  value={skStrukturDraftText}
                                  onChange={(e) => {
                                    setSkStrukturDraftText(e.target.value);
                                    saveLembaga({
                                      profile: {
                                        ...lembaga.profile,
                                        skStrukturText: e.target.value
                                      }
                                    });
                                  }}
                                  rows={12}
                                  className="w-full flex-1 p-3 border border-neutral-200 rounded-xl bg-neutral-50 text-xs font-mono focus:bg-white focus:outline-indigo-600 leading-relaxed resize-none"
                                />
                              ) : (
                                <div className="flex-1 bg-neutral-50 border border-neutral-100 p-4 rounded-xl text-xs font-mono text-neutral-700 whitespace-pre-wrap overflow-y-auto max-h-[280px] leading-relaxed select-text">
                                  {skStrukturDraftText}
                                </div>
                              )}

                              <div className="flex flex-wrap sm:flex-nowrap gap-2.5 mt-4 pt-3 border-t border-neutral-100">
                                <button
                                  type="button"
                                  onClick={handlePrintStrukturSK}
                                  className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] uppercase font-mono px-4 py-3 rounded-xl shadow-xs transition-all cursor-pointer"
                                >
                                  <Download className="w-3.5 h-3.5 text-white" />
                                  <span>Cetak SK Sekarang</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    saveLembaga({
                                      profile: {
                                        ...lembaga.profile,
                                        skStrukturText: skStrukturDraftText,
                                        skStrukturNumber: skStrukturNumberInput,
                                        skStrukturDate: skStrukturDateInput
                                      }
                                    });
                                    alert('SK Berhasil Disimpan sebagai Ketetapan Resmi!');
                                  }}
                                  className="px-4 py-3 text-[10px] font-extrabold uppercase font-mono text-neutral-700 border border-neutral-200 hover:bg-neutral-50 rounded-xl transition-all cursor-pointer"
                                >
                                  Simpan SK
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-neutral-50/50 border border-dashed border-neutral-200 rounded-xl">
                              <Users className="w-8 h-8 text-neutral-300 mb-2.5" />
                              <p className="text-xs font-bold text-neutral-600">Draf SK Belum Dirumuskan</p>
                              <p className="text-[11px] text-neutral-400 mt-1 max-w-[280px]">Gunakan tombol di panel kiri untuk merumuskan draf SK menggunakan asisten AI secara instan.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB 2: SERTIFIKASI & LEGALITAS */}
              {activeProfileTab === 'legalitas' && (() => {
                const legalDocs = [
                  {
                    id: 'npsn' as const,
                    label: 'NPSN (Nomor Pokok Satuan Pendidikan Nasional)',
                    placeholder: 'Contoh: K9912345',
                    numValue: lembaga.profile.npsn || '',
                    numKey: 'npsn' as const,
                    fileValue: lembaga.profile.npsnFile || '',
                    fileNameValue: lembaga.profile.npsnFileName || '',
                    docTitle: 'Sertifikat Nomor Pokok Satuan Pendidikan Nasional (NPSN)',
                    icon: Landmark,
                    color: 'emerald',
                  },
                  {
                    id: 'skDisdik' as const,
                    label: 'Izin Dinas Pendidikan / No. SK Resmi',
                    placeholder: 'Contoh: 421.9/302-Disdik/2024',
                    numValue: lembaga.profile.skDisdik || '',
                    numKey: 'skDisdik' as const,
                    fileValue: lembaga.profile.skDisdikFile || '',
                    fileNameValue: lembaga.profile.skDisdikFileName || '',
                    docTitle: 'Surat Keputusan Izin Operasional Lembaga',
                    icon: ClipboardCheck,
                    color: 'indigo',
                  },
                  {
                    id: 'accreditation' as const,
                    label: 'Sertifikat Akreditasi Satuan (BAN-PDM / Kementerian)',
                    placeholder: 'Contoh: Terakreditasi B (Sangat Baik) oleh BAN-PDM',
                    numValue: lembaga.profile.accreditationRating || '',
                    numKey: 'accreditationRating' as const,
                    fileValue: lembaga.profile.accreditationFile || '',
                    fileNameValue: lembaga.profile.accreditationFileName || '',
                    docTitle: 'Sertifikat Ketetapan Akreditasi Pendidikan Satuan',
                    icon: ShieldAlert,
                    color: 'amber',
                  },
                  {
                    id: 'akta' as const,
                    label: 'AKTA Notaris Pendirian & Kemenkumham Lembaga',
                    placeholder: 'Contoh: No. 12 Tanggal 20 Januari 2024 oleh Notaris Ahmad, S.H.',
                    numValue: lembaga.profile.aktaNo || '',
                    numKey: 'aktaNo' as const,
                    fileValue: lembaga.profile.aktaFile || '',
                    fileNameValue: lembaga.profile.aktaFileName || '',
                    docTitle: 'Salinan Akta Pendirian Lembaga & SK Pengesahan Kemenkumham',
                    icon: Building,
                    color: 'rose',
                  },
                  {
                    id: 'npwp' as const,
                    label: 'NPWP Lembaga',
                    placeholder: 'Contoh: 12.345.678.9-012.000',
                    numValue: lembaga.profile.npwpNo || '',
                    numKey: 'npwpNo' as const,
                    fileValue: lembaga.profile.npwpFile || '',
                    fileNameValue: lembaga.profile.npwpFileName || '',
                    docTitle: 'Kartu Nomor Pokok Wajib Pajak (NPWP) Badan Lembaga',
                    icon: FileSpreadsheet,
                    color: 'cyan',
                  }
                ];

                return (
                  <div className="max-w-3xl space-y-5 animate-fade-in text-left">
                    <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-150 mb-4">
                      <p className="text-xs text-neutral-500 leading-relaxed font-semibold mb-1">
                        Informasi di bawah ini muncul sebagai legalitas hukum terpercaya di bagian <strong>Legalitas Lembaga</strong> pada landing page publik. Masukkan nomor register resmi dan unggah dokumen bukti fisik Anda untuk validasi. Anda bisa langsung melakukan cetak atau pratinjau dokumen dalam format popup sertifikat resmi.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {legalDocs.map((doc) => {
                        const IconComponent = doc.icon;
                        const hasFile = !!doc.fileValue;
                        
                        return (
                          <div 
                            key={doc.id} 
                            className="p-4 border border-neutral-200 rounded-3xl bg-white shadow-3xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-neutral-300 transition-colors"
                          >
                            <div className="flex-1 space-y-3">
                              {/* Header Label */}
                              <div className="flex items-center gap-2">
                                <span className={`p-2 rounded-xl border ${
                                  doc.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                  doc.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                  doc.color === 'amber' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                  doc.color === 'rose' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                  'bg-cyan-50 text-cyan-600 border-cyan-100'
                                }`}>
                                  <IconComponent className="w-4 h-4 shrink-0" />
                                </span>
                                <span className="text-xs font-bold text-neutral-800 uppercase font-mono tracking-wide">{doc.label}</span>
                              </div>

                              {/* Number Input */}
                              <div className="relative">
                                <input 
                                  type="text" 
                                  value={doc.numValue}
                                  onChange={(e) => {
                                    const updatedProfile = { ...lembaga.profile, [doc.numKey]: e.target.value };
                                    saveLembaga({ profile: updatedProfile });
                                  }}
                                  className="w-full text-xs font-bold font-mono border border-neutral-200 rounded-xl p-3 bg-neutral-50 focus:bg-white focus:outline-emerald-600 transition-colors" 
                                  placeholder={doc.placeholder}
                                />
                              </div>
                            </div>

                            {/* File Upload/Action Section */}
                            <div className="md:w-72 shrink-0 flex flex-col justify-center border-t md:border-t-0 md:border-l border-neutral-150 pt-4 md:pt-0 md:pl-4 space-y-2">
                              {hasFile ? (
                                <div className="space-y-2">
                                  {/* Uploaded Info Badge */}
                                  <div className="p-2.5 bg-emerald-50 border border-emerald-150 rounded-xl flex items-center gap-2">
                                    <div className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center shrink-0">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <div className="overflow-hidden">
                                      <p className="text-[10px] font-bold text-emerald-800 truncate" title={doc.fileNameValue}>
                                        {doc.fileNameValue || 'Berkas Terunggah'}
                                      </p>
                                      <p className="text-[8px] font-mono font-medium text-emerald-600/80 uppercase">Siap Dicetak & Preview</p>
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setPreviewDoc({
                                        title: doc.docTitle,
                                        type: doc.id,
                                        file: doc.fileValue,
                                        number: doc.numValue,
                                        filename: doc.fileNameValue
                                      })}
                                      className="flex-1 flex items-center justify-center gap-1.5 bg-neutral-950 hover:bg-neutral-850 text-white font-bold text-[10px] px-3 py-2 rounded-xl transition-all shadow-xs cursor-pointer uppercase font-mono"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      <span>Preview / Cetak</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleDocFileRemove(doc.id)}
                                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-150 p-2 rounded-xl transition-all cursor-pointer"
                                      title="Hapus Berkas"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <input 
                                    type="file"
                                    accept="image/*,application/pdf"
                                    id={`doc-upload-${doc.id}`}
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleDocFileUpload(file, doc.id);
                                    }}
                                  />
                                  <label 
                                    htmlFor={`doc-upload-${doc.id}`}
                                    className="w-full flex items-center justify-center gap-1.5 border border-dashed border-neutral-350 hover:border-emerald-600 hover:bg-emerald-50/20 text-neutral-555 hover:text-emerald-700 bg-neutral-50 font-bold text-[10px] py-4 px-3 rounded-2xl transition-all cursor-pointer select-none uppercase font-mono tracking-wider"
                                  >
                                    <Upload className="w-3.5 h-3.5 text-neutral-400 group-hover:text-emerald-600" />
                                    <span>Unggah Berkas</span>
                                  </label>
                                  <p className="text-[8px] text-center text-neutral-400 mt-1.5 leading-normal">Maksimal 1MB (PDF, PNG, JPG)</p>
                                </div>
                              )}
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* TAB 3: KEUNGGULAN Lembaga (HIGHLIGHTS) */}
              {activeProfileTab === 'keunggulan' && (
                <div className="space-y-4 animate-fade-in text-left">
                  <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-150 mb-2">
                    <p className="text-xs text-neutral-500 leading-relaxed font-semibold">
                      Ubah 4 poin keunggulan utama "Mengapa Memilih Lembaga Kami?" untuk disesuaikan dengan bidang kursus Anda (komputer, busana, kuliner, dsb).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {highlightsList.slice(0, 4).map((h, idx) => (
                      <div key={idx} className="p-4 border border-neutral-200 rounded-2xl bg-white space-y-3 shadow-3xs flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center font-mono text-[10px] font-bold">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-bold text-neutral-800 uppercase font-mono tracking-wider">Kartu Keunggulan {idx + 1}</span>
                          </div>
                          <div>
                            <label className="text-[9px] font-extrabold uppercase text-neutral-400 block mb-1">Judul Keunggulan</label>
                            <input 
                              type="text"
                              value={h.title}
                              onChange={(e) => handleUpdateHighlight(idx, 'title', e.target.value)}
                              className="w-full text-xs font-bold border border-neutral-200 rounded-xl p-2 bg-neutral-50 focus:bg-white focus:outline-emerald-600 transition-all"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-extrabold uppercase text-neutral-400 block mb-1">Deskripsi Singkat</label>
                            <textarea 
                              rows={2}
                              value={h.description}
                              onChange={(e) => handleUpdateHighlight(idx, 'description', e.target.value)}
                              className="w-full text-[11px] font-medium border border-neutral-200 rounded-xl p-2 bg-neutral-50 focus:bg-white focus:outline-emerald-600 transition-all leading-normal"
                            />
                          </div>
                        </div>

                        {/* File Upload/Action Section */}
                        <div className="border-t border-neutral-150 pt-3 mt-3 space-y-2">
                          <label className="text-[9px] font-extrabold uppercase text-neutral-400 block">Berkas Bukti Pendukung Keunggulan (Sertifikat / Foto / Dokumen)</label>
                          {h.file ? (
                            <div className="space-y-2">
                              {/* Uploaded Info Badge */}
                              <div className="p-2 bg-emerald-50 border border-emerald-150 rounded-xl flex items-center gap-2">
                                <div className="w-4 h-4 bg-emerald-600 text-white rounded-full flex items-center justify-center shrink-0">
                                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <div className="overflow-hidden flex-1">
                                  <p className="text-[10px] font-bold text-emerald-800 truncate" title={h.fileName}>
                                    {h.fileName || 'Berkas Terunggah'}
                                  </p>
                                  <p className="text-[8px] font-mono font-medium text-emerald-600/80 uppercase">Siap Dicetak & Preview</p>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setPreviewDoc({
                                    title: h.title || `Keunggulan ${idx + 1}`,
                                    type: `highlight-${idx}`,
                                    file: h.file,
                                    number: '',
                                    filename: h.fileName
                                  })}
                                  className="flex-1 flex items-center justify-center gap-1.5 bg-neutral-950 hover:bg-neutral-850 text-white font-bold text-[9px] px-3 py-2 rounded-xl transition-all shadow-xs cursor-pointer uppercase font-mono"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Preview / Cetak</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleHighlightFileRemove(idx)}
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-150 p-2 rounded-xl transition-all cursor-pointer"
                                  title="Hapus Berkas"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <input 
                                type="file"
                                accept="image/*,application/pdf"
                                id={`highlight-upload-${idx}`}
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleHighlightFileUpload(file, idx);
                                }}
                              />
                              <label 
                                htmlFor={`highlight-upload-${idx}`}
                                className="w-full flex items-center justify-center gap-1.5 border border-dashed border-neutral-350 hover:border-emerald-600 hover:bg-emerald-50/20 text-neutral-555 hover:text-emerald-700 bg-neutral-50 font-bold text-[9px] py-3.5 px-3 rounded-xl transition-all cursor-pointer select-none uppercase font-mono"
                              >
                                <Upload className="w-3 h-3 text-neutral-400 font-bold" />
                                <span>Unggah Berkas</span>
                              </label>
                              <p className="text-[8px] text-center text-neutral-400 mt-1 leading-normal">Maksimal 1MB (PDF, PNG, JPG)</p>
                            </div>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: TANYA JAWAB (FAQ) */}
              {activeProfileTab === 'faq' && (
                <div className="space-y-4 animate-fade-in text-left">
                  <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-150">
                    <p className="text-xs text-neutral-500 leading-relaxed font-medium">
                      Atur daftar pertanyaan dan jawaban yang sering diajukan pendaftar dalam forum FAQ. Pertanyaan ini akan interaktif dibuka tutup di website landing page.
                    </p>
                  </div>

                  {/* 🤖 ASISTEN AI FAQ */}
                  <div className="p-4 border border-indigo-150 bg-indigo-50/10 rounded-2xl space-y-3.5 shadow-3xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-700 animate-bounce" />
                      </div>
                      <div>
                        <span className="text-[11px] uppercase font-mono tracking-wider text-indigo-900 font-extrabold block">🤖 ASISTEN PENULIS FAQ AI</span>
                        <p className="text-[10px] text-neutral-500">Buat tanya-jawab berkualitas secara cepat disesuaikan dengan kurikulum Lembaga Anda.</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-neutral-500 block uppercase font-mono">Pilih Topik Pembahasan:</label>
                      <div className="flex flex-wrap gap-1.5">
                        {['Pendaftaran & Biaya', 'Sistem Pembelajaran', 'Fasilitas & Lab', 'Sertifikat & Kelulusan', 'Kemitraan Kerja', 'Custom'].map((topic) => (
                          <button
                            key={topic}
                            type="button"
                            onClick={() => setAiFaqTopic(topic)}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border-b-2 cursor-pointer transition-all ${
                              aiFaqTopic === topic
                                ? 'bg-indigo-600 text-white border-indigo-800'
                                : 'bg-white text-neutral-700 border-neutral-250 hover:bg-neutral-50'
                            }`}
                          >
                            {topic}
                          </button>
                        ))}
                      </div>

                      {aiFaqTopic === 'Custom' && (
                        <div className="mt-2">
                          <input
                            type="text"
                            value={aiFaqCustomTopic}
                            onChange={(e) => setAiFaqCustomTopic(e.target.value)}
                            placeholder="Tulis topik khusus Anda (misal: Diskon akhir tahun, Kelas Akhir Pekan)..."
                            className="w-full text-xs border border-neutral-200 rounded-xl p-2.5 bg-white focus:outline-indigo-650 font-semibold"
                          />
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleAIGenerateFaq}
                      disabled={aiFaqLoading}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-neutral-400 disabled:to-neutral-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wide"
                    >
                      {aiFaqLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                          <span>AI Sedang Berpikir & Merancang FAQ Terbaik...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-white" />
                          <span>Buat 3 FAQ Otomatis dengan AI</span>
                        </>
                      )}
                    </button>

                    {/* AI Generated FAQ List for Preview and Selection */}
                    {aiGeneratedFaqs.length > 0 && (
                      <div className="border border-indigo-100 bg-white rounded-xl p-3 space-y-3.5">
                        <div className="flex justify-between items-center pb-2 border-b border-indigo-50">
                          <span className="text-[10px] uppercase font-mono font-bold text-indigo-900">📚 Preview FAQ Hasil AI</span>
                          <span className="text-[10px] text-neutral-400">Centang untuk memasukkan ke halaman depan</span>
                        </div>

                        <div className="space-y-3">
                          {aiGeneratedFaqs.map((faq, idx) => (
                            <div key={idx} className="p-2.5 bg-white border border-neutral-150 rounded-lg space-y-1 hover:border-indigo-200 transition-colors">
                              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={!!faq.selected}
                                  onChange={(e) => {
                                    const next = [...aiGeneratedFaqs];
                                    next[idx].selected = e.target.checked;
                                    setAiGeneratedFaqs(next);
                                  }}
                                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                                <div className="space-y-1">
                                  <p className="text-xs font-bold text-neutral-800">🤔 {faq.q}</p>
                                  <p className="text-[11px] text-neutral-500 leading-normal">{faq.a}</p>
                                </div>
                              </label>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setAiGeneratedFaqs([])}
                            className="px-3.5 py-1.5 text-[10px] border border-neutral-300 text-neutral-600 bg-white hover:bg-neutral-50 rounded-xl font-bold transition-all cursor-pointer"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={handleImportAIFaqs}
                            className="px-3.5 py-1.5 text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1 uppercase"
                          >
                            <Plus className="w-3 h-3 text-white" />
                            <span>Impor ke Website</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Form Tambah FAQ */}
                  <form onSubmit={handleAddFaq} className="p-4 border border-emerald-100 bg-emerald-50/20 rounded-2xl space-y-3">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-800 font-black">➕ Tambah Tanya Jawab (FAQ) Baru</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <input 
                          type="text"
                          value={newFaqQ}
                          onChange={(e) => setNewFaqQ(e.target.value)}
                          placeholder="Ketik Pertanyaan... (misal: Berapa lama pendaftaran dibuka?)"
                          className="w-full text-xs border border-neutral-200 rounded-xl p-2.5 bg-white focus:outline-emerald-600"
                        />
                      </div>
                      <div>
                        <input 
                          type="text"
                          value={newFaqA}
                          onChange={(e) => setNewFaqA(e.target.value)}
                          placeholder="Ketik Jawaban Lengkap..."
                          className="w-full text-xs border border-neutral-200 rounded-xl p-2.5 bg-white focus:outline-emerald-600"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1 ml-auto uppercase"
                    >
                      <Plus className="w-3 h-3 text-white" />
                      <span>Masukkan Ke Daftar</span>
                    </button>
                  </form>

                  {/* Daftar FAQ List */}
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {fAQList.map((f, index) => (
                      <div key={index} className="p-3 bg-white border border-neutral-150 rounded-xl flex items-start justify-between gap-4 hover:border-neutral-300 transition-colors">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-neutral-800">🤔 {f.q}</p>
                          <p className="text-[11px] text-neutral-500 leading-normal pl-5">{f.a}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteFaq(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                          title="Hapus FAQ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* MODULE: STRUKTUR ORGANISASI */}
        {activeModule === 'struktur' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">Struktur Organisasi</h3>
                <p className="text-xs text-neutral-500">Reka bagan keorganisasian untuk representasi hierarki standar tata kelola.</p>
              </div>
              <Users className="w-5 h-5 text-neutral-400" />
            </div>

            {/* Bagian Visualisasi Sederhana */}
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-emerald-800">Visual Peta Hierarki Organisasi (Multilevel)</span>
                  <span className="text-[10px] bg-emerald-600/10 text-emerald-800 font-mono font-bold px-2 py-0.5 rounded-full">
                    Mendukung Tak Terbatas Tingkat
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={printOrgChart}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5 border border-emerald-600"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Bagan & Tugas (A4 PDF)</span>
                  </button>
                  <button 
                    onClick={() => {
                      setNewNode({ name: '', role: '', parentId: '', rights: '', duties: '' });
                      setActiveAddModal('struktur');
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5 border border-emerald-600"
                  >
                    <Plus className="w-3.5 h-3.5 text-white" />
                    <span>Tambah Anggota Struktur</span>
                  </button>
                </div>
              </div>
              <div className="p-2 border border-emerald-150/40 bg-white/70 rounded-xl">
                <div className="flex flex-col items-center justify-center gap-4 py-4 overflow-x-auto">
                  {renderCompleteOrgTree()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODULE: PROGRAM KURSUS & HARGA JUAL */}
        {activeModule === 'program' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">Program Kursus & Harga Jual</h3>
                <p className="text-xs text-neutral-500">Atur kurikulum program yang dipasarkan beserta rincian rincian harga kelas.</p>
              </div>
              <FolderKanban className="w-5 h-5 text-neutral-400" />
            </div>

            {/* Tombol Tambah Program */}
            <div className="flex justify-end">
              <button 
                onClick={() => {
                  setNewProgram({ name: '', price: 0, regFee: 0, tuitionFee: 0, monthlyFee: 0, duration: '3 Bulan', description: '', status: 'Aktif' });
                  setActiveAddModal('program');
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs py-2 px-4 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Tambah Program Kursus</span>
              </button>
            </div>

            {/* List programs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lembaga.programs.map(p => {
                return (
                  <div key={p.id} className="border border-neutral-100 rounded-xl p-5 flex flex-col justify-between hover:border-emerald-500 hover:shadow-3xs transition-all bg-white relative">
                    <div className="absolute top-4 right-4 flex gap-1 items-center">
                      <button 
                        onClick={() => startEditProgram(p)}
                        className="text-neutral-300 hover:text-emerald-600 transition-colors cursor-pointer p-1"
                        title="Edit Program"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => removeProgram(p.id)}
                        className="text-neutral-300 hover:text-red-500 transition-colors cursor-pointer p-1"
                        title="Hapus Program"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div>
                      <span className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2">
                        {p.duration}
                      </span>
                      <h4 className="font-bold text-neutral-800 text-sm mb-1 uppercase tracking-tight">{p.name}</h4>
                      <p className="text-xs text-neutral-500 mb-4">{p.description || 'Tidak ada deskripsi.'}</p>
                    </div>
                    <div className="border-t border-neutral-100 pt-3 space-y-1.55">
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-450">Biaya Daftar:</span>
                        <span className="font-semibold text-neutral-700 font-mono">
                          Rp {(p.regFee || 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-450">Biaya Kursus:</span>
                        <span className="font-semibold text-neutral-700 font-mono">
                          Rp {(p.tuitionFee || p.price || 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-450">Iuran Bulanan:</span>
                        <span className="font-semibold text-neutral-700 font-mono">
                          Rp {(p.monthlyFee || 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs border-t border-neutral-100 pt-2 font-bold">
                        <span className="text-neutral-800">Total Biaya:</span>
                        <span className="text-emerald-600 font-mono">
                          Rp {(p.price || 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MODULE: KALENDER AKADEMIK */}
        {activeModule === 'kalender' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">Kalender Akademik</h3>
                <p className="text-xs text-neutral-500">Timeline jadwal pendaftaran, masa belajar, ujian, dan pembagian kelulusan.</p>
              </div>
              <Calendar className="w-5 h-5 text-neutral-400" />
            </div>

            {/* Tombol Tambah Kegiatan */}
            <div className="flex justify-end">
              <button 
                onClick={() => {
                  setNewEvent({ title: '', date: new Date().toISOString().split('T')[0], type: 'Akademik' });
                  setActiveAddModal('kalender');
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs py-2 px-4 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Tambah Kegiatan Kalender</span>
              </button>
            </div>

            {/* List Agenda */}
            <div className="space-y-2">
              {[...lembaga.calendar]
                .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map(ev => {
                  let badgeColor = 'bg-blue-50 text-blue-800 border-blue-200';
                  if (ev.type === 'Ujian') badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
                  if (ev.type === 'Libur') badgeColor = 'bg-red-50 text-red-800 border-red-200';
                  if (ev.type === 'Kegiatan') badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                  
                  return (
                    <div key={ev.id} className="p-3 border border-neutral-100 rounded-xl flex items-center justify-between hover:bg-neutral-50/50 bg-white">
                      <div className="flex items-center gap-3">
                        <div className="text-center bg-neutral-100 p-2 rounded-xl text-neutral-800 min-w-[60px]">
                          <p className="text-[10px] uppercase font-mono text-neutral-400">TGL</p>
                          <p className="font-bold text-xs">{ev.date.split('-')[2]}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-800">{ev.title}</p>
                          <span className={`inline-block border text-[9px] font-semibold px-2 py-0.5 rounded-full mt-1 ${badgeColor}`}>
                            {ev.type}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1.5 items-center font-semibold text-xs">
                        <button 
                          onClick={() => startEditEvent(ev)}
                          className="text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg cursor-pointer flex items-center gap-1"
                          title="Edit Kegiatan"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button 
                          onClick={() => removeEvent(ev.id)}
                          className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg cursor-pointer flex items-center gap-1"
                          title="Hapus Kegiatan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* MODULE: JADWAL & PENGAJAR */}
        {activeModule === 'jadwal' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">Jadwal & Pengajar</h3>
                <p className="text-xs text-neutral-500">Daftarkan instruktur pengajar dan atur penempatan waktu materi kelas secara real-time.</p>
              </div>
              <Clock className="w-5 h-5 text-neutral-400" />
            </div>

            {/* Pengajar/Guru database admin */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quick Actions & Stats */}
              <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-150 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="font-bold text-neutral-800 text-sm">Kelola Staff Pengajar (Instruktur)</h4>
                  <p className="text-xs text-neutral-500 mt-1">Tambahkan pengajar bersertifikasi dan kaitkan dengan bidang spesialisasi kursus.</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setNewTeacher({ name: '', specialty: '' });
                      setActiveAddModal('instruktur');
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-white" />
                    <span>Tambah Instruktur</span>
                  </button>
                  <button 
                    onClick={() => {
                      setNewSchedule({ programId: '', teacherId: '', day: 'Senin', time: '08:00 - 10:00', room: 'Lab A' });
                      setActiveAddModal('jadwal');
                    }}
                    className="flex-1 bg-emerald-50 hover:bg-emerald-105 text-emerald-800 border border-emerald-250 font-medium text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-emerald-800" />
                    <span>Buat Slot Jadwal</span>
                  </button>
                </div>
              </div>

              {/* List Guru */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-neutral-600 block">Daftar Instruktur Tersimpan</span>
                <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
                  {lembaga.teachers.map(t => {
                    return (
                      <div key={t.id} className="p-3 border border-neutral-100 rounded-xl flex items-center justify-between text-xs hover:bg-neutral-50/50 bg-white shadow-3xs">
                        <div>
                          <p className="font-semibold text-neutral-800 text-xs">{t.name}</p>
                          <p className="text-[10px] text-neutral-500">{t.specialty}</p>
                        </div>
                        <div className="flex gap-1.5 font-semibold text-[10px]">
                          <button 
                            onClick={() => startEditTeacher(t)}
                            className="text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg gap-1 inline-flex items-center cursor-pointer"
                            title="Edit Instruktur"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button 
                            onClick={() => removeTeacher(t.id)}
                            className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg gap-1 inline-flex items-center cursor-pointer"
                            title="Hapus Instruktur"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* List Jadwal Slot */}
            <div className="border-t border-neutral-100 pt-4 space-y-3">
              <span className="text-xs font-semibold text-neutral-600 block">Jadwal Operasional Belajar-Mengajar</span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {lembaga.schedule.map(sch => {
                  const programName = lembaga.programs.find(p => p.id === sch.programId)?.name || 'Materi';
                  const teacherName = lembaga.teachers.find(t => t.id === sch.teacherId)?.name || 'Pengajar';
                  return (
                    <div key={sch.id} className="bg-white border border-neutral-100 rounded-xl p-3 shadow-2xs hover:border-emerald-600 transition-all flex flex-col justify-between relative group">
                      <div className="absolute top-2.5 right-2.5 flex gap-1 items-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity bg-white p-0.5 rounded-md shadow-3xs text-[10px] font-semibold border border-neutral-100">
                        <button 
                          onClick={() => startEditSchedule(sch)}
                          className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 p-1 rounded-lg cursor-pointer flex items-center gap-0.5"
                          title="Edit Jadwal"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button 
                          onClick={() => removeSchedule(sch.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-lg cursor-pointer flex items-center gap-0.5"
                          title="Hapus Jadwal"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Hapus</span>
                        </button>
                      </div>
                      <div>
                        <span className="bg-emerald-50 text-emerald-800 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-100">
                          {sch.day}
                        </span>
                        <h5 className="font-semibold text-neutral-800 text-xs mt-2">{programName}</h5>
                        <p className="text-[10px] text-neutral-500 italic mt-0.5">Instruktur: {teacherName}</p>
                      </div>
                      <div className="border-t border-neutral-50 pt-2 mt-2 flex justify-between text-[10px] text-neutral-400 font-mono">
                        <span>🕒 {sch.time}</span>
                        <span>📍 {sch.room}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* MODULE: ABSENSI */}
        {activeModule === 'absensi' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">Absensi Harian</h3>
                <p className="text-xs text-neutral-500">Pencatatan rekapitulasi kehadiran siswa harian untuk syarat akreditasi.</p>
              </div>
              <ClipboardCheck className="w-5 h-5 text-neutral-400" />
            </div>

            {/* Date Selector */}
            <div className="flex items-center gap-3 bg-neutral-50 p-4 rounded-xl">
              <span className="text-xs font-semibold text-neutral-700">Pilih Tanggal Sesi</span>
              <input 
                type="date" 
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="text-xs p-2 border border-neutral-200 rounded bg-white shadow-3xs" 
              />
            </div>

            {/* List Siswa & Status toggle */}
            <div className="overflow-x-auto border border-neutral-100 rounded-xl">
              <table className="w-full text-sm text-left">
                <thead className="bg-neutral-50 text-neutral-600 font-medium text-xs uppercase">
                  <tr>
                    <th className="p-3">Nama Siswa / NIK</th>
                    <th className="p-3">Program yang Diikuti</th>
                    <th className="p-3">Status Kehadiran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {students.map(std => {
                    const programName = lembaga.programs.find(p => p.id === std.programId)?.name || 'Program';
                    
                    // find attendance for selected date
                    const currentStatus = lembaga.attendance.find(a => a.studentId === std.id && a.date === attendanceDate)?.status || 'Hadir';

                    return (
                      <tr key={std.id} className="hover:bg-neutral-50/50">
                        <td className="p-3">
                          <p className="font-semibold text-neutral-800 text-xs">{std.name}</p>
                          <p className="text-[9px] text-neutral-400 font-mono mt-0.5">NIK: {std.nik}</p>
                        </td>
                        <td className="p-3 text-xs text-neutral-500">{programName}</td>
                        <td className="p-3">
                          <div className="flex gap-1.5">
                            {[
                              { id: 'Hadir', label: 'Hadir (H)', style: 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-600 hover:text-white', activeStyle: 'bg-emerald-600 text-white border-emerald-600' },
                              { id: 'Sakit', label: 'Sakit (S)', style: 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-600 hover:text-white', activeStyle: 'bg-amber-600 text-white border-amber-600' },
                              { id: 'Izin', label: 'Izin (I)', style: 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-600 hover:text-white', activeStyle: 'bg-blue-600 text-white border-blue-600' },
                              { id: 'Alpha', label: 'Alpha (A)', style: 'bg-red-50 text-red-800 border-red-300 hover:bg-red-600 hover:text-white', activeStyle: 'bg-red-600 text-white border-red-600' }
                            ].map(statusBtn => (
                              <button
                                key={statusBtn.id}
                                onClick={() => handleAttendanceChange(std.id, statusBtn.id as any)}
                                className={`text-[10px] font-medium px-2.5 py-1 rounded-lg border transition-all ${
                                  currentStatus === statusBtn.id ? statusBtn.activeStyle : statusBtn.style
                                }`}
                              >
                                {statusBtn.label}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="text-[10px] text-neutral-400 italic">
              * Perubahan status kehadiran langsung disimpan secara otomatis untuk tanggal sesi yang dipilih.
            </div>
          </div>
        )}

        {/* MODULE: SARANA PRASARANA */}
        {activeModule === 'sarpras' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">Sarana Prasarana (Inventaris)</h3>
                <p className="text-xs text-neutral-500">Pendataan sarana alat penunjang praktek belajar untuk penilaian mutu akreditasi Lembaga Kursus.</p>
              </div>
              <MapPin className="w-5 h-5 text-neutral-400" />
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-neutral-100 shadow-3xs">
              <div className="flex bg-neutral-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFacilityViewMode('grouped')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    facilityViewMode === 'grouped'
                      ? 'bg-white text-emerald-750 shadow-3xs'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grup per Prasarana (Tata Ruang)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFacilityViewMode('flat')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    facilityViewMode === 'flat'
                      ? 'bg-white text-emerald-750 shadow-3xs'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Daftar Flat Semua Sarana</span>
                </button>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowAddRoomInline(!showAddRoomInline)}
                  className="flex-1 sm:flex-initial border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-bold text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Home className="w-3.5 h-3.5 text-neutral-500" />
                  <span>+ Tambah Prasarana (Ruang)</span>
                </button>
                <button 
                  onClick={() => {
                    setNewFacility({ name: '', quantity: 1, condition: 'Baik', location: '' });
                    setActiveAddModal('sarana');
                  }}
                  className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-white" />
                  <span>+ Tambah Sarana (Barang)</span>
                </button>
              </div>
            </div>

            {/* Inline add Room Form */}
            {showAddRoomInline && (
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4.5 animate-fade-in space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <Home className="w-4 h-4 text-emerald-600" />
                    <span>Tambah Ruang / Prasarana Baru</span>
                  </h4>
                  <button 
                    onClick={() => setShowAddRoomInline(false)}
                    className="text-neutral-400 hover:text-neutral-600 font-bold text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="Contoh: Lab Komputer B, Ruang Kelas Teori 03, Perpustakaan"
                    className="flex-1 text-xs p-2.5 border border-neutral-200 rounded-lg bg-white focus:outline-emerald-600 focus:ring-0"
                  />
                  <button
                    onClick={() => {
                      if (!newRoomName.trim()) return alert('Nama prasarana/ruangan wajib diisi!');
                      const normalizedName = newRoomName.trim();
                      if (emptyRooms.includes(normalizedName) || lembaga.facilities.some(f => f.location === normalizedName)) {
                        return alert('Prasarana/ruangan ini sudah terdaftar!');
                      }
                      setEmptyRooms([...emptyRooms, normalizedName]);
                      setExpandedLocations(prev => ({ ...prev, [normalizedName]: true }));
                      setNewRoomName('');
                      setShowAddRoomInline(false);
                      alert(`Prasarana "${normalizedName}" berhasil didaftarkan! Silakan tambahkan barang sarana di dalamnya.`);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 rounded-lg cursor-pointer shrink-0"
                  >
                    Simpan Ruang
                  </button>
                </div>
              </div>
            )}

            {/* List View logic */}
            {facilityViewMode === 'grouped' ? (
              <div className="space-y-4">
                {(() => {
                  const uniqueLocations = Array.from(new Set([
                    ...lembaga.facilities.map(f => f.location || 'Ruang Umum / Belum Ditentukan'),
                    ...emptyRooms
                  ])).filter(Boolean);

                  if (uniqueLocations.length === 0) {
                    return (
                      <div className="bg-white border border-neutral-200 rounded-2xl p-10 text-center text-neutral-500">
                        <MapPin className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                        <p className="text-xs font-bold text-neutral-700">Belum ada data Sarana Prasarana</p>
                        <p className="text-[11px] text-neutral-400 mt-1">Silakan klik tombol di atas untuk mendaftarkan ruangan atau barang inventaris baru.</p>
                      </div>
                    );
                  }

                  return uniqueLocations.map(loc => {
                    const roomItems = lembaga.facilities.filter(f => (f.location || 'Ruang Umum / Belum Ditentukan') === loc);
                    const totalUnits = roomItems.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
                    const isExpanded = expandedLocations[loc] !== false; // Expanded by default

                    return (
                      <div key={loc} className="border border-neutral-150 rounded-2xl bg-white shadow-3xs overflow-hidden transition-all">
                        {/* Accordion/Card Header */}
                        <div className="bg-neutral-50/50 p-4 flex items-center justify-between gap-4 border-b border-neutral-100">
                          <button
                            type="button"
                            onClick={() => setExpandedLocations(prev => ({ ...prev, [loc]: !isExpanded }))}
                            className="flex items-center gap-3 text-left focus:outline-none flex-1 group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center transition-colors group-hover:bg-emerald-100">
                              <Building className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-neutral-800 transition-colors group-hover:text-emerald-700">{loc}</h4>
                              <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider mt-0.5">
                                PRASARANA • {roomItems.length} JENIS SARANA ({totalUnits} UNIT BARANG)
                              </p>
                            </div>
                          </button>
                          
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => {
                                setNewFacility({ name: '', quantity: 1, condition: 'Baik', location: loc });
                                setActiveAddModal('sarana');
                              }}
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10.5px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                              title={`Tambah Sarana ke ${loc}`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span className="max-sm:hidden">Tambah Sarana</span>
                            </button>
                            <button
                              onClick={() => setExpandedLocations(prev => ({ ...prev, [loc]: !isExpanded }))}
                              className="text-neutral-400 hover:text-neutral-600 p-1.5 rounded-lg hover:bg-neutral-150 transition-colors cursor-pointer"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="p-2.5 sm:p-4">
                            {roomItems.length === 0 ? (
                              <div className="py-8 text-center text-neutral-400 bg-neutral-50/30 rounded-xl border border-dashed border-neutral-150">
                                <MapPin className="w-6 h-6 text-neutral-300 mx-auto mb-1.5" />
                                <p className="text-xs font-semibold text-neutral-600">Belum ada Sarana terdaftar di ruangan ini</p>
                                <p className="text-[10px] text-neutral-400 mt-0.5">Silakan tambahkan sarana (alat/barang) untuk mengisi prasarana {loc}.</p>
                                <button
                                  onClick={() => {
                                    setNewFacility({ name: '', quantity: 1, condition: 'Baik', location: loc });
                                    setActiveAddModal('sarana');
                                  }}
                                  className="mt-3 bg-white border border-neutral-200 hover:bg-neutral-50 text-emerald-700 font-bold text-[10px] px-3 py-1.5 rounded-lg shadow-3xs inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Isi Sarana Sekarang</span>
                                </button>
                              </div>
                            ) : (
                              <div className="overflow-x-auto rounded-xl border border-neutral-100">
                                <table className="w-full text-sm text-left">
                                  <thead className="bg-neutral-50 text-neutral-500 font-bold text-[10.5px] uppercase tracking-wider border-b border-neutral-100">
                                    <tr>
                                      <th className="p-3">Spesifikasi Sarana (Alat / Barang)</th>
                                      <th className="p-3 text-center">Volume Unit</th>
                                      <th className="p-3">Kondisi Fisik</th>
                                      <th className="p-3 text-right">Aksi</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-neutral-100 text-xs text-neutral-700">
                                    {roomItems.map(item => {
                                      let condColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                                      if (item.condition === 'Rusak Ringan') condColor = 'bg-amber-50 text-amber-800 border-amber-200';
                                      if (item.condition === 'Rusak Berat') condColor = 'bg-red-50 text-red-800 border-red-200';

                                      return (
                                        <tr key={item.id} className="hover:bg-neutral-50/40">
                                          <td className="p-3 font-semibold text-neutral-800">
                                            <div className="flex items-center gap-2.5">
                                              {item.photoUrl ? (
                                                <button
                                                  type="button"
                                                  onClick={() => setActiveFacilityPhotoPreview(item.photoUrl || null)}
                                                  className="w-9 h-9 rounded-lg overflow-hidden border border-neutral-200 hover:border-emerald-500 hover:ring-2 hover:ring-emerald-200 transition-all cursor-pointer relative shrink-0 group"
                                                  title="Klik untuk lihat foto penuh"
                                                >
                                                  <img src={item.photoUrl} alt={item.name} className="w-full h-full object-cover" />
                                                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <Camera className="w-3 h-3 text-white" />
                                                  </div>
                                                </button>
                                              ) : (
                                                <div className="w-9 h-9 rounded-lg bg-neutral-50 border border-neutral-100 text-neutral-400 flex items-center justify-center shrink-0">
                                                  <Building className="w-4 h-4 text-neutral-400" />
                                                </div>
                                              )}
                                              <div>
                                                <div className="font-semibold text-neutral-800">{item.name}</div>
                                                {item.documentUrl && (
                                                  <a
                                                    href={item.documentUrl}
                                                    download={`dokumen_${item.name.toLowerCase().replace(/\s+/g, '_')}`}
                                                    className="inline-flex items-center gap-1 text-[9px] text-emerald-700 hover:text-emerald-900 bg-emerald-50 border border-emerald-150 px-1.5 py-0.5 rounded-md mt-0.5 font-medium transition-colors cursor-pointer"
                                                  >
                                                    <FileText className="w-2.5 h-2.5 text-emerald-600" />
                                                    <span>Unduh Dokumen</span>
                                                  </a>
                                                )}
                                              </div>
                                            </div>
                                          </td>
                                          <td className="p-3 text-center font-mono font-bold text-neutral-900">{item.quantity} Unit</td>
                                          <td className="p-3">
                                            <span className={`border text-[9px] font-medium px-2 py-0.5 rounded-full ${condColor}`}>
                                              {item.condition}
                                            </span>
                                          </td>
                                          <td className="p-3 text-right whitespace-nowrap font-semibold">
                                            <button
                                              onClick={() => startEditFacility(item)}
                                              className="text-emerald-600 hover:text-emerald-850 hover:bg-emerald-50 px-2.5 py-1 rounded-lg gap-1 inline-flex items-center cursor-pointer transition-colors"
                                              title="Edit Inventaris"
                                            >
                                              <Pencil className="w-3.5 h-3.5" />
                                              <span>Edit</span>
                                            </button>
                                            <button
                                              onClick={() => removeFacility(item.id)}
                                              className="text-red-550 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-lg gap-1 inline-flex items-center cursor-pointer ml-1.5 transition-colors"
                                              title="Hapus Inventaris"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                              <span>Hapus</span>
                                            </button>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            ) : (
              /* Flat List View */
              <div className="space-y-4">
                <div className="overflow-x-auto border border-neutral-100 rounded-2xl bg-white shadow-3xs">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-neutral-50 text-neutral-600 font-semibold text-xs border-b border-neutral-100">
                      <tr>
                        <th className="p-3">Nama Sarana (Alat / Barang)</th>
                        <th className="p-3 text-center">Volume Unit</th>
                        <th className="p-3">Lokasi Penempatan (Prasarana)</th>
                        <th className="p-3">Kondisi</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-xs text-neutral-700">
                      {lembaga.facilities.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-neutral-400">
                            Belum ada sarana terdaftar.
                          </td>
                        </tr>
                      ) : (
                        lembaga.facilities.map(item => {
                          let condColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                          if (item.condition === 'Rusak Ringan') condColor = 'bg-amber-50 text-amber-800 border-amber-200';
                          if (item.condition === 'Rusak Berat') condColor = 'bg-red-50 text-red-800 border-red-200';

                          return (
                            <tr key={item.id} className="hover:bg-neutral-50/50">
                              <td className="p-3 font-semibold text-neutral-800">
                                <div className="flex items-center gap-2.5">
                                  {item.photoUrl ? (
                                    <button
                                      type="button"
                                      onClick={() => setActiveFacilityPhotoPreview(item.photoUrl || null)}
                                      className="w-9 h-9 rounded-lg overflow-hidden border border-neutral-200 hover:border-emerald-500 hover:ring-2 hover:ring-emerald-200 transition-all cursor-pointer relative shrink-0 group"
                                      title="Klik untuk lihat foto penuh"
                                    >
                                      <img src={item.photoUrl} alt={item.name} className="w-full h-full object-cover" />
                                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Camera className="w-3 h-3 text-white" />
                                      </div>
                                    </button>
                                  ) : (
                                    <div className="w-9 h-9 rounded-lg bg-neutral-100 text-neutral-400 flex items-center justify-center shrink-0">
                                      <Building className="w-4 h-4 text-neutral-405" />
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-semibold text-neutral-800">{item.name}</div>
                                    {item.documentUrl && (
                                      <a
                                        href={item.documentUrl}
                                        download={`dokumen_${item.name.toLowerCase().replace(/\s+/g, '_')}`}
                                        className="inline-flex items-center gap-1 text-[9px] text-emerald-700 hover:text-emerald-900 bg-emerald-50 border border-emerald-150 px-1.5 py-0.5 rounded-md mt-0.5 font-medium transition-colors cursor-pointer"
                                      >
                                        <FileText className="w-2.5 h-2.5 text-emerald-600" />
                                        <span>Unduh Dokumen</span>
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-center font-mono font-bold">{item.quantity} Unit</td>
                              <td className="p-3 font-semibold text-emerald-700">{item.location}</td>
                              <td className="p-3">
                                <span className={`border text-[9px] font-medium px-2 py-0.5 rounded-full ${condColor}`}>
                                  {item.condition}
                                </span>
                              </td>
                              <td className="p-3 text-right whitespace-nowrap font-semibold">
                                <button
                                  onClick={() => startEditFacility(item)}
                                  className="text-emerald-600 hover:text-emerald-850 hover:bg-emerald-50 px-2.5 py-1 rounded-lg gap-1 inline-flex items-center cursor-pointer"
                                  title="Edit Inventaris"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => removeFacility(item.id)}
                                  className="text-red-550 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-lg gap-1 inline-flex items-center cursor-pointer ml-1.5"
                                  title="Hapus Inventaris"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Hapus</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODULE: ANGGARAN & RAB */}
        {activeModule === 'rab' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">Rencana Anggaran & Belanja (RAB)</h3>
                <p className="text-xs text-neutral-500">Penyusunan anggaran pengeluaran tahunan institusi yang siap cetak.</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={printRAB}
                  className="bg-neutral-800 text-white font-medium text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-neutral-900"
                >
                  <Printer className="w-3.5 h-3.5 text-white" />
                  <span>Cetak Dokumen RAB</span>
                </button>
                <FileSpreadsheet className="w-5 h-5 text-neutral-400 max-sm:hidden" />
              </div>
            </div>

            {/* Quick add budget item */}
            <div className="flex justify-end">
              <button 
                onClick={() => {
                  setNewBudget({ code: 'A.', activity: '', volume: 1, unit: '', unitPrice: 0 });
                  setActiveAddModal('rab');
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs py-2 px-4 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Tambah Pos Belanja</span>
              </button>
            </div>

            {/* List RAB */}
            <div className="overflow-x-auto border border-neutral-100 rounded-xl bg-white shadow-3xs">
              <table className="w-full text-sm text-left">
                <thead className="bg-neutral-50 text-neutral-600 font-semibold text-xs">
                  <tr>
                    <th className="p-3">Kode</th>
                    <th className="p-3">Kegiatan Belanja</th>
                    <th className="p-3">Volume</th>
                    <th className="p-3">Satuan Harga</th>
                    <th className="p-3">Total Anggaran</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs">
                  {lembaga.budget.map(item => {
                    return (
                      <tr key={item.id} className="hover:bg-neutral-50/50">
                        <td className="p-3 font-mono text-neutral-500">{item.code}</td>
                        <td className="p-3 font-semibold text-neutral-800">{item.activity}</td>
                        <td className="p-3 text-neutral-600">{item.volume} {item.unit}</td>
                        <td className="p-3 text-neutral-655">Rp {item.unitPrice.toLocaleString('id-ID')}</td>
                        <td className="p-3 font-bold text-neutral-800">Rp {item.total.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right whitespace-nowrap font-semibold">
                          <button 
                            onClick={() => startEditBudget(item)}
                            className="text-emerald-600 hover:text-emerald-850 hover:bg-emerald-50 px-2.5 py-1 rounded-lg gap-1 inline-flex items-center cursor-pointer"
                            title="Edit Pos Belanja"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button 
                            onClick={() => removeBudget(item.id)}
                            className="text-red-550 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-lg gap-1 inline-flex items-center cursor-pointer ml-1.5"
                            title="Hapus Pos Belanja"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-neutral-50/60 font-bold text-sm">
                    <td colSpan={4} className="p-3 text-right text-neutral-500">Kalkulasi Grand Total (RAB):</td>
                    <td colSpan={2} className="p-3 text-emerald-700">
                      Rp {lembaga.budget.reduce((sum, item) => sum + item.total, 0).toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODULE: JURNAL KEUANGAN */}
        {activeModule === 'jurnal' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">Jurnal Pengeluaran & Penerimaan</h3>
                <p className="text-xs text-neutral-500">Catat transaksi keuangan debit dan kredit harian kas operasional Lembaga Kursus.</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={printLedger}
                  className="bg-neutral-800 text-white font-medium text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-neutral-900"
                >
                  <Printer className="w-3.5 h-3.5 text-white" />
                  <span>Cetak Buku Ledger</span>
                </button>
                <Landmark className="w-5 h-5 text-neutral-400 max-sm:hidden" />
              </div>
            </div>

            {/* Quick entry transaction */}
            <div className="flex justify-end">
              <button 
                onClick={() => {
                  setNewJournal({ date: new Date().toISOString().split('T')[0], description: '', type: 'Debit', category: '', amount: 0 });
                  setActiveAddModal('jurnal');
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs py-2 px-4 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Catat Transaksi Baru</span>
              </button>
            </div>

            {/* List Jurnal Ledger */}
            <div className="overflow-x-auto border border-neutral-100 rounded-xl bg-white shadow-3xs">
              <table className="w-full text-sm text-left">
                <thead className="bg-neutral-50 text-neutral-600 font-semibold text-xs">
                  <tr>
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">Uraian Transaksi</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Debit (Masuk)</th>
                    <th className="p-3">Kredit (Keluar)</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs text-neutral-700">
                  {lembaga.journal.map(j => {
                    return (
                      <tr key={j.id} className="hover:bg-neutral-50/50">
                        <td className="p-3 text-neutral-500 font-mono">{j.date}</td>
                        <td className="p-3 font-semibold text-neutral-800">{j.description}</td>
                        <td className="p-3 text-neutral-500">{j.category}</td>
                        <td className="p-3 text-emerald-600 font-bold">
                          {j.type === 'Debit' ? 'Rp ' + j.amount.toLocaleString('id-ID') : '-'}
                        </td>
                        <td className="p-3 text-red-650 font-bold">
                          {j.type === 'Kredit' ? 'Rp ' + j.amount.toLocaleString('id-ID') : '-'}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap font-semibold">
                          <button 
                            onClick={() => startEditJournal(j)}
                            className="text-emerald-600 hover:text-emerald-850 hover:bg-emerald-50 px-2.5 py-1 rounded-lg gap-1 inline-flex items-center cursor-pointer"
                            title="Edit Transaksi"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button 
                            onClick={() => removeJournal(j.id)}
                            className="text-red-550 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-lg gap-1 inline-flex items-center cursor-pointer ml-1.5"
                            title="Hapus Transaksi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-neutral-50 font-bold text-sm">
                    <td colSpan={3} className="p-3 text-right">Sisa Saldo Kas (Balance):</td>
                    <td colSpan={3} className="p-3 text-blue-700 text-base">
                      Rp {(
                        lembaga.journal.filter(j => j.type === 'Debit').reduce((s,t) => s+t.amount, 0) -
                        lembaga.journal.filter(j => j.type === 'Kredit').reduce((s,t) => s+t.amount,0)
                      ).toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODULE: VOUCHER PROGRAM */}
        {activeModule === 'voucher' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">Voucher & Diskon Program</h3>
                <p className="text-xs text-neutral-500">Rancang kode promo promosi untuk diskon pembayaran siswa baru.</p>
              </div>
              <Percent className="w-5 h-5 text-neutral-400" />
            </div>

            {/* Form Voucher */}
            <div className="flex justify-end">
              <button 
                onClick={() => {
                  setNewVoucher({ code: '', discount: 0, type: 'Nominal', quota: 10, expiryDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0] });
                  setActiveAddModal('voucher');
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs py-2 px-4 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Tambah Kode Voucher</span>
              </button>
            </div>

            {/* List Voucher */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lembaga.vouchers.map(v => {
                return (
                  <div key={v.id} className="p-4 border border-dashed border-emerald-300 rounded-2xl bg-white shadow-3xs flex items-center justify-between group relative">
                    <div>
                      <span className="font-mono bg-emerald-600 text-white font-bold text-xs px-2.5 py-1 rounded">
                        {v.code}
                      </span>
                      <p className="text-sm font-bold text-neutral-800 mt-2">
                        Potongan: {v.type === 'Nominal' ? 'Rp ' + v.discount.toLocaleString('id-ID') : v.discount + '%'}
                      </p>
                      <p className="text-[10px] text-neutral-450 mt-1 font-medium">
                        Berlaku sampai: <span className="font-semibold text-neutral-600">{v.expiryDate}</span> | Sisa Kuota: <span className="font-semibold text-neutral-600">{v.quota}</span> Pendaftar
                      </p>
                    </div>
                    <div className="flex gap-1.5 items-center font-semibold text-xs whitespace-nowrap">
                      <button 
                        onClick={() => startEditVoucher(v)}
                        className="text-emerald-600 hover:text-emerald-850 hover:bg-emerald-50 px-2.5 py-1 rounded-lg gap-1 inline-flex items-center cursor-pointer"
                        title="Edit Voucher"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button 
                        onClick={() => removeVoucher(v.id)}
                        className="text-red-550 hover:text-red-755 hover:bg-red-50 px-2.5 py-1 rounded-lg gap-1 inline-flex items-center cursor-pointer"
                        title="Hapus Voucher"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MODULE: PEMENUHAN 8 SNP ACCREDITATION */}
        {activeModule === 'snp' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                  <span>Pemenuhan 8 SNP Akreditasi</span>
                  <span className="bg-emerald-50 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wider">
                    Akreditasi Lembaga
                  </span>
                </h3>
                <p className="text-xs text-neutral-500">Kelola berkas instrumen akreditasi berdasarkan 8 Standar Nasional Pendidikan Indonesia.</p>
              </div>
              <BookOpen className="w-5 h-5 text-neutral-400" />
            </div>

            {/* Integration Banner / Toggle */}
            <div className="bg-white border border-neutral-150 rounded-2xl p-5 shadow-3xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-neutral-800 text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Metode Penilaian Kelayakan 8 SNP</span>
                  </h4>
                  <p className="text-[11px] text-neutral-500 leading-relaxed max-w-2xl">
                    Sistem dapat mengevaluasi kepatuhan 8 Standar Nasional Pendidikan secara <strong>otomatis & real-time</strong> dengan mendeteksi entri data operasional riil dari seluruh modul (program, jadwal, rasio instruktur, sarpras, anggaran, kas, dan nilai siswa).
                  </p>
                </div>
                
                {/* Segmented Switch Control */}
                <div className="flex bg-neutral-100 p-1 rounded-xl shrink-0 border border-neutral-150/50 self-start md:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSnpAutoSync(true);
                      const dynamicSnp = getDynamicSnpStandards(lembaga);
                      onUpdateLembaga({
                        ...lembaga,
                        snpStandards: dynamicSnp
                      });
                      alert("Mode Auto-Sinkronisasi diaktifkan! Skor dihitung dari data rill Lembaga Anda.");
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      snpAutoSync
                        ? 'bg-emerald-600 text-white shadow-3xs'
                        : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-Sync Riil</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSnpAutoSync(false);
                      alert("Mode Manual diaktifkan! Anda kini dapat mencentang instrumen kelayakan secara bebas.");
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      !snpAutoSync
                        ? 'bg-neutral-800 text-white shadow-3xs'
                        : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Checklist Manual</span>
                  </button>
                </div>
              </div>

              {/* Summary Stats Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-neutral-100">
                <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-100">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Nilai Rata-Rata SNP</span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-2xl font-black text-emerald-600 font-mono">
                      {Math.round(lembaga.snpStandards.reduce((acc, curr) => acc + curr.percentage, 0) / lembaga.snpStandards.length)}%
                    </span>
                    <span className="text-xs text-neutral-400 font-bold">Kepatuhan</span>
                  </div>
                </div>
                <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-100">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Status Akreditasi</span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    {(() => {
                      const avg = Math.round(lembaga.snpStandards.reduce((acc, curr) => acc + curr.percentage, 0) / lembaga.snpStandards.length);
                      let grade = 'Belum Akreditasi';
                      let color = 'text-red-600';
                      if (avg >= 86) { grade = 'Akreditasi A'; color = 'text-emerald-600'; }
                      else if (avg >= 71) { grade = 'Akreditasi B'; color = 'text-blue-600'; }
                      else if (avg >= 55) { grade = 'Akreditasi C'; color = 'text-amber-600'; }
                      return (
                        <>
                          <span className={`text-lg font-black ${color}`}>{grade}</span>
                          <span className="text-[10px] text-neutral-400 font-semibold">(Skor: {avg})</span>
                        </>
                      );
                    })()}
                  </div>
                </div>
                <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-100">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Metode Aktif</span>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${snpAutoSync ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    <span className="text-xs font-bold text-neutral-700">
                      {snpAutoSync ? 'Sinkronisasi Data Aplikasi' : 'Input Checklist Manual'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* List Standards */}
            <div className="space-y-4">
              {lembaga.snpStandards.map(std => (
                <div key={std.id} className="border border-neutral-150 rounded-2xl p-5 bg-white space-y-4 shadow-3xs hover:border-neutral-200 transition-all">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-extrabold text-neutral-800 text-sm">{std.id}. {std.title}</h4>
                      <p className="text-[11px] text-neutral-400">Pengecekan kecukupan instrumen penjaminan mutu nasional</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                        {std.percentage}% Terpenuhi
                      </span>
                      <div className="w-28 h-1.5 bg-neutral-100 rounded-full mt-2 overflow-hidden border border-neutral-100">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${std.percentage}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-neutral-100 pt-3 space-y-2.5">
                    {std.checklist.map(task => {
                      const moduleMap = (() => {
                        switch (task.id) {
                          case '1a':
                          case '1b':
                          case '2a':
                            return { id: 'program', label: 'Program Kursus' };
                          case '1c':
                            return { id: 'jadwal', label: 'Jadwal & Pengajar' };
                          case '2b':
                          case '4a':
                          case '4b':
                            return { id: 'staf', label: 'Staf & Struktur' };
                          case '2c':
                            return { id: 'absensi', label: 'Absensi Siswa' };
                          case '3a':
                          case '3b':
                          case '8a':
                          case '8b':
                            return { id: 'raport', label: 'Raport & Nilai' };
                          case '5a':
                          case '5b':
                          case '5c':
                            return { id: 'sarpras', label: 'Sarana Prasarana' };
                          case '6a':
                          case '6b':
                            return { id: 'profil', label: 'Profil Lembaga' };
                          case '7a':
                            return { id: 'rab', label: 'Anggaran & RAB' };
                          case '7b':
                            return { id: 'jurnal', label: 'Buku Kas Jurnal' };
                          default:
                            return null;
                        }
                      })();

                      return (
                        <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs p-3 hover:bg-neutral-50/50 rounded-xl border border-neutral-100 transition-colors bg-white">
                          <div className="flex items-start gap-3 max-w-full sm:max-w-[65%]">
                            <input 
                              type="checkbox" 
                              checked={task.checked}
                              disabled={snpAutoSync}
                              onChange={() => !snpAutoSync && toggleSnpTask(std.id, task.id)}
                              className={`mt-0.5 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 ${snpAutoSync ? 'opacity-70 cursor-not-allowed bg-neutral-100' : 'cursor-pointer'}`} 
                              title={snpAutoSync ? "Pengecekan dikunci pada mode Auto-Sync karena dinilai otomatis dari data riil" : "Centang manual"}
                            />
                            <div className="space-y-0.5">
                              <span className={`text-neutral-800 font-bold block leading-relaxed ${task.checked && snpAutoSync ? 'text-neutral-600 line-through' : ''}`}>
                                {task.task}
                              </span>
                              {snpAutoSync && (
                                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                  {task.checked ? (
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
                                      <span>✓ Terverifikasi Riil</span>
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 flex items-center gap-1">
                                      <span>⚠️ Membutuhkan Data</span>
                                    </span>
                                  )}
                                  {moduleMap && !task.checked && (
                                    <button
                                      onClick={() => setActiveModule(moduleMap.id)}
                                      className="text-[10px] text-emerald-600 hover:text-emerald-800 font-extrabold hover:underline cursor-pointer bg-white border border-neutral-200 px-1.5 py-0.5 rounded-md"
                                    >
                                      Input di {moduleMap.label} →
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                            {task.checked ? (
                              <span className="text-[10px] font-mono bg-neutral-100 border border-neutral-200 text-neutral-600 px-2.5 py-1 rounded-lg font-semibold shadow-3xs flex items-center gap-1">
                                📄 {task.evidence || 'lampiran_bukti.pdf'}
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono bg-neutral-50 border border-dashed border-neutral-200 text-neutral-400 px-2.5 py-1 rounded-lg">
                                Belum ada berkas pendukung
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODULE: BACKUP & RESTORE */}
        {activeModule === 'backup' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">Cadangkan / Pulihkan Data (Backup & Restore)</h3>
                <p className="text-xs text-neutral-500">Amankan seluruh administrasi lokal Anda ke berkas JSON atau pulihkan data seketika.</p>
              </div>
              <Download className="w-5 h-5 text-neutral-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Export Panel */}
              <div className="p-6 border border-neutral-100 rounded-2xl bg-neutral-50/50 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-800 text-sm">Cadangkan Data (Eksport)</h4>
                    <p className="text-[11px] text-neutral-400">Unduh seluruh berkas konfigurasi Lembaga Kursus ini.</p>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Semua program kegiatan, anggaran RAB, detail inventaris, profil fisik, absensi, hingga data raport akan dipadatkan secara kompresi ke dalam satu dokumen terenkripsi JSON.
                </p>
                <button
                  onClick={exportInstitutionData}
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Cadangkan Sekarang (Unduh JSON)</span>
                </button>
              </div>

              {/* Import Panel */}
              <div className="p-6 border border-neutral-100 rounded-2xl bg-neutral-50/50 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-800 text-sm">Pulihkan Data (Import)</h4>
                    <p className="text-[11px] text-neutral-400">Kembalikan dokumen database dari backup lama.</p>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Unggah berkas cadangan JSON yang valid. Sistem akan melakukan sinkronisasi modul menggantikan isian formulir saat ini tanpa mempengaruhi ketiadaan akses lembaga lainnya.
                </p>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJsonFile}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="w-full bg-white border border-dashed border-neutral-200 hover:border-amber-500 text-neutral-600 font-medium text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors">
                    <Upload className="w-4 h-4 text-neutral-400" />
                    <span>Upload & Pulihkan Berkas JSON</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODULE: KREDENSIAL AKSES */}
        {activeModule === 'kredensial' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-neutral-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  <span>Kredensial & Supervisi Hak Akses</span>
                </h3>
                <p className="text-xs text-neutral-500">
                  Pusat kendali akun operasional. Seluruh aktivitas pembuatan, pemblokiran, dan perubahan sandi berada di bawah pengawasan langsung Pimpinan Lembaga.
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-neutral-100 px-3 py-1.5 rounded-xl border border-neutral-200">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-mono font-bold text-neutral-700 uppercase">Otoritas Pimpinan Aktif</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: KREDENSIAL UTAMA PIMPINAN (40%) */}
              <div className="lg:col-span-5 bg-neutral-50/50 p-5 rounded-2xl border border-neutral-150 space-y-4">
                <div className="border-b border-neutral-200 pb-2">
                  <h4 className="text-xs font-black uppercase text-neutral-800 tracking-wide flex items-center gap-1.5">
                    <span className="p-1 bg-neutral-900 text-white rounded-md">👑</span>
                    <span>Kredensial Utama Pimpinan</span>
                  </h4>
                  <p className="text-[10px] text-neutral-450 mt-1">
                    Gunakan email & kata sandi ini untuk mengakses seluruh dashboard manajemen, finansial, dan data sensitif Lembaga.
                  </p>
                </div>

                <form onSubmit={saveCredentials} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-neutral-650 block mb-1">Email Pengguna (Username Utama)</label>
                    <input 
                      type="email" 
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full text-xs border border-neutral-200 rounded-lg p-2.5 bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none" 
                    />
                  </div>

                  <div className="relative">
                    <label className="text-xs font-bold text-neutral-650 block mb-1">Kata Sandi Baru</label>
                    <div className="relative">
                      <input 
                        type={showPass ? 'text' : 'password'} 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Kosongkan jika tidak ingin diubah"
                        className="w-full text-xs border border-neutral-200 rounded-lg p-2.5 pr-10 bg-white font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                      >
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <span className="text-[10px] text-neutral-400 mt-1 block">Minimal terdiri dari 6 karakter unik.</span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-650 block mb-1">Konfirmasi Kata Sandi Baru</label>
                    <div className="relative">
                      <input 
                        type={showPass ? 'text' : 'password'} 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ketik kata sandi konfirmasi"
                        className="w-full text-xs border border-neutral-200 rounded-lg p-2.5 pr-10 bg-white font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                      >
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-3xs cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Perbarui Kredensial Utama</span>
                  </button>
                </form>
              </div>

              {/* RIGHT COLUMN: SUPERVISI AKSES STAFF & PENGAJAR (60%) */}
              <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-neutral-150 space-y-4">
                <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                  <div>
                    <h4 className="text-xs font-black uppercase text-neutral-800 tracking-wide flex items-center gap-1.5">
                      <span className="p-1 bg-emerald-100 text-emerald-800 rounded-md">🛡️</span>
                      <span>Supervisi Akses Staf & Pengajar</span>
                    </h4>
                    <p className="text-[10px] text-neutral-450 mt-1">
                      Kendalikan & batasi hak akses masing-masing personil secara real-time demi kerahasiaan lembaga.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNewStaffName('');
                      setNewStaffUsername('');
                      setNewStaffPassword('');
                      setShowAddStaffModal(true);
                    }}
                    className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-extrabold text-[11px] px-3 py-1.5 rounded-xl border border-emerald-200/50 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Akses</span>
                  </button>
                </div>

                {/* List of Staff Credentials */}
                <div className="space-y-3">
                  {(!lembaga.staffCredentials || lembaga.staffCredentials.length === 0) ? (
                    <div className="text-center py-6 text-neutral-400 text-xs">
                      Menginisialisasi kredensial keamanan staff...
                    </div>
                  ) : (
                    lembaga.staffCredentials.map((staff) => {
                      const isEditing = editingStaffId === staff.id;
                      return (
                        <div 
                          key={staff.id} 
                          className={`p-4 rounded-xl border transition-all ${
                            staff.active 
                              ? 'bg-neutral-50/50 border-neutral-200' 
                              : 'bg-red-50/20 border-red-150 opacity-80'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-xs text-neutral-800">{staff.name}</span>
                                <span className={`text-[9px] font-black tracking-wider px-2 py-0.5 rounded-full uppercase border ${
                                  staff.role === 'staf_admin' 
                                    ? 'bg-blue-55 text-blue-800 border-blue-200' 
                                    : staff.role === 'bendahara'
                                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                                      : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                }`}>
                                  {staff.role === 'staf_admin' && '💼 Staf Admin'}
                                  {staff.role === 'bendahara' && '💰 Bendahara Lembaga'}
                                  {staff.role === 'pengajar' && '🎓 Pengajar'}
                                </span>
                                {!staff.active && (
                                  <span className="bg-red-50 text-red-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-red-200 uppercase tracking-wider">
                                    MUTED / BLOCKED
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-col gap-0.5 text-[11px] text-neutral-500 font-sans">
                                <div><strong className="text-neutral-400 font-semibold">Username:</strong> <span className="font-mono bg-neutral-100 text-neutral-700 px-1 rounded">{staff.username}</span></div>
                                <div><strong className="text-neutral-400 font-semibold">Sandi Aktif:</strong> <span className="font-mono bg-amber-50/80 text-amber-900 px-1 rounded font-bold border border-amber-100">{staff.password || '••••••••'}</span></div>
                              </div>
                            </div>

                            {/* Actions controlled by Pimpinan */}
                            <div className="flex items-center gap-1.5 self-end sm:self-auto">
                              <button
                                type="button"
                                onClick={() => {
                                  if (isEditing) {
                                    setEditingStaffId(null);
                                  } else {
                                    setEditingStaffId(staff.id);
                                    setEditStaffPassword(staff.password || '');
                                  }
                                }}
                                className="p-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 transition-colors cursor-pointer"
                                title="Ubah Kata Sandi"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>

                              {/* Toggle Active / Disabled Access */}
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (lembaga.staffCredentials || []).map(s => {
                                    if (s.id === staff.id) {
                                      return { ...s, active: !s.active };
                                    }
                                    return s;
                                  });
                                  saveLembaga({ staffCredentials: updated });
                                  alert(`Status akses ${staff.name} berhasil diubah menjadi ${!staff.active ? 'AKTIF' : 'TERBLOKIR (DITANGGUHKAN)'}!`);
                                }}
                                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold border transition-all cursor-pointer ${
                                  staff.active 
                                    ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100' 
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                }`}
                              >
                                {staff.active ? '🔒 Blokir' : '🔑 Aktifkan'}
                              </button>

                              {/* Revoke/Delete Access */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Apakah Anda yakin ingin menghapus wewenang hak akses untuk ${staff.name} secara permanen?`)) {
                                    const updated = (lembaga.staffCredentials || []).filter(s => s.id !== staff.id);
                                    saveLembaga({ staffCredentials: updated });
                                    alert(`Hak akses ${staff.name} telah dicabut secara permanen.`);
                                  }
                                }}
                                className="p-1.5 rounded-lg border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                                title="Cabut Akses Permanen"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* INLINE PASSWORD EDITING EXPANSION */}
                          {isEditing && (
                            <div className="mt-3 pt-3 border-t border-neutral-200/60 animate-fade-in space-y-2">
                              <label className="text-[10px] font-bold text-neutral-500 block">Ubah Sandi Baru untuk {staff.name}</label>
                              <div className="flex gap-2">
                                <input 
                                  type="text" 
                                  value={editStaffPassword}
                                  onChange={(e) => setEditStaffPassword(e.target.value)}
                                  placeholder="Ketik sandi baru"
                                  className="text-xs p-1.5 border border-neutral-200 rounded-lg flex-1 bg-white focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (editStaffPassword.length < 4) {
                                      alert("Sandi minimal 4 karakter!");
                                      return;
                                    }
                                    const updated = (lembaga.staffCredentials || []).map(s => {
                                      if (s.id === staff.id) {
                                        return { ...s, password: editStaffPassword };
                                      }
                                      return s;
                                    });
                                    saveLembaga({ staffCredentials: updated });
                                    setEditingStaffId(null);
                                    alert(`Kata sandi untuk ${staff.name} berhasil diubah menjadi: ${editStaffPassword}`);
                                  }}
                                  className="bg-neutral-900 hover:bg-neutral-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                >
                                  Simpan
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingStaffId(null)}
                                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                >
                                  Batal
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* FOOTER EXPLANATION OF SUPERVISION */}
                <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-150 text-[11px] leading-relaxed text-neutral-600 space-y-1">
                  <span className="font-extrabold text-neutral-800 block text-xs">🔔 Catatan Supervisi Pimpinan Lembaga:</span>
                  <p>
                    Sebagai Pimpinan, Anda memiliki wewenang hukum mutlak atas seluruh fungsionalitas aplikasi. Jika personil admin atau pengajar melakukan pelanggaran atau mutasi kerja, Anda dapat <strong>membekukan login mereka secara real-time</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* MODAL: TAMBAH HAK AKSES BARU */}
            {showAddStaffModal && (
              <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-3xl shadow-xl border border-neutral-150 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
                  <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
                    <h3 className="font-black text-neutral-800 text-sm flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-600" />
                      <span>Buat Kredensial Hak Akses Baru</span>
                    </h3>
                    <button 
                      type="button"
                      onClick={() => setShowAddStaffModal(false)} 
                      className="text-neutral-400 hover:text-neutral-600 font-bold p-1 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newStaffName || !newStaffUsername || !newStaffPassword) {
                        alert("Semua kolom wajib diisi!");
                        return;
                      }
                      const newStaff = {
                        id: 'staff-' + Date.now(),
                        name: newStaffName,
                        username: newStaffUsername,
                        role: newStaffRole,
                        active: true,
                        password: newStaffPassword
                      };
                      const updated = [...(lembaga.staffCredentials || []), newStaff];
                      saveLembaga({ staffCredentials: updated });
                      setShowAddStaffModal(false);
                      const roleLabel = newStaffRole === 'staf_admin' ? 'Staf Admin' : newStaffRole === 'bendahara' ? 'Bendahara Lembaga' : 'Pengajar';
                      alert(`Kredensial baru untuk ${newStaffName} (${roleLabel}) berhasil didaftarkan secara aman!`);
                    }} 
                    className="p-6 space-y-4"
                  >
                    <div>
                      <label className="text-xs font-bold text-neutral-600 block mb-1">Nama Personil Lembaga</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Misal: Budi Santoso, S.Pd"
                        value={newStaffName} 
                        onChange={(e) => setNewStaffName(e.target.value)}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-neutral-600 block mb-1">Username / Email Login</label>
                      <input 
                        type="email" 
                        required
                        placeholder="Misal: budi@wanodya.lembaga"
                        value={newStaffUsername} 
                        onChange={(e) => setNewStaffUsername(e.target.value)}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-neutral-600 block mb-1">Wewenang / Hak Akses</label>
                      <select
                        value={newStaffRole}
                        onChange={(e) => setNewStaffRole(e.target.value as 'staf_admin' | 'pengajar' | 'bendahara')}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white focus:outline-none"
                      >
                        <option value="staf_admin">💼 Staf Administrasi / Admin (Proteksi Finansial)</option>
                        <option value="bendahara">💰 Bendahara Lembaga (Pengelola Finansial & Kas Buku)</option>
                        <option value="pengajar">🎓 Pengajar / Instruktur (Fokus KBM & Raport)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-neutral-600 block mb-1">Kata Sandi Awal</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Minimal 4 karakter"
                        value={newStaffPassword} 
                        onChange={(e) => setNewStaffPassword(e.target.value)}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white focus:outline-none font-mono"
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddStaffModal(false)}
                        className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Daftarkan Kredensial</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL POPUPS: DYNAMIC ADD & EDIT FOR EVERY RESOURCE                       */}
        {/* ========================================================================= */}

        {/* 1. OVERLAY BACKDROP FOR ADD SYSTEM */}
        {activeAddModal !== null && (
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
            <div className="bg-white rounded-3xl shadow-xl border border-neutral-150 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in-50 zoom-in-95 duration-150">
              
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
                <h3 className="font-bold text-neutral-800 text-sm">
                  {activeAddModal === 'program' && 'Tambah Program Kursus Baru'}
                  {activeAddModal === 'kalender' && 'Tambah Agenda Akademik'}
                  {activeAddModal === 'struktur' && 'Tambah Jabatan Struktur Organisasi'}
                  {activeAddModal === 'instruktur' && 'Registrasi Instruktur Pengajar'}
                  {activeAddModal === 'jadwal' && 'Tempatkan Jadwal Sesi Kelas'}
                  {activeAddModal === 'sarana' && 'Tambah Sarana / Inventaris Baru'}
                  {activeAddModal === 'rab' && 'Tambah Pos Alokasi Belanja (RAB)'}
                  {activeAddModal === 'jurnal' && 'Catat Transaksi Kas Harian'}
                  {activeAddModal === 'voucher' && 'Buat Kode Diskon / Voucher Baru'}
                </h3>
                <button 
                  onClick={() => setActiveAddModal(null)} 
                  className="text-neutral-400 hover:text-neutral-600 font-bold p-1 rounded-full hover:bg-neutral-100/50 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-4">
                
                {/* 1.1 PROGRAM */}
                {activeAddModal === 'program' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Nama Program Kursus</label>
                      <input 
                        type="text" 
                        value={newProgram.name || ''} 
                        onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
                        placeholder="Misal: Kelas Bahasa Inggris Fast-track"
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Uang Pendaftaran (Rp)</label>
                        <input 
                          type="number" 
                          value={newProgram.regFee || ''} 
                          onChange={(e) => setNewProgram({ ...newProgram, regFee: Number(e.target.value) })}
                          placeholder="0"
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Uang Kursus / Sertifikasi (Rp)</label>
                        <input 
                          type="number" 
                          value={newProgram.tuitionFee || ''} 
                          onChange={(e) => setNewProgram({ ...newProgram, tuitionFee: Number(e.target.value) })}
                          placeholder="0"
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Iuran Bulanan (Rp)</label>
                        <input 
                          type="number" 
                          value={newProgram.monthlyFee || ''} 
                          onChange={(e) => setNewProgram({ ...newProgram, monthlyFee: Number(e.target.value) })}
                          placeholder="0"
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Durasi Belajar</label>
                        <input 
                          type="text" 
                          value={newProgram.duration || ''} 
                          onChange={(e) => setNewProgram({ ...newProgram, duration: e.target.value })}
                          placeholder="Misal: 3 Bulan (24 Sesi)"
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Deskripsi & Output Kompetensi</label>
                      <textarea 
                        rows={2}
                        value={newProgram.description || ''} 
                        onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                        placeholder="Kurikulum ringkas penguasaan..."
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
                      />
                    </div>
                  </div>
                )}

                {/* 1.2 KALENDER */}
                {activeAddModal === 'kalender' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Nama Kegiatan / Agenda</label>
                      <input 
                        type="text" 
                        value={newEvent.title || ''} 
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        placeholder="Misal: Ujian Mid-Semester, Libur Tahun Baru"
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Tanggal Mulai/Sesi</label>
                      <input 
                        type="date" 
                        value={newEvent.date || ''} 
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Kelompok Klasifikasi</label>
                      <select 
                        value={newEvent.type || 'Akademik'} 
                        onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
                      >
                        <option value="Akademik">Kegiatan Akademik</option>
                        <option value="Libur">Libur Resmi Sekolah</option>
                        <option value="Ujian">Evaluasi & Ujian</option>
                        <option value="Kegiatan">Acara Lainnya/Sertifikasi</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 1.3 STRUKTUR ORGANISASI */}
                {activeAddModal === 'struktur' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Nama Pejabat / Pengurus</label>
                      <input 
                        type="text" 
                        value={newNode.name || ''} 
                        onChange={(e) => setNewNode({ ...newNode, name: e.target.value })}
                        placeholder="Budi Laksono, M.Pd"
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Nama Jabatan</label>
                      <input 
                        type="text" 
                        value={newNode.role || ''} 
                        onChange={(e) => setNewNode({ ...newNode, role: e.target.value })}
                        placeholder="Misal: Penanggung Jawab Lembaga Kursus, Bendahara Umum"
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Melaporkan Kepada (Atasan Struktural)</label>
                      <select 
                        value={newNode.parentId || ''} 
                        onChange={(e) => setNewNode({ ...newNode, parentId: e.target.value || undefined })}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
                      >
                        <option value="">-- Pimpinan Teratas (Tidak Ada Atasan) --</option>
                        {lembaga.structure.map(n => (
                          <option key={n.id} value={n.id}>{n.role} - {n.name}</option>
                        ))}
                      </select>
                    </div>
                    {/* Generasi AI Cerdas */}
                    <div className="bg-gradient-to-r from-emerald-50 to-indigo-50 border border-emerald-150/80 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-start gap-2.5">
                        <div className="bg-emerald-100 text-emerald-800 p-2 rounded-lg shrink-0 mt-0.5">
                          <Sparkles className="w-4 h-4 text-emerald-700 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-neutral-800">Isi Hak & Tugas dengan AI</h4>
                          <p className="text-[10px] text-neutral-500 leading-normal">
                            Asisten AI Pintar Gemini akan menganalisis posisi "<span className="font-semibold text-neutral-700">{newNode.role || '(Belum diisi)'}</span>" dan menyusun rincian Hak & Kewajiban secara otomatis.
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          disabled={aiNewNodeLoading || !newNode.role}
                          onClick={() => handleAIGenerateNodeDetails(newNode.role || '', newNode.name || '', 'new')}
                          className="w-full sm:w-auto text-xs font-extrabold text-white bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 disabled:from-neutral-100 disabled:to-neutral-150 disabled:text-neutral-400 disabled:border-neutral-200 disabled:shadow-none shadow-xs px-4 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed border border-emerald-600"
                        >
                          {aiNewNodeLoading ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-400" />
                              <span>Menyusun AI...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Rekomendasikan dengan AI</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-neutral-600 font-sans">Hak / Kewenangan Jabatan (Opsional)</label>
                        <button
                          type="button"
                          onClick={() => {
                            if (!newNode.role) return alert('Ketik nama Jabatan terlebih dahulu untuk merekomendasikan hak!');
                            const recommended = getRoleTemplate(newNode.role);
                            setNewNode({ ...newNode, rights: recommended.rights });
                          }}
                          className="text-[10px] text-emerald-700 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-150 px-2.5 py-0.5 rounded-md font-extrabold font-mono transition-all cursor-pointer"
                        >
                          ✨ Rekomendasi
                        </button>
                      </div>
                      <textarea
                        value={newNode.rights || ''}
                        onChange={(e) => setNewNode({ ...newNode, rights: e.target.value })}
                        placeholder="Contoh: Mengambil keputusan keuangan harian, menandatangani surat resmi, menilai kinerja guru."
                        rows={3}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white resize-none"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-neutral-600 font-sans">Kewajiban / Tugas Pokok Jabatan (Opsional)</label>
                        <button
                          type="button"
                          onClick={() => {
                            if (!newNode.role) return alert('Ketik nama Jabatan terlebih dahulu untuk merekomendasikan tugas!');
                            const recommended = getRoleTemplate(newNode.role);
                            setNewNode({ ...newNode, duties: recommended.duties });
                          }}
                          className="text-[10px] text-emerald-700 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-150 px-2.5 py-0.5 rounded-md font-extrabold font-mono transition-all cursor-pointer"
                        >
                          ✨ Rekomendasi
                        </button>
                      </div>
                      <textarea
                        value={newNode.duties || ''}
                        onChange={(e) => setNewNode({ ...newNode, duties: e.target.value })}
                        placeholder="Contoh: Menyusun laporan anggaran tahunan, mengawasi proses belajar mengajar, merawat inventaris kelas."
                        rows={2}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white resize-none"
                      />
                    </div>

                    {/* Berkas SK & Sertifikat Kompetensi */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-1">
                        Berkas SK & Sertifikat Kompetensi
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* SK Pengangkatan Card */}
                        <div className="p-3 border border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50 space-y-2">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 shrink-0">
                              <FileText className="w-3.5 h-3.5" />
                            </span>
                            <div className="overflow-hidden">
                              <p className="text-xs font-bold text-neutral-800 tracking-wide truncate">SK Pengangkatan</p>
                              <p className="text-[9px] text-neutral-500 truncate">Keputusan Jabatan Utama</p>
                            </div>
                          </div>

                          {(newNode.skPengangkatanFile || newNode.skPengangkatanText) ? (
                            <div className="flex items-center justify-between p-2 bg-indigo-50/50 border border-indigo-150 rounded-xl">
                              <span className="text-[9px] font-bold text-indigo-900 truncate max-w-[80px]" title={newNode.skPengangkatanFileName || 'SK_Pengangkatan'}>
                                {newNode.skPengangkatanFileName || 'SK Pengangkatan'}
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setPreviewDoc({
                                    title: `SK Pengangkatan - ${newNode.name || 'Staff'}`,
                                    type: newNode.skPengangkatanText ? 'sk_text' : 'sk_node',
                                    file: newNode.skPengangkatanText || newNode.skPengangkatanFile || '',
                                    number: 'SK PENGANGKATAN',
                                    filename: newNode.skPengangkatanFileName || 'sk_pengangkatan.pdf'
                                  })}
                                  className="p-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors cursor-pointer"
                                  title="Pratinjau SK"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleNodeFileRemove('sk_pengangkatan', false)}
                                  className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer border border-rose-150"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1.5 pt-1">
                              <label className="flex items-center justify-center gap-1.5 p-2 border border-dashed border-neutral-300 rounded-xl hover:border-neutral-400 bg-white hover:bg-neutral-50/30 transition-all cursor-pointer text-center group">
                                <FileUp className="w-3 h-3 text-neutral-400 group-hover:text-indigo-600 transition-colors" />
                                <span className="text-[10px] font-bold text-neutral-605">Unggah File</span>
                                <input 
                                  type="file" 
                                  accept="image/*,application/pdf"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleNodeFileUpload(file, 'sk_pengangkatan', false);
                                  }}
                                  className="hidden" 
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => openSkGenerator('new', 'pengangkatan')}
                                className="w-full py-1.5 px-1 border border-indigo-150 rounded-xl bg-indigo-50/50 hover:bg-indigo-100/70 hover:text-indigo-900 text-indigo-700 text-[9px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                              >
                                <span>✨ Buat SK AI</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* SK Penugasan Card */}
                        <div className="p-3 border border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50 space-y-2">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-650 shrink-0">
                              <FileSpreadsheet className="w-3.5 h-3.5" />
                            </span>
                            <div className="overflow-hidden">
                              <p className="text-xs font-bold text-neutral-800 tracking-wide truncate">SK Penugasan</p>
                              <p className="text-[9px] text-neutral-500 truncate">Keputusan Penugasan</p>
                            </div>
                          </div>

                          {(newNode.skPenugasanFile || newNode.skPenugasanText) ? (
                            <div className="flex items-center justify-between p-2 bg-emerald-50/50 border border-emerald-150 rounded-xl">
                              <span className="text-[9px] font-bold text-emerald-900 truncate max-w-[80px]" title={newNode.skPenugasanFileName || 'SK_Penugasan'}>
                                {newNode.skPenugasanFileName || 'SK Penugasan'}
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setPreviewDoc({
                                    title: `SK Penugasan - ${newNode.name || 'Staff'}`,
                                    type: newNode.skPenugasanText ? 'sk_text' : 'sk_node',
                                    file: newNode.skPenugasanText || newNode.skPenugasanFile || '',
                                    number: 'SK PENUGASAN',
                                    filename: newNode.skPenugasanFileName || 'sk_penugasan.pdf'
                                  })}
                                  className="p-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors cursor-pointer"
                                  title="Pratinjau SK"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleNodeFileRemove('sk_penugasan', false)}
                                  className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer border border-rose-150"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1.5 pt-1">
                              <label className="flex items-center justify-center gap-1.5 p-2 border border-dashed border-neutral-300 rounded-xl hover:border-neutral-400 bg-white hover:bg-neutral-50/30 transition-all cursor-pointer text-center group">
                                <FileUp className="w-3 h-3 text-neutral-400 group-hover:text-emerald-600 transition-colors" />
                                <span className="text-[10px] font-bold text-neutral-605">Unggah File</span>
                                <input 
                                  type="file" 
                                  accept="image/*,application/pdf"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleNodeFileUpload(file, 'sk_penugasan', false);
                                  }}
                                  className="hidden" 
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => openSkGenerator('new', 'penugasan')}
                                className="w-full py-1.5 px-1 border border-emerald-150 rounded-xl bg-emerald-50/50 hover:bg-emerald-100/70 hover:text-emerald-950 text-emerald-700 text-[9px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                              >
                                <span>✨ Buat SK AI</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Sertifikat Kompetensi Card */}
                        <div className="p-3 border border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50 space-y-2">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className="p-1.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 shrink-0">
                              <Award className="w-3.5 h-3.5" />
                            </span>
                            <div className="overflow-hidden">
                              <p className="text-xs font-bold text-neutral-800 tracking-wide truncate">Sertifikat Komp.</p>
                              <p className="text-[9px] text-neutral-500 truncate">Sertifikat Keahlian</p>
                            </div>
                          </div>

                          {newNode.certFile ? (
                            <div className="flex items-center justify-between p-2 bg-amber-50/50 border border-amber-150 rounded-xl">
                              <span className="text-[9px] font-bold text-amber-900 truncate max-w-[80px]" title={newNode.certFileName}>
                                {newNode.certFileName || 'Sertifikat'}
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setPreviewDoc({
                                    title: `Sertifikat Kompetensi - ${newNode.name || 'Staff'}`,
                                    type: 'cert_node',
                                    file: newNode.certFile || '',
                                    number: 'SERTIFIKAT KOMPETENSI',
                                    filename: newNode.certFileName || 'sertifikat.pdf'
                                  })}
                                  className="p-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors cursor-pointer"
                                  title="Pratinjau Sertifikat"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleNodeFileRemove('cert', false)}
                                  className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer border border-rose-150"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1.5 pt-1">
                              <label className="flex flex-col items-center justify-center p-3 border border-dashed border-neutral-300 rounded-xl hover:border-neutral-450 bg-white hover:bg-neutral-50/30 transition-all cursor-pointer text-center group h-[64px]">
                                <FileUp className="w-3.5 h-3.5 text-neutral-400 group-hover:text-amber-650 transition-colors mb-0.5" />
                                <span className="text-[10px] font-bold text-neutral-600">Pilih Berkas</span>
                                <input 
                                  type="file" 
                                  accept="image/*,application/pdf"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleNodeFileUpload(file, 'cert', false);
                                  }}
                                  className="hidden" 
                                />
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Live Preview Hierarki */}
                    <div className="pt-3 border-t border-neutral-100">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md font-mono border border-amber-100">
                          🔴 Draft Live Preview Penempatan Peta
                        </span>
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                      </div>
                      <p className="text-[10px] text-neutral-500 leading-normal mb-2">
                        Bagan struktur organisasi saat ini di mana posisi baru ini akan diposisikan (berwarna oranye berkedip) di bagan struktur:
                      </p>
                      <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 overflow-x-auto select-none pointer-events-none scale-95 origin-top max-h-[300px]">
                        {renderCompleteOrgTree(undefined, newNode.parentId || null, { name: newNode.name || 'Nama Pengurus (Preview)', role: newNode.role || 'Nama Jabatan (Preview)' })}
                      </div>
                    </div>
                  </div>
                )}

                {/* 1.4 GURU / INSTRUKTUR */}
                {activeAddModal === 'instruktur' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Nama Lengkap & Gelar</label>
                      <input 
                        type="text" 
                        value={newTeacher.name || ''} 
                        onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                        placeholder="Jane Doe, B.Sc"
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Spesialisasi Bidang / Materi Kursus</label>
                      <input 
                        type="text" 
                        value={newTeacher.specialty || ''} 
                        onChange={(e) => setNewTeacher({ ...newTeacher, specialty: e.target.value })}
                        placeholder="Misal: TOEFL Preparation, Web Development"
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
                      />
                    </div>
                  </div>
                )}

                {/* 1.5 JADWAL SESI KELAS */}
                {activeAddModal === 'jadwal' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Pilih Program Kursus Utama</label>
                      <select 
                        value={newSchedule.programId || ''} 
                        onChange={(e) => setNewSchedule({ ...newSchedule, programId: e.target.value })}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-semibold text-neutral-800"
                      >
                        <option value="">-- Pilih Program --</option>
                        {lembaga.programs.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Pilih Instruktur Pelaksana</label>
                      <select 
                        value={newSchedule.teacherId || ''} 
                        onChange={(e) => setNewSchedule({ ...newSchedule, teacherId: e.target.value })}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white text-neutral-700"
                      >
                        <option value="">-- Pilih Instruktur Pengajar --</option>
                        {lembaga.teachers.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.specialty})</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Hari Kursus</label>
                        <select 
                          value={newSchedule.day || 'Senin'} 
                          onChange={(e) => setNewSchedule({ ...newSchedule, day: e.target.value })}
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-semibold"
                        >
                          {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(h => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Waktu / Sesi Jam</label>
                        <input 
                          type="text" 
                          value={newSchedule.time || ''} 
                          onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
                          placeholder="Misal: 14:00 - 16:00 WIB"
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Lokasi Ruang Praktek</label>
                      <input 
                        type="text" 
                        value={newSchedule.room || ''} 
                        onChange={(e) => setNewSchedule({ ...newSchedule, room: e.target.value })}
                        placeholder="Misal: Lab Komputer A, Ruang Depan"
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-semibold"
                      />
                    </div>
                  </div>
                )}

                {/* 1.6 SARANA PRASARANA */}
                {activeAddModal === 'sarana' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Nama Fasilitas / Alat</label>
                      <input 
                        type="text" 
                        value={newFacility.name || ''} 
                        onChange={(e) => setNewFacility({ ...newFacility, name: e.target.value })}
                        placeholder="Misal: Router Cisco RV340, Proyektor"
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Jumlah Unit (Volume)</label>
                        <input 
                          type="number" 
                          value={newFacility.quantity || ''} 
                          onChange={(e) => setNewFacility({ ...newFacility, quantity: Number(e.target.value) })}
                          placeholder="Jumlah"
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Kondisi Barang</label>
                        <select 
                          value={newFacility.condition || 'Baik'} 
                          onChange={(e) => setNewFacility({ ...newFacility, condition: e.target.value as any })}
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
                        >
                          <option value="Baik">Kondisi Baik (Layak Pakai)</option>
                          <option value="Rusak Ringan">Rusak Ringan</option>
                          <option value="Rusak Berat">Rusak Berat (Butuh Penggantian)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Lokasi Penempatan Ruangan</label>
                      <input 
                        type="text" 
                        value={newFacility.location || ''} 
                        onChange={(e) => setNewFacility({ ...newFacility, location: e.target.value })}
                        placeholder="Contoh: Lab Teknik Utama, Ruang Kelas 02"
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Foto Fisik Barang (Opsional)</label>
                        {newFacility.photoUrl ? (
                          <div className="relative w-full h-24 bg-neutral-50 rounded-lg overflow-hidden border border-neutral-200 group">
                            <img src={newFacility.photoUrl} alt="Preview Sarpras" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setNewFacility({ ...newFacility, photoUrl: '' })}
                              className="absolute top-1 right-1 bg-red-650 hover:bg-red-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-xs cursor-pointer z-10 font-bold"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center border border-dashed border-neutral-200 rounded-lg p-2.5 bg-neutral-50 hover:bg-neutral-100 cursor-pointer transition-colors text-center">
                            <Camera className="w-5 h-5 text-neutral-400 mb-1 mx-auto" />
                            <span className="text-[10px] text-neutral-500 font-medium">Unggah Foto (Maks 1MB)</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files?.[0]) handleFacilityFileUpload(e.target.files[0], 'photo', false);
                              }}
                            />
                          </label>
                        )}
                      </div>
                      
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Dokumen/Faktur (Opsional)</label>
                        {newFacility.documentUrl ? (
                          <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-250 rounded-lg text-emerald-800 text-xs font-medium">
                            <span className="truncate flex items-center gap-1.5 min-w-0">
                              <FileText className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                              <span className="truncate">Dokumen terlampir</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setNewFacility({ ...newFacility, documentUrl: '' })}
                              className="text-red-650 hover:text-red-800 focus:outline-none cursor-pointer pl-1.5 font-bold"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center border border-dashed border-neutral-200 rounded-lg p-2.5 bg-neutral-50 hover:bg-neutral-100 cursor-pointer transition-colors text-center">
                            <FileUp className="w-5 h-5 text-neutral-400 mb-1 mx-auto" />
                            <span className="text-[10px] text-neutral-500 font-medium">Unggah Berkas (Maks 1MB)</span>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files?.[0]) handleFacilityFileUpload(e.target.files[0], 'document', false);
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 1.7 RAB BUDGET ITEM */}
                {activeAddModal === 'rab' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1">
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Kode Akun</label>
                        <input 
                          type="text" 
                          value={newBudget.code || ''} 
                          onChange={(e) => setNewBudget({ ...newBudget, code: e.target.value })}
                          placeholder="A.1"
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-mono"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Uraian / Kegiatan Belanja</label>
                        <input 
                          type="text" 
                          value={newBudget.activity || ''} 
                          onChange={(e) => setNewBudget({ ...newBudget, activity: e.target.value })}
                          placeholder="Sewa Hosting dan domain institusi"
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Volume Quantity</label>
                        <input 
                          type="number" 
                          value={newBudget.volume || ''} 
                          onChange={(e) => setNewBudget({ ...newBudget, volume: Number(e.target.value) })}
                          placeholder="Jumlah"
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Satuan</label>
                        <input 
                          type="text" 
                          value={newBudget.unit || ''} 
                          onChange={(e) => setNewBudget({ ...newBudget, unit: e.target.value })}
                          placeholder="rim / box / tahun"
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Harga Satuan (Rp)</label>
                      <input 
                        type="number" 
                        value={newBudget.unitPrice || ''} 
                        onChange={(e) => setNewBudget({ ...newBudget, unitPrice: Number(e.target.value) })}
                        placeholder="Misal: 150000"
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-mono font-semibold"
                      />
                    </div>
                  </div>
                )}

                {/* 1.8 JURNAL KAS LEDGER */}
                {activeAddModal === 'jurnal' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Tanggal Transaksi</label>
                        <input 
                          type="date" 
                          value={newJournal.date || ''} 
                          onChange={(e) => setNewJournal({ ...newJournal, date: e.target.value })}
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Tipe Aliran Kas</label>
                        <select 
                          value={newJournal.type || 'Debit'} 
                          onChange={(e) => setNewJournal({ ...newJournal, type: e.target.value as any })}
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
                        >
                          <option value="Debit">Debit (Dana Masuk / Pemasukan)</option>
                          <option value="Kredit">Kredit (Dana Keluar / Pengeluran)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Keterangan / Uraian</label>
                      <input 
                        type="text" 
                        value={newJournal.description || ''} 
                        onChange={(e) => setNewJournal({ ...newJournal, description: e.target.value })}
                        placeholder="Misal: Penerimaan iuran kelas Bahasa Inggris..."
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-semibold"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Kategori Pos</label>
                        <input 
                          type="text" 
                          value={newJournal.category || ''} 
                          onChange={(e) => setNewJournal({ ...newJournal, category: e.target.value })}
                          placeholder="Siswa Baru / ATK Kantor"
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Nominal Rupiah (Rp)</label>
                        <input 
                          type="number" 
                          value={newJournal.amount || ''} 
                          onChange={(e) => setNewJournal({ ...newJournal, amount: Number(e.target.value) })}
                          placeholder="Contoh: 100000"
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-mono font-bold text-neutral-900"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 1.9 VOUCHER DISCOUNT */}
                {activeAddModal === 'voucher' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Kode Voucher Promo</label>
                        <input 
                          type="text" 
                          value={newVoucher.code || ''} 
                          onChange={(e) => setNewVoucher({ ...newVoucher, code: e.target.value.toUpperCase() })}
                          placeholder="PROMOAKREDITASI"
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-mono font-bold uppercase text-neutral-905"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Jenis Potongan</label>
                        <select 
                          value={newVoucher.type || 'Nominal'} 
                          onChange={(e) => setNewVoucher({ ...newVoucher, type: e.target.value as any })}
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-semibold text-neutral-700"
                        >
                          <option value="Nominal">Nominal Rupiah (Rp)</option>
                          <option value="Persen">Persen Diskon (%)</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Besar Potongan Nilai</label>
                        <input 
                          type="number" 
                          value={newVoucher.discount || ''} 
                          onChange={(e) => setNewVoucher({ ...newVoucher, discount: Number(e.target.value) })}
                          placeholder="Diskon"
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Maksimum Kuota Klaim</label>
                        <input 
                          type="number" 
                          value={newVoucher.quota || ''} 
                          onChange={(e) => setNewVoucher({ ...newVoucher, quota: Number(e.target.value) })}
                          placeholder="Jumlah"
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-bold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Masa Berlaku Kupon Kadaluarsa</label>
                      <input 
                        type="date" 
                        value={newVoucher.expiryDate || ''} 
                        onChange={(e) => setNewVoucher({ ...newVoucher, expiryDate: e.target.value })}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
                      />
                    </div>
                  </div>
                )}

              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 px-6 py-4 bg-neutral-50/50 border-t border-neutral-100 font-semibold text-xs text-white">
                <button 
                  onClick={() => setActiveAddModal(null)} 
                  className="px-4 py-2 border border-neutral-200 text-neutral-600 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer font-medium"
                >
                  Batal
                </button>
                <button 
                  onClick={() => {
                    if (activeAddModal === 'program') addProgram();
                    if (activeAddModal === 'kalender') addEvent();
                    if (activeAddModal === 'struktur') addOrgNode();
                    if (activeAddModal === 'instruktur') addTeacher();
                    if (activeAddModal === 'jadwal') addSchedule();
                    if (activeAddModal === 'sarana') addFacility();
                    if (activeAddModal === 'rab') addBudget();
                    if (activeAddModal === 'jurnal') addJournal();
                    if (activeAddModal === 'voucher') addVoucher();
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Tambahkan Data & Simpan
                </button>
              </div>

            </div>
          </div>
        )}

        {/* 1.5 POPUP INFO & EDIT FOR VISUAL HIERARCHY NODES */}
        {infoNode !== null && (
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
            <div className="bg-white rounded-3xl shadow-xl border border-neutral-150 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in-50 zoom-in-95 duration-150">
              
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
                <div className="flex items-center gap-2">
                  <span className="p-1 px-2.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold font-mono">
                    {infoNodeIsEditing ? 'MODE EDIT JABATAN' : 'DETAIL ANGGOTA STRUKTUR'}
                  </span>
                </div>
                <button 
                  onClick={() => {
                    setInfoNode(null);
                    setInfoNodeIsEditing(false);
                  }} 
                  className="text-neutral-400 hover:text-neutral-600 font-bold p-1 rounded-full hover:bg-neutral-100/50 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-4">
                
                {!infoNodeIsEditing ? (
                  /* VIEW DETAILS MODE */
                  <div className="space-y-4 font-sans">
                    {/* Header Person Info */}
                    <div className="flex items-center gap-3 p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100/60">
                      <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0 select-none">
                        {infoNode.name ? infoNode.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-neutral-800 text-base truncate" title={infoNode.name}>{infoNode.name}</h4>
                        <p className="text-xs uppercase tracking-wider font-extrabold text-slate-500 font-mono truncate" title={infoNode.role}>
                          💼 {infoNode.role}
                        </p>
                      </div>
                    </div>

                    {/* Reporting line */}
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-1">
                        Silsilah Pelaporan / Atasan Struktural
                      </span>
                      <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-150 text-xs text-neutral-700 font-medium">
                        {infoNode.parentId ? (
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>Melapor kepada: </span>
                            <span className="font-bold text-neutral-800">
                              {(() => {
                                const parent = lembaga.structure.find(n => n.id === infoNode.parentId);
                                return parent ? `${parent.role} (${parent.name})` : 'Atasan Pelaporan Tidak Ditemukan';
                              })()}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-neutral-500 italic">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                            <span>Posisi Teratas (Tidak ada atasan struktural)</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rights Panel */}
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-1">
                        Hak & Kewenangan Jabatan
                      </span>
                      <div className="p-4 bg-blue-50/30 rounded-2xl border border-blue-105/60 text-xs leading-relaxed text-neutral-700 font-medium">
                        {infoNode.rights ? (
                          <p className="whitespace-pre-line">{infoNode.rights}</p>
                        ) : (
                          <p className="text-neutral-400 italic">Belum mendefinisikan Hak / Kewenangan khusus untuk jabatan ini.</p>
                        )}
                      </div>
                    </div>

                    {/* Duties Panel */}
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-1">
                        Kewajiban & Tugas Pokok Jabatan
                      </span>
                      <div className="p-4 bg-emerald-50/30 rounded-2xl border border-emerald-105/60 text-xs leading-relaxed text-neutral-700 font-medium">
                        {infoNode.duties ? (
                          <p className="whitespace-pre-line">{infoNode.duties}</p>
                        ) : (
                          <p className="text-neutral-400 italic">Belum mendefinisikan rincian Tugas Pokok & Tanggung Jawab untuk jabatan ini.</p>
                        )}
                      </div>
                    </div>

                    {/* Supporting Documents Section */}
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-1">
                        Berkas SK & Sertifikat Kompetensi
                      </span>
                      <div className="grid grid-cols-1 gap-2.5">
                        {/* SK Pengangkatan Card */}
                        {(() => {
                          const hasSkPengangkatan = !!(infoNode.skPengangkatanFile || infoNode.skPengangkatanText || infoNode.skFile);
                          const skPengangkatanName = infoNode.skPengangkatanFileName || infoNode.skFileName || (infoNode.skPengangkatanText ? "Draf SK AI" : "Terunggah");
                          return (
                            <div className="p-3 bg-neutral-50/70 border border-neutral-150 rounded-2xl flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <span className={`p-1.5 rounded-lg text-indigo-605 bg-indigo-50 border border-indigo-100 ${hasSkPengangkatan ? 'opacity-100' : 'opacity-50'}`}>
                                  <FileText className="w-3.5 h-3.5" />
                                </span>
                                <div className="overflow-hidden text-left">
                                  <p className="text-[10.5px] font-bold text-neutral-800 leading-tight">SK Pengangkatan Jabatan</p>
                                  <p className="text-[9px] text-neutral-500 truncate max-w-[200px]" title={skPengangkatanName}>
                                    {hasSkPengangkatan ? skPengangkatanName : 'Belum diunggah/dibuat'}
                                  </p>
                                </div>
                              </div>
                              {hasSkPengangkatan ? (
                                <button
                                  type="button"
                                  onClick={() => setPreviewDoc({
                                    title: `SK Pengangkatan - ${infoNode.name}`,
                                    type: infoNode.skPengangkatanText ? 'sk_text' : 'sk_node',
                                    file: infoNode.skPengangkatanText || infoNode.skPengangkatanFile || infoNode.skFile || '',
                                    number: 'SK PENGANGKATAN',
                                    filename: infoNode.skPengangkatanFileName || infoNode.skFileName || 'sk_pengangkatan.pdf'
                                  })}
                                  className="p-1 px-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors cursor-pointer text-[10px] font-bold leading-none inline-flex items-center gap-1 shrink-0"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Lihat</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => openSkGenerator('info', 'pengangkatan')}
                                  className="p-1 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-150 rounded-lg transition-colors cursor-pointer text-[9px] font-extrabold flex items-center gap-0.5 shrink-0"
                                >
                                  <span>✨ Buat AI</span>
                                </button>
                              )}
                            </div>
                          );
                        })()}

                        {/* SK Penugasan Card */}
                        {(() => {
                          const hasSkPenugasan = !!(infoNode.skPenugasanFile || infoNode.skPenugasanText);
                          const skPenugasanName = infoNode.skPenugasanFileName || (infoNode.skPenugasanText ? "Draf SK AI" : "Terunggah");
                          return (
                            <div className="p-3 bg-neutral-50/70 border border-neutral-150 rounded-2xl flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <span className={`p-1.5 rounded-lg text-emerald-650 bg-emerald-50 border border-emerald-100 ${hasSkPenugasan ? 'opacity-100' : 'opacity-50'}`}>
                                  <FileSpreadsheet className="w-3.5 h-3.5" />
                                </span>
                                <div className="overflow-hidden text-left">
                                  <p className="text-[10.5px] font-bold text-neutral-800 leading-tight font-sans">SK Penugasan / Penempatan</p>
                                  <p className="text-[9px] text-neutral-500 truncate max-w-[200px]" title={skPenugasanName}>
                                    {hasSkPenugasan ? skPenugasanName : 'Belum diunggah/dibuat'}
                                  </p>
                                </div>
                              </div>
                              {hasSkPenugasan ? (
                                <button
                                  type="button"
                                  onClick={() => setPreviewDoc({
                                    title: `SK Penugasan - ${infoNode.name}`,
                                    type: infoNode.skPenugasanText ? 'sk_text' : 'sk_node',
                                    file: infoNode.skPenugasanText || infoNode.skPenugasanFile || '',
                                    number: 'SK PENUGASAN',
                                    filename: infoNode.skPenugasanFileName || 'sk_penugasan.pdf'
                                  })}
                                  className="p-1 px-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors cursor-pointer text-[10px] font-bold leading-none inline-flex items-center gap-1 shrink-0"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Lihat</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => openSkGenerator('info', 'penugasan')}
                                  className="p-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-150 rounded-lg transition-colors cursor-pointer text-[9px] font-extrabold flex items-center gap-0.5 shrink-0"
                                >
                                  <span>✨ Buat AI</span>
                                </button>
                              )}
                            </div>
                          );
                        })()}

                        {/* Certificate Card */}
                        <div className="p-3 bg-neutral-50/70 border border-neutral-150 rounded-2xl flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className={`p-1.5 rounded-lg text-amber-600 bg-amber-50 border border-amber-100 ${infoNode.certFile ? 'opacity-100' : 'opacity-50'}`}>
                              <Award className="w-3.5 h-3.5" />
                            </span>
                            <div className="overflow-hidden text-left">
                              <p className="text-[10.5px] font-bold text-neutral-800 leading-tight font-sans">Sertifikat Kompetensi</p>
                              <p className="text-[9px] text-neutral-500 truncate max-w-[200px]" title={infoNode.certFileName}>
                                {infoNode.certFile ? (infoNode.certFileName || 'Terunggah') : 'Belum diunggah'}
                              </p>
                            </div>
                          </div>
                          {infoNode.certFile && (
                            <button
                              type="button"
                              onClick={() => setPreviewDoc({
                                title: `Sertifikat Kompetensi - ${infoNode.name}`,
                                type: 'cert_node',
                                file: infoNode.certFile || '',
                                number: 'SERTIFIKAT KOMPETENSI',
                                filename: infoNode.certFileName || 'sertifikat_kompetensi.pdf'
                              })}
                              className="p-1 px-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors cursor-pointer text-[10px] font-bold leading-none inline-flex items-center gap-1 shrink-0"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Lihat</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* INLINE EDIT MODE */
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Nama Lengkap Pejabat</label>
                      <input 
                        type="text" 
                        value={infoNodeData.name || ''} 
                        onChange={(e) => setInfoNodeData({ ...infoNodeData, name: e.target.value })}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-semibold text-neutral-800"
                        placeholder="Contoh: Drs. Wahyudi M.Pd"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Nama Jabatan Utama</label>
                      <input 
                        type="text" 
                        value={infoNodeData.role || ''} 
                        onChange={(e) => setInfoNodeData({ ...infoNodeData, role: e.target.value })}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-semibold text-neutral-800"
                        placeholder="Contoh: Kepala Tata Usaha"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Atasan Pelaporan Struktural</label>
                      <select 
                        value={infoNodeData.parentId || ''} 
                        onChange={(e) => setInfoNodeData({ ...infoNodeData, parentId: e.target.value || undefined })}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white text-neutral-750 font-medium"
                      >
                        <option value="">-- Pimpinan Teratas (Tidak Ada Atasan) --</option>
                        {lembaga.structure.filter(n => n.id !== infoNode.id).map(n => (
                          <option key={n.id} value={n.id}>{n.role} - {n.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Generasi AI Cerdas */}
                    <div className="bg-gradient-to-r from-emerald-50 to-indigo-50 border border-emerald-150/80 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-start gap-2.5">
                        <div className="bg-emerald-100 text-emerald-800 p-2 rounded-lg shrink-0 mt-0.5">
                          <Sparkles className="w-4 h-4 text-emerald-700 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-neutral-800">Isi Hak & Tugas dengan AI</h4>
                          <p className="text-[10px] text-neutral-500 leading-normal">
                            Asisten AI Pintar Gemini akan menganalisis posisi "<span className="font-semibold text-neutral-700">{infoNodeData.role || '(Belum diisi)'}</span>" dan melengkapi rincian Hak & Kewajiban secara otomatis.
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          disabled={aiInfoNodeLoading || !infoNodeData.role}
                          onClick={() => handleAIGenerateNodeDetails(infoNodeData.role || '', infoNodeData.name || '', 'info')}
                          className="w-full sm:w-auto text-xs font-extrabold text-white bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 disabled:from-neutral-100 disabled:to-neutral-150 disabled:text-neutral-400 disabled:border-neutral-200 disabled:shadow-none shadow-xs px-4 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed border border-emerald-600"
                        >
                          {aiInfoNodeLoading ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-400" />
                              <span>Menyusun AI...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Minta Saran AI</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-neutral-600 font-sans">Hak / Kewenangan Jabatan</label>
                        <button
                          type="button"
                          onClick={() => {
                            if (!infoNodeData.role) return alert('Ketik nama Jabatan terlebih dahulu untuk merekomendasikan hak!');
                            const recommended = getRoleTemplate(infoNodeData.role);
                            setInfoNodeData({ ...infoNodeData, rights: recommended.rights });
                          }}
                          className="text-[10px] text-emerald-700 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-150 px-2.5 py-0.5 rounded-md font-extrabold font-mono transition-all cursor-pointer"
                        >
                          ✨ Rekomendasi
                        </button>
                      </div>
                      <textarea
                        value={infoNodeData.rights || ''}
                        onChange={(e) => setInfoNodeData({ ...infoNodeData, rights: e.target.value })}
                        placeholder="Contoh: Mengambil keputusan keuangan harian, menandatangani surat resmi, menilai kinerja guru."
                        rows={3}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white resize-none font-medium text-neutral-700"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-neutral-600 font-sans">Kewajiban / Tugas Pokok Jabatan</label>
                        <button
                          type="button"
                          onClick={() => {
                            if (!infoNodeData.role) return alert('Ketik nama Jabatan terlebih dahulu untuk merekomendasikan tugas!');
                            const recommended = getRoleTemplate(infoNodeData.role);
                            setInfoNodeData({ ...infoNodeData, duties: recommended.duties });
                          }}
                          className="text-[10px] text-emerald-700 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-150 px-2.5 py-0.5 rounded-md font-extrabold font-mono transition-all cursor-pointer"
                        >
                          ✨ Rekomendasi
                        </button>
                      </div>
                      <textarea
                        value={infoNodeData.duties || ''}
                        onChange={(e) => setInfoNodeData({ ...infoNodeData, duties: e.target.value })}
                        placeholder="Contoh: Menyusun laporan anggaran tahunan, mengawasi proses belajar mengajar, merawat inventaris kelas."
                        rows={2}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white resize-none font-medium text-neutral-700"
                      />
                    </div>

                    {/* Berkas SK & Sertifikat Kompetensi */}
                    <div className="space-y-2 pt-1 border-t border-neutral-150 mt-4 outline-none">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-1">
                        Berkas SK & Sertifikat Kompetensi
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* SK Pengangkatan Card */}
                        <div className="p-3 border border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50 space-y-2">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 shrink-0">
                              <FileText className="w-3.5 h-3.5" />
                            </span>
                            <div className="overflow-hidden">
                              <p className="text-xs font-bold text-neutral-800 tracking-wide truncate">SK Pengangkatan</p>
                              <p className="text-[9px] text-neutral-500 truncate">Keputusan Jabatan Utama</p>
                            </div>
                          </div>

                          {(infoNodeData.skPengangkatanFile || infoNodeData.skPengangkatanText || infoNodeData.skFile) ? (
                            <div className="flex items-center justify-between p-2 bg-indigo-50/50 border border-indigo-150 rounded-xl">
                              <span className="text-[9px] font-bold text-indigo-900 truncate max-w-[85px]" title={infoNodeData.skPengangkatanFileName || infoNodeData.skFileName || 'SK_Pengangkatan'}>
                                {infoNodeData.skPengangkatanFileName || infoNodeData.skFileName || 'SK Pengangkatan'}
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setPreviewDoc({
                                    title: `SK Pengangkatan - ${infoNodeData.name || 'Staff'}`,
                                    type: infoNodeData.skPengangkatanText ? 'sk_text' : 'sk_node',
                                    file: infoNodeData.skPengangkatanText || infoNodeData.skPengangkatanFile || infoNodeData.skFile || '',
                                    number: 'SK PENGANGKATAN',
                                    filename: infoNodeData.skPengangkatanFileName || infoNodeData.skFileName || 'sk_pengangkatan.pdf'
                                  })}
                                  className="p-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors cursor-pointer"
                                  title="Pratinjau SK"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleNodeFileRemove('sk_pengangkatan', true)}
                                  className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer border border-rose-150"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1.5 pt-1">
                              <label className="flex items-center justify-center gap-1.5 p-2 border border-dashed border-neutral-300 rounded-xl hover:border-neutral-400 bg-white hover:bg-neutral-50/30 transition-all cursor-pointer text-center group">
                                <FileUp className="w-3 h-3 text-neutral-400 group-hover:text-indigo-600 transition-colors" />
                                <span className="text-[10px] font-bold text-neutral-605">Unggah File</span>
                                <input 
                                  type="file" 
                                  accept="image/*,application/pdf"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleNodeFileUpload(file, 'sk_pengangkatan', true);
                                  }}
                                  className="hidden" 
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => openSkGenerator('info', 'pengangkatan')}
                                className="w-full py-1.5 px-1 border border-indigo-150 rounded-xl bg-indigo-50/50 hover:bg-indigo-100/70 hover:text-indigo-900 text-indigo-700 text-[9px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                              >
                                <span>✨ Buat SK AI</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* SK Penugasan Card */}
                        <div className="p-3 border border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50 space-y-2">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-650 shrink-0">
                              <FileSpreadsheet className="w-3.5 h-3.5" />
                            </span>
                            <div className="overflow-hidden">
                              <p className="text-xs font-bold text-neutral-800 tracking-wide truncate">SK Penugasan</p>
                              <p className="text-[9px] text-neutral-500 truncate">Keputusan Penugasan</p>
                            </div>
                          </div>

                          {(infoNodeData.skPenugasanFile || infoNodeData.skPenugasanText) ? (
                            <div className="flex items-center justify-between p-2 bg-emerald-50/50 border border-emerald-150 rounded-xl">
                              <span className="text-[9px] font-bold text-emerald-900 truncate max-w-[80px]" title={infoNodeData.skPenugasanFileName || 'SK_Penugasan'}>
                                {infoNodeData.skPenugasanFileName || 'SK Penugasan'}
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setPreviewDoc({
                                    title: `SK Penugasan - ${infoNodeData.name || 'Staff'}`,
                                    type: infoNodeData.skPenugasanText ? 'sk_text' : 'sk_node',
                                    file: infoNodeData.skPenugasanText || infoNodeData.skPenugasanFile || '',
                                    number: 'SK PENUGASAN',
                                    filename: infoNodeData.skPenugasanFileName || 'sk_penugasan.pdf'
                                  })}
                                  className="p-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors cursor-pointer"
                                  title="Pratinjau SK"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleNodeFileRemove('sk_penugasan', true)}
                                  className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer border border-rose-150"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1.5 pt-1">
                              <label className="flex items-center justify-center gap-1.5 p-2 border border-dashed border-neutral-300 rounded-xl hover:border-neutral-400 bg-white hover:bg-neutral-50/30 transition-all cursor-pointer text-center group">
                                <FileUp className="w-3.5 h-3.5 text-neutral-400 group-hover:text-emerald-600 transition-colors" />
                                <span className="text-[10px] font-bold text-neutral-605">Unggah File</span>
                                <input 
                                  type="file" 
                                  accept="image/*,application/pdf"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleNodeFileUpload(file, 'sk_penugasan', true);
                                  }}
                                  className="hidden" 
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => openSkGenerator('info', 'penugasan')}
                                className="w-full py-1.5 px-1 border border-emerald-150 rounded-xl bg-emerald-50/50 hover:bg-emerald-100/70 hover:text-emerald-950 text-emerald-700 text-[9px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                              >
                                <span>✨ Buat SK AI</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Sertifikat Kompetensi Card */}
                        <div className="p-3 border border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50 space-y-2">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className="p-1.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 shrink-0">
                              <Award className="w-3.5 h-3.5" />
                            </span>
                            <div className="overflow-hidden">
                              <p className="text-xs font-bold text-neutral-800 tracking-wide truncate">Sertifikat Komp.</p>
                              <p className="text-[9px] text-neutral-500 truncate">Sertifikat Keahlian</p>
                            </div>
                          </div>

                          {infoNodeData.certFile ? (
                            <div className="flex items-center justify-between p-2 bg-amber-50/50 border border-amber-150 rounded-xl">
                              <span className="text-[9px] font-bold text-amber-900 truncate max-w-[80px]" title={infoNodeData.certFileName}>
                                {infoNodeData.certFileName || 'Sertifikat'}
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setPreviewDoc({
                                    title: `Sertifikat Kompetensi - ${infoNodeData.name || 'Staff'}`,
                                    type: 'cert_node',
                                    file: infoNodeData.certFile || '',
                                    number: 'SERTIFIKAT KOMPETENSI',
                                    filename: infoNodeData.certFileName || 'sertifikat.pdf'
                                  })}
                                  className="p-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors cursor-pointer"
                                  title="Pratinjau Sertifikat"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleNodeFileRemove('cert', true)}
                                  className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer border border-rose-150"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1.5 pt-1">
                              <label className="flex flex-col items-center justify-center p-3 border border-dashed border-neutral-300 rounded-xl hover:border-neutral-450 bg-white hover:bg-neutral-50/30 transition-all cursor-pointer text-center group h-[64px]">
                                <FileUp className="w-3.5 h-3.5 text-neutral-400 group-hover:text-amber-650 transition-colors mb-0.5" />
                                <span className="text-[10px] font-bold text-neutral-600">Pilih Berkas</span>
                                <input 
                                  type="file" 
                                  accept="image/*,application/pdf"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleNodeFileUpload(file, 'cert', true);
                                  }}
                                  className="hidden" 
                                />
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Footer Actions */}
              <div className="flex justify-between items-center px-6 py-4 bg-neutral-50 border-t border-neutral-100 text-xs font-semibold">
                {!infoNodeIsEditing ? (
                  <>
                    <button 
                      type="button"
                      onClick={() => {
                        const idToDelete = infoNode.id;
                        setInfoNode(null);
                        removeOrgNode(idToDelete);
                      }}
                      className="px-4 py-2 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl transition-colors cursor-pointer font-bold inline-flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus
                    </button>
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => {
                          setInfoNodeIsEditing(true);
                          setInfoNodeData({ ...infoNode });
                        }}
                        className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl transition-colors cursor-pointer font-bold inline-flex items-center gap-1.5 border border-neutral-200"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Sunting (Edit)
                      </button>
                      <button 
                        type="button"
                        onClick={() => setInfoNode(null)}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors cursor-pointer font-extrabold shadow-sm"
                      >
                        Tutup
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <button 
                      type="button"
                      onClick={() => {
                        setInfoNodeIsEditing(false);
                        setInfoNodeData({ ...infoNode });
                      }}
                      className="px-4 py-2 border border-neutral-200 text-neutral-600 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer font-bold"
                    >
                      Batal
                    </button>
                    <button 
                      type="button"
                      disabled={!infoNodeData.name || !infoNodeData.role}
                      onClick={() => {
                        if (!infoNodeData.name || !infoNodeData.role) return alert('Nama & jabatan wajib diisi!');
                        const updated = lembaga.structure.map(n => n.id === infoNode.id ? {
                          ...n,
                          ...infoNodeData
                        } as OrgNode : n);
                        saveLembaga({ structure: updated });
                        setInfoNode({ ...infoNode, ...infoNodeData } as OrgNode);
                        setInfoNodeIsEditing(false);
                      }}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-sm transition-colors cursor-pointer disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed"
                    >
                      Simpan Perubahan
                    </button>
                  </>
                )}
              </div>

            </div>
          </div>
        )}

        {/* 2. OVERLAY BACKDROP FOR EDIT MODALS */}
        {(
          editingProgramId !== null || 
          editingEventId !== null || 
          editingNodeId !== null || 
          editingTeacherId !== null || 
          editingScheduleId !== null || 
          editingFacilityId !== null || 
          editingBudgetId !== null || 
          editingJournalId !== null || 
          editingVoucherId !== null
        ) && (
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
            <div className="bg-white rounded-3xl shadow-xl border border-neutral-150 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in-50 zoom-in-95 duration-150">
              
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
                <h3 className="font-bold text-neutral-800 text-sm">
                  {editingProgramId !== null && 'Edit Program Kursus'}
                  {editingEventId !== null && 'Edit Agenda Akademik'}
                  {editingNodeId !== null && 'Edit Jabatan Struktur Organisasi'}
                  {editingTeacherId !== null && 'Edit Identitas Instruktur'}
                  {editingScheduleId !== null && 'Edit Waktu Jadwal Sesi Kelas'}
                  {editingFacilityId !== null && 'Edit Detail Inventaris Sarpras'}
                  {editingBudgetId !== null && 'Edit Pos Belanja (RAB)'}
                  {editingJournalId !== null && 'Edit Pencatatan Transaksi'}
                  {editingVoucherId !== null && 'Edit Detail Voucher Promo'}
                </h3>
                <button 
                  onClick={() => {
                    setEditingProgramId(null);
                    setEditingEventId(null);
                    setEditingNodeId(null);
                    setEditingTeacherId(null);
                    setEditingScheduleId(null);
                    setEditingFacilityId(null);
                    setEditingBudgetId(null);
                    setEditingJournalId(null);
                    setEditingVoucherId(null);
                  }} 
                  className="text-neutral-400 hover:text-neutral-600 font-bold p-1 rounded-full hover:bg-neutral-100/50 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-4">
                
                {/* 2.1 EDIT PROGRAM */}
                {editingProgramId !== null && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Nama Program Kursus</label>
                      <input 
                        type="text" 
                        value={editProgramData.name || ''} 
                        onChange={(e) => setEditProgramData({ ...editProgramData, name: e.target.value })}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white text-neutral-900 font-semibold"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Uang Pendaftaran (Rp)</label>
                        <input 
                          type="number" 
                          value={editProgramData.regFee ?? 0} 
                          onChange={(e) => setEditProgramData({ ...editProgramData, regFee: Number(e.target.value) })}
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-mono font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Uang Kursus / Sertifikasi (Rp)</label>
                        <input 
                          type="number" 
                          value={editProgramData.tuitionFee ?? 0} 
                          onChange={(e) => setEditProgramData({ ...editProgramData, tuitionFee: Number(e.target.value) })}
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-mono font-semibold"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Iuran Bulanan (Rp)</label>
                        <input 
                          type="number" 
                          value={editProgramData.monthlyFee ?? 0} 
                          onChange={(e) => setEditProgramData({ ...editProgramData, monthlyFee: Number(e.target.value) })}
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-mono font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Durasi Belajar</label>
                        <input 
                          type="text" 
                          value={editProgramData.duration || ''} 
                          onChange={(e) => setEditProgramData({ ...editProgramData, duration: e.target.value })}
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Deskripsi & Output Kompetensi</label>
                      <textarea 
                        rows={2}
                        value={editProgramData.description || ''} 
                        onChange={(e) => setEditProgramData({ ...editProgramData, description: e.target.value })}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
                      />
                    </div>
                  </div>
                )}

                {/* 2.2 EDIT KALENDER */}
                {editingEventId !== null && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Nama Kegiatan / Agenda</label>
                      <input 
                        type="text" 
                        value={editEventData.title || ''} 
                        onChange={(e) => setEditEventData({ ...editEventData, title: e.target.value })}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Tanggal Kegiatan</label>
                      <input 
                        type="date" 
                        value={editEventData.date || ''} 
                        onChange={(e) => setEditEventData({ ...editEventData, date: e.target.value })}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Klasifikasi Kegiatan</label>
                      <select 
                        value={editEventData.type || 'Akademik'} 
                        onChange={(e) => setEditEventData({ ...editEventData, type: e.target.value as any })}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
                      >
                        <option value="Akademik">Kegiatan Akademik</option>
                        <option value="Libur">Libur Resmi Sekolah</option>
                        <option value="Ujian">Evaluasi & Ujian</option>
                        <option value="Kegiatan">Acara Lainnya/Sertifikasi</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 2.3 EDIT STRUKTUR ORGANISASI */}
                {editingNodeId !== null && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Nama Lengkap Pejabat</label>
                      <input 
                        type="text" 
                        value={editNodeData.name || ''} 
                        onChange={(e) => setEditNodeData({ ...editNodeData, name: e.target.value })}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Nama Jabatan Utama</label>
                      <input 
                        type="text" 
                        value={editNodeData.role || ''} 
                        onChange={(e) => setEditNodeData({ ...editNodeData, role: e.target.value })}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Atasan Pelaporan Struktural</label>
                      <select 
                        value={editNodeData.parentId || ''} 
                        onChange={(e) => setEditNodeData({ ...editNodeData, parentId: e.target.value || undefined })}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white text-neutral-700 font-medium"
                      >
                        <option value="">-- Pimpinan Teratas (Tidak Ada Atasan) --</option>
                        {lembaga.structure.filter(n => n.id !== editingNodeId).map(n => (
                          <option key={n.id} value={n.id}>{n.role} - {n.name}</option>
                        ))}
                      </select>
                    </div>
                    {/* Generasi AI Cerdas - Mode Edit */}
                    <div className="bg-gradient-to-r from-emerald-50 to-indigo-50 border border-emerald-150/80 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-start gap-2.5">
                        <div className="bg-emerald-100 text-emerald-800 p-2 rounded-lg shrink-0 mt-0.5">
                          <Sparkles className="w-4 h-4 text-emerald-700 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-neutral-800">Ubah Hak & Tugas dengan AI</h4>
                          <p className="text-[10px] text-neutral-500 leading-normal">
                            Asisten AI Pintar Gemini akan menganalisis posisi "<span className="font-semibold text-neutral-700">{editNodeData.role || '(Belum diisi)'}</span>" dan melengkapi rincian Hak & Kewajiban secara otomatis.
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          disabled={aiEditNodeLoading || !editNodeData.role}
                          onClick={() => handleAIGenerateNodeDetails(editNodeData.role || '', editNodeData.name || '', 'edit')}
                          className="w-full sm:w-auto text-xs font-extrabold text-white bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 disabled:from-neutral-100 disabled:to-neutral-150 disabled:text-neutral-400 disabled:border-neutral-200 disabled:shadow-none shadow-xs px-4 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed border border-emerald-600"
                        >
                          {aiEditNodeLoading ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-400" />
                              <span>Menyusun AI...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Minta Saran AI</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-neutral-600 font-sans">Hak / Kewenangan Jabatan</label>
                        <button
                          type="button"
                          onClick={() => {
                            if (!editNodeData.role) return alert('Ketik nama Jabatan terlebih dahulu untuk merekomendasikan hak!');
                            const recommended = getRoleTemplate(editNodeData.role);
                            setEditNodeData({ ...editNodeData, rights: recommended.rights });
                          }}
                          className="text-[10px] text-emerald-700 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-150 px-2.5 py-0.5 rounded-md font-extrabold font-mono transition-all cursor-pointer"
                        >
                          ✨ Rekomendasi
                        </button>
                      </div>
                      <textarea
                        value={editNodeData.rights || ''}
                        onChange={(e) => setEditNodeData({ ...editNodeData, rights: e.target.value })}
                        placeholder="Contoh: Mengambil keputusan keuangan harian, menandatangani surat resmi, menilai kinerja guru."
                        rows={3}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white resize-none font-medium text-neutral-700"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-neutral-600 font-sans">Kewajiban / Tugas Pokok Jabatan</label>
                        <button
                          type="button"
                          onClick={() => {
                            if (!editNodeData.role) return alert('Ketik nama Jabatan terlebih dahulu untuk merekomendasikan tugas!');
                            const recommended = getRoleTemplate(editNodeData.role);
                            setEditNodeData({ ...editNodeData, duties: recommended.duties });
                          }}
                          className="text-[10px] text-emerald-700 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-150 px-2.5 py-0.5 rounded-md font-extrabold font-mono transition-all cursor-pointer"
                        >
                          ✨ Rekomendasi
                        </button>
                      </div>
                      <textarea
                        value={editNodeData.duties || ''}
                        onChange={(e) => setEditNodeData({ ...editNodeData, duties: e.target.value })}
                        placeholder="Contoh: Menyusun laporan anggaran tahunan, mengawasi proses belajar mengajar, merawat inventaris kelas."
                        rows={3}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white resize-none font-medium text-neutral-700"
                      />
                    </div>
                    {/* Live Preview Hierarki - Mode Edit */}
                    <div className="pt-3 border-t border-neutral-100">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md font-mono border border-blue-100">
                        🔵 Preview Posisi Terpilih (Biru)
                      </span>
                      <p className="text-[10px] text-neutral-500 leading-normal mt-1 mb-2">
                        Bagan struktur organisasi saat ini di mana posisi yang sedang Anda edit akan tersorot secara interaktif berwarna biru utama:
                      </p>
                      <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 overflow-x-auto select-none pointer-events-none scale-95 origin-top max-h-[300px]">
                        {renderCompleteOrgTree(editingNodeId || undefined)}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2.4 EDIT GURU / INSTRUKTUR */}
                {editingTeacherId !== null && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Nama Lengkap Pengajar</label>
                      <input 
                        type="text" 
                        value={editTeacherName} 
                        onChange={(e) => setEditTeacherName(e.target.value)}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Spesialisasi Bidang</label>
                      <input 
                        type="text" 
                        value={editTeacherSpecialty} 
                        onChange={(e) => setEditTeacherSpecialty(e.target.value)}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-semibold"
                      />
                    </div>
                  </div>
                )}

                {/* 2.5 EDIT JADWAL SESSION */}
                {editingScheduleId !== null && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Pilih Program Kursus Utama</label>
                      <select 
                        value={editScheduleData.programId || ''} 
                        onChange={(e) => setEditScheduleData({ ...editScheduleData, programId: e.target.value })}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-semibold text-neutral-800"
                      >
                        <option value="">-- Pilih Program --</option>
                        {lembaga.programs.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Pilih Instruktur Pelaksana</label>
                      <select 
                        value={editScheduleData.teacherId || ''} 
                        onChange={(e) => setEditScheduleData({ ...editScheduleData, teacherId: e.target.value })}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white text-neutral-700"
                      >
                        <option value="">-- Pilih Instruktur Pengajar --</option>
                        {lembaga.teachers.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.specialty})</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Hari Kursus</label>
                        <select 
                          value={editScheduleData.day || 'Senin'} 
                          onChange={(e) => setEditScheduleData({ ...editScheduleData, day: e.target.value })}
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-semibold"
                        >
                          {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(h => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Waktu / Sesi Jam</label>
                        <input 
                          type="text" 
                          value={editScheduleData.time || ''} 
                          onChange={(e) => setEditScheduleData({ ...editScheduleData, time: e.target.value })}
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Ruangan Belajar</label>
                      <input 
                        type="text" 
                        value={editScheduleData.room || ''} 
                        onChange={(e) => setEditScheduleData({ ...editScheduleData, room: e.target.value })}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
                      />
                    </div>
                  </div>
                )}

                {/* 2.6 EDIT INVENTARIS SARANA */}
                {editingFacilityId !== null && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Nama Barang / Inventaris</label>
                      <input 
                        type="text" 
                        value={editFacilityData.name || ''} 
                        onChange={(e) => setEditFacilityData({ ...editFacilityData, name: e.target.value })}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-bold"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Jumlah Unit Volume</label>
                        <input 
                          type="number" 
                          value={editFacilityData.quantity ?? 1} 
                          onChange={(e) => setEditFacilityData({ ...editFacilityData, quantity: Number(e.target.value) })}
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Mutu Kondisi Barang</label>
                        <select 
                          value={editFacilityData.condition || 'Baik'} 
                          onChange={(e) => setEditFacilityData({ ...editFacilityData, condition: e.target.value as any })}
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white text-neutral-800"
                        >
                          <option value="Baik">Kondisi Baik (Layak Pakai)</option>
                          <option value="Rusak Ringan">Rusak Ringan</option>
                          <option value="Rusak Berat">Rusak Berat (Butuh Penggantian)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Lokasi Distribusi Ruangan</label>
                      <input 
                        type="text" 
                        value={editFacilityData.location || ''} 
                        onChange={(e) => setEditFacilityData({ ...editFacilityData, location: e.target.value })}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white text-neutral-700"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Foto Fisik Barang (Opsional)</label>
                        {editFacilityData.photoUrl ? (
                          <div className="relative w-full h-24 bg-neutral-50 rounded-lg overflow-hidden border border-neutral-200 group">
                            <img src={editFacilityData.photoUrl} alt="Preview Sarpras" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setEditFacilityData({ ...editFacilityData, photoUrl: '' })}
                              className="absolute top-1 right-1 bg-red-650 hover:bg-red-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-xs cursor-pointer z-10 font-bold"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center border border-dashed border-neutral-200 rounded-lg p-2.5 bg-neutral-50 hover:bg-neutral-100 cursor-pointer transition-colors text-center">
                            <Camera className="w-5 h-5 text-neutral-400 mb-1 mx-auto" />
                            <span className="text-[10px] text-neutral-500 font-medium">Unggah Foto (Maks 1MB)</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files?.[0]) handleFacilityFileUpload(e.target.files[0], 'photo', true);
                              }}
                            />
                          </label>
                        )}
                      </div>
                      
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Dokumen/Faktur (Opsional)</label>
                        {editFacilityData.documentUrl ? (
                          <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-250 rounded-lg text-emerald-800 text-xs font-medium">
                            <span className="truncate flex items-center gap-1.5 min-w-0">
                              <FileText className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                              <span className="truncate">Dokumen terlampir</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setEditFacilityData({ ...editFacilityData, documentUrl: '' })}
                              className="text-red-650 hover:text-red-800 focus:outline-none cursor-pointer pl-1.5 font-bold"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center border border-dashed border-neutral-200 rounded-lg p-2.5 bg-neutral-50 hover:bg-neutral-100 cursor-pointer transition-colors text-center">
                            <FileUp className="w-5 h-5 text-neutral-400 mb-1 mx-auto" />
                            <span className="text-[10px] text-neutral-500 font-medium">Unggah Berkas (Maks 1MB)</span>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files?.[0]) handleFacilityFileUpload(e.target.files[0], 'document', true);
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2.7 EDIT RAB BUDGET ROW */}
                {editingBudgetId !== null && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1">
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Kode Akun</label>
                        <input 
                          type="text" 
                          value={editBudgetData.code || ''} 
                          onChange={(e) => setEditBudgetData({ ...editBudgetData, code: e.target.value })}
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-mono font-semibold"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Uraian / Kegiatan Belanja</label>
                        <input 
                          type="text" 
                          value={editBudgetData.activity || ''} 
                          onChange={(e) => setEditBudgetData({ ...editBudgetData, activity: e.target.value })}
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-semibold"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Volume Anggaran</label>
                        <input 
                          type="number" 
                          value={editBudgetData.volume ?? 1} 
                          onChange={(e) => setEditBudgetData({ ...editBudgetData, volume: Number(e.target.value) })}
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Satuan</label>
                        <input 
                          type="text" 
                          value={editBudgetData.unit || ''} 
                          onChange={(e) => setEditBudgetData({ ...editBudgetData, unit: e.target.value })}
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Harga Satuan (Rp)</label>
                      <input 
                        type="number" 
                        value={editBudgetData.unitPrice ?? 0} 
                        onChange={(e) => setEditBudgetData({ ...editBudgetData, unitPrice: Number(e.target.value) })}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-mono font-bold"
                      />
                    </div>
                  </div>
                )}

                {/* 2.8 EDIT TRANSAKSI JURNAL */}
                {editingJournalId !== null && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Tanggal Transaksi</label>
                        <input 
                          type="date" 
                          value={editJournalData.date || ''} 
                          onChange={(e) => setEditJournalData({ ...editJournalData, date: e.target.value })}
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-semibold text-neutral-900"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Tipe Aliran Kas</label>
                        <select 
                          value={editJournalData.type || 'Debit'} 
                          onChange={(e) => setEditJournalData({ ...editJournalData, type: e.target.value as any })}
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
                        >
                          <option value="Debit">Debit (Dana Masuk)</option>
                          <option value="Kredit">Kredit (Dana Keluar)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Keterangan / Uraian Transaksi</label>
                      <input 
                        type="text" 
                        value={editJournalData.description || ''} 
                        onChange={(e) => setEditJournalData({ ...editJournalData, description: e.target.value })}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-bold"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Kategori Pos</label>
                        <input 
                          type="text" 
                          value={editJournalData.category || ''} 
                          onChange={(e) => setEditJournalData({ ...editJournalData, category: e.target.value })}
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white text-neutral-600"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Nominal Rupiah (Rp)</label>
                        <input 
                          type="number" 
                          value={editJournalData.amount ?? 0} 
                          onChange={(e) => setEditJournalData({ ...editJournalData, amount: Number(e.target.value) })}
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2.9 EDIT VOUCHER CODES */}
                {editingVoucherId !== null && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">KODE VOUCHER PROMO</label>
                        <input 
                          type="text" 
                          value={editVoucherData.code || ''} 
                          onChange={(e) => setEditVoucherData({ ...editVoucherData, code: e.target.value.toUpperCase() })}
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-mono font-bold uppercase"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Jenis Potongan Diskon</label>
                        <select 
                          value={editVoucherData.type || 'Nominal'} 
                          onChange={(e) => setEditVoucherData({ ...editVoucherData, type: e.target.value as any })}
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-semibold"
                        >
                          <option value="Nominal">Nominal (Rp)</option>
                          <option value="Persen">Persen (%)</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Potongan Nilai</label>
                        <input 
                          type="number" 
                          value={editVoucherData.discount ?? 0} 
                          onChange={(e) => setEditVoucherData({ ...editVoucherData, discount: Number(e.target.value) })}
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-mono font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 block mb-1">Sisa Kuota Kupon</label>
                        <input 
                          type="number" 
                          value={editVoucherData.quota ?? 10} 
                          onChange={(e) => setEditVoucherData({ ...editVoucherData, quota: Number(e.target.value) })}
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-semibold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 block mb-1">Tanggal Expired Kadaluarsa</label>
                      <input 
                        type="date" 
                        value={editVoucherData.expiryDate || ''} 
                        onChange={(e) => setEditVoucherData({ ...editVoucherData, expiryDate: e.target.value })}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
                      />
                    </div>
                  </div>
                )}

              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 px-6 py-4 bg-neutral-50/50 border-t border-neutral-100 font-semibold text-xs text-white">
                <button 
                  onClick={() => {
                    setEditingProgramId(null);
                    setEditingEventId(null);
                    setEditingNodeId(null);
                    setEditingTeacherId(null);
                    setEditingScheduleId(null);
                    setEditingFacilityId(null);
                    setEditingBudgetId(null);
                    setEditingJournalId(null);
                    setEditingVoucherId(null);
                  }} 
                  className="px-4 py-2 border border-neutral-200 text-neutral-600 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer font-medium"
                >
                  Batal
                </button>
                <button 
                  onClick={() => {
                    if (editingProgramId !== null) updateProgram();
                    if (editingEventId !== null) updateEvent();
                    if (editingNodeId !== null) updateNode();
                    if (editingTeacherId !== null) {
                      updateTeacher();
                    }
                    if (editingScheduleId !== null) updateSchedule();
                    if (editingFacilityId !== null) updateFacility();
                    if (editingBudgetId !== null) updateBudget();
                    if (editingJournalId !== null) updateJournal();
                    if (editingVoucherId !== null) updateVoucher();
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>

            </div>
          </div>
        )}

        {/* =============== POPUP MODAL FOR LEGALITAS PREVIEW / PRINT =============== */}
        {previewDoc && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col my-8">
              
              {/* Modal Header */}
              <div className="px-6 py-4 bg-neutral-900 border-b border-neutral-800 text-white flex items-center justify-between shadow-xs shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-600 rounded-xl shrink-0">
                    <Printer className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xs font-extrabold uppercase font-mono tracking-wide text-neutral-100 leading-none">Pratinjau & Cetak Dokumen</h3>
                    <p className="text-[9px] text-neutral-400 font-mono font-medium lowercase progress-status mt-1 truncate max-w-[400px]" title={previewDoc.filename}>
                      {previewDoc.filename || 'berkas_digital.pdf'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setPreviewDoc(null)} 
                  className="p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[70vh]">
                
                {/* Print Stylesheet Injector to ensure pixel-perfect A4 printing of the actual uploaded file */}
                <style dangerouslySetInnerHTML={{__html: `
                  @media print {
                    /* Hide EVERYTHING in the application */
                    body * {
                      visibility: hidden !important;
                    }
                    /* ONLY show the printable element and its children */
                    #printable-legal-document, #printable-legal-document * {
                      visibility: visible !important;
                    }
                    #printable-legal-document {
                      position: absolute !important;
                      left: 0 !important;
                      top: 0 !important;
                      width: 100% !important;
                      height: auto !important;
                      margin: 0 !important;
                      padding: 0 !important;
                      box-shadow: none !important;
                      border: none !important;
                      background: white !important;
                      z-index: 9999999 !important;
                    }
                    #printable-legal-document img {
                      max-width: 100% !important;
                      height: auto !important;
                      display: block !important;
                      margin: 0 auto !important;
                    }
                    #printable-legal-document iframe {
                      width: 100% !important;
                      height: 1000px !important;
                      display: block !important;
                      border: none !important;
                    }
                  }
                `}} />

                {/* Main Single Layout: Uploaded File */}
                <div className="space-y-4 text-left">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                    <h4 className="text-[10px] font-black uppercase text-neutral-400 font-mono tracking-wider">📂 Berkas Yang Diunggah</h4>
                    <span className="text-[8px] bg-emerald-600 text-white font-mono uppercase font-black px-2 py-0.5 rounded-md">🔴 Siap Cetak</span>
                  </div>
                  
                  {previewDoc.type === 'sk_text' ? (
                    <div 
                      id="printable-legal-document"
                      className="border border-neutral-200 bg-white shadow-xs rounded-2xl p-10 max-h-[500px] overflow-auto text-neutral-800 font-serif tracking-wide leading-relaxed relative"
                    >
                      {/* Classy formal double border for printable document */}
                      <div className="absolute top-4 left-4 right-4 bottom-4 border-2 border-double border-neutral-200 pointer-events-none rounded-lg" />
                      <div className="space-y-6 max-w-full whitespace-pre-wrap text-xs md:text-sm leading-relaxed px-6 py-4">
                        {previewDoc.file}
                      </div>
                    </div>
                  ) : previewDoc.file && (previewDoc.file.startsWith('data:image/') || previewDoc.file.includes('image/')) ? (
                    <div 
                      id="printable-legal-document"
                      className="border border-neutral-200 bg-neutral-50 rounded-2xl p-4 max-h-[480px] overflow-auto flex items-center justify-center bg-white"
                    >
                      <img 
                        src={blobPreviewUrl || previewDoc.file} 
                        alt="Uploaded Document" 
                        className="max-h-[440px] w-auto object-contain rounded-lg shadow-sm" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : previewDoc.file && (previewDoc.file.startsWith('data:application/pdf') || previewDoc.file.includes('pdf') || (previewDoc.filename && previewDoc.filename.toLowerCase().endsWith('.pdf'))) ? (
                    <div 
                      id="printable-legal-document"
                      className="border border-neutral-200 bg-neutral-50/50 rounded-2xl p-8 text-center space-y-4 bg-white shadow-xs border-dashed"
                    >
                      <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-xs border border-rose-100">
                        <FileText className="w-10 h-10" />
                      </div>
                      
                      <div className="space-y-2 max-w-md mx-auto">
                        <span className="text-[9px] bg-rose-105 text-rose-700 font-mono uppercase font-black px-2.5 py-1 rounded-md border border-rose-200/50">
                          🛡️ Dokumen PDF Terverifikasi
                        </span>
                        <h5 className="text-sm font-extrabold text-neutral-800 font-mono truncate pt-2" title={previewDoc.filename}>
                          {previewDoc.filename || 'berkas_legalitas.pdf'}
                        </h5>
                        <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                          Berkas PDF terunggah secara aman di sistem. Anda dapat menggunakan tombol cetak di bagian bawah untuk mencetak dokumen fisik ini.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div 
                      id="printable-legal-document"
                      className="border border-dashed border-neutral-200 bg-neutral-50 rounded-2xl p-8 text-center space-y-4 bg-white"
                    >
                      <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm animate-pulse">
                        <FileSpreadsheet className="w-8 h-8" />
                      </div>
                      <div className="space-y-1.5 max-w-md mx-auto">
                        <p className="text-xs font-black text-neutral-800 font-mono truncate" title={previewDoc.filename}>
                          {previewDoc.filename || 'berkas_legalitas.pdf'}
                        </p>
                        <p className="text-[10px] text-neutral-500 font-semibold leading-relaxed">
                          Berkas berformat non-gambar (seperti PDF atau Excel). Pratinjau visual langsung tidak dapat ditampilkan langsung, namun Anda dapat mengunduh berkas asli atau mencetaknya sekarang.
                        </p>
                      </div>
                      <div className="flex justify-center gap-3">
                        <a 
                          href={blobPreviewUrl || previewDoc.file} 
                          download={previewDoc.filename} 
                          className="inline-flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-[10px] px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer uppercase font-mono"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Unduh File Asli</span>
                        </a>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-150 space-y-2 text-neutral-600">
                    <p className="text-[10px] font-extrabold text-neutral-700 uppercase font-mono tracking-wider">Informasi Dokumen</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] font-semibold leading-relaxed">
                      <div><span className="text-neutral-400">Nama Dokumen :</span> <span className="text-neutral-850 font-bold">{previewDoc.title}</span></div>
                      <div><span className="text-neutral-400">Nomor Registrasi :</span> <span className="text-neutral-850 font-mono font-bold">{previewDoc.number || 'Belum Diisi'}</span></div>
                      <div className="col-span-2"><span className="text-neutral-400">Peringatan Akreditasi :</span> <span className="text-neutral-500 font-medium font-sans">Buku registrasi dan arsip fisik wajib disimpan di lemari administrasi lembaga Lembaga untuk kebutuhan verifikasi akreditasi lapangan BAN-PDM.</span></div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200/60 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-2 border border-neutral-200 text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors text-xs font-semibold cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={printPreviewDocument}
                  className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl transition-colors text-xs font-extrabold cursor-pointer flex items-center gap-1.5 uppercase font-mono shadow-xs"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                  <span>Cetak Dokumen</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-6 space-y-4 animate-fade-in text-left">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shrink-0 border border-red-100">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold uppercase font-mono tracking-wide text-neutral-900">Konfirmasi Hapus</h4>
                  <p className="text-[9px] text-neutral-400 font-mono">Tindakan tidak bisa dibatalkan</p>
                </div>
              </div>
              
              <p className="text-xs text-neutral-600 leading-relaxed font-semibold">
                Apakah Anda yakin ingin menghapus <strong className="text-red-650">{deleteConfirm.label}</strong> dari sistem?
              </p>
              
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-neutral-100 hover:bg-neutral-150 text-neutral-700 rounded-xl transition-all font-mono font-bold text-[10px] uppercase border border-neutral-200/50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteConfirm.onConfirm();
                    setDeleteConfirm(null);
                  }}
                  className="flex-1 px-4 py-2 bg-red-650 hover:bg-red-700 text-white rounded-xl transition-all font-mono font-extrabold text-[10px] uppercase shadow-md shadow-red-200 cursor-pointer"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =============== POPUP MODAL FOR INTERACTIVE SK GENERATOR (ALTERNATIF B) =============== */}
        {isSkGenModalOpen && (
          <div className="fixed inset-0 bg-black/65 backdrop-blur-md z-[99999] flex items-center justify-center p-3 sm:p-6 transition-all animate-fade-in">
            <div className="bg-slate-50 rounded-3xl border border-neutral-200 shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[95vh] lg:h-[85vh]">
              {/* Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-950 text-white flex items-center justify-between shadow-xs shrink-0 no-print">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-600 rounded-xl shrink-0">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xs font-black uppercase font-mono tracking-wider text-indigo-50 leading-none">Penyusun & Generator SK Cerdas AI</h3>
                    <p className="text-[9px] text-indigo-300 font-mono mt-1 lowercase font-semibold tracking-tight">
                      ruang kerja draf hukum keputusan resmi {lembaga.name.toLowerCase()}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSkGenModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Workspace Split Layout */}
              <div className="p-4 sm:p-6 flex-1 overflow-y-auto lg:overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 text-left">
                {/* PART 1: LEFT WORKSPACE INTERACTIVE FORM & EDITOR EDITOR */}
                <div className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto pr-1 no-print lg:max-h-full">
                  <div className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-2xl">
                    <span className="text-[9px] bg-indigo-600 text-white font-mono font-black py-0.5 px-2 rounded-md uppercase tracking-wider block mb-1.5 w-fit">
                      Tipe Dokumen Terpilih
                    </span>
                    <h4 className="text-xs font-bold text-slate-800">
                      Surat Keputusan (SK) {skGenType === 'pengangkatan' ? 'Lembaga Pengangkatan Kerja' : 'Penugasan Kerja Tim Pengajar'}
                    </h4>
                    <p className="text-[10px] text-neutral-500 leading-normal mt-1">
                      Kemampuan kustomasi instan. Anda dapat menyunting redaksi draf secara langsung. Perubahan akan seketika tercermin pada pratinjau kertas di sebelah kanan!
                    </p>
                    <button
                      type="button"
                      onClick={handleAIEnhanceSK}
                      disabled={isSkGenerating}
                      className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-extrabold text-[10px] uppercase font-mono px-4 py-3 rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      {isSkGenerating ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          <span>Merumuskan Draf AI...</span>
                        </>
                      ) : (
                        <>
                          <span>✨ Buat Draf Baru dengan AI</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Metadata fields */}
                  <div className="bg-white border border-neutral-200/80 p-4 rounded-2xl space-y-3.5 shadow-xs">
                    <h5 className="text-[10px] uppercase font-black tracking-wider text-slate-700 font-mono">1. Metadata No. Register & Tanggal</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-35">
                      <div>
                        <label className="block text-[9px] uppercase font-extrabold tracking-wide text-neutral-400 mb-1">Nomor Registrasi SK</label>
                        <input
                          type="text"
                          value={skGenNumber}
                          onChange={(e) => setSkGenNumber(e.target.value)}
                          placeholder="No. registrasi resmi..."
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-extrabold tracking-wide text-neutral-400 mb-1">Tanggal Penerbitan</label>
                        <input
                          type="date"
                          value={skGenDate}
                          onChange={(e) => setSkGenDate(e.target.value)}
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Textarea Redaksi */}
                  <div className="bg-white border border-neutral-200/80 p-4 rounded-2xl flex-1 flex flex-col min-h-[280px] shadow-xs">
                    <div className="flex justify-between items-center mb-1.5 shrink-0">
                      <label className="block text-[10px] uppercase font-black tracking-wider text-slate-700 font-mono">2. Sunting Blok Redaksi Hukum</label>
                      <span className="text-[9px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded-full font-bold">Karakter: {generatedSkText?.length || 0}</span>
                    </div>
                    <textarea
                      value={generatedSkText}
                      onChange={(e) => {
                        const val = e.target.value;
                        setGeneratedSkText(val);
                        autoApplySKText(val); // dynamic live save
                      }}
                      placeholder="Susun draf hukum struktural di sini..."
                      className="w-full text-xs p-3.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 font-mono leading-relaxed resize-none flex-1 overflow-y-auto focus:shadow-xs outline-none"
                    />
                    <p className="text-[9px] text-neutral-400 leading-normal mt-2">
                      💡 Ketukan teks otomatis disimpan sebagai dokumen representatif lembaga. Silakan ubah redaksional draf untuk menyesuaikan butir hukum.
                    </p>
                  </div>
                </div>

                {/* PART 2: RIGHT WORKSPACE REAL-TIME LIVE VISUAL SHEET PREVIEW */}
                <div className="lg:col-span-7 flex flex-col gap-4 lg:max-h-full overflow-hidden">
                  {/* Action Print Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-indigo-950 text-indigo-50 border border-indigo-900 p-4 rounded-2xl gap-3 shadow-xs no-print">
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        <span>PRATINJAU KERTAS CETAK AKTIF (A4)</span>
                      </h4>
                      <p className="text-[10px] text-indigo-305 leading-normal mt-0.5">
                        Hasil fisik cetakan printer dijamin 100% sama presisi dengan tampilan di bawah.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handlePrintSKDraft}
                      className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] uppercase font-mono px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
                    >
                      <Printer className="w-4 h-4 text-white" />
                      <span>Cetak SK Sekarang</span>
                    </button>
                  </div>

                  {/* Visual Paper sheet scroll-area */}
                  <div className="bg-neutral-200/50 border border-neutral-250 rounded-2xl p-4 sm:p-6 flex-1 overflow-y-auto flex justify-center shadow-inner">
                    <div 
                      id="printable-sk-paper-sheet" 
                      className="w-full max-w-[21cm] bg-white text-neutral-900 border border-neutral-300 p-8 sm:p-12 shadow-lg min-h-[29.7cm] font-serif leading-relaxed text-xs sm:text-sm select-text relative flex flex-col justify-between"
                      style={{ boxSizing: 'border-box' }}
                    >
                      {/* Elegant double border borders */}
                      <div className="absolute top-4 left-4 right-4 bottom-4 border-2 border-double border-neutral-200 pointer-events-none rounded-sm hidden sm:block" />
                      
                      {/* Legal contents */}
                      <div className="relative z-10 whitespace-pre-wrap leading-relaxed tracking-wide px-2 sm:px-4 py-2 text-neutral-900 text-left font-serif space-y-2">
                        {generatedSkText.split('\n').map((line, idx) => {
                          const trimmed = line.trim();
                          
                          // Skip raw editor indicator
                          if (trimmed.startsWith('KOP SURAT RESMI') || trimmed.startsWith('KOP SURAT RESMI INSTITUSI')) {
                            return null;
                          }

                          // Style Kop Surat / Header
                          if (idx < 5 && (trimmed.includes('LEMBAGA') || trimmed.includes('Izin') || trimmed.includes('Alamat') || trimmed.includes('NPSN') || trimmed.includes('Email') || trimmed.includes('Telepon') || trimmed.includes('Telp:'))) {
                            const isHeadline = idx < 3 && !trimmed.toLowerCase().includes('izin') && !trimmed.toLowerCase().includes('alamat') && !trimmed.toLowerCase().includes('telp') && !trimmed.toLowerCase().includes('npsn') && !trimmed.toLowerCase().includes('email');
                            return (
                              <div 
                                key={idx} 
                                className={`text-center font-extrabold tracking-wider text-black uppercase font-serif ${isHeadline ? 'text-xs sm:text-sm mb-1' : 'text-[9px] sm:text-xs text-neutral-800 normal-case font-sans'}`}
                              >
                                {trimmed}
                              </div>
                            );
                          }
                          
                          // Kop Divider line
                          if (trimmed.startsWith('===')) {
                            return (
                              <div key={idx} className="border-b-4 border-double border-black my-4 w-full" />
                            );
                          }

                          // Document Title / Number
                          if (trimmed.startsWith('SURAT KEPUTUSAN') || trimmed.startsWith('Nomor:') || trimmed.startsWith('TENTANG')) {
                            return (
                              <div 
                                key={idx} 
                                className={`text-center font-extrabold ${trimmed.startsWith('SURAT') ? 'text-xs sm:text-sm mt-4' : 'text-[9px] sm:text-xs'} uppercase tracking-wide text-black font-serif`}
                              >
                                {trimmed}
                              </div>
                            );
                          }

                          // Centered Person or Role badge
                          if (trimmed.startsWith('👉') || trimmed.includes('👉') || trimmed.includes('👈')) {
                            return (
                              <div 
                                key={idx} 
                                className="text-center py-2 bg-neutral-50 border-y border-neutral-150 text-xs font-black tracking-wider text-neutral-950 font-serif rounded"
                              >
                                {trimmed.replace(/👉|👈/g, '').trim()}
                              </div>
                            );
                          }

                          // Major section headers
                          if (trimmed === 'Menimbang:' || trimmed === 'Mengingat:' || trimmed === 'MEMUTUSKAN:' || trimmed === 'Menetapkan:') {
                            return (
                              <div 
                                key={idx} 
                                className="font-extrabold text-[10px] sm:text-xs uppercase tracking-wide text-black mt-4 mb-2.5 font-serif"
                              >
                                {trimmed}
                              </div>
                            );
                          }

                          // Signature Block Alignment (Ditetapkan di, Pada Tanggal, Sri Wanodya, etc.)
                          const totalLines = generatedSkText.split('\n').length;
                          const mappedPimpName = getPimpinanInfo().name;
                          const isPimpinanMatch = mappedPimpName && trimmed.includes(mappedPimpName);
                          if (idx >= totalLines - 8 && (trimmed.startsWith('Ditetapkan') || trimmed.startsWith('Pada Tanggal') || trimmed.startsWith('Pimpinan') || isPimpinanMatch || trimmed.includes('Direktur') || trimmed.includes('Kepala') || trimmed.includes('S.Pd.'))) {
                            const isSignee = trimmed.includes('S.Pd.') || isPimpinanMatch || trimmed.includes('Direktur Utama') || trimmed.includes('Kepala') || trimmed.includes('Pimpinan');
                            return (
                              <div 
                                key={idx} 
                                className={`w-[220px] ml-auto text-left pl-4 font-serif leading-relaxed text-[11px] tracking-wide text-black ${isSignee ? 'font-bold underline mt-6 first-of-type:mt-10' : ''}`}
                              >
                                {trimmed}
                              </div>
                            );
                          }

                          // Standard line
                          return (
                            <div key={idx} className="text-justify leading-relaxed text-[11px] text-neutral-950 font-serif select-text">
                              {line}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Handover notification callout */}
                  <div className="bg-amber-50 border border-amber-150 text-amber-900 rounded-2xl p-4 text-[11px] font-semibold leading-relaxed space-y-1 block no-print shrink-0">
                    <p className="font-extrabold flex items-center gap-1 uppercase tracking-wider text-amber-800 font-mono text-[9px]">
                      <span>⚠️ ALUR LEGALITAS & CAP RESMI</span>
                    </p>
                    <p>
                      Setelah draf selesai disunting, gunakan tombol <strong>"Cetak SK Sekarang"</strong> di atas. Bubuhkan <strong>tanda tangan basah</strong> pimpinan serta <strong>cap stempel fisik</strong> pada lembaran kertas hasil cetakan agar memiliki keabsahan hukum penuh.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-neutral-100 border-t border-neutral-200/60 flex justify-between items-center shrink-0 gap-3 no-print">
                <div className="text-[10px] text-neutral-510 font-mono font-bold max-sm:hidden">
                  ✅ Sistem menyimpan draf otomatis.
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSkGenModalOpen(false)}
                    className="px-5 py-2.5 border border-neutral-250 text-neutral-600 bg-white hover:bg-neutral-50 rounded-xl transition-all text-xs font-semibold cursor-pointer shadow-xs"
                  >
                    Tutup Workspace
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyGeneratedSK}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black cursor-pointer inline-flex items-center gap-1.5 uppercase font-mono shadow-md shadow-indigo-100 shrink-0"
                  >
                    Simpan & Terapkan SK
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeFacilityPhotoPreview && (
          <div className="fixed inset-0 bg-neutral-950/75 backdrop-blur-md z-[99999] flex items-center justify-center p-4" onClick={() => setActiveFacilityPhotoPreview(null)}>
            <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full p-4 border border-neutral-100 flex flex-col space-y-3 animate-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <span className="text-xs font-extrabold uppercase font-mono text-neutral-500 tracking-wide">Pratinjau Foto Inventaris</span>
                <button
                  type="button"
                  onClick={() => setActiveFacilityPhotoPreview(null)}
                  className="p-1.5 px-3 rounded-xl text-xs bg-neutral-105 hover:bg-neutral-200 text-neutral-700 font-bold transition-all cursor-pointer"
                >
                  Tutup ✕
                </button>
              </div>
              <div className="w-full max-h-[60vh] rounded-2xl overflow-hidden border border-neutral-100 bg-neutral-50 flex items-center justify-center">
                <img src={activeFacilityPhotoPreview} alt="Pratinjau Sarpras" className="max-w-full max-h-[60vh] object-contain" />
              </div>
              <div className="flex justify-end gap-2 pt-1 border-t border-neutral-100">
                <a
                  href={activeFacilityPhotoPreview}
                  download="foto_inventaris_sarpras.png"
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold font-mono uppercase cursor-pointer text-center flex items-center gap-1 shrink-0"
                >
                  Download Foto
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
