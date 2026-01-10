import React, { useState } from 'react';
import { BarChart3, Mail, Lock, User, Eye, EyeOff, Building } from 'lucide-react';

const Signup = ({ onSignup, onSwitchToLogin, onBackToLanding }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    workEmail: '',
    companyName: '',
    companySize: '',
    annualTurnover: '',
    role: 'user'
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.workEmail.trim()) newErrors.workEmail = 'Work email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.workEmail)) newErrors.workEmail = 'Invalid email format';
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.companySize) newErrors.companySize = 'Number of employees is required';
    if (!formData.annualTurnover) newErrors.annualTurnover = 'Annual turnover is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      const response = await fetch('http://localhost:5001/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIsSubmitted(true);
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (error) {
      alert('Network error. Please check if backend is running.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="w-full max-w-md mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <button 
            onClick={onBackToLanding}
            className="inline-flex items-center mb-6 text-gray-600 hover:text-slate-800 transition-colors"
          >
            ← Back to Home
          </button>
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <BarChart3 className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join thousands of businesses managing their accounting</p>
        </div>

        {isSubmitted ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="text-green-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
            <p className="text-gray-600 mb-6">
              We've sent an account activation link to <strong>{formData.workEmail}</strong>. 
              Click the link in the email to set your password and activate your account.
            </p>
            <button 
              onClick={onSwitchToLogin}
              className="text-slate-800 hover:text-slate-600 font-medium transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all ${
                      errors.fullName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
              </div>

              {/* Work Email */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Work Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={formData.workEmail}
                    onChange={(e) => setFormData({...formData, workEmail: e.target.value})}
                    className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all ${
                      errors.workEmail ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your work email"
                  />
                </div>
                {errors.workEmail && <p className="text-red-500 text-sm mt-1">{errors.workEmail}</p>}
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Company Name</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all ${
                      errors.companyName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your company name"
                  />
                </div>
                {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
              </div>

              {/* Total Employees */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Total Number of Employees</label>
                <select
                  value={formData.companySize}
                  onChange={(e) => setFormData({...formData, companySize: e.target.value})}
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all ${
                    errors.companySize ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select employee count</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="500+">500+ employees</option>
                </select>
                {errors.companySize && <p className="text-red-500 text-sm mt-1">{errors.companySize}</p>}
              </div>

              {/* Annual Turnover */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Annual Company Turnover</label>
                <select
                  value={formData.annualTurnover}
                  onChange={(e) => setFormData({...formData, annualTurnover: e.target.value})}
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all ${
                    errors.annualTurnover ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select annual turnover</option>
                  <option value="<1M">Less than $1M</option>
                  <option value="1M-5M">$1M - $5M</option>
                  <option value="5M-10M">$5M - $10M</option>
                  <option value="10M-50M">$10M - $50M</option>
                  <option value="50M+">$50M+</option>
                </select>
                {errors.annualTurnover && <p className="text-red-500 text-sm mt-1">{errors.annualTurnover}</p>}
              </div>

              {/* Account Type */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Account Type</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="role"
                      value="user"
                      checked={formData.role === 'user'}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-4 h-4 text-slate-800 bg-white border-gray-300 focus:ring-slate-800"
                    />
                    <span className="ml-2 text-sm text-gray-700">User Account</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="role"
                      value="manager"
                      checked={formData.role === 'manager'}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-4 h-4 text-slate-800 bg-white border-gray-300 focus:ring-slate-800"
                    />
                    <span className="ml-2 text-sm text-gray-700">Manager Account</span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-slate-800 text-white py-3 rounded-xl font-semibold hover:bg-slate-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Create Account
              </button>
            </form>

            {/* Login Link */}
            <div className="text-center mt-6">
              <span className="text-gray-600">Already have an account? </span>
              <button 
                onClick={onSwitchToLogin}
                className="text-slate-800 hover:text-slate-600 font-medium transition-colors"
              >
                Sign in
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;