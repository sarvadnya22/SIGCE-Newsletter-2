import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  PlusCircle, FileText, Download, LogOut, Eye, Trash2,
  Search, Activity, Award, Newspaper, Sparkles, ChevronRight, Share2, Send
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [newsletterToDelete, setNewsletterToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Email Share Modal States
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [newsletterToShare, setNewsletterToShare] = useState(null);
  const [recipients, setRecipients] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Admin';

  const filteredNewsletters = newsletters.filter(nl =>
    nl.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (nl.semester && nl.semester.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    const fetchNewsletters = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://127.0.0.1:5000/api/newsletters', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNewsletters(res.data);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchNewsletters();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleDownloadPdf = async (id) => {
    const toastId = toast.loading('Generating PDF…');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://127.0.0.1:5000/api/pdf/generate/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
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
    } catch {
      toast.error('Failed to generate PDF', { id: toastId });
    }
  };

  const confirmDelete = (e, nl) => {
    e.stopPropagation();
    setNewsletterToDelete(nl);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://127.0.0.1:5000/api/newsletters/${newsletterToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewsletters(newsletters.filter(n => n.id !== newsletterToDelete.id));
      toast.success('Newsletter deleted');
      setDeleteModalOpen(false);
    } catch {
      toast.error('Failed to delete newsletter');
    }
  };

  const openShareModal = (nl) => {
    setNewsletterToShare(nl);
    setEmailSubject(`SIGCE Newsletter: ${nl.title}`);
    setEmailMessage(`Hello,\n\nPlease find the latest ${nl.department} newsletter details for "${nl.title}" (${nl.semester}) published online.\n\nClick the link to read online or download.`);
    setRecipients('');
    setShareModalOpen(true);
  };

  const executeShare = async (e) => {
    e.preventDefault();
    if (!recipients.trim()) {
      toast.error('Recipient email(s) are required');
      return;
    }
    setSendingEmail(true);
    const toastId = toast.loading('Sending email...');
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://127.0.0.1:5000/api/newsletters/${newsletterToShare.id}/email`, {
        recipients,
        subject: emailSubject,
        message: emailMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Email shared successfully!', { id: toastId });
      setShareModalOpen(false);
    } catch (error) {
      toast.error('Failed to send email: ' + (error.response?.data?.message || 'Error occurred'), { id: toastId });
    } finally {
      setSendingEmail(false);
    }
  };

  const totalEvents = newsletters.reduce((a, b) => a + (b.events?.length || 0), 0);
  const totalToppers = newsletters.reduce((a, b) => a + (b.toppers?.length || 0), 0);
  const totalViews = newsletters.reduce((a, b) => a + (b.views || 0), 0);
  const totalDownloads = newsletters.reduce((a, b) => a + (b.downloads || 0), 0);

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #e8eeff 0%, #f0f4ff 50%, #eef2ff 100%)' }}>

      {/* ─── Sidebar ─────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen sticky top-0 h-screen" style={{ background: 'linear-gradient(180deg,#1e3a8a 0%,#1e40af 60%,#312e81 100%)' }}>
        {/* Logo */}
        <div className="px-6 py-8 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center font-black font-serif text-white text-lg shadow-inner backdrop-blur">NL</div>
            <div>
              <p className="text-white font-bold text-base tracking-tight leading-none">SIGCE</p>
              <p className="text-blue-200 text-xs font-medium mt-0.5">Newsletter Admin</p>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/15 text-white font-semibold cursor-pointer">
            <Newspaper size={18} />
            <span>Newsletters</span>
          </div>
          <Link to="/create" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 font-medium transition-all group">
            <PlusCircle size={18} className="group-hover:rotate-90 transition-transform" />
            <span>Create New</span>
          </Link>
        </nav>

        {/* User Card */}
        <div className="px-4 pb-6">
          <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-300 to-orange-400 flex items-center justify-center text-white font-black text-lg shadow-md">
                {username[0].toUpperCase()}
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">{username}</p>
                <p className="text-blue-300 text-xs">Administrator</p>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/10 hover:bg-red-500/30 text-blue-100 hover:text-white text-sm font-semibold transition-all border border-white/10">
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen">

        {/* Mobile Topbar */}
        <nav className="lg:hidden flex items-center justify-between px-5 py-4 glass border-b border-white/50 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black font-serif text-white text-base shadow" style={{ background: 'linear-gradient(135deg,#1e3a8a,#4f46e5)' }}>NL</div>
            <span className="font-bold text-gray-800 tracking-tight">SIGCE Admin</span>
          </div>
          <button onClick={handleLogout} className="p-2 rounded-xl hover:bg-red-50 text-gray-500 hover:text-red-600 transition-all">
            <LogOut size={20} />
          </button>
        </nav>

        <main className="flex-1 px-4 md:px-8 py-8 max-w-7xl w-full mx-auto">

          {/* ── Hero Header ── */}
          <div className="relative rounded-3xl overflow-hidden mb-10 shadow-2xl shadow-blue-900/20 animate-float-up" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#3b5bdb 55%,#4f46e5 100%)' }}>
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full opacity-10 border-4 border-white"></div>
              <div className="absolute -bottom-16 -right-4 w-48 h-48 rounded-full opacity-10 border-4 border-white"></div>
              <div className="absolute top-6 right-36 w-24 h-24 rounded-full opacity-10 border-2 border-white"></div>
              <div className="absolute top-3 right-10 opacity-20"><Sparkles size={120} strokeWidth={0.5} className="text-white" /></div>
            </div>

            <div className="relative z-10 px-8 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <p className="text-blue-200 font-semibold text-sm uppercase tracking-widest mb-2">Good day, {username}! 👋</p>
                <h1 className="text-4xl md:text-5xl font-black text-white leading-tight font-serif">
                  Newsletter<br className="hidden md:block" /> Command Center
                </h1>
                <p className="text-blue-200 mt-3 text-base max-w-md">Manage, publish, and distribute beautifully crafted SIGCE newsletters — all in one place.</p>
              </div>
              <Link to="/create" className="flex-shrink-0 group flex items-center gap-3 bg-white text-sigceBlue px-6 py-4 rounded-2xl font-bold text-base shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                <PlusCircle size={22} className="group-hover:rotate-90 transition-transform duration-300" />
                Create New Issue
              </Link>
            </div>
          </div>

          {!loading && newsletters.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
              {[
                { label: 'Published Issues', value: newsletters.length, icon: FileText, color: 'blue', border: 'border-blue-100', bg: 'bg-blue-50', text: 'text-blue-600', blob: 'bg-blue-50' },
                { label: 'Events Covered', value: totalEvents, icon: Activity, color: 'indigo', border: 'border-indigo-100', bg: 'bg-indigo-50', text: 'text-indigo-600', blob: 'bg-indigo-50' },
                { label: 'Toppers Featured', value: totalToppers, icon: Award, color: 'amber', border: 'border-amber-100', bg: 'bg-amber-50', text: 'text-amber-600', blob: 'bg-amber-50' },
              ].map(({ label, value, icon: Icon, border, bg, text, blob }, i) => (
                <div key={i} className={`stat-card ${border} animate-float-up-delay-${i + 1}`}>
                  <div className={`absolute -right-8 -top-8 w-28 h-28 ${blob} rounded-full blur-2xl`}></div>
                  <div className={`${bg} ${text} w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 relative z-10 shadow-sm`}>
                    <Icon size={26} />
                  </div>
                  <div className="relative z-10">
                    <p className="text-gray-400 font-semibold text-xs uppercase tracking-widest mb-1">{label}</p>
                    <h3 className="text-4xl font-black text-gray-900 font-serif">{value}</h3>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Toolbar ── */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">All Newsletters</h2>
              <p className="text-gray-400 text-sm mt-0.5">{newsletters.length} issue{newsletters.length !== 1 && 's'} published</p>
            </div>
            <div className="relative w-full sm:w-auto sm:min-w-[300px]">
              <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by title or semester…"
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-sigceBlue text-sm font-medium text-gray-800 placeholder-gray-400 shadow-sm transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* ── Grid ── */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden h-80 shadow-sm border border-gray-100">
                  <div className="skeleton h-44 w-full"></div>
                  <div className="p-5 space-y-3">
                    <div className="skeleton h-5 w-3/4 rounded-lg"></div>
                    <div className="skeleton h-4 w-1/2 rounded-lg"></div>
                    <div className="mt-6 flex justify-between">
                      <div className="skeleton h-4 w-16 rounded-lg"></div>
                      <div className="skeleton h-4 w-20 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : newsletters.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100 animate-float-up">
              <div className="w-20 h-20 rounded-2xl bg-blue-50 text-sigceBlue flex items-center justify-center mx-auto mb-6"><FileText size={36} /></div>
              <h3 className="text-2xl font-black text-gray-900 mb-2 font-serif">No newsletters yet</h3>
              <p className="text-gray-400 mb-8 max-w-xs mx-auto leading-relaxed">Create your first AI-powered newsletter for SIGCE students.</p>
              <Link to="/create" className="btn-primary inline-flex items-center gap-2"><PlusCircle size={18} /> Get Started</Link>
            </div>
          ) : filteredNewsletters.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
              <div className="w-20 h-20 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-6"><Search size={36} /></div>
              <h3 className="text-xl font-black text-gray-900 mb-2">No results for "{searchTerm}"</h3>
              <p className="text-gray-400">Try a different search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNewsletters.map((nl, idx) => {
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
                    className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-2 transition-all duration-300 flex flex-col"
                    style={{
                      animationDelay: `${idx * 0.05}s`,
                      '--color-sigceBlue': currentTheme.primary,
                      '--color-sigce-blue': currentTheme.primary,
                      '--color-sigceYellow': currentTheme.accent,
                      '--color-sigce-yellow': currentTheme.accent
                    }}
                  >
                    {/* Cover Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img src={coverImage} alt={nl.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-green-500/90 text-white text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full backdrop-blur-sm shadow">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse inline-block"></span> LIVE
                      </div>
                       
                       {/* Analytics Overlay Badge */}
                       <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 text-white text-[9px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm shadow border border-white/10">
                         <Eye size={10} className="mr-0.5" /> {nl.views || 0} | <Download size={10} className="mx-0.5" /> {nl.downloads || 0}
                       </div>

                       <div className="absolute bottom-3 left-3 text-white text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 uppercase tracking-wider">{nl.semester}</div>
                    </div>

                    {/* Body */}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-lg font-black text-gray-900 leading-tight mb-1 line-clamp-2 font-serif">{nl.title}</h3>
                      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">{nl.department}</p>

                      <div className="flex items-center gap-3 mb-5 text-xs text-gray-400 font-semibold">
                        <span className="flex items-center gap-1"><FileText size={12} /> {nl.events?.length || 0} events</span>
                        <span className="flex items-center gap-1"><Award size={12} /> {nl.toppers?.length || 0} toppers</span>
                      </div>
 
                       {/* Actions */}
                       <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                         <div className="flex items-center gap-1">
                           <Link to={`/edit/${nl.id}`} className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-600 hover:text-sigceBlue hover:bg-blue-50 transition-all">
                             <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4z"/></svg> Edit
                           </Link>
                           <Link to={`/public-preview/${nl.id}`} target="_blank" className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-600 hover:text-sigceBlue hover:bg-blue-50 transition-all">
                             <Eye size={13} /> Preview
                           </Link>
                           <button onClick={() => openShareModal(nl)} className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all">
                             <Share2 size={13} /> Share
                           </button>
                           <button onClick={e => confirmDelete(e, nl)} className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                             <Trash2 size={13} />
                           </button>
                         </div>
                        <button onClick={() => handleDownloadPdf(nl.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-sigceBlue bg-blue-50 hover:bg-sigceBlue hover:text-white transition-all shadow-sm">
                          <Download size={13} /> PDF
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ─── Delete Modal ─────────────────────────────────── */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-float-up">
            <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-500 flex items-center justify-center mb-6 mx-auto">
              <Trash2 size={30} />
            </div>
            <h3 className="text-2xl font-black text-center text-gray-900 mb-2 font-serif">Delete Newsletter?</h3>
            <p className="text-center text-gray-400 mb-8 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-gray-700">"{newsletterToDelete?.title}"</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModalOpen(false)} className="flex-1 btn-secondary py-3 font-bold text-sm">Cancel</button>
              <button onClick={executeDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all py-3 text-sm shadow-lg shadow-red-500/20">Delete Forever</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Share Modal ─────────────────────────────────── */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 animate-float-up relative">
            <button 
              onClick={() => setShareModalOpen(false)} 
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-xl font-bold focus:outline-none"
            >
              &times;
            </button>
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Send size={24} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-1 font-serif">Share Newsletter</h3>
            <p className="text-gray-400 text-sm mb-6">Send an online preview link of <strong className="text-gray-700">"{newsletterToShare?.title}"</strong> via email.</p>
            
            <form onSubmit={executeShare} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Recipient Emails (comma-separated)</label>
                <input 
                  type="text" 
                  className="input-field py-2.5" 
                  placeholder="e.g. principal@sigce.edu, hod.comp@sigce.edu" 
                  value={recipients}
                  onChange={e => setRecipients(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Subject</label>
                <input 
                  type="text" 
                  className="input-field py-2.5" 
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Custom Message</label>
                <textarea 
                  className="input-field py-2.5 h-28 resize-none" 
                  value={emailMessage}
                  onChange={e => setEmailMessage(e.target.value)}
                  required
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShareModalOpen(false)} 
                  className="flex-1 btn-secondary py-3 font-bold text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={sendingEmail} 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all py-3 text-sm shadow-lg shadow-blue-500/20 disabled:bg-blue-400"
                >
                  {sendingEmail ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
