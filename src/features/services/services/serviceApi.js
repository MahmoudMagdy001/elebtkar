// ponytail: Direct Supabase service wrapper for Services CRUD operations.
import { supabase } from '../../../shared/utils/supabase';

export const serviceApi = {
  async getServices() {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('order_num', { ascending: true });
    if (error) throw error;
    return data;
  },

  async getServiceById(id) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async createService(payload) {
    const { data, error } = await supabase
      .from('services')
      .insert([payload])
      .select();
    if (error) throw error;
    return data[0];
  },

  async updateService(id, payload) {
    const { data, error } = await supabase
      .from('services')
      .update(payload)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async deleteService(id) {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};
