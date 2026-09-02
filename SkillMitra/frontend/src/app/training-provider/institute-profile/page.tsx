"use client";

import { TrainingProviderShell } from "@/app/training-provider/TrainingProviderShell";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  User,
  Edit2,
  Save,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  GraduationCap,
  Users,
  Shield,
  FileText,
  Loader2,
} from "lucide-react";

export default function InstituteProfile() {
  return (
    <TrainingProviderShell>
      <InstituteProfileContent />
    </TrainingProviderShell>
  );
}

function InstituteProfileContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [providerData, setProviderData] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    contact_person: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    district_id: "",
    city: "",
    state: "",
    pin_code: "",
  });

  useEffect(() => {
    fetchProviderData();
  }, []);

  const fetchProviderData = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const data = await api.trainingProviderMe();
      setProviderData(data);
      setFormData({
        name: data.name || "",
        contact_person: data.contact_person || "",
        phone: data.phone || "",
        email: data.source_email || "",
        website: "",
        address: data.source_address || "",
        district_id: data.district_id || "",
        city: data.source_city || "",
        state: "Maharashtra",
        pin_code: "",
      });
    } catch {
      setProviderData(null);
      setLoadError("Unable to load institute profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveMessage(null);
      setSaveError(null);
      const updatedProvider = await api.updateTrainingProviderMe({
        name: formData.name,
        contact_person: formData.contact_person,
        phone: formData.phone,
        source_email: formData.email,
        source_address: formData.address,
        source_city: formData.city,
      });
      // Read the committed record back so the UI is based on persisted data.
      const persistedProvider = await api.trainingProviderMe();
      setProviderData(persistedProvider || updatedProvider);
      setFormData({
        ...formData,
        name: persistedProvider.name || "",
        contact_person: persistedProvider.contact_person || "",
        phone: persistedProvider.phone || "",
        email: persistedProvider.source_email || "",
        address: persistedProvider.source_address || "",
        city: persistedProvider.source_city || "",
      });
      setEditing(false);
      setSaveMessage("Profile updated successfully");
    } catch (error) {
      setSaveError("Unable to update profile. Please try again.");
      setFormData({
        ...formData,
        name: providerData?.name || "",
        contact_person: providerData?.contact_person || "",
        phone: providerData?.phone || "",
        email: providerData?.source_email || "",
        address: providerData?.source_address || "",
        city: providerData?.source_city || "",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: providerData?.name || "",
      contact_person: providerData?.contact_person || "",
      phone: providerData?.phone || "",
      email: providerData?.source_email || "",
      website: "",
      address: providerData?.source_address || "",
      district_id: providerData?.district_id || "",
      city: providerData?.source_city || "",
      state: "Maharashtra",
      pin_code: "",
    });
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1e3a8a] mx-auto" />
          <p className="mt-4 text-sm text-slate-600">Loading institute profile...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm font-medium text-red-700">
        {loadError}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1e293b]">Institute Profile</h1>
          <p className="mt-2 text-slate-600">
            Manage your training institute information and certifications.
          </p>
        </div>
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

      {/* Institute Information */}
      <div className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#1e293b] flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Institute Information
          </h2>
          {providerData?.verification_status && (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full ${
              providerData.verification_status === "verified" ? "bg-green-100 text-green-800" :
              providerData.verification_status === "pending_verification" ? "bg-yellow-100 text-yellow-800" :
              "bg-red-100 text-red-800"
            }`}>
              {providerData.verification_status === "verified" && <CheckCircle className="h-3.5 w-3.5" />}
              {providerData.verification_status === "pending_verification" && <Clock className="h-3.5 w-3.5" />}
              {providerData.verification_status === "rejected" && <AlertCircle className="h-3.5 w-3.5" />}
              {providerData.verification_status.replace("_", " ").toUpperCase()}
            </span>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <InfoField
            label="Institute Name"
            value={formData.name}
            editing={editing}
            onChange={(value) => setFormData({ ...formData, name: value })}
          />
          <InfoField
            label="Registration Number"
            value={providerData?.registration_number || "Not provided"}
            editing={false}
          />
          <InfoField
            label="Provider Type"
            value={providerData?.provider_type || "Not provided"}
            editing={false}
          />
          <InfoField
            label="Contact Person"
            value={formData.contact_person}
            editing={editing}
            onChange={(value) => setFormData({ ...formData, contact_person: value })}
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1e293b] mb-4 flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Contact Information
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <InfoField
            label="Official Email"
            value={formData.email}
            editing={editing}
            onChange={(value) => setFormData({ ...formData, email: value })}
            icon={<Mail className="h-4 w-4" />}
          />
          <InfoField
            label="Official Phone"
            value={formData.phone}
            editing={editing}
            onChange={(value) => setFormData({ ...formData, phone: value })}
            icon={<Phone className="h-4 w-4" />}
          />
          <InfoField
            label="Website"
            value={formData.website}
            editing={false}
            icon={<Globe className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Location */}
      <div className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1e293b] mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <InfoField
            label="Address"
            value={formData.address}
            editing={editing}
            onChange={(value) => setFormData({ ...formData, address: value })}
          />
          <InfoField
            label="City"
            value={formData.city}
            editing={editing}
            onChange={(value) => setFormData({ ...formData, city: value })}
          />
          <InfoField
            label="District"
            value={providerData?.district_id || "Not provided"}
            editing={false}
          />
          <InfoField
            label="State"
            value={formData.state}
            editing={false}
          />
          <InfoField
            label="PIN Code"
            value={formData.pin_code}
            editing={false}
          />
        </div>
      </div>

      {/* Training Information */}
      <div className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1e293b] mb-4 flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Training Information
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <InfoCard
            label="Training Sectors"
            value={providerData?.source_sector || "Not provided"}
            icon={<Building2 className="h-4 w-4" />}
          />
          <InfoCard
            label="Courses Offered"
            value="12 Active Courses"
            icon={<FileText className="h-4 w-4" />}
          />
          <InfoCard
            label="Number of Trainers"
            value="8 Certified Trainers"
            icon={<Users className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Infrastructure */}
      <div className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1e293b] mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Infrastructure
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <InfoCard
            label="Classrooms"
            value="6 Classrooms"
            icon={<Building2 className="h-4 w-4" />}
          />
          <InfoCard
            label="Labs"
            value="4 Technical Labs"
            icon={<Building2 className="h-4 w-4" />}
          />
          <InfoCard
            label="Available Seats"
            value="1,680 Seats"
            icon={<Users className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Certification & Compliance */}
      <div className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1e293b] mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Certification & Compliance
        </h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-[#1e293b]">NSQF Level 1-4 Certification</p>
                <p className="text-sm text-slate-500">Valid until December 2025</p>
              </div>
            </div>
            <span className="text-sm text-green-600 font-medium">Active</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-[#1e293b]">Government Registration</p>
                <p className="text-sm text-slate-500">Registered with Skill Development Department</p>
              </div>
            </div>
            <span className="text-sm text-green-600 font-medium">Verified</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-[#1e293b]">ISO 9001:2015 Certification</p>
                <p className="text-sm text-slate-500">Renewal pending - expires in 3 months</p>
              </div>
            </div>
            <span className="text-sm text-yellow-600 font-medium">Expiring Soon</span>
          </div>
        </div>
      </div>

      {/* Edit Actions */}
      {saveMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          <CheckCircle className="h-4 w-4" />
          {saveMessage}
        </div>
      )}
      {saveError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle className="h-4 w-4" />
          {saveError}
        </div>
      )}
      {editing && (
        <div className="flex justify-end gap-3">
          <button
            onClick={handleCancel}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1e3a8a] rounded-lg hover:bg-[#1e3a8a]/90 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
}

function InfoField({ label, value, editing, onChange, icon }: {
  label: string;
  value: string;
  editing: boolean;
  onChange?: (value: string) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {editing ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
        />
      ) : (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          {icon}
          <span>{value || "Not provided"}</span>
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value, icon }: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-sm text-slate-500">{label}</p>
      </div>
      <p className="text-lg font-semibold text-[#1e3a8a]">{value}</p>
    </div>
  );
}

function getFallbackProviderData() {
  return {
    provider_id: "fallback-provider-id",
    name: "Maharashtra Skill Development Academy",
    provider_type: "private",
    registration_number: "MSD-2024-001234",
    verification_status: "verified",
    status: "active",
    contact_person: "Dr. Rajesh Kumar",
    phone: "+91-20-12345678",
    source_email: "info@msda.org.in",
    source_address: "123, Industrial Area, Pune",
    source_city: "Pune",
    district_id: "pune-district-id",
    source_sector: "Manufacturing, IT, Healthcare",
  };
}

function getFallbackFormData() {
  return {
    name: "Maharashtra Skill Development Academy",
    contact_person: "Dr. Rajesh Kumar",
    phone: "+91-20-12345678",
    email: "info@msda.org.in",
    website: "www.msda.org.in",
    address: "123, Industrial Area, Pune",
    district_id: "pune-district-id",
    city: "Pune",
    state: "Maharashtra",
    pin_code: "411045",
  };
}