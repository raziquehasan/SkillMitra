
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
   <main className="min-h-screen bg-gradient-to-r from-[#eef7ff] via-white to-[#f8fbff] text-[#1f2937]">

      {/* =====================================================
          GOVERNMENT TOP BAR
      ===================================================== */}
      <div className="bg-[#123b63] text-white">
        <div className="mx-auto flex min-h-[58px] max-w-7xl items-center justify-between px-6 lg:px-10">

          <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
                  <Image
                    src="/government-logo.png"
                      alt="Government of Maharashtra Emblem"
                     width={32}
                       height={32}
                     className="h-8 w-8 object-contain"
                     priority
                   />
                </div>

            <div>
              <p className="text-sm font-bold">
                Government of Maharashtra
              </p>

              <p className="text-[10px] sm:text-xs">
                Skill Development, Entrepreneurship &amp; Innovation Department
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-3 text-xs sm:flex">
            <button type="button" className="hover:underline">
              Help
            </button>

            <span>|</span>

            <button type="button" className="hover:underline">
              English
            </button>

            <span>|</span>

            <button type="button" className="hover:underline">
              मराठी
            </button>
          </div>

        </div>
      </div>


      {/* =====================================================
          SKILLMITRA HEADER
      ===================================================== */}
      <header className="border-b border-gray-300 bg-white">
        <div className="mx-auto flex min-h-[105px] max-w-7xl items-center justify-between px-6 lg:px-10">

          {/* Logo + Branding */}
          <div className="flex items-center gap-4">

            <div className="flex items-center">
              <Image
                 src="/logo.png"
                 alt="SkillMitra Logo"
                  width={220}
                  height={80}
                   className="h-auto w-[180px] sm:w-[220px]"
                  priority
                 />
              </div>

            <div>
              <h1 className="text-xl font-bold text-[#123b63] sm:text-2xl">
                SkillMitra
              </h1>

              <p className="text-xs font-semibold text-gray-700 sm:text-sm">
                Maharashtra Skill Intelligence Platform
              </p>

              <p className="text-[10px] text-gray-500 sm:text-xs">
                Right Skills, Right Opportunities, Better Future
              </p>
            </div>

          </div>


          {/* Navigation */}
          <nav className="hidden items-center gap-6 text-sm md:flex">

            <Link
              href="/"
              className="font-medium text-gray-700 hover:text-[#123b63]"
            >
              Home
            </Link>

            <span className="h-5 w-px bg-gray-300" />

            <Link
              href="#contact"
              className="font-medium text-gray-700 hover:text-[#123b63]"
            >
              Contact Us
            </Link>

            <span className="h-5 w-px bg-gray-300" />

            <button
              type="button"
              className="font-medium text-gray-700 hover:text-[#123b63]"
            >
              Help
            </button>

          </nav>

        </div>
      </header>


      {/* =====================================================
          REGISTER SECTION
      ===================================================== */}
      <section className="px-5 py-10 sm:py-14">

        <div className="mx-auto w-full max-w-3xl">

          {/* Heading */}
          <div className="mb-7 text-center">

            <h2 className="text-3xl font-bold text-[#123b63]">
              Create Account
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Create your SkillMitra account to access the portal
            </p>

          </div>


          {/* =================================================
              REGISTER CARD
          ================================================= */}
          <div className="border border-gray-300 bg-white shadow-sm">

            <div className="border-b border-gray-200 px-6 py-6 sm:px-8">

              <h3 className="text-lg font-bold text-[#123b63]">
                Registration
              </h3>

              <p className="mt-1 text-sm text-gray-600">
                Enter your details below to create your account.
              </p>

            </div>


            {/* Form */}
            <form className="space-y-6 px-6 py-7 sm:px-8">

              {/* =================================================
                  FULL NAME
              ================================================= */}
              <FormField
                label="Full Name"
                htmlFor="fullName"
                icon={<UserIcon />}
              >
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  required
                  className={inputClass}
                />
              </FormField>


              {/* =================================================
                  EMAIL
              ================================================= */}
              <FormField
                label="Email Address"
                htmlFor="email"
                icon={<MailIcon />}
              >
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  required
                  className={inputClass}
                />
              </FormField>


              {/* =================================================
                  PASSWORD
              ================================================= */}
              <FormField
                label="Password"
                htmlFor="password"
                icon={<LockIcon />}
              >
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create your password"
                  required
                  className={`${inputClass} pr-14`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#123b63]"
                >
                  <EyeIcon />
                </button>
              </FormField>


              {/* =================================================
                  PHONE NUMBER
              ================================================= */}
              <FormField
                label="Phone Number"
                htmlFor="phone"
                icon={<PhoneIcon />}
              >
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  required
                  className={inputClass}
                />
              </FormField>


              {/* =================================================
                  GENDER
              ================================================= */}
              <FormField
                label="Gender"
                htmlFor="gender"
                icon={<UserIcon />}
              >
                <select
                  id="gender"
                  name="gender"
                  required
                  defaultValue=""
                  className={inputClass}
                >
                  <option value="" disabled>
                    Select gender
                  </option>

                  <option value="male">
                    Male
                  </option>

                  <option value="female">
                    Female
                  </option>

                  <option value="other">
                    Other
                  </option>
                </select>
              </FormField>


              {/* =================================================
                  DATE OF BIRTH
              ================================================= */}
              <FormField
                label="Date of Birth"
                htmlFor="dateOfBirth"
                icon={<CalendarIcon />}
              >
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  required
                  className={inputClass}
                />
              </FormField>


              {/* =================================================
                  TERMS
              ================================================= */}
              <div className="border-t border-gray-200 pt-6">

                <label className="flex items-start gap-3 text-sm text-gray-600">

                  <input
                    type="checkbox"
                    required
                    className="mt-1 h-4 w-4 accent-[#123b63]"
                  />

                  <span>
                    I confirm that the information provided by me is
                    accurate and I agree to the applicable terms and
                    privacy policy.
                  </span>

                </label>

              </div>


              {/* =================================================
                  CREATE ACCOUNT
              ================================================= */}
              <button
                type="submit"
                className="w-full bg-[#123b63] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2d4b] focus:outline-none focus:ring-2 focus:ring-[#123b63] focus:ring-offset-2"
              >
                Create Account
              </button>

            </form>


            {/* =================================================
                LOGIN LINK
            ================================================= */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-5 text-center">

              <p className="text-sm text-gray-600">
                Already have an account?
              </p>

              <Link
                href="/login"
                className="mt-1 inline-block text-sm font-bold text-[#123b63] hover:underline"
              >
                Login
              </Link>

            </div>

          </div>


          <p className="mt-5 text-center text-xs leading-5 text-gray-500">
            Please ensure that the information provided during registration
            is correct and keep your account credentials confidential.
          </p>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer
        id="contact"
        className="border-t border-gray-300 bg-[#123b63] text-white"
      >

        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">

            {/* SkillMitra */}
            <div>

              <div className="mb-4 flex items-center gap-3">

                <div className="flex items-center">
                 <Image
                    src="/logo.png"
                    alt="SkillMitra Logo"
                    width={160}
                       height={60}
                    className="h-auto w-[140px] object-contain"
                    />
                </div>

                

              </div>

              <p className="text-xs leading-5 text-gray-200">
                Skill Development, Entrepreneurship &amp; Innovation Department,
                Government of Maharashtra.
              </p>


              {/* Social Icons */}
              <div className="mt-5 flex gap-3">

                <a
                  href="#"
                  aria-label="Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-bold hover:bg-white/20"
                >
                  f
                </a>

                <a
                  href="#"
                  aria-label="X"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-bold hover:bg-white/20"
                >
                  X
                </a>

                <a
                  href="#"
                  aria-label="YouTube"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-bold hover:bg-white/20"
                >
                  ▶
                </a>

                <a
                  href="#"
                  aria-label="LinkedIn"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-bold hover:bg-white/20"
                >
                  in
                </a>

              </div>

            </div>


            {/* Quick Links */}
            <div>

              <h3 className="mb-4 text-sm font-bold">
                Quick Links
              </h3>

              <div className="space-y-2 text-xs text-gray-200">

                <a href="#" className="block hover:text-white">
                  Home
                </a>

                <a href="#" className="block hover:text-white">
                  About SkillMitra
                </a>

                <a href="#" className="block hover:text-white">
                  Career Guidance
                </a>

                <a href="#" className="block hover:text-white">
                  Skills
                </a>

                <a href="#" className="block hover:text-white">
                  Courses &amp; Training
                </a>

                <a href="#" className="block hover:text-white">
                  Jobs
                </a>

                <a href="#" className="block hover:text-white">
                  Industry Demand
                </a>

              </div>

            </div>


            {/* Important Links */}
            <div>

              <h3 className="mb-4 text-sm font-bold">
                Important Links
              </h3>

              <div className="space-y-2 text-xs text-gray-200">

                <a href="#" className="block hover:text-white">
                  RTI
                </a>

                <a href="#" className="block hover:text-white">
                  Grievances
                </a>

                <a href="#" className="block hover:text-white">
                  Privacy Policy
                </a>

                <a href="#" className="block hover:text-white">
                  Terms &amp; Conditions
                </a>

                <a href="#" className="block hover:text-white">
                  Accessibility Statement
                </a>

                <a href="#" className="block hover:text-white">
                  Sitemap
                </a>

              </div>

            </div>


            {/* Contact Us */}
            <div>

              <h3 className="mb-4 text-sm font-bold">
                Contact Us
              </h3>

              <div className="space-y-4 text-xs text-gray-200">

                <p>
                  ☎ &nbsp; 1800-123-4567 (Toll Free)
                </p>

                <p>
                  ✉ &nbsp; support@skillmitra.gov.in
                </p>

                <p>
                  📍 &nbsp; Mumbai, Maharashtra, India
                </p>

              </div>

            </div>

          </div>


          {/* Copyright */}
          <div className="mt-8 flex flex-col gap-3 border-t border-white/20 pt-5 text-xs text-gray-300 sm:flex-row sm:items-center sm:justify-between">

            <p>
              © 2026 Government of Maharashtra. All rights reserved.
            </p>

            <p>
              This is an official SkillMitra platform.
            </p>

          </div>

        </div>

      </footer>

    </main>
  );
}


/* =========================================================
   FORM FIELD COMPONENT
========================================================= */

function FormField({
  label,
  htmlFor,
  icon,
  children,
}: {
  label: string;
  htmlFor: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>

      <label
        htmlFor={htmlFor}
        className="mb-2 block text-sm font-semibold text-gray-700"
      >
        {label}
        <span className="ml-1 text-red-600">*</span>
      </label>

      <div className="relative">

        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
          {icon}
        </span>

        {children}

      </div>

    </div>
  );
}


/* =========================================================
   INPUT STYLE
========================================================= */

const inputClass =
  'w-full border border-gray-400 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#123b63] focus:ring-1 focus:ring-[#123b63]';


/* =========================================================
   ICONS
========================================================= */

function UserIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="7" r="4" />
      <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}


function MailIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}


function LockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}


function PhoneIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}


function CalendarIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}


function EyeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}