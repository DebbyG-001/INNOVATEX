'use client';

import React, { useState } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, Lock, Mail, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../common/Logo';

export const LoginScreen: React.FC = () => {
  const { login, setActiveTab } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-[#F4F7FC] flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#E3E9F4]">
        {/* Back Link */}
        <button
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-1.5 text-xs font-bold text-[#5B6B8C] hover:text-[#0047AB] mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to EcoQuest</span>
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <Logo size="md" variant="dark" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#071A3F]">
            Welcome Back
          </h2>
          <p className="text-xs text-[#5B6B8C] mt-1">
            Sign in to access your EcoQuest dashboard and goals
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#FEE2E2] border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#0B1B3A] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#5B6B8C] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F4F7FC] border border-[#E3E9F4] rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-semibold text-[#0B1B3A] focus:ring-2 focus:ring-[#0047AB] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1B3A] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#5B6B8C] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F4F7FC] border border-[#E3E9F4] rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-semibold text-[#0B1B3A] focus:ring-2 focus:ring-[#0047AB] outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 ${isLoading ? 'bg-[#5B6B8C]' : 'bg-[#0047AB] hover:bg-[#003A8C]'} text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer`}
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>


        </form>

        <div className="mt-6 pt-4 border-t border-[#E3E9F4] text-center text-xs text-[#5B6B8C]">
          <span>Don't have an account? </span>
          <button
            onClick={() => setActiveTab('register')}
            className="text-[#0047AB] font-bold hover:underline cursor-pointer"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};
