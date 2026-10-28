import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthPortal: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loginAsDemo } = useAuth();

  // Simple role switcher: 'institution' or 'admin'
  const initialRole = searchParams.get('role') === 'admin' ? 'admin' : 'institution';
  const [role, setRole] = useState<'institution' | 'admin'>(initialRole);

  const [email, setEmail] = useState('user@college.demo');
  const [password, setPassword] = useState('User@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleChange = (newRole: 'institution' | 'admin') => {
    setRole(newRole);
    setError('');
    if (newRole === 'admin') {
      setEmail('admin@aicte.demo');
      setPassword('Admin@123');
    } else {
      setEmail('user@college.demo');
      setPassword('User@123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (role === 'admin') {
        await login({
          email: email.trim(),
          password,
          loginType: 'admin',
          subRole: 'Super Admin'
        });
        navigate('/dashboard');
      } else {
        await login({
          email: email.trim(),
          password,
          loginType: 'institution'
        });
        navigate('/institute/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (type: 'institution_coep' | 'institution_spce' | 'super_admin' | 'ro_western') => {
    loginAsDemo(type);
    if (type.startsWith('institution')) {
      navigate('/institute/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4FA] flex flex-col justify-between text-slate-800">
      {/* Simple Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1F3864] flex items-center justify-center font-black text-amber-400 text-sm shadow-xs">
              AICTE
            </div>
            <div>
              <h1 className="font-bold text-base text-[#1F3864]">AICTE SmartApprove</h1>
              <p className="text-[11px] text-slate-500">Government of India</p>
            </div>
          </Link>

          <Link
            to="/public-verification"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#1F3864] border border-blue-200 transition"
          >
            Public Verification Portal →
          </Link>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
          {/* Logo & Simple Title */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-[#1F3864]">Sign In</h2>
            <p className="text-xs text-slate-500">Choose your role to continue</p>
          </div>

          {/* Simple 2-Option Role Buttons */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => handleRoleChange('institution')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                role === 'institution'
                  ? 'bg-white text-[#1F3864] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Login as Institution</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                role === 'admin'
                  ? 'bg-[#1F3864] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Login as Admin</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                {role === 'admin' ? 'Official Email' : 'Institute Email / AICTE ID'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={role === 'admin' ? 'admin@aicte.demo' : 'user@college.demo'}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-xs"
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
              className="w-full py-3 px-4 rounded-xl font-bold bg-[#1F3864] hover:bg-blue-800 disabled:opacity-60 text-white shadow-md transition flex items-center justify-center gap-2 text-xs"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>{role === 'admin' ? 'Login as Admin' : 'Login as Institution'}</span>
                  <ArrowRight className="w-4 h-4 text-blue-200" />
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          {role === 'institution' && (
            <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
              New college?{' '}
              <Link to="/signup" className="font-bold text-blue-600 hover:text-blue-800">
                Register here →
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 bg-white border-t border-slate-200">
        AICTE SmartApprove • All India Council for Technical Education
      </footer>
    </div>
  );
};

export default AuthPortal;
