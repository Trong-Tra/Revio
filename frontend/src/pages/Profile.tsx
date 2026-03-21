import React, { useState } from 'react';
import { Edit3, PlusCircle, ChevronDown, ArrowRight, LogOut, Check, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ViewState } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useUserPapers } from '../hooks/useUserPapers';
import { ProfilePaperCard } from '../components/profile/ProfilePaperCard';
import { authApi } from '../api/client';

interface EditableFieldProps {
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
}

const EditableField: React.FC<EditableFieldProps> = ({ label, value, isEditing, onChange, placeholder }) => {
  if (isEditing) {
    return (
      <div className="space-y-1">
        <span className="font-label text-[10px] uppercase tracking-tighter text-on-surface-variant">{label}</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
        />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <span className="font-label text-[10px] uppercase tracking-tighter text-on-surface-variant">{label}</span>
      <p className="text-on-surface font-medium">{value || <span className="text-outline italic">Not set</span>}</p>
    </div>
  );
};

export default function Profile({ setView }: { setView?: (v: ViewState) => void }) {
  const navigate = useNavigate();
  const { user, signOut, setUser } = useAuth();
  const { papers, isLoading } = useUserPapers(user?.id);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Editable form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    affiliation: user?.affiliation || '',
    bio: user?.bio || '',
    location: user?.location || '',
  });

  const handleLogout = async () => {
    await signOut();
    navigate('/signin');
  };

  const handleViewPaper = (paperId: string) => {
    navigate(`/paper/${paperId}`);
  };

  const handleEdit = () => {
    setFormData({
      name: user?.name || '',
      affiliation: user?.affiliation || '',
      bio: user?.bio || '',
      location: user?.location || '',
    });
    setIsEditing(true);
    setSaveError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSaveError(null);
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      const updatedUser = await authApi.updateProfile({
        name: formData.name,
        affiliation: formData.affiliation,
        bio: formData.bio,
        location: formData.location,
      });
      
      // Update local user state
      setUser(prev => prev ? { ...prev, ...updatedUser } : null);
      setIsEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof typeof formData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen pb-24">
      <main className="pt-24 px-8 max-w-7xl mx-auto">
        {/* Basic Info (Asymmetric Layout) */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative flex flex-col md:flex-row gap-16 lg:gap-24 items-start mb-32"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="absolute top-0 right-0 bg-red-500/10 text-red-700 border border-red-500/30 px-6 py-2.5 rounded-full font-headline text-sm font-semibold hover:bg-red-500/20 active:scale-95 transition-all inline-flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </motion.button>

          <div className="relative group shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-48 h-48 rounded-xl overflow-hidden shadow-[0px_12px_32px_rgba(26,28,28,0.06)] bg-surface-container-high"
            >
              <img 
                src={user?.avatarUrl || 'https://picsum.photos/seed/researcher/400/400'} 
                alt={user?.name || 'Researcher'} 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
              />
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="absolute -bottom-4 -right-4 w-12 h-12 bg-gradient-to-br from-primary to-primary-container rounded-full flex items-center justify-center text-on-primary shadow-lg active:scale-95 transition-transform hover:shadow-xl"
            >
              <Edit3 className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="flex-1 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <span className="font-label text-xs uppercase tracking-widest text-primary mb-2 block">Principal Researcher</span>
              
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name')(e.target.value)}
                  placeholder="Your name"
                  className="w-full text-5xl lg:text-6xl font-extrabold font-headline tracking-tight text-on-surface bg-transparent border-b-2 border-outline-variant/30 focus:border-primary focus:outline-none transition-colors pb-2"
                />
              ) : (
                <h1 className="text-5xl lg:text-6xl font-extrabold font-headline tracking-tight text-on-surface">
                  {user?.name || 'Your Name'}
                </h1>
              )}
              
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleChange('bio')(e.target.value)}
                  placeholder="Brief bio or research interests"
                  rows={2}
                  className="w-full text-lg text-on-surface-variant font-light mt-2 bg-transparent border border-outline-variant/30 rounded-lg px-3 py-2 focus:border-primary focus:outline-none transition-colors resize-none"
                />
              ) : (
                <p className="text-xl text-on-surface-variant font-light mt-2">
                  {user?.bio || 'Add your bio...'}
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 max-w-2xl"
            >
              <EditableField
                label="Email Address"
                value={user?.email || ''}
                isEditing={false}
                onChange={() => {}}
              />
              <EditableField
                label="Affiliation"
                value={isEditing ? formData.affiliation : (user?.affiliation || '')}
                isEditing={isEditing}
                onChange={handleChange('affiliation')}
                placeholder="University or Institution"
              />
              <EditableField
                label="Location"
                value={isEditing ? formData.location : (user?.location || '')}
                isEditing={isEditing}
                onChange={handleChange('location')}
                placeholder="City, Country"
              />
              <div className="space-y-1">
                <span className="font-label text-[10px] uppercase tracking-tighter text-on-surface-variant">Role</span>
                <p className="text-on-surface font-medium capitalize">{user?.role || 'Researcher'}</p>
              </div>
            </motion.div>

            {/* Error message */}
            {saveError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 text-red-700 rounded-lg text-sm"
              >
                {saveError}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="flex gap-4 pt-4"
            >
              {isEditing ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-2.5 rounded-full font-headline text-sm font-semibold shadow-md active:scale-95 transition-all inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="bg-surface-container-low text-on-surface border border-outline-variant/20 px-6 py-2.5 rounded-full font-headline text-sm font-semibold hover:bg-surface-container-high active:scale-95 transition-all inline-flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleEdit}
                    className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-2.5 rounded-full font-headline text-sm font-semibold shadow-md active:scale-95 transition-all inline-flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-surface-container-low text-on-surface border border-outline-variant/20 px-6 py-2.5 rounded-full font-headline text-sm font-semibold hover:bg-surface-container-high active:scale-95 transition-all"
                  >
                    View Analytics
                  </motion.button>
                </>
              )}
            </motion.div>
          </div>
        </motion.section>

        {/* Uploaded Papers (Bento Grid) */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <div className="flex items-end justify-between mb-12">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold font-headline tracking-tight">My Uploaded Papers</h2>
              <p className="text-on-surface-variant text-sm">Managing {papers.length} active research contributions</p>
            </div>
            <div className="flex items-center gap-2 text-outline-variant font-label text-xs uppercase tracking-widest">
              <span>Sort By:</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="text-primary font-bold flex items-center"
              >
                Recent <ChevronDown className="w-4 h-4 ml-1" />
              </motion.button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ repeat: Infinite, duration: 1.5 }}
                  className="h-[340px] bg-surface-container-low rounded-xl"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {papers.map((paper, index) => (
                  <motion.div
                    key={paper.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <ProfilePaperCard paper={paper} onViewDetails={handleViewPaper} />
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Upload New Manuscript */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: papers.length * 0.1, duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
                className="bg-surface-container-low rounded-xl p-6 flex items-center justify-center border-2 border-dashed border-outline-variant/40 group cursor-pointer hover:border-primary/40 hover:bg-surface-container-lowest transition-all h-[340px]"
                onClick={() => navigate('/upload')}
              >
                <div className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  >
                    <PlusCircle className="w-10 h-10 text-outline-variant group-hover:text-primary mx-auto mb-3 transition-colors" />
                  </motion.div>
                  <span className="font-label font-bold text-sm text-on-surface-variant group-hover:text-primary uppercase tracking-wider transition-colors">Upload New Manuscript</span>
                </div>
              </motion.div>
            </div>
          )}
        </motion.section>
      </main>
    </div>
  );
}
