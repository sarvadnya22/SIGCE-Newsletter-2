import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash, Wand2, UploadCloud, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateNewsletter() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    semester: '',
    department: 'COMPUTER ENGINEERING DEPARTMENT',
    vision: '',
    mission: [''],
    peos: [''],
    psos: [''],
    hodMessage: '',
    principalMessage: '',
    headerImage: '',
    toppers: [],
    events: [],
    customSections: []
  });

  const handleCreate = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post('http://127.0.0.1:5000/api/newsletters', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Newsletter published successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error(error.response?.data || error);
      toast.error('Error saving newsletter: ' + (error.response?.data?.error || error.response?.data?.message || 'Unknown error'));
      setLoading(false);
    }
  };

  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return null;
    const bodyFormData = new FormData();
    bodyFormData.append('image', file);
    try {
      const res = await axios.post('http://127.0.0.1:5000/api/upload', bodyFormData);
      return `http://127.0.0.1:5000${res.data.imageUrl}`;
    } catch (err) {
      toast.error('Image upload failed');
      return null;
    }
  };

  const generateAIContent = async (index) => {
    const event = formData.events[index];
    if (!event.title) return toast.error('Event title is required for AI generation');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://127.0.0.1:5000/api/ai/generate', {
        title: event.title,
        date: event.date,
        shortDescription: event.shortDescription
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      const newEvents = [...formData.events];
      newEvents[index].generatedContent = res.data.generatedContent;
      setFormData({ ...formData, events: newEvents });
      toast.success('Content generated with AI!');
    } catch (err) {
      toast.error('AI Generation failed');
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #e8eeff 0%, #f0f4ff 50%, #eef2ff 100%)' }}>
      <div className="min-h-screen pb-24">
        {/* Sticky Header */}
        <div className="bg-white/80 backdrop-blur-2xl border-b border-white/50 sticky top-0 z-20 px-6 py-4 flex justify-between items-center shadow-sm">
          <div>
            <h1 className="text-xl font-black font-serif text-gray-900">Create New Newsletter</h1>
            <p className="text-xs text-gray-400 font-medium mt-0.5">AI-powered newsletter builder</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/dashboard')} className="btn-secondary">Cancel</button>
            <button onClick={handleCreate} disabled={loading} className="btn-primary flex items-center gap-2">
              <Save size={18} /> {loading ? 'Publishing…' : 'Save & Publish'}
            </button>
          </div>
        </div>

      <div className="max-w-4xl mx-auto mt-8 space-y-8 px-4">
        {/* Basic Info */}
        <section className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <h2 className="text-xl font-bold font-serif mb-6 text-sigceBlue border-b pb-2">Cover Details</h2>
          
          <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <label className="block text-sm font-bold mb-2 text-sigceBlue">College Header Image</label>
            <div className="flex items-center gap-4">
              <div className="w-full max-w-lg h-24 bg-white rounded-lg overflow-hidden border-2 border-dashed border-sigceBlue/50 relative group">
                {formData.headerImage ? <img src={formData.headerImage} alt="Header" className="w-full h-full object-contain" /> : <div className="flex flex-col items-center justify-center h-full text-sigceBlue/60 text-sm"><UploadCloud size={24} className="mb-1" /><span className="font-medium">Upload Header Image</span></div>}
                <input type="file" className="absolute opacity-0 inset-0 cursor-pointer" onChange={async (e) => {
                  const url = await uploadImage(e);
                  if (url) setFormData({ ...formData, headerImage: url });
                }} />
              </div>
              <p className="text-xs text-gray-500 font-medium">This banner will automatically be displayed beautifully at the top of every page in the PDF.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div><label className="block text-sm font-medium mb-1">Newsletter Title</label><input type="text" className="input-field" placeholder="e.g. The Spark" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}/></div>
            <div><label className="block text-sm font-medium mb-1">Semester/Duration</label><input type="text" className="input-field" placeholder="e.g. JULY-DECEMBER 2023" value={formData.semester} onChange={e => setFormData({ ...formData, semester: e.target.value })}/></div>
            <div className="col-span-2"><label className="block text-sm font-medium mb-1">Department</label><input type="text" className="input-field" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}/></div>
            <div className="col-span-2"><label className="block text-sm font-medium mb-1">Vision Statement</label><textarea className="input-field h-24" placeholder="To be recognized in industry and society as an excellent center..." value={formData.vision} onChange={e => setFormData({ ...formData, vision: e.target.value })}/></div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Mission Points</label>
            {formData.mission.map((m, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input type="text" className="input-field" value={m} onChange={e => {
                  const newM = [...formData.mission]; newM[i] = e.target.value; setFormData({ ...formData, mission: newM });
                }} />
                <button onClick={() => {
                  const newM = formData.mission.filter((_, idx) => idx !== i); setFormData({ ...formData, mission: newM });
                }} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash size={20}/></button>
              </div>
            ))}
            <button onClick={() => setFormData({ ...formData, mission: [...formData.mission, ''] })} className="text-sigceBlue text-sm font-medium flex items-center gap-1 mt-2 hover:underline"><Plus size={16}/> Add Mission Point</button>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Program Educational Objectives (PEOs)</label>
            {formData.peos?.map((peo, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input type="text" className="input-field" value={peo} onChange={e => {
                  const newP = [...formData.peos]; newP[i] = e.target.value; setFormData({ ...formData, peos: newP });
                }} />
                <button onClick={() => {
                  const newP = formData.peos.filter((_, idx) => idx !== i); setFormData({ ...formData, peos: newP });
                }} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash size={20}/></button>
              </div>
            ))}
            <button onClick={() => setFormData({ ...formData, peos: [...(formData.peos || []), ''] })} className="text-sigceBlue text-sm font-medium flex items-center gap-1 mt-2 hover:underline"><Plus size={16}/> Add PEO</button>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Program Specific Outcomes (PSOs)</label>
            {formData.psos?.map((pso, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input type="text" className="input-field" value={pso} onChange={e => {
                  const newP = [...formData.psos]; newP[i] = e.target.value; setFormData({ ...formData, psos: newP });
                }} />
                <button onClick={() => {
                  const newP = formData.psos.filter((_, idx) => idx !== i); setFormData({ ...formData, psos: newP });
                }} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash size={20}/></button>
              </div>
            ))}
            <button onClick={() => setFormData({ ...formData, psos: [...(formData.psos || []), ''] })} className="text-sigceBlue text-sm font-medium flex items-center gap-1 mt-2 hover:underline"><Plus size={16}/> Add PSO</button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Principal's Message</label>
              <textarea className="input-field h-32" placeholder="Message from the Principal..." value={formData.principalMessage || ''} onChange={e => setFormData({ ...formData, principalMessage: e.target.value })}/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">HOD's Message</label>
              <textarea className="input-field h-32" placeholder="Message from the Head of Department..." value={formData.hodMessage || ''} onChange={e => setFormData({ ...formData, hodMessage: e.target.value })}/>
            </div>
          </div>
        </section>

        {/* Custom Sections */}
        <section className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <h2 className="text-xl font-bold font-serif mb-6 text-sigceBlue border-b pb-2">Custom Sections</h2>
          {formData.customSections?.map((section, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-6 mb-6 bg-blue-50/30 relative">
              <button onClick={() => {
                const ns = formData.customSections.filter((_, idx) => idx !== i); setFormData({ ...formData, customSections: ns });
              }} className="absolute top-4 right-4 text-red-500 hover:scale-110"><Trash size={20}/></button>

              <div className="mb-4 pr-8">
                <label className="block text-sm font-medium mb-1">Section Title</label>
                <input type="text" className="input-field bg-white" placeholder="e.g. Director's Desk" value={section.sectionTitle || ''} onChange={e => {
                  const ns = [...formData.customSections]; ns[i].sectionTitle = e.target.value; setFormData({ ...formData, customSections: ns });
                }}/>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Section Content</label>
                <textarea className="input-field h-32 bg-white" placeholder="Write content here..." value={section.content || ''} onChange={e => {
                  const ns = [...formData.customSections]; ns[i].content = e.target.value; setFormData({ ...formData, customSections: ns });
                }}/>
              </div>
            </div>
          ))}
          <button onClick={() => setFormData({ ...formData, customSections: [...(formData.customSections || []), { sectionTitle: '', content: '' }] })} className="w-full py-4 border-2 border-dashed border-sigceBlue rounded-xl text-sigceBlue font-bold hover:bg-blue-50 flex items-center justify-center gap-2 transition-colors"><Plus size={20}/> Add Custom Section</button>
        </section>

        {/* Toppers Section */}
        <section className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <h2 className="text-xl font-bold font-serif mb-6 text-sigceBlue border-b pb-2">Our Toppers</h2>
          <div className="grid grid-cols-2 gap-6">
            {formData.toppers.map((topper, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 relative bg-gray-50 flex gap-4">
                <button onClick={() => {
                  const nt = formData.toppers.filter((_, idx) => idx !== i); setFormData({ ...formData, toppers: nt });
                }} className="absolute top-2 right-2 text-red-500 hover:scale-110"><Trash size={16}/></button>
                
                <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow flex-shrink-0 relative group">
                  {topper.photoUrl ? <img src={topper.photoUrl} alt="Topper" className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-gray-400"><UploadCloud /></div>}
                  <input type="file" className="absolute opacity-0 inset-0 cursor-pointer" onChange={async (e) => {
                    const url = await uploadImage(e);
                    if (url) { const nt = [...formData.toppers]; nt[i].photoUrl = url; setFormData({ ...formData, toppers: nt }); }
                  }}/>
                </div>
                
                <div className="flex-1 space-y-2">
                  <input type="text" className="input-field py-1 px-2 text-sm" placeholder="Student Name" value={topper.name} onChange={e => {
                    const nt = [...formData.toppers]; nt[i].name = e.target.value; setFormData({ ...formData, toppers: nt });
                  }}/>
                  <input type="text" className="input-field py-1 px-2 text-sm" placeholder="CGPA (e.g. 9.46)" value={topper.cgpa} onChange={e => {
                    const nt = [...formData.toppers]; nt[i].cgpa = e.target.value; setFormData({ ...formData, toppers: nt });
                  }}/>
                  <select className="input-field py-1 px-2 text-sm" value={topper.year} onChange={e => {
                    const nt = [...formData.toppers]; nt[i].year = e.target.value; setFormData({ ...formData, toppers: nt });
                  }}>
                    <option value="">Select Year</option>
                    <option value="First Year">First Year</option>
                    <option value="Second Year">Second Year</option>
                    <option value="Third Year">Third Year</option>
                    <option value="Fourth Year">Fourth Year</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setFormData({ ...formData, toppers: [...formData.toppers, { name: '', cgpa: '', year: '', photoUrl: '' }] })} className="text-sigceBlue text-sm font-medium flex items-center gap-1 mt-6 hover:underline"><Plus size={16}/> Add Topper</button>
        </section>

        {/* Events & AI Generation */}
        <section className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <h2 className="text-xl font-bold font-serif mb-6 text-sigceBlue border-b pb-2">Events & Activities</h2>
          {formData.events.map((evt, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-6 mb-6 bg-blue-50/30 relative">
              <button onClick={() => {
                const ne = formData.events.filter((_, idx) => idx !== i); setFormData({ ...formData, events: ne });
              }} className="absolute top-4 right-4 text-red-500 hover:scale-110"><Trash size={20}/></button>

              <div className="grid grid-cols-2 gap-4 mb-4 pr-8">
                <div><label className="block text-sm font-medium mb-1">Event Title</label><input type="text" className="input-field bg-white" placeholder="e.g. Teachers Day" value={evt.title} onChange={e => {
                  const ne = [...formData.events]; ne[i].title = e.target.value; setFormData({ ...formData, events: ne });
                }}/></div>
                <div><label className="block text-sm font-medium mb-1">Date</label><input type="date" className="input-field bg-white" value={evt.date ? evt.date.split('T')[0] : ''} onChange={e => {
                  const ne = [...formData.events]; ne[i].date = e.target.value; setFormData({ ...formData, events: ne });
                }}/></div>
                <div className="col-span-2"><label className="block text-sm font-medium mb-1">Short Description (Notes for AI)</label><input type="text" className="input-field bg-white" placeholder="e.g. Cultural event with ethnic wear, speeches, and cake cutting" value={evt.shortDescription} onChange={e => {
                  const ne = [...formData.events]; ne[i].shortDescription = e.target.value; setFormData({ ...formData, events: ne });
                }}/></div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Newsletter Content</label>
                  <button onClick={() => generateAIContent(i)} className="bg-sigceYellow hover:bg-yellow-500 text-yellow-900 px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-1 transition-colors shadow-sm"><Wand2 size={16}/> Generate with AI</button>
                </div>
                <textarea className="input-field h-32 bg-white" placeholder="Generated text will appear here..." value={evt.generatedContent || ''} onChange={e => {
                  const ne = [...formData.events]; ne[i].generatedContent = e.target.value; setFormData({ ...formData, events: ne });
                }}/>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Event Photos</label>
                <div className="flex gap-4 flex-wrap">
                  {evt.images && evt.images.map((img, imgIdx) => (
                    <div key={imgIdx} className="w-32 h-24 rounded-lg overflow-hidden relative shadow-sm border border-gray-200 group">
                      <img src={img} className="w-full h-full object-cover" alt="Event" />
                      <button onClick={() => {
                        const ne = [...formData.events]; ne[i].images = ne[i].images.filter((_, ididx) => ididx !== imgIdx); setFormData({ ...formData, events: ne });
                      }} className="absolute top-1 right-1 bg-red-500 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash size={12}/></button>
                    </div>
                  ))}
                  <div className="w-32 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-sigceBlue hover:text-sigceBlue transition-colors cursor-pointer relative bg-white">
                    <UploadCloud size={24} className="mb-1" />
                    <span className="text-xs font-medium">Add Photo</span>
                    <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={async (e) => {
                      const files = Array.from(e.target.files);
                      const urls = [];
                      for (let file of files) {
                        const bodyFormData = new FormData(); bodyFormData.append('image', file);
                        try { const res = await axios.post('http://127.0.0.1:5000/api/upload', bodyFormData); urls.push(`http://127.0.0.1:5000${res.data.imageUrl}`); } catch(err){}
                      }
                      const ne = [...formData.events]; ne[i].images = [...(ne[i].images || []), ...urls]; setFormData({ ...formData, events: ne });
                    }}/>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button onClick={() => setFormData({ ...formData, events: [...formData.events, { title: '', shortDescription: '', generatedContent: '', images: [] }] })} className="w-full py-4 border-2 border-dashed border-sigceBlue rounded-xl text-sigceBlue font-bold hover:bg-blue-50 flex items-center justify-center gap-2 transition-colors"><Plus size={20}/> Add Another Event Section</button>
        </section>
      </div>
      </div>
    </div>
  );
}
