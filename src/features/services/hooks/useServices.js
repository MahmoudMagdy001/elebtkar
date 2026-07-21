// ponytail: Custom hook to fetch and delete services with loading/error state tracking.
import { useState, useEffect, useCallback } from 'react';
import { serviceApi } from '../services/serviceApi';

export function useServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await serviceApi.getServices();
      setServices(data);
    } catch (err) {
      setError(err.message || 'خطأ في تحميل الخدمات');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteService = useCallback(async (id) => {
    setError(null);
    try {
      await serviceApi.deleteService(id);
      setServices(prev => prev.filter(s => s.id !== id));
      return true;
    } catch (err) {
      setError(err.message || 'خطأ في حذف الخدمة');
      return false;
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return {
    services,
    loading,
    error,
    refetch: fetchServices,
    deleteService
  };
}
