import React from 'react';
import { BarChart3, Users, Calculator, TrendingUp, ArrowRight, CheckCircle, Zap, Shield, Clock, Star } from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {
  const features = [
    {
      icon: BarChart3,
      title: 'Smart Analytics',
      description: 'AI-powered insights with beautiful visualizations and real-time reporting',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Process thousands of transactions in seconds with our optimized engine',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Shield,
      title: 'Bank-Grade Security',
      description: 'Enterprise-level encryption and compliance with international standards',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Clock,
      title: 'Automated Workflows',
      description: 'Save 80% time with intelligent automation and smart reconciliation',
      gradient: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <BarChart3 className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-bold text-white">Accounting Pro</h1>
            </div>
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Launch Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-md rounded-full px-6 py-2 mb-8 border border-white/20">
            <Star className="text-yellow-400 mr-2" size={16} />
            <span className="text-white text-sm font-medium">Trusted by 10,000+ businesses worldwide</span>
          </div>
          <h1 className="text-7xl font-bold text-white mb-8 leading-tight">
            The Future of
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"> Accounting</span>
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Experience the next generation of financial management with AI-powered insights, 
            automated workflows, and beautiful visualizations that make accounting effortless.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-1 inline-flex items-center justify-center"
            >
              Start Free Trial
              <ArrowRight className="ml-2" size={20} />
            </button>
            <button className="bg-white/10 backdrop-blur-md text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold text-white mb-6">Powerful Features</h2>
          <p className="text-xl text-gray-300">Built for modern businesses that demand excellence</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="group relative">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 bg-white/5 backdrop-blur-md py-20 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">10K+</div>
              <div className="text-gray-300">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">99.9%</div>
              <div className="text-gray-300">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">$2B+</div>
              <div className="text-gray-300">Processed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">150+</div>
              <div className="text-gray-300">Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Join thousands of businesses already using our platform
          </p>
          <button
            onClick={onGetStarted}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-12 py-5 rounded-xl text-xl font-bold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-1 inline-flex items-center"
          >
            Get Started Now
            <ArrowRight className="ml-3" size={24} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-black/20 backdrop-blur-md border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
              <BarChart3 className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold text-white">Accounting Pro</span>
          </div>
          <div className="text-center text-gray-400">
            © 2024 Accounting Pro. Crafted with ❤️ for modern businesses.
          </div>
        </div>
      </footer>
    </div>
  );
};

// Add custom CSS for animation delays
const style = document.createElement('style');
style.textContent = `
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  .animation-delay-4000 {
    animation-delay: 4s;
  }
`;
document.head.appendChild(style);

export default LandingPage;