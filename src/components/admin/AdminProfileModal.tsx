import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { AppleButton } from '../common/AppleButton';
import { useApp } from '../../context/AppContext';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Building2, 
  ShieldCheck, 
  Image as ImageIcon,
  Check,
  RotateCcw
} from 'lucide-react';
import { ImageUploadField } from '../common/ImageUploadField';

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminProfileModal: React.FC<AdminProfileModalProps> = ({ isOpen, onClose }) => {
  const { adminUser, updateAdminProfile } = useApp();

  const [name, setName] = useState(adminUser.name || 'SWO Admin');
  const [department, setDepartment] = useState(adminUser.department || 'Student Welfare Office');
  const [email, setEmail] = useState(adminUser.email || 'swo.yeshwanthpur@christuniversity.in');
  const [phone, setPhone] = useState(adminUser.phone || '');
  const [avatar, setAvatar] = useState(adminUser.avatar || '/swo-byc-logo.png');
  const [customAvatarInput, setCustomAvatarInput] = useState('');

  const avatarPresets = [
    { label: 'Official SWO Logo', url: '/swo-byc-logo.png' },
    { label: 'Christ Crest', url: '/christ-university-crest.png' },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAdminProfile({
      name: name.trim() || 'SWO Admin',
      department: department.trim(),
      email: email.trim(),
      phone: phone.trim(),
      avatar: avatar.trim() || '/swo-byc-logo.png',
    });
    onClose();
  };

  const handleResetToDefault = () => {
    setName('SWO Admin');
    setDepartment('Student Welfare Office');
    setEmail('swo.yeshwanthpur@christuniversity.in');
    setPhone('');
    setAvatar('/swo-byc-logo.png');
    updateAdminProfile({
      name: 'SWO Admin',
      department: 'Student Welfare Office',
      email: 'swo.yeshwanthpur@christuniversity.in',
      phone: '',
      avatar: '/swo-byc-logo.png',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md" title="SWO Admin Profile">
      <form onSubmit={handleSave} className="space-y-5">
        {/* Profile Card Preview */}
        <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/10 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-white dark:bg-[#1E293B] ring-2 ring-[#0071E3]/30 shadow-md flex items-center justify-center shrink-0">
            <img
              src={avatar}
              alt={name}
              className="w-full h-full object-contain select-none"
              onError={(e) => {
                e.currentTarget.src = '/swo-byc-logo.png';
              }}
            />
          </div>

          <div className="space-y-1 text-center sm:text-left min-w-0 flex-1">
            <h4 className="text-sm font-bold text-[#1D1D1F] dark:text-white truncate">
              {name || 'SWO Admin'}
            </h4>
            <p className="text-xs text-[#86868B] dark:text-slate-400">
              Student Welfare Office • Staff Administrator
            </p>

            <div className="flex items-center gap-1.5 pt-1.5 flex-wrap justify-center sm:justify-start">
              {avatarPresets.map((p) => (
                <button
                  key={p.url}
                  type="button"
                  onClick={() => setAvatar(p.url)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all flex items-center gap-1 ${
                    avatar === p.url
                      ? 'bg-[#0071E3] text-white border-[#0071E3]'
                      : 'bg-white dark:bg-white/10 text-[#1D1D1F] dark:text-white border-black/[0.08] dark:border-white/10 hover:bg-black/[0.04]'
                  }`}
                >
                  {avatar === p.url && <Check className="w-3 h-3" />}
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-[#1D1D1F] dark:text-white block mb-1">
              Display Name *
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-[#86868B] dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. SWO Admin"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#0071E3]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#1D1D1F] dark:text-white block mb-1">
              Department / Office
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-[#86868B] dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Student Welfare Office"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#0071E3]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] dark:text-white block mb-1">
                Official Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#86868B] dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="swo.yeshwanthpur@christuniversity.in"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#0071E3]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] dark:text-white block mb-1">
                Contact Phone (Optional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#86868B] dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 80 4012 9000"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#0071E3]"
                />
              </div>
            </div>
          </div>

          <div>
            <ImageUploadField
              label="Admin Avatar Photograph"
              value={avatar}
              onChange={setAvatar}
              aspectRatio="1:1"
              recommendedDimensions="400 × 400 px"
              description="This is the ratio of the image allowed: 1:1 Square. Balanced symmetrical square ratio ensures portraits look sharp on profile badges."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-black/[0.06] dark:border-white/10 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 text-xs font-medium text-[#86868B] dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>

          <div className="flex items-center gap-2">
            <AppleButton variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancel
            </AppleButton>
            <AppleButton variant="primary" size="sm" type="submit">
              Save Profile
            </AppleButton>
          </div>
        </div>
      </form>
    </Modal>
  );
};
