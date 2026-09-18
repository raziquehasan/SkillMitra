
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, type District, type IndustrySector, type AuthUser } from '@/lib/api';

type UserRole = '' | 'candidate' | 'employer' | 'training_provider' | 'government_official';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // API data for dropdowns
  const [districts, setDistricts] = useState<District[]>([]);
  const [sectors, setSectors] = useState<IndustrySector[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Common fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Candidate-specific fields
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [streamSpecialization, setStreamSpecialization] = useState('');
  
  // Resume upload state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [skipResumeUpload, setSkipResumeUpload] = useState(false);

  // Employer-specific fields
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [industrySectorId, setIndustrySectorId] = useState('');
  const [employerDistrictId, setEmployerDistrictId] = useState('');
  const [organizationType, setOrganizationType] = useState('');
  const [website, setWebsite] = useState('');
  const [sizeCategory, setSizeCategory] = useState('');

  // Training Provider-specific fields
  const [instituteName, setInstituteName] = useState('');
  const [providerType, setProviderType] = useState('');
  const [providerDistrictId, setProviderDistrictId] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');

  // Government Official-specific fields
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [governmentDistrictId, setGovernmentDistrictId] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setError('');
    setSuccess('');
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only PDF and DOCX files are allowed');
        setResumeFile(null);
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        setResumeFile(null);
        return;
      }
      
      setResumeFile(file);
      setError('');
    }
  };

  const handleResumeUpload = async (file: File): Promise<string | null> => {
    // Store resume file for later upload after login
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      localStorage.setItem('pending_resume_data', reader.result as string);
      localStorage.setItem('pending_resume_name', file.name);
    };
    return 'pending';
  };

  // Load districts and sectors for dropdowns
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [districtRes, sectorRes] = await Promise.all([
          api.districts().catch(() => []),
          api.sectors().catch(() => []),
        ]);
        if (!cancelled) {
          setDistricts(districtRes);
          setSectors(sectorRes);
        }
      } catch (error) {
        console.error("Failed to load reference data:", error);
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      let result;
      
      switch (selectedRole) {
        case 'candidate':
          result = await api.registerCandidate({
            full_name: fullName,
            email,
            password,
            phone: phone || undefined,
            gender: gender || undefined,
            date_of_birth: dateOfBirth || undefined,
            district_id: districtId || undefined,
            education_level: educationLevel || undefined,
            stream_specialization: streamSpecialization || undefined,
            skip_resume_upload: skipResumeUpload,
          });
          
          // Store resume file for upload after login if provided
          if (resumeFile && !skipResumeUpload) {
            // Store resume file as base64 for later upload
            const reader = new FileReader();
            reader.readAsDataURL(resumeFile);
            reader.onload = () => {
              localStorage.setItem('pending_resume_data', reader.result as string);
              localStorage.setItem('pending_resume_name', resumeFile.name);
            };
          }
          
          // If resume upload was skipped, show message
          if (skipResumeUpload) {
            setSuccess('Registration successful! You can add skills manually or upload a resume later from your profile.');
          } else if (resumeFile) {
            setSuccess('Registration successful! Your resume will be processed after login.');
          } else {
            setSuccess('Registration successful! You can now log in.');
          }
          break;
          
        case 'employer':
          if (!industrySectorId) {
            throw new Error('Industry sector is required for employers');
          }
          result = await api.registerEmployer({
            full_name: fullName,
            email,
            password,
            phone: phone || undefined,
            company_name: companyName,
            contact_person: contactPerson || undefined,
            industry_sector_id: industrySectorId,
            district_id: employerDistrictId || undefined,
            organization_type: organizationType || undefined,
            website: website || undefined,
            size_category: sizeCategory || undefined,
          });
          break;
          
        case 'training_provider':
          if (!providerDistrictId) {
            throw new Error('District is required for training providers');
          }
          result = await api.registerTrainingProvider({
            full_name: fullName,
            email,
            password,
            phone: phone || undefined,
            institute_name: instituteName,
            provider_type: providerType || undefined,
            district_id: providerDistrictId,
            registration_number: registrationNumber || undefined,
          });
          break;
          
        case 'government_official':
          result = await api.registerGovernmentOfficial({
            full_name: fullName,
            email,
            password,
            phone: phone || undefined,
            department,
            designation,
            district_id: governmentDistrictId || undefined,
            employee_code: employeeCode || undefined,
          });
          break;
      }

      if (!result) return;

      // Handle different response types
      const message = (result as any).message || 'Registration successful';
      setSuccess(message);

      // Government official accounts may require verification
      if (selectedRole === 'government_official') {
        setSuccess(`${message} Your account may require administrator verification before full access.`);
      }

      // Redirect to login after successful registration
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
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

          <div className="hidden flex-wrap items-center gap-2 text-xs sm:flex sm:gap-3">
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
            <form onSubmit={handleSubmit} className="space-y-6 px-6 py-7 sm:px-8">

              {/* Error/Success Messages */}
              {error && (
                <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {success}
                </div>
              )}

              {/* Role Selection */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  I am registering as
                  <span className="ml-1 text-red-600">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {(['candidate', 'employer', 'training_provider', 'government_official'] as UserRole[]).map((role) => (
                    <label
                      key={role}
                      className={`flex cursor-pointer items-center gap-2 rounded border p-3 text-sm transition ${
                        selectedRole === role
                          ? 'border-[#123b63] bg-[#e8f1f8] text-[#123b63]'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role}
                        checked={selectedRole === role}
                        onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                        disabled={loading}
                        className="accent-[#123b63]"
                      />
                      <span className="capitalize">
                        {role.replace('_', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Common Fields */}
              {selectedRole && (
                <>
                  <FormField
                    label="Full Name"
                    htmlFor="fullName"
                    icon={<UserIcon />}
                  >
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                      disabled={loading}
                      className={`${inputClass} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    />
                  </FormField>

                  <FormField
                    label="Email Address"
                    htmlFor="email"
                    icon={<MailIcon />}
                  >
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      disabled={loading}
                      className={`${inputClass} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    />
                  </FormField>

                  <FormField
                    label="Password"
                    htmlFor="password"
                    icon={<LockIcon />}
                  >
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create your password (min 8 characters)"
                      required
                      minLength={8}
                      disabled={loading}
                      className={`${inputClass} pr-14 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#123b63] disabled:cursor-not-allowed"
                    >
                      <EyeIcon />
                    </button>
                  </FormField>

                  <FormField
                    label="Phone Number"
                    htmlFor="phone"
                    icon={<PhoneIcon />}
                  >
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      disabled={loading}
                      className={`${inputClass} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    />
                   </FormField>
                 </>
               )}
              {selectedRole === 'candidate' && (
                <>
                  <FormField
                    label="Gender"
                    htmlFor="gender"
                    icon={<UserIcon />}
                  >
                    <select
                      id="gender"
                      name="gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      disabled={loading}
                      className={`${inputClass} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </FormField>

                  <FormField
                    label="Date of Birth"
                    htmlFor="dateOfBirth"
                    icon={<CalendarIcon />}
                  >
                    <input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      disabled={loading}
                      className={`${inputClass} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    />
                  </FormField>

                  <FormField
                    label="District"
                    htmlFor="districtId"
                    icon={<UserIcon />}
                  >
                    <select
                      id="districtId"
                      name="districtId"
                      value={districtId}
                      onChange={(e) => setDistrictId(e.target.value)}
                      disabled={loading || dataLoading}
                      className={`${inputClass} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    >
                      <option value="">Select district</option>
                      {districts.map((district) => (
                        <option key={district.id} value={district.id}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField
                    label="Education Level"
                    htmlFor="educationLevel"
                    icon={<UserIcon />}
                  >
                    <select
                      id="educationLevel"
                      name="educationLevel"
                      value={educationLevel}
                      onChange={(e) => setEducationLevel(e.target.value)}
                      disabled={loading}
                      className={`${inputClass} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    >
                      <option value="">Select education level</option>
                      <option value="10th">10th</option>
                      <option value="12th">12th</option>
                      <option value="diploma">Diploma</option>
                      <option value="graduate">Graduate</option>
                      <option value="postgraduate">Postgraduate</option>
                      <option value="other">Other</option>
                    </select>
                  </FormField>

                  <FormField
                    label="Stream/Specialization"
                    htmlFor="streamSpecialization"
                    icon={<UserIcon />}
                  >
                    <input
                      id="streamSpecialization"
                      name="streamSpecialization"
                      type="text"
                      value={streamSpecialization}
                      onChange={(e) => setStreamSpecialization(e.target.value)}
                      placeholder="e.g., Science, Commerce, Arts"
                      disabled={loading}
                      className={`${inputClass} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    />
                  </FormField>

                  {/* Resume Upload Section */}
                  <div className="rounded-lg border border-gray-300 bg-gray-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <input
                          type="checkbox"
                          id="skipResumeUpload"
                          checked={skipResumeUpload}
                          onChange={(e) => setSkipResumeUpload(e.target.checked)}
                          disabled={loading}
                          className="h-4 w-4 rounded border-gray-300 text-[#123b63] focus:ring-[#123b63]"
                        />
                        <span>Skip Resume Upload</span>
                      </label>
                      <span className="text-xs text-gray-500">(Optional)</span>
                    </div>

                    {!skipResumeUpload && (
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Upload Resume
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            id="resumeFile"
                            accept=".pdf,.docx,.doc"
                            onChange={handleResumeChange}
                            disabled={loading}
                            className="flex-1 rounded border border-gray-300 bg-white px-3 py-2 text-sm file:mr-4 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
                          />
                          {resumeFile && (
                            <button
                              type="button"
                              onClick={() => setResumeFile(null)}
                              disabled={loading}
                              className="rounded bg-red-100 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        {resumeFile && (
                          <div className="mt-2 text-xs text-gray-600">
                            <span className="font-medium">Selected:</span> {resumeFile.name} 
                            <span className="ml-2 text-gray-500">({(resumeFile.size / 1024).toFixed(1)} KB)</span>
                          </div>
                        )}
                        <p className="mt-2 text-xs text-gray-500">
                          Supported formats: PDF, DOCX (Max 5MB)
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {selectedRole === 'employer' && (
                <>
                  <FormField
                    label="Company Name"
                    htmlFor="companyName"
                    icon={<UserIcon />}
                  >
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Enter company name"
                      required
                      disabled={loading}
                      className={`${inputClass} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    />
                  </FormField>

                  <FormField
                    label="Contact Person"
                    htmlFor="contactPerson"
                    icon={<UserIcon />}
                  >
                    <input
                      id="contactPerson"
                      name="contactPerson"
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="Contact person name"
                      disabled={loading}
                      className={`${inputClass} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    />
                  </FormField>

                  <FormField
                    label="Industry Sector"
                    htmlFor="industrySectorId"
                    icon={<UserIcon />}
                  >
                    <select
                      id="industrySectorId"
                      name="industrySectorId"
                      value={industrySectorId}
                      onChange={(e) => setIndustrySectorId(e.target.value)}
                      required
                      disabled={loading || dataLoading}
                      className={`${inputClass} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    >
                      <option value="">Select industry sector</option>
                      {sectors.map((sector) => (
                        <option key={sector.id} value={sector.id}>
                          {sector.name}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField
                    label="Organization Type"
                    htmlFor="organizationType"
                    icon={<UserIcon />}
                  >
                    <select
                      id="organizationType"
                      name="organizationType"
                      value={organizationType}
                      onChange={(e) => setOrganizationType(e.target.value)}
                      disabled={loading}
                      className={`${inputClass} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    >
                      <option value="">Select organization type</option>
                      <option value="private">Private</option>
                      <option value="public">Public</option>
                      <option value="partnership">Partnership</option>
                      <option value="llp">LLP</option>
                      <option value="other">Other</option>
                    </select>
                  </FormField>

                  <FormField
                    label="Website"
                    htmlFor="website"
                    icon={<UserIcon />}
                  >
                    <input
                      id="website"
                      name="website"
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://company-website.com"
                      disabled={loading}
                      className={`${inputClass} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    />
                  </FormField>

                  <FormField
                    label="Company Size"
                    htmlFor="sizeCategory"
                    icon={<UserIcon />}
                  >
                    <select
                      id="sizeCategory"
                      name="sizeCategory"
                      value={sizeCategory}
                      onChange={(e) => setSizeCategory(e.target.value)}
                      disabled={loading}
                      className={`${inputClass} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    >
                      <option value="">Select company size</option>
                      <option value="small">Small (1-50 employees)</option>
                      <option value="medium">Medium (51-250 employees)</option>
                      <option value="large">Large (251+ employees)</option>
                    </select>
                  </FormField>

                  <FormField
                    label="District"
                    htmlFor="employerDistrictId"
                    icon={<UserIcon />}
                  >
                    <select
                      id="employerDistrictId"
                      name="employerDistrictId"
                      value={employerDistrictId}
                      onChange={(e) => setEmployerDistrictId(e.target.value)}
                      disabled={loading || dataLoading}
                      className={`${inputClass} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    >
                      <option value="">Select district</option>
                      {districts.map((district) => (
                        <option key={district.id} value={district.id}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </>
              )}

              {selectedRole === 'training_provider' && (
                <>
                  <FormField
                    label="Institute Name"
                    htmlFor="instituteName"
                    icon={<UserIcon />}
                  >
                    <input
                      id="instituteName"
                      name="instituteName"
                      type="text"
                      value={instituteName}
                      onChange={(e) => setInstituteName(e.target.value)}
                      placeholder="Enter institute name"
                      required
                      disabled={loading}
                      className={`${inputClass} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    />
                  </FormField>

                  <FormField
                    label="Provider Type"
                    htmlFor="providerType"
                    icon={<UserIcon />}
                  >
                    <select
                      id="providerType"
                      name="providerType"
                      value={providerType}
                      onChange={(e) => setProviderType(e.target.value)}
                      disabled={loading}
                      className={`${inputClass} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    >
                      <option value="">Select provider type</option>
                      <option value="government">Government</option>
                      <option value="private">Private</option>
                      <option value="ngo">NGO</option>
                      <option value="other">Other</option>
                    </select>
                  </FormField>

                  <FormField
                    label="District"
                    htmlFor="providerDistrictId"
                    icon={<UserIcon />}
                  >
                    <select
                      id="providerDistrictId"
                      name="providerDistrictId"
                      value={providerDistrictId}
                      onChange={(e) => setProviderDistrictId(e.target.value)}
                      required
                      disabled={loading || dataLoading}
                      className={`${inputClass} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    >
                      <option value="">Select district</option>
                      {districts.map((district) => (
                        <option key={district.id} value={district.id}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField
                    label="Registration Number"
                    htmlFor="registrationNumber"
                    icon={<UserIcon />}
                  >
                    <input
                      id="registrationNumber"
                      name="registrationNumber"
                      type="text"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      placeholder="Government registration number"
                      disabled={loading}
                      className={`${inputClass} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    />
                  </FormField>
                </>
              )}

              {selectedRole === 'government_official' && (
                <>
                  <FormField
                    label="Department"
                    htmlFor="department"
                    icon={<UserIcon />}
                  >
                    <input
                      id="department"
                      name="department"
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g., Skill Development Department"
                      required
                      disabled={loading}
                      className={`${inputClass} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    />
                  </FormField>

                  <FormField
                    label="Designation"
                    htmlFor="designation"
                    icon={<UserIcon />}
                  >
                    <input
                      id="designation"
                      name="designation"
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="e.g., District Skill Development Officer"
                      required
                      disabled={loading}
                      className={`${inputClass} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    />
                  </FormField>

                  <FormField
                    label="Employee Code"
                    htmlFor="employeeCode"
                    icon={<UserIcon />}
                  >
                    <input
                      id="employeeCode"
                      name="employeeCode"
                      type="text"
                      value={employeeCode}
                      onChange={(e) => setEmployeeCode(e.target.value)}
                      placeholder="Government employee code"
                      disabled={loading}
                      className={`${inputClass} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    />
                  </FormField>

                  <FormField
                    label="District"
                    htmlFor="governmentDistrictId"
                    icon={<UserIcon />}
                  >
                    <select
                      id="governmentDistrictId"
                      name="governmentDistrictId"
                      value={governmentDistrictId}
                      onChange={(e) => setGovernmentDistrictId(e.target.value)}
                      disabled={loading || dataLoading}
                      className={`${inputClass} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    >
                      <option value="">Select district</option>
                      {districts.map((district) => (
                        <option key={district.id} value={district.id}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    <p className="font-semibold">Government Official Registration</p>
                    <p className="mt-1">
                      Your registration will require administrator verification before you can access the government dashboard.
                    </p>
                  </div>
                </>
              )}

              {selectedRole && (
                <>
                  {/* Terms */}
                  <div className="border-t border-gray-200 pt-6">
                    <label className="flex items-start gap-3 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        required
                        disabled={loading}
                        className="mt-1 h-4 w-4 accent-[#123b63] disabled:cursor-not-allowed"
                      />
                      <span>
                        I confirm that the information provided by me is accurate and I agree to the applicable terms and privacy policy.
                      </span>
                    </label>
                  </div>

                  {/* Create Account */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#123b63] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2d4b] focus:outline-none focus:ring-2 focus:ring-[#123b63] focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </>
              )}

              {!selectedRole && (
                <div className="rounded border border-blue-100 bg-blue-50 px-4 py-8 text-center text-sm text-blue-800">
                  Please select your account type above to continue registration.
                </div>
              )}

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
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
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
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}