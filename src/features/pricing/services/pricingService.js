// ponytail: Direct Supabase service wrapper for Pricing Plans CRUD operations.
import { supabase } from '../../../shared/utils/supabase';

export const pricingService = {
  async getPlans() {
    const { data, error } = await supabase
      .from('pricing_plans')
      .select('*')
      .order('order_num', { ascending: true });
    if (error) throw error;
    return data;
  },

  async getPlanById(id) {
    const { data, error } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async createPlan(payload) {
    const { data, error } = await supabase
      .from('pricing_plans')
      .insert([payload])
      .select();
    if (error) throw error;
    return data[0];
  },

  async updatePlan(id, payload) {
    const { data, error } = await supabase
      .from('pricing_plans')
      .update(payload)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async deletePlan(id) {
    const { error } = await supabase
      .from('pricing_plans')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};
