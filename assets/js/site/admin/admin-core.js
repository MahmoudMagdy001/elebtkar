/**
 * admin-core.js — Core Admin Functionality
 * Handles authentication, navigation, toast notifications, and shared utilities.
 */

window.AdminCore = (() => {
  'use strict';

  const i18n = window.AdminI18n;
  let toastTimer = null;

  // DOM Elements Cache
  const elements = {
    loginContainer: null,
    dashHeader: null,
    dashWrapper: null,
    loginForm: null,
    loginEmail: null,
    loginPassword: null,
    loginBtn: null,
    loginSpinner: null,
    loginIcon: null,
    loginLabel: null,
    logoutBtn: null,
    navItems: null,
    sections: null,
    toast: null
  };

  // Section loaders mapping
  const sectionLoaders = {
    discountCodes: () => window.AdminMessages?.loadDiscountCodes(),
    contactMessages: () => window.AdminMessages?.loadContactMessages(),
    managePosts: () => window.AdminPosts?.loadArticles(),
    manageServices: () => window.AdminServices?.loadServices(),
    managePricingPlans: () => window.AdminPricing?.loadPricingPlans(),
    managePartners: () => window.AdminPartners?.loadPartners(),
    managePayments: () => window.AdminMessages?.loadPayments(),
    manageStats: () => window.AdminStats?.loadStats()
  };

  /**
   * Initialize core functionality
   */
  function init() {
    cacheElements();
    setupAuth();
    setupNavigation();
    setupLogout();
  }

  /**
   * Cache DOM elements
   */
  function cacheElements() {
    elements.loginContainer = document.getElementById('loginContainer');
    elements.dashHeader = document.getElementById('dashHeader');
    elements.dashWrapper = document.getElementById('dashWrapper');
    elements.loginForm = document.getElementById('loginForm');
    elements.loginEmail = document.getElementById('loginEmail');
    elements.loginPassword = document.getElementById('loginPassword');
    elements.loginBtn = document.getElementById('loginBtn');
    elements.loginSpinner = document.getElementById('loginSpinner');
    elements.loginIcon = document.getElementById('loginIcon');
    elements.loginLabel = document.getElementById('loginLabel');
    elements.logoutBtn = document.getElementById('logoutBtnSidebar');
    elements.navItems = document.querySelectorAll('.nav-item');
    elements.sections = document.querySelectorAll('.admin-section');
    elements.toast = document.getElementById('toast');
  }

  /**
   * Update dashboard visibility based on auth state
   */
  function updateDashboardVisibility(session) {
    if (!elements.loginContainer || !elements.dashHeader || !elements.dashWrapper) return;

    if (session) {
      elements.loginContainer.style.display = 'none';
      elements.dashHeader.style.display = 'flex';
      elements.dashWrapper.style.display = 'flex';
      if (typeof sectionLoaders.contactMessages === 'function') {
        sectionLoaders.contactMessages();
      }
    } else {
      elements.loginContainer.style.display = 'block';
      elements.dashHeader.style.display = 'none';
      elements.dashWrapper.style.display = 'none';
    }
  }

  /**
   * Setup authentication listeners
   */
  function setupAuth() {
    if (!window.sb) {
      console.error('Supabase client not initialized');
      return;
    }

    // Listen to auth state changes
    window.sb.auth.onAuthStateChange((event, session) => {
      updateDashboardVisibility(session);
    });

    // Check initial session
    window.sb.auth.getSession().then(({ data: { session } }) => {
      updateDashboardVisibility(session);
    });

    // Login form handler
    if (elements.loginForm) {
      elements.loginForm.addEventListener('submit', handleLogin);
    }
  }

  /**
   * Handle login form submission
   */
  async function handleLogin(e) {
    e.preventDefault();

    const email = elements.loginEmail?.value.trim();
    const password = elements.loginPassword?.value;

    if (!email || !password) return;

    setLoginLoading(true);

    const { error } = await window.sb.auth.signInWithPassword({ email, password });

    setLoginLoading(false);

    if (error) {
      showToast(i18n.t('loginError'), 'error');
    } else {
      showToast(i18n.t('loginSuccess'), 'success');
      elements.loginForm.reset();
    }
  }

  /**
   * Set login button loading state
   */
  function setLoginLoading(loading) {
    if (!elements.loginBtn || !elements.loginSpinner || !elements.loginIcon || !elements.loginLabel) return;

    elements.loginBtn.disabled = loading;
    elements.loginSpinner.style.display = loading ? 'block' : 'none';
    elements.loginIcon.style.display = loading ? 'none' : 'inline-block';
    elements.loginLabel.textContent = loading ? i18n.t('loginLoading') : i18n.t('loginBtn');
  }

  /**
   * Setup logout button
   */
  function setupLogout() {
    elements.logoutBtn?.addEventListener('click', async () => {
      const { error } = await window.sb.auth.signOut();
      if (error) {
        showToast(`${i18n.t('logoutError') || 'Error'}: ${error.message}`, 'error');
      } else {
        showToast(i18n.t('logoutSuccess'), 'success');
      }
    });
  }

  /**
   * Setup sidebar navigation
   */
  function setupNavigation() {
    elements.navItems?.forEach(item => {
      item.addEventListener('click', () => {
        const targetSection = item.getAttribute('data-section');
        switchSection(targetSection);
        loadSectionData(targetSection);
      });
    });
  }

  /**
   * Switch active section
   */
  function switchSection(targetSection) {
    // Update active nav
    elements.navItems?.forEach(i => i.classList.remove('active'));
    document.querySelector(`[data-section="${targetSection}"]`)?.classList.add('active');

    // Update active section
    elements.sections?.forEach(s => s.classList.remove('active'));
    const targetElement = document.getElementById(`${targetSection}Section`);
    targetElement?.classList.add('active');
  }

  /**
   * Load section-specific data
   */
  function loadSectionData(section) {
    // Check registered sections first (dynamic modules)
    const registeredSection = sections[section];
    if (registeredSection && typeof registeredSection.load === 'function') {
      registeredSection.load();
      return;
    }

    // Fallback to static section loaders
    const loader = sectionLoaders[section];
    if (typeof loader === 'function') {
      loader();
    }
  }

  /**
   * Section registry for dynamic modules
   */
  const sections = {};

  function registerSection(id, config) {
    sections[id] = config;
  }

  function getSection(id) {
    return sections[id];
  }

  /**
   * Show toast notification
   */
  function showToast(message, type = 'success') {
    if (!elements.toast) return;

    const icon = type === 'success' ? 'check-circle' : 'warning-circle';
    elements.toast.className = `toast ${type}`;
    elements.toast.innerHTML = `<i class="ph ph-${icon}"></i> ${message}`;
    elements.toast.classList.add('show');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => elements.toast.classList.remove('show'), 4000);
  }

  /**
   * Utility: Set button loading state
   */
  function setBtnLoading(btnId, spinnerId, iconId, labelId, loading, loadingText, defaultText) {
    const btn = document.getElementById(btnId);
    const spinner = document.getElementById(spinnerId);
    const icon = document.getElementById(iconId);
    const label = document.getElementById(labelId);

    if (btn) btn.disabled = loading;
    if (spinner) spinner.style.display = loading ? 'block' : 'none';
    if (icon) icon.style.display = loading ? 'none' : 'inline-block';
    if (label) label.textContent = loading ? loadingText : defaultText;
  }

  /**
   * Utility: Format date
   */
  function formatDate(date, withTime = false) {
    const options = withTime ? i18n.date.datetimeOptions : i18n.date.dateOptions;
    return new Date(date).toLocaleDateString(i18n.date.locale, options);
  }

  /**
   * Utility: Create table error row HTML
   */
  function createErrorRow(colspan, message) {
    return `<tr><td colspan="${colspan}" style="text-align:center; padding: 2rem; color: #e53935;">${message}</td></tr>`;
  }

  /**
   * Utility: Create empty state row HTML
   */
  function createEmptyRow(colspan, message) {
    return `<tr><td colspan="${colspan}" style="text-align:center; padding: 2rem;">${message}</td></tr>`;
  }

  // Public API
  return {
    init,
    showToast,
    setBtnLoading,
    formatDate,
    createErrorRow,
    createEmptyRow,
    switchSection,
    registerSection,
    getSection,
    elements
  };
})();
