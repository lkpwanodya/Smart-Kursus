export interface FAQItem {
  q: string;
  a: string;
}

export interface FeatureHighlight {
  title: string;
  description: string;
  file?: string;
  fileName?: string;
}

export interface Profile {
  address: string;
  phone: string;
  email: string;
  vision: string;
  mission: string;
  mapQuery?: string;
  logoUrl?: string;
  bannerUrl?: string;
  faqs?: FAQItem[];
  highlights?: FeatureHighlight[];
  npsn?: string;
  npsnFile?: string;
  npsnFileName?: string;
  skDisdik?: string;
  skDisdikFile?: string;
  skDisdikFileName?: string;
  accreditationRating?: string;
  accreditationFile?: string;
  accreditationFileName?: string;
  aktaNo?: string;
  aktaFile?: string;
  aktaFileName?: string;
  npwpNo?: string;
  npwpFile?: string;
  npwpFileName?: string;
  skProfilText?: string;
  skProfilNumber?: string;
  skProfilDate?: string;
  skStrukturText?: string;
  skStrukturNumber?: string;
  skStrukturDate?: string;
}

export interface OrgNode {
  id: string;
  name: string;
  role: string;
  parentId: string | null;
  rights?: string;
  duties?: string;
  skPengangkatanFile?: string;
  skPengangkatanFileName?: string;
  skPenugasanFile?: string;
  skPenugasanFileName?: string;
  certFile?: string;
  certFileName?: string;
  skPengangkatanText?: string;
  skPenugasanText?: string;
}

export interface Program {
  id: string;
  name: string;
  price: number;
  regFee: number;
  tuitionFee: number;
  monthlyFee: number;
  duration: string;
  description: string;
  status: 'Aktif' | 'Non-Aktif';
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'Akademik' | 'Ujian' | 'Libur' | 'Kegiatan';
}

export interface Teacher {
  id: string;
  name: string;
  specialty: string;
}

export interface ScheduleItem {
  id: string;
  programId: string;
  teacherId: string;
  day: string;
  time: string;
  room: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  date: string;
  status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpha';
  notes?: string;
}

export interface Facility {
  id: string;
  name: string;
  quantity: number;
  condition: 'Baik' | 'Rusak Ringan' | 'Rusak Berat';
  location: string;
  photoUrl?: string;
  documentUrl?: string;
}

export interface BudgetItem {
  id: string;
  code: string;
  activity: string;
  volume: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  type: 'Debit' | 'Kredit';
  category: string;
  amount: number;
}

export interface Voucher {
  id: string;
  code: string;
  discount: number; // nominal or %
  type: 'Nominal' | 'Persen';
  expiryDate: string;
  quota: number;
}

export interface SnpStandard {
  id: number;
  title: string;
  percentage: number;
  checklist: {
    id: string;
    task: string;
    checked: boolean;
    evidence?: string;
  }[];
}

export interface Student {
  id: string;
  name: string;
  nik: string;
  email: string;
  phone: string;
  programId: string;
  registrationType: 'Online' | 'Offline';
  joinDate: string;
  status: 'Aktif' | 'Lulus' | 'Keluar';
}

export interface RaportCard {
  id: string;
  studentId: string;
  period: string;
  theoryScore: number;
  practicalScore: number;
  attitudeScore: 'A' | 'B' | 'C' | 'D';
  aiFeedback: string;
  teacherNotes: string;
  issueDate: string;
}

export interface Institution {
  id: string;
  name: string;
  email: string; // login identifier
  password?: string;
  activeUntil: string; // ISO String style format, e.g. '2026-12-31'
  profile: Profile;
  structure: OrgNode[];
  programs: Program[];
  calendar: CalendarEvent[];
  teachers: Teacher[];
  schedule: ScheduleItem[];
  attendance: Attendance[];
  facilities: Facility[];
  budget: BudgetItem[];
  journal: JournalEntry[];
  vouchers: Voucher[];
  snpStandards: SnpStandard[];
  students: Student[];
  raportCards: RaportCard[];
  staffCredentials?: {
    id: string;
    name: string;
    username: string;
    role: 'staf_admin' | 'pengajar' | 'bendahara';
    active: boolean;
    password?: string;
  }[];
}

export interface AppState {
  institutions: Institution[];
  currentUser: {
    role: 'superadmin' | 'lembaga';
    id?: string; // used for institutional login identification
    lembagaId?: string;
    subRole?: 'pimpinan' | 'staf_admin' | 'pengajar' | 'bendahara';
    selectedTeacherId?: string;
  } | null;
}
