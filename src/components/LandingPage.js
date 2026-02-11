import React from 'react';
import { BarChart3, ArrowRight, CheckCircle, TrendingUp, Users, Calculator, Shield, Zap, Star } from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {
  const features = [
    {
      icon: '/smart-dashboard.jpg',
      title: 'Smart Dashboard',
      description: 'Get real-time insights into your financial performance with intuitive charts and metrics',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      icon: '/account-management.webp',
      title: 'Account Management',
      description: 'Organize and track all your business accounts with automated categorization',
      color: 'bg-green-50 border-green-200'
    },
    {
      icon: '/professional-reports.jpeg',
      title: 'Professional Reports',
      description: 'Generate comprehensive financial reports with just one click',
      color: 'bg-purple-50 border-purple-200'
    },
    {
      icon: '/secure%20and%20reliable.jpeg',
      title: 'Secure & Reliable',
      description: 'Bank-level security with automated backups and data protection',
      color: 'bg-orange-50 border-orange-200'
    },
    {
      icon: '/mobile-ready.jpeg',
      title: 'Mobile Ready',
      description: 'Access your accounts anywhere with our responsive design',
      color: 'bg-indigo-50 border-indigo-200'
    },
    {
      icon: '/fast%20and%20efficient.jpeg',
      title: 'Fast & Efficient',
      description: 'Lightning-fast performance with cloud-based infrastructure',
      color: 'bg-indigo-50 border-yellow-200'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Active Users' },
    { number: '₹50Cr+', label: 'Transactions Processed' },
    { number: '99.9%', label: 'Uptime' },
    { number: '24/7', label: 'Support' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-slate-800 shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3">
                <BarChart3 className="text-slate-800" size={24} />
              </div>
              <span className="text-xl font-bold text-white">Accounting</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={onGetStarted}
                className="bg-white text-slate-800 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-24 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-left">
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  Modern <span className="text-slate-800">Accounting</span> Made Simple
                </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Streamline your business finances with our powerful yet easy-to-use accounting platform. 
                  Track expenses, manage accounts, and generate reports in minutes.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <button
                    onClick={onGetStarted}
                    className="bg-slate-800 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-slate-900 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Start Free Trial
                  </button>
                  <button className="bg-white text-slate-800 border-2 border-slate-800 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all shadow-lg">
                    Watch Demo
                  </button>
                </div>

                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <span>⭐⭐⭐⭐⭐</span>
                    <span>4.9/5 rating</span>
                  </div>
                  <div>✅ No credit card required</div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-8 border">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-800">Dashboard Overview</h3>
                      <div className="w-3 h-3 bg-slate-800 rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-slate-800">
                        <p className="text-sm text-gray-600">Revenue</p>
                        <p className="text-2xl font-bold text-slate-800">₹2.5L</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-slate-800">
                        <p className="text-sm text-gray-600">Profit</p>
                        <p className="text-2xl font-bold text-slate-800">₹85K</p>
                      </div>
                    </div>
                    <div className="bg-slate-800 h-32 rounded-lg flex items-center justify-center">
                      <BarChart3 className="text-white" size={48} />
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-slate-800 text-white p-3 rounded-full shadow-lg">
                  <span className="text-xl">💡</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-white font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need to Succeed</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed to help you manage your business finances efficiently and grow your business
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className={`p-8 bg-white rounded-2xl shadow-sm border-2 ${feature.color} hover:shadow-lg transition-all duration-300 hover:-translate-y-2`}>
                <div className="mb-4">
                  {feature.icon.startsWith('/') ? (
                    <img src={feature.icon} alt={feature.title} className="w-full h-48 object-cover rounded-lg" />
                  ) : (
                    <div className="text-4xl">{feature.icon}</div>
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted by Businesses</h2>
            <p className="text-xl text-gray-600">See what our customers have to say</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-lg border">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  R
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Rajesh Kumar</h4>
                  <p className="text-gray-600 text-sm">Small Business Owner</p>
                </div>
              </div>
              <p className="text-gray-600 italic">"NextBook Cloud transformed how I manage my business finances. Simple, powerful, and reliable!"</p>
              <div className="mt-4 text-yellow-500">⭐⭐⭐⭐⭐</div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg border">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  P
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Priya Sharma</h4>
                  <p className="text-gray-600 text-sm">Freelancer</p>
                </div>
              </div>
              <p className="text-gray-600 italic">"The reporting features are amazing. I can generate professional reports in seconds!"</p>
              <div className="mt-4 text-yellow-500">⭐⭐⭐⭐⭐</div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg border">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  A
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Amit Patel</h4>
                  <p className="text-gray-600 text-sm">Startup Founder</p>
                </div>
              </div>
              <p className="text-gray-600 italic">"Perfect for startups! Easy to use and scales with our growing business needs."</p>
              <div className="mt-4 text-yellow-500">⭐⭐⭐⭐⭐</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-200">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to Transform Your Business?</h2>
            <p className="text-xl text-gray-600 mb-8">Join thousands of businesses already using NextBook Cloud to streamline their finances</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={onGetStarted}
                className="bg-white text-slate-800 px-10 py-4 rounded-xl text-xl font-semibold hover:bg-gray-100 transition-all shadow-lg"
              >
                Start Free Trial
              </button>
              <button
                onClick={onGetStarted}
                className="bg-slate-700 text-white px-10 py-4 rounded-xl text-xl font-semibold hover:bg-slate-900 transition-all shadow-lg"
              >
                Get Started
              </button>
            </div>
            
            <p className="text-gray-500 text-sm">✅ 14-day free trial • ✅ No setup fees • ✅ Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Footer */}
     <footer className="bg-gray-900 py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          {/* Left - Main Text */}
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Innovate. Build.<br/>
              Transform. Together.
            </h2>
            <p className="text-gray-400 text-base sm:text-lg mt-4 sm:mt-6">
              info@nextsphere.co.in<br/>
              +91 9078027948
            </p>
          </div>
          
          {/* Right - Social Links */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 lg:space-x-8">
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">
              WhatsApp
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">
              Instagram
            </a>
            <a href="https://www.linkedin.com/company/nsptai" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">
              LinkedIn
            </a>
          </div>
        </div>
        
        {/* Copyright */}
       
<div className="border-t border-gray-800 mt-8 pt-6 text-center">
  <p className="text-gray-400 text-sm">
    © 2026 NextBook Cloud. All rights reserved. Developed by{" "}
    <a
      href="https://nextsphere.co.in/"
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-white transition-colors"
    >
      NextSphere
    </a>
  </p>
</div>

      </div>
    </footer>
    </div>
  );
};

export default LandingPage;