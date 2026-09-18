"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import CandidateSidebar from "@/components/candidate/CandidateSidebar";
import { api } from "@/lib/api";

function SettingToggle({
  label,
  description,
  defaultChecked = false,
  disabled = false,
}: {
  label: string;
  description: string;
  defaultChecked?: boolean;
  disabled?: boolean;
}) {
  const [enabled, setEnabled] = useState(defaultChecked);

  const handleToggle = () => {
    if (disabled) return;
    setEnabled(!enabled);
    // TODO: Persist to backend when API is available
    console.log(`Setting ${label} to ${!enabled}`);
  };

  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-4 last:border-b-0">
      <div>
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled ? "bg-[#123b68]" : "bg-slate-300"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        aria-label={`Toggle ${label}`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function PreferenceRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-4 last:border-b-0">
      <div>
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="mt-1 text-xs text-slate-500">
          Current preference
        </p>
      </div>

      <span className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">
        {value}
      </span>
    </div>
  );
}

export default function CandidateSettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await api.candidateProfile();
        setProfile(profileData);
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  return (
    <main className="min-h-screen bg-[#f4f7fa] text-slate-800">
      {/* Government Header */}
      <header className="fixed left-0 right-0 top-0 z-50 h-[72px] bg-[#123b68] text-white">
        <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-6 text-sm">
          <div className="flex items-center gap-3">
            <Image
              src="/maharashtra-gov-logo.png"
              alt="Government of Maharashtra"
              width={48}
              height={48}
              priority
              className="h-12 w-12 object-contain"
            />

            <div>
              <div className="font-semibold">
                Government of Maharashtra
              </div>

              <div className="text-[11px] text-blue-100">
                Skills, Employment, Entrepreneurship & Innovation Department
              </div>
            </div>
          </div>

          <div className="hidden font-semibold md:block">
            SkillMitra | Candidate Portal
          </div>
        </div>
      </header>

      {/* Orange Line */}
      <div className="fixed left-0 right-0 top-[72px] z-50 h-1 bg-[#c2410c]" />

      <div className="min-h-screen pt-[76px]">
        {/* Candidate Sidebar */}
        <CandidateSidebar />

        {/* Main Content */}
        <section className="min-w-0 lg:ml-72">
          {/* Page Header */}
          <div className="border-b border-slate-200 bg-white px-5 py-4 lg:px-8">
            <div className="mx-auto flex max-w-[1250px] items-center gap-4">
              <div className="relative h-14 w-14 shrink-0">
                <Image
                  src="/skillmitra-logo.png"
                  alt="SkillMitra"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  SkillMitra
                </p>

                <p className="font-semibold text-[#123b68]">
                  Candidate Settings
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">
            {/* Intro */}
            <div className="mb-6">
              <p className="text-sm font-medium text-[#c2410c]">
                Account Preferences
              </p>

              <h1 className="mt-1 text-2xl font-bold text-[#123b68]">
                Candidate Settings
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                Manage your notification preferences, career preferences,
                account settings and security options.
              </p>
            </div>

            {/* Settings Grid */}
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              {/* Left Content */}
              <div className="space-y-6">
                {/* Notification Settings */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-2">
                    <h2 className="text-lg font-bold text-[#123b68]">
                      Notification Settings
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Choose which SkillMitra updates you want to receive.
                    </p>
                  </div>

                  <div className="mt-4">
                    <SettingToggle
                      label="Job Recommendations"
                      description="Receive notifications about jobs that match your skills and profile."
                      defaultChecked={true}
                      disabled={true}
                    />

                    <SettingToggle
                      label="Application Updates"
                      description="Get updates about the status of your job applications."
                      defaultChecked={true}
                      disabled={true}
                    />

                    <SettingToggle
                      label="Skill Gap Alerts"
                      description="Receive updates when SkillMitra identifies important skill gaps."
                      defaultChecked={true}
                      disabled={true}
                    />

                    <SettingToggle
                      label="Training Recommendations"
                      description="Get notifications about courses related to your career goals."
                      defaultChecked={true}
                      disabled={true}
                    />

                    <SettingToggle
                      label="Career Intelligence Updates"
                      description="Receive relevant career and workforce intelligence updates."
                      disabled={true}
                    />
                  </div>

                  <div className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
                    <p className="font-semibold">Note: Notification preferences are currently managed at the system level. Individual preference customization will be available in a future update.</p>
                  </div>
                </div>

                {/* Career Preferences */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div>
                    <h2 className="text-lg font-bold text-[#123b68]">
                      Career Preferences
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      These preferences help SkillMitra provide relevant job
                      and training recommendations.
                    </p>
                  </div>

                  <div className="mt-4">
                    <PreferenceRow
                      label="Preferred Role"
                      value={profile?.career_interests?.length > 0 ? `${profile.career_interests.length} interests set` : "Not specified"}
                    />

                    <PreferenceRow
                      label="Preferred Location"
                      value={profile?.district_id ? "Selected" : "Not specified"}
                    />

                    <PreferenceRow
                      label="Education Level"
                      value={profile?.education_level || "Not specified"}
                    />

                    <PreferenceRow
                      label="Current Status"
                      value={profile?.current_status || "Not specified"}
                    />
                  </div>

                  <Link
                    href="/candidate/profile"
                    className="mt-5 inline-block rounded-lg border border-[#123b68] px-4 py-2.5 text-sm font-semibold text-[#123b68] hover:bg-blue-50"
                  >
                    Manage Profile Preferences
                  </Link>
                </div>

                {/* Privacy Settings */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div>
                    <h2 className="text-lg font-bold text-[#123b68]">
                      Privacy Settings
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Manage how your candidate profile is used within the
                      SkillMitra platform.
                    </p>
                  </div>

                  <div className="mt-4">
                    <SettingToggle
                      label="Profile Visibility"
                      description="Allow your profile to be considered for suitable job opportunities."
                      defaultChecked={true}
                      disabled={true}
                    />

                    <SettingToggle
                      label="Job Matching"
                      description="Allow SkillMitra to use your skills for job matching and recommendations."
                      defaultChecked={true}
                      disabled={true}
                    />

                    <SettingToggle
                      label="Training Matching"
                      description="Allow your skill gaps to be used for relevant training recommendations."
                      defaultChecked={true}
                      disabled={true}
                    />
                  </div>

                  <div className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
                    <p className="font-semibold">Note: Privacy settings are currently managed at the system level. Individual privacy customization will be available in a future update.</p>
                  </div>
                </div>

                {/* Security */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div>
                    <h2 className="text-lg font-bold text-[#123b68]">
                      Security
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Manage your account security options.
                    </p>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 bg-white p-4 text-left hover:border-blue-200 hover:bg-blue-50"
                    >
                      <p className="text-sm font-semibold text-[#123b68]">
                        Change Password
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Update your account password regularly for better
                        security.
                      </p>
                    </button>

                    <div className="rounded-lg border border-green-100 bg-green-50 p-4">
                      <p className="text-sm font-semibold text-green-700">
                        Account Security
                      </p>

                      <p className="mt-1 text-xs leading-5 text-green-700">
                        Your account security settings are currently active.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side */}
              <div className="space-y-6">
                {/* Account Summary */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Account Summary
                  </p>

                  <h2 className="mt-2 text-lg font-bold text-[#123b68]">
                    Candidate Account
                  </h2>

                  <div className="mt-5 space-y-4">
                    <div>
                      <p className="text-xs text-slate-400">
                        Account Type
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        Candidate
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Profile Status
                      </p>

                      <span className="mt-1 inline-flex rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-700">
                        Active
                      </span>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Profile Completion
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#123b68]">
                        Based on your profile
                      </p>

                      <Link
                        href="/candidate/profile"
                        className="mt-2 inline-block text-xs font-semibold text-[#123b68] hover:underline"
                      >
                        View Profile →
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Recommendation Intelligence */}
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-lg text-[#123b68] shadow-sm">
                    ✦
                  </div>

                  <h2 className="mt-4 text-base font-bold text-[#123b68]">
                    Recommendation Intelligence
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Keep your profile, skills and career preferences updated
                    so SkillMitra can provide more relevant job and training
                    recommendations.
                  </p>

                  <div className="mt-4 space-y-2">
                    <Link
                      href="/candidate/skills"
                      className="block rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#123b68] hover:bg-slate-50"
                    >
                      Update Skills →
                    </Link>

                    <Link
                      href="/candidate/skill-gap"
                      className="block rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#123b68] hover:bg-slate-50"
                    >
                      View Skill Gap →
                    </Link>
                  </div>
                </div>

                {/* Help */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold text-[#123b68]">
                    Need Help?
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Keep your candidate profile information accurate and
                    updated for better opportunities.
                  </p>

                  <Link
                    href="/candidate/profile"
                    className="mt-4 inline-block text-sm font-semibold text-[#123b68] hover:underline"
                  >
                    Review Profile →
                  </Link>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#123b68]">
                  ✦
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#123b68]">
                    SkillMitra Candidate Settings
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Your settings help personalize job matching, skill gap
                    analysis and training recommendations across the
                    Candidate Portal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}