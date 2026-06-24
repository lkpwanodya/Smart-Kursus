import React, { useState } from 'react';
import { Printer, Sparkles, Notebook, Save, Trash2, Award, RefreshCcw } from 'lucide-react';
import { Institution, Student, RaportCard } from '../types';

interface RaportPrintProps {
  lembaga: Institution;
  students: Student[];
  onAddRaportCard: (raport: RaportCard) => void;
  onRemoveRaportCard: (id: string) => void;
  preselectedStudentId?: string;
}

export default function RaportPrint({ 
  lembaga, 
  students, 
  onAddRaportCard, 
  onRemoveRaportCard,
  preselectedStudentId = '' 
}: RaportPrintProps) {
  
  // Selection and creation states
  const [studentId, setStudentId] = useState(preselectedStudentId || (students[0]?.id || ''));
  const [period, setPeriod] = useState('Angkatan I Ganjil ' + new Date().getFullYear());
  const [theory, setTheory] = useState(80);
  const [practical, setPractical] = useState(85);
  const [attitude, setAttitude] = useState<'A' | 'B' | 'C' | 'D'>('B');
  const [aiFeedback, setAiFeedback] = useState('');
  const [teacherNotes, setTeacherNotes] = useState('Siswa aktif berpartisipasi dan menjaga ketertiban kelas.');

  const [generating, setGenerating] = useState(false);
  const [selectedReportToPrint, setSelectedReportToPrint] = useState<RaportCard | null>(null);

  // Trigger server-side AI evaluation
  const generateAiFeedback = async () => {
    if (!studentId) return alert('Silakan pilih siswa terlebih dahulu!');
    setGenerating(true);
    setAiFeedback('');
    try {
      const resp = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'evaluasi',
          scoreTheory: theory,
          scorePractice: practical,
          scoreAttitude: attitude
        })
      });
      const data = await resp.json();
      if (data.error) {
        setAiFeedback(`Gagal membuat evaluasi AI: ${data.error}`);
      } else {
        setAiFeedback(data.result);
      }
    } catch (e: any) {
      setAiFeedback(`Gagal tersambung ke asisten penilaian AI: ${e.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveRaport = () => {
    if (!studentId) return alert('Pilih siswa!');
    
    // Check if duplicate report exists for selected period
    const isDuplicate = lembaga.raportCards.some(r => r.studentId === studentId && r.period === period);
    if (isDuplicate) {
      if (!confirm('Peringatan: Raport siswa ini untuk periode ini sudah ada. Ingin menimpanya?')) {
        return;
      }
    }

    const newRaport: RaportCard = {
      id: 'rp_' + Date.now(),
      studentId,
      period,
      theoryScore: Number(theory),
      practicalScore: Number(practical),
      attitudeScore: attitude,
      aiFeedback: aiFeedback || 'Ujicoba kelulusan pembelajaran standard.',
      teacherNotes,
      issueDate: new Date().toISOString().split('T')[0]
    };

    onAddRaportCard(newRaport);
    alert('✅ Berhasil membukukan raport kelulusan siswa!');
    
    // Reset Form
    setAiFeedback('');
    setTeacherNotes('Siswa aktif berpartisipasi dan menjaga ketertiban kelas.');
  };

  // Printable layout in a popup window
  const printRaportCard = (raport: RaportCard) => {
    const student = students.find(s => s.id === raport.studentId);
    const progr = student ? lembaga.programs.find(p => p.id === student.programId) : null;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>BUKU_RAPORT_LEMBAGA_KURSUS_${student?.name.replace(/\s+/g, '_')}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 50px; color: #1a1a1a; line-height: 1.5; font-size: 14px; }
            .header-table { width: 100%; border-bottom: 3px double #000; margin-bottom: 30px; padding-bottom: 15px; }
            .logo-placeholder { font-size: 20px; font-weight: bold; color: #10b981; }
            .title { text-align: center; text-transform: uppercase; font-size: 18px; font-weight: bold; margin-bottom: 25px; letter-spacing: 1px;}
            .info-table { width: 100%; margin-bottom: 30px; }
            .info-table td { padding: 4px 10px; vertical-align: top; }
            .score-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .score-table th, .score-table td { border: 1px solid #1a1a1a; padding: 12px; text-align: center; }
            .score-table th { background-color: #f7f7f7; font-weight: bold; }
            .feedback-box { border: 1px solid #1a1a1a; padding: 20px; border-radius: 6px; margin-bottom: 40px; background-color: #fafafa; }
            .signatures { width: 100%; margin-top: 50px; }
            .signatures td { width: 50%; text-align: center; vertical-align: top; }
            .no-print-btn { display: none; }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td style="width: 150px;" class="logo-placeholder">Lembaga Kursus</td>
              <td>
                <h1 style="margin: 0; font-size: 22px; text-transform: uppercase;">${lembaga.name}</h1>
                <p style="margin: 3px 0 0 0; color: #555;">${lembaga.profile.address} | Telp: ${lembaga.profile.phone}</p>
                <p style="margin: 2px 0 0 0; font-[11px] font-mono; color: #777;">Izin Resmi Dinas Pendidikan No: NPSN_LEMBAGA_KURSUS_ACTIVE</p>
              </td>
            </tr>
          </table>

          <div class="title">Buku Raport Kelulusan Hasil Pembelajaran</div>

          <table class="info-table">
            <tr>
              <td style="width: 150px;"><strong>Nama Peserta Didik</strong></td>
              <td style="width: 20px;">:</td>
              <td><strong>${student?.name || 'N/A'}</strong></td>
              <td style="width: 150px;"><strong>Periode Angkatan</strong></td>
              <td style="width: 20px;">:</td>
              <td>${raport.period}</td>
            </tr>
            <tr>
              <td><strong>NIK Siswa</strong></td>
              <td>:</td>
              <td>${student?.nik || 'N/A'}</td>
              <td><strong>Program Pilihan</strong></td>
              <td>:</td>
              <td>${progr?.name || 'Materi Kursus'}</td>
            </tr>
            <tr>
              <td><strong>Durasi Kelas</strong></td>
              <td>:</td>
              <td colspan="4">${progr?.duration || 'N/A'} (Lulus Pendaftaran ${student?.registrationType})</td>
            </tr>
          </table>

          <table class="score-table">
            <thead>
              <tr>
                <th style="width: 10%;">No.</th>
                <th style="text-align: left; width: 45%;">Aspek Kompetensi Evaluasi</th>
                <th style="width: 20%;">Nilai Angka (Skala 0-100)</th>
                <th style="width: 25%;">Predikat Kelayakan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td style="text-align: left;"><strong>Ujian Penguasaan Teori Dasar</strong></td>
                <td><strong>${raport.theoryScore}</strong></td>
                <td>${raport.theoryScore >= 85 ? 'Sangat Kompeten' : raport.theoryScore >= 75 ? 'Kompeten' : 'Cukup Kompeten'}</td>
              </tr>
              <tr>
                <td>2</td>
                <td style="text-align: left;"><strong>Ujian Praktik Keahlian Mandiri</strong></td>
                <td><strong>${raport.practicalScore}</strong></td>
                <td>${raport.practicalScore >= 85 ? 'Sangat Kompeten' : raport.practicalScore >= 75 ? 'Kompeten' : 'Cukup Kompeten'}</td>
              </tr>
              <tr>
                <td>3</td>
                <td style="text-align: left;"><strong>Sikap, Karakter & Kedisiplinan</strong></td>
                <td><strong style="font-size: 16px;">${raport.attitudeScore}</strong></td>
                <td>${raport.attitudeScore === 'A' ? 'Istimewa' : raport.attitudeScore === 'B' ? 'Sangat Baik' : 'Cukup'}</td>
              </tr>
            </tbody>
          </table>

          <div class="feedback-box">
            <h4 style="margin: 0 0 10px 0; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Rekomendasi Penilaian AI (Kopilot Evaluator)</h4>
            <p style="margin: 0; font-style: italic; color: #444; font-size: 13px; line-height: 1.6;">"${raport.aiFeedback}"</p>
          </div>

          <div style="border: 1px solid #1a1a1a; padding: 15px; border-radius: 6px; margin-bottom: 40px; background-color: #ffffff;">
            <h4 style="margin: 0 0 5px 0;">Catatan Tambahan Instruktur:</h4>
            <p style="margin: 0; font-size: 13px;">${raport.teacherNotes}</p>
          </div>

          <table class="signatures">
            <tr>
              <td>
                <p>Orang Tua / Wali Siswa,</p>
                <br/><br/><br/>
                <p><strong>________________________</strong></p>
              </td>
              <td>
                <p>Yogyakarta, ${new Date(raport.issueDate).toLocaleDateString('id-ID')}</p>
                <p>Pimpinan Lembaga / Kepala Instruktur,</p>
                <br/><br/><br/>
                <p><strong>________________________</strong></p>
                <p style="font-size: 11px; margin-top: 2px;">${lembaga.name}</p>
              </td>
            </tr>
          </table>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="raport-screen">
      {/* Input / Pembuatan Buku Raport baru */}
      <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-4">
        <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-2 border-b border-neutral-50 pb-3">
          <Award className="w-4.5 h-4.5 text-emerald-600" />
          <span>Pengisian Nilai Raport Baru</span>
        </h3>

        <div className="space-y-3.5 text-xs text-neutral-700">
          <div>
            <span className="font-semibold block mb-1 uppercase text-[10px] text-neutral-450">Pilih Siswa Didik</span>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full text-xs p-2.5 bg-white border border-neutral-200 rounded-lg"
            >
              <option value="">-- Cari atau pilih siswa --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
              ))}
            </select>
          </div>

          <div>
            <span className="font-semibold block mb-1 uppercase text-[10px] text-neutral-450">Periode Ujian / Semester</span>
            <input
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full text-xs p-2.5 bg-white border border-neutral-200 rounded-lg"
              placeholder="Contoh: Angkatan I Ganjil 2026"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="font-semibold block mb-1 uppercase text-[10px] text-neutral-450">Nilai Teori</span>
              <input
                type="number"
                min="0"
                max="100"
                value={theory}
                onChange={(e) => setTheory(Number(e.target.value))}
                className="w-full text-xs p-2 bg-white border border-neutral-200 rounded-lg"
              />
            </div>
            <div>
              <span className="font-semibold block mb-1 uppercase text-[10px] text-neutral-450">Nilai Praktek</span>
              <input
                type="number"
                min="0"
                max="100"
                value={practical}
                onChange={(e) => setPractical(Number(e.target.value))}
                className="w-full text-xs p-2 bg-white border border-neutral-200 rounded-lg"
              />
            </div>
            <div>
              <span className="font-semibold block mb-1 uppercase text-[10px] text-neutral-450">Predikat Sikap</span>
              <select
                value={attitude}
                onChange={(e) => setAttitude(e.target.value as any)}
                className="w-full text-xs p-2 bg-white border border-neutral-200 rounded-lg"
              >
                <option value="A">Sikap A (Istimewa)</option>
                <option value="B">Sikap B (Baik Sekali)</option>
                <option value="C">Sikap C (Cukup)</option>
                <option value="D">Sikap D (Perlu Pembinaan)</option>
              </select>
            </div>
          </div>

          <div className="border-t border-neutral-50 pt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold block uppercase text-[10px] text-neutral-450">Kalimat Evaluasi AI (Gemini)</span>
              <button
                type="button"
                onClick={generateAiFeedback}
                disabled={generating}
                className="text-[10px] text-emerald-600 font-semibold hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100"
              >
                <Sparkles className="w-3 h-3 animate-spin-slow" />
                <span>{generating ? 'Mereka-reka...' : 'Tulis Otomatis via AI'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={aiFeedback}
              onChange={(e) => setAiFeedback(e.target.value)}
              placeholder="Klik 'Tulis Otomatis via AI' atau ketik evaluasi kelulusan di sini..."
              className="w-full text-xs p-2.5 bg-neutral-50 focus:bg-white border border-neutral-200 rounded-lg"
            />
          </div>

          <div>
            <span className="font-semibold block mb-1 uppercase text-[10px] text-neutral-450">Catatan Manual Instruktur</span>
            <input
              type="text"
              value={teacherNotes}
              onChange={(e) => setTeacherNotes(e.target.value)}
              className="w-full text-xs p-2.5 bg-white border border-neutral-200 rounded-lg"
            />
          </div>

          <button
            onClick={handleSaveRaport}
            className="w-full bg-emerald-650 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-3xs"
            style={{ backgroundColor: '#059669' }}
          >
            <Save className="w-4 h-4 text-white" />
            <span>Bukukan Raport Hasil</span>
          </button>
        </div>
      </div>

      {/* Daftar Raport yang sudah diterbitkan & Siap Cetak */}
      <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-4">
        <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-2 border-b border-neutral-50 pb-3">
          <Notebook className="w-4.5 h-4.5 text-neutral-500" />
          <span>Buku Arsip Raport Kelulusan</span>
        </h3>

        <div className="space-y-3">
          {lembaga.raportCards.length > 0 ? (
            lembaga.raportCards.map(report => {
              const student = students.find(s => s.id === report.studentId);
              const progName = student ? (lembaga.programs.find(p => p.id === student.programId)?.name || 'Materi') : 'Materi';
              return (
                <div key={report.id} className="p-4 border border-neutral-100 hover:border-emerald-500 rounded-2xl hover:shadow-xs transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-neutral-50/20">
                  <div>
                    <h4 className="font-bold text-neutral-800 text-xs sm:text-sm">{student?.name || 'Siswa N/A'}</h4>
                    <p className="text-[10px] text-neutral-500 font-mono mt-0.5">{progName} | {report.period}</p>
                    <div className="flex gap-3 mt-2 text-[10px] font-mono text-neutral-600">
                      <span>Teori: <strong>{report.theoryScore}</strong></span>
                      <span>Praktek: <strong>{report.practicalScore}</strong></span>
                      <span>Sikap: <strong>{report.attitudeScore}</strong></span>
                    </div>
                  </div>
                  <div className="flex gap-2 self-stretch sm:self-center">
                    <button
                      onClick={() => printRaportCard(report)}
                      className="flex-1 bg-neutral-800 hover:bg-neutral-900 text-white font-semibold text-xs px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-all"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak Raport</span>
                    </button>
                    <button
                      onClick={() => onRemoveRaportCard(report.id)}
                      className="border border-neutral-200 hover:border-red-300 hover:bg-red-50 text-neutral-400 hover:text-red-600 p-2 rounded-xl"
                      title="Hapus Raport"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 text-neutral-400 text-xs space-y-1">
              <p className="font-semibold text-neutral-500">Belum Ada Raport Terbit</p>
              <p className="text-[10px] text-neutral-450 italic">Gunakan panel kiri untuk mengisi & melampirkan ulasan AI.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
