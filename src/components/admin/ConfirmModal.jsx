import React from 'react';

export const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, isAlert = false }) => {
  if (!isOpen) return null;

  return (
    <div style={{ display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: '12px', width: '90%', maxWidth: '400px', padding: '2rem', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: isAlert ? '#e8f5e9' : '#ffebee', color: isAlert ? '#4caf50' : '#e53935', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem' }}>
          <i className={isAlert ? "ph-duotone ph-check-circle" : "ph-duotone ph-warning-circle"}></i>
        </div>
        <h3 style={{ margin: '0 0 1rem', color: '#333', fontSize: '1.25rem' }}>{title}</h3>
        <p style={{ margin: '0 0 2rem', color: '#666', lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          {!isAlert && (
            <button 
              onClick={onCancel} 
              style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #ddd', background: 'transparent', cursor: 'pointer', fontWeight: 'bold', color: '#666', flex: 1 }}
            >
              إلغاء
            </button>
          )}
          <button 
            onClick={onConfirm} 
            style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: isAlert ? '#4caf50' : '#e53935', cursor: 'pointer', fontWeight: 'bold', color: 'white', flex: 1 }}
          >
            {isAlert ? "حسناً" : "تأكيد الحذف"}
          </button>
        </div>
      </div>
    </div>
  );
};
