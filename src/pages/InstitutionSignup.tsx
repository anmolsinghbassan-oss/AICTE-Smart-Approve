import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  Lock,
  Mail,
  Phone,
  Hash,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const InstitutionSignup: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [step, setStep] = useState<1 | 2>(1); // 1: details, 2: OTP verification
  const [instituteName, setInstituteName] = useState('');
  const [aicteId, setAicteId] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const indianStates = [
    'Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Gujarat', 'Haryana',
    'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
    'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'
  ];

  const handleProceedToOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instituteName || !email || !password) {
      setError('Please fill in all mandatory fields');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signup({
        instituteName,
        aicteId: aicteId || `1-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        state,
        email,
        phone,
        password,
        otp
      });
      navigate('/institute/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between text-slate-800 dark:text-slate-100">
      {/* Header */}
      <header className="p-4 sm:p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link to="/home" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-aicte-600 to-govteal-600 p-0.5 shadow-md">
            <div className="w-full h-full bg-[#1F3864] rounded-[10px] flex items-center justify-center font-black text-amber-400 text-sm">
              AICTE
            </div>
          </div>
          <div>
            <h1 className="font-bold text-base text-slate-900 dark:text-white">AICTE SmartApprove</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">Institution Onboarding</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <select
            value={i18n.language}
            onChange={e => i18n.changeLanguage(e.target.value)}
            className="bg-white dark:bg-slate-800 text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700"
          >
            <option value="en">English (EN)</option>
            <option value="hi">हिन्दी (HI)</option>
            <option value="mr">मराठी (MR)</option>
            <option value="ta">தமிழ் (TA)</option>
            <option value="bn">বাংলা (BN)</option>
          </select>

          <Link
            to="/login"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-200 transition"
          >
            Existing User? Login →
          </Link>
        </div>
      </header>

      {/* Main Registration Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-govteal-50 dark:bg-govteal-950/80 text-govteal-600 dark:text-govteal-400 border border-govteal-200 dark:border-govteal-800 mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {step === 1 ? 'New Technical Institution Registration' : 'Verify Mobile & Email OTP'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {step === 1
                ? 'Create official statutory account with AICTE Permanent ID'
                : 'Enter the 6-digit simulated verification code to activate your account'}
            </p>
          </div>

          {/* Stepper indicator */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className={`flex items-center gap-1.5 text-xs font-bold ${step === 1 ? 'text-aicte-600 dark:text-saffron-400' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? 'bg-aicte-600 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>1</span>
              <span>Institution Details</span>
            </div>
            <span className="w-8 h-0.5 bg-slate-200 dark:bg-slate-800" />
            <div className={`flex items-center gap-1.5 text-xs font-bold ${step === 2 ? 'text-aicte-600 dark:text-saffron-400' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? 'bg-aicte-600 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>2</span>
              <span>OTP Verification</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleProceedToOtp} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Full Name of the Institution / College *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={instituteName}
                    onChange={e => setInstituteName(e.target.value)}
                    required
                    placeholder="e.g. National Institute of Technology & Science"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-aicte-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    AICTE Permanent ID (if already allocated)
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={aicteId}
                      onChange={e => setAicteId(e.target.value)}
                      placeholder="e.g. 1-1029384711"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-aicte-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    State / UT Jurisdiction *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select
                      value={state}
                      onChange={e => setState(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-aicte-500 outline-none"
                    >
                      {indianStates.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Official College Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="registrar@college.edu.in"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-aicte-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Principal Contact Phone *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      required
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-aicte-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Create Security Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="Minimum 8 characters with symbols"
                    className="w-full pl-9 pr-10 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-aicte-500 outline-none"
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

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl font-bold bg-[#1F3864] hover:bg-aicte-700 text-white transition flex items-center justify-center gap-2 shadow-md"
                >
                  Continue to OTP Verification
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleFinalSubmit} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-center">
                <span>A 6-digit statutory verification OTP has been sent to <strong>{phone || email}</strong>.</span>
                <span className="block text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                  (For testing, any 6-digit code or pre-filled 123456 is accepted)
                </span>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1 text-center">
                  Enter 6-Digit One Time Password (OTP)
                </label>
                <div className="relative max-w-[220px] mx-auto">
                  <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    required
                    className="w-full text-center font-mono font-bold tracking-widest text-lg py-2 pl-8 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-aicte-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-2.5 px-4 rounded-xl font-bold bg-[#1F3864] hover:bg-aicte-700 text-white transition flex items-center justify-center gap-2 shadow-md"
                >
                  {loading ? 'Verifying & Registering...' : 'Verify OTP & Complete Registration'}
                  <ShieldCheck className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[11px] text-slate-500">
              Already registered?{' '}
              <Link to="/login" className="text-aicte-600 dark:text-saffron-400 font-bold hover:underline">
                Sign in to your dashboard
              </Link>
            </span>
          </div>
        </div>
      </div>

      <footer className="py-4 px-6 text-center text-[11px] text-slate-500 border-t border-slate-200 dark:border-slate-800">
        AICTE SmartApprove Portal — Integrated Approval Workflow & Compliance Monitoring Portal
      </footer>
    </div>
  );
};
