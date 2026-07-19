// ponytail: Reuse MediaLibraryModal to build the dedicated admin Media Library dashboard section.
import React, { useState } from 'react';
import MediaLibraryModal from '../../components/admin/MediaLibraryModal';

export const MediaLibrarySection = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="admin-section active" style={{ height: '78vh' }}>
      <div className="dash-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div className="dash-card-header">
          <i className="ph-duotone ph-image"></i>
          <h1>مكتبة الوسائط</h1>
        </div>
        <div className="dash-card-body" style={{ flex: 1, padding: 0, position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <MediaLibraryModal 
            isOpen={isOpen} 
            inline={true}
            onClose={() => {}} 
            onSelect={(item) => {
              // Copy URL to clipboard when selected in standard section view
              navigator.clipboard.writeText(item.url);
              alert('تم نسخ رابط الصورة إلى الحافظة!');
            }}
          />
        </div>
      </div>
    </div>
  );
};
