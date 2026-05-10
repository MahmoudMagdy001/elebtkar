/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import SEO from '../components/SEO';

// Import Admin Sections
import { PaymentsSection } from './admin/PaymentsSection';
import { ServicesSection } from './admin/ServicesSection';
import { AddServiceSection } from './admin/AddServiceSection';
import { PricingSection } from './admin/PricingSection';
import { AddPricingSection } from './admin/AddPricingSection';
import { PostsSection } from './admin/PostsSection';
import { AddPostSection } from './admin/AddPostSection';
import { PartnersSection } from './admin/PartnersSection';
import { AddPartnerSection } from './admin/AddPartnerSection';
import { DiscountCodesSection } from './admin/DiscountCodesSection';
import { StatsSection } from './admin/StatsSection';

// Helper component for sidebar links
const NavItem = ({ active, icon, label, onClick }) => (
  <button 
    className={`nav-item ${active ? 'active' : ''}`} 
    onClick={onClick}
    type="button"
  >
    <i className={`ph-duotone ${icon}`}></i>
    <span>{label}</span>
  </button>
);

const AdminDashboard = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('contactMessages');
  
  // Editing state for each entity
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [editingPricingId, setEditingPricingId] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingPartnerId, setEditingPartnerId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Edit handlers — switch to the add/edit section with the editing ID
  const handleEditService = (id) => { setEditingServiceId(id); setActiveSection('addService'); };
  const handleEditPricing = (id) => { setEditingPricingId(id); setActiveSection('addPricingPlan'); };
  const handleEditPost = (id) => { setEditingPostId(id); setActiveSection('addPost'); };
  const handleEditPartner = (id) => { setEditingPartnerId(id); setActiveSection('addPartner'); };

  // Done handlers — clear editing ID and switch back to manage section
  const handleServiceDone = () => { setEditingServiceId(null); setActiveSection('manageServices'); };
  const handlePricingDone = () => { setEditingPricingId(null); setActiveSection('managePricingPlans'); };
  const handlePostDone = () => { setEditingPostId(null); setActiveSection('managePosts'); };
  const handlePartnerDone = () => { setEditingPartnerId(null); setActiveSection('managePartners'); };

  // When clicking "Add new" in sidebar, clear any editing state
  const goToAddService = () => { setEditingServiceId(null); setActiveSection('addService'); };
  const goToAddPricing = () => { setEditingPricingId(null); setActiveSection('addPricingPlan'); };
  const goToAddPost = () => { setEditingPostId(null); setActiveSection('addPost'); };
  const goToAddPartner = () => { setEditingPartnerId(null); setActiveSection('addPartner'); };

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert('خطأ في تسجيل الدخول: ' + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;

  if (!session) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <img src="/images/logs.png" alt="Elebtkar Logo" className="logo-img mx-auto" />
            <h2>لوحة التحكم</h2>
            <p>سجل دخولك لإدارة محتوى الموقع</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="field-group text-right">
              <label>البريد الإلكتروني</label>
              <input type="email" name="email" required className="ltr-field" />
            </div>
            <div className="field-group text-right">
              <label>كلمة المرور</label>
              <input type="password" name="password" required className="ltr-field" />
            </div>
            <button type="submit" className="submit-btn mt-4">
              <span>دخول</span>
              <i className="ph ph-sign-in"></i>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-body">
      <SEO title="لوحة التحكم" description="لوحة إدارة محتوى وكالة ابتكار" />
      <header className="dash-header">
        <Link to="/" className="dash-back-link">
          <i className="ph ph-arrow-right"></i>
          العودة للموقع
        </Link>
        <div className="flex items-center gap-3">
          <span className="dash-title">لوحة إدارة الابتكار</span>
          <img src="/images/logs.png" alt="Logo" className="logo-img" />
        </div>
      </header>

      <div className="dash-wrapper">
        <aside className="dash-sidebar">
          <div className="sidebar-nav">
            <span className="nav-section-title">التفاعلات</span>
            <NavItem active={activeSection === 'contactMessages'} onClick={() => setActiveSection('contactMessages')} icon="ph-envelope-open" label="رسائل التواصل" />
            <NavItem active={activeSection === 'managePayments'} onClick={() => setActiveSection('managePayments')} icon="ph-credit-card" label="عمليات الدفع" />
            
            <div className="nav-divider"></div>
            
            <span className="nav-section-title">الخدمات</span>
            <NavItem active={activeSection === 'manageServices'} onClick={() => setActiveSection('manageServices')} icon="ph-squares-four" label="إدارة الخدمات" />
            <NavItem active={activeSection === 'addService'} onClick={goToAddService} icon="ph-plus-circle" label="إضافة خدمة" />
            
            <div className="nav-divider"></div>
            
            <span className="nav-section-title">باقات الأسعار</span>
            <NavItem active={activeSection === 'managePricingPlans'} onClick={() => setActiveSection('managePricingPlans')} icon="ph-wallet" label="إدارة حلول الابتكار" />
            <NavItem active={activeSection === 'addPricingPlan'} onClick={goToAddPricing} icon="ph-plus-circle" label="إضافة حل ابتكار" />
            
            <div className="nav-divider"></div>
            
            <span className="nav-section-title">المقالات</span>
            <NavItem active={activeSection === 'managePosts'} onClick={() => setActiveSection('managePosts')} icon="ph-article-ny-times" label="إدارة المقالات" />
            <NavItem active={activeSection === 'addPost'} onClick={goToAddPost} icon="ph-plus-circle" label="إضافة مدونة" />
            
            <div className="nav-divider"></div>
            
            <span className="nav-section-title">الشركاء</span>
            <NavItem active={activeSection === 'managePartners'} onClick={() => setActiveSection('managePartners')} icon="ph-handshake" label="إدارة الشركاء" />
            <NavItem active={activeSection === 'addPartner'} onClick={goToAddPartner} icon="ph-plus-circle" label="إضافة شريك" />
            
            <div className="nav-divider"></div>
            
            <span className="nav-section-title">التسويق والإحصائيات</span>
            <NavItem active={activeSection === 'discountCodes'} onClick={() => setActiveSection('discountCodes')} icon="ph-ticket" label="أكواد الخصم" />
            <NavItem active={activeSection === 'manageStats'} onClick={() => setActiveSection('manageStats')} icon="ph-chart-line-up" label="إدارة الإحصائيات" />
          </div>
          <div className="sidebar-footer">
            <button onClick={handleLogout} className="btn-logout-sidebar">
              <i className="ph ph-sign-out"></i>
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </aside>

        <main className="dash-main-content">
          {activeSection === 'contactMessages' && <ContactMessagesSection />}
          {activeSection === 'managePayments' && <PaymentsSection />}
          {activeSection === 'manageServices' && <ServicesSection onEdit={handleEditService} />}
          {activeSection === 'addService' && <AddServiceSection editingId={editingServiceId} onDone={handleServiceDone} />}
          {activeSection === 'managePricingPlans' && <PricingSection onEdit={handleEditPricing} />}
          {activeSection === 'addPricingPlan' && <AddPricingSection editingId={editingPricingId} onDone={handlePricingDone} />}
          {activeSection === 'managePosts' && <PostsSection onEdit={handleEditPost} />}
          {activeSection === 'addPost' && <AddPostSection editingId={editingPostId} onDone={handlePostDone} />}
          {activeSection === 'managePartners' && <PartnersSection onEdit={handleEditPartner} />}
          {activeSection === 'addPartner' && <AddPartnerSection editingId={editingPartnerId} onDone={handlePartnerDone} />}
          {activeSection === 'discountCodes' && <DiscountCodesSection />}
          {activeSection === 'manageStats' && <StatsSection />}
        </main>
      </div>
    </div>
  );
};

// Contact Messages Section (matches old admin: name+email together, services pill, view button)
const ContactMessagesSection = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingMsg, setViewingMsg] = useState(null);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setMessages(data);
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  return (
    <div className="admin-section active">
      <div className="dash-card">
        <div className="dash-card-header">
          <i className="ph-duotone ph-envelope-open"></i>
          <h1>رسائل التواصل (طلبات الخدمات)</h1>
          <button onClick={fetchMessages} className="btn-refresh ml-auto mr-0"><i className="ph ph-arrows-clockwise"></i></button>
        </div>
        <div className="dash-card-body">
          {loading ? (<p>جاري التحميل...</p>) : messages.length === 0 ? (<p>لا توجد رسائل حالياً.</p>) : (
            <div className="table-container">
              <table className="data-table">
                <thead><tr><th>التاريخ</th><th>الاسم</th><th>رقم الجوال</th><th>الخدمات المطلوبة</th><th>الرسالة</th></tr></thead>
                <tbody>
                  {messages.map(msg => (
                    <tr key={msg.id}>
                      <td>{new Date(msg.created_at).toLocaleString('ar-EG')}</td>
                      <td>
                        <strong>{msg.name || msg.full_name}</strong><br />
                        <small>{msg.email || '-'}</small>
                      </td>
                      <td dir="ltr">{msg.phone}</td>
                      <td><span className="code-pill">{msg.services || msg.service_type || '-'}</span></td>
                      <td>
                        <button
                          type="button"
                          className="btn-read-message"
                          onClick={() => setViewingMsg(msg)}
                          title="عرض التفاصيل"
                        >
                          <i className="ph-duotone ph-eye"></i> قراءة
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Message View Modal */}
      {viewingMsg && (
        <div style={{ display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, alignItems: 'center', justifyContent: 'center' }} onClick={(e) => { if (e.target === e.currentTarget) setViewingMsg(null); }}>
          <div style={{ background: 'white', borderRadius: '12px', width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid #eee' }}>
              <h3 style={{ margin: 0, color: 'var(--primary)' }}>
                <i className="ph-duotone ph-envelope-open" style={{ marginLeft: '0.5rem' }}></i>
                تفاصيل الرسالة
              </h3>
              <button onClick={() => setViewingMsg(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}>&times;</button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: 'var(--primary)' }}>المرسل:</strong>
                <p style={{ margin: '0.25rem 0' }}>{viewingMsg.name || viewingMsg.full_name}</p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: 'var(--primary)' }}>البريد الإلكتروني:</strong>
                <p style={{ margin: '0.25rem 0' }}>{viewingMsg.email || '-'}</p>
              </div>
              {viewingMsg.subject && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ color: 'var(--primary)' }}>الموضوع:</strong>
                  <p style={{ margin: '0.25rem 0' }}>{viewingMsg.subject}</p>
                </div>
              )}
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: 'var(--primary)' }}>الرسالة:</strong>
                <p style={{ margin: '0.25rem 0', background: '#f8fafc', padding: '1rem', borderRadius: '8px', whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                  {viewingMsg.message || '-'}
                </p>
              </div>
            </div>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #eee', textAlign: 'center' }}>
              <button onClick={() => setViewingMsg(null)} className="submit-btn" style={{ maxWidth: '200px', margin: '0 auto' }}>إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

