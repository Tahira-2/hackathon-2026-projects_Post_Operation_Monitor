import { Edit2, Save, X, User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { useState } from 'react';

export default function ProfileView() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    childName: 'Aarav Sharma',
    age: 5,
    dateOfBirth: '2021-03-15',
    gender: 'Male',
    bloodType: 'O+',
    parentName: 'Rajesh Sharma',
    parentEmail: 'rajesh.sharma@email.com',
    parentPhone: '+977-9841234567',
    address: 'Kathmandu, Nepal',
    city: 'Kathmandu',
    district: 'Kathmandu',
    region: 'Bagmati',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav',
  });

  const [editData, setEditData] = useState(profileData);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(profileData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(profileData);
  };

  const handleSave = () => {
    setProfileData(editData);
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Profile</h2>
          <p className="text-slate-300 mt-1">Manage your child's health information</p>
        </div>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-400 transition border border-blue-400/30"
          >
            <Edit2 size={18} />
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl border border-white/10 bg-white/7 shadow-2xl shadow-black/30 overflow-hidden backdrop-blur-xl">
        {/* Header Background */}
        <div className="h-32 bg-gradient-to-r from-blue-600/30 to-emerald-600/30 border-b border-white/10" />

        {/* Profile Content */}
        <div className="px-6 pb-6">
          {/* Profile Photo and Name */}
          <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16 mb-8">
            <img
              src={profileData.photo}
              alt={profileData.childName}
              className="w-32 h-32 rounded-full border-4 border-blue-500/30 shadow-lg"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white">
                {profileData.childName}
              </h1>
              <p className="text-slate-300">{profileData.age} years old</p>
            </div>
          </div>

          {isEditing ? (
            // Edit Mode
            <div className="space-y-6">
              {/* Child Information */}
              <div className="border-b border-white/10 pb-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <User size={20} className="text-blue-400" />
                  Child Information
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Child's Name
                    </label>
                    <input
                      type="text"
                      value={editData.childName}
                      onChange={(e) => handleChange('childName', e.target.value)}
                      className="w-full border border-white/20 rounded-lg px-3 py-2 bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={editData.dateOfBirth}
                      onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                      className="w-full border border-white/20 rounded-lg px-3 py-2 bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Gender
                    </label>
                    <select
                      value={editData.gender}
                      onChange={(e) => handleChange('gender', e.target.value)}
                      className="w-full border border-white/20 rounded-lg px-3 py-2 bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-slate-800"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Blood Type
                    </label>
                    <select
                      value={editData.bloodType}
                      onChange={(e) => handleChange('bloodType', e.target.value)}
                      className="w-full border border-white/20 rounded-lg px-3 py-2 bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-slate-800"
                    >
                      <option>O+</option>
                      <option>O-</option>
                      <option>A+</option>
                      <option>A-</option>
                      <option>B+</option>
                      <option>B-</option>
                      <option>AB+</option>
                      <option>AB-</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Parent Information */}
              <div className="border-b border-white/10 pb-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <User size={20} className="text-emerald-400" />
                  Parent/Guardian Information
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Parent Name
                    </label>
                    <input
                      type="text"
                      value={editData.parentName}
                      onChange={(e) => handleChange('parentName', e.target.value)}
                      className="w-full border border-white/20 rounded-lg px-3 py-2 bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editData.parentEmail}
                      onChange={(e) => handleChange('parentEmail', e.target.value)}
                      className="w-full border border-white/20 rounded-lg px-3 py-2 bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={editData.parentPhone}
                      onChange={(e) => handleChange('parentPhone', e.target.value)}
                      className="w-full border border-white/20 rounded-lg px-3 py-2 bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <MapPin size={20} className="text-red-400" />
                  Address Information
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={editData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      className="w-full border border-white/20 rounded-lg px-3 py-2 bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      District
                    </label>
                    <input
                      type="text"
                      value={editData.district}
                      onChange={(e) => handleChange('district', e.target.value)}
                      className="w-full border border-white/20 rounded-lg px-3 py-2 bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-slate-800"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Full Address
                    </label>
                    <textarea
                      value={editData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      className="w-full border border-white/20 rounded-lg px-3 py-2 bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-slate-800 rows-3"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-white/10">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-emerald-500 text-white py-3 rounded-lg font-semibold hover:bg-emerald-400 transition flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-slate-700 text-slate-200 py-3 rounded-lg font-semibold hover:bg-slate-600 transition flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // View Mode
            <div className="space-y-6">
              {/* Child Information */}
              <div className="border-b border-white/10 pb-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <User size={20} className="text-blue-400" />
                  Child Information
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-slate-400">Date of Birth</p>
                    <p className="text-lg font-semibold text-white">
                      {profileData.dateOfBirth}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Gender</p>
                    <p className="text-lg font-semibold text-white">
                      {profileData.gender}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Blood Type</p>
                    <p className="text-lg font-semibold text-white">
                      {profileData.bloodType}
                    </p>
                  </div>
                </div>
              </div>

              {/* Parent Information */}
              <div className="border-b border-white/10 pb-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <User size={20} className="text-emerald-400" />
                  Parent/Guardian Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-400">Parent Name</p>
                    <p className="text-lg font-semibold text-white">
                      {profileData.parentName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={18} className="text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-400">Email</p>
                      <p className="text-lg font-semibold text-white">
                        {profileData.parentEmail}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={18} className="text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-400">Phone</p>
                      <p className="text-lg font-semibold text-white">
                        {profileData.parentPhone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <MapPin size={20} className="text-red-400" />
                  Address Information
                </h3>
                <div className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-400">City</p>
                      <p className="text-lg font-semibold text-white">
                        {profileData.city}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">District</p>
                      <p className="text-lg font-semibold text-white">
                        {profileData.district}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Full Address</p>
                    <p className="text-lg font-semibold text-white">
                      {profileData.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
