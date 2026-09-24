import React, { useRef, useState } from 'react';
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react';

/**
 * Reusable Image Upload component
 * Converts uploaded images to optimized Base64 data URLs.
 */
export default function ImageUpload({
  value = null,
  onChange,
  label = 'Upload Photo',
  helpText = 'PNG, JPG, WEBP up to 5MB',
  className = '',
  aspect = 'square', // 'square' | 'video' | 'circle'
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Resize and optimize image to max 1000px dimension and ~80% quality
  const processFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 900;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setIsProcessing(false);
        if (typeof onChange === 'function') {
          onChange(optimizedDataUrl);
        }
      };
      img.onerror = () => {
        setIsProcessing(false);
        if (typeof onChange === 'function') {
          onChange(e.target.result);
        }
      };
      img.src = e.target.result;
    };
    reader.onerror = () => setIsProcessing(false);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (typeof onChange === 'function') {
      onChange(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div className="relative group w-full max-w-xs rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-2xs">
          <img
            src={value}
            alt={label}
            className={`w-full object-cover ${
              aspect === 'circle' ? 'h-32 rounded-full' : aspect === 'video' ? 'h-36' : 'h-32'
            }`}
          />
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 rounded-lg bg-white/90 hover:bg-white text-slate-800 text-[11px] font-bold shadow-xs flex items-center gap-1 cursor-pointer transition"
            >
              <Camera className="w-3 h-3 text-emerald-600" />
              Change
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer transition"
              title="Remove photo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`w-full max-w-xs border-2 border-dashed rounded-xl p-3.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/50'
              : 'border-slate-200 hover:border-emerald-400 bg-slate-50/60 hover:bg-slate-50'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-400 shadow-2xs mb-1.5 group-hover:text-emerald-600">
            {isProcessing ? (
              <span className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera className="w-4 h-4 text-emerald-600" />
            )}
          </div>
          <span className="text-xs font-bold text-slate-700">
            {isProcessing ? 'Optimizing...' : 'Upload Image'}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">{helpText}</span>
        </div>
      )}
    </div>
  );
}
