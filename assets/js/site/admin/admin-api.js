/**
 * admin-api.js — API & Data Access Layer
 * Centralized Supabase data fetching with error handling.
 */

window.AdminAPI = (() => {
  'use strict';

  const sb = window.sb;

  /**
   * Generic table fetch with loading state management
   */
  async function fetchTable(tableName, options = {}) {
    const {
      select = '*',
      orderBy = 'created_at',
      ascending = false,
      filters = [],
      single = false
    } = options;

    let query = sb.from(tableName).select(select);

    // Apply filters
    filters.forEach(({ column, operator, value }) => {
      query = query.eq(column, value);
    });

    if (single) {
      query = query.single();
    } else {
      query = query.order(orderBy, { ascending });
    }

    const { data, error } = await query;
    return { data, error };
  }

  /**
   * Fetch single record by ID
   */
  async function fetchById(tableName, id) {
    const { data, error } = await sb
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();

    return { data, error };
  }

  /**
   * Insert new record
   */
  async function insertRecord(tableName, record) {
    const { data, error } = await sb
      .from(tableName)
      .insert([record])
      .select();

    return { data, error };
  }

  /**
   * Update existing record
   */
  async function updateRecord(tableName, id, updates) {
    const { data, error } = await sb
      .from(tableName)
      .update(updates)
      .eq('id', id)
      .select();

    return { data, error };
  }

  /**
   * Delete record
   */
  async function deleteRecord(tableName, id) {
    const { error } = await sb
      .from(tableName)
      .delete()
      .eq('id', id);

    return { error };
  }

  // Entity-specific helpers
  const Posts = {
    fetchAll: () => fetchTable('posts', {
      select: 'id, title, slug, created_at',
      orderBy: 'created_at',
      ascending: false
    }),
    fetchById: (id) => fetchById('posts', id),
    create: (data) => insertRecord('posts', data),
    update: (id, data) => updateRecord('posts', id, data),
    delete: (id) => deleteRecord('posts', id),
    getPostBySlug: async (slug) => {
      const { data, error } = await sb
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();
      if (error && error.code === 'PGRST116') return { data: null, error: null };
      return { data, error };
    }
  };

  const Services = {
    fetchAll: () => fetchTable('services', {
      select: 'id, title, order_num',
      orderBy: 'order_num',
      ascending: true
    }),
    fetchById: (id) => fetchById('services', id),
    create: (data) => insertRecord('services', data),
    update: (id, data) => updateRecord('services', id, data),
    delete: (id) => deleteRecord('services', id)
  };

  const PricingPlans = {
    fetchAll: () => fetchTable('pricing_plans', {
      select: 'id, title, price, order_num, is_popular, is_active',
      orderBy: 'order_num',
      ascending: true
    }),
    fetchById: (id) => fetchById('pricing_plans', id),
    create: (data) => insertRecord('pricing_plans', data),
    update: (id, data) => updateRecord('pricing_plans', id, data),
    delete: (id) => deleteRecord('pricing_plans', id)
  };

  const Partners = {
    fetchAll: () => fetchTable('partners', {
      orderBy: 'order_num',
      ascending: true
    }),
    fetchById: (id) => fetchById('partners', id),
    create: (data) => insertRecord('partners', data),
    update: (id, data) => updateRecord('partners', id, data),
    delete: (id) => deleteRecord('partners', id)
  };

  const ContactMessages = {
    fetchAll: () => fetchTable('contact_messages', {
      orderBy: 'created_at',
      ascending: false
    })
  };

  const DiscountCodes = {
    fetchAll: () => fetchTable('discount_codes', {
      orderBy: 'created_at',
      ascending: false
    })
  };

  const Payments = {
    fetchAll: () => fetchTable('purchases', {
      select: `*, pricing_plans ( title )`,
      orderBy: 'created_at',
      ascending: false
    })
  };

  const Statistics = {
    fetchAll: () => fetchTable('statistics', {
      orderBy: 'sort_order',
      ascending: true
    }),
    fetchById: (id) => fetchById('statistics', id),
    create: (data) => insertRecord('statistics', data),
    update: (id, data) => updateRecord('statistics', id, data),
    delete: (id) => deleteRecord('statistics', id)
  };

  // Public API
  return {
    fetchTable,
    fetchById,
    insertRecord,
    updateRecord,
    deleteRecord,
    Posts,
    Services,
    PricingPlans,
    Partners,
    ContactMessages,
    DiscountCodes,
    Payments,
    Statistics
  };
})();
