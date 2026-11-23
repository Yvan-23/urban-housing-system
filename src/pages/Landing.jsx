import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BrainCircuit, 
  ArrowRight, 
  Building2, 
  ShieldCheck, 
  Map as MapIcon, 
  LineChart, 
  Database,
  Globe,
  CheckCircle2,
  Users
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const features = [
    { 
      title: "Predictive Analytics", 
      desc: "Forecast housing demand with 98% accuracy using deep learning models.",
      icon: LineChart,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    { 
      title: "GIS Visualization", 
      desc: "Interactive multi-layer mapping for spatial urban planning and zoning.",
      icon: MapIcon,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    { 
      title: "Decision Intelligence", 
      desc: "Data-backed policy recommendations for city administrators.",
      icon: BrainCircuit,
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-secondary-950 font-outfit overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-secondary-950/80 backdrop-blur-md border-b border-secondary-100 dark:border-secondary-900">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary-600 rounded-lg">
              <BrainCircuit className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold text-secondary-900 dark:text-white">UrbanAI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-secondary-600 dark:text-secondary-400 hover:text-primary-600 transition-colors">Features</a>
            <a href="#about" className="text-sm font-medium text-secondary-600 dark:text-secondary-400 hover:text-primary-600 transition-colors">About</a>
            <button 
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 bg-primary-600 text-white rounded-full font-bold text-sm shadow-lg shadow-primary-500/20 hover:bg-primary-700 active:scale-95 transition-all"
            >
              Portal Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src="/city_planning_landing_hero_1778334541072.png" 
            alt="Futuristic City" 
            className="w-full h-full object-cover opacity-10 dark:opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-white dark:from-secondary-950 dark:via-secondary-950/80 dark:to-secondary-950"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center lg:text-left">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-full border border-primary-100 dark:border-primary-800 text-primary-700 dark:text-primary-400 font-bold text-xs uppercase tracking-widest"
              >
                <ShieldCheck size={14} />
                Official Urban Intelligence Platform
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl lg:text-7xl font-black text-secondary-900 dark:text-white leading-[1.1]"
              >
                Architecting the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">Future of Housing.</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-secondary-600 dark:text-secondary-400 max-w-xl leading-relaxed"
              >
                Leverage advanced AI analytics, real-time spatial data, and predictive simulations to build sustainable, affordable, and thriving urban environments.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-4 pt-4"
              >
                <button 
                  onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                  className="w-full sm:w-auto px-10 py-4 bg-primary-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-primary-500/30 hover:bg-primary-700 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                >
                  {isAuthenticated ? 'Return to Dashboard' : 'Enter Portal'}
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="w-full sm:w-auto px-10 py-4 border-2 border-secondary-100 dark:border-secondary-800 text-secondary-700 dark:text-secondary-300 rounded-2xl font-bold text-lg hover:bg-secondary-50 dark:hover:bg-secondary-900 transition-all">
                  Request Demo
                </button>
              </motion.div>

              <div className="flex items-center gap-8 pt-8">
                 <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-secondary-950 bg-secondary-200 dark:bg-secondary-800 flex items-center justify-center text-[10px] font-bold">
                        P{i}
                      </div>
                    ))}
                 </div>
                 <p className="text-xs text-secondary-500 font-medium">
                    Trusted by <span className="text-primary-600 dark:text-primary-400 font-bold">24+ Municipalities</span> <br />
                    nationwide for data-driven planning.
                 </p>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="flex-1 relative"
            >
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-white/20">
                <img 
                  src="/city_planning_landing_hero_1778334541072.png" 
                  alt="City Overview" 
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="absolute top-4 left-4 p-4 bg-white/90 dark:bg-secondary-900/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 animate-bounce-slow">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><CheckCircle2 size={18} /></div>
                      <div>
                        <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider">Demand Accuracy</p>
                        <p className="text-sm font-bold text-secondary-900 dark:text-white">98.4% Efficiency</p>
                      </div>
                   </div>
                </div>
              </div>
              
              {/* Floating Decorative Elements */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-accent-500/20 rounded-full blur-3xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 px-6 bg-secondary-50/50 dark:bg-secondary-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold text-secondary-900 dark:text-white">Integrated Solutions for Modern Cities</h2>
            <p className="text-secondary-500 max-w-2xl mx-auto leading-relaxed">
              Our platform combines four core intelligence modules to provide a holistic view of urban housing health and growth potential.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="p-8 bg-white dark:bg-secondary-900 rounded-3xl border border-secondary-100 dark:border-secondary-800 shadow-sm transition-all"
              >
                <div className={`w-14 h-14 ${f.bg} ${f.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <f.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-4">{f.title}</h3>
                <p className="text-secondary-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-secondary-100 dark:border-secondary-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <BrainCircuit size={20} />
            <span className="text-sm font-bold">UrbanAI Intelligence</span>
          </div>
          <div className="flex items-center gap-8 text-xs font-bold text-secondary-400 uppercase tracking-widest">
            <span>© 2024</span>
            <a href="#" className="hover:text-primary-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-primary-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
