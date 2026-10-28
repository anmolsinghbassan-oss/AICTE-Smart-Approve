import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  Globe,
  Sun,
  Moon,
  Eye,
  User as UserIcon,
  X,
  CheckCircle,
  Clock,
  LogOut,
  KeyRound,
  Edit3,
  ShieldCheck,
  AlertTriangle,
  Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useAlerts } from '../context/AlertsContext';

interface TopBarProps {
  onToggleMobileMenu?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleMobileMenu }) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { isDark, isHighContrast, toggleTheme, toggleHighContrast } = useTheme();
  const { alerts, unreadCount, acknowledgeAlert } = useAlerts();
  const location = useLocation();
  const navigate = useNavigate();

  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [showAlertDropdown, setShowAlertDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  const languages = [
    { code: 'en', name: 'English (EN)' },
    { code: 'hi', name: 'हिन्दी (Hindi)' },
    { code: 'mr', name: 'मराठी (Marathi)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
  ];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setShowLanguageDropdown(false);
  };

  const navLinks = [
    { path: '/home', label: t('nav.home') },
    { path: '/features', label: t('nav.features') },
    { path: '/help', label: t('nav.help') },
  ];

  const handleEditProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg('Profile updated successfully (Simulated)');
    setTimeout(() => {
      setProfileMsg('');
      setShowEditModal(false);
    }, 1500);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#1F3864] text-white shadow-gov-md border-b border-aicte-700/60 transition-colors">
        <div className="flex h-16 items-center justify-between px-3 md:px-6">
          {/* Left: Mobile Hamburger + AICTE Logo & Branding */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-aicte-700 transition"
              aria-label="Toggle Navigation Drawer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link
              to={user?.role === 'Institution User' ? '/institute/dashboard' : '/dashboard'}
              className="flex items-center gap-3 group"
            >
              {/* Emblem Logo */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-saffron-500 via-amber-400 to-govteal-500 p-0.5 shadow-sm">
                <div className="w-full h-full bg-[#1F3864] rounded-[10px] flex items-center justify-center font-black text-amber-400 tracking-tighter text-sm">
                  AICTE
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base md:text-lg tracking-tight flex items-center gap-1.5">
                  AICTE SmartApprove
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-aicte-600 border border-blue-200">
                    Statutory Portal
                  </span>
                </span>
                <span className="text-[10px] text-slate-300 tracking-wider uppercase font-medium hidden sm:block">
                  Integrated Workflow Automation & Compliance
                </span>
              </div>
            </Link>
          </div>

          {/* Centre: Nav links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map(link => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    active
                      ? 'bg-aicte-700 text-white shadow-inner font-semibold'
                      : 'text-slate-200 hover:bg-aicte-700/60 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Controls & Profile */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* High Contrast Toggle */}
            <button
              onClick={toggleHighContrast}
              title={isHighContrast ? 'Disable High Contrast' : 'Enable High Contrast'}
              className={`p-2 rounded-lg text-xs flex items-center gap-1 transition ${
                isHighContrast
                  ? 'bg-amber-400 text-black font-bold shadow'
                  : 'text-slate-300 hover:bg-aicte-700 hover:text-white'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span className="hidden xl:inline text-[11px]">Contrast</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-lg text-slate-300 hover:bg-aicte-700 hover:text-white transition"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowLanguageDropdown(!showLanguageDropdown);
                  setShowAlertDropdown(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-aicte-700/80 hover:bg-aicte-700 text-slate-100 transition border border-aicte-500/30"
              >
                <Globe className="w-3.5 h-3.5 text-govteal-400" />
                <span className="uppercase font-semibold text-[11px]">{i18n.language}</span>
              </button>

              {showLanguageDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-900 shadow-gov-lg border border-slate-200 dark:border-slate-800 py-1.5 z-50 text-slate-800 dark:text-slate-100 animate-in fade-in duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    Select Language / भाषा
                  </div>
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition ${
                        i18n.language === lang.code ? 'font-bold text-aicte-600 dark:text-aicte-400 bg-aicte-50/50 dark:bg-aicte-950/40' : ''
                      }`}
                    >
                      <span>{lang.name}</span>
                      {i18n.language === lang.code && <CheckCircle className="w-3.5 h-3.5 text-aicte-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowAlertDropdown(!showAlertDropdown);
                  setShowLanguageDropdown(false);
                }}
                className="relative p-2 rounded-lg text-slate-300 hover:bg-aicte-700 hover:text-white transition"
                aria-label="Statutory Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-aicte-600 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showAlertDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white dark:bg-slate-900 shadow-gov-lg border border-slate-200 dark:border-slate-800 py-2 z-50 text-slate-800 dark:text-slate-100 animate-in fade-in duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                        Statutory Alerts & Reminders
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {unreadCount} unread active alerts
                      </p>
                    </div>
                    <Link
                      to="/alerts"
                      onClick={() => setShowAlertDropdown(false)}
                      className="text-[11px] font-semibold text-aicte-600 hover:text-aicte-700 dark:text-aicte-400 hover:underline"
                    >
                      View All
                    </Link>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {alerts.slice(0, 4).map(alert => (
                      <div
                        key={alert.id}
                        className={`p-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 transition ${
                          alert.status === 'New' ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              alert.priority === 'Critical'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                                : alert.priority === 'High'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                            }`}
                          >
                            {alert.priority}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {alert.createdTime.split(' ')[0]}
                          </span>
                        </div>
                        <h5 className="font-semibold text-slate-900 dark:text-white mt-1">
                          {alert.title}
                        </h5>
                        <p className="text-slate-600 dark:text-slate-300 text-[11px] line-clamp-2 mt-0.5">
                          {alert.message}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium truncate max-w-[180px]">
                            {alert.institutionName}
                          </span>
                          {alert.status === 'New' && (
                            <button
                              onClick={() => acknowledgeAlert(alert.id)}
                              className="text-aicte-600 hover:text-aicte-700 font-semibold"
                            >
                              Acknowledge
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="px-3 pt-2 text-center border-t border-slate-100 dark:border-slate-800">
                    <Link
                      to="/alerts"
                      onClick={() => setShowAlertDropdown(false)}
                      className="block py-1 text-xs font-semibold text-aicte-600 dark:text-aicte-400 hover:underline"
                    >
                      Open Alert Center & Escalation Matrix →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Trigger or Login Link */}
            {user ? (
              <button
                onClick={() => {
                  setShowProfileDrawer(true);
                  setShowAlertDropdown(false);
                  setShowLanguageDropdown(false);
                }}
                className="flex items-center gap-2 pl-2 border-l border-aicte-500/40 hover:opacity-90 transition group"
                aria-label="Open User Profile Panel"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-saffron-500 to-amber-300 text-aicte-900 font-bold text-xs flex items-center justify-center shadow-sm ring-2 ring-white/20">
                  {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AI'}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold leading-tight truncate max-w-[130px]">
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                  <span className="text-[10px] text-saffron-300 font-medium">
                    {user?.role || 'User'}
                  </span>
                </div>
              </button>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 ml-2"
              >
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Profile Slide-Over Panel */}
      {showProfileDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setShowProfileDrawer(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-aicte-600 to-aicte-700 text-white relative">
                <button
                  onClick={() => setShowProfileDrawer(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-saffron-500 to-amber-300 text-aicte-900 font-black text-xl flex items-center justify-center shadow-lg">
                    {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AI'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{user?.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-saffron-500/20 text-saffron-300 border border-saffron-400/30">
                        {user?.role}
                      </span>
                      <span className="text-xs text-slate-200 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-govteal-400" />
                        {user?.accountStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Body User Info */}
              <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 dark:text-slate-300 flex-1">
                <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
                  <div className="pt-2 flex justify-between">
                    <span className="text-slate-500">Official Email:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{user?.email}</span>
                  </div>

                  <div className="pt-2 flex justify-between">
                    <span className="text-slate-500">Office / College:</span>
                    <span className="font-semibold text-slate-900 dark:text-white text-right max-w-[220px]">
                      {user?.office || user?.institutionName || 'AICTE HQ'}
                    </span>
                  </div>

                  <div className="pt-2 flex justify-between">
                    <span className="text-slate-500">AICTE Permanent ID:</span>
                    <span className="font-mono font-bold text-aicte-600 dark:text-aicte-400">
                      {user?.aicteId || user?.institutionId || 'AICTE-CENTRAL-HQ'}
                    </span>
                  </div>

                  <div className="pt-2 flex justify-between">
                    <span className="text-slate-500">Jurisdiction / State:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {user?.region || user?.state || 'National HQ'}
                    </span>
                  </div>

                  <div className="pt-2 flex justify-between">
                    <span className="text-slate-500">Official Phone:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{user?.phone || '+91 11 2958 1000'}</span>
                  </div>

                  <div className="pt-2 flex justify-between">
                    <span className="text-slate-500">Session Last Login:</span>
                    <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Active Now'}
                    </span>
                  </div>
                </div>

                {profileMsg && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs text-center font-medium">
                    {profileMsg}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-aicte-600" />
                    Edit Profile
                  </button>
                  <button
                    onClick={() => {
                      setProfileMsg('Password reset link dispatched to registered email');
                      setTimeout(() => setProfileMsg(''), 3000);
                    }}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition shadow-xs"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                    Change Password
                  </button>
                </div>

                <button
                  onClick={() => {
                    logout();
                    setShowProfileDrawer(false);
                    navigate('/login');
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800/40 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Logout Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-4">Edit Officer Profile</h4>
            <form onSubmit={handleEditProfile} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  defaultValue={user?.name}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Official Mobile Number</label>
                <input
                  type="text"
                  defaultValue={user?.phone || '+91 98765 43210'}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Office / Campus Address</label>
                <input
                  type="text"
                  defaultValue={user?.office || user?.institutionName}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-aicte-600 text-white font-semibold hover:bg-aicte-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
