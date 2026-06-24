import React, { useState } from 'react';
import { UserPlus, Search, ShieldCheck, Mail, Phone, Calendar, NotebookPen, Pencil, X } from 'lucide-react';
import { Institution, Student } from '../types';

interface PendaftaranSiswaProps {
  lembaga: Institution;
  students: Student[];
  onAddStudent: (newStudent: Student) => void;
  onUpdateStudent: (updatedStudent: Student) => void;
  onNavigateToRaport: (studentId: string) => void;
}

export default function PendaftaranSiswa({ lembaga, students, onAddStudent, onUpdateStudent, onNavigateToRaport }: PendaftaranSiswaProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgramFilter, setSelectedProgramFilter] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [nik, setNik] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedProgramId, setSelectedProgramId] = useState(lembaga.programs[0]?.id || '');

  const [registerSuccess, setRegisterSuccess] = useState('');

  // Student editing states
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editStudentData, setEditStudentData] = useState<Partial<Student>>({});

  const startEditStudent = (student: Student) => {
    setEditingStudentId(student.id);
    setEditStudentData(student);
  };

  const saveEditStudent = () => {
    if (!editStudentData.name || !editStudentData.nik || !editStudentData.email) {
      alert('Nama, NIK, dan Email wajib diisi!');
      return;
    }
    if (editStudentData.nik.length < 16) {
      alert('NIK wajib terdiri dari 16 digit!');
      return;
    }
    onUpdateStudent(editStudentData as Student);
    setEditingStudentId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterSuccess('');

    if (!name || !nik || !email) {
      alert('Nama, NIK, dan Email wajib diisi!');
      return;
    }

    if (nik.length < 16) {
      alert('MOHON PERIKSA: NIK wajib terdiri dari 16 digit sesuai KTP/KK!');
      return;
    }

    const newStudent: Student = {
      id: 's_' + Date.now(),
      name,
      nik,
      email,
      phone: phone || '08XXXXXXXXXX',
      programId: selectedProgramId,
      registrationType: 'Offline',
      joinDate: new Date().toISOString().split('T')[0],
      status: 'Aktif'
    };

    onAddStudent(newStudent);
    
    // reset form
    setName('');
    setNik('');
    setEmail('');
    setPhone('');
    
    setRegisterSuccess(`✅ Berhasil mendaftarkan siswa baru bernama "${newStudent.name}" (${newStudent.registrationType})!`);
    setTimeout(() => setRegisterSuccess(''), 4000);
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.nik.includes(searchQuery);
    const matchesProgram = selectedProgramFilter ? s.programId === selectedProgramFilter : true;
    return matchesSearch && matchesProgram;
  });

  return (
    <div className="space-y-6" id="pendaftaran-siswa-section">
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Modul Pendaftaran Siswa Lembaga Kursus</h3>
            <p className="text-xs text-neutral-500">Menerima dan mencatat data pendaftaran siswa baru via pendaftaran bagian administrasi (offline).</p>
          </div>
        </div>

        {/* Dynamic Form based on registration type */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-neutral-50/50 p-6 rounded-2xl border border-neutral-100 h-fit">
            <h4 className="font-bold text-neutral-800 text-sm mb-4 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-600" />
              <span>Form Registrasi Operator Offline</span>
            </h4>

            {registerSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-xs font-medium">
                {registerSuccess}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold uppercase text-neutral-500 block mb-1">Nama Lengkap Calon Siswa</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Andi Wijaya"
                  className="w-full text-xs p-2.5 bg-white border border-neutral-200 rounded-lg focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-neutral-500 block mb-1">Nomor Induk Kependudukan (NIK - 16 Digit)</label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                  placeholder="3273XXXXXXXXXXXXXXXX"
                  className="w-full text-xs p-2.5 bg-white border border-neutral-200 rounded-lg focus:outline-emerald-600 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-neutral-500 block mb-1">Email Aktif</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="andi@gmail.com"
                    className="w-full text-xs p-2.5 bg-white border border-neutral-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-neutral-500 block mb-1">No. WhatsApp/HP</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="08123456789"
                    className="w-full text-xs p-2.5 bg-white border border-neutral-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-neutral-500 block mb-1">Pilihan Program Kursus</label>
                <select
                  value={selectedProgramId}
                  onChange={(e) => setSelectedProgramId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-neutral-200 rounded-lg"
                >
                  {lembaga.programs.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} - (Daftar: Rp {(p.regFee || 0).toLocaleString('id-ID')} | Kursus: Rp {(p.tuitionFee || p.price || 0).toLocaleString('id-ID')} | Bulanan: Rp {(p.monthlyFee || 0).toLocaleString('id-ID')} - Total: Rp {p.price.toLocaleString('id-ID')})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-all shadow-3xs bg-neutral-800 hover:bg-neutral-900"
              >
                Daftarkan Siswa (Offline)
              </button>
            </form>
          </div>

          {/* Database Siswa yang terdaftar */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari siswa berdasarkan nama / NIK..."
                  className="w-full text-xs pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg"
                />
              </div>

              {/* Filter */}
              <select
                value={selectedProgramFilter}
                onChange={(e) => setSelectedProgramFilter(e.target.value)}
                className="text-xs p-2 bg-neutral-50 border border-neutral-200 rounded-lg"
              >
                <option value="">Semua Program</option>
                {lembaga.programs.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto border border-neutral-100 rounded-2xl bg-white">
              <table className="w-full text-sm text-left">
                <thead className="bg-neutral-50 text-neutral-600 font-bold text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Data Siswa / NIK</th>
                    <th className="p-3">Program Sesi</th>
                    <th className="p-3 text-center">Registrasi</th>
                    <th className="p-3 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs text-neutral-850">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map(std => {
                      const programName = lembaga.programs.find(p => p.id === std.programId)?.name || 'Materi Belajar';
                      
                      return (
                        <tr key={std.id} className="hover:bg-neutral-50/20">
                          <td className="p-3">
                            <p className="font-bold text-neutral-800">{std.name}</p>
                            <p className="text-[9px] text-neutral-400 font-mono">NIK: {std.nik}</p>
                            <div className="flex items-center gap-2 mt-1 text-[9px] text-neutral-500">
                              <span className="flex items-center gap-0.5"><Mail className="w-2.5 h-2.5" />{std.email}</span>
                              <span className="flex items-center gap-0.5"><Phone className="w-2.5 h-2.5" />{std.phone}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="text-neutral-700 font-medium block max-w-[150px] truncate" title={programName}>
                              {programName}
                            </span>
                            <span className="text-[9px] text-neutral-400 font-mono">Masuk: {std.joinDate}</span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`inline-block text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                              std.registrationType === 'Online'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-neutral-50 text-neutral-850 border border-neutral-200'
                            }`}>
                              {std.registrationType}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex flex-col gap-1 items-end justify-center">
                              <button
                                onClick={() => startEditStudent(std)}
                                className="text-[10px] text-emerald-600 hover:text-emerald-800 font-medium px-2 py-0.5 border border-emerald-150 rounded flex items-center gap-0.5 bg-emerald-50/10 cursor-pointer ml-auto"
                              >
                                <Pencil className="w-2.5 h-2.5" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => onNavigateToRaport(std.id)}
                                className="text-[10px] bg-neutral-800 hover:bg-neutral-900 text-white font-medium px-2.5 py-1 rounded-lg flex items-center gap-1 ml-auto shadow-2xs cursor-pointer"
                              >
                                <NotebookPen className="w-3 h-3 text-white" />
                                <span>Raport</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-neutral-400 italic">
                        Tidak ada data siswa terdaftar yang cocok dengan pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STUDENT EDIT MODAL POPUP                                                  */}
        {/* ========================================================================= */}
        {editingStudentId !== null && (
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
            <div className="bg-white rounded-3xl shadow-xl border border-neutral-150 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in-50 zoom-in-95 duration-150">
              
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
                <h3 className="font-bold text-neutral-800 text-sm">Edit Profil Data Siswa</h3>
                <button 
                  onClick={() => setEditingStudentId(null)} 
                  className="text-neutral-400 hover:text-neutral-600 font-bold p-1 rounded-full hover:bg-neutral-100/50 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-4 text-left">
                <div>
                  <label className="text-xs font-semibold text-neutral-600 block mb-1">Nama Lengkap Siswa</label>
                  <input 
                    type="text" 
                    value={editStudentData.name || ''} 
                    onChange={(e) => setEditStudentData({ ...editStudentData, name: e.target.value })}
                    className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-bold text-neutral-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-600 block mb-1">NIK (Nomor Induk Kependudukan - 16 Digit)</label>
                  <input 
                    type="text" 
                    maxLength={16}
                    value={editStudentData.nik || ''} 
                    onChange={(e) => setEditStudentData({ ...editStudentData, nik: e.target.value.replace(/\D/g, '') })}
                    className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-mono font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-neutral-600 block mb-1">Email Aktif</label>
                    <input 
                      type="email" 
                      value={editStudentData.email || ''} 
                      onChange={(e) => setEditStudentData({ ...editStudentData, email: e.target.value })}
                      className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-600 block mb-1">WhatsApp / HP</label>
                    <input 
                      type="text" 
                      value={editStudentData.phone || ''} 
                      onChange={(e) => setEditStudentData({ ...editStudentData, phone: e.target.value.replace(/\D/g, '') })}
                      className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-neutral-600 block mb-1">Tanggal Bergabung</label>
                    <input 
                      type="date" 
                      value={editStudentData.joinDate || ''} 
                      onChange={(e) => setEditStudentData({ ...editStudentData, joinDate: e.target.value })}
                      className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-600 block mb-1">Metode Pendaftaran</label>
                    <select 
                      value={editStudentData.registrationType || 'Offline'} 
                      onChange={(e) => setEditStudentData({ ...editStudentData, registrationType: e.target.value as any })}
                      className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-semibold"
                    >
                      <option value="Offline">Offline (Operator)</option>
                      <option value="Online">Online (Siswa Mandiri)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-600 block mb-1">Program Kursus Terdaftar</label>
                  <select 
                    value={editStudentData.programId || ''} 
                    onChange={(e) => setEditStudentData({ ...editStudentData, programId: e.target.value })}
                    className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white font-semibold text-neutral-800"
                  >
                    {lembaga.programs.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 px-6 py-4 bg-neutral-50/50 border-t border-neutral-100 font-semibold text-xs text-white">
                <button 
                  onClick={() => setEditingStudentId(null)} 
                  className="px-4 py-2 border border-neutral-200 text-neutral-600 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer font-medium"
                >
                  Batal
                </button>
                <button 
                  onClick={saveEditStudent}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
