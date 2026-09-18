"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { GovernmentShell } from "@/app/government/GovernmentShell";
import { api, type District } from "@/lib/api";
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
  Search,
  X,
  MoreVertical,
  Eye,
  Edit,
  Power,
  ShieldCheck,
} from "lucide-react";

interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  roles: string[];
  created_at: string | null;
  phone?: string | null;
  organization?: string | null;
  district_id?: string | null;
  district_name?: string | null;
  last_active?: string | null;
}

type RoleFilter = "all" | "government_official" | "government_admin" | "training_provider" | "employer" | "candidate";
type StatusFilter = "all" | "active" | "inactive";

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
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [districtFilter, setDistrictFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersData, districtsData] = await Promise.all([
        api.governmentUsers({ role: roleFilter === "all" ? undefined : roleFilter }).catch(() => []),
        api.districts().catch(() => [])
      ]);
      setUsers(usersData);
      setDistricts(districtsData);
    } catch (err) {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [roleFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const roleCounts = users.reduce<Record<string, number>>((acc, user) => {
    user.roles.forEach((role) => {
      acc[role] = (acc[role] || 0) + 1;
    });
    return acc;
  }, {});

  const activeUsers = users.filter(u => u.is_active).length;
  const inactiveUsers = users.filter(u => !u.is_active).length;

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Role filter
      if (roleFilter !== "all" && !user.roles.includes(roleFilter)) return false;
      
      // Status filter
      if (statusFilter === "active" && !user.is_active) return false;
      if (statusFilter === "inactive" && user.is_active) return false;
      
      // District filter
      if (districtFilter && user.district_id !== districtFilter) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          user.full_name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.organization?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      
      return true;
    });
  }, [users, roleFilter, statusFilter, districtFilter, searchQuery]);

  const resetFilters = () => {
    setRoleFilter("all");
    setStatusFilter("all");
    setDistrictFilter("");
    setSearchQuery("");
  };

  const activeFilterCount = [roleFilter, statusFilter, districtFilter, searchQuery].filter(
    f => f && f !== "all"
  ).length;

  const handleUserAction = (user: User, action: string) => {
    console.log(`Action ${action} for user ${user.id}`);
    // This would connect to real backend actions
    // For now, just log the action
  };

  return (
    <GovernmentShell allowedRoles={["government_admin"]}>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-7 w-7 text-[#123b68]" />
            <h1 className="text-3xl font-bold text-[#123b68]">User Management</h1>
          </div>
          <p className="text-slate-600">
            Manage platform users, roles and access across SkillMitra.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="mb-6 grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          <div className="bg-white rounded-md border border-slate-200 p-3 shadow-sm">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Total Users</p>
            <p className="text-lg font-bold text-[#123b68]">{users.length}</p>
          </div>

          <div className="bg-white rounded-md border border-slate-200 p-3 shadow-sm">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Govt Officers</p>
            <p className="text-lg font-bold text-blue-700">{roleCounts.government_official || 0}</p>
          </div>

          <div className="bg-white rounded-md border border-slate-200 p-3 shadow-sm">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Training Providers</p>
            <p className="text-lg font-bold text-green-700">{roleCounts.training_provider || 0}</p>
          </div>

          <div className="bg-white rounded-md border border-slate-200 p-3 shadow-sm">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Employers</p>
            <p className="text-lg font-bold text-amber-700">{roleCounts.employer || 0}</p>
          </div>

          <div className="bg-white rounded-md border border-slate-200 p-3 shadow-sm">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Active Users</p>
            <p className="text-lg font-bold text-green-600">{activeUsers}</p>
          </div>

          <div className="bg-white rounded-md border border-slate-200 p-3 shadow-sm">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Pending/Inactive</p>
            <p className="text-lg font-bold text-red-600">{inactiveUsers}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Search Users</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, organization..."
                  className="w-full border border-slate-300 rounded pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#123b68] focus:border-[#123b68]"
                />
              </div>
            </div>

            <div className="flex-1 min-w-[140px]">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#123b68] focus:border-[#123b68]"
              >
                <option value="all">All Roles</option>
                <option value="government_official">Government Officials</option>
                <option value="government_admin">Government Admins</option>
                <option value="training_provider">Training Providers</option>
                <option value="employer">Employers</option>
                <option value="candidate">Candidates</option>
              </select>
            </div>

            <div className="flex-1 min-w-[140px]">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">District</label>
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#123b68] focus:border-[#123b68]"
              >
                <option value="">All Districts</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[140px]">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#123b68] focus:border-[#123b68]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 mb-1"
              >
                <X className="h-3.5 w-3.5" /> Reset
              </button>
            )}
          </div>
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
        ) : filteredUsers.length > 0 ? (
          <div className="min-w-0 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 text-xs">#</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 text-xs">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 text-xs">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 text-xs">Organization</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 text-xs">Role</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 text-xs">District</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 text-xs">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 text-xs">Last Active</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="py-3 px-4 text-slate-600">{index + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <UserCircle className="h-4 w-4 text-slate-400" />
                          <span className="font-medium text-[#123b68]">{user.full_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{user.email}</td>
                      <td className="py-3 px-4 text-slate-600">{user.organization || "—"}</td>
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
                      <td className="py-3 px-4 text-slate-600">{user.district_name || "—"}</td>
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
                      <td className="py-3 px-4 text-slate-500 text-xs">
                        {user.last_active 
                          ? new Date(user.last_active).toLocaleDateString()
                          : "Never"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setSelectedUser(user); setShowUserDetail(true); }}
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-[#123b68]"
                            title="View Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleUserAction(user, "edit")}
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-[#123b68]"
                            title="Edit User"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleUserAction(user, user.is_active ? "deactivate" : "activate")}
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-[#123b68]"
                            title={user.is_active ? "Deactivate" : "Activate"}
                          >
                            <Power className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-12 shadow-sm text-center overflow-hidden">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-sm text-slate-500">No users found for the selected filters.</p>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="mt-3 text-xs text-[#123b68] hover:text-[#123b68]/80 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* User Detail Modal */}
        {showUserDetail && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#123b68]">User Details</h3>
                  <button
                    onClick={() => setShowUserDetail(false)}
                    className="p-1 hover:bg-slate-100 rounded"
                  >
                    <X className="h-5 w-5 text-slate-500" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-[#123b68]/10 rounded-full">
                    <UserCircle className="h-8 w-8 text-[#123b68]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#123b68]">{selectedUser.full_name}</p>
                    <p className="text-sm text-slate-600">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Status</p>
                    <p className={`text-sm font-medium ${selectedUser.is_active ? "text-green-700" : "text-red-600"}`}>
                      {selectedUser.is_active ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Roles</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedUser.roles.map((role) => (
                        <span key={role} className="text-xs bg-slate-100 px-2 py-0.5 rounded">
                          {role.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Organization</p>
                    <p className="text-sm text-slate-700">{selectedUser.organization || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">District</p>
                    <p className="text-sm text-slate-700">{selectedUser.district_name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Phone</p>
                    <p className="text-sm text-slate-700">{selectedUser.phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Created</p>
                    <p className="text-sm text-slate-700">
                      {selectedUser.created_at 
                        ? new Date(selectedUser.created_at).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Last Active</p>
                    <p className="text-sm text-slate-700">
                      {selectedUser.last_active 
                        ? new Date(selectedUser.last_active).toLocaleDateString()
                        : "Never"}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUserAction(selectedUser, "edit")}
                      className="flex-1 px-4 py-2 bg-[#123b68] text-white text-sm font-medium rounded hover:bg-[#123b68]/90"
                    >
                      Edit User
                    </button>
                    <button
                      onClick={() => handleUserAction(selectedUser, selectedUser.is_active ? "deactivate" : "activate")}
                      className={`flex-1 px-4 py-2 text-sm font-medium rounded ${
                        selectedUser.is_active 
                          ? "bg-red-100 text-red-700 hover:bg-red-200" 
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {selectedUser.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </GovernmentShell>
  );
}
