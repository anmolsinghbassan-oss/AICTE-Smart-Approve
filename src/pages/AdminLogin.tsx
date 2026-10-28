import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLogin: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('admin@aicte.demo');
  const [password, setPassword] = useState('Admin@123');
  const [subRole, setSubRole] = useState<'Super Admin' | 'Regional Officer' | 'Inspection Team Member'>('Super Admin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({
        email: email.trim(),
        password,
        loginType: 'admin',
        subRole
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setPreset = (role: 'Super Admin' | 'Regional Officer' | 'Inspection Team Member', presetEmail: string) => {
    setSubRole(role);
    setEmail(presetEmail);
    setPassword('Admin@123');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-800">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/home" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1F3864] p-0.5 shadow-sm flex items-center justify-center font-black text-amber-400 text-sm">
              AICTE
            </div>
            <div>
              <h1 className="font-bold text-base text-[#1F3864]">AICTE SmartApprove</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                Officer Statutory Portal
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {/* Language selector */}
            <select
              value={i18n.language}
              onChange={e => i18n.changeLanguage(e.target.value)}
              className="bg-slate-50 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="en">English (EN)</option>
              <option value="hi">हिन्दी (HI)</option>
              <option value="mr">मराठी (MR)</option>
              <option value="ta">தமிழ் (TA)</option>
              <option value="bn">বাংলা (BN)</option>
            </select>

            <Link
              to="/login"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#1F3864] border border-blue-200 transition"
            >
              College / Institute Login →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-5 animate-in fade-in">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-[#1F3864] border border-blue-200 mb-2">
              <ShieldCheck className="w-6 h-6 text-[#1F3864]" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Administrator & Officer Login</h2>
            <p className="text-xs text-slate-500">
              Exclusively for authorized AICTE officers, scrutiny committees, and regional leadership
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              ⚡ Demo Officer Profiles:
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setPreset('Super Admin', 'admin@aicte.demo')}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold transition border ${
                  subRole === 'Super Admin'
                    ? 'bg-[#1F3864] text-white border-[#1F3864] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => setPreset('Regional Officer', 'ro.western@aicte.demo')}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold transition border ${
                  subRole === 'Regional Officer'
                    ? 'bg-[#1F3864] text-white border-[#1F3864] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                RO Western
              </button>
              <button
                type="button"
                onClick={() => setPreset('Inspection Team Member', 'inspection@aicte.demo')}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold transition border ${
                  subRole === 'Inspection Team Member'
                    ? 'bg-[#1F3864] text-white border-[#1F3864] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Inspector
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {forgotMsg && (
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-[#1F3864] text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>{forgotMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Official AICTE / NIC Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="admin@aicte.demo"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase">
                  Security Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotMsg('Demo credentials for Administrator: admin@aicte.demo / Admin@123')}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold bg-[#1F3864] hover:bg-blue-800 disabled:opacity-60 text-white shadow-md transition flex items-center justify-center gap-2 text-xs mt-2"
            >
              {loading ? (
                <span>Authenticating Officer Token...</span>
              ) : (
                <>
                  <span>Sign In as Statutory Administrator</span>
                  <ArrowRight className="w-4 h-4 text-blue-200" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
            Participating college or university?{' '}
            <Link to="/login" className="font-bold text-blue-600 hover:text-blue-800">
              Go to Institute Portal →
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 bg-white border-t border-slate-200">
        All India Council for Technical Education (AICTE), Ministry of Education, Government of India
      </footer>
    </div>
  );
};
export default AdminLogin;
