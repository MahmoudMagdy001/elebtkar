import React, { useEffect, useState } from 'react';
import { motion } from '../utils/lazyFramer';
import { Check } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { cn } from '../utils/cn';

const Pricing = ({ onSelectPlan }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('pricing_plans')
          .select('*')
          .eq('is_active', true)
          .order('order_num', { ascending: true });

        if (error) throw error;
        setPlans(data || []);
      } catch (err) {
        console.error('Error fetching pricing plans:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (loading) {
    return (
      <section id="pricing" className="bg-primary-dark text-white text-center section-padding">
        <div className="animate-pulse section-inner">
          <div className="h-4 w-24 bg-white/10 mx-auto rounded-full mb-4" />
          <div className="h-10 w-64 bg-white/10 mx-auto rounded-md mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 section-inner">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 md:h-[500px] bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (plans.length === 0) return null;

  return (
    <section id="pricing" className="bg-primary-dark relative z-10 overflow-hidden section-padding">
      <div className="section-inner">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-tag bg-white/10 text-accent border-white/20">حلول الابتكار</span>
            <h2 className="section-title text-white">حلول تناسب جميع احتياجاتك</h2>
            <p className="section-subtitle text-white/70 mx-auto">اختر الابتكار الأنسب لنمو نشاطك التجاري</p>
          </motion.div>
        </div>

        <div className="flex flex-wrap justify-center gap-8 section-inner items-stretch">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(
                "w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.33%-2rem)] bg-white/5 rounded-xl p-8 border border-white/10 transition-all duration-300 relative flex flex-col",
                plan.is_popular && "border-accent border-2 pt-14 lg:scale-105 z-10 bg-primary shadow-xl"
              )}
            >
              {plan.is_popular && (
                <div className="absolute top-0 inset-x-0 bg-accent text-white text-sm font-extrabold text-center py-2 rounded-t-[10px] uppercase tracking-wider">
                  الأكثر طلباً
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-extrabold text-white mb-2">{plan.title}</h3>
                <p className="text-sm text-gray-400 min-h-10 leading-relaxed">{plan.subtitle}</p>
                
                <div className="flex items-baseline gap-2 mt-6 pb-6 border-b border-white/10">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  <img 
                    src="/images/currency.png" 
                    alt="ريال" 
                    className="h-5 w-auto object-contain" 
                    style={{ filter: 'brightness(0) invert(1)' }} 
                  />
                  <span className="text-sm text-gray-400">/ {plan.billing_cycle || 'شهرياً'}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                {(plan.features || []).map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-white/90">
                    <Check className="text-accent shrink-0" size={18} />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onSelectPlan && onSelectPlan(plan)}
                className={cn(
                  "w-full py-4 rounded-xl font-bold transition-all duration-300",
                  plan.is_popular 
                    ? "bg-accent hover:bg-accent-light text-[#1a0a00]" 
                    : "bg-white/5 hover:bg-white/10 text-white"
                )}
              >
                اطلب الآن
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
