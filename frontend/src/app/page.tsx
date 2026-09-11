"use client";

import { useState } from "react";

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [interest, setInterest] = useState("");
  const [suggestion, setSuggestion] = useState("");

  const getSuggestion = () => {
    const suggestions: Record<string, string> = {
      Technology:
        "Software Developer, Data Analyst, AI/ML Engineer, Cloud Support Associate",
      Healthcare:
        "Healthcare Assistant, Medical Lab Technician, Pharmacy Assistant",
      Manufacturing:
        "EV Technician, CNC Operator, Automation Technician",
      Finance:
        "Banking Associate, Financial Analyst, Accounting Executive",
      Design:
        "UI/UX Designer, Graphic Designer, Digital Media Specialist",
      Agriculture:
        "Agri-Tech Assistant, Food Processing Technician, Farm Technology Specialist",
    };

    setSuggestion(
      suggestions[interest] ||
        "Please select your area of interest to get suitable career suggestions."
    );
  };

  return (
    <main className="min-h-screen bg-white text-slate-800">

      {/* ================= TOP GOVERNMENT BAR ================= */}

      <div className="bg-[#123b68] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-2 text-sm">

         <div className="flex items-center gap-3">
  <img
    src="/maharashtra-gov-logo.png"
    alt="Government of Maharashtra"
    className="h-9 w-auto object-contain"
  />

  <span>
    Government of Maharashtra &nbsp; | &nbsp;
    Skill Development, Employment & Entrepreneurship Department
  </span>
</div>

          <div className="hidden items-center gap-4 md:flex">
            <button>मराठी</button>
            <span>|</span>
            <button>English</button>
            <span>|</span>
            <button>A+</button>
            <button>A</button>
            <button>A-</button>
          </div>

        </div>
      </div>


      {/* ================= HEADER ================= */}

      <header className="border-b bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">

          
            {/* REAL SKILLMITRA LOGO */}

<div className="flex items-center">
  <img
    src="/skillmitra-logo.png"
    alt="SkillMitra Logo"
    className="h-20 w-auto object-contain"
  />
</div>

  

          {/* LOGIN */}

          <button
            onClick={() => setShowLogin(true)}
            className="rounded-md bg-[#123b68] px-6 py-3 font-semibold text-white shadow-sm hover:bg-[#0d2d52]"
          >
            Login / Register
          </button>

        </div>


        {/* ================= NAVIGATION ================= */}

        <nav className="border-t bg-white shadow-sm">

          <div className="mx-auto flex max-w-7xl items-center overflow-x-auto px-5">

            <a
              href="#home"
              className="whitespace-nowrap border-b-4 border-blue-700 px-5 py-4 text-sm font-bold text-blue-700"
            >
              Home
            </a>

            {/* INDUSTRY DEMAND IS PROMINENT */}

            <a
              href="#demand"
              className="whitespace-nowrap bg-[#fff7ed] px-5 py-4 text-sm font-bold text-orange-700 hover:bg-orange-50"
            >
              Industry Demand
            </a>

            <a
              href="#career"
              className="whitespace-nowrap px-5 py-4 text-sm font-semibold hover:text-blue-700"
            >
              Career Explorer
            </a>

            <a
              href="#skills"
              className="whitespace-nowrap px-5 py-4 text-sm font-semibold hover:text-blue-700"
            >
              Skills
            </a>

            <a
              href="#courses"
              className="whitespace-nowrap px-5 py-4 text-sm font-semibold hover:text-blue-700"
            >
              Courses & Training
            </a>

            <a
              href="#jobs"
              className="whitespace-nowrap px-5 py-4 text-sm font-semibold hover:text-blue-700"
            >
              Jobs
            </a>

            <a
              href="#planning"
              className="whitespace-nowrap px-5 py-4 text-sm font-semibold hover:text-blue-700"
            >
              District Planning
            </a>

          </div>

        </nav>

      </header>


      {/* ================= HERO ================= */}

      <section
        id="home"
        className="border-b bg-gradient-to-r from-[#eef6ff] via-white to-[#f8fbff]"
      >

        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 md:grid-cols-2">

          <div>

            <p className="mb-3 text-sm font-bold uppercase tracking-wider text-orange-600">
              Maharashtra Skill Development Initiative
            </p>

            <h1 className="text-4xl font-bold leading-tight text-[#123b68] md:text-5xl">

              Build the skills
              <span className="block text-blue-600">
                Maharashtra needs.
              </span>

            </h1>

            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">

              Connect industry demand with skills, job roles, skill gaps,
              courses, training capacity and placement outcomes — all in
              one integrated platform.

            </p>


            <div className="mt-7 flex flex-wrap gap-3">

              <a
                href="#career"
                className="rounded-md bg-[#123b68] px-7 py-3.5 font-semibold text-white shadow-sm hover:bg-[#0c2d51]"
              >
                Explore Careers →
              </a>

              <a
                href="#demand"
                className="rounded-md border border-[#123b68] bg-white px-7 py-3.5 font-semibold text-[#123b68] hover:bg-slate-50"
              >
                Explore Industry Demand
              </a>

            </div>

          </div>


          {/* CAREER JOURNEY */}

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md">

            <div className="mb-5 flex items-center justify-between border-b pb-4">

              <div>

                <p className="text-xs font-semibold uppercase text-slate-400">
                  Example Career Match
                </p>

                <h2 className="mt-1 text-2xl font-bold text-[#123b68]">
                  Data Analyst
                </h2>

              </div>

              <div className="rounded-full bg-green-100 px-4 py-2 font-bold text-green-700">
                87% Match
              </div>

            </div>


            <div className="space-y-4">

              <Journey
                number="1"
                title="Industry Demand"
                text="Data & Analytics"
              />

              <Journey
                number="2"
                title="Required Skills"
                text="Python • SQL • Excel • Power BI"
              />

              <Journey
                number="3"
                title="Skill Gap"
                text="SQL + Power BI"
              />

              <Journey
                number="4"
                title="Recommended Course"
                text="Industry-aligned Data Analytics"
              />

              <Journey
                number="5"
                title="Job Opportunities"
                text="Relevant openings"
              />

            </div>

          </div>

        </div>

      </section>


      {/* ================= INDUSTRY DEMAND AT A GLANCE ================= */}

      <section
        id="demand"
        className="border-b bg-[#f3f7fb]"
      >

        <div className="mx-auto max-w-7xl px-5 py-14">

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>

              <p className="font-bold uppercase tracking-wide text-orange-600">
                Labour Market Intelligence
              </p>

              <h2 className="mt-2 text-3xl font-bold text-[#123b68] md:text-4xl">
                Industry Demand at a Glance
              </h2>

              <p className="mt-3 max-w-3xl leading-7 text-slate-600">

                Understand which skills and job roles are demanded by
                industries and use this information to guide training,
                curriculum and employment decisions.

              </p>

            </div>

            <a
              href="#planning"
              className="font-bold text-[#123b68]"
            >
              View District Demand →
            </a>

          </div>


          {/* DEMAND CARDS */}

          <div className="mt-8 grid gap-5 md:grid-cols-4">

            <DemandStat
              number="High"
              title="Demand for Digital Skills"
              text="AI, Data Analytics, Cloud & Cyber Security"
            />

            <DemandStat
              number="Growing"
              title="Green & EV Jobs"
              text="EV systems, battery and renewable technologies"
            />

            <DemandStat
              number="High"
              title="Healthcare Skills"
              text="Healthcare assistants, diagnostics and support roles"
            />

            <DemandStat
              number="Rising"
              title="Advanced Manufacturing"
              text="Automation, CNC, robotics and industrial technology"
            />

          </div>


          {/* CORE FLOW */}

          <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">

            <h3 className="text-xl font-bold text-[#123b68]">
              From Industry Demand to Training Outcomes
            </h3>

            <div className="mt-6 grid gap-3 md:grid-cols-7">

              {[
                "Industry Demand",
                "Job Roles",
                "Skill Gap",
                "Courses",
                "Training Capacity",
                "Placement",
                "District Planning",
              ].map((item, index) => (

                <div
                  key={item}
                  className="relative rounded-lg border bg-slate-50 p-4 text-center"
                >

                  <p className="text-sm font-bold text-[#123b68]">
                    {item}
                  </p>

                  {index < 6 && (
                    <span className="hidden md:block absolute -right-3 top-1/2 z-10 text-blue-500">
                      →
                    </span>
                  )}

                </div>

              ))}

            </div>

          </div>

        </div>

      </section>


      {/* ================= CAREER EXPLORER ================= */}

      <section
        id="career"
        className="mx-auto max-w-7xl px-5 py-14"
      >

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

          <div>

            <p className="font-bold text-blue-700">
              CAREER EXPLORER
            </p>

            <h2 className="mt-2 text-3xl font-bold text-[#123b68]">
              Which option best describes you?
            </h2>

            <p className="mt-2 text-slate-600">
              Explore career options according to your education and goals.
            </p>

          </div>

          <div className="text-sm font-semibold text-blue-700">
            Explore. Learn. Grow.
          </div>

        </div>


        <div className="mt-8 grid gap-5 md:grid-cols-4">

        <div
  onClick={() => (window.location.href = "/career/10th")}
  className="cursor-pointer"
>
  <Career
    icon="🎓"
    title="Class 10"
    text="Explore career options after Class 10 and build a strong foundation."
  />
</div>
 

         <div
  onClick={() => (window.location.href = "/career/12th")}
  className="cursor-pointer"
>
  <Career
    icon="🎓"
    title="Class 12"
    text="Discover career paths after Class 12 and plan your future."
  />
</div>

          <div
  onClick={() => (window.location.href = "/career/graduation")}
  className="cursor-pointer"
>
  <Career
    icon="🎓"
    title="Graduate"
    text="Explore opportunities after graduation and advance your career."
  />
</div>

          <Career
            icon="💼"
            title="Job Seeker"
            text="Find skill gaps and relevant employment opportunities."
          />

        </div>

      </section>


      {/* ================= PERSONALIZED CAREER SUGGESTIONS ================= */}

      <section className="mx-auto max-w-7xl px-5 pb-14">

        <div className="rounded-xl border border-blue-100 bg-[#f1f7ff] p-7 shadow-sm">

          <div className="grid gap-8 md:grid-cols-[1fr_1.2fr] md:items-center">

            <div>

              <p className="font-bold text-blue-700">
                PERSONALIZED CAREER SUGGESTIONS
              </p>

              <h2 className="mt-2 text-2xl font-bold text-[#123b68]">
                Find careers according to your interests
              </h2>

              <p className="mt-3 leading-7 text-slate-600">

                Select your area of interest and get suitable career
                options, required skills and learning paths.

              </p>

            </div>


            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                What are you interested in?
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">

                <select
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600"
                >

                  <option value="">
                    Select your interest
                  </option>

                  <option value="Technology">
                    Technology & IT
                  </option>

                  <option value="Healthcare">
                    Healthcare
                  </option>

                  <option value="Manufacturing">
                    Manufacturing & EV
                  </option>

                  <option value="Finance">
                    Finance & Banking
                  </option>

                  <option value="Design">
                    Design & Creative
                  </option>

                  <option value="Agriculture">
                    Agriculture & Agri-Tech
                  </option>

                </select>


                <button
                  onClick={getSuggestion}
                  className="whitespace-nowrap rounded-lg bg-[#123b68] px-6 py-3 font-semibold text-white hover:bg-[#0d2d52]"
                >
                  Get Career Suggestions →
                </button>

              </div>


              {suggestion && (
                <div className="mt-4 rounded-lg border border-blue-100 bg-white p-4">

                  <p className="text-sm font-semibold text-blue-700">
                    Suggested Career Paths
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {suggestion}
                  </p>

                </div>
              )}

            </div>

          </div>

        </div>

      </section>


      {/* ================= QUICK SERVICES ================= */}

      <section className="mx-auto max-w-7xl px-5 pb-14">

        <div className="grid gap-5 md:grid-cols-4">

          <InfoCard
            icon="📈"
            title="Skill Gap Analysis"
            text="Identify skills you have and skills you need."
            color="green"
          />

          <InfoCard
            icon="📚"
            title="Courses & Training"
            text="Explore government and partner training opportunities."
            color="blue"
          />

          <InfoCard
            icon="💼"
            title="Jobs & Opportunities"
            text="Find relevant job openings based on your skills."
            color="orange"
          />

          <InfoCard
            icon="📊"
            title="Industry Demand"
            text="Discover in-demand skills and future job trends."
            color="pink"
          />

        </div>

      </section>


      {/* ================= SKILLS ================= */}

      <section
        id="skills"
        className="border-y bg-white"
      >

        <div className="mx-auto max-w-7xl px-5 py-14">

          <div className="grid gap-10 md:grid-cols-2 md:items-center">

            <div>

              <p className="font-bold text-green-600">
                SKILL GAP ANALYSIS
              </p>

              <h2 className="mt-2 text-3xl font-bold text-[#123b68]">
                Learn what the industry actually needs
              </h2>

              <p className="mt-4 leading-7 text-slate-600">

                Don't choose a course just because it is popular.
                SkillMitra compares your target job with your current
                skills and shows exactly what you need to learn.

              </p>

              <button
                onClick={() => setShowLogin(true)}
                className="mt-6 rounded bg-[#123b68] px-6 py-3 font-semibold text-white"
              >
                Check My Skill Gap →
              </button>

            </div>


            <div className="rounded-xl border bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between border-b pb-4">

                <div>

                  <p className="text-xs text-slate-500">
                    TARGET ROLE
                  </p>

                  <h3 className="text-xl font-bold text-[#123b68]">
                    Data Analyst
                  </h3>

                </div>

                <div className="text-right">

                  <p className="text-2xl font-bold text-blue-600">
                    62%
                  </p>

                  <p className="text-xs text-slate-500">
                    Job Readiness
                  </p>

                </div>

              </div>


              <Skill name="Python" status="Ready" />
              <Skill name="Excel" status="Ready" />
              <Skill name="SQL" status="Needs improvement" />
              <Skill name="Power BI" status="Needs improvement" />
              <Skill name="Statistics" status="Ready" />

            </div>

          </div>

        </div>

      </section>


      {/* ================= COURSES ================= */}

      <section
        id="courses"
        className="border-y bg-slate-50"
      >

        <div className="mx-auto max-w-7xl px-5 py-14">

          <p className="font-bold text-blue-700">
            LEARNING PATHWAYS
          </p>

          <h2 className="mt-2 text-3xl font-bold text-[#123b68]">
            Courses & Training aligned with demand
          </h2>

          <p className="mt-2 text-slate-600">
            Courses recommended according to industry demand and skill gaps.
          </p>


          <div className="mt-8 grid gap-5 md:grid-cols-3">

            <Course
              title="Data Analytics"
              skills="Python • SQL • Power BI"
              demand="High Demand"
            />

            <Course
              title="Electric Vehicle Technician"
              skills="EV Systems • Battery • Diagnostics"
              demand="Growing"
            />

            <Course
              title="Cloud Computing"
              skills="AWS • Linux • Networking"
              demand="High Demand"
            />

          </div>

        </div>

      </section>


      {/* ================= TRAINING CAPACITY ================= */}

      <section className="mx-auto max-w-7xl px-5 py-14">

        <div className="rounded-xl border bg-white p-7 shadow-sm">

          <p className="font-bold text-purple-700">
            TRAINING CAPACITY
          </p>

          <h2 className="mt-2 text-3xl font-bold text-[#123b68]">
            Are training opportunities available where they are needed?
          </h2>

          <p className="mt-3 max-w-3xl leading-7 text-slate-600">

            Compare industry demand with available training centres,
            seats and courses to identify capacity gaps across districts.

          </p>


          <div className="mt-8 grid gap-5 md:grid-cols-4">

            <Metric
              number="320+"
              title="Training Centres"
            />

            <Metric
              number="18,500+"
              title="Training Seats"
            />

            <Metric
              number="145+"
              title="Active Courses"
            />

            <Metric
              number="72%"
              title="Average Placement"
            />

          </div>

        </div>

      </section>


      {/* ================= JOBS ================= */}

      <section
        id="jobs"
        className="border-y bg-white"
      >

        <div className="mx-auto max-w-7xl px-5 py-14">

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

            <div>

              <p className="font-bold text-blue-600">
                EMPLOYMENT
              </p>

              <h2 className="mt-2 text-3xl font-bold text-[#123b68]">
                Jobs matching industry demand
              </h2>

              <p className="mt-2 text-slate-600">
                Connect training and skills with real employment opportunities.
              </p>

            </div>

            <button className="font-semibold text-[#123b68]">
              View All Jobs →
            </button>

          </div>


          <div className="mt-8 grid gap-5 md:grid-cols-3">

            <Job
              company="Technology Company"
              role="Junior Data Analyst"
              location="Pune"
              skills="Python • SQL • Excel"
            />

            <Job
              company="Manufacturing Company"
              role="EV Technician"
              location="Nashik"
              skills="EV Systems • Diagnostics"
            />

            <Job
              company="IT Services"
              role="Cloud Support Associate"
              location="Mumbai"
              skills="Linux • Cloud • Networking"
            />

          </div>

        </div>

      </section>


      {/* ================= PLACEMENT OUTCOMES ================= */}

      <section className="bg-[#f3f7fb]">

        <div className="mx-auto max-w-7xl px-5 py-14">

          <p className="font-bold text-green-700">
            PLACEMENT OUTCOMES
          </p>

          <h2 className="mt-2 text-3xl font-bold text-[#123b68]">
            Measure whether training is creating employment outcomes
          </h2>

          <div className="mt-8 grid gap-5 md:grid-cols-3">

            <Outcome
              number="72%"
              title="Average Placement Rate"
              text="Track placement outcomes after skill training."
            />

            <Outcome
              number="68%"
              title="Industry-aligned Training"
              text="Courses mapped with identified job roles and skills."
            />

            <Outcome
              number="84%"
              title="Employer Skill Match"
              text="Measure how closely trained skills match industry requirements."
            />

          </div>

        </div>

      </section>


      {/* ================= DISTRICT PLANNING ================= */}

      <section
        id="planning"
        className="border-y bg-[#eef5fb]"
      >

        <div className="mx-auto max-w-7xl px-5 py-14">

          <p className="font-bold text-orange-600">
            DISTRICT TRAINING PLANNING
          </p>

          <h2 className="mt-2 text-3xl font-bold text-[#123b68]">
            What is in demand near you?
          </h2>

          <p className="mt-2 text-slate-600">
            Use district-level demand to guide training capacity and planning.
          </p>


          <div className="mt-7 flex flex-wrap gap-3">

            {[
              "Pune",
              "Mumbai",
              "Nashik",
              "Nagpur",
              "Kolhapur",
            ].map((district) => (

              <button
                key={district}
                className="rounded border bg-white px-5 py-3 font-medium hover:border-[#123b68]"
              >
                {district}
              </button>

            ))}

          </div>


          <div className="mt-8 grid gap-5 md:grid-cols-3">

            <Demand
              title="Most Demanded Roles"
              items={[
                "Software Developer",
                "Data Analyst",
                "EV Technician",
              ]}
            />

            <Demand
              title="Fast Growing Skills"
              items={[
                "Artificial Intelligence",
                "Cloud Computing",
                "Data Analytics",
              ]}
            />

            <Demand
              title="Priority Skill Gaps"
              items={[
                "Advanced SQL",
                "Cyber Security",
                "Machine Learning",
              ]}
            />

          </div>

        </div>

      </section>


      {/* ================= FOOTER ================= */}

      <footer className="bg-[#071d38] text-white">

        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-4">

          {/* LOGO */}

          <div>

            <img
              src="/skillmitra-logo.png"
              alt="SkillMitra Logo"
              className="mb-5 h-20 w-auto object-contain"
            />

            <p className="text-sm leading-6 text-blue-100">
              Maharashtra Skill & Career Guidance Portal connecting
              industry demand, skills, training and employment.
            </p>

          </div>


          {/* QUICK LINKS */}

          <div>

            <h3 className="text-lg font-bold">
              Quick Links
            </h3>

            <div className="mt-4 space-y-3 text-sm text-blue-100">

              <a href="#home" className="block hover:text-white">
                Home
              </a>

              <a href="#career" className="block hover:text-white">
                Career Explorer
              </a>

              <a href="#skills" className="block hover:text-white">
                Skill Assessment
              </a>

              <a href="#courses" className="block hover:text-white">
                Courses & Training
              </a>

              <a href="#jobs" className="block hover:text-white">
                Jobs
              </a>

              <a href="#demand" className="block hover:text-white">
                Industry Demand
              </a>

            </div>

          </div>


          {/* IMPORTANT LINKS */}

          <div>

            <h3 className="text-lg font-bold">
              Important Links
            </h3>

            <div className="mt-4 space-y-3 text-sm text-blue-100">

              <a href="#about" className="block hover:text-white">
                About SkillMitra
              </a>

              <a href="#privacy" className="block hover:text-white">
                Privacy Policy
              </a>

              <a href="#terms" className="block hover:text-white">
                Terms & Conditions
              </a>

              <a href="#sitemap" className="block hover:text-white">
                Sitemap
              </a>

              <a href="#contact" className="block hover:text-white">
                Contact Us
              </a>

              <a href="#support" className="block hover:text-white">
                Support Ticket
              </a>

            </div>

          </div>


          {/* GOVERNMENT + SOCIAL */}

          <div>

            <h3 className="text-lg font-bold">
              Government & Support
            </h3>

            <div className="mt-4 space-y-2 text-sm text-blue-100">

              <p>
                Government of Maharashtra
              </p>

              <p>
                Skill Development Department
              </p>

              <p>
                Maharashtra State Skill Development Society
              </p>

              <p>
                National Career Service
              </p>

              <p className="pt-2">
                ✉ support@skillmitra.gov.in
              </p>

            </div>


            {/* SOCIAL LINKS */}

            <div className="mt-5">

              <p className="mb-3 text-sm font-semibold">
                Follow Us
              </p>

              <div className="flex gap-2">

                <a
                  href="#"
                  aria-label="X"
                  className="flex h-9 w-9 items-center justify-center rounded bg-black text-sm font-bold hover:opacity-80"
                >
                  X
                </a>

                <a
                  href="#"
                  aria-label="Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded bg-blue-600 text-sm font-bold hover:opacity-80"
                >
                  f
                </a>

                <a
                  href="#"
                  aria-label="YouTube"
                  className="flex h-9 w-9 items-center justify-center rounded bg-red-600 text-sm font-bold hover:opacity-80"
                >
                  ▶
                </a>

                <a
                  href="#"
                  aria-label="Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded bg-pink-600 text-sm font-bold hover:opacity-80"
                >
                  ◎
                </a>

                <a
                  href="#"
                  aria-label="LinkedIn"
                  className="flex h-9 w-9 items-center justify-center rounded bg-blue-700 text-sm font-bold hover:opacity-80"
                >
                  in
                </a>

              </div>

            </div>

          </div>

        </div>


        {/* FOOTER BOTTOM */}

        <div className="border-t border-white/20">

          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-5 py-5 text-center text-sm text-blue-100 md:flex-row md:text-left">

            <p>
              © 2026 SkillMitra | Government of Maharashtra
            </p>

            <div className="flex justify-center gap-5 md:justify-end">

              <a href="#privacy" className="hover:text-white">
                Privacy Policy
              </a>

              <a href="#terms" className="hover:text-white">
                Terms & Conditions
              </a>

              <a href="#sitemap" className="hover:text-white">
                Sitemap
              </a>

            </div>

          </div>

        </div>

      </footer>


      {/* ================= LOGIN MODAL ================= */}

      {showLogin && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5">

          <div className="w-full max-w-md rounded-xl bg-white p-7 shadow-2xl">

            <div className="flex items-center justify-between">

              <h2 className="text-2xl font-bold text-[#123b68]">
                Login / Register
              </h2>

              <button
                onClick={() => setShowLogin(false)}
                className="text-2xl text-slate-500 hover:text-black"
              >
                ×
              </button>

            </div>

            <p className="mt-2 text-sm text-slate-500">
              Login to start your personalized career journey.
            </p>


            <input
              className="mt-6 w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-600"
              placeholder="Mobile Number / Email"
            />


            <button
              onClick={() => setShowLogin(false)}
              className="mt-4 w-full rounded-lg bg-[#123b68] py-3 font-semibold text-white hover:bg-[#0d2d52]"
            >
              Continue
            </button>

          </div>

        </div>

      )}

    </main>
  );
}


/* =========================================================
   COMPONENTS
========================================================= */


function Journey({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
        {number}
      </div>

      <div>

        <p className="font-semibold text-slate-800">
          {title}
        </p>

        <p className="text-sm text-slate-500">
          {text}
        </p>

      </div>

    </div>
  );
}


function DemandStat({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">

      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
        {number}
      </span>

      <h3 className="mt-4 text-lg font-bold text-[#123b68]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {text}
      </p>

    </div>
  );
}


function Career({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-3xl">
        {icon}
      </div>

      <h3 className="mt-4 text-xl font-bold text-[#123b68]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {text}
      </p>

      <button className="mt-5 font-semibold text-blue-700">
        Explore →
      </button>

    </div>
  );
}


function InfoCard({
  icon,
  title,
  text,
  color,
}: {
  icon: string;
  title: string;
  text: string;
  color: "green" | "blue" | "orange" | "pink";
}) {

  const styles = {
    green: "bg-green-50 border-green-100 text-green-700",
    blue: "bg-blue-50 border-blue-100 text-blue-700",
    orange: "bg-orange-50 border-orange-100 text-orange-700",
    pink: "bg-pink-50 border-pink-100 text-pink-700",
  };

  return (
    <div className={`rounded-xl border p-6 ${styles[color]}`}>

      <div className="text-3xl">
        {icon}
      </div>

      <h3 className="mt-4 text-lg font-bold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {text}
      </p>

    </div>
  );
}


function Skill({
  name,
  status,
}: {
  name: string;
  status: string;
}) {

  const ready = status === "Ready";

  return (
    <div className="flex items-center justify-between border-b py-4">

      <span className="font-medium">
        {name}
      </span>

      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          ready
            ? "bg-green-100 text-green-700"
            : "bg-orange-100 text-orange-700"
        }`}
      >
        {ready ? "✓ " : "⚠ "}
        {status}
      </span>

    </div>
  );
}


function Course({
  title,
  skills,
  demand,
}: {
  title: string;
  skills: string;
  demand: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">

      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
        {demand}
      </span>

      <h3 className="mt-5 text-xl font-bold text-[#123b68]">
        {title}
      </h3>

      <p className="mt-3 text-sm text-slate-600">
        {skills}
      </p>

      <button className="mt-5 font-semibold text-blue-700">
        View Course →
      </button>

    </div>
  );
}


function Metric({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
  return (
    <div className="rounded-lg border bg-slate-50 p-5 text-center">

      <p className="text-3xl font-bold text-[#123b68]">
        {number}
      </p>

      <p className="mt-2 text-sm text-slate-600">
        {title}
      </p>

    </div>
  );
}


function Job({
  company,
  role,
  location,
  skills,
}: {
  company: string;
  role: string;
  location: string;
  skills: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">

      <p className="text-sm text-slate-500">
        {company}
      </p>

      <h3 className="mt-2 text-xl font-bold text-[#123b68]">
        {role}
      </h3>

      <p className="mt-2 text-sm">
        📍 {location}
      </p>

      <p className="mt-3 text-sm text-slate-600">
        Skills: {skills}
      </p>

      <button className="mt-5 rounded border border-[#123b68] px-4 py-2 text-sm font-semibold text-[#123b68]">
        View Job
      </button>

    </div>
  );
}


function Outcome({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">

      <p className="text-3xl font-bold text-green-600">
        {number}
      </p>

      <h3 className="mt-3 text-lg font-bold text-[#123b68]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {text}
      </p>

    </div>
  );
}


function Demand({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">

      <h3 className="font-bold text-[#123b68]">
        {title}
      </h3>

      <ul className="mt-4 space-y-3 text-sm text-slate-600">

        {items.map((item) => (
          <li key={item}>
            • {item}
          </li>
        ))}

      </ul>

    </div>
  );
}