import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, Clock, Send } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { cn } from '../utils/cn';

const contactInfo = [
  { icon: MapPin, title: 'العنوان', content: 'نجران حي الشرفة الشمالية' },
  { icon: Mail, title: 'البريد الإلكتروني', content: 'Info@elebtikar-sa.com', link: 'mailto:Info@elebtikar-sa.com' },
  { icon: Phone, title: 'رقم الهاتف', content: '+966 57 964 4123\n+966 17 510 7335', dir: 'ltr' },
  { icon: Clock, title: 'ساعات العمل', content: 'من السبت إلي الخميس\nمن 9 ص إلي 6 م' },
];

const availableServices = [
  'SEO & GEO',
  'المتاجر الإلكترونية',
  'تطوير المحتوى',
  'إدارة التواصل',
  'إدارة الإعلانات',
  'تطبيقات الهواتف',
  'الذكاء الاصطناعي',
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    services: [],
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleServiceToggle = (service) => {
    setFormData((prev) => {
      const isSelected = prev.services.includes(service);
      if (isSelected) {
        return { ...prev, services: prev.services.filter((s) => s !== service) };
      } else {
        return { ...prev, services: [...prev.services, service] };
      }
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setFormData((prev) => ({ ...prev, services: [...availableServices] }));
    } else {
      setFormData((prev) => ({ ...prev, services: [] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const servicesText = formData.services.length > 0 
      ? formData.services.join('، ') 
      : 'لم يتم تحديد خدمة';

    try {
      const { error } = await supabase.from('contact_messages').insert([
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          services: servicesText,
          message: formData.message,
        },
      ]);

      if (error) throw error;

      setStatus({ type: 'success', message: 'تم إرسال رسالتك بنجاح. سنتواصل معك قريباً!' });
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        services: [],
      });
    } catch (err) {
      console.error('Error sending message:', err);
      setStatus({ type: 'error', message: 'عذراً، حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة لاحقاً.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 px-[5%] bg-white">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-tag">تواصل معنا</span>
            <h2 className="section-title">دعنا نناقش مشروعك القادم</h2>
            <p className="section-subtitle mx-auto">فريقنا مستعد للرد على استفساراتك وتقديم أفضل الحلول التقنية والتسويقية لنشاطك التجاري</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-10"
          >
            {contactInfo.map((info, i) => (
              <div key={info.title} className="flex items-start gap-5 group">
                <div className="w-16 h-16 rounded-xl bg-gray-50 text-primary flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:bg-accent-gradient group-hover:text-[#1a0a00] group-hover:rotate-6">
                  <info.icon size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-primary mb-1">{info.title}</h3>
                  {info.link ? (
                    <a href={info.link} className="text-gray-600 hover:text-accent transition-colors block leading-relaxed">
                      {info.content}
                    </a>
                  ) : (
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line" dir={info.dir}>
                      {info.content}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white p-8 md:p-10 rounded-xl shadow-lg border border-gray-100"
          >
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input
                  type="text"
                  id="name"
                  placeholder="الاسم الكريم"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full min-h-[56px] px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                />
                <input
                  type="email"
                  id="email"
                  placeholder="البريد الإلكتروني"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full min-h-[56px] px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input
                  type="tel"
                  id="phone"
                  placeholder="رقم الجوال"
                  required
                  dir="ltr"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full min-h-[56px] px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-right"
                />
                <input
                  type="text"
                  id="subject"
                  placeholder="موضوع الرسالة"
                  required
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full min-h-[56px] px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>

              <div className="mt-2">
                <p className="text-sm font-bold text-primary mb-4">ما هي الخدمات التي تهمك؟</p>
                <div className="flex flex-wrap gap-3">
                  <label className="cursor-pointer group">
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={formData.services.length === availableServices.length}
                      onChange={handleSelectAll}
                    />
                    <span className={cn(
                      "px-4 py-2 rounded-full text-xs font-bold transition-all border",
                      formData.services.length === availableServices.length
                        ? "bg-accent border-accent text-[#1a0a00] shadow-md"
                        : "bg-accent/10 border-accent/30 text-accent hover:border-accent"
                    )}>
                      كل الخدمات
                    </span>
                  </label>
                  {availableServices.map((service) => (
                    <label key={service} className="cursor-pointer">
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={formData.services.includes(service)}
                        onChange={() => handleServiceToggle(service)}
                      />
                      <span className={cn(
                        "px-4 py-2 rounded-full text-xs font-bold transition-all border block",
                        formData.services.includes(service)
                          ? "bg-primary border-primary text-white shadow-md"
                          : "bg-gray-50 border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
                      )}>
                        {service}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <textarea
                id="message"
                rows="5"
                placeholder="مشكلتك..."
                required
                value={formData.message}
                onChange={handleInputChange}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-vertical"
              />

              {status && (
                <div className={cn(
                  "p-4 rounded-lg text-sm font-bold",
                  status.type === 'success' ? "bg-green/10 text-green" : "bg-red-50 text-red-600"
                )}>
                  {status.message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-4 text-lg disabled:opacity-70"
              >
                {loading ? 'جاري الإرسال...' : 'حل لمشكلتك'}
                {!loading && <Send className="w-5 h-5 shrink-0" />}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
