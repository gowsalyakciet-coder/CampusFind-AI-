import React, { useState, useEffect } from 'react';
import {
  User,
  ItemReport,
  MatchRecord,
  ClaimRecord,
  NotificationItem,
  CampusStats,
  ItemCategory
} from './types';
import { authService } from './services/auth';
import { dbService, subscribeToDatabase } from './services/database';

// Layout Components
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';

// View Components
import { HomePage } from './components/pages/HomePage';
import { LoginPage } from './components/pages/LoginPage';
import { HistoryPage } from './components/pages/HistoryPage';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { BrowseItems } from './components/items/BrowseItems';
import { MatchesView } from './components/matches/MatchesView';
import { MyReports } from './components/items/MyReports';
import { NotificationsView } from './components/notifications/NotificationsView';

// Modals
import { ReportLostModal } from './components/items/ReportLostModal';
import { ReportFoundModal } from './components/items/ReportFoundModal';
import { ItemDetailModal } from './components/items/ItemDetailModal';
import { ClaimModal } from './components/claims/ClaimModal';
import { AuthModal } from './components/auth/AuthModal';
import { ArchitectureGuideModal } from './components/guide/ArchitectureGuideModal';
import { DeviceLocationTrackerModal } from './components/locator/DeviceLocationTrackerModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getCurrentUser());
  const [activeView, setActiveView] = useState<string>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Database reactive state
  const [allItems, setAllItems] = useState<ItemReport[]>(() => dbService.getAllItems());
  const [matches, setMatches] = useState<MatchRecord[]>(() => dbService.getMatches());
  const [claims, setClaims] = useState<ClaimRecord[]>(() => dbService.getClaims());
  const [users, setUsers] = useState<User[]>(() => dbService.getUsers());
  const [stats, setStats] = useState<CampusStats>(() => dbService.getStats());
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Modals
  const [reportLostOpen, setReportLostOpen] = useState(false);
  const [reportFoundOpen, setReportFoundOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [architectureGuideOpen, setArchitectureGuideOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [claimTargetItem, setClaimTargetItem] = useState<ItemReport | null>(null);
  const [browseCategoryFilter, setBrowseCategoryFilter] = useState<ItemCategory | 'All'>('All');

  // Device Location Tracker Modal state (Feature 6)
  const [locatingDevice, setLocatingDevice] = useState<ItemReport | null>(null);
  const [deviceLocatorModalOpen, setDeviceLocatorModalOpen] = useState(false);

  // Flash toast message
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Subscribe to Auth changes
  useEffect(() => {
    const unsubAuth = authService.subscribe((user) => {
      setCurrentUser(user);
    });
    return unsubAuth;
  }, []);

  // Subscribe to Database changes
  useEffect(() => {
    const refreshData = () => {
      setAllItems(dbService.getAllItems());
      setMatches(dbService.getMatches());
      setClaims(dbService.getClaims());
      setUsers(dbService.getUsers());
      setStats(dbService.getStats());
      if (currentUser) {
        setNotifications(dbService.getNotifications(currentUser.id));
      } else {
        setNotifications([]);
      }
    };

    refreshData();
    const unsubDb = subscribeToDatabase(refreshData);
    return unsubDb;
  }, [currentUser]);

  const handleFilterCategoryFromDashboard = (category: ItemCategory) => {
    setBrowseCategoryFilter(category);
    setActiveView('browse');
  };

  // Launch live device radar locator
  const handleOpenLocator = (device?: ItemReport) => {
    if (device) {
      setLocatingDevice(device);
    } else {
      const defaultPhone = allItems.find(
        (i) => (i.category === 'Mobile Phone' || i.category === 'iPhone') && i.locationServicesOn
      ) || allItems.find(
        (i) => i.category === 'Mobile Phone' || i.category === 'iPhone'
      );
      setLocatingDevice(defaultPhone || null);
    }
    setDeviceLocatorModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl text-xs font-bold border flex items-center space-x-2 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/20'
                : 'bg-blue-600 text-white border-blue-500 shadow-blue-600/20'
            }`}
          >
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Top Header Navbar */}
      <Navbar
        currentUser={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        onNavigate={(view) => setActiveView(view)}
        activeView={activeView}
        notifications={notifications}
        onOpenArchitectureGuide={() => setArchitectureGuideOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onOpenLocator={() => handleOpenLocator()}
      />

      {/* Main Layout Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Left Sidebar Navigation */}
        <Sidebar
          currentUser={currentUser}
          activeView={activeView}
          onNavigate={(view) => setActiveView(view)}
          onOpenReportLost={() => setReportLostOpen(true)}
          onOpenReportFound={() => setReportFoundOpen(true)}
          notifications={notifications}
          onOpenArchitectureGuide={() => setArchitectureGuideOpen(true)}
          isOpenMobile={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          onOpenLocator={() => handleOpenLocator()}
        />

        {/* Primary View Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {activeView === 'home' && (
            <HomePage
              currentUser={currentUser}
              stats={stats}
              recentItems={allItems}
              onNavigate={(view) => setActiveView(view)}
              onOpenReportLost={() => setReportLostOpen(true)}
              onOpenReportFound={() => setReportFoundOpen(true)}
              onSelectItem={(id) => setSelectedItemId(id)}
              onFilterCategory={handleFilterCategoryFromDashboard}
              onLocateDevice={handleOpenLocator}
            />
          )}

          {activeView === 'dashboard' && (
            <StudentDashboard
              currentUser={currentUser}
              stats={stats}
              matches={matches}
              recentItems={allItems}
              onOpenReportLost={() => setReportLostOpen(true)}
              onOpenReportFound={() => setReportFoundOpen(true)}
              onNavigate={(view) => setActiveView(view)}
              onSelectMatch={() => setActiveView('matches')}
              onSelectItem={(id) => setSelectedItemId(id)}
              onFilterCategory={handleFilterCategoryFromDashboard}
              onLocateDevice={handleOpenLocator}
            />
          )}

          {activeView === 'login' && (
            <LoginPage
              currentUser={currentUser}
              onNavigate={(view) => setActiveView(view)}
              onSuccess={() => {
                showToast('Signed in successfully with Gmail!');
              }}
            />
          )}

          {activeView === 'history' && (
            <HistoryPage
              allItems={allItems}
              claims={claims}
              currentUser={currentUser}
              onSelectItem={(id) => setSelectedItemId(id)}
              onNavigate={(view) => setActiveView(view)}
            />
          )}

          {activeView === 'browse' && (
            <BrowseItems
              items={allItems}
              initialCategory={browseCategoryFilter}
              onSelectItem={(id) => setSelectedItemId(id)}
              onOpenReportLost={() => setReportLostOpen(true)}
              onOpenReportFound={() => setReportFoundOpen(true)}
              onLocateDevice={handleOpenLocator}
            />
          )}

          {activeView === 'matches' && (
            <MatchesView
              matches={matches}
              currentUser={currentUser}
              onSelectItem={(id) => setSelectedItemId(id)}
              onOpenClaim={(item) => setClaimTargetItem(item)}
            />
          )}

          {activeView === 'my_reports' && (
            <MyReports
              currentUser={currentUser}
              allItems={allItems}
              claims={claims}
              matches={matches}
              onSelectItem={(id) => setSelectedItemId(id)}
              onOpenReportLost={() => setReportLostOpen(true)}
              onOpenReportFound={() => setReportFoundOpen(true)}
              onNavigateToMatches={() => setActiveView('matches')}
              onOpenAuth={() => setAuthModalOpen(true)}
              onLocateDevice={handleOpenLocator}
            />
          )}

          {activeView === 'notifications' && (
            <NotificationsView
              notifications={notifications}
              currentUser={currentUser}
              onNavigateToMatches={() => setActiveView('matches')}
              onNavigateToReports={() => setActiveView('my_reports')}
              onSelectItem={(id) => setSelectedItemId(id)}
            />
          )}

          {activeView === 'admin' && (
            <AdminDashboard
              currentUser={currentUser}
              stats={stats}
              claims={claims}
              allItems={allItems}
              users={users}
              onSelectItem={(id) => setSelectedItemId(id)}
            />
          )}
        </main>
      </div>

      {/* MODALS */}
      {/* 1. Report Lost Item */}
      <ReportLostModal
        isOpen={reportLostOpen}
        onClose={() => setReportLostOpen(false)}
        currentUser={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        onSuccess={(report) => {
          showToast(`Report filed for "${report.title}". Scanning for matching items...`);
        }}
      />

      {/* 2. Report Found Item */}
      <ReportFoundModal
        isOpen={reportFoundOpen}
        onClose={() => setReportFoundOpen(false)}
        currentUser={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        onSuccess={(report) => {
          showToast(`Found item "${report.title}" reported safely!`);
        }}
      />

      {/* 3. Item Detail Modal */}
      <ItemDetailModal
        itemId={selectedItemId}
        onClose={() => setSelectedItemId(null)}
        currentUser={currentUser}
        onOpenClaim={(item) => setClaimTargetItem(item)}
        onNavigateToMatches={() => {
          setSelectedItemId(null);
          setActiveView('matches');
        }}
      />

      {/* 4. Claim Ownership Modal */}
      <ClaimModal
        item={claimTargetItem}
        onClose={() => setClaimTargetItem(null)}
        currentUser={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        onSuccess={(claim) => {
          showToast(`Claim for "${claim.itemTitle}" submitted to Campus Security!`);
          setActiveView('my_reports');
        }}
      />

      {/* 5. User Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          showToast('Signed in successfully with Gmail!');
        }}
      />

      {/* 6. Architecture & Firestore Guide Modal */}
      <ArchitectureGuideModal
        isOpen={architectureGuideOpen}
        onClose={() => setArchitectureGuideOpen(false)}
      />

      {/* 7. Live Device Location Radar Modal (Feature 6) */}
      <DeviceLocationTrackerModal
        item={locatingDevice}
        isOpen={deviceLocatorModalOpen}
        onClose={() => setDeviceLocatorModalOpen(false)}
        onSelectOtherItem={(item) => setLocatingDevice(item)}
      />
    </div>
  );
}
