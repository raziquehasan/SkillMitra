"use client";

import { TrainingProviderShell } from "@/app/training-provider/TrainingProviderShell";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Wrench,
  Loader2,
  Search,
  Filter,
} from "lucide-react";

export default function EquipmentPage() {
  return (
    <TrainingProviderShell>
      <EquipmentContent />
    </TrainingProviderShell>
  );
}

function EquipmentContent() {
  const [equipment, setEquipment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", district_id: "", quantity: 0, available_quantity: 0 });
  const [adding, setAdding] = useState(false);
  const [districts, setDistricts] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [equipmentData, districtData] = await Promise.all([
        api.trainingProviderEquipment().catch(() => []),
        api.districts().catch(() => []),
      ]);
      setEquipment(equipmentData);
      setDistricts(districtData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setEquipment(getFallbackEquipment());
    } finally {
      setLoading(false);
    }
  };

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setAdding(true);
      await api.createTrainingProviderEquipment({
        name: formData.name,
        district_id: formData.district_id || districts[0]?.id || "",
        quantity: formData.quantity,
        available_quantity: formData.available_quantity,
      });
      setFormData({ name: "", district_id: "", quantity: 0, available_quantity: 0 });
      setShowAddForm(false);
      fetchData();
    } catch (error) {
      console.error("Failed to add equipment:", error);
    } finally {
      setAdding(false);
    }
  };

  const filteredEquipment = equipment.filter(eq =>
    eq.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1e3a8a] mx-auto" />
          <p className="mt-4 text-sm text-slate-600">Loading equipment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1e293b]">Equipment & Infrastructure</h1>
          <p className="mt-2 text-slate-600">
            Manage training equipment and track operational status.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1e3a8a] rounded-lg hover:bg-[#1e3a8a]/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Equipment
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <KPICard title="Total Equipment" value={equipment.length} icon={<Building2 className="h-5 w-5" />} color="blue" />
        <KPICard title="Operational" value={equipment.filter(e => e.status === "active").length} icon={<CheckCircle className="h-5 w-5" />} color="green" />
        <KPICard title="Under Maintenance" value={equipment.filter(e => e.status === "maintenance").length} icon={<Wrench className="h-5 w-5" />} color="orange" />
        <KPICard title="Critical Shortage" value={equipment.filter(e => e.available_quantity < e.quantity * 0.5).length} icon={<AlertTriangle className="h-5 w-5" />} color="red" />
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search equipment..."
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

      {/* Equipment Table */}
      <div className="border border-slate-300 rounded-lg bg-white overflow-hidden">
        <div className="overflow-x-auto w-full">
            <table data-wrapped="true" className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Equipment Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Total Quantity</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Available</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Utilization</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredEquipment.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                  No equipment found. Click "Add Equipment" to get started.
                </td>
              </tr>
            ) : (
              filteredEquipment.map((eq) => {
                const utilization = eq.quantity > 0 ? ((eq.quantity - eq.available_quantity) / eq.quantity * 100).toFixed(1) : "0";
                return (
                  <tr key={eq.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-[#1e293b]">{eq.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{eq.quantity}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{eq.available_quantity}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{utilization}%</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded ${
                        eq.status === "active" ? "bg-green-100 text-green-800" :
                        eq.status === "maintenance" ? "bg-yellow-100 text-yellow-800" :
                        "bg-slate-100 text-slate-800"
                      }`}>
                        {eq.status === "active" && <CheckCircle className="h-3.5 w-3.5" />}
                        {eq.status === "maintenance" && <Wrench className="h-3.5 w-3.5" />}
                        {eq.status}
                      </span>
                    </td>
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
                );
              })
            )}
          </tbody>
        </table>
          </div>
      </div>

      {/* Add Equipment Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#1e293b]">Add New Equipment</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleAddEquipment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Equipment Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter equipment name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">District</label>
                <select
                  value={formData.district_id}
                  onChange={(e) => setFormData({ ...formData, district_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                >
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Total Quantity</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Available</label>
                  <input
                    type="number"
                    value={formData.available_quantity}
                    onChange={(e) => setFormData({ ...formData, available_quantity: parseInt(e.target.value) || 0 })}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                  />
                </div>
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
                  {adding ? "Adding..." : "Add Equipment"}
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

function getFallbackEquipment() {
  return [
    { id: "1", name: "CNC Machine", quantity: 10, available_quantity: 8, status: "active" },
    { id: "2", name: "EV Diagnostic Kit", quantity: 15, available_quantity: 12, status: "active" },
    { id: "3", name: "Welding Station", quantity: 20, available_quantity: 18, status: "active" },
    { id: "4", name: "Solar Training Kit", quantity: 12, available_quantity: 10, status: "maintenance" },
    { id: "5", name: "Computer Lab", quantity: 30, available_quantity: 25, status: "active" },
  ];
}