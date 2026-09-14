import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-6">
        <span className="text-2xl font-bold text-indigo-400">404</span>
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-2">Halaman Tidak Ditemukan</h1>
      <p className="text-sm text-slate-400 max-w-md mb-6">
        Halaman atau event yang Anda tuju tidak ditemukan atau telah dipindahkan.
      </p>
      <Link
        href="/"
        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
      >
        Kembali ke Dashboard
      </Link>
    </div>
  );
}

