import Link from "next/link";

const studyOptions = [
  {
    icon: "🔬",
    title: "Science",
    description:
      "For students interested in Science, Mathematics, technology and scientific subjects.",
    options: [
      "PCM – Physics, Chemistry, Mathematics",
      "PCB – Physics, Chemistry, Biology",
      "PCMB – Physics, Chemistry, Mathematics, Biology",
      "Basic Sciences",
      "Engineering & Technology",
      "Medical & Healthcare",
    ],
  },
  {
    icon: "💼",
    title: "Commerce",
    description:
      "For students interested in business, finance, accounts and economics.",
    options: [
      "Accountancy",
      "Economics",
      "Business Studies",
      "Banking & Finance",
      "Management",
      "Entrepreneurship",
    ],
  },
  {
    icon: "🎨",
    title: "Arts / Humanities",
    description:
      "For students interested in society, languages, creativity and humanities.",
    options: [
      "History",
      "Political Science",
      "Geography",
      "Psychology",
      "Sociology",
      "Languages",
      "Law",
      "Media & Journalism",
    ],
  },
  {
    icon: "🛠️",
    title: "ITI",
    description:
      "For students who want to develop practical and technical skills.",
    options: [
      "Electrician",
      "Fitter",
      "Welder",
      "COPA / Computer",
      "Mechanic",
      "Electronics",
      "Plumber",
    ],
  },
  {
    icon: "🏗️",
    title: "Diploma / Polytechnic",
    description:
      "A technical education pathway for students interested in engineering and technology.",
    options: [
      "Civil Engineering",
      "Mechanical Engineering",
      "Electrical Engineering",
      "Computer Engineering",
      "Electronics",
      "Automobile Engineering",
    ],
  },
  {
    icon: "💻",
    title: "Vocational / Skill Courses",
    description:
      "Job-oriented courses focused on practical and industry-relevant skills.",
    options: [
      "Computer & IT",
      "Healthcare",
      "Retail",
      "Tourism & Hospitality",
      "Beauty & Wellness",
      "Media & Design",
      "Agriculture",
    ],
  },
  {
    icon: "🌾",
    title: "Agriculture & Allied Fields",
    description:
      "For students interested in agriculture and related rural-sector fields.",
    options: [
      "Agriculture",
      "Horticulture",
      "Dairy",
      "Fisheries",
      "Animal Husbandry",
    ],
  },
  {
    icon: "🎭",
    title: "Creative & Other Fields",
    description:
      "Explore creative, sports and other specialised education pathways.",
    options: [
      "Fine Arts",
      "Design",
      "Hotel Management",
      "Sports",
      "Performing Arts",
      "Defence-oriented Preparation",
    ],
  },
];

export default function Class10Page() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">

      {/* Top Bar */}
      <div className="border-b bg-slate-100">
        <div className="mx-auto max-w-7xl px-6 py-2 text-sm text-slate-600">
          Government of Maharashtra | Skill Development, Employment &
          Entrepreneurship Department
        </div>
      </div>

      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <Link href="/">
            <img
              src="/skillmitra-logo.png"
              alt="SkillMitra"
              className="h-16 w-auto"
            />
          </Link>

          <Link
            href="/"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            ← Home
          </Link>

        </div>
      </header>

      {/* Hero */}
      <section className="bg-blue-700 text-white">
        <div className="mx-auto max-w-7xl px-6 py-12">

          <p className="text-sm font-semibold uppercase tracking-wide text-blue-100">
            Career Planning • Class 10
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            What Can You Study After Class 10?
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-7 text-blue-100">
            Explore different study, skill and career pathways available
            after Class 10. Choose a path based on your interests and goals.
          </p>

        </div>
      </section>

      {/* Study Options */}
      <section className="mx-auto max-w-7xl px-6 py-12">

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Study & Career Pathways
          </h2>

          <p className="mt-2 text-slate-600">
            Explore the major education and career options available after Class 10.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">

          {studyOptions.map((field) => (
            <div
              key={field.title}
              className="rounded-2xl border bg-white p-6 shadow-sm"
            >

              <div className="flex items-start gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                  {field.icon}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {field.title}
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {field.description}
                  </p>
                </div>

              </div>

              <div className="mt-5 border-t pt-5">

                <p className="mb-3 text-sm font-semibold text-slate-700">
                  Areas you can explore:
                </p>

                <div className="grid gap-2 sm:grid-cols-2">

                  {field.options.map((option) => (
                    <div
                      key={option}
                      className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700"
                    >
                      ✓ {option}
                    </div>
                  ))}

                </div>

              </div>

            </div>
          ))}

        </div>

      </section>

      {/* Career Guidance */}
      <section className="mx-auto max-w-7xl px-6 pb-12">

        <div className="rounded-2xl border bg-white p-7 shadow-sm">

          <h2 className="text-2xl font-bold text-slate-900">
            How Should You Choose?
          </h2>

          <p className="mt-2 text-slate-600">
            Consider your interests, strengths, subjects and future career goals
            before selecting a pathway.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">

            <div className="rounded-xl bg-blue-50 p-4">
              <p className="font-semibold text-slate-900">
                ❤️ Your Interests
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Which subjects or fields do you enjoy the most?
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-4">
              <p className="font-semibold text-slate-900">
                💡 Your Strengths
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Which subjects and skills are you strongest in?
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-4">
              <p className="font-semibold text-slate-900">
                🎯 Your Career Goal
              </p>
              <p className="mt-1 text-sm text-slate-600">
                What type of career would you like to pursue in the future?
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-4">
              <p className="font-semibold text-slate-900">
                📚 Your Learning Path
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Choose between academic education, diploma, ITI or skill training.
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-14">

        <div className="rounded-2xl bg-slate-900 p-7 text-white">

          <h2 className="text-2xl font-bold">
            Plan Your Career with SkillMitra
          </h2>

          <p className="mt-2 max-w-2xl text-slate-300">
            Explore skills, courses, industry demand and career opportunities
            to make informed career decisions.
          </p>

          <Link
            href="/"
            className="mt-5 inline-block rounded-lg bg-white px-5 py-3 font-semibold text-slate-900 hover:bg-slate-100"
          >
            Explore SkillMitra →
          </Link>

        </div>

      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6 text-center text-sm text-slate-500">
          © 2026 SkillMitra — Career Planning
        </div>
      </footer>

    </main>
  );
}