"use client";

import { useState } from "react";
import { GovernmentShell } from "@/app/government/GovernmentShell";
import {
  HelpCircle,
  BookOpen,
  MessageSquare,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How do I generate district skill gap reports?",
    answer:
      "Navigate to Reports & Analytics, select the District Skill Gap Report, and click Generate. The report will pull the latest demand and coverage data for your jurisdiction.",
  },
  {
    question: "How are employer demand signals aggregated?",
    answer:
      "Demand signals are collected from employer surveys, job postings, and industry sector inputs. They are aggregated by district, sector, and job role to produce demand scores.",
  },
  {
    question: "What does course alignment status mean?",
    answer:
      "Alignment status indicates how well a course covers the skills demanded by industry. MULTIPLE means full coverage, PARTIAL means some skills are covered, and NONE means significant gaps exist.",
  },
  {
    question: "How do I manage user accounts?",
    answer:
      "Government Admins can access User Management from the sidebar. You can filter by role and view all registered users. Full user administration requires backend support.",
  },
  {
    question: "How is training capacity calculated?",
    answer:
      "Capacity is based on verified training providers, available seats, trainer count, and equipment. Utilization rates show how effectively capacity is being used.",
  },
  {
    question: "What do notification severity levels mean?",
    answer:
      "Critical alerts require immediate attention (data issues, system errors). Warnings indicate potential problems. Info notifications are general updates and confirmations.",
  },
];

const platformGuides = [
  { title: "Getting Started Guide", url: "#", description: "Overview of the government portal features and navigation." },
  { title: "Dashboard Overview", url: "#", description: "Understanding the main dashboard and KPIs." },
  { title: "Reports & Analytics", url: "#", description: "Generating and exporting analytical reports." },
  { title: "Training Planning", url: "#", description: "Using district training plans and recommendations." },
  { title: "User Management", url: "#", description: "Managing platform users and role assignments." },
];

type Priority = "low" | "medium" | "high" | "urgent";

export default function SupportPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  // Contact form
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactPriority, setContactPriority] = useState<Priority>("medium");
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Issue form
  const [issueType, setIssueType] = useState("bug");
  const [issueDescription, setIssueDescription] = useState("");
  const [issueScreenshot, setIssueScreenshot] = useState("");
  const [issuePriority, setIssuePriority] = useState<Priority>("medium");
  const [issueSubmitted, setIssueSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setContactName("");
    setContactEmail("");
    setContactSubject("");
    setContactMessage("");
    setContactPriority("medium");
    setTimeout(() => setContactSubmitted(false), 5000);
  };

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIssueSubmitted(true);
    setIssueType("bug");
    setIssueDescription("");
    setIssueScreenshot("");
    setIssuePriority("medium");
    setTimeout(() => setIssueSubmitted(false), 5000);
  };

  return (
    <GovernmentShell>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle className="h-7 w-7 text-[#123b68]" />
            <h1 className="text-3xl font-bold text-[#123b68]">Help & Support</h1>
          </div>
          <p className="text-slate-600">
            Find answers, access guides, and submit support requests.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* FAQ Section */}
          <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-[#c2410c]" />
              <h2 className="text-lg font-semibold text-[#123b68]">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-2">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-slate-700 pr-4">{faq.question}</span>
                    {openFAQ === idx ? (
                      <ChevronUp className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    )}
                  </button>
                  {openFAQ === idx && (
                    <div className="px-4 pb-3 border-t border-slate-100">
                      <p className="text-sm text-slate-600 mt-2">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Platform Guide */}
          <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-[#c2410c]" />
              <h2 className="text-lg font-semibold text-[#123b68]">Platform Guides</h2>
            </div>
            <div className="space-y-3">
              {platformGuides.map((guide, idx) => (
                <a
                  key={idx}
                  href={guide.url}
                  className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 text-[#123b68] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-[#123b68]">{guide.title}</p>
                    <p className="text-xs text-slate-500">{guide.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Support Form */}
        <div className="min-w-0 mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-[#c2410c]" />
            <h2 className="text-lg font-semibold text-[#123b68]">Contact Support</h2>
          </div>

          {contactSubmitted && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-700">Support request submitted successfully.</p>
            </div>
          )}

          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#123b68]/30"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#123b68]/30"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                value={contactSubject}
                onChange={(e) => setContactSubject(e.target.value)}
                className="w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#123b68]/30"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                rows={4}
                className="w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#123b68]/30 resize-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select
                value={contactPriority}
                onChange={(e) => setContactPriority(e.target.value as Priority)}
                className="border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#123b68]/30"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#123b68] text-white text-sm font-medium rounded-lg hover:bg-[#123b68]/90 transition-colors"
            >
              <Send className="h-4 w-4" />
              Submit Request
            </button>
          </form>
        </div>

        {/* Report Issue Form */}
        <div className="min-w-0 mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-[#c2410c]" />
            <h2 className="text-lg font-semibold text-[#123b68]">Report an Issue</h2>
          </div>

          {issueSubmitted && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-700">Issue reported successfully.</p>
            </div>
          )}

          <form onSubmit={handleIssueSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Issue Type</label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#123b68]/30"
                >
                  <option value="bug">Bug</option>
                  <option value="feature">Feature Request</option>
                  <option value="data">Data Issue</option>
                  <option value="access">Access Problem</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                <select
                  value={issuePriority}
                  onChange={(e) => setIssuePriority(e.target.value as Priority)}
                  className="border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#123b68]/30"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                rows={4}
                className="w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#123b68]/30 resize-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Screenshot URL (optional)</label>
              <input
                type="url"
                value={issueScreenshot}
                onChange={(e) => setIssueScreenshot(e.target.value)}
                placeholder="https://..."
                className="w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#123b68]/30"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#c2410c] text-white text-sm font-medium rounded-lg hover:bg-[#c2410c]/90 transition-colors"
            >
              <Send className="h-4 w-4" />
              Report Issue
            </button>
          </form>
        </div>
      </div>
    </GovernmentShell>
  );
}
