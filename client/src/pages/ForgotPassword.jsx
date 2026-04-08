import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Key, ArrowRight, CheckCircle } from 'lucide-react';
import { authAPI } from '../services/api';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [timer, setTimer] = useState(600); // 10 mins = 600s

  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if ((step === 2 || step === 3) && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await authAPI.forgotPassword({ email });
      setMessage(res.data.message);
      setStep(2);
      setTimer(600);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await authAPI.resendOtp({ email });
      setMessage(res.data.message);
      setTimer(600);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToNext = (e) => {
    e.preventDefault();
    if(otp.length !== 6) {
        setError('Please enter a valid 6-digit OTP');
        return;
    }
    setStep(3);
    setError('');
    setMessage('');
  }

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await authAPI.resetPassword({ email, otp, newPassword });
      setMessage(res.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = () => {
    const min = Math.floor(timer / 60);
    const sec = timer % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Top Bar */}
      <header className="w-full flex items-center justify-between px-6 lg:px-12 py-6 border-b border-border/50 bg-card shadow-sm">
        <Link to="/" className="text-2xl font-black tracking-tighter text-primary flex items-center gap-2" style={{ fontFamily: 'var(--font-serif)' }}>
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white text-lg">D</div>
          Handmade By Dua
        </Link>
        <Link to="/login" className="text-sm font-bold text-accent hover:opacity-80 transition-opacity">
            Back to Login
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[520px] bg-card p-10 lg:p-14 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-border relative">
          
          {/* Step Indicator */}
          <div className="flex justify-center gap-2 mb-10">
            {[1, 2, 3].map((s) => (
                <div 
                    key={s} 
                    className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'w-8 bg-accent' : 'w-4 bg-gray-100'}`}
                />
            ))}
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
                {step === 1 && "Forgot Password"}
                {step === 2 && "Verification"}
                {step === 3 && "Reset Password"}
            </h1>
            <p className="text-gray-500 text-sm max-w-[320px] mx-auto leading-relaxed">
              {step === 1 && "Lost your access? No worries. Enter your email and we'll send you a recovery code."}
              {step === 2 && `We've sent a 6-digit code to ${email}. Check your inbox soon.`}
              {step === 3 && "Almost there! Create a strong new password to secure your account."}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-5 py-4 rounded-2xl mb-8 text-sm font-medium flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
              {error}
            </div>
          )}
          
          {message && (
             <div className="bg-green-50 text-green-600 px-5 py-4 rounded-2xl mb-8 text-sm font-medium flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
               <CheckCircle size={18} />
               {message}
             </div>
          )}

          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-8">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Your Email</label>
                <div className="relative group">
                  <Mail size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-accent transition-colors" />
                  <input
                    type="email"
                    required
                    placeholder="syeda.dua@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 rounded-[1.5rem] border border-gray-100 bg-gray-50/50 text-base focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent focus:bg-white transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 rounded-[1.5rem] bg-primary text-white font-black text-sm uppercase tracking-widest hover:shadow-xl hover:shadow-primary/20 active:scale-[0.97] transition-all disabled:opacity-50"
              >
                {loading ? 'Sending Code...' : 'Send Recovery Code'}
              </button>
            </form>
          )}

          {step === 2 && (
             <form onSubmit={handleProceedToNext} className="space-y-8">
               <div className="space-y-6 text-center">
                 <div className="flex justify-center">
                    <div className="px-5 py-2.5 bg-gray-50 rounded-full border border-gray-100 text-[10px] font-black tracking-widest text-gray-400 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${timer < 60 ? 'bg-red-500 animate-pulse' : 'bg-accent'}`}></span>
                        CODE EXPIRES IN: {formatTime()}
                    </div>
                 </div>
                 
                 <div className="relative">
                   <input
                     type="text"
                     required
                     maxLength="6"
                     placeholder="······"
                     value={otp}
                     onChange={(e) => setOtp(e.target.value)}
                     className="w-full py-6 tracking-[1em] text-center text-3xl font-black rounded-[1.5rem] border border-gray-100 bg-gray-50/50 focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent focus:bg-white transition-all placeholder:text-gray-200"
                   />
                 </div>
               </div>
               
               <button
                 type="submit"
                 className="w-full py-5 flex justify-center items-center gap-3 rounded-[1.5rem] bg-primary text-white font-black text-sm uppercase tracking-widest hover:shadow-xl hover:shadow-primary/20 active:scale-[0.97] transition-all"
               >
                 Verify Code
                 <ArrowRight size={20} />
               </button>

               <div className="text-center pt-2">
                 <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-accent transition-colors py-2"
                 >
                    {loading ? 'Requesting...' : "Didn't get it? Resend Code"}
                 </button>
               </div>
             </form>
          )}

          {step === 3 && (
             <form onSubmit={handleResetPassword} className="space-y-8">
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <div className="px-4 py-1.5 bg-accent/10 text-accent rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-accent/20">
                        Secure Session Active: {formatTime()}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">New Password</label>
                    <div className="relative group">
                      <Lock size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-accent transition-colors" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-14 pr-6 py-5 rounded-[1.5rem] border border-gray-100 bg-gray-50/50 text-base focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent focus:bg-white transition-all placeholder:text-gray-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Confirm Password</label>
                    <div className="relative group">
                      <Lock size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-accent transition-colors" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-14 pr-6 py-5 rounded-[1.5rem] border border-gray-100 bg-gray-50/50 text-base focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent focus:bg-white transition-all placeholder:text-gray-300"
                      />
                    </div>
                  </div>
               </div>

               <button
                 type="submit"
                 disabled={loading || timer === 0}
                 className="w-full py-5 rounded-[1.5rem] bg-accent text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 active:scale-[0.97] transition-all disabled:opacity-50"
               >
                 {loading ? 'UPDATING...' : 'Update Password'}
               </button>
               
               {timer === 0 && (
                   <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center">Session Timed Out. Please restart.</p>
               )}
             </form>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <footer className="py-10 text-center text-gray-300 text-[10px] font-medium tracking-widest uppercase">
          &copy; {new Date().getFullYear()} HANDMADE BY DUA. ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
};

export default ForgotPassword;
