// ponytail: Dedicated Admin Media Library dashboard page wrapper around the organizer modal.
import React, { useState } from 'react';
import MediaLibraryModal from '../../../shared/admin/MediaLibraryModal';
import Card, { CardHeader, CardBody } from '../../../shared/components/ui/Card';

export default function AdminMedia() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="space-y-6" style={{ height: '78vh' }}>
      <div>
        <h1 className="text-2xl font-extrabold text-primary">مكتبة الوسائط المنظمة (Media Library)</h1>
        <p className="text-sm text-gray-500 font-bold mt-1">تصفح ورفع الصور وتأطير الكلمات البديلة وحفظ روابط الملفات العامة</p>
      </div>

      <Card style={{ height: 'calc(100% - 60px)', display: 'flex', flexDirection: 'column' }}>
        <CardHeader>
          <i className="ph-duotone ph-image text-primary text-xl" />
          <h2 className="font-extrabold text-primary text-base">الملفات والصور الحالية</h2>
        </CardHeader>
        <CardBody style={{ flex: 1, padding: 0, position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <MediaLibraryModal 
            isOpen={isOpen} 
            inline={true}
            onClose={() => {}} 
            onSelect={(item) => {
              navigator.clipboard.writeText(item.url);
              alert('تم نسخ رابط الصورة إلى الحافظة!');
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
