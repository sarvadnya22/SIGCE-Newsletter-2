import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function PublicPreview() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchNL = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:5000/api/newsletters/${id}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNL();
  }, [id]);

  if (!data) return <div className="p-10 text-center text-gray-500 font-serif">Loading PDF Template...</div>;

  // Try to find a nice cover image from events
  const allImages = data.events.flatMap(e => e.images || []);
  const coverImage = allImages.length > 0 ? allImages[0] : 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';

  // Chunking Algorithm: Splits huge events over 250 words / many photos into exact distinct pages
  const chunkEventToPages = (evt) => {
    const pages = [];
    const words = (evt.generatedContent || evt.shortDescription || "").split(/\s+/);
    const images = [...(evt.images || [])];
    
    let wordIndex = 0;
    while (wordIndex < words.length || images.length > 0) {
      const hasImages = images.length > 0;
      const WORDS_PER_PAGE = hasImages ? 220 : 380; 
      
      const pageWords = words.slice(wordIndex, wordIndex + WORDS_PER_PAGE).join(' ');
      wordIndex += WORDS_PER_PAGE;
      
      const numImages = pageWords.trim().length > 0 ? 2 : 6;
      const pageImages = images.splice(0, numImages);
      
      if (pageWords.trim().length === 0 && pageImages.length === 0) break;
      
      pages.push({
        ...evt,
        textChunk: pageWords,
        imageChunk: pageImages
      });
    }
    return pages.length > 0 ? pages : [{ ...evt, textChunk: '', imageChunk: [] }];
  };

  const allEventPages = data ? data.events.flatMap((evt) => chunkEventToPages(evt)) : [];
  const hasPage3 = data && (data.peos?.length > 0 || data.psos?.length > 0 || data.hodMessage || data.principalMessage);
  const baseEventPageNum = (hasPage3 ? 4 : 3) + (data?.customSections?.length || 0);

  return (
    <div className="bg-white min-h-screen text-gray-900 font-sans mx-auto shadow-2xl overflow-hidden print:shadow-none print:m-0 print:p-0 wrapper" style={{ width: '210mm' }}>
      
      {/* Page 1: Premium Cover */}
      <div className="relative w-[210mm] min-h-[297mm] bg-white flex flex-col page">
        {/* Top Header */}
        <div className="w-full bg-white relative z-10 px-4 py-2 border-b-4 border-sigceBlue shadow-sm">
          {data.headerImage ? 
            <img src={data.headerImage} alt="College Header" className="w-full h-28 object-contain" /> : 
            <img src="/college-header.jpg" alt="College Header" className="w-full h-28 object-contain" />
          }
          <div className="absolute bottom-0 w-full h-1 bg-sigceYellow"></div>
        </div>

        {/* Big Hero Image */}
        <div className="relative w-full h-[120mm]">
          <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-sigceBlue/90 via-sigceBlue/20 to-transparent"></div>
          
          <div className="absolute bottom-8 left-12 right-12 z-20">
            <h1 className="text-7xl font-black text-white tracking-tighter leading-none mb-2 drop-shadow-md">
              NEWSLETTER
            </h1>
            <div className="inline-block bg-sigceYellow text-sigceBlue text-lg font-black px-6 py-2 uppercase tracking-widest shadow-lg">
              {data.semester}
            </div>
          </div>
        </div>

        {/* Lower Highlight Section */}
        <div className="flex-1 px-12 py-10 flex flex-col gap-6 bg-gray-50 relative">
          <div className="absolute top-0 right-12 w-24 h-full bg-blue-50/50 skew-x-12 transform origin-top translate-x-12"></div>
          
          <h3 className="text-2xl font-bold text-sigceBlue border-b-4 border-sigceYellow inline-block pb-2 mr-auto relative z-10">IN THIS ISSUE</h3>
          
          <div className="grid grid-cols-2 gap-8 relative z-10">
            <div className="flex flex-col gap-4">
              {data.events.slice(0, 4).map((evt, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-lg shadow-sm border-l-4 border-sigceBlue">
                  <div className="w-12 h-12 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                    {evt.images?.[0] ? <img src={evt.images[0]} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-sigceBlue/10 flex items-center justify-center font-bold text-sigceBlue">{idx+1}</div>}
                  </div>
                  <h4 className="font-bold text-gray-800 line-clamp-2 leading-tight">{evt.title}</h4>
                </div>
              ))}
            </div>
            
            <div className="space-y-6">
              {data.vision && (
                <div className="bg-white p-6 rounded-xl shadow-md relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-sigceYellow"></div>
                  <h4 className="font-black text-sigceBlue mb-2 tracking-widest">VISION</h4>
                  <p className="text-sm text-gray-600 font-serif italic line-clamp-4">{data.vision}</p>
                </div>
              )}
              {data.mission && data.mission.length > 0 && (
                <div className="bg-sigceBlue text-white p-6 rounded-xl shadow-md">
                  <h4 className="font-black text-sigceYellow mb-2 tracking-widest">OUR MISSION</h4>
                  <ul className="text-sm space-y-2 opacity-90 pl-4 list-disc marker:text-sigceYellow line-clamp-4">
                    {data.mission.slice(0,3).map((m,i) => <li key={i}>{m}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Page 2: Vision & Mission & Toppers */}
      <div className="relative w-[210mm] min-h-[297mm] bg-white pt-8 px-12 page border-[12px] border-white shadow-inner flex flex-col">
        <div className="w-full flex flex-col items-end mb-4 border-b-2 border-sigceBlue pb-2">
          {data.headerImage ? 
            <img src={data.headerImage} alt="Header" className="w-full h-24 object-contain mb-2" /> :
            <img src="/college-header.jpg" alt="Header" className="w-full h-24 object-contain mb-2" />
          }
          <span className="bg-sigceBlue text-white px-3 py-1 text-xs font-bold tracking-wider rounded-lg rounded-br-none">PAGE 02</span>
        </div>
        
        {data.vision && (
          <div className="mb-4">
            <h2 className="text-xl font-black mb-2 uppercase text-sigceBlue">Department Vision</h2>
            <p className="text-lg text-gray-700 leading-snug font-serif italic border-l-4 border-sigceYellow pl-4 bg-gray-50 p-3 rounded-r-lg shadow-sm">{data.vision}</p>
          </div>
        )}

        {data.mission && data.mission.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xl font-black mb-2 uppercase text-sigceBlue">Department Mission</h2>
            <div className="bg-white border text-base border-gray-100 shadow-sm rounded-xl p-4">
              <ul className="list-disc text-gray-700 space-y-2 pl-4 marker:text-sigceBlue marker:text-lg">
                {data.mission.map((m, i) => <li key={i} className="pl-1">{m}</li>)}
              </ul>
            </div>
          </div>
        )}

        {data.toppers && data.toppers.length > 0 && (
          <div className="mt-2 flex-grow">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px bg-gray-200 flex-1"></div>
              <h2 className="text-2xl font-black text-center text-gray-900">OUR ACADEMIC TOPPERS</h2>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {['First Year', 'Second Year', 'Third Year', 'Fourth Year'].map(year => {
                const yearToppers = data.toppers.filter(t => t.year === year).sort((a,b) => parseFloat(b.cgpa) - parseFloat(a.cgpa));
                if(yearToppers.length === 0) return null;
                
                return (
                  <div key={year} className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 border border-blue-100 shadow-sm">
                    <h3 className="font-bold mb-3 uppercase text-sigceBlue tracking-wider border-b pb-1 text-sm">{year}</h3>
                    <div className="space-y-3">
                      {yearToppers.map((t, idx) => (
                        <div key={idx} className="flex justify-between items-center group">
                          <div>
                            <div className="font-bold text-gray-900 text-base leading-tight">{t.name}</div>
                            <div className="text-xs font-medium text-gray-500 mt-1"><span className="text-lg font-black text-sigceBlue">{t.cgpa}</span> CGPA</div>
                          </div>
                          {t.photoUrl && <img src={t.photoUrl} alt={t.name} className="w-14 h-14 rounded-full object-cover border-[2px] border-white shadow-sm transition-all hover:scale-110"/>}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Page 3: Objectives & Leadership Messages */}
      {hasPage3 && (
        <div className="relative w-[210mm] min-h-[297mm] bg-white pt-8 px-12 page border-[12px] border-white shadow-inner flex flex-col">
          <div className="w-full flex flex-col items-end mb-6 border-b-2 border-sigceBlue pb-2">
            {data.headerImage ? 
              <img src={data.headerImage} alt="Header" className="w-full h-24 object-contain mb-2" /> :
              <img src="/college-header.jpg" alt="Header" className="w-full h-24 object-contain mb-2" />
            }
            <span className="bg-sigceBlue text-white px-3 py-1 text-xs font-bold tracking-wider rounded-lg rounded-br-none">PAGE 03</span>
          </div>
          
          <div className="grid grid-cols-2 gap-8 mb-10">
            {data.principalMessage && (
              <div className="bg-blue-50/30 p-6 rounded-2xl border border-blue-100 shadow-sm relative">
                <div className="absolute top-0 right-6 w-12 h-1 bg-sigceYellow"></div>
                <h2 className="text-xl font-black mb-4 uppercase text-sigceBlue tracking-wider">Message from Principal</h2>
                <p className="text-sm text-gray-700 leading-relaxed font-serif italic text-justify">{data.principalMessage}</p>
              </div>
            )}
            
            {data.hodMessage && (
              <div className="bg-blue-50/30 p-6 rounded-2xl border border-blue-100 shadow-sm relative">
                <div className="absolute top-0 right-6 w-12 h-1 bg-sigceYellow"></div>
                <h2 className="text-xl font-black mb-4 uppercase text-sigceBlue tracking-wider">Message from H.O.D</h2>
                <p className="text-sm text-gray-700 leading-relaxed font-serif italic text-justify">{data.hodMessage}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-8">
            {data.peos && data.peos.length > 0 && data.peos[0].trim() !== '' && (
              <div>
                <h2 className="text-2xl font-black mb-4 text-gray-900 border-l-4 border-sigceYellow pl-3">PEOs</h2>
                <p className="text-xs text-sigceBlue font-bold uppercase mb-3 tracking-widest">Program Educational Objectives</p>
                <ul className="space-y-3">
                  {data.peos.map((peo, i) => peo.trim() && (
                    <li key={i} className="flex gap-3 text-gray-700 text-sm bg-white p-3 border border-gray-100 rounded-lg shadow-sm">
                      <span className="font-black text-sigceBlue bg-blue-50 w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0">{i + 1}</span>
                      <span>{peo}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.psos && data.psos.length > 0 && data.psos[0].trim() !== '' && (
              <div>
                <h2 className="text-2xl font-black mb-4 text-gray-900 border-l-4 border-sigceYellow pl-3">PSOs</h2>
                <p className="text-xs text-sigceBlue font-bold uppercase mb-3 tracking-widest">Program Specific Outcomes</p>
                <ul className="space-y-3">
                  {data.psos.map((pso, i) => pso.trim() && (
                    <li key={i} className="flex gap-3 text-gray-700 text-sm bg-white p-3 border border-gray-100 rounded-lg shadow-sm">
                      <span className="font-black text-sigceBlue bg-blue-50 w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0">{i + 1}</span>
                      <span>{pso}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pages: Custom Sections */}
      {data.customSections && data.customSections.map((section, idx) => {
        const pageNumber = idx + (hasPage3 ? 4 : 3);
        return (
          <div key={`custom-page-${idx}`} className="relative w-[210mm] h-[297mm] bg-white pt-8 px-12 page overflow-hidden border-[12px] border-white shadow-inner flex flex-col">
            <div className="w-full flex flex-col items-end mb-6 border-b-2 border-sigceBlue pb-2">
              {data.headerImage ? 
                <img src={data.headerImage} alt="Header" className="w-full h-24 object-contain mb-2" /> :
                <img src="/college-header.jpg" alt="Header" className="w-full h-24 object-contain mb-2" />
              }
              <span className="bg-sigceBlue text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg rounded-br-none">PAGE {pageNumber < 10 ? `0${pageNumber}` : pageNumber}</span>
            </div>

            <div className="flex flex-col flex-1">
              <h2 className="text-3xl font-black uppercase text-gray-900 border-l-8 border-sigceYellow pl-4 mb-6 leading-tight">
                {section.sectionTitle}
              </h2>
              <div className="text-justify text-gray-800 leading-relaxed text-lg font-serif whitespace-pre-wrap">
                {section.content}
              </div>
            </div>
          </div>
        );
      })}

      {/* Pages: Events (Dynamically chunked) */}
      {allEventPages.map((pageData, pageIndex) => {
        // Find if it's continued from previous page
        const isContinued = pageIndex > 0 && allEventPages[pageIndex - 1].title === pageData.title;
        const pageNumber = pageIndex + baseEventPageNum;

        return (
          <div key={`evt-page-${pageIndex}`} className="relative w-[210mm] h-[297mm] bg-white pt-8 px-12 page overflow-hidden border-[12px] border-white shadow-inner flex flex-col">
            <div className="w-full flex flex-col items-end mb-6 border-b-2 border-sigceBlue pb-2">
              {data.headerImage ? 
                <img src={data.headerImage} alt="Header" className="w-full h-24 object-contain mb-2" /> :
                <img src="/college-header.jpg" alt="Header" className="w-full h-24 object-contain mb-2" />
              }
              <span className="bg-sigceBlue text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg rounded-br-none">PAGE {pageNumber < 10 ? `0${pageNumber}` : pageNumber}</span>
            </div>

            <div className="flex flex-col flex-1">
              <h2 className="text-3xl font-black uppercase text-gray-900 border-l-8 border-sigceYellow pl-4 mb-6 leading-tight">
                {pageData.title} {isContinued && <span className="text-xl text-gray-500 font-normal italic">(Continued)</span>}
              </h2>
              
              <div className="block pb-4">
                {/* Floating Images (Max 2 for pages with text) */}
                {pageData.imageChunk && pageData.imageChunk.length > 0 && pageData.textChunk.trim().length > 0 && (
                  <div className={`float-left mr-8 mb-4 flex flex-col gap-4 w-5/12`}>
                    {pageData.imageChunk.map((img, i) => (
                      <img key={i} src={img} alt="Event" onClick={() => setSelectedImage(img)} className={`w-full ${pageData.imageChunk.length === 1 ? 'h-72' : 'h-48'} rounded-xl shadow-md border-[4px] border-gray-50 object-cover cursor-pointer hover:opacity-90 transition-opacity`} />
                    ))}
                  </div>
                )}
                
                {/* Text Content */}
                {pageData.date && !isContinued && (
                  <div className="text-sigceBlue font-bold text-sm mb-4 inline-block bg-blue-50 px-3 py-1.5 rounded w-fit">
                    Date: {new Date(pageData.date).toDateString()}
                  </div>
                )}
                
                <div className="text-justify text-gray-800 leading-relaxed text-lg font-serif whitespace-pre-wrap">
                  {pageData.textChunk}
                </div>
              </div>

              {/* Gallery for remaining images (Pages without text) */}
              {pageData.imageChunk && pageData.imageChunk.length > 0 && pageData.textChunk.trim().length === 0 && (
                <div className="mt-2 flex flex-wrap gap-4 pb-6">
                  {pageData.imageChunk.map((img, i) => (
                    <img key={i} src={img} alt="Event Gallery" onClick={() => setSelectedImage(img)} className="h-48 flex-grow object-cover rounded-xl shadow-sm border-[3px] border-gray-50 cursor-pointer hover:opacity-90 transition-opacity" style={{ minWidth: '200px', flexBasis: '30%' }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* CSS to ensure PDF printing works seamlessly */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body, html { margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page { page-break-after: always; break-after: page; }
          .wrapper { width: 210mm !important; }
          @page { size: A4 portrait; margin: 0; }
          img { page-break-inside: avoid; break-inside: avoid; }
          .break-inside-avoid { break-inside: avoid; }
        }
      `}} />

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 print:hidden transition-opacity" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-6 right-6 text-white text-5xl font-light hover:text-sigceYellow transition-colors focus:outline-none" onClick={() => setSelectedImage(null)}>&times;</button>
          <img src={selectedImage} alt="Fullscreen" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Floating Download Button */}
      <button 
        onClick={() => window.print()} 
        className="fixed bottom-8 right-8 z-40 bg-sigceBlue hover:bg-blue-800 text-white p-4 rounded-full shadow-2xl print:hidden flex items-center gap-3 transition-transform hover:scale-105 group border-2 border-white/20"
        title="Download or Print PDF"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        <span className="font-bold tracking-wider hidden group-hover:block pr-2">SAVE PDF</span>
      </button>
    </div>
  );
}
