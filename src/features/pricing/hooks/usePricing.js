// ponytail: Hook to load, reload, and delete pricing solutions with state updates.
import { useState, useEffect, useCallback } from 'react';
import { pricingService } from '../services/pricingService';

export function usePricing() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pricingService.getPlans();
      setPlans(data);
    } catch (err) {
      setError(err.message || 'خطأ في تحميل باقات الأسعار');
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePlan = useCallback(async (id) => {
    setError(null);
    try {
      await pricingService.deletePlan(id);
      setPlans(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err) {
      setError(err.message || 'خطأ في حذف باقة الأسعار');
      return false;
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return {
    plans,
    loading,
    error,
    refetch: fetchPlans,
    deletePlan
  };
}
