import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Radio,
  Volume2,
  Compass,
  BatteryCharging,
  Wifi,
  RefreshCw,
  Navigation,
  ShieldCheck,
  Smartphone,
  Apple,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronDown
} from 'lucide-react';
import { ItemReport } from '../../types';
import { dbService } from '../../services/database';

interface DeviceLocationTrackerModalProps {
  item: ItemReport | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateItem?: (updated: ItemReport) => void;
  onSelectOtherItem?: (item: ItemReport) => void;
}

export const DeviceLocationTrackerModal: React.FC<DeviceLocationTrackerModalProps> = ({
  item: propItem,
  isOpen,
  onClose,
  onUpdateItem,
  onSelectOtherItem
}) => {
  if (!isOpen) return null;

  // Find all phones/iPhones on campus to allow selecting which device to locate
  const allPhones = dbService.getAllItems().filter(
    (i) => i.category === 'Mobile Phone' || i.category === 'iPhone'
  );

  const activeItem = propItem || allPhones[0] || null;

  const [currentItem, setCurrentItem] = useState<ItemReport | null>(activeItem);
  const [isLocationOn, setIsLocationOn] = useState<boolean>(!!activeItem?.locationServicesOn);
  const [isRinging, setIsRinging] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  const [pingSuccessMsg, setPingSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (activeItem) {
      setCurrentItem(activeItem);
      setIsLocationOn(!!activeItem.locationServicesOn);
    }
  }, [activeItem]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!currentItem) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
        <div className="human-panel max-w-md w-full text-center space-y-4">
          <Smartphone className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Mobile Devices Registered</h3>
          <p className="text-xs text-slate-500">
            There are currently no lost or found Mobile Phones or iPhones in the system.
          </p>
          <button onClick={onClose} className="human-btn-secondary">
            Close
          </button>
        </div>
      </div>
    );
  }

  const coords = currentItem.lastKnownCoordinates || {
    lat: 37.7749,
    lng: -122.4194,
    campusZone: currentItem.campusLocation || 'Student Dining Hall - North Booth',
    accuracyMeters: 4,
    lastPingTime: 'Just now',
    signalStrength: 'Strong' as const
  };

  // Play remote chime using Web Audio API
  const handlePlaySound = () => {
    try {
      setIsRinging(true);
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.3); // High ping
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.6);

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);

      setTimeout(() => {
        setIsRinging(false);
      }, 3500);
    } catch {
      setIsRinging(true);
      setTimeout(() => setIsRinging(false), 2000);
    }
  };

  const handleToggleLocation = () => {
    const nextState = !isLocationOn;
    setIsLocationOn(nextState);
    const updated = dbService.toggleDeviceLocation(currentItem.id, nextState);
    if (updated) {
      setCurrentItem(updated);
      if (onUpdateItem) onUpdateItem(updated);
    }
    if (nextState) {
      setPingSuccessMsg('Device location beacon activated! Live coordinates acquired.');
      setTimeout(() => setPingSuccessMsg(null), 3000);
    }
  };

  const handlePingLocation = () => {
    setIsPinging(true);
    setTimeout(() => {
      const updated = dbService.pingDeviceLocation(currentItem.id);
      if (updated) {
        setCurrentItem(updated);
        if (onUpdateItem) onUpdateItem(updated);
      }
      setIsPinging(false);
      setPingSuccessMsg('Latest GPS and campus beacon ping synchronized successfully!');
      setTimeout(() => setPingSuccessMsg(null), 3000);
    }, 800);
  };

  const handleSwitchDevice = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = allPhones.find((p) => p.id === e.target.value);
    if (found) {
      setCurrentItem(found);
      setIsLocationOn(!!found.locationServicesOn);
      if (onSelectOtherItem) onSelectOtherItem(found);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200/90 my-8 overflow-hidden">
        {/* Header - Humanized Indigo-Navy Slate */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center shrink-0">
              {currentItem.category === 'iPhone' ? (
                <Apple className="w-5 h-5 text-white" />
              ) : (
                <Smartphone className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="font-semibold text-blue-300">
                  {currentItem.category} · Campus Radar Locator
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                {isLocationOn ? (
                  <span className="human-status-indicator text-emerald-400 text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Location ON</span>
                  </span>
                ) : (
                  <span className="human-status-indicator text-rose-400 text-xs">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span>Location OFF</span>
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-white tracking-tight mt-0.5">
                {currentItem.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-blue-400"
            aria-label="Close device locator"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto bg-slate-50/40">
          {/* Quick Device Switcher if multiple phones are available */}
          {allPhones.length > 1 && (
            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 text-xs">
              <span className="font-semibold text-slate-700 flex items-center space-x-1.5">
                <Radio className="w-3.5 h-3.5 text-blue-600" />
                <span>Tracked Campus Phone:</span>
              </span>
              <div className="relative">
                <select
                  value={currentItem.id}
                  onChange={handleSwitchDevice}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 pr-7 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {allPhones.map((phone) => (
                    <option key={phone.id} value={phone.id}>
                      {phone.title} ({phone.locationServicesOn ? 'Location ON' : 'Location OFF'})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          )}

          {pingSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{pingSuccessMsg}</span>
            </div>
          )}

          {/* Location State Toggle Banner */}
          <div className="human-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2 font-bold text-slate-900 text-xs sm:text-sm">
                <Radio className={`w-4 h-4 ${isLocationOn ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
                <span>Device Location Tracking</span>
              </div>
              <p className="text-xs text-slate-500">
                {isLocationOn
                  ? 'Location services are active. Transmitting real-time GPS beacon signals across campus.'
                  : 'Location services are currently turned OFF. Turn ON to detect live radar coordinates and ping acoustic sound.'}
              </p>
            </div>

            <button
              onClick={handleToggleLocation}
              className={`shrink-0 ${
                isLocationOn
                  ? 'human-btn-secondary text-rose-600 border-rose-200 hover:bg-rose-50'
                  : 'human-btn-primary bg-emerald-600 hover:bg-emerald-700 border-emerald-600'
              }`}
            >
              {isLocationOn ? 'Turn Location OFF' : 'Turn Location ON (Find Device)'}
            </button>
          </div>

          {/* IF LOCATION IS ON: Interactive Radar Map & Telemetry */}
          {isLocationOn ? (
            <div className="space-y-5">
              {/* Radar Simulation Display with Human Design styling */}
              <div className="relative h-64 sm:h-72 rounded-2xl bg-slate-950 overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
                {/* Concentric radar range circles */}
                <div className="absolute w-56 h-56 rounded-full border border-emerald-500/15" />
                <div className="absolute w-40 h-40 rounded-full border border-emerald-500/25" />
                <div className="absolute w-24 h-24 rounded-full border border-emerald-500/40" />

                {/* Crosshairs */}
                <div className="absolute inset-x-0 top-1/2 h-px bg-emerald-500/20" />
                <div className="absolute inset-y-0 left-1/2 w-px bg-emerald-500/20" />

                {/* Sweeping radar beam animation */}
                <div className="absolute w-64 h-64 rounded-full border-t-2 border-emerald-400/50 animate-radar-sweep opacity-50 pointer-events-none" />

                {/* Pulsating Device Beacon Target */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-10 h-10 rounded-full bg-emerald-400/40 animate-beacon-ripple" />
                    <span className="relative w-4 h-4 rounded-full bg-emerald-400 border-2 border-white shadow-lg animate-signal-glow" />
                  </div>
                  <div className="mt-2.5 px-3 py-1 rounded-lg bg-slate-900/95 text-white text-[11px] font-bold border border-slate-700 shadow-xl backdrop-blur-md text-center">
                    <div>{currentItem.title}</div>
                    <div className="text-emerald-400 font-mono text-[9px]">±{coords.accuracyMeters}m Accuracy · Live Beacon</div>
                  </div>
                </div>

                {/* Overlay Top Bar on Map */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300 font-mono">
                  <div className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center space-x-1.5 backdrop-blur-xs">
                    <Compass className="w-3.5 h-3.5 text-blue-400" />
                    <span>Lat: {coords.lat.toFixed(4)}, Lng: {coords.lng.toFixed(4)}</span>
                  </div>
                  <div className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 text-emerald-400 font-bold flex items-center space-x-1 backdrop-blur-xs">
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Beacon Active</span>
                  </div>
                </div>

                {/* Overlay Bottom Bar on Map */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800 backdrop-blur-xs">
                    Building: {coords.campusZone}
                  </span>
                  <span className="bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800 backdrop-blur-xs">
                    Last sync: {coords.lastPingTime}
                  </span>
                </div>
              </div>

              {/* Real-time Telemetry Grid - Unboxed Human Design Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <div className="flex items-center space-x-1 text-slate-400 text-[10px] font-bold uppercase mb-1">
                    <MapPin className="w-3 h-3 text-blue-600" />
                    <span>Campus Zone</span>
                  </div>
                  <div className="font-bold text-slate-900 truncate">{coords.campusZone}</div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <div className="flex items-center space-x-1 text-slate-400 text-[10px] font-bold uppercase mb-1">
                    <Radio className="w-3 h-3 text-emerald-600" />
                    <span>Signal Quality</span>
                  </div>
                  <div className="font-bold text-emerald-700">{coords.signalStrength} Signal</div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <div className="flex items-center space-x-1 text-slate-400 text-[10px] font-bold uppercase mb-1">
                    <Clock className="w-3 h-3 text-indigo-600" />
                    <span>Last GPS Ping</span>
                  </div>
                  <div className="font-bold text-slate-900">{coords.lastPingTime}</div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <div className="flex items-center space-x-1 text-slate-400 text-[10px] font-bold uppercase mb-1">
                    <BatteryCharging className="w-3 h-3 text-amber-600" />
                    <span>Battery Status</span>
                  </div>
                  <div className="font-bold text-slate-900">{currentItem.batteryLevel || 78}% Power</div>
                </div>
              </div>

              {/* Action Buttons: Sound, Refresh, Guided Directions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* 1. Ring Device / Play Sound */}
                <button
                  onClick={handlePlaySound}
                  disabled={isRinging}
                  className={`human-btn p-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                    isRinging
                      ? 'bg-amber-500 text-white animate-pulse'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{isRinging ? 'Ringing Device Chime...' : 'Play Remote Chime'}</span>
                </button>

                {/* 2. Re-Ping Location */}
                <button
                  onClick={handlePingLocation}
                  disabled={isPinging}
                  className="human-btn-secondary p-3 rounded-xl flex items-center justify-center space-x-2"
                >
                  <RefreshCw className={`w-4 h-4 text-blue-600 ${isPinging ? 'animate-spin' : ''}`} />
                  <span>{isPinging ? 'Pinging GPS...' : 'Refresh Radar Beacon'}</span>
                </button>

                {/* 3. Campus Directions */}
                <button
                  onClick={() => setShowDirections(!showDirections)}
                  className="human-btn-secondary p-3 rounded-xl flex items-center justify-center space-x-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <Navigation className="w-4 h-4 text-blue-600" />
                  <span>{showDirections ? 'Hide Walking Route' : 'Walking Directions'}</span>
                </button>
              </div>

              {/* Guided Route Step-by-Step Info */}
              {showDirections && (
                <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2 text-xs text-blue-950 animate-in fade-in">
                  <div className="font-bold flex items-center space-x-1.5 text-blue-900">
                    <Navigation className="w-4 h-4 text-blue-600" />
                    <span>Guided Campus Walking Route to {coords.campusZone}:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-blue-900/90 leading-relaxed pl-1">
                    <li>Walk to the building entrance of {coords.campusZone.split('-')[0].trim()}.</li>
                    <li>Follow the radar beacon signal to the designated floor / booth area.</li>
                    <li>If the device has been secured by staff, present your student ID to Campus Security for identity handover.</li>
                  </ol>
                </div>
              )}
            </div>
          ) : (
            /* IF LOCATION IS OFF: Clear human design guidance */
            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900">Location Services is Disabled</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  When the location feature is active on a Mobile Phone or iPhone, CampusFind AI can read its live campus beacon coordinates, display distance on the radar map, and sound acoustic chimes.
                </p>
              </div>
              <div>
                <button
                  onClick={handleToggleLocation}
                  className="human-btn-primary bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
                >
                  <Radio className="w-4 h-4" />
                  <span>Turn Location ON to Find This Device</span>
                </button>
              </div>
            </div>
          )}

          {/* Privacy and Honor Code Assurance */}
          <div className="p-3.5 bg-white border border-slate-200 rounded-xl text-[11px] text-slate-500 flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              Beacon telemetry is protected. Coordinates and device audio pings are strictly limited to authenticated student device owners and Campus Security Officers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
