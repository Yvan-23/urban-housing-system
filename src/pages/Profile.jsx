import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  ShieldCheck, 
  Camera, 
  MapPin, 
  Calendar,
  Save,
  CheckCircle2,
  Lock
} from 'lucide-react';

const Profile = () => {
  const { user, role } = useAuth();
  const { showNotification } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '555-0123',
    organization: user?.organization || 'Ministry of Housing',
    department: user?.department || 'Urban Planning Division',
    location: 'Central Headquarters, District 1',
  });

  const handleSave = (e) => {
    e.preventDefault();
    setIsEditing(false);
    showNotification("Profile updated successfully", "success");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header / Cover */}
      <div className="relative h-48 bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        <div className="absolute bottom-0 left-0 w-full p-8 flex items-end gap-6 bg-gradient-to-t from-black/50 to-transparent">
          <div className="relative group">
            <div className="w-32 h-32 rounded-2xl bg-white p-1 shadow-xl">
              <div className="w-full h-full rounded-xl bg-secondary-100 flex items-center justify-center overflow-hidden relative">
                <User size={64} className="text-secondary-400" />
                <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera size={24} />
                </button>
              </div>
            </div>
          </div>
          <div className="mb-2 text-white">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              {formData.name}
              <CheckCircle2 size={20} className="text-emerald-400" />
            </h1>
            <p className="text-primary-100 flex items-center gap-2 mt-1">
              <Briefcase size={16} />
              {role}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Quick Info */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-bold text-lg mb-4">Account Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-secondary-500 text-sm">Verification</span>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold rounded-full uppercase">Verified</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-500 text-sm">MFA Status</span>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold rounded-full uppercase">Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-500 text-sm">Security Level</span>
                <span className="text-primary-600 dark:text-primary-400 text-xs font-bold">Government Tier-1</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-bold text-lg mb-4">System Access</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary-50 dark:bg-secondary-800/50">
                <ShieldCheck size={18} className="text-primary-600" />
                <span className="text-sm font-medium">GIS Visualization</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary-50 dark:bg-secondary-800/50">
                <ShieldCheck size={18} className="text-primary-600" />
                <span className="text-sm font-medium">Housing Analytics</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary-50 dark:bg-secondary-800/50">
                <ShieldCheck size={18} className="text-primary-600" />
                <span className="text-sm font-medium">Scenario Simulation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Profile Details */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl">Personal Information</h3>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="btn-secondary text-sm flex items-center gap-2"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-secondary-500 flex items-center gap-2">
                    <User size={14} /> Full Name
                  </label>
                  <input 
                    type="text" 
                    disabled={!isEditing}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-70 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-secondary-500 flex items-center gap-2">
                    <Mail size={14} /> Official Email
                  </label>
                  <input 
                    type="email" 
                    disabled={true}
                    value={formData.email}
                    className="w-full bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl py-2.5 px-4 outline-none opacity-70 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-secondary-500 flex items-center gap-2">
                    <Phone size={14} /> Phone Number
                  </label>
                  <input 
                    type="tel" 
                    disabled={!isEditing}
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-70 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-secondary-500 flex items-center gap-2">
                    <MapPin size={14} /> Office Location
                  </label>
                  <input 
                    type="text" 
                    disabled={!isEditing}
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-70 transition-all"
                  />
                </div>
              </div>

              <div className="border-t border-secondary-100 dark:border-secondary-800 pt-6">
                <h4 className="font-bold text-lg mb-4">Organizational Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-secondary-500 flex items-center gap-2">
                      <Building2 size={14} /> Organization
                    </label>
                    <input 
                      type="text" 
                      disabled={true}
                      value={formData.organization}
                      className="w-full bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl py-2.5 px-4 outline-none opacity-70 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-secondary-500 flex items-center gap-2">
                      <Briefcase size={14} /> Department
                    </label>
                    <input 
                      type="text" 
                      disabled={true}
                      value={formData.department}
                      className="w-full bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl py-2.5 px-4 outline-none opacity-70 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-end pt-4"
                >
                  <button type="submit" className="btn-primary flex items-center gap-2 px-8 py-3 rounded-xl shadow-lg shadow-primary-500/20">
                    <Save size={18} />
                    Save Changes
                  </button>
                </motion.div>
              )}
            </form>
          </div>

          <div className="card border-red-100 dark:border-red-900/30">
            <h3 className="font-bold text-lg text-red-600 mb-4 flex items-center gap-2">
              <Lock size={18} />
              Danger Zone
            </h3>
            <p className="text-sm text-secondary-500 mb-4">
              Deleting your account will permanently remove all access to government housing data and scenario simulations. This action cannot be undone.
            </p>
            <button className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-bold transition-colors">
              Request Account Deletion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
