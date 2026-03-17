import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/page/admin');
      } else {
        navigate('/page/user');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 lg:px-12 py-5 border-b border-border">
        <Link to="/" className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
          NewDua
        </Link>
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent font-medium hover:underline">Sign Up</Link>
        </p>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-12 lg:py-20">
        <div className="w-full max-w-[900px] grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden shadow-xl border border-border">

          {/* Left - Image Panel */}
          <div className="relative hidden md:flex flex-col justify-end p-8 min-h-[600px]">
            <img
              src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&h=900&fit=crop"
              alt="Pottery"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/30 to-transparent" />
            <div className="relative z-10 text-center">
              <h2 className="text-3xl font-light text-background mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
                Welcome <span className="italic text-accent">Back</span>
              </h2>
              <p className="text-background/70 text-sm leading-relaxed max-w-xs mx-auto mb-8">
                Sign in to access your saved items, track orders, and enjoy exclusive offers on our handcrafted pottery.
              </p>
              <div className="flex justify-center gap-8">
                <div className="text-center">
                  <p className="text-2xl font-semibold text-accent">20+</p>
                  <p className="text-xs text-background/60">Products</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-accent">50K+</p>
                  <p className="text-xs text-background/60">Customers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-accent">10+</p>
                  <p className="text-xs text-background/60">Years</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Form Panel */}
          <div className="bg-card p-8 lg:p-10 flex flex-col justify-center">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-semibold mb-2" style={{ fontFamily: 'var(--font-serif)' }}>Welcome Back</h1>
              <p className="text-muted-foreground text-sm">Sign in to your account</p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-border accent-accent"
                  />
                  Remember me
                </label>
                {/* <a href="#" className="text-sm text-accent hover:underline">Forgot password?</a> */}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Sign In'}
              </button>
            </form>

            {/* Divider */}
            {/* <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or continue with</span>
              <div className="flex-1 h-px bg-border" />
            </div> */}

            {/* Social */}
            {/* <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
                <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </button>
            </div> */}

            {/* Demo Credentials */}
            <div className="mt-6 p-4 rounded-lg bg-muted text-sm">
              <p className="font-semibold mb-1">Demo Credentials:</p>
              <p className="text-muted-foreground"><strong>Admin:</strong> admin@madebydua.com / admin123</p>
              <p className="text-muted-foreground"><strong>Customer:</strong> john@example.com / password123</p>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-accent font-medium hover:underline">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
