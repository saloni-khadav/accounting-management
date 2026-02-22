import React, { useState } from 'react';
import { BarChart3, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Login = ({ onLogin, onSwitchToSignup, onBackToLanding }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin();
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto px-6 relative">
        {/* Back Button */}
        <div className="absolute top-0 left-0">
          <button 
            onClick={onBackToLanding}
            className="inline-flex items-center text-gray-600 hover:text-slate-800 transition-colors"
          >
            ← Back to Home
          </button>
        </div>

        {/* Login Form - Centered */}
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-600">Sign in to your account</p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full pl-10 pr-12 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Login as</label>
                  <div className="bg-gray-50 p-3 rounded-lg mb-2">
                    <p className="text-xs text-gray-600 mb-2">⚠️ You can only login with the role assigned to your account</p>
                  </div>
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
                      <span className="ml-2 text-sm text-gray-700">User</span>
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
                      <span className="ml-2 text-sm text-gray-700">Manager</span>
                    </label>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="w-4 h-4 text-slate-800 bg-white border-gray-300 rounded focus:ring-slate-800" />
                    <span className="ml-2 text-sm text-gray-700">Remember me</span>
                  </label>
                  <button type="button" className="text-sm text-slate-800 hover:text-slate-600 transition-colors">
                    Forgot password?
                  </button>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-800 text-white py-3 rounded-xl font-semibold hover:bg-slate-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              {/* Sign Up Link */}
              <div className="text-center mt-6">
                <span className="text-gray-600">Don't have an account? </span>
                <button 
                  onClick={onSwitchToSignup}
                  className="text-slate-800 hover:text-slate-600 font-medium transition-colors"
                >
                  Sign up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
