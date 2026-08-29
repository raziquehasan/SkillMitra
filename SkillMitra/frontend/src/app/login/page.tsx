
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-r from-[#eef7ff] via-white to-[#f8fbff] text-[#1f2937]">

      {/* =====================================================
          GOVERNMENT TOP BAR
      ===================================================== */}
      <div className="bg-[#123b63] text-white">
        <div className="mx-auto flex min-h-[42px] max-w-7xl items-center justify-between px-5 text-xs sm:px-8 sm:text-sm">

          <div className="flex items-center gap-3">
           <Image
               src="/government-logo.png"
               alt="Government of Maharashtra Emblem"
               width={32}
               height={32}
               className="h-8 w-8 object-contain"
                priority
              />

            <span className="font-semibold">
             Government of Maharashtra
           </span>

            <span className="hidden text-blue-200 sm:inline">
    |
            </span>

            <span className="hidden text-blue-100 sm:inline">
              Skill Development & Entrepreneurship Department
             </span>
           </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="hover:underline"
            >
              Help
            </button>

            <span className="text-blue-200">|</span>

            <button
              type="button"
              className="hover:underline"
            >
              English
            </button>

            <span className="text-blue-200">|</span>

            <button
              type="button"
              className="hover:underline"
            >
              मराठी
            </button>
          </div>

        </div>
      </div>


      {/* =====================================================
          MAIN HEADER
      ===================================================== */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex min-h-[88px] max-w-7xl items-center justify-between px-5 sm:px-8">

          {/* Branding */}
          <div className="flex items-center gap-4">

            {/* Temporary Logo */}
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
              <h1 className="text-xl font-bold tracking-tight text-[#123b63] sm:text-2xl">
                SkillMitra
              </h1>

              <p className="text-xs font-semibold text-gray-700 sm:text-sm">
                Maharashtra Skill Intelligence Platform
              </p>

              <p className="hidden text-xs text-gray-500 sm:block">
                Government Skill &amp; Candidate Portal
              </p>
            </div>

          </div>


          {/* Navigation */}
          <nav className="hidden items-center gap-7 text-sm font-medium text-gray-700 md:flex">

            <Link
              href="/"
              className="transition hover:text-[#123b63]"
            >
              Home
            </Link>

            <Link
              href="/login"
              className="font-semibold text-[#123b63]"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="transition hover:text-[#123b63]"
            >
              Register
            </Link>

            <button
              type="button"
              className="transition hover:text-[#123b63]"
            >
              Contact Us
            </button>

          </nav>

        </div>
      </header>


      {/* =====================================================
          LOGIN SECTION
      ===================================================== */}
      <section className="relative flex min-h-[calc(100vh-130px)] items-center justify-center overflow-hidden px-5 py-12">

        {/* Background Decorative Elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-120px] top-20 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />
          <div className="absolute bottom-10 right-[-100px] h-80 w-80 rounded-full bg-blue-100/50 blur-3xl" />
        </div>


        <div className="relative z-10 w-full max-w-md">

          {/* Login Card */}
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">

            {/* Card Header */}
            <div className="border-b border-gray-200 bg-white px-7 py-7 text-center">

              {/* Lock Icon */}
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f1f8] text-2xl text-[#123b63]">
                🔐
              </div>

              <h2 className="mt-4 text-2xl font-bold text-[#123b63]">
                Welcome to SkillMitra
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                Login to access your account
              </p>

            </div>


            {/* Form */}
            <form
              className="space-y-5 px-7 py-7"
              onSubmit={async (event) => {
                event.preventDefault();
                setError('');
                setLoading(true);

                try {
                  await login(email, password);
                  // Redirect based on user role will be handled by RoleRedirect component
                  router.push('/dashboard');
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
                } finally {
                  setLoading(false);
                }
              }}
            >

              {/* Error Message */}
              {error && (
                <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* User ID */}
             
              <div>
                   <label
                       htmlFor="email"
                       className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Email Address
                    </label>

                    <div className="relative">
                     <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    👤
                    </span>

                   <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your registered email address"
                      required
                      disabled={loading}
                      className="w-full border border-gray-400 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#123b63] focus:ring-1 focus:ring-[#123b63] disabled:bg-gray-100 disabled:cursor-not-allowed"
                     />
                      </div>
                      </div>
         


              {/* Password */}
              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Password
                    <span className="ml-1 text-red-600">*</span>
                  </label>

                </div>

          <div className="relative">
              {/* Left: Lock Icon */}
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
             🔒
           </span>

            <input
                 id="password"
                     name="password"
                 type={showPassword ? 'text' : 'password'}
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                     placeholder="Enter your password"
                     required
                     disabled={loading}
                 className="w-full border border-gray-400 bg-white py-3 pl-11 pr-14 text-sm outline-none transition focus:border-[#123b63] focus:ring-1 focus:ring-[#123b63] disabled:bg-gray-100 disabled:cursor-not-allowed"
               />

               {/* Right: Eye Icon */}
             <button
              type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
               className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#123b63] disabled:cursor-not-allowed"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                {showPassword ? '👁️' : '👁️'}
                </button>
                </div>

                </div>


              {/* Forgot Password */}
              <div className="flex justify-end">

                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-[#123b63] hover:underline"
                >
                  Forgot Password?
                </Link>

              </div>


              {/* Sign In */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded bg-[#123b63] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0d2d4b] focus:outline-none focus:ring-2 focus:ring-[#123b63] focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>


              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs text-gray-400">
                  OR
                </span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>


              {/* Register */}
              <div className="text-center">

                 <p className="text-sm text-gray-600">
                   Don&apos;t have an account?
                 </p>

                <Link
                  href="/register"
                  className="mt-1 inline-block text-sm font-bold text-[#123b63] hover:underline"
                >
                  Register
                </Link>

              </div>

            </form>

          </div>


          {/* Security Note */}
          <div className="mt-5 rounded border border-blue-100 bg-white/70 px-5 py-4 text-center">

            <p className="text-xs leading-5 text-gray-500">
              🔒 Your information is protected. Please keep your
              login credentials confidential and do not share your
              password with anyone.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="border-t border-gray-300 bg-[#123b63] text-white">

        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">

              {/* About */}
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

                  <p className="text-sm leading-6 text-blue-100">
                     Maharashtra Skill Intelligence Platform connecting
                      candidates, employers, training providers and
                     government stakeholders.
                      </p>

                      </div>


            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide">
                Quick Links
              </h3>

              <div className="mt-4 space-y-2 text-sm text-blue-100">

                <Link
                  href="/"
                  className="block hover:text-white hover:underline"
                >
                  Home
                </Link>

                <Link
                  href="/login"
                  className="block hover:text-white hover:underline"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="block hover:text-white hover:underline"
                >
                  Registration
                </Link>

                <button
                  type="button"
                  className="block hover:text-white hover:underline"
                >
                  Help &amp; Support
                </button>

              </div>
            </div>


            {/* Important Links */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide">
                Important Links
              </h3>

              <div className="mt-4 space-y-2 text-sm text-blue-100">

                <button
                  type="button"
                  className="block hover:text-white hover:underline"
                >
                  Privacy Policy
                </button>

                <button
                  type="button"
                  className="block hover:text-white hover:underline"
                >
                  Terms of Use
                </button>

                <button
                  type="button"
                  className="block hover:text-white hover:underline"
                >
                  Accessibility
                </button>

                <button
                  type="button"
                  className="block hover:text-white hover:underline"
                >
                  FAQs
                </button>

              </div>
            </div>


            {/* Contact */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide">
                Contact Us
              </h3>

              <div className="mt-4 space-y-3 text-sm text-blue-100">

                <p>
                  📍 Maharashtra, India
                </p>

                <p>
                  ✉ support@skillmitra.gov.in
                </p>

                <p>
                  ☎ Government Skill Support
                </p>

                <div className="flex gap-3 pt-2">

                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-300 hover:bg-white hover:text-[#123b63]"
                  >
                    f
                  </button>

                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-300 hover:bg-white hover:text-[#123b63]"
                  >
                    X
                  </button>

                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-300 hover:bg-white hover:text-[#123b63]"
                  >
                    in
                  </button>

                </div>

              </div>
            </div>

          </div>


          {/* Bottom Footer */}
          <div className="mt-8 border-t border-blue-400/30 pt-5">

            <div className="flex flex-col gap-3 text-xs text-blue-100 sm:flex-row sm:items-center sm:justify-between">

              <p>
               © Government of Maharashtra / Concerned Department
             </p>


              <p>
                SkillMitra – Maharashtra Skill Intelligence Platform
              </p>

            </div>

          </div>

        </div>

      </footer>

    </main>
  );
}