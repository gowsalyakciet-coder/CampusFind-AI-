import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Trash2,
  RefreshCw,
  ImageIcon
} from 'lucide-react';
import {
  ItemCategory,
  User,
  ItemReport
} from '../../types';
import { compressAndStorePhoto } from '../../services/storage';
import { dbService } from '../../services/database';
import { runMatchingForReport } from '../../services/matchingEngine';

interface ReportFoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSuccess: (report: ItemReport) => void;
  onOpenAuth: () => void;
}

// Sample photos for quick 1-click testing
const SAMPLE_FOUND_PHOTOS = [
  {
    name: 'iPhone 15 Pro (Found at Dining Hall)',
    category: 'iPhone' as ItemCategory,
    title: 'Found iPhone 15 Pro (Natural Titanium)',
    url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Dell XPS Laptop (Found at Library)',
    category: 'Laptop' as ItemCategory,
    title: 'Found Dell XPS 15 Laptop (Silver)',
    url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Samsung Galaxy Phone (Found at Quad)',
    category: 'Mobile Phone' as ItemCategory,
    title: 'Found Samsung Galaxy S24 (Onyx Black)',
    url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80'
  }
];

export const ReportFoundModal: React.FC<ReportFoundModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSuccess,
  onOpenAuth
}) => {
  if (!isOpen) return null;

  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [photoName, setPhotoName] = useState<string>('');
  const [detectedCategory, setDetectedCategory] = useState<ItemCategory>('Mobile Phone');
  const [itemTitle, setItemTitle] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
        <div className="human-panel max-w-md w-full text-center space-y-4 p-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
            <HelpCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Sign In to Report Found Item</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Please log in with your campus account to upload a photo of the item you found.
          </p>
          <div className="flex items-center justify-center space-x-3 pt-2">
            <button
              onClick={onClose}
              className="human-btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="human-btn-primary bg-blue-600 hover:bg-blue-700"
            >
              Log In / Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleProcessFile = async (file: File) => {
    setError(null);
    setIsCompressing(true);
    try {
      const lowerName = file.name.toLowerCase();
      let cat: ItemCategory = 'Mobile Phone';
      if (lowerName.includes('iphone') || lowerName.includes('apple') || lowerName.includes('ios')) {
        cat = 'iPhone';
      } else if (lowerName.includes('laptop') || lowerName.includes('macbook') || lowerName.includes('dell') || lowerName.includes('thinkpad')) {
        cat = 'Laptop';
      }

      const storedUrl = await compressAndStorePhoto(file);
      setPhotoPreview(storedUrl);
      setPhotoName(file.name);
      setDetectedCategory(cat);
      setItemTitle(`Found Item - ${file.name.replace(/\.[^/.]+$/, '')}`);
    } catch (err) {
      console.error('Image processing failed', err);
      setError('Failed to process image. Please try another photo.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleProcessFile(file);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await handleProcessFile(file);
    } else if (file) {
      setError('Please upload an image file (PNG, JPG, WEBP).');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleSelectSample = (sample: typeof SAMPLE_FOUND_PHOTOS[number]) => {
    setError(null);
    setPhotoPreview(sample.url);
    setPhotoName(sample.name);
    setDetectedCategory(sample.category);
    setItemTitle(sample.title);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview('');
    setPhotoName('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!photoPreview) {
      setError('Please upload a photo of the found item before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const finalTitle = itemTitle.trim() || `Found ${detectedCategory} (Photo Attached)`;

      const report = dbService.createReport({
        type: 'found',
        category: detectedCategory,
        title: finalTitle,
        description: 'Found item reported directly via photo upload. Photo securely archived at campus recovery desk.',
        color: 'Visible in uploaded photograph',
        identifyingFeatures: 'Refer to uploaded photo for detailed visual identification',
        campusLocation: 'Campus Grounds (Photo Reported)',
        date: today,
        timeApprox: 'Recently',
        photoUrl: photoPreview,
        reportedByUserId: currentUser.id,
        reporterName: currentUser.name,
        reporterEmail: currentUser.email,
        reporterDepartment: currentUser.department,
        status: 'Open',
        sensitiveInfoMasked: true,
        maskedDetails: 'Photograph submitted'
      });

      // Automatically evaluate AI & similarity matches
      await runMatchingForReport(report);

      setIsSubmitting(false);
      onSuccess(report);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to submit found report.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200/90 my-8 overflow-hidden">
        {/* Header - Human Design Slate */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-300 flex items-center justify-center">
              <Camera className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Report Found Item</h2>
              <p className="text-xs text-slate-400">
                Upload a photo to register the found item instantly
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Photo Upload Only */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Upload Zone */}
          {!photoPreview ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-blue-600 bg-blue-50/70 scale-[1.01]'
                  : 'border-slate-300 bg-slate-50/70 hover:bg-slate-100/70 hover:border-slate-400'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
                  {isCompressing ? (
                    <RefreshCw className="w-8 h-8 animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8" />
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900">
                    {isCompressing ? 'Optimizing photo...' : 'Click to upload or drag & drop photo'}
                  </p>
                  <p className="text-xs text-slate-500">
                    Supports JPG, PNG, WEBP, HEIC from camera or device gallery
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="human-btn-primary text-xs px-4 py-2 mt-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Choose Photo / Take Picture</span>
                </button>
              </div>
            </div>
          ) : (
            /* Uploaded Photo Preview Card */
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 p-4 space-y-3">
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-200">
                <img
                  src={photoPreview}
                  alt="Found item upload"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center space-x-1 shadow-sm">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Photo Ready</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="space-y-0.5 max-w-[70%]">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {photoName || 'Found Item Photo'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Category: <span className="font-semibold text-slate-700">{detectedCategory}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          )}

          {/* Quick 1-Click Sample Photos (Convenient for testing in browser) */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Quick Test: Select a Sample Found Photo
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SAMPLE_FOUND_PHOTOS.map((sample) => (
                <button
                  type="button"
                  key={sample.name}
                  onClick={() => handleSelectSample(sample)}
                  className={`p-2 rounded-xl border text-left flex items-center space-x-2 transition-all cursor-pointer ${
                    photoPreview === sample.url
                      ? 'border-blue-600 bg-blue-50/80 ring-1 ring-blue-600'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <img
                    src={sample.url}
                    alt={sample.name}
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-800 truncate">
                      {sample.category}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {sample.name.split('(')[1]?.replace(')', '') || 'Campus'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="human-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !photoPreview}
              className="human-btn-primary bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting Photo...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Submit Found Item</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
