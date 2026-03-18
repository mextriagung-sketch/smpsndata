import React, { useState, useEffect } from 'react';
import { Search, User, Phone, Mail, Users, UserCircle, Send, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Student {
  nisn: string;
  nama: string;
  kelas: string;
}

interface FormData {
  noWa: string;
  email: string;
  namaWali: string;
  jenisKelamin: string;
  noWaWali: string;
  emailWali: string;
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    noWa: '',
    email: '',
    namaWali: '',
    jenisKelamin: 'Laki-laki',
    noWaWali: '',
    emailWali: '',
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length >= 2) {
        fetchStudents();
      } else {
        setStudents([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/students?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Gagal mengambil data siswa');
      const data = await response.json();
      setStudents(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          nisn: selectedStudent.nisn,
          nama: selectedStudent.nama,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal mengirim data');
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedStudent(null);
        setSearchQuery('');
        setFormData({
          noWa: '',
          email: '',
          namaWali: '',
          jenisKelamin: 'Laki-laki',
          noWaWali: '',
          emailWali: '',
        });
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#141414] font-sans selection:bg-[#5A5A40] selection:text-white">
      {/* Header */}
      <header className="bg-white border-b border-[#141414]/10 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#5A5A40] rounded-xl flex items-center justify-center text-white">
              <UserCircle size={24} />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">APLIKASI DATA SISWA SMP SABIILUN NAJAH</h1>
              <p className="text-xs text-[#141414]/50 uppercase tracking-widest font-medium">Input Data Siswa</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {!selectedStudent ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-serif italic text-[#5A5A40]">Cari Data Siswa</h2>
              <p className="text-[#141414]/60 max-w-md mx-auto">
                Masukkan Nama atau NISN siswa untuk mulai menginput data tambahan yang diperlukan.
              </p>
            </div>

            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#141414]/30">
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder="Ketik Nama atau NISN..."
                className="w-full bg-white border border-[#141414]/10 rounded-2xl py-5 pl-12 pr-6 text-lg focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {loading && (
                <div className="absolute inset-y-0 right-4 flex items-center">
                  <Loader2 className="animate-spin text-[#5A5A40]" size={20} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <AnimatePresence mode="popLayout">
                {students.map((student) => (
                  <motion.button
                    key={student.nisn}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => setSelectedStudent(student)}
                    className="bg-white p-6 rounded-2xl border border-[#141414]/5 hover:border-[#5A5A40] hover:shadow-md transition-all text-left group"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-mono text-[#141414]/40 mb-1">{student.nisn}</p>
                        <h3 className="font-semibold text-lg group-hover:text-[#5A5A40] transition-colors">{student.nama}</h3>
                        <p className="text-sm text-[#141414]/60">Kelas: {student.kelas}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#F5F5F0] flex items-center justify-center text-[#141414]/30 group-hover:bg-[#5A5A40] group-hover:text-white transition-all">
                        <Users size={16} />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            {searchQuery.length >= 2 && students.length === 0 && !loading && (
              <div className="text-center py-12 text-[#141414]/40 italic">
                Siswa tidak ditemukan. Coba kata kunci lain.
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl border border-[#141414]/10 shadow-xl overflow-hidden"
          >
            <div className="bg-[#5A5A40] p-8 text-white">
              <button 
                onClick={() => setSelectedStudent(null)}
                className="text-white/60 hover:text-white text-sm mb-4 flex items-center gap-2 transition-colors"
              >
                ← Kembali ke Pencarian
              </button>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-white/60 text-xs font-mono uppercase tracking-widest mb-1">{selectedStudent.nisn}</p>
                  <h2 className="text-3xl font-serif italic">{selectedStudent.nama}</h2>
                  <p className="text-white/80">Kelas: {selectedStudent.kelas}</p>
                </div>
                <div className="hidden sm:block opacity-20">
                  <User size={80} />
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Data Siswa */}
                <div className="space-y-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#141414]/40 border-b border-[#141414]/5 pb-2">Data Kontak Siswa</h3>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Phone size={14} className="text-[#5A5A40]" /> No. WhatsApp Siswa
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="0812..."
                      className="w-full bg-[#F5F5F0] border-none rounded-xl p-4 focus:ring-2 focus:ring-[#5A5A40]/20 transition-all"
                      value={formData.noWa}
                      onChange={(e) => setFormData({...formData, noWa: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Mail size={14} className="text-[#5A5A40]" /> Email Siswa
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="siswa@email.com"
                      className="w-full bg-[#F5F5F0] border-none rounded-xl p-4 focus:ring-2 focus:ring-[#5A5A40]/20 transition-all"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                {/* Data Orang Tua */}
                <div className="space-y-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#141414]/40 border-b border-[#141414]/5 pb-2">Data Orang Tua / Wali</h3>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <User size={14} className="text-[#5A5A40]" /> Nama Orang Tua / Wali
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Nama Lengkap"
                      className="w-full bg-[#F5F5F0] border-none rounded-xl p-4 focus:ring-2 focus:ring-[#5A5A40]/20 transition-all"
                      value={formData.namaWali}
                      onChange={(e) => setFormData({...formData, namaWali: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Phone size={14} className="text-[#5A5A40]" /> No. WhatsApp Orang Tua
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="0812..."
                      className="w-full bg-[#F5F5F0] border-none rounded-xl p-4 focus:ring-2 focus:ring-[#5A5A40]/20 transition-all"
                      value={formData.noWaWali}
                      onChange={(e) => setFormData({...formData, noWaWali: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Mail size={14} className="text-[#5A5A40]" /> Email Orang Tua
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="ortu@email.com"
                      className="w-full bg-[#F5F5F0] border-none rounded-xl p-4 focus:ring-2 focus:ring-[#5A5A40]/20 transition-all"
                      value={formData.emailWali}
                      onChange={(e) => setFormData({...formData, emailWali: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Users size={14} className="text-[#5A5A40]" /> Jenis Kelamin
                    </label>
                    <select
                      className="w-full bg-[#F5F5F0] border-none rounded-xl p-4 focus:ring-2 focus:ring-[#5A5A40]/20 transition-all appearance-none"
                      value={formData.jenisKelamin}
                      onChange={(e) => setFormData({...formData, jenisKelamin: e.target.value})}
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm border border-red-100">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <div className="pt-4">
                <button
                  disabled={submitting || success}
                  type="submit"
                  className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg ${
                    success 
                      ? 'bg-green-500 text-white' 
                      : 'bg-[#5A5A40] text-white hover:bg-[#4A4A30] active:scale-[0.98]'
                  } disabled:opacity-70`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      Mengirim Data...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle2 size={24} />
                      Data Berhasil Disimpan!
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Simpan Data Siswa
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </main>

      <footer className="max-w-4xl mx-auto px-6 py-12 text-center text-[#141414]/30 text-xs uppercase tracking-[0.2em]">
        &copy; 2026  &bull; aplikasi pengimputan data siswa
      </footer>
    </div>
  );
}
