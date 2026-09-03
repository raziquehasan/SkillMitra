"use client";

import { TrainingProviderShell } from "@/app/training-provider/TrainingProviderShell";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Search,
  BookOpen,
  GraduationCap,
  TrendingUp,
  BarChart3,
  User,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Plus,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Phone,
  Mail,
  ExternalLink,
  Bell,
  X,
  Loader2,
} from "lucide-react";

export default function Support() {
  return (
    <TrainingProviderShell>
      <SupportContent />
    </TrainingProviderShell>
  );
}

function SupportContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const helpCategories = [
    { id: "courses", title: "Course Management", icon: <BookOpen className="h-6 w-6" />, description: "Manage and update training courses", articles: 12 },
    { id: "curriculum", title: "Curriculum Alignment", icon: <GraduationCap className="h-6 w-6" />, description: "Align courses with industry requirements", articles: 8 },
    { id: "capacity", title: "Training Capacity", icon: <TrendingUp className="h-6 w-6" />, description: "Manage training capacity and infrastructure", articles: 6 },
    { id: "demand", title: "Industry Demand", icon: <BarChart3 className="h-6 w-6" />, description: "Understand industry skill demand", articles: 10 },
    { id: "reports", title: "Reports & Analytics", icon: <BarChart3 className="h-6 w-6" />, description: "Generate and analyze reports", articles: 7 },
    { id: "account", title: "Account & Profile", icon: <User className="h-6 w-6" />, description: "Manage your account and profile", articles: 5 },
    { id: "notifications", title: "Notifications", icon: <Bell className="h-6 w-6" />, description: "Configure notification preferences", articles: 3 },
    { id: "technical", title: "Technical Issues", icon: <Settings className="h-6 w-6" />, description: "Troubleshoot technical problems", articles: 9 },
  ];

  const faqs = [
    {
      id: 1,
      question: "How do I add a new course?",
      answer: "To add a new course, navigate to the Training section in your dashboard and click on 'My Courses'. Then click the 'Add New Course' button and fill in the required information including course details, curriculum, and capacity."
    },
    {
      id: 2,
      question: "How is course alignment calculated?",
      answer: "Course alignment is calculated by comparing the skills covered in your curriculum against industry demand signals. The system analyzes skill gaps and provides an alignment percentage. Higher alignment means your course better matches industry requirements."
    },
    {
      id: 3,
      question: "How do I update training capacity?",
      answer: "You can update training capacity from the Training Capacity page. Modify the sanctioned seats, active seats, and utilized seats for each course. The system will automatically calculate utilization rates and alert you about capacity gaps."
    },
    {
      id: 4,
      question: "Why is my course showing a skill gap?",
      answer: "A skill gap appears when industry demand exceeds the skill coverage in your course curriculum. This indicates that you may need to update your curriculum to include missing skills or offer additional training modules."
    },
    {
      id: 5,
      question: "How do I update institute information?",
      answer: "Navigate to Institute Profile and click 'Edit Profile'. You can update contact information, address, and other editable fields. Note that some fields like registration number and verification status cannot be changed without proper authorization."
    },
    {
      id: 6,
      question: "How do I view industry demand?",
      answer: "The Industry Demand section shows real-time skill demand signals from employers. You can filter by district, sector, and time period to understand which skills are in high demand in your area."
    },
    {
      id: 7,
      question: "How do I generate reports?",
      answer: "Go to Reports & Analytics and select the type of report you need. You can generate district skill gap reports, industry demand reports, training capacity reports, and more. Reports can be exported in various formats."
    },
    {
      id: 8,
      question: "How do I manage trainers?",
      answer: "The Trainers section allows you to add, update, and manage trainer information. You can track trainer certifications, skills, and training load. The system will alert you when trainer certifications are expiring."
    },
    {
      id: 9,
      question: "How do I update my notification preferences?",
      answer: "Go to Settings and navigate to Notification Preferences. You can choose which types of notifications you want to receive and how you want to receive them (email, in-app, SMS)."
    },
  ];

  const myTickets = [
    { id: "SP-1024", subject: "Course enrollment issue", category: "Courses", priority: "High", status: "In Progress", created: "2 days ago", updated: "1 day ago" },
    { id: "SP-1021", subject: "Profile update request", category: "Account", priority: "Medium", status: "Resolved", created: "1 week ago", updated: "3 days ago" },
    { id: "SP-1018", subject: "Capacity planning assistance", category: "Capacity", priority: "Low", status: "Open", created: "2 weeks ago", updated: "1 week ago" },
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoadingTickets(true);
      const data = await api.supportTickets();
      setTickets(data);
    } catch {
      // Use fallback data if API fails
      setTickets(myTickets);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleTicketSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setSubmittingTicket(true);
      const formData = new FormData(e.currentTarget);
      const ticketData = {
        category: formData.get("category") as string,
        subject: formData.get("subject") as string,
        priority: formData.get("priority") as string,
        description: formData.get("description") as string,
      };

      await api.createSupportTicket(ticketData);
      setTicketSuccess(true);
      setShowTicketForm(false);
      setTimeout(() => setTicketSuccess(false), 3000);
      fetchTickets(); // Refresh ticket list
    } catch (error) {
      console.error("Failed to submit support ticket:", error);
    } finally {
      setSubmittingTicket(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1e293b]">Support Centre</h1>
        <p className="mt-2 text-slate-600">
          Get help with courses, training operations, data, reports and your institute account.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search help articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
        />
      </div>

      {/* Help Categories */}
      <div>
        <h2 className="text-lg font-semibold text-[#1e293b] mb-4">Popular Help</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {helpCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-4 rounded-lg border border-slate-300 bg-white shadow-sm hover:shadow-md transition-all text-left ${
                selectedCategory === category.id ? "border-[#1e3a8a] ring-2 ring-[#1e3a8a]/20" : ""
              }`}
            >
              <div className={`p-2 rounded-lg mb-3 ${selectedCategory === category.id ? "bg-[#1e3a8a] text-white" : "bg-slate-100 text-slate-600"}`}>
                {category.icon}
              </div>
              <h3 className="font-medium text-[#1e293b] mb-1">{category.title}</h3>
              <p className="text-sm text-slate-500 mb-2">{category.description}</p>
              <p className="text-xs text-slate-400">{category.articles} articles</p>
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div>
        <h2 className="text-lg font-semibold text-[#1e293b] mb-4">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {filteredFaqs.map((faq) => (
            <div key={faq.id} className="border border-slate-300 rounded-lg bg-white overflow-hidden">
              <button
                onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
              >
                <span className="font-medium text-[#1e293b]">{faq.question}</span>
                {expandedFaq === faq.id ? (
                  <ChevronUp className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                )}
              </button>
              {expandedFaq === faq.id && (
                <div className="p-4 pt-0 text-sm text-slate-600 border-t border-slate-200">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* My Support Requests */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#1e293b]">My Support Requests</h2>
          <button
            onClick={() => setShowTicketForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#1e3a8a] border border-[#1e3a8a] rounded-lg hover:bg-[#1e3a8a]/5 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Raise Support Request
          </button>
        </div>

        {ticketSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-sm text-green-800">Your support request has been submitted successfully.</p>
          </div>
        )}

        {loadingTickets ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#1e3a8a]" />
          </div>
        ) : (
          <div className="border border-slate-300 rounded-lg bg-white overflow-hidden">
            <div className="overflow-x-auto w-full">
            <table data-wrapped="true" className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Ticket</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                      No support requests found. Click "Raise Support Request" to create one.
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium text-[#1e3a8a]">{ticket.id?.slice(0, 8) || "N/A"}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{ticket.subject}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{ticket.category}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
                          ticket.priority === "high" ? "bg-red-100 text-red-800" :
                          ticket.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                          ticket.priority === "critical" ? "bg-red-100 text-red-800" :
                          "bg-blue-100 text-blue-800"
                        }`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded ${
                          ticket.status === "resolved" ? "bg-green-100 text-green-800" :
                          ticket.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                          ticket.status === "waiting_for_response" ? "bg-yellow-100 text-yellow-800" :
                          "bg-slate-100 text-slate-800"
                        }`}>
                          {ticket.status === "resolved" && <CheckCircle className="h-3.5 w-3.5" />}
                          {ticket.status === "in_progress" && <Clock className="h-3.5 w-3.5" />}
                          {ticket.status === "open" && <AlertCircle className="h-3.5 w-3.5" />}
                          {ticket.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : "N/A"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          </div>
        )}
      </div>

      {/* Contact Options */}
      <div>
        <h2 className="text-lg font-semibold text-[#1e293b] mb-4">Need more help?</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="min-w-0 p-4 rounded-lg border border-slate-300 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
              <Phone className="h-5 w-5 text-[#1e3a8a]" />
              <p className="font-medium text-[#1e293b]">Support Phone</p>
            </div>
            <p className="text-sm text-slate-600">1800-123-4567</p>
            <p className="text-xs text-slate-400 mt-1">Mon-Fri, 9AM-6PM</p>
          </div>
          <div className="min-w-0 p-4 rounded-lg border border-slate-300 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="h-5 w-5 text-[#1e3a8a]" />
              <p className="font-medium text-[#1e293b]">Support Email</p>
            </div>
            <p className="text-sm text-slate-600">support@skillmitra.gov.in</p>
            <p className="text-xs text-slate-400 mt-1">Response within 24 hours</p>
          </div>
          <div className="min-w-0 p-4 rounded-lg border border-slate-300 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="font-medium text-[#1e293b]">Emergency Issues</p>
            </div>
            <p className="text-sm text-slate-600">For critical technical issues</p>
            <p className="text-xs text-slate-400 mt-1">Use the ticket system with High priority</p>
          </div>
        </div>
      </div>

      {/* Ticket Form Modal */}
      {showTicketForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#1e293b]">Raise Support Request</h2>
                <button
                  onClick={() => setShowTicketForm(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <form id="ticket-form" onSubmit={handleTicketSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select 
                  name="category"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                >
                  <option value="">Select category</option>
                  <option value="courses">Courses</option>
                  <option value="curriculum">Curriculum</option>
                  <option value="capacity">Training Capacity</option>
                  <option value="demand">Industry Demand</option>
                  <option value="reports">Reports</option>
                  <option value="account">Account & Profile</option>
                  <option value="technical">Technical Issues</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  name="subject"
                  required
                  placeholder="Brief description of your issue"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                <select 
                  name="priority"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                >
                  <option value="low">Low</option>
                  <option value="medium" selected>Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  placeholder="Please provide detailed information about your issue..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowTicketForm(false)}
                  disabled={submittingTicket}
                  className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submittingTicket}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#1e3a8a] rounded-lg hover:bg-[#1e3a8a]/90 flex items-center gap-2 disabled:opacity-50"
                >
                  {submittingTicket ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {submittingTicket ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}