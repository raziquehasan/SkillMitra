"use client";

import Image from "next/image";
import EmployerSidebar from "@/components/employer/EmployerSidebar";
import { useAuth } from "@/contexts/AuthContext";

export default function EmployerProfilePage() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-[#f4f7fa] text-slate-800">

      {/* GOVERNMENT HEADER */}
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
            SkillMitra | Employer Intelligence Portal
          </div>

        </div>
      </header>

      {/* ORANGE LINE */}
      <div className="fixed left-0 right-0 top-[72px] z-50 h-1 bg-[#c2410c]" />

      {/* PAGE AREA */}
      <div className="min-h-screen pt-[76px]">

        {/* SIDEBAR */}
        <EmployerSidebar />

        {/* MAIN AREA */}
        <section className="min-w-0 lg:ml-72">

          {/* SKILLMITRA PAGE HEADER */}
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
                  Employer Profile Dashboard
                </p>
              </div>

            </div>
          </div>

          {/* CONTENT */}
          <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">

            {/* PAGE HEADER */}
            <div className="mb-7">
              <p className="text-xs font-medium text-slate-400">
                Profile
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
                My Profile
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                View your employer account information.
              </p>
            </div>

            {/* PROFILE CARD */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

              {/* PROFILE TOP */}
              <div className="border-b border-slate-100 p-6 md:p-8">

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                  {/* AVATAR */}
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#123b68] text-2xl font-bold text-white">
                    {user?.full_name?.charAt(0)?.toUpperCase() || "E"}
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {user?.full_name || "Employer"}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Employer Account
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      SkillMitra Employer Portal
                    </p>
                  </div>

                </div>
              </div>

              {/* ACCOUNT INFORMATION */}
              <div className="p-6 md:p-8">

                <h2 className="text-lg font-bold text-slate-900">
                  Account Information
                </h2>

                <div className="mt-5 grid gap-5 md:grid-cols-2">

                  {/* FULL NAME */}
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-400">
                      Full Name
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {user?.full_name || "Not available"}
                    </p>
                  </div>

                  {/* EMAIL */}
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-400">
                      Email Address
                    </p>

                    <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                      {user?.email || "Not available"}
                    </p>
                  </div>

                  {/* ROLE */}
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-400">
                      Account Role
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      Employer
                    </p>
                  </div>

                  {/* STATUS */}
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-400">
                      Account Status
                    </p>

                    <span
                      className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        user?.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user?.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                </div>
              </div>

            </div>

            {/* PROFILE NOTE */}
            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">

              <h2 className="font-semibold text-[#123b68]">
                Employer Profile
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Your account information is loaded from your authenticated
                SkillMitra employer account.
              </p>

            </div>

          </div>
        </section>
      </div>
    </main>
  );
}