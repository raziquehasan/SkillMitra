
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await api.forgotPassword(email);
      setSuccess(result.message);
      const resetToken = (result as { reset_token?: string }).reset_token;
      if (resetToken) {
        setToken(resetToken);
        setStep('reset');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const result = await api.resetPassword(token, newPassword);
      setSuccess(result.message);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-r from-[#eef7ff] via-white to-[#f8fbff] text-[#1f2937]">

      {/* =====================================================
          GOVERNMENT TOP BAR
      ===================================================== */}
      <div className="bg-[#123b63] text-white">
        <div className="mx-auto flex min-h-[58px] max-w-7xl items-center justify-between px-6 lg:px-10">

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center bg-white">
                <Image
                    src="/government-logo.png"
                     alt="Government Emblem"
                     width={40}
                     height={40}
                     className="h-10 w-auto object-contain"
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
          FORGOT PASSWORD
      ===================================================== */}
      <section className="flex min-h-[520px] items-center justify-center px-5 py-12">

        <div className="w-full max-w-md">

          <div className="border border-gray-300 bg-white shadow-sm">

            {/* Heading */}
            <div className="border-b border-gray-200 px-7 py-7 text-center">

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f0fa] text-[#123b63]">
                🔒
              </div>

              <h2 className="text-2xl font-bold text-[#123b63]">
                {step === 'email' ? 'Forgot Password' : 'Reset Password'}
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                {step === 'email'
                  ? 'Enter your registered email address to receive a password reset token.'
                  : 'Enter the reset token and your new password.'}
              </p>

            </div>


            {/* Form */}
            <div className="space-y-5 px-7 py-7">
              {error && (
                <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              {success && (
                <div className="border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {success}
                </div>
              )}

              {step === 'email' ? (
                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-700">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your registered email address"
                      required
                      disabled={loading}
                      className="w-full border border-gray-400 bg-white py-3 px-4 text-sm outline-none transition focus:border-[#123b63] focus:ring-1 focus:ring-[#123b63] disabled:bg-gray-100"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded bg-[#123b63] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0d2d4b] focus:outline-none focus:ring-2 focus:ring-[#123b63] focus:ring-offset-2 disabled:bg-gray-400"
                  >
                    {loading ? 'Sending Reset Token...' : 'Send Reset Token'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div>
                    <label htmlFor="token" className="mb-2 block text-sm font-semibold text-gray-700">
                      Reset Token
                    </label>
                    <input
                      id="token"
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Enter reset token"
                      required
                      disabled={loading}
                      className="w-full border border-gray-400 bg-white py-3 px-4 text-sm outline-none transition focus:border-[#123b63] focus:ring-1 focus:ring-[#123b63] disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="mb-2 block text-sm font-semibold text-gray-700">
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 8 characters)"
                      required
                      minLength={8}
                      disabled={loading}
                      className="w-full border border-gray-400 bg-white py-3 px-4 text-sm outline-none transition focus:border-[#123b63] focus:ring-1 focus:ring-[#123b63] disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-gray-700">
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                      minLength={8}
                      disabled={loading}
                      className="w-full border border-gray-400 bg-white py-3 px-4 text-sm outline-none transition focus:border-[#123b63] focus:ring-1 focus:ring-[#123b63] disabled:bg-gray-100"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded bg-[#123b63] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0d2d4b] focus:outline-none focus:ring-2 focus:ring-[#123b63] focus:ring-offset-2 disabled:bg-gray-400"
                  >
                    {loading ? 'Resetting Password...' : 'Reset Password'}
                  </button>
                </form>
              )}
            </div>


            {/* Back to Login */}
            <div className="border-t border-gray-200 bg-gray-50 px-7 py-5 text-center">

              <p className="text-sm text-gray-600">
                Remember your password?
              </p>

              <Link
                href="/login"
                className="mt-1 inline-block text-sm font-bold text-[#123b63] hover:underline"
              >
                Back to Login
              </Link>

            </div>

          </div>


          <p className="mt-5 text-center text-xs leading-5 text-gray-500">
            Please keep your account information and reset instructions
            confidential.
          </p>

        </div>

      </section>


      {/* =====================================================
          SAME FOOTER
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