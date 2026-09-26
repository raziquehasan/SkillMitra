"use client";

import { useState } from "react";
import Link from "next/link";

export default function TrainingCapacityPage() {
  const [selectedDistrict, setSelectedDistrict] = useState("Pune");

  return (
    <main className="min-h-screen bg-[#f4f7fa] text-slate-800">
      {/* Government Top Bar */}
      <header className="fixed left-0 right-0 top-0 z-50 bg-[#123b68] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-5">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0">
                <img 
                  src="/maharashtra-gov-logo.png" 
                  alt="Government of Maharashtra"
                  className="h-10 w-10 object-contain"
                />
              </div>
              <div>
                <p className="text-xs font-semibold">Government of Maharashtra</p>
                <p className="text-[11px] text-white/80">Skills, Employment, Entrepreneurship & Innovation Department</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm lg:block">SkillMitra</span>
            <Link href="/" className="text-sm hover:underline">Home</Link>
          </div>
        </div>
      </header>

      <div className="fixed left-0 right-0 top-[60px] z-50 h-1 bg-[#c2410c]" />

      {/* Main Content */}
      <div className="min-h-screen pt-[65px]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-5 lg:px-6">
          
          {/* Page Header */}
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-wide text-[#c2410c]">TRAINING CAPACITY</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
              Explore Training Capacity
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              District-wise and skill-wise training availability across Maharashtra.
            </p>
          </div>

          {/* Summary */}
          <div className="mb-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border bg-blue-50 p-4">
              <p className="text-sm text-slate-500">Total Capacity</p>
              <p className="mt-1 text-2xl font-bold text-[#123b68]">18,450</p>
            </div>
            <div className="rounded-xl border bg-green-50 p-4">
              <p className="text-sm text-slate-500">Available Seats</p>
              <p className="mt-1 text-2xl font-bold text-green-600">6,820</p>
            </div>
            <div className="rounded-xl border bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Training Centres</p>
              <p className="mt-1 text-2xl font-bold text-[#123b68]">342</p>
            </div>
            <div className="rounded-xl border bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Districts</p>
              <p className="mt-1 text-2xl font-bold text-[#123b68]">36</p>
            </div>
          </div>

          {/* District Wise */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#123b68]">
                District-wise Training Capacity
              </h3>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                Select a district
              </span>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {[
                {
                  district: "Pune",
                  centres: 42,
                  capacity: 2450,
                  available: 680,
                },
                {
                  district: "Mumbai",
                  centres: 55,
                  capacity: 3100,
                  available: 920,
                },
                {
                  district: "Nagpur",
                  centres: 38,
                  capacity: 1980,
                  available: 540,
                },
                {
                  district: "Nashik",
                  centres: 35,
                  capacity: 1720,
                  available: 610,
                },
                {
                  district: "Aurangabad",
                  centres: 31,
                  capacity: 1580,
                  available: 480,
                },
                {
                  district: "Kolhapur",
                  centres: 27,
                  capacity: 1320,
                  available: 390,
                },
              ].map((item) => (
                <button
                  key={item.district}
                  onClick={() => setSelectedDistrict(item.district)}
                  className={`rounded-xl border p-4 text-left transition ${
                    selectedDistrict === item.district
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                      : "bg-white hover:border-blue-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-[#123b68]">{item.district}</h4>
                    <span className="text-blue-600">→</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-slate-500">Centres</p>
                      <p className="font-bold text-slate-800">{item.centres}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Capacity</p>
                      <p className="font-bold text-slate-800">{item.capacity}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs text-slate-500">Available Seats</p>
                    <p className="font-bold text-green-600">{item.available}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected District */}
          <div className="mb-8 rounded-xl border bg-slate-50 p-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Selected District</p>
                <h3 className="text-2xl font-bold text-[#123b68]">{selectedDistrict}</h3>
              </div>
              <div className="rounded-lg bg-green-100 px-4 py-2">
                <p className="text-xs font-medium text-green-700">STATUS</p>
                <p className="font-bold text-green-700">Seats Available</p>
              </div>
            </div>

            {/* Skills */}
            <div className="mt-5">
              <h4 className="font-bold text-[#123b68]">Available Skills</h4>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {[
                  {
                    skill: "Data Analytics",
                    seats: 120,
                    duration: "4 Months",
                  },
                  {
                    skill: "Electric Vehicle Technician",
                    seats: 180,
                    duration: "6 Months",
                  },
                  {
                    skill: "Solar Technician",
                    seats: 95,
                    duration: "3 Months",
                  },
                  {
                    skill: "Digital Marketing",
                    seats: 140,
                    duration: "3 Months",
                  },
                  {
                    skill: "Healthcare Assistant",
                    seats: 160,
                    duration: "6 Months",
                  },
                  {
                    skill: "Web Development",
                    seats: 110,
                    duration: "4 Months",
                  },
                ].map((item) => (
                  <div key={item.skill} className="rounded-lg border bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h5 className="font-bold text-slate-800">{item.skill}</h5>
                        <p className="mt-1 text-xs text-slate-500">Training duration: {item.duration}</p>
                      </div>
                      <span className="whitespace-nowrap rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-600">
                        {item.seats} seats
                      </span>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-green-500"
                        style={{ width: `${Math.min((item.seats / 200) * 100, 100)}%` }}
                      />
                    </div>
                    <button
                      className="mt-3 text-sm font-bold text-blue-600 hover:text-blue-800"
                      onClick={() => alert(`Training details for ${item.skill} in ${selectedDistrict}`)}
                    >
                      View Training Details →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Training Providers */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-[#123b68]">Training Providers</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {["Government ITI", "Skill Development Centres", "PMKVY Training Centres"].map((provider) => (
                <div key={provider} className="rounded-xl border bg-white p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-lg">
                      🏫
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{provider}</p>
                      <p className="text-xs text-slate-500">Training provider</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Info */}
          <div className="rounded-xl bg-[#123b68] p-5 text-white">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-bold">Want to find a suitable training centre?</h3>
                <p className="mt-1 text-sm text-blue-100">
                  Select a district and explore available skills and seats.
                </p>
              </div>
              <Link
                href="/courses"
                className="rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-[#123b68] hover:bg-blue-50"
              >
                Browse Courses
              </Link>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}