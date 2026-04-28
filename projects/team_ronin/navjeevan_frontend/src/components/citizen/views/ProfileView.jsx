import { useEffect, useState } from 'react';
import { Edit2, Save, X, User, Mail, Phone, MapPin } from 'lucide-react';
import { fetchUserProfile, updateUserProfile } from '../../../api/userProfile';

export default function ProfileView() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone_number: '',
    region: '',
    special_conditions: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      setError('');
      try {
        const response = await fetchUserProfile();
        const user = response?.data || {};
        setProfileData(user);
        setEditData({
          name: user?.name || '',
          email: user?.email || '',
          phone_number: user?.phone_number || '',
          region: user?.region || '',
          special_conditions: user?.special_conditions || '',
        });
      } catch (err) {
        const message =
          err?.response?.data?.error ||
          err?.response?.data?.detail ||
          err?.message ||
          'Could not load profile.';
        setError(message);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (field, value) => {
    setEditData((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        name: editData.name,
        phone_number: editData.phone_number,
        region: editData.region,
        special_conditions: editData.special_conditions,
      };
      const response = await updateUserProfile(payload);
      const user = response?.data?.user || {};
      setProfileData(user);
      setIsEditing(false);
      setSuccess('Profile updated successfully.');
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        err?.message ||
        'Could not update profile.';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!profileData) {
    return <div className="rounded-2xl border border-white/10 bg-white/7 p-6 text-slate-300">Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Profile</h2>
          <p className="mt-1 text-slate-300">Manage your account information</p>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 rounded-lg border border-blue-400/30 bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-400"
          >
            <Edit2 size={18} />
            Edit Profile
          </button>
        )}
      </div>

      {error && <div className="rounded-2xl border border-red-400/25 bg-red-400/10 p-4 text-sm text-red-200">{error}</div>}
      {success && <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-4 text-sm text-emerald-200">{success}</div>}

      <div className="rounded-2xl border border-white/10 bg-white/7 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="space-y-6">
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
              <User size={20} className="text-blue-400" />
              Basic Information
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-400">Name</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/20 bg-slate-800/50 px-3 py-2 text-white"
                  />
                ) : (
                  <p className="text-lg font-semibold text-white">{profileData.name}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-slate-400">Email</p>
                <p className="flex items-center gap-2 text-lg font-semibold text-white"><Mail size={16} className="text-slate-400" />{profileData.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Phone</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.phone_number}
                    onChange={(e) => handleChange('phone_number', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/20 bg-slate-800/50 px-3 py-2 text-white"
                  />
                ) : (
                  <p className="flex items-center gap-2 text-lg font-semibold text-white"><Phone size={16} className="text-slate-400" />{profileData.phone_number || 'N/A'}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-slate-400">Region</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.region}
                    onChange={(e) => handleChange('region', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/20 bg-slate-800/50 px-3 py-2 text-white"
                  />
                ) : (
                  <p className="flex items-center gap-2 text-lg font-semibold text-white"><MapPin size={16} className="text-slate-400" />{profileData.region || 'N/A'}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-slate-400">Special Conditions</p>
                {isEditing ? (
                  <textarea
                    value={editData.special_conditions}
                    onChange={(e) => handleChange('special_conditions', e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-white/20 bg-slate-800/50 px-3 py-2 text-white"
                  />
                ) : (
                  <p className="text-lg font-semibold text-white">{profileData.special_conditions || 'None'}</p>
                )}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-3 border-t border-white/10 pt-6">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-500 py-3 font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-70"
              >
                <Save size={18} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-700 py-3 font-semibold text-slate-200 transition hover:bg-slate-600"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
