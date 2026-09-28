import React from 'react';
import { Users } from 'lucide-react';
import ImageUpload from '@/components/common/ImageUpload';

export default function StaffPhotoSection({ image, onImageChange }) {
  return (
    <div className="pt-2 border-t border-slate-100">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-3">
        <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
          <Users className="w-3.5 h-3.5" />
        </div>
        <h2 className="text-xs font-bold text-slate-800 font-display uppercase tracking-wider">
          6. Staff Identification Photograph
        </h2>
      </div>
      <div className="max-w-md">
        <ImageUpload
          label="Staff Photograph (JPG, PNG)"
          value={image}
          onChange={onImageChange}
          helpText="Upload employee passport photo or clear face picture"
        />
      </div>
    </div>
  );
}
