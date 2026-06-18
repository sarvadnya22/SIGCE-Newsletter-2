import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Search, FileText, Award, Download, Eye, Sparkles, LogIn, 
  Calendar, BookOpen, GraduationCap, ChevronRight, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Archive() {
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);
  
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    const fetchNewsletters = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:5000/api/newsletters');
        setNewsletters(res.data);
      } catch (error) {
        console.error('Error fetching newsletters:', error);
        toast.error('Failed to load newsletter archive');
      } finally {
        setLoading(false);
      }
    };
    fetchNewsletters();
  }, []);

  // Filter logic
  const departments = [...new Set(newsletters.map(nl => nl.department))].filter(Boolean);

  const filteredNewsletters = newsletters.filter(nl => {
    const matchesSearch = nl.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (nl.semester && nl.semester.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDept = selectedDept === '' || nl.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleDownloadPdf = async (e, id) => {
    e.stopPropagation();
    setDownloadingId(id);
    const toastId = toast.loading('Generating PDF…');
    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/pdf/generate/${id}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `newsletter-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('PDF Downloaded!', { id: toastId });
      
      // Local state update for downloads counter increments
      setNewsletters(prev => prev.map(n => n.id === id ? { ...n, downloads: (n.downloads || 0) + 1 } : n));
    } catch (err) {
      toast.error('Failed to generate PDF', { id: toastId });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleReadOnline = (id) => {
    // Open in a new tab
    window.open(`/public-preview/${id}`, '_blank');
    // Increment view count locally (it gets tracked in DB when PublicPreview mounts)
    setNewsletters(prev => prev.map(n => n.id === id ? { ...n, views: (n.views || 0) + 1 } : n));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #f8fafc 50%, #eef2ff 100%)' }}>
      
      {/* ─── Navigation Header ───────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/75 backdrop-blur-md border-b border-slate-200/50 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black font-serif text-white text-base shadow-md shadow-blue-600/20" style={{ background: 'linear-gradient(135deg,#1e3a8a,#3b82f6)' }}>
              SG
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-800 tracking-tight leading-none">SIGCE</h1>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-1">Newsletter Portal</p>
            </div>
          </div>
          
          <div>
            {isLoggedIn ? (
              <Link to="/dashboard" className="btn-primary flex items-center gap-2 text-sm px-4 py-2 bg-sigceBlue hover:bg-blue-800 text-white rounded-xl shadow-lg transition-all">
                Admin Dashboard <ChevronRight size={16} />
              </Link>
            ) : (
              <Link to="/login" className="btn-secondary flex items-center gap-2 text-sm px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all font-semibold">
                <LogIn size={15} /> Admin Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ─── Hero Section ────────────────────────────────────── */}
      <section className="relative overflow-hidden py-16 px-6 text-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-400 rounded-full blur-3xl -translate-y-1/2"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-300 rounded-full blur-3xl -translate-y-1/2"></div>
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-xs font-bold text-blue-700 mb-6 shadow-sm">
            <Sparkles size={12} className="text-yellow-500 animate-pulse" /> Published Academic Newsletters
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 font-serif leading-tight">
            Explore College News, Events &<br />Student Achievements
          </h2>
          <p className="text-slate-500 mt-4 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Welcome to the official newsletter repository. Search, filter, read, and download beautifully formatted academic publications from various departments of SIGCE.
          </p>
        </div>
      </section>

      {/* ─── Filter & Search Bar ──────────────────────────────── */}
      <section className="px-6 mb-12">
        <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-md border border-slate-100 p-5 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search issues by title or keyword..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-sigceBlue text-sm font-medium text-slate-800 placeholder-slate-400 transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-64">
            <select
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-sigceBlue text-sm font-medium text-slate-700 cursor-pointer transition-all appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', backgroundSize: '16px' }}
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((dept, index) => (
                <option key={index} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ─── Newsletter Grid / Content ────────────────────────── */}
      <main className="flex-1 px-6 pb-24 max-w-7xl w-full mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden h-96 shadow-sm border border-slate-100">
                <div className="skeleton h-48 w-full"></div>
                <div className="p-6 space-y-4">
                  <div className="skeleton h-5 w-3/4 rounded-lg"></div>
                  <div className="skeleton h-4 w-1/2 rounded-lg"></div>
                  <div className="skeleton h-4 w-5/6 rounded-lg"></div>
                  <div className="mt-8 flex gap-3">
                    <div className="skeleton h-10 w-full rounded-xl"></div>
                    <div className="skeleton h-10 w-full rounded-xl"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredNewsletters.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-md border border-slate-100 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-6">
              <FileText size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Newsletters Found</h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
              No newsletter issues match your search queries. Try checking spelling or resetting your filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNewsletters.map((nl) => {
              const allImages = nl.events?.flatMap(e => e.images || []) || [];
              const coverImage = allImages[0] || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
              
              const themeColors = {
                blue: { primary: '#1e3a8a', accent: '#facc15' },
                red: { primary: '#991b1b', accent: '#f59e0b' },
                green: { primary: '#065f46', accent: '#10b981' },
                dark: { primary: '#1e293b', accent: '#facc15' },
                purple: { primary: '#5b21b6', accent: '#c084fc' },
                teal: { primary: '#0f766e', accent: '#2dd4bf' },
                amber: { primary: '#b45309', accent: '#fbbf24' },
                navy: { primary: '#0f172a', accent: '#38bdf8' }
              };
              const currentTheme = themeColors[nl.theme || 'blue'] || themeColors.blue;

              return (
                <div
                  key={nl.id}
                  className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full"
                  style={{
                    '--color-sigceBlue': currentTheme.primary,
                    '--color-sigce-blue': currentTheme.primary,
                    '--color-sigceYellow': currentTheme.accent,
                    '--color-sigce-yellow': currentTheme.accent
                  }}
                >
                  {/* Card Header & cover */}
                  <div className="relative h-48 overflow-hidden bg-slate-900">
                    <img
                      src={coverImage}
                      alt={nl.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
                    
                    {/* Semester badge */}
                    <div className="absolute bottom-4 left-4 text-white text-[10px] font-bold px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/10 uppercase tracking-widest">
                      {nl.semester}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex flex-col flex-1">
                    <span className="text-[10px] font-extrabold text-sigceBlue uppercase tracking-widest mb-1.5 inline-block">
                      {nl.department}
                    </span>
                    <h3 className="text-lg font-bold text-slate-950 leading-tight mb-3 line-clamp-2 font-serif hover:text-sigceBlue transition-colors">
                      {nl.title}
                    </h3>

                    {/* Stats badges */}
                    <div className="flex items-center gap-3 mb-6">
                      <span className="flex items-center gap-1 text-xs text-slate-400 font-semibold bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                        <Calendar size={12} className="text-slate-400" />
                        {new Date(nl.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400 font-semibold bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                        <BookOpen size={12} className="text-slate-400" /> {nl.events?.length || 0} Events
                      </span>
                    </div>

                    {/* View/Download counters */}
                    <div className="flex justify-between items-center bg-sigceBlue/5 border border-sigceBlue/10 rounded-xl p-3 mb-6 text-xs text-sigceBlue font-bold">
                      <span className="flex items-center gap-1">
                        <Eye size={13} className="text-sigceBlue" /> {nl.views || 0} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Download size={13} className="text-sigceBlue" /> {nl.downloads || 0} downloads
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                      <button
                        onClick={() => handleReadOnline(nl.id)}
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-sigceBlue hover:bg-sigceBlue/5 border border-slate-200 hover:border-sigceBlue transition-all"
                      >
                        <Eye size={14} /> Read Online
                      </button>
                      <button
                        onClick={(e) => handleDownloadPdf(e, nl.id)}
                        disabled={downloadingId === nl.id}
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white bg-sigceBlue hover:opacity-95 transition-all shadow-md disabled:bg-blue-400 disabled:shadow-none"
                      >
                        <Download size={14} /> {downloadingId === nl.id ? 'Exporting…' : 'Download PDF'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ─── Footer ─────────────────────────────────────────── */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12 px-6 text-center text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p>© {new Date().getFullYear()} SIGCE Engineering College. All rights reserved.</p>
          <div className="flex gap-6 text-xs font-semibold">
            <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
            <Link to="/login" className="hover:text-white transition-colors">Faculty Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
