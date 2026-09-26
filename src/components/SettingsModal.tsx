
import React, { useState, useRef, useEffect } from 'react';
import { X, User, Bell, Moon, LogOut, Save, Camera, Upload, Loader2, ShieldCheck, Mail, Linkedin, AlignLeft, Smartphone, Zap, GraduationCap, Book } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any; // Accepts User or the Staff synthetic object
  onLogout: () => void;
  onUpdate: (updatedData: any) => Promise<void>;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, user, onLogout, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');
  
  // Profile State
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar);
  const [bio, setBio] = useState(user.bio || '');
  const [skills, setSkills] = useState(user.skills || '');
  const [linkedin, setLinkedin] = useState(user.linkedin || '');
  
  // Student Specific State
  const [srn, setSrn] = useState(user.srn || '');
  const [degree, setDegree] = useState(user.degree || '');
  const [program, setProgram] = useState(user.program || '');
  
  // Security State
  const [emailLinked, setEmailLinked] = useState(user.emailLinked || false);
  const [twoFactor, setTwoFactor] = useState(user.twoFactorEnabled || false);
  const [linkEmailInput, setLinkEmailInput] = useState('');
  
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(user.name);
      setAvatar(user.avatar);
      setBio(user.bio || '');
      setSkills(user.skills || '');
      setLinkedin(user.linkedin || '');
      setSrn(user.srn || '');
      setDegree(user.degree || '');
      setProgram(user.program || '');
      setEmailLinked(user.emailLinked || false);
      setTwoFactor(user.twoFactorEnabled || false);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const updatePayload: any = { 
        name, 
        avatar,
        bio,
        skills,
        linkedin,
        emailLinked,
        twoFactorEnabled: twoFactor
    };

    // Add student specific fields if they were edited
    if (user.type === 'university') {
        updatePayload.srn = srn;
        updatePayload.degree = degree;
        updatePayload.program = program;
    }

    await onUpdate(updatePayload);
    setSaving(false);
    onClose();
  };

  const isStaff = user.type === 'staff';
  const isUniversity = user.type === 'university';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose}></div>
      <div role="dialog" aria-modal="true" className="relative flex w-full max-w-2xl max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 animate-slide-up">

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
             <h2 className="font-display text-xl font-semibold text-slate-900">Settings</h2>
             <p className="mt-1 text-sm text-slate-500">Manage your account and preferences</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
          {/* Sidebar */}
          <div className="flex shrink-0 flex-row gap-1 overflow-x-auto border-b border-slate-200 bg-white p-2 md:w-1/3 md:flex-col md:overflow-visible md:border-b-0 md:border-r md:p-4">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex flex-1 items-center justify-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors md:w-full md:flex-none md:justify-start ${
                activeTab === 'profile' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <User className="h-4 w-4" aria-hidden="true" />
              <span>Profile</span>
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`flex flex-1 items-center justify-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors md:w-full md:flex-none md:justify-start ${
                activeTab === 'security' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <span>Security</span>
            </button>
            <button 
              onClick={() => setActiveTab('preferences')}
              className={`flex flex-1 items-center justify-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors md:w-full md:flex-none md:justify-start ${
                activeTab === 'preferences' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Bell className="h-4 w-4" aria-hidden="true" />
              <span>Preferences</span>
            </button>
            <div className="hidden md:block mt-4 border-t border-slate-200 pt-4">
               <button
                onClick={onLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="md:w-2/3 p-6 md:p-8 overflow-y-auto">
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex flex-col items-center mb-6">
                   <div 
                      className="group relative mb-3 h-28 w-28 cursor-pointer overflow-hidden rounded-full ring-1 ring-slate-200"
                      onClick={() => fileInputRef.current?.click()}
                   >
                     <img src={avatar} alt={name} className="h-full w-full object-cover" />
                     <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 opacity-0 transition-opacity group-hover:opacity-100">
                        <Camera className="h-6 w-6 text-white" aria-hidden="true" />
                     </div>
                   </div>
                   <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                   <button
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700 hover:underline underline-offset-4"
                    >
                      Change Picture
                   </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
                        <input 
                          type="text" 
                          value={name} 
                          onChange={(e) => setName(e.target.value)}
                          className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500" 
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Unique ID</label>
                        <input type="text" defaultValue={user.id} disabled className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500" />
                      </div>
                  </div>

                  {isUniversity && (
                      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-5">
                          <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><GraduationCap className="h-4 w-4 text-brand-500" aria-hidden="true" /> Academic Details</h4>
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">SRN / University ID</label>
                            <input 
                                type="text" 
                                value={srn} 
                                onChange={(e) => setSrn(e.target.value)}
                                className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500" 
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Degree</label>
                                <select 
                                    value={degree}
                                    onChange={(e) => setDegree(e.target.value)}
                                    className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                                >
                                    <option value="B.Tech Account">B.Tech</option>
                                    <option value="M.Tech Account">M.Tech</option>
                                    <option value="PhD Account">PhD</option>
                                    <option value="Faculty Account">Faculty</option>
                                </select>
                              </div>
                              <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Program</label>
                                <input 
                                    type="text" 
                                    value={program} 
                                    onChange={(e) => setProgram(e.target.value)}
                                    className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500" 
                                />
                              </div>
                          </div>
                      </div>
                  )}

                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700"><AlignLeft className="h-4 w-4 text-slate-400" aria-hidden="true" /> Bio</label>
                    <textarea 
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us a bit about yourself..."
                        rows={3}
                        className="min-h-[120px] block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                    ></textarea>
                  </div>

                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700"><Zap className="h-4 w-4 text-slate-400" aria-hidden="true" /> Skills (Comma separated)</label>
                    <input 
                      type="text" 
                      value={skills} 
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="e.g. IoT, 3D Printing, Python"
                      className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500" 
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700"><Linkedin className="h-4 w-4 text-slate-400" aria-hidden="true" /> LinkedIn Profile</label>
                    <input 
                      type="url" 
                      value={linkedin} 
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                      className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500" 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                 
                 {/* Email Linking */}
                 <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                    <h3 className="flex items-center gap-2 font-semibold text-blue-900">
                        <Mail className="h-4 w-4" aria-hidden="true" /> Link Email Address
                    </h3>
                    <p className="mt-1 mb-4 text-sm text-blue-800">Link your university email for recovery and notifications.</p>
                    
                    {emailLinked ? (
                        <div className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-white px-3 py-2 text-sm font-medium text-green-700">
                            <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Email Linked
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <input 
                                type="email" 
                                placeholder="name@reva.edu.in"
                                value={linkEmailInput}
                                onChange={(e) => setLinkEmailInput(e.target.value)}
                                className="min-w-0 flex-1 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                            />
                            <button 
                                onClick={() => setEmailLinked(true)}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Link
                            </button>
                        </div>
                    )}
                 </div>

                 {/* 2FA Toggle */}
                 <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                                <Smartphone className="h-4 w-4 text-brand-500" aria-hidden="true" /> Two-Factor Authentication
                            </h3>
                            <p className="mt-1 max-w-[250px] text-sm text-slate-500">Secure your account with TOTP (Authenticator App).</p>
                        </div>
                        <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                            <input type="checkbox" checked={twoFactor} onChange={() => setTwoFactor(!twoFactor)} aria-label="Two-Factor Authentication" className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                        </label>
                    </div>
                    {twoFactor && (
                        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <p className="mb-2 text-xs text-slate-500">Scan this QR code with Google Authenticator:</p>
                            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white text-center text-xs text-slate-500">
                                [QR CODE PLACEHOLDER]
                            </div>
                        </div>
                    )}
                 </div>

                 <div className="border-t border-slate-200 pt-4">
                    <p className="text-xs text-slate-500">Last login: {new Date().toLocaleDateString()} via Mobile App</p>
                 </div>
              </div>
            )}

            {/* PREFERENCES TAB */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                 <div className="space-y-4">
                    <h3 className="border-b border-slate-200 pb-2 font-semibold text-slate-900">Notifications</h3>
                    <label className="flex items-center justify-between cursor-pointer">
                       <span className="text-sm text-slate-700">Email Alerts for Returns</span>
                       <input type="checkbox" defaultChecked className="accent-brand-600 w-4 h-4" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                       <span className="text-sm text-slate-700">New Workshop Announcements</span>
                       <input type="checkbox" defaultChecked className="accent-brand-600 w-4 h-4" />
                    </label>
                 </div>

                 <div className="space-y-4 pt-4">
                    <h3 className="border-b border-slate-200 pb-2 font-semibold text-slate-900">Appearance</h3>
                    <label className="flex items-center justify-between cursor-pointer">
                       <span className="text-sm text-slate-700 flex items-center gap-2"><Moon className="h-4 w-4 text-slate-400" aria-hidden="true" /> Dark Mode (Beta)</span>
                       <input type="checkbox" className="accent-brand-600 w-4 h-4" />
                    </label>
                 </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
           <div className="md:hidden">
              <button onClick={onLogout} className="inline-flex items-center gap-1 py-2 text-sm font-medium text-red-600 transition-colors hover:text-red-700">
                  <LogOut className="h-4 w-4" aria-hidden="true" /> Sign Out
              </button>
           </div>
           <div className="ml-auto flex gap-3">
               <button onClick={onClose} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50">Cancel</button>
               <button 
                 onClick={handleSave} 
                 disabled={saving}
                 className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
               >
                 {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
                 Save
               </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
