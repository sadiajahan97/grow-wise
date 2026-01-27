
import React, { useState, useEffect } from 'react';
import { User, Profession } from '../types';
import { login, register } from '../services/authService';
import { getProfessions, Profession as ApiProfession } from '../services/professionService';

interface RegistrationFormProps {
  onRegister: (user: User) => void;
}

type Tab = 'signin' | 'signup';

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onRegister }) => {
  const [activeTab, setActiveTab] = useState<Tab>('signup');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profession_id: 0,
    password: '',
    confirmPassword: '',
  });
  const [professions, setProfessions] = useState<ApiProfession[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string>('');

  // Fetch professions on component mount
  useEffect(() => {
    const fetchProfessions = async () => {
      try {
        const profs = await getProfessions();
        setProfessions(profs);
        // Set default profession to first one if available
        if (profs.length > 0) {
          setFormData(prev => ({ ...prev, profession_id: profs[0].id }));
        }
      } catch (error) {
        console.error('Failed to fetch professions:', error);
        // If API fails, we'll just show an empty list
      }
    };
    fetchProfessions();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (activeTab === 'signup') {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.email.match(/^\S+@\S+\.\S+$/)) newErrors.email = 'Invalid email address';
      if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else {
      if (!formData.email.match(/^\S+@\S+\.\S+$/)) newErrors.email = 'Invalid email address';
      if (!formData.password) newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    
    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      if (activeTab === 'signup') {
        // Register new user
        const response = await register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          profession_id: formData.profession_id > 0 ? formData.profession_id : undefined,
        });

        // Find profession name for display
        const selectedProfession = professions.find(p => p.id === formData.profession_id);
        const professionName = selectedProfession?.name || Profession.OTHER;

        onRegister({
          name: response.name || formData.name,
          email: response.email,
          profession: professionName as Profession,
          isRegistered: true,
        });
      } else {
        // Login existing user
        const response = await login({
          email: formData.email,
          password: formData.password,
        });

        // For login, we don't get name from the response, so we'll use email
        onRegister({
          name: response.name || 'User',
          email: response.email,
          profession: Profession.OTHER,
          isRegistered: true,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred. Please try again.';
      setGeneralError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-white">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden">
        {/* Header */}
        <div className="pt-8 px-8 text-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">GrowWise</h1>
          <p className="text-slate-500 mt-2">Your personalized learning companion</p>
        </div>

        {/* Tabs */}
        <div className="flex px-8 border-b border-slate-100">
          <button
            onClick={() => { setActiveTab('signup'); setErrors({}); }}
            className={`flex-1 py-3 text-sm font-semibold transition-all border-b-2 ${activeTab === 'signup' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Sign Up
          </button>
          <button
            onClick={() => { setActiveTab('signin'); setErrors({}); }}
            className={`flex-1 py-3 text-sm font-semibold transition-all border-b-2 ${activeTab === 'signin' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Sign In
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {generalError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {generalError}
            </div>
          )}
          {activeTab === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                className={`w-full px-4 py-2 bg-slate-50 text-slate-900 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${errors.name ? 'border-red-500' : 'border-slate-200'}`}
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              className={`w-full px-4 py-2 bg-slate-50 text-slate-900 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${errors.email ? 'border-red-500' : 'border-slate-200'}`}
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {activeTab === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Profession</label>
              <select
                className="w-full px-4 py-2 bg-slate-50 text-slate-900 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                value={formData.profession_id}
                onChange={e => setFormData({ ...formData, profession_id: parseInt(e.target.value) })}
                disabled={professions.length === 0}
              >
                {professions.length === 0 ? (
                  <option value={0}>Loading professions...</option>
                ) : (
                  professions.map(prof => (
                    <option key={prof.id} value={prof.id}>{prof.name}</option>
                  ))
                )}
              </select>
            </div>
          )}

          <div className="relative">
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className={`w-full px-4 py-2 bg-slate-50 text-slate-900 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none transition-all pr-10 ${errors.password ? 'border-red-500' : 'border-slate-200'}`}
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          {activeTab === 'signup' && (
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                className={`w-full px-4 py-2 bg-slate-50 text-slate-900 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none transition-all pr-10 ${errors.confirmPassword ? 'border-red-500' : 'border-slate-200'}`}
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg shadow-md transition-all active:scale-[0.98] mt-4"
          >
            {isLoading ? 'Please wait...' : (activeTab === 'signup' ? 'Create Account' : 'Welcome Back')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
