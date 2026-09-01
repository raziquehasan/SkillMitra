"use client";

import { useState, useEffect } from "react";
import { GovernmentShell } from "@/app/government/GovernmentShell";
import { api } from "@/lib/api";
import {
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Shield,
  Clock,
  Loader2,
  UserCircle,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  roles: string[];
  department: string | null;
  designation: string | null;
  district_id: string | null;
  district_name: string | null;
  employee_code: string | null;
  verification_status: string | null;
  last_login_at: string | null;
  created_at: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const loadProfile = async () => {
    try {
      setError(null);
      const data = await api.governmentProfile();
      setProfile(data);
    } catch (err: any) {
      console.error("Profile load error:", err);
      if (err.message?.includes("401")) {
        setError("Your session has expired. Please sign in again.");
      } else if (err.message?.includes("403")) {
        setError("Your account does not have permission to view this profile.");
      } else if (err.message?.includes("404")) {
        setError("Profile information is not available for this account.");
      } else {
        setError("Unable to load your profile. Please try again.");
      }
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleRetry = () => {
    setRetrying(true);
    setLoading(true);
    loadProfile();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getVerificationStatusColor = (status: string | null) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "pending_verification":
        return "bg-yellow-100 text-yellow-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  if (loading) {
    return (
      <GovernmentShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#1e3a8a] mx-auto" />
            <p className="mt-4 text-sm text-slate-600">Loading your profile...</p>
          </div>
        </div>
      </GovernmentShell>
    );
  }

  if (error) {
    return (
      <GovernmentShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Unable to Load Profile</h3>
            <p className="text-sm text-slate-600 mb-4">{error}</p>
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1e3a8a] text-white text-sm font-medium rounded-lg hover:bg-[#1e3a8a]/90 disabled:opacity-50 transition-colors"
            >
              {retrying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </>
              )}
            </button>
          </div>
        </div>
      </GovernmentShell>
    );
  }

  if (!profile) {
    return (
      <GovernmentShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <UserCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Profile Not Found</h3>
            <p className="text-sm text-slate-600 mb-4">
              Profile information is not available for this account.
            </p>
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1e3a8a] text-white text-sm font-medium rounded-lg hover:bg-[#1e3a8a]/90 disabled:opacity-50 transition-colors"
            >
              {retrying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </>
              )}
            </button>
          </div>
        </div>
      </GovernmentShell>
    );
  }

  return (
    <GovernmentShell>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
          <span>Government Portal</span>
          <span>/</span>
          <span className="text-[#1e3a8a] font-medium">Profile</span>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <User className="h-7 w-7 text-[#1e3a8a]" />
            <h1 className="text-3xl font-bold text-[#1e293b]">Officer Profile</h1>
          </div>
          <p className="text-slate-600">
            View your official account and department information.
          </p>
        </div>

        {/* Profile Header Card */}
        <div className="mb-6 rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-[#1e3a8a] flex items-center justify-center text-white text-3xl font-bold border-4 border-slate-100">
                {getInitials(profile.full_name)}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-2xl font-bold text-[#1e293b]">{profile.full_name}</h2>
                  <p className="text-lg text-slate-700 font-medium">{profile.designation || "Government Official"}</p>
                  <p className="text-sm text-slate-600">{profile.department || "Government of Maharashtra"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-green-700">Active</span>
                </div>
              </div>

              <div className="flex items-center gap-6 mt-4 text-sm border-t border-slate-200 pt-4">
                <div>
                  <span className="text-slate-500">District:</span>
                  <span className="ml-1 font-medium text-[#1e3a8a]">{profile.district_name || "Not provided"}</span>
                </div>
                <div>
                  <span className="text-slate-500">Role:</span>
                  <span className="ml-1 font-medium text-[#1e3a8a]">
                    {profile.roles.map((r) => r.replace(/_/g, " ")).join(", ")}
                  </span>
                </div>
                {profile.employee_code && (
                  <div>
                    <span className="text-slate-500">Employee ID:</span>
                    <span className="ml-1 font-medium text-[#1e3a8a]">{profile.employee_code}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Information */}
          <div className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#1e3a8a] mb-4 border-b border-slate-200 pb-2">
              Personal Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <UserCircle className="h-4 w-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Full Name</p>
                  <p className="text-sm font-medium text-[#1e293b]">{profile.full_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Official Email</p>
                  <p className="text-sm font-medium text-[#1e293b]">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Phone Number</p>
                  <p className="text-sm font-medium text-[#1e293b]">{profile.phone || "Not provided"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Official Information */}
          <div className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#1e3a8a] mb-4 border-b border-slate-200 pb-2">
              Official Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Building className="h-4 w-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Department</p>
                  <p className="text-sm font-medium text-[#1e293b]">{profile.department || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-4 w-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Designation</p>
                  <p className="text-sm font-medium text-[#1e293b]">{profile.designation || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">District / Region</p>
                  <p className="text-sm font-medium text-[#1e293b]">{profile.district_name || "—"}</p>
                </div>
              </div>
              {profile.employee_code && (
                <div className="flex items-start gap-3">
                  <Shield className="h-4 w-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500">Officer ID</p>
                    <p className="text-sm font-medium text-[#1e293b]">{profile.employee_code}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Information */}
          <div className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#1e3a8a] mb-4 border-b border-slate-200 pb-2">
              Account Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Shield className="h-4 w-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Government Role</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.roles.map((role) => (
                      <span
                        key={role}
                        className="px-2 py-0.5 bg-[#1e3a8a]/10 text-[#1e3a8a] text-xs rounded font-medium"
                      >
                        {role.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {profile.verification_status && (
                <div className="flex items-start gap-3">
                  <Shield className="h-4 w-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500">Verification Status</p>
                    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${getVerificationStatusColor(profile.verification_status)}`}>
                      {profile.verification_status.replace(/_/g, " ").toUpperCase()}
                    </span>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Last Login</p>
                  <p className="text-sm font-medium text-[#1e293b]">
                    {profile.last_login_at
                      ? new Date(profile.last_login_at).toLocaleString()
                      : "First login"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Registered Since</p>
                  <p className="text-sm font-medium text-[#1e293b]">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Access & Permissions */}
          <div className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#1e3a8a] mb-4 border-b border-slate-200 pb-2">
              Role & Access
            </h3>
            <div className="space-y-2">
              {profile.roles.includes("government_admin") && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-slate-700">Dashboard</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-slate-700">Reports</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-slate-700">Training</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-slate-700">Workforce</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-slate-700">Industry</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-slate-700">Planning</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-slate-700">Analytics</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-slate-700">Notifications</span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Security Section */}
        <div className="mt-6 rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#1e3a8a] mb-4 border-b border-slate-200 pb-2">
            Account Security
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-[#1e293b]">Account Status</p>
                <p className="text-xs text-slate-500">Your account is active and secure</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Authentication</p>
              <p className="text-sm font-medium text-green-600">Verified</p>
            </div>
          </div>
        </div>
      </div>
    </GovernmentShell>
  );
}
