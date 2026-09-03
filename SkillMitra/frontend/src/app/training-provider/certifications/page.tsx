"use client";

import { TrainingProviderShell } from "@/app/training-provider/TrainingProviderShell";
import { useState } from "react";
import {
  Shield,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Upload,
  Download,
  Plus,
} from "lucide-react";

export default function CertificationsPage() {
  return (
    <TrainingProviderShell>
      <CertificationsContent />
    </TrainingProviderShell>
  );
}

function CertificationsContent() {
  const certifications = [
    {
      id: "1",
      name: "NSQF Level 1-4 Certification",
      type: "Government Accreditation",
      status: "active",
      validFrom: "2022-01-15",
      validUntil: "2025-12-31",
      document: "NSQF_Certificate_2022.pdf",
    },
    {
      id: "2",
      name: "Government Registration",
      type: "Institute Registration",
      status: "verified",
      validFrom: "2021-06-01",
      validUntil: null,
      document: "Registration_Certificate.pdf",
    },
    {
      id: "3",
      name: "ISO 9001:2015 Certification",
      type: "Quality Management",
      status: "expiring_soon",
      validFrom: "2020-03-10",
      validUntil: "2025-03-10",
      document: "ISO_Certificate.pdf",
    },
    {
      id: "4",
      name: "Skill Development Partner",
      type: "Partner Certification",
      status: "active",
      validFrom: "2023-01-01",
      validUntil: "2026-12-31",
      document: "Partner_Certificate.pdf",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1e293b]">Certifications & Compliance</h1>
          <p className="mt-2 text-slate-600">
            Manage your institute certifications and compliance documents.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1e3a8a] rounded-lg hover:bg-[#1e3a8a]/90 transition-colors">
          <Plus className="h-4 w-4" />
          Add Certification
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <KPICard title="Active Certifications" value={certifications.filter(c => c.status === "active").length} icon={<CheckCircle className="h-5 w-5" />} color="green" />
        <KPICard title="Verified" value={certifications.filter(c => c.status === "verified").length} icon={<Shield className="h-5 w-5" />} color="blue" />
        <KPICard title="Expiring Soon" value={certifications.filter(c => c.status === "expiring_soon").length} icon={<Clock className="h-5 w-5" />} color="orange" />
        <KPICard title="Expired" value={certifications.filter(c => c.status === "expired").length} icon={<AlertTriangle className="h-5 w-5" />} color="red" />
      </div>

      {/* Certifications List */}
      <div className="space-y-4">
        {certifications.map((cert) => (
          <div key={cert.id} className="min-w-0 rounded-lg border border-slate-300 bg-white p-6 shadow-sm overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${
                  cert.status === "active" ? "bg-green-100 text-green-600" :
                  cert.status === "verified" ? "bg-blue-100 text-blue-600" :
                  cert.status === "expiring_soon" ? "bg-yellow-100 text-yellow-600" :
                  "bg-red-100 text-red-600"
                }`}>
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1e293b]">{cert.name}</h3>
                  <p className="text-sm text-slate-500">{cert.type}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                    <span>Valid from: {cert.validFrom}</span>
                    {cert.validUntil && <span>Valid until: {cert.validUntil}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${
                  cert.status === "active" ? "bg-green-100 text-green-800" :
                  cert.status === "verified" ? "bg-blue-100 text-blue-800" :
                  cert.status === "expiring_soon" ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {cert.status === "active" && <CheckCircle className="h-3.5 w-3.5" />}
                  {cert.status === "verified" && <CheckCircle className="h-3.5 w-3.5" />}
                  {cert.status === "expiring_soon" && <Clock className="h-3.5 w-3.5" />}
                  {cert.status === "expired" && <AlertTriangle className="h-3.5 w-3.5" />}
                  {cert.status.replace("_", " ").toUpperCase()}
                </span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 pt-4 border-t border-slate-200">
              <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                <FileText className="h-4 w-4" />
                View Document
              </button>
              <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                <Download className="h-4 w-4" />
                Download
              </button>
              <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                <Upload className="h-4 w-4" />
                Update
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Compliance Status */}
      <div className="min-w-0 rounded-lg border border-slate-300 bg-white p-6 shadow-sm overflow-hidden">
        <h2 className="text-lg font-semibold text-[#1e293b] mb-4">Compliance Status</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-[#1e293b]">Training Standards Compliance</p>
                <p className="text-sm text-slate-500">Meets NSQF training standards</p>
              </div>
            </div>
            <span className="text-sm text-green-600 font-medium">Compliant</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-[#1e293b]">Infrastructure Compliance</p>
                <p className="text-sm text-slate-500">Meets minimum infrastructure requirements</p>
              </div>
            </div>
            <span className="text-sm text-green-600 font-medium">Compliant</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-[#1e293b]">Trainer Certification Compliance</p>
                <p className="text-sm text-slate-500">2 trainers require certification renewal</p>
              </div>
            </div>
            <span className="text-sm text-yellow-600 font-medium">Action Required</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon, color }: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="min-w-0 rounded-lg border border-slate-300 bg-white p-4 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
      </div>
      <p className="text-xs text-slate-500 uppercase tracking-wide">{title}</p>
      <p className="text-2xl font-bold text-[#1e3a8a]">{value}</p>
    </div>
  );
}