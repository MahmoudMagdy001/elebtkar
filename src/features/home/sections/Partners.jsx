import React, { useState, useEffect } from 'react';
import { supabase, fetchCached } from '../../../shared/utils/supabase';

const Partners = React.memo(() => {
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    const fetchPartners = async () => {
      const { data, error } = await fetchCached('partners_all', () =>
        supabase.from('partners').select('*').order('order_num', { ascending: true })
      );
        
      if (!error && data) {
        setPartners(data);
      }
    };
    fetchPartners();
  }, []);

  return (
    <section id="results" className="bg-gray-50 section-padding">
      <div className="section-inner">
        <div className="fade-in text-center mb-16">
          <span className="section-tag">نتائجنا</span>
          <h2 className="section-title text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary mb-4">نتائج حقيقية لعملائنا</h2>
          <p className="section-subtitle mx-auto text-lg text-gray-600 max-w-2xl">
            نتفاخر بنتائجنا الحقيقية التي نحققها لعملائنا في كل مجال من مجالات خدماتنا
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-10 sm:gap-16" id="partnersGrid">
          {partners.map((ptn) => (
            <div key={ptn.id} className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 flex items-center justify-center bg-white rounded-full shadow-sm border border-gray-100 transition-all duration-500 p-4 sm:p-6 group cursor-pointer relative z-10 hover:z-50 transform hover:scale-[1.5] hover:-translate-y-4 hover:shadow-2xl hover:shadow-[#c9952a]/40">
              {ptn.website_url ? (
                <a href={ptn.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full h-full">
                  <img src={ptn.logo_url} alt={ptn.name || 'شريك نجاح'} loading="lazy" className="max-w-full max-h-full object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 drop-shadow-sm group-hover:drop-shadow-md" />
                </a>
              ) : (
                <img src={ptn.logo_url} alt={ptn.name || 'شريك نجاح'} loading="lazy" className="max-w-full max-h-full object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 drop-shadow-sm group-hover:drop-shadow-md" />
              )}
            </div>
          ))}
        </div>
        
        {/* Final CTA */}
        <div className="mt-24 bg-primary rounded-3xl p-8 sm:p-12 lg:p-16 text-center shadow-2xl relative overflow-hidden group">
          {/* Decorative background circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white opacity-5 rounded-full translate-y-1/3 -translate-x-1/3 group-hover:scale-110 transition-transform duration-700"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6">ابدأ رحلتك في الابتكار معنا</h2>
            <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">فريق "الابتكار" جاهز لتحويل كل أهدافك إلى واقع ملموس</p>
            <a 
              href="https://wa.me/966579644123" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center justify-center gap-2 bg-accent-gradient text-[#1a0a00] font-bold text-lg px-10 py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 hover:scale-105 transition-all duration-300 relative group"
            >
              <span className="absolute inset-0 rounded-full animate-pulse opacity-20 bg-accent pointer-events-none"></span>
              <span className="relative z-10">ابتكر معنا الآن</span>
              <i className="ph ph-arrow-left text-2xl relative z-10 group-hover:-translate-x-1 transition-transform"></i>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
});

export default Partners;
