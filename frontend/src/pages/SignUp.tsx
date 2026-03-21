import React, { useState } from 'react';
import { ArrowRight, LogIn, ShieldCheck, BrainCircuit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'motion/react';
import { AuthCard } from '../components/auth/AuthCard';
import { useAuth } from '../hooks/useAuth';
import { ViewState } from '../types';

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignUp({ setView }: { setView?: (v: ViewState) => void }) {
  const navigate = useNavigate();
  const { signUp, isLoading } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignUpFormData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: SignUpFormData) => {
    setAuthError(null);
    try {
      await signUp(data.name, data.email, data.password);
      navigate('/profile');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-6 lg:px-24 pt-24 pb-12">
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3"></div>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Editorial Content */}
        <motion.div
          layoutId="signup-editorial"
          className="lg:col-span-6 space-y-8 lg:pr-12"
        >
          <div className="space-y-4">
            <span className="font-label text-primary font-medium tracking-widest uppercase text-xs">Access Protocol v4.2</span>
            <h1 className="text-5xl lg:text-7xl font-headline font-extrabold tracking-tighter text-on-surface leading-[0.9]">
              <span className="bg-gradient-to-br from-primary to-primary-container bg-clip-text">Revio</span><span className="bg-gradient-to-br from-primary to-primary-container bg-clip-text text-transparent">.</span>
            </h1>
          </div>
          <p className="text-on-surface-variant text-lg lg:text-xl font-light leading-relaxed max-w-md">
            Secure your place within the sanctuary. A refined space for academic rigor, where human intellect meets machine precision.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/20"
            >
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="font-label text-xs font-medium uppercase tracking-wider">Zero-Knowledge Vault</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/20"
            >
              <BrainCircuit className="w-4 h-4 text-primary" />
              <span className="font-label text-xs font-medium uppercase tracking-wider">Neural Synthesis</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Registration Card */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end">
          <AuthCard layoutId="auth-card" className="w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="p-8 lg:p-12"
            >
              <div className="mb-10 text-center lg:text-left">
                <div className="mb-4">
                  <span className="font-label text-[10px] uppercase tracking-widest text-primary font-bold">Access Protocol v4.2</span>
                </div>
                <h2 className="text-2xl font-headline font-bold tracking-tight text-on-surface mb-2">Initialize Investigator Profile</h2>
                <p className="font-label text-sm text-on-surface-variant tracking-normal">Please enter your authorized credentials.</p>
              </div>

              <div>
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
                    <label className="block font-label text-xs font-semibold text-on-surface-variant uppercase tracking-widest ml-1" htmlFor="full_name">Full Name</label>
                    <input 
                      type="text" 
                      id="full_name"
                      {...register('name', {
                        required: 'Full name is required',
                        minLength: {
                          value: 2,
                          message: 'Name must be at least 2 characters',
                        },
                      })}
                      className={`w-full bg-surface-container-lowest border border-on-surface/40 rounded-lg px-4 py-4 text-on-surface focus:border-on-surface/60 transition-all outline-none ${
                        errors.name ? 'border-red-500/40' : ''
                      }`}
                    />
                    {errors.name && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-500 text-xs"
                      >
                        {errors.name.message}
                      </motion.span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block font-label text-xs font-semibold text-on-surface-variant uppercase tracking-widest ml-1" htmlFor="reg_email">Email</label>
                    <input 
                      type="email" 
                      id="reg_email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      className={`w-full bg-surface-container-lowest border border-on-surface/40 rounded-lg px-4 py-4 text-on-surface focus:border-on-surface/60 transition-all outline-none ${
                        errors.email ? 'border-red-500/40' : ''
                      }`}
                    />
                    {errors.email && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-500 text-xs"
                      >
                        {errors.email.message}
                      </motion.span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block font-label text-xs font-semibold text-on-surface-variant uppercase tracking-widest ml-1" htmlFor="secret_key">Password</label>
                    <input 
                      type="password" 
                      id="secret_key"
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters',
                        },
                      })}
                      className={`w-full bg-surface-container-lowest border border-on-surface/40 rounded-lg px-4 py-4 text-on-surface font-mono focus:border-on-surface/60 transition-all outline-none ${
                        errors.password ? 'border-red-500/40' : ''
                      }`}
                    />
                    {errors.password && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-500 text-xs"
                      >
                        {errors.password.message}
                      </motion.span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block font-label text-xs font-semibold text-on-surface-variant uppercase tracking-widest ml-1" htmlFor="confirm_password">Confirm Password</label>
                    <input 
                      type="password" 
                      id="confirm_password"
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) =>
                          value === password || 'Passwords do not match',
                      })}
                      className={`w-full bg-surface-container-lowest border border-on-surface/40 rounded-lg px-4 py-4 text-on-surface font-mono focus:border-on-surface/60 transition-all outline-none ${
                        errors.confirmPassword ? 'border-red-500/40' : ''
                      }`}
                    />
                    {errors.confirmPassword && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-500 text-xs"
                      >
                        {errors.confirmPassword.message}
                      </motion.span>
                    )}
                  </div>

                  <div className="pt-4">
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-semibold text-sm py-4 rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                      {isLoading ? 'Registering...' : 'Register Workspace'}
                      {!isLoading && <ArrowRight className="w-4 h-4" />}
                    </motion.button>
                  </div>
                </form>

                <div className="mt-10 pt-8 border-t border-outline-variant/20 text-center">
                  <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-4">Already an investigator?</p>
                  <button onClick={() => navigate('/signin')} className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:text-primary-container transition-colors group">
                    Sign In
                    <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          </AuthCard>
        </div>
      </div>
    </div>
  );
}
