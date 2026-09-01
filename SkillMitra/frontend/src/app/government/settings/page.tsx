"use client";

import { useState, useEffect } from "react";
import { GovernmentShell } from "@/app/government/GovernmentShell";
import { api } from "@/lib/api";
import {
  Settings,
  User,
  Lock,
  Bell,
  Globe,
  Monitor,
  Save,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

type Section = "account" | "security" | "notifications" | "language" | "session";

interface Profile {
  email: string;
  full_name: string;
  phone: string | null;
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>("account");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [alertNotifs, setAlertNotifs] = useState(true);

  const [language, setLanguage] = useState("en");

  useEffect(() => {
    (async () => {
      try {
        const data = await api.governmentProfile();
        setProfile(data);
        setName(data.full_name);
        setEmail(data.email);
        setPhone(data.phone || "");
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = () => {
    setToast("Settings saved");
    setTimeout(() => setToast(null), 3000);
  };

  const sections: { key: Section; label: string; icon: React.ReactNode }[] = [
    { key: "account", label: "Account", icon: <User className="h-4 w-4" /> },
    { key: "security", label: "Security", icon: <Lock className="h-4 w-4" /> },
    { key: "notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
    { key: "language", label: "Language", icon: <Globe className="h-4 w-4" /> },
    { key: "session", label: "Session", icon: <Monitor className="h-4 w-4" /> },
  ];

  if (loading) {
    return (
      <GovernmentShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#123b68] mx-auto" />
            <p className="mt-4 text-sm text-slate-600">Loading settings...</p>
          </div>
        </div>
      </GovernmentShell>
    );
  }

  return (
    <GovernmentShell>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-7 w-7 text-[#123b68]" />
            <h1 className="text-3xl font-bold text-[#123b68]">Settings</h1>
          </div>
          <p className="text-slate-600">Manage your account, security, and preferences.</p>
        </div>

        {toast && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <p className="text-sm text-green-700">{toast}</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              {sections.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setActiveSection(s.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                    activeSection === s.key
                      ? "bg-[#123b68] text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {s.icon}
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              {activeSection === "account" && (
                <div>
                  <h3 className="text-lg font-semibold text-[#123b68] mb-4">Account Information</h3>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#123b68]/30"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#123b68]/30"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#123b68]/30"
                        readOnly
                      />
                    </div>
                    <p className="text-xs text-slate-400">Account fields are read-only from profile.</p>
                  </div>
                </div>
              )}

              {activeSection === "security" && (
                <div>
                  <h3 className="text-lg font-semibold text-[#123b68] mb-4">Change Password</h3>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                      <div className="relative">
                        <input
                          type={showPasswords ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full border border-slate-300 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#123b68]/30"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(!showPasswords)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                        >
                          {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                      <input
                        type={showPasswords ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#123b68]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                      <input
                        type={showPasswords ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#123b68]/30"
                      />
                    </div>
                    <p className="text-xs text-slate-400">Password changes require backend endpoint.</p>
                  </div>
                </div>
              )}

              {activeSection === "notifications" && (
                <div>
                  <h3 className="text-lg font-semibold text-[#123b68] mb-4">Notification Preferences</h3>
                  <div className="space-y-4 max-w-md">
                    <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-slate-700">Email Notifications</p>
                        <p className="text-xs text-slate-500">Receive updates via email</p>
                      </div>
                      <button
                        onClick={() => setEmailNotifs(!emailNotifs)}
                        className={`relative w-10 h-5 rounded-full transition-colors ${
                          emailNotifs ? "bg-[#123b68]" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                            emailNotifs ? "translate-x-5" : ""
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-slate-700">Push Notifications</p>
                        <p className="text-xs text-slate-500">Browser push alerts</p>
                      </div>
                      <button
                        onClick={() => setPushNotifs(!pushNotifs)}
                        className={`relative w-10 h-5 rounded-full transition-colors ${
                          pushNotifs ? "bg-[#123b68]" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                            pushNotifs ? "translate-x-5" : ""
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-slate-700">Alert Notifications</p>
                        <p className="text-xs text-slate-500">Critical system alerts</p>
                      </div>
                      <button
                        onClick={() => setAlertNotifs(!alertNotifs)}
                        className={`relative w-10 h-5 rounded-full transition-colors ${
                          alertNotifs ? "bg-[#123b68]" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                            alertNotifs ? "translate-x-5" : ""
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-xs text-slate-400">Toggles are visual only.</p>
                  </div>
                </div>
              )}

              {activeSection === "language" && (
                <div>
                  <h3 className="text-lg font-semibold text-[#123b68] mb-4">Language Preference</h3>
                  <div className="max-w-md">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#123b68]/30"
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="mr">Marathi</option>
                      <option value="ta">Tamil</option>
                      <option value="te">Telugu</option>
                      <option value="bn">Bengali</option>
                    </select>
                  </div>
                </div>
              )}

              {activeSection === "session" && (
                <div>
                  <h3 className="text-lg font-semibold text-[#123b68] mb-4">Active Sessions</h3>
                  <div className="space-y-3 max-w-md">
                    <div className="p-3 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-700">Current Session</p>
                          <p className="text-xs text-slate-500">Windows • Chrome • {navigator.language}</p>
                        </div>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">
                          Active
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">Session management requires backend support.</p>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-slate-200">
                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#123b68] text-white text-sm font-medium rounded-lg hover:bg-[#123b68]/90 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GovernmentShell>
  );
}
