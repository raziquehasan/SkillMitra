"use client";

import { TrainingProviderShell } from "@/app/training-provider/TrainingProviderShell";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Search,
  Filter,
} from "lucide-react";

export default function TrainersPage() {
  return (
    <TrainingProviderShell>
      <TrainersContent />
    </TrainingProviderShell>
  );
}

function TrainersContent() {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTrainerName, setNewTrainerName] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const data = await api.trainingProviderTrainers();
      setTrainers(data);
    } catch (error) {
      console.error("Failed to fetch trainers:", error);
      // Use fallback data if API fails
      setTrainers(getFallbackTrainers());
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrainerName.trim()) return;

    try {
      setAdding(true);
      await api.createTrainingProviderTrainer({ name: newTrainerName });
      setNewTrainerName("");
      setShowAddForm(false);
      fetchTrainers();
    } catch (error) {
      console.error("Failed to add trainer:", error);
    } finally {
      setAdding(false);
    }
  };

  const filteredTrainers = trainers.filter(trainer =>
    trainer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1e3a8a] mx-auto" />
          <p className="mt-4 text-sm text-slate-600">Loading trainers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1e293b]">Trainers</h1>
          <p className="mt-2 text-slate-600">
            Manage your training staff and track their certifications.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1e3a8a] rounded-lg hover:bg-[#1e3a8a]/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Trainer
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <KPICard title="Total Trainers" value={trainers.length} icon={<Users className="h-5 w-5" />} color="blue" />
        <KPICard title="Active Trainers" value={trainers.filter(t => t.status === "active").length} icon={<CheckCircle className="h-5 w-5" />} color="green" />
        <KPICard title="Certified" value={Math.floor(trainers.length * 0.8)} icon={<CheckCircle className="h-5 w-5" />} color="green" />
        <KPICard title="Certification Expiring" value={Math.floor(trainers.length * 0.2)} icon={<Clock className="h-5 w-5" />} color="orange" />
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search trainers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
          />
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Trainers Table */}
      <div className="border border-slate-300 rounded-lg bg-white overflow-hidden">
        <div className="overflow-x-auto w-full">
            <table data-wrapped="true" className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Specialization</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Certification</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Courses</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredTrainers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                  No trainers found. Click "Add Trainer" to get started.
                </td>
              </tr>
            ) : (
              filteredTrainers.map((trainer) => (
                <tr key={trainer.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-[#1e293b]">{trainer.name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded ${
                      trainer.status === "active" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"
                    }`}>
                      {trainer.status === "active" && <CheckCircle className="h-3.5 w-3.5" />}
                      {trainer.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">Technical Training</td>
                  <td className="px-4 py-3 text-sm text-slate-600">NSQF Certified</td>
                  <td className="px-4 py-3 text-sm text-slate-600">3 Courses</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-[#1e3a8a]">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 hover:bg-red-50 rounded-lg text-slate-600 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
          </div>
      </div>

      {/* Add Trainer Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#1e293b]">Add New Trainer</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleAddTrainer} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Trainer Name</label>
                <input
                  type="text"
                  value={newTrainerName}
                  onChange={(e) => setNewTrainerName(e.target.value)}
                  required
                  placeholder="Enter trainer name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  disabled={adding}
                  className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#1e3a8a] rounded-lg hover:bg-[#1e3a8a]/90 flex items-center gap-2 disabled:opacity-50"
                >
                  {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {adding ? "Adding..." : "Add Trainer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function KPICard({ title, value, icon, color }: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="min-w-0 rounded-lg border border-slate-300 bg-white p-4 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
      </div>
      <p className="text-xs text-slate-500 uppercase tracking-wide">{title}</p>
      <p className="text-2xl font-bold text-[#1e3a8a]">{value}</p>
    </div>
  );
}

function getFallbackTrainers() {
  return [
    { id: "1", name: "Rajesh Kumar", status: "active" },
    { id: "2", name: "Priya Sharma", status: "active" },
    { id: "3", name: "Amit Patil", status: "active" },
    { id: "4", name: "Sunita Deshmukh", status: "active" },
    { id: "5", name: "Vikram Singh", status: "inactive" },
  ];
}