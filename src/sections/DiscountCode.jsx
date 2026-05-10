import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Sparkles } from 'lucide-react';
import { cn } from '../utils/cn';
import { supabase } from '../utils/supabase';

const DiscountCode = () => {
  const [formData, setFormData] = useState({ companyName: '', phone: '' });
  const [generatedCode, setGeneratedCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      // Logic to generate a code based on company name and random numbers
      const namePart = formData.companyName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'ELB');
      const randomPart = Math.floor(1000 + Math.random() * 9000);
      const newCode = `${namePart}${randomPart}`;

      // Save to Supabase
      const { error } = await supabase.from('discount_codes').insert([{
        user_name: formData.companyName,
        user_phone: formData.phone,
        discount_code: newCode
      }]);

      if (error) {
        console.error('Error saving discount code:', error);
        alert('حدث خطأ أثناء توليد الكود، يرجى المحاولة مرة أخرى.');
      } else {
        setGeneratedCode(newCode);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('حدث خطأ غير متوقع.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section id="discount-code" className="py-24 px-[5%] bg-gray-50">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-primary-gradient rounded-xl p-10 md:p-16 text-white text-center shadow-lg overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{ 
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />

          <div className="relative z-10 max-w-[800px] mx-auto">
            <span className="section-tag bg-white/10 text-accent border-white/20">عرض خاص</span>
            <h2 className="section-title text-white mb-4">احصل على خصم 20% الآن!</h2>
            <p className="text-white/80 mb-10 text-lg">أدخل بياناتك لتوليد كود الخصم الخاص بك واستخدمه عند التواصل معنا.</p>

            <AnimatePresence mode="wait">
              {!generatedCode ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-6 max-w-[500px] mx-auto"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-right">
                      <label className="block text-sm font-bold text-accent-light mb-2">اسم الشركة</label>
                      <input
                        type="text"
                        required
                        placeholder="أدخل اسم شركتك"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent transition-all"
                      />
                    </div>
                    <div className="text-right">
                      <label className="block text-sm font-bold text-accent-light mb-2">رقم الجوال</label>
                      <input
                        type="tel"
                        required
                        placeholder="05xxxxxxxx"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent transition-all"
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={isGenerating} className="btn-primary w-full justify-center py-4 text-lg disabled:opacity-70 disabled:cursor-not-allowed">
                    {isGenerating ? 'جاري التوليد...' : 'توليد الكود'} {!isGenerating && <Sparkles className="w-5 h-5 shrink-0" />}
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-8 border-t border-white/10"
                >
                  <p className="text-white/70 mb-4">كود الخصم الخاص بك هو:</p>
                  <div className="inline-flex items-center gap-4 bg-white text-primary px-8 py-4 rounded-full font-extrabold text-2xl md:text-3xl shadow-xl mb-6 tracking-widest relative group">
                    <span>{generatedCode}</span>
                    <button
                      onClick={handleCopy}
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                        copied ? "bg-green-500 text-white" : "bg-primary text-white hover:bg-accent"
                      )}
                    >
                      {copied ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                  </div>
                  <p className="text-sm text-white/50">انسخ الكود وأرسله لنا عند التواصل للحصول على الخصم!</p>
                  <button 
                    onClick={() => setGeneratedCode(null)}
                    className="mt-6 text-accent hover:underline text-sm font-bold"
                  >
                    توليد كود آخر
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DiscountCode;
