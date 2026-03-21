import React, { useState } from 'react';
import { ArrowRight, Lock, Mail, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'motion/react';
import { AuthCard } from '../components/auth/AuthCard';
import { useAuth } from '../hooks/useAuth';
import { ViewState } from '../types';

interface SignInFormData {
  email: string;
  password: string;
}

export default function SignIn({ setView }: { setView?: (v: ViewState) => void }) {
  const navigate = useNavigate();
  const { signIn, isLoading } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<SignInFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    setAuthError(null);
    try {
      await signIn(data.email, data.password);
      navigate('/profile');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] rounded-full bg-primary-container/10 blur-[100px]"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-5xl h-px bg-gradient-to-r from-transparent via-outline-variant/20 to-transparent"></div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex items-center justify-center px-6 pt-24 pb-24">
        <AuthCard layoutId="auth-card" className="w-full max-w-[480px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="p-10 pb-6 border-b border-outline-variant/20">
              <div className="flex items-center gap-2 mb-4">
                <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary font-bold">Intellectual Access</span>
              </div>
              <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface mb-2">Welcome Back</h1>
              <p className="text-on-surface-variant leading-relaxed font-light">Continue your journey through the digital atelier of academic discovery.</p>
            </div>

            <div className="p-10 pt-8">
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                {authError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-700 text-sm font-medium"
                  >
                    {authError}
                  </motion.div>
                )}

                <div className="space-y-2">
                  <label className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant" htmlFor="email">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors w-5 h-5" />
                    <input 
                      type="email" 
                      id="email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      className={`w-full pl-12 pr-4 py-3.5 bg-surface-container-high border-none rounded-lg focus:ring-1 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-300 placeholder:text-outline-variant/60 text-on-surface font-body outline-none ${
                        errors.email ? 'ring-1 ring-red-500/30' : ''
                      }`}
                      placeholder="researcher@university.edu" 
                    />
                  </div>
                  {errors.email && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-500 text-xs mt-1 block"
                    >
                      {errors.email.message}
                    </motion.span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant" htmlFor="password">Password</label>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors w-5 h-5" />
                    <input 
                      type="password" 
                      id="password"
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                      })}
                      className={`w-full pl-12 pr-4 py-3.5 bg-surface-container-high border-none rounded-lg focus:ring-1 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-300 placeholder:text-outline-variant/60 text-on-surface font-body outline-none ${
                        errors.password ? 'ring-1 ring-red-500/30' : ''
                      }`}
                      placeholder="••••••••" 
                    />
                  </div>
                  {errors.password && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-500 text-xs mt-1 block"
                    >
                      {errors.password.message}
                    </motion.span>
                  )}
                </div>

                <div className="pt-2">
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-semibold py-4 rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? 'Authenticating...' : 'Authenticate Access'}
                    {!isLoading && <ArrowRight className="w-4 h-4" />}
                  </motion.button>
                </div>
              </form>

              <div className="relative my-10 flex items-center">
                <div className="flex-grow border-t border-outline-variant/20"></div>
                <span className="flex-shrink mx-4 font-label text-[10px] uppercase tracking-widest text-outline-variant">Verified Identities</span>
                <div className="flex-grow border-t border-outline-variant/20"></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-3 py-3 border border-outline-variant/20 rounded-lg hover:bg-surface-container-low transition-colors group"
                >
                  <span className="font-label text-xs uppercase tracking-tight text-on-surface-variant font-medium">Google</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-3 py-3 border border-outline-variant/20 rounded-lg hover:bg-surface-container-low transition-colors group"
                >
                  <GraduationCap className="w-4 h-4 text-on-surface-variant" />
                  <span className="font-label text-xs uppercase tracking-tight text-on-surface-variant font-medium">ORCID</span>
                </motion.button>
              </div>
            </div>

            <div className="bg-surface-container-low/50 p-6 flex justify-center border-t border-outline-variant/20">
              <p className="text-on-surface-variant text-sm font-light">
                New to the sanctuary? 
                <button onClick={() => navigate('/signup')} className="text-primary font-semibold hover:underline underline-offset-4 ml-2">Request an Account</button>
              </p>
            </div>
          </motion.div>
        </AuthCard>
      </main>
    </div>
  );
}
