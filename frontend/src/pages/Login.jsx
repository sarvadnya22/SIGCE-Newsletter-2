import { useState } from 'react';
import axios from 'axios';
import { Newspaper, BookOpen, ArrowRight, CheckCircle } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('http://127.0.0.1:5000/api/auth/login', { username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      window.location.href = '/dashboard';
    } catch (err) {
      if (!err.response) {
        setError('Network Error: Could not connect to backend server. Ensure backend is running.');
      } else {
        setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ─── Left Panel (Branding) ─── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[55%] p-12 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0f2060 0%, #1e3a8a 40%, #3b5bdb 80%, #4f46e5 100%)' }}
      >
        {/* Animated bg shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="animate-blob absolute top-[-10%] left-[-5%] w-[30rem] h-[30rem] rounded-full bg-blue-500 opacity-20"></div>
          <div className="animate-blob absolute bottom-[-10%] right-[-5%] w-[28rem] h-[28rem] rounded-full bg-indigo-400 opacity-20" style={{ animationDelay: '3s' }}></div>
          <div className="animate-blob absolute top-[40%] right-[20%] w-[16rem] h-[16rem] rounded-full bg-blue-300 opacity-10" style={{ animationDelay: '6s' }}></div>
          {/* Grid dots */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}></div>
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-white font-black font-serif text-xl border border-white/20 backdrop-blur shadow-lg">NL</div>
          <span className="font-bold text-lg text-white/90 tracking-tight">SIGCE Newsletter</span>
        </div>

        {/* Main Copy */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-blue-200 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur">
            <Newspaper size={13} /> AI-Powered Newsletter Platform
          </div>
          <h1 className="text-6xl font-black leading-tight font-serif mb-6">
            Tell stories<br />
            that <span className="text-yellow-300">inspire.</span>
          </h1>
          <p className="text-blue-200 text-lg leading-relaxed max-w-md">
            Create, manage, and publish beautifully crafted academic newsletters using the power of AI — in minutes, not hours.
          </p>

          <div className="mt-10 space-y-3">
            {['AI Content Generation', 'Multi-page PDF Export', 'Event Photo Galleries', 'Topper Showcases'].map(f => (
              <div key={f} className="flex items-center gap-3 text-blue-100 font-medium">
                <CheckCircle size={17} className="text-yellow-300 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10 border-t border-white/10 pt-6">
          <p className="text-blue-200 text-sm italic">"Knowledge shared is knowledge multiplied."</p>
          <p className="text-blue-300/70 text-xs mt-1">Smt. Indira Gandhi College of Engineering</p>
        </div>
      </div>

      {/* ─── Right Panel (Form) ─── */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: 'linear-gradient(145deg, #eef2ff 0%, #f0f4ff 100%)' }}>
        <div className="w-full max-w-sm animate-float-up">

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black font-serif text-white text-lg" style={{ background: 'linear-gradient(135deg,#1e3a8a,#4f46e5)' }}>NL</div>
            <span className="font-bold text-gray-800 text-lg">SIGCE Newsletter</span>
          </div>

          <div className="mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-xl shadow-blue-900/20" style={{ background: 'linear-gradient(135deg,#1e3a8a,#4f46e5)' }}>
              <BookOpen className="text-white" size={26} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 leading-tight font-serif">Welcome back</h2>
            <p className="text-gray-400 mt-1.5 font-medium">Sign in to view your admin dashboard</p>
          </div>

          {error && (
            <div className="mb-5 text-sm text-red-600 bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
              <input
                type="text"
                className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-sigceBlue text-gray-900 font-medium placeholder-gray-300 shadow-sm transition-all"
                placeholder="e.g. admin"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-sigceBlue text-gray-900 font-medium placeholder-gray-300 shadow-sm transition-all"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-white font-black rounded-2xl text-base flex items-center justify-center gap-3 group disabled:opacity-70 transition-all shadow-xl shadow-blue-900/25"
              style={{ background: 'linear-gradient(135deg,#1e3a8a,#4f46e5)', backgroundSize: '200% 200%' }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Sign in to Dashboard <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-400 font-medium">
            Secured for SIGCE administrators only
          </p>
        </div>
      </div>
    </div>
  );
}
