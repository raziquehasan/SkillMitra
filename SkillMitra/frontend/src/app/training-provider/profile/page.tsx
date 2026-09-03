"use client";

import { TrainingProviderShell } from "@/app/training-provider/TrainingProviderShell";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Mail,
  Phone,
  Edit2,
  Save,
  X,
  Shield,
  Bell,
  Settings,
  Loader2,
} from "lucide-react";

export default function Profile() {
  return (
    <TrainingProviderShell>
      <ProfileContent />
    </TrainingProviderShell>
  );
}

function ProfileContent() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone: "",
  });

  const handleSave = () => {
    // Save logic would go here
    setEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || "",
      email: user?.email || "",
      phone: "",
    });
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1e293b]">Profile</h1>
        <p className="mt-2 text-slate-600">
          Manage your personal profile and account settings.
        </p>
      </div>

      <div className="min-w-0 rounded-lg border border-slate-300 bg-white p-6 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#1e293b] flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#1e3a8a] border border-[#1e3a8a] rounded-lg hover:bg-[#1e3a8a]/5 transition-colors"
            >
              <Edit2 className="h-4 w-4" />
              Edit Profile
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            {editing ? (
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
              />
            ) : (
              <p className="text-sm text-slate-600">{formData.full_name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            {editing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
              />
            ) : (
              <p className="text-sm text-slate-600">{formData.email}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            {editing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
              />
            ) : (
              <p className="text-sm text-slate-600">{formData.phone || "Not provided"}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <p className="text-sm text-slate-600">Training Provider</p>
          </div>
        </div>

        {editing && (
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1e3a8a] rounded-lg hover:bg-[#1e3a8a]/90 transition-colors"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="min-w-0 rounded-lg border border-slate-300 bg-white p-6 shadow-sm overflow-hidden">
          <h2 className="text-lg font-semibold text-[#1e293b] mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </h2>
          <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
            Change Password
          </button>
        </div>
        <div className="min-w-0 rounded-lg border border-slate-300 bg-white p-6 shadow-sm overflow-hidden">
          <h2 className="text-lg font-semibold text-[#1e293b] mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </h2>
          <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
            Configure Notifications
          </button>
        </div>
      </div>
    </div>
  );
}