import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Laptop,
  Smartphone,
  Apple,
  Lock,
  ArrowUpDown,
  Sparkles,
  ExternalLink,
  PlusCircle,
  HelpCircle,
  Radio
} from 'lucide-react';
import {
  ItemReport,
  ItemCategory,
  ALLOWED_CATEGORIES,
  CAMPUS_LOCATIONS
} from '../../types';

interface BrowseItemsProps {
  items: ItemReport[];
  initialCategory?: ItemCategory | 'All';
  onSelectItem: (itemId: string) => void;
  onOpenReportLost: () => void;
  onOpenReportFound: () => void;
  onLocateDevice?: (item: ItemReport) => void;
}

export const BrowseItems: React.FC<BrowseItemsProps> = ({
  items,
  initialCategory = 'All',
  onSelectItem,
  onOpenReportLost,
  onOpenReportFound,
  onLocateDevice
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [reportType, setReportType] = useState<'all' | 'lost' | 'found'>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [dateRange, setDateRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Search term match (title, description, brand, model, color)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matches =
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          (item.brand && item.brand.toLowerCase().includes(query)) ||
          (item.model && item.model.toLowerCase().includes(query)) ||
          item.color.toLowerCase().includes(query) ||
          item.campusLocation.toLowerCase().includes(query);
        if (!matches) return false;
      }

      // 2. Strict category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }

      // 3. Report type filter (lost vs found)
      if (reportType !== 'all' && item.type !== reportType) {
        return false;
      }

      // 4. Location filter
      if (selectedLocation !== 'All' && !item.campusLocation.includes(selectedLocation)) {
        return false;
      }

      // 5. Status filter
      if (selectedStatus !== 'All' && item.status !== selectedStatus) {
        return false;
      }

      // 6. Date filter
      if (dateRange !== 'all') {
        const itemDate = new Date(item.date).getTime();
        const now = new Date().getTime();
        const diffDays = (now - itemDate) / (1000 * 60 * 60 * 24);

        if (dateRange === 'today' && diffDays > 1.5) return false;
        if (dateRange === 'week' && diffDays > 7.5) return false;
        if (dateRange === 'month' && diffDays > 30.5) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return a.title.localeCompare(b.title);
    });
  }, [items, searchTerm, selectedCategory, reportType, selectedLocation, selectedStatus, dateRange, sortBy]);

  const getCategoryIcon = (category: ItemCategory) => {
    switch (category) {
      case 'Laptop':
        return <Laptop className="w-4 h-4 text-indigo-600" />;
      case 'Mobile Phone':
        return <Smartphone className="w-4 h-4 text-cyan-600" />;
      case 'iPhone':
        return <Apple className="w-4 h-4 text-slate-800" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Search Controls - Human Card */}
      <div className="human-card p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Browse Campus Lost &amp; Found
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Strictly filtered across the official categories: Laptop, Mobile Phone, and iPhone.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenReportLost}
              className="human-btn-secondary text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report Lost</span>
            </button>
            <button
              onClick={onOpenReportFound}
              className="human-btn-primary"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Report Found</span>
            </button>
          </div>
        </div>

        {/* Search Bar Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, description, brand, model, color, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="human-input pl-10"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* 3 Allowed Categories Segmented Bar */}
        <div className="pt-2 border-t border-slate-100 flex items-center space-x-2 overflow-x-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Category:
          </span>
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {ALLOWED_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center space-x-1.5 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {getCategoryIcon(cat)}
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {/* Secondary Filter Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Lost vs Found Segmented Toggle */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
              Report Type
            </label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setReportType('all')}
                className={`flex-1 py-1 rounded-lg font-bold text-center transition-all cursor-pointer ${
                  reportType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setReportType('lost')}
                className={`flex-1 py-1 rounded-lg font-bold text-center transition-all cursor-pointer ${
                  reportType === 'lost' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Lost
              </button>
              <button
                onClick={() => setReportType('found')}
                className={`flex-1 py-1 rounded-lg font-bold text-center transition-all cursor-pointer ${
                  reportType === 'found' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Found
              </button>
            </div>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
              Campus Location
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="human-select text-xs py-1.5"
            >
              <option value="All">All Campus Locations</option>
              {CAMPUS_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
              Lifecycle Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="human-select text-xs py-1.5"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Potential Match">Potential Match</option>
              <option value="Claim Pending">Claim Pending</option>
              <option value="Approved">Approved</option>
              <option value="Returned">Returned</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
              Sort Order
            </label>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="human-select text-xs py-1.5"
            >
              <option value="newest">Newest Reports First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Item Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
        <span>Showing {filteredItems.length} records</span>
        {(selectedCategory !== 'All' || reportType !== 'all' || selectedLocation !== 'All' || selectedStatus !== 'All' || searchTerm) && (
          <button
            onClick={() => {
              setSelectedCategory('All');
              setReportType('all');
              setSelectedLocation('All');
              setSelectedStatus('All');
              setSearchTerm('');
            }}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Reset All Filters
          </button>
        )}
      </div>

      {/* Grid of Item Cards - Human Design Styling */}
      {filteredItems.length === 0 ? (
        <div className="human-panel p-12 text-center space-y-3">
          <Search className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Matching Items Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords, clearing category filters, or filing a new lost report.
          </p>
          <div className="pt-2 flex items-center justify-center space-x-2">
            <button
              onClick={onOpenReportLost}
              className="human-btn-danger"
            >
              Report Lost Item
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectItem(item.id)}
              className="human-card human-card-interactive flex flex-col justify-between overflow-hidden"
            >
              <div>
                {/* Photo or Category Graphic Container */}
                <div className="relative h-44 bg-slate-100 flex items-center justify-center overflow-hidden border-b border-slate-100">
                  {item.photoUrl ? (
                    <img
                      src={item.photoUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 space-y-2">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-xs">
                        {getCategoryIcon(item.category)}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {item.category}
                      </span>
                    </div>
                  )}

                  {/* Clean status kicker */}
                  <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900/90 text-white backdrop-blur-xs">
                      {item.type.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/95 text-slate-800 shadow-xs">
                      {item.category}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/95 text-slate-900 shadow-xs">
                      {item.status}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-sm text-slate-900 line-clamp-1">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="pt-2 human-meta-row text-xs text-slate-500">
                    <span>Color: <strong className="text-slate-700">{item.color}</strong></span>
                    {item.brand && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{item.brand}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 pt-0 border-t border-slate-100 mt-2 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2.5">
                  <div className="flex items-center space-x-1 truncate max-w-[170px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{item.campusLocation}</span>
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.date}</span>
                  </div>
                </div>

                {/* Device Location Tracker Button if phone has location ON (Feature 6) */}
                {(item.category === 'Mobile Phone' || item.category === 'iPhone') && (
                  <div className="pt-1 flex items-center justify-between">
                    {item.locationServicesOn ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onLocateDevice) onLocateDevice(item);
                        }}
                        className="human-btn-primary py-1 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 border-emerald-600 w-full flex items-center justify-center space-x-1.5"
                      >
                        <Radio className="w-3.5 h-3.5 animate-pulse" />
                        <span>Radar Locate (GPS ON)</span>
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onLocateDevice) onLocateDevice(item);
                        }}
                        className="human-btn-secondary py-1 px-2.5 text-xs w-full flex items-center justify-center space-x-1.5 text-slate-600"
                      >
                        <Radio className="w-3.5 h-3.5 text-slate-400" />
                        <span>Locate Device (Turn ON)</span>
                      </button>
                    )}
                  </div>
                )}

                {item.sensitiveInfoMasked && (
                  <div className="flex items-center space-x-1 text-[11px] text-blue-700 pt-1">
                    <Lock className="w-3 h-3 text-blue-600 shrink-0" />
                    <span>Confidential ID codes encrypted with Security</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
