import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChristLogo } from './ChristLogo';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Eye,
  EyeOff,
  User,
  GraduationCap,
  Building,
  KeyRound,
  UserPlus,
  LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChristLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  actionReason?: string;
}

export const ChristLoginModal: React.FC<ChristLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  actionReason = 'Sign in with your official Christ University account to register for events, claim seat passes, and access verified digital certificates.'
}) => {
  const { signInStudent, signUpStudent, loginStudent } = useApp();
  
  // Auth mode: 'signin' for existing students, 'signup' for first-time account creation
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign up fields
  const [name, setName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickLogin = async (presetEmail: string, presetName: string, presetReg: string, presetDept: string) => {
    setError('');
    setIsLoading(true);

    // Try signing in first with standard demo password
    const demoPassword = 'Password@123';
    let res = await signInStudent(presetEmail, demoPassword);
    
    // If account doesn't exist yet, automatically register demo account
    if (!res.success && res.error?.includes('No account found')) {
      res = await signUpStudent({
        email: presetEmail,
        password: demoPassword,
        name: presetName,
        regNo: presetReg,
        department: presetDept,
      });
    } else if (!res.success) {
      // Fallback to direct login
      loginStudent(presetEmail, presetName, presetReg, presetDept);
      res = { success: true };
    }

    setIsLoading(false);
    if (res.success) {
      onClose();
      if (onSuccess) onSuccess();
    } else {
      setError(res.error || 'Authentication failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your institutional email address.');
      return;
    }

    const hasChristDomain = cleanEmail.includes('@christuniversity.in') || cleanEmail.includes('christuniversity.in');
    if (!hasChristDomain) {
      setError('Access Restricted: Your email must contain @christuniversity.in (e.g. name@christuniversity.in).');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (authMode === 'signup') {
      if (!name.trim()) {
        setError('Student Full Name is required to register.');
        return;
      }
      if (!regNo.trim()) {
        setError('Registration Number is required to register.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please verify and retype.');
        return;
      }

      setIsLoading(true);
      const res = await signUpStudent({
        email: cleanEmail,
        password,
        name: name.trim(),
        regNo: regNo.trim(),
        department,
      });
      setIsLoading(false);

      if (res.success) {
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || 'Failed to create student account.');
      }
    } else {
      // Sign In mode
      setIsLoading(true);
      const res = await signInStudent(cleanEmail, password);
      setIsLoading(false);

      if (res.success) {
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || 'Invalid credentials.');
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop dismiss */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-0 bg-[#16212F]/60 dark:bg-black/75 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
            className="relative w-full max-w-lg bg-white dark:bg-[#16212F] rounded-[28px] sm:rounded-[32px] shadow-[0_24px_64px_rgba(22,33,47,0.25)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.5)] border border-[#E2E8F0] dark:border-white/10 text-[#1D1D1F] dark:text-white overflow-hidden z-10 max-h-[92vh] flex flex-col"
          >
            {/* Header Banner */}
            <div className="relative bg-[#16212F] p-6 sm:p-7 text-white overflow-hidden shrink-0">
              {/* Background Crest Accent */}
              <div className="absolute right-[-20px] top-[-20px] opacity-10 pointer-events-none select-none">
                <span className="text-[120px] font-serif font-black">SWO</span>
              </div>

              <button
                onClick={onClose}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-3">
                <ChristLogo size="md" showText={false} />
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#C5A063]/25 border border-[#C5A063]/40 text-[#E6C98F] text-[10px] font-bold tracking-widest uppercase">
                    CHRIST INSTITUTIONAL SSO
                  </span>
                  <p className="text-xs text-slate-300 font-medium">Bangalore Yeshwanthpur Campus</p>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {authMode === 'signin' ? 'Student Institutional Sign In' : 'Create Student Profile & Password'}
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {authMode === 'signin'
                  ? 'Sign in with your email and password to access your passes, ID, and committee records.'
                  : 'Register your institutional profile once to create a secure password for future logins.'}
              </p>

              {/* Mode Toggle Tabs (Sign In vs Sign Up) */}
              <div className="mt-4 flex items-center p-1 bg-white/10 rounded-2xl gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setError('');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    authMode === 'signin'
                      ? 'bg-white text-[#16212F] shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setError('');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    authMode === 'signup'
                      ? 'bg-white text-[#16212F] shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up / Register</span>
                </button>
              </div>
            </div>

            {/* Body Form */}
            <div className="p-6 sm:p-7 space-y-4 overflow-y-auto">
              {/* Error Banner */}
              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/40 flex items-start gap-2.5 text-rose-800 dark:text-rose-200 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed font-medium">
                    {error}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Email Field */}
                <div>
                  <label className="block text-xs font-bold text-[#16212F] dark:text-white mb-1 uppercase tracking-wider">
                    Christ University Email ID <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C9AA9]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. name@christuniversity.in"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-white/5 focus:outline-none focus:border-[#3A5982] dark:focus:border-[#4770A3] focus:ring-2 focus:ring-[#3A5982]/15 text-xs text-[#16212F] dark:text-white placeholder:text-[#8C9AA9] transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-[#8C9AA9] dark:text-slate-400 mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#3A5982] dark:text-[#93C5FD]" />
                    Must contain <span className="font-semibold text-[#16212F] dark:text-white">@christuniversity.in</span>
                  </p>
                </div>

                {/* SIGN UP ONLY FIELDS: Name, Reg No, Department */}
                {authMode === 'signup' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#536275] dark:text-slate-300 mb-1">
                          Student Full Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Abhiram U"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            setError('');
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-white/5 text-xs text-[#16212F] dark:text-white focus:outline-none focus:border-[#3A5982] dark:focus:border-[#4770A3]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#536275] dark:text-slate-300 mb-1">
                          Registration No. <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 2447101"
                          value={regNo}
                          onChange={(e) => {
                            setRegNo(e.target.value);
                            setError('');
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-white/5 text-xs font-mono text-[#16212F] dark:text-white focus:outline-none focus:border-[#3A5982] dark:focus:border-[#4770A3]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#536275] dark:text-slate-300 mb-1">
                        Department / School
                      </label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-white/10 text-xs text-[#16212F] dark:text-white bg-white dark:bg-[#1A2433] focus:outline-none focus:border-[#3A5982] dark:focus:border-[#4770A3]"
                      >
                        <option value="Computer Science & Engineering">School of Engineering & Tech (CSE/AI)</option>
                        <option value="School of Business and Management">School of Business and Management (MBA/BBA)</option>
                        <option value="School of Commerce, Finance and Accountancy">School of Commerce & Finance</option>
                        <option value="School of Sciences">School of Sciences (Psychology/Data)</option>
                        <option value="School of Social Sciences">School of Social Sciences & Humanities</option>
                        <option value="School of Law">School of Law</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#16212F] dark:text-white uppercase tracking-wider">
                      {authMode === 'signup' ? 'Create Password' : 'Password'} <span className="text-rose-500">*</span>
                    </label>
                    {authMode === 'signup' && (
                      <span className="text-[10px] text-slate-400">Min 6 characters</span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C9AA9]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder={authMode === 'signup' ? 'Create a secure password' : 'Enter your password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-white/5 focus:outline-none focus:border-[#3A5982] dark:focus:border-[#4770A3] focus:ring-2 focus:ring-[#3A5982]/15 text-xs text-[#16212F] dark:text-white placeholder:text-[#8C9AA9] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password (SIGN UP ONLY) */}
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-[#16212F] dark:text-white mb-1 uppercase tracking-wider">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C9AA9]">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setError('');
                        }}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-white/5 focus:outline-none focus:border-[#3A5982] dark:focus:border-[#4770A3] focus:ring-2 focus:ring-[#3A5982]/15 text-xs text-[#16212F] dark:text-white placeholder:text-[#8C9AA9] transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-[#3A5982] dark:bg-[#4770A3] hover:bg-[#2D476C] dark:hover:bg-[#3A5D88] active:scale-[0.98] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
                >
                  {isLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>
                        {authMode === 'signin' ? 'Sign In to Institutional Portal' : 'Create Student Profile & Sign In'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Mode Switch Helper */}
              <div className="text-center pt-2">
                {authMode === 'signin' ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    First time accessing the portal?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signup');
                        setError('');
                      }}
                      className="font-bold text-[#3A5982] dark:text-[#93C5FD] hover:underline cursor-pointer"
                    >
                      Create Student Profile (Sign Up)
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Already registered your profile?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signin');
                        setError('');
                      }}
                      className="font-bold text-[#3A5982] dark:text-[#93C5FD] hover:underline cursor-pointer"
                    >
                      Sign In with Password
                    </button>
                  </p>
                )}
              </div>

              {/* Quick Demo Test Presets */}
              <div className="pt-3 border-t border-[#E2E8F0] dark:border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-[#8C9AA9] dark:text-slate-400 uppercase tracking-wider">
                    Quick Demo Institutional Accounts:
                  </span>
                  <span className="text-[10px] text-[#C5A063] font-semibold">1-Click Fast Auth</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin(
                      'rahul.sharma@christuniversity.in',
                      'Rahul Sharma',
                      '2447108',
                      'Computer Science & Engineering'
                    )}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-[#E2E8F0] dark:border-white/10 text-left transition-colors cursor-pointer group"
                  >
                    <p className="text-xs font-bold text-[#16212F] dark:text-white group-hover:text-[#3A5982] dark:group-hover:text-[#93C5FD]">
                      Rahul Sharma (BTech)
                    </p>
                    <p className="text-[10px] text-[#8C9AA9] dark:text-slate-400 truncate">
                      rahul.sharma@christuniversity.in
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin(
                      'ananya.sen@christuniversity.in',
                      'Ananya Sen',
                      '2421503',
                      'School of Business and Management'
                    )}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-[#E2E8F0] dark:border-white/10 text-left transition-colors cursor-pointer group"
                  >
                    <p className="text-xs font-bold text-[#16212F] dark:text-white group-hover:text-[#3A5982] dark:group-hover:text-[#93C5FD]">
                      Ananya Sen (MBA)
                    </p>
                    <p className="text-[10px] text-[#8C9AA9] dark:text-slate-400 truncate">
                      ananya.sen@christuniversity.in
                    </p>
                  </button>
                </div>
              </div>

              {/* Security notice */}
              <div className="text-[10px] text-[#86868B] text-center leading-relaxed">
                Protected by Christ University Single Sign-On Security. Only verified students and faculty of Yeshwanthpur Campus are authorized to access official SWO portal systems.
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

