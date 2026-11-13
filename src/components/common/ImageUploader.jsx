import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, Check, Link2, Smartphone, HardDrive } from 'lucide-react';

export const ImageUploader = ({
  value,
  onChange,
  label = 'Upload Image',
  hint = 'Supports JPG, PNG, WEBP from your phone photo library or computer files',
  aspectRatio = '16/9',
  maxDimension = 1200,
  quality = 0.85
}) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [mode, setMode] = useState('device'); // 'device' or 'url'
  const [urlInput, setUrlInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [fileDetails, setFileDetails] = useState(null);

  // Resize and optimize image file to prevent massive base64 strings
  const processImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, or WEBP)');
      return;
    }

    setProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // WebP keeps uploads compact while preserving strong visual quality.
        const dataUrl = canvas.toDataURL('image/webp', quality);
        const approxSizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);

        setFileDetails({
          name: file.name,
          size: `${approxSizeKb} KB`,
          resolution: `${width}x${height}`
        });

        onChange(dataUrl);
        setProcessing(false);
      };

      img.onerror = () => {
        setProcessing(false);
        alert('Failed to load image file. Please try another image.');
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleApplyUrl = (e) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setFileDetails({ name: 'Web Link', size: 'Remote URL' });
      setUrlInput('');
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange('');
    setFileDetails(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* Label & Mode Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-navy)', margin: 0 }}>
          {label}
        </label>

        <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem' }}>
          <button
            type="button"
            onClick={() => setMode('device')}
            style={{
              background: 'none',
              border: 'none',
              padding: '2px 6px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: mode === 'device' ? 700 : 500,
              color: mode === 'device' ? 'var(--color-blue)' : 'var(--color-text-muted)',
              backgroundColor: mode === 'device' ? '#EEF2FF' : 'transparent',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Smartphone size={12} />
            <span>Phone / Computer Library</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('url')}
            style={{
              background: 'none',
              border: 'none',
              padding: '2px 6px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: mode === 'url' ? 700 : 500,
              color: mode === 'url' ? 'var(--color-blue)' : 'var(--color-text-muted)',
              backgroundColor: mode === 'url' ? '#EEF2FF' : 'transparent',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Link2 size={12} />
            <span>Web URL</span>
          </button>
        </div>
      </div>

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Preview if Image is Present */}
      {value ? (
        <div
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg)',
            maxHeight: '260px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img
            src={value}
            alt="Upload Preview"
            style={{
              width: '100%',
              maxHeight: '260px',
              objectFit: 'contain',
              backgroundColor: '#0F172A'
            }}
          />

          {/* Overlay Controls */}
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              display: 'flex',
              gap: '6px'
            }}
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                backgroundColor: 'rgba(16, 36, 58, 0.85)',
                backdropFilter: 'blur(4px)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 10px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Upload size={13} />
              <span>Change Photo</span>
            </button>

            <button
              type="button"
              onClick={handleRemove}
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.9)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center'
              }}
              title="Remove image"
            >
              <X size={14} />
            </button>
          </div>

          {/* Details Pill */}
          {fileDetails && (
            <div
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '10px',
                backgroundColor: 'rgba(16, 36, 58, 0.85)',
                backdropFilter: 'blur(4px)',
                color: '#E2E8F0',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '0.72rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Check size={12} color="#4ADE80" />
              <span>Ready ({fileDetails.size || 'Optimized'})</span>
            </div>
          )}
        </div>
      ) : mode === 'device' ? (
        /* Device Upload Dropzone */
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          style={{
            border: dragActive ? '2px dashed var(--color-blue)' : '2px dashed #CBD5E1',
            borderRadius: 'var(--radius-lg)',
            padding: '24px 16px',
            textAlign: 'center',
            backgroundColor: dragActive ? '#EFF6FF' : '#F8FAFC',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#EEF2FF',
              color: 'var(--color-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {processing ? (
              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>...</span>
            ) : (
              <Upload size={22} />
            )}
          </div>

          <div>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-navy)' }}>
              {processing ? 'Processing and optimizing photo...' : 'Click to select from your Phone or Computer'}
            </span>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              {hint}
            </p>
          </div>

          <button
            type="button"
            className="btn-outline"
            style={{
              fontSize: '0.78rem',
              padding: '6px 14px',
              marginTop: '4px',
              pointerEvents: 'none'
            }}
          >
            Browse Device Files
          </button>
        </div>
      ) : (
        /* Web URL Fallback Form */
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="url"
            placeholder="Paste direct image URL (https://...)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              fontSize: '0.88rem'
            }}
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="btn-primary"
            style={{ padding: '10px 16px', fontSize: '0.85rem' }}
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;

