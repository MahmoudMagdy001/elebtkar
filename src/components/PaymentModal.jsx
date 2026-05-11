import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from '../utils/lazyFramer';
import { X, CreditCard, Apple, CheckCircle2 } from 'lucide-react';
import { cn } from '../utils/cn';
import { supabase } from '../utils/supabase';

const PaymentModal = ({ plan, isOpen, onClose }) => {
  const [step, setStep] = useState(1); // 1: Info Form, 2: Moyasar
  const [customerData, setCustomerData] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setCustomerData({ name: '', email: '', phone: '' });
    }
  }, [isOpen]);

  const handleProceedToPay = (e) => {
    e.preventDefault();
    if (!customerData.name || !customerData.email || !customerData.phone) return;
    setStep(2);
  };

  useEffect(() => {
    if (step === 2 && plan) {
      const initMoyasar = () => {
        if (!window.Moyasar) {
          console.error('Moyasar SDK not loaded');
          return;
        }

        const publishableKey = 'pk_test_GeBNMe6XGH9JBAfgP4FWRcZLXk7SrnSopAUcA6G8'; // Hardcoded as in config.js
        const amountInHalalas = Math.round(plan.price * 100);

        window.Moyasar.init({
          element: '.mysr-form-react',
          amount: amountInHalalas,
          currency: 'SAR',
          description: `باقة: ${plan.title} | للعميل: ${customerData.name}`,
          publishable_api_key: publishableKey,
          callback_url: window.location.origin + '/payment-callback',
          methods: ['creditcard', 'applepay', 'stcpay'],
          apple_pay: {
            label: 'الابتكار | Elebtkar',
            validate_merchant_url: 'https://api.moyasar.com/v1/applepay/initiate',
            country: 'SA'
          },
          on_completed: async (payment) => {
            if (payment.status === 'paid') {
              await recordPayment(payment);
            }
          },
          on_failure: (error) => {
            console.error('Payment failed:', error);
            alert('فشلت عملية الدفع. يرجى المحاولة مرة أخرى.');
          }
        });
      };

      // Small delay to ensure the container is rendered
      const timer = setTimeout(initMoyasar, 100);
      return () => clearTimeout(timer);
    }
  }, [step, plan]);

  const recordPayment = async (payment) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('purchases')
        .insert([{
          moyasar_payment_id: payment.id,
          amount: payment.amount / 100,
          status: payment.status,
          plan_id: plan.id,
          user_name: customerData.name,
          user_email: customerData.email,
          user_phone: customerData.phone,
          currency: payment.currency || 'SAR',
          metadata: { 
            plan_name: plan.title,
            source: 'React Web App'
          }
        }]);

      if (error) throw error;
      setStep(3); // Success step
    } catch (err) {
      console.error('Record to Supabase failed:', err);
      alert('تم الدفع بنجاح ولكن فشل تحديث السجلات تلقائياً. لا تقلق، سنتواصل معك قريباً.');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-primary-dark/90 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="relative bg-white w-full max-w-xl rounded-3xl p-8 md:p-10 shadow-2xl overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-6 left-6 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-800 transition-all hover:bg-primary hover:text-white hover:rotate-90"
            >
              <X size={24} />
            </button>

            {step < 3 && (
              <div className="text-center mb-10">
                <h3 className="text-2xl font-extrabold text-primary mb-2">إتمام الطلب</h3>
                <div className="inline-flex items-center gap-2 bg-accent/10 px-4 py-1.5 rounded-full text-accent font-bold">
                  <span>{plan?.title}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/40" />
                  <span>{plan?.price?.toLocaleString()}</span>
                  <img 
                    src="/images/currency.png" 
                    alt="ريال" 
                    className="h-4 w-auto object-contain" 
                    style={{ filter: 'brightness(0) invert(1)' }} 
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <form onSubmit={handleProceedToPay} className="flex flex-col gap-6">
                <div className="space-y-4 text-right">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">الاسم الكامل</label>
                    <input
                      type="text"
                      required
                      placeholder="ادخل اسمك"
                      value={customerData.name}
                      onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">البريد الإلكتروني</label>
                    <input
                      type="email"
                      required
                      placeholder="example@mail.com"
                      dir="ltr"
                      value={customerData.email}
                      onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-all text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">رقم الجوال</label>
                    <input
                      type="tel"
                      required
                      placeholder="05xxxxxxxx"
                      dir="ltr"
                      value={customerData.phone}
                      onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-all text-right"
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full justify-center py-4 text-lg">
                  الانتقال للدفع
                </button>
              </form>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                // Keep payment iframe area compact on mobile, expand on md and up
                className="mysr-form-react md:min-h-[300px]"
              />
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="w-20 h-20 bg-green/10 text-green rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={48} />
                </div>
                <h3 className="text-2xl font-extrabold text-primary mb-3">تمت عملية الدفع بنجاح!</h3>
                <p className="text-gray-600 mb-8 max-w-sm mx-auto leading-relaxed">
                  شكراً لك {customerData.name}. تم استلام طلبك لباقة {plan?.title} وسيتم التواصل معك خلال أقل من 24 ساعة.
                </p>
                <button onClick={onClose} className="btn-primary px-10">
                  إغلاق
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;
