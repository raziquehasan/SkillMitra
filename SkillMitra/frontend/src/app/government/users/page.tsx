"use client";

import { useState, useEffect, useCallback } from "react";
import { GovernmentShell } from "@/app/government/GovernmentShell";
import { api } from "@/lib/api";
import {
  Users,
  Loader2,
  UserCheck,
  UserX,
  Filter,
  Shield,
  Building2,
  GraduationCap,
  Briefcase,
  UserCircle,
} from "lucide-react";

interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  roles: string[];
  created_at: string | null;
}

type RoleFilter = "all" | "government_official" | "government_admin" | "training_provider" | "employer" | "candidate";

const roleLabels: Record<string, string> = {
  all: "All Users",
  government_official: "Government Officials",
  government_admin: "Government Admins",
  training_provider: "Training Providers",
  employer: "Employers",
  candidate: "Candidates",
};

const roleIcons: Record<string, React.ReactNode> = {
  government_official: <Shield className="h-4 w-4" />,
  government_admin: <Shield className="h-4 w-4" />,
  training_provider: <GraduationCap className="h-4 w-4" />,
  employer: <Building2 className="h-4 w-4" />,
  candidate: <Briefcase className="h-4 w-4" />,
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<RoleFilter>("all");

  const loadUsers = useCallback(async (role?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.governmentUsers({ role: role === "all" ? undefined : role });
      setUsers(data);
    } catch (err) {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers(filter === "all" ? undefined : filter);
  }, [filter, loadUsers]);

  const roleCounts = users.reduce<Record<string, number>>((acc, user) => {
    user.roles.forEach((role) => {
      acc[role] = (acc[role] || 0) + 1;
    });
    return acc;
  }, {});

  return (
    <GovernmentShell allowedRoles={["government_admin"]}>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-7 w-7 text-[#123b68]" />
            <h1 className="text-3xl font-bold text-[#123b68]">User Management</h1>
          </div>
          <p className="text-slate-600">
            Manage platform users across all roles. Government Admin access only.
          </p>
        </div>

        {/* Role Summary Cards */}
        <div className="mb-6 grid gap-3 grid-cols-2 md:grid-cols-4">
          {Object.entries(roleLabels)
            .filter(([key]) => key !== "all")
            .map(([role, label]) => (
              <div
                key={role}
                className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm overflow-hidden"
              >
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  {roleIcons[role]}
                  <span className="text-xs font-medium">{label}</span>
                </div>
                <p className="text-2xl font-bold text-[#123b68]">{roleCounts[role] || 0}</p>
              </div>
            ))}
        </div>

        {/* Role Filter */}
        <div className="mb-6 flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-slate-500" />
          <span className="text-sm text-slate-600 mr-2">Filter by role:</span>
          {(["all", "government_official", "government_admin", "training_provider", "employer", "candidate"] as RoleFilter[]).map(
            (role) => (
              <button
                key={role}
                onClick={() => setFilter(role)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  filter === role
                    ? "bg-[#123b68] text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {roleLabels[role]}
              </button>
            )
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#123b68] mx-auto" />
              <p className="mt-4 text-sm text-slate-600">Loading users...</p>
            </div>
          </div>
        ) : users.length > 0 ? (
          <div className="min-w-0 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <div className="overflow-x-auto w-full">
            <table data-wrapped="true" className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Roles</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <UserCircle className="h-4 w-4 text-slate-400" />
                          <span className="font-medium text-[#123b68]">{user.full_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{user.email}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <span
                              key={role}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded"
                            >
                              {roleIcons[role]}
                              {role.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {user.is_active ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                            <UserCheck className="h-3.5 w-3.5" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
                            <UserX className="h-3.5 w-3.5" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
            </div>
          </div>
        ) : (
          <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-12 shadow-sm text-center overflow-hidden">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-sm text-slate-500">No users found for the selected filter.</p>
          </div>
        )}
      </div>
    </GovernmentShell>
  );
}
