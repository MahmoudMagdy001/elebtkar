import React, { useState } from 'react';
import SEO from '../../shared/components/SEO';
import Hero from './sections/Hero';
import WhoWeAre from './sections/WhoWeAre';
import Services from './sections/Services';
import Pricing from './sections/Pricing';
import WhyDifferent from './sections/WhyDifferent';
import WhyChooseUs from './sections/WhyChooseUs';
import Process from './sections/Process';
import DiscountCode from './sections/DiscountCode';
import Partners from './sections/Partners';
import Contact from './sections/Contact';
import PaymentModal from '../../shared/components/PaymentModal';

import { usePageSettings } from '../../shared/utils/usePageSettings';

const Home = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const { settings: pageSettings } = usePageSettings('home');

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setIsPaymentOpen(true);
  };

  return (
    <div className="flex flex-col">
      <SEO 
        title="الرئيسية" 
        description="وكالة ابتكار للحلول التقنية والبرمجية - نبتكر مستقبلك الرقمي بأحدث التقنيات وتصميم المواقع والتطبيقات."
        seoSettings={pageSettings?.seo_settings}
      />
      <Hero />
      <WhoWeAre />
      <DiscountCode />
      <Services />
      <Pricing onSelectPlan={handleSelectPlan} />
      <div className="h-24 bg-white" />
      <WhyDifferent />
      <WhyChooseUs />
      <Process />
      <Partners />
      <Contact />
      
      <PaymentModal 
        plan={selectedPlan}
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
      />
    </div>
  );
};

export default Home;
