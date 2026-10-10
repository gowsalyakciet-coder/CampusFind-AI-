import React, { useState } from 'react';
import {
  X,
  Upload,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  AlertCircle,
  FileCheck2,
  CheckCircle,
  Laptop,
  Smartphone,
  Apple,
  Radio
} from 'lucide-react';
import {
  ItemCategory,
  ALLOWED_CATEGORIES,
  CAMPUS_LOCATIONS,
  User,
  ItemReport
} from '../../types';
import { compressAndStorePhoto } from '../../services/storage';
import { dbService } from '../../services/database';
import { runMatchingForReport } from '../../services/matchingEngine';

interface ReportLostModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSuccess: (report: ItemReport) => void;
  onOpenAuth: () => void;
}

export const ReportLostModal: React.FC<ReportLostModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSuccess,
  onOpenAuth
}) => {
  if (!isOpen) return null;

  const [category, setCategory] = useState<ItemCategory>('iPhone');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [identifyingFeatures, setIdentifyingFeatures] = useState('');
  const [campusLocation, setCampusLocation] = useState<string>(CAMPUS_LOCATIONS[0]);
  const [customLocation, setCustomLocation] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [timeApprox, setTimeApprox] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [locationServicesOn, setLocationServicesOn] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Sign In to Report Lost Item</h2>
          <p className="text-xs text-slate-600">
            You must be logged in with your college account to file lost reports, receive match notifications,
            and claim items safely.
          </p>
          <div className="flex items-center justify-center space-x-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md"
            >
              Log In / Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const storedUrl = await compressAndStorePhoto(file);
        setPhotoPreview(storedUrl);
      } catch (err) {
        console.error('Image compression failed', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide a descriptive item title.');
      return;
    }
    if (!color.trim()) {
      setError('Please specify the primary color of the item.');
      return;
    }
    if (!description.trim()) {
      setError('Please describe where or how the item was lost.');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalLocation = customLocation.trim()
        ? `${campusLocation} - ${customLocation.trim()}`
        : campusLocation;

      const report = dbService.createReport({
        type: 'lost',
        category, // STRICT 3 ALLOWED CATEGORIES
        title: title.trim(),
        description: description.trim(),
        brand: brand.trim() || undefined,
        model: model.trim() || undefined,
        color: color.trim(),
        identifyingFeatures: identifyingFeatures.trim(),
        campusLocation: finalLocation,
        date,
        timeApprox: timeApprox.trim() || undefined,
        photoUrl: photoPreview || undefined,
        locationServicesOn: (category === 'Mobile Phone' || category === 'iPhone') ? locationServicesOn : undefined,
        lastKnownCoordinates: ((category === 'Mobile Phone' || category === 'iPhone') && locationServicesOn)
          ? {
              lat: 37.7749 + (Math.random() - 0.5) * 0.004,
              lng: -122.4194 + (Math.random() - 0.5) * 0.004,
              campusZone: finalLocation,
              accuracyMeters: 4,
              lastPingTime: 'Just now',
              signalStrength: 'Strong'
            }
          : undefined,
        batteryLevel: (category === 'Mobile Phone' || category === 'iPhone') ? 85 : undefined,
        reportedByUserId: currentUser.id,
        reporterName: currentUser.name,
        reporterEmail: currentUser.email,
        reporterDepartment: currentUser.department,
        status: 'Open'
      });

      // Automatically run matching engine against all turned in found items!
      await runMatchingForReport(report);

      setIsSubmitting(false);
      onSuccess(report);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to submit lost report.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 my-8 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-linear-to-r from-rose-600 to-rose-700 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Report Lost Item</h2>
              <p className="text-[11px] text-rose-100">
                Submit details to trigger instant AI similarity matching
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STRICT CATEGORY SELECTION */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Item Category *</span>
              <span className="text-[10px] text-blue-600 font-semibold">Campus Policy Permitted Categories</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ALLOWED_CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all ${
                    category === cat
                      ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-xs ring-1 ring-rose-500'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat === 'Laptop' && <Laptop className="w-4 h-4" />}
                  {cat === 'Mobile Phone' && <Smartphone className="w-4 h-4" />}
                  {cat === 'iPhone' && <Apple className="w-4 h-4" />}
                  <span>{cat}</span>
                </button>
              ))}
            </div>

            {/* Device Location Services / Find My Toggle */}
            {(category === 'Mobile Phone' || category === 'iPhone') && (
              <div className="mt-2.5 p-3.5 bg-blue-50/80 border border-blue-200/90 rounded-2xl space-y-1.5 transition-all animate-in fade-in">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-blue-950 flex items-center space-x-2">
                    <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                    <span>Device Location Services / 'Find My' is ON</span>
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={locationServicesOn}
                      onChange={(e) => setLocationServicesOn(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  {locationServicesOn
                    ? '✓ Device GPS is ON: You will be able to track this phone live on the Campus Radar Map and trigger remote ringing sounds to recover it.'
                    : 'Location is OFF: Device cannot broadcast live GPS beacon coordinates until location is enabled.'}
                </p>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Item Title / Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., iPhone 15 Pro, Dell XPS 15, Galaxy S24 Ultra"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
          </div>

          {/* Brand & Model */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Brand / Manufacturer</label>
              <input
                type="text"
                placeholder="e.g., Apple, Dell, Samsung, Campus Services"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Model / Specs</label>
              <input
                type="text"
                placeholder="e.g., 256GB, XPS 9530, RFID v2"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-rose-500"
              />
            </div>
          </div>

          {/* Color & Identifying Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Color *</label>
              <input
                type="text"
                required
                placeholder="e.g., Natural Titanium, Silver, Space Gray"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Identifying Features (Stickers, Scratches)
              </label>
              <input
                type="text"
                placeholder="e.g., Blue case, astronaut wallpaper, NASA sticker"
                value={identifyingFeatures}
                onChange={(e) => setIdentifyingFeatures(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-rose-500"
              />
            </div>
          </div>

          {/* Location & Details */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Campus Location Lost *
            </label>
            <select
              value={campusLocation}
              onChange={(e) => setCampusLocation(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-hidden focus:border-rose-500 mb-2"
            >
              {CAMPUS_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Specific spot (e.g., Booth 4 near salad bar, desk 14 on 2nd floor)"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-rose-500"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date Lost *</label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-rose-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Approximate Time</label>
              <input
                type="text"
                placeholder="e.g., ~1:30 PM, During morning lecture"
                value={timeApprox}
                onChange={(e) => setTimeApprox(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-rose-500"
              />
            </div>
          </div>

          {/* Full Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Detailed Description *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe the context of when and where you lost it, accessories attached, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-rose-500"
            />
          </div>

          {/* Optional Photo Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Optional Reference Photo (e.g., screenshot or previous picture)
            </label>
            <div className="flex items-center space-x-3">
              <label className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-colors">
                <Upload className="w-4 h-4 text-slate-500" />
                <span>Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
              {photoPreview && (
                <div className="flex items-center space-x-2">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotoPreview('')}
                    className="text-xs text-rose-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-500/20 disabled:opacity-50 transition-all flex items-center space-x-2"
            >
              {isSubmitting ? (
                <span>Submitting &amp; Matching...</span>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Submit Lost Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
