"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  LayoutGrid,
  List,
  Filter,
  ChevronDown,
  Loader2,
  Building2,
  Shield,
  Users2,
  Activity,
  User,
  Clock,
  Search,
  RotateCcw
} from "lucide-react";

import { getAllUsersThunk, changeStatusThunk, deleteUserThunk, getRolesThunk } from "@/features/auth/thunks/authThunk";
import { getDepartmentsThunk } from "@/features/departments/thunks/departmentThunks";
import { getTeamsThunk } from "@/features/teams/thunks/teamThunks";
import UserTable from "@/components/users/UserTable";
import UserCardGrid from "@/components/users/UserCardGrid";
import AddUserDrawer from "@/components/users/AddUserDrawer";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import Pagination from "@/components/common/Pagination";
import { showToast } from "@/lib/toast";
import { api } from "@/lib/axios";

export default function UsersPage() {
  const dispatch = useDispatch();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewMode, setViewMode] = useState("card"); // "table" | "card"

  // Filter States
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [managerFilter, setManagerFilter] = useState("all");
  const [attendanceFilter, setAttendanceFilter] = useState("all");

  const [managers, setManagers] = useState([]);
  const [managersLoading, setManagersLoading] = useState(false);

  const [dialogConfig, setDialogConfig] = useState({
    open: false,
    type: null, // "delete_user" | "update_status"
    title: "",
    message: "",
    metaData: null
  });

  const [actionLoading, setActionLoading] = useState(false);

  const { users, pagination, loading, roles } = useSelector((state) => state.auth);
  const { departmentsList } = useSelector((state) => state.departments);
  const { teamsList } = useSelector((state) => state.teams);
  const loggedInUser = useSelector((state) => state.auth.user);

  const isWriteAuthorized =
    loggedInUser?.role?.toLowerCase() === "admin" ||
    loggedInUser?.role?.toLowerCase() === "super_admin" ||
    loggedInUser?.role?.toLowerCase() === "hr";

  // Load lists on mount
  useEffect(() => {
    dispatch(getDepartmentsThunk({ page: 1, limit: 100 }));
    dispatch(getTeamsThunk({ page: 1, limit: 100 }));
    dispatch(getRolesThunk());
    fetchManagersList();
  }, [dispatch]);

  const fetchManagersList = async () => {
    try {
      setManagersLoading(true);
      const res = await api.get("/users?limit=1000");
      setManagers(res.data?.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch managers list:", err);
    } finally {
      setManagersLoading(false);
    }
  };

  // Fetch users when pagination or filters change
  const fetchUsers = () => {
    const filters = {};
    if (deptFilter !== "all") filters.departmentId = deptFilter;
    if (roleFilter !== "all") filters.roleId = roleFilter;
    if (teamFilter !== "all") filters.teamId = teamFilter;
    if (statusFilter !== "all") filters.status = statusFilter;
    if (managerFilter !== "all") filters.managerId = managerFilter;
    if (attendanceFilter !== "all") filters.attendanceStatus = attendanceFilter;
    if (search.trim() !== "") filters.name = search;

    dispatch(getAllUsersThunk({ page, limit, filters }));
  };

  useEffect(() => {
    fetchUsers();
  }, [dispatch, page, deptFilter, roleFilter, teamFilter, statusFilter, managerFilter, attendanceFilter]);

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      setPage(1);
      fetchUsers();
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setDeptFilter("all");
    setRoleFilter("all");
    setTeamFilter("all");
    setStatusFilter("all");
    setManagerFilter("all");
    setAttendanceFilter("all");
    setPage(1);
  };

  const statusConfig = {
    active: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20", label: "Active" },
    inactive: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20", label: "Pending" },
    suspended: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20", label: "Suspended" },
  };

  const handleDeleteTrigger = (user) => {
    setDialogConfig({
      open: true,
      type: "delete_user",
      title: "Purge Employee Account",
      message: `Are you absolutely certain you want to remove "${user.name || user.email}"? This will dissolve their platform context architecture, logs, and workspace sessions permanently.`,
      metaData: { userId: user.id }
    });
  };

  const handleStatusChangeTrigger = (user, newStatus) => {
    if (user.status === newStatus) return;
    const displayStatus = newStatus === 'inactive' ? 'PENDING HOLD' : newStatus.toUpperCase();

    setDialogConfig({
      open: true,
      type: "update_status",
      title: `Transition Account Status to ${displayStatus}`,
      message: `Modify systemic operational parameters for "${user.name || user.email}" to "${displayStatus}"?`,
      metaData: { userId: user.id, status: newStatus }
    });
  };

  const handleEditTrigger = (user) => {
    setEditingUser(user);
    setOpenDrawer(true);
  };

  const handleUnifiedConfirm = async () => {
    try {
      setActionLoading(true);
      if (dialogConfig.type === "delete_user") {
        await dispatch(deleteUserThunk(dialogConfig.metaData.userId)).unwrap();
        showToast.success("Employee account purged successfully");
      } else if (dialogConfig.type === "update_status") {
        await dispatch(changeStatusThunk({
          userId: dialogConfig.metaData.userId,
          status: dialogConfig.metaData.status
        })).unwrap();

        showToast.success("Systemic clearance permissions re-mapped successfully");
      }
      fetchUsers();
      closeDialog();
    } catch (err) {
      const errorMessage = typeof err === 'string' ? err : (err?.message || "Critical operation transaction rejected.");
      showToast.error(errorMessage);
      console.error("Thunk Pipeline Error Details:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const closeDialog = () => {
    setDialogConfig({ open: false, type: null, title: "", message: "", metaData: null });
  };

  // Filter team options by selected department (if selected)
  const filteredTeamOptions = deptFilter !== "all"
    ? teamsList.filter((t) => t.department_id === Number(deptFilter))
    : teamsList;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 animate-fade-in">
      
      {/* HEADER ACTION CONTAINER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-2">
        <div>
          <h1 
            className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--text)] to-[var(--muted)]"
            style={{ color: "var(--text)" }}
          >
            Employee Directory
          </h1>
          <p className="text-sm mt-1.5 font-medium opacity-80" style={{ color: "var(--muted)" }}>
            Monitor organizational roles, departments, active workspace teams, and daily registry status.
          </p>
        </div>

        {isWriteAuthorized && (
          <button
            onClick={() => {
              setEditingUser(null);
              setOpenDrawer(true);
            }}
            className="group relative flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-300 hover:opacity-95 hover:shadow-[0_4px_20px_rgba(0,0,0,0.15)] active:scale-[0.98] cursor-pointer self-start sm:self-auto overflow-hidden dynamic-btn-shadow"
            style={{ background: "var(--primary)" }}
          >
            <Plus size={16} className="transition-transform duration-300 group-hover:rotate-90" />
            Add Employee
          </button>
        )}
      </div>

      {/* SEARCH AND FILTERS BAR */}
      <div 
        className="p-4 rounded-2xl border space-y-4 shadow-sm"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* SEARCH */}
          <div className="relative flex items-center bg-[var(--input)] rounded-xl border border-[var(--border)] px-3 focus-within:ring-2 focus-within:ring-[var(--primary)]/10 focus-within:border-[var(--primary)]">
            <Search size={15} className="text-[var(--muted)] mr-2" />
            <input
              type="text"
              placeholder="Search Name, Email, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyPress}
              className="text-xs font-semibold bg-transparent py-3 outline-none text-[var(--text)] w-full placeholder:opacity-50"
            />
          </div>

          {/* DEPARTMENT */}
          <div className="relative flex items-center bg-[var(--input)] rounded-xl border border-[var(--border)] px-3">
            <Building2 size={14} className="text-[var(--muted)] mr-2" />
            <select
              value={deptFilter}
              onChange={(e) => { setDeptFilter(e.target.value); setTeamFilter("all"); setPage(1); }}
              className="text-xs font-semibold bg-transparent py-3 outline-none appearance-none cursor-pointer text-[var(--text)] w-full focus:outline-none"
            >
              <option value="all">All Departments</option>
              {departmentsList.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 text-[var(--muted)] pointer-events-none" />
          </div>

          {/* ROLE */}
          <div className="relative flex items-center bg-[var(--input)] rounded-xl border border-[var(--border)] px-3">
            <Shield size={14} className="text-[var(--muted)] mr-2" />
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="text-xs font-semibold bg-transparent py-3 outline-none appearance-none cursor-pointer text-[var(--text)] w-full focus:outline-none"
            >
              <option value="all">All Roles</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name.toUpperCase()}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 text-[var(--muted)] pointer-events-none" />
          </div>

          {/* TEAM */}
          <div className="relative flex items-center bg-[var(--input)] rounded-xl border border-[var(--border)] px-3">
            <Users2 size={14} className="text-[var(--muted)] mr-2" />
            <select
              value={teamFilter}
              onChange={(e) => { setTeamFilter(e.target.value); setPage(1); }}
              className="text-xs font-semibold bg-transparent py-3 outline-none appearance-none cursor-pointer text-[var(--text)] w-full focus:outline-none"
            >
              <option value="all">All Teams</option>
              {filteredTeamOptions.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 text-[var(--muted)] pointer-events-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1">
          {/* STATUS */}
          <div className="relative flex items-center bg-[var(--input)] rounded-xl border border-[var(--border)] px-3">
            <Activity size={14} className="text-[var(--muted)] mr-2" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="text-xs font-semibold bg-transparent py-3 outline-none appearance-none cursor-pointer text-[var(--text)] w-full focus:outline-none"
            >
              <option value="all">All States</option>
              <option value="active">Active State</option>
              <option value="inactive">Pending Hold</option>
              <option value="suspended">Suspended Vault</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 text-[var(--muted)] pointer-events-none" />
          </div>

          {/* MANAGER */}
          <div className="relative flex items-center bg-[var(--input)] rounded-xl border border-[var(--border)] px-3">
            <User size={14} className="text-[var(--muted)] mr-2" />
            <select
              value={managerFilter}
              onChange={(e) => { setManagerFilter(e.target.value); setPage(1); }}
              className="text-xs font-semibold bg-transparent py-3 outline-none appearance-none cursor-pointer text-[var(--text)] w-full focus:outline-none"
            >
              <option value="all">All Managers</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 text-[var(--muted)] pointer-events-none" />
          </div>

          {/* ATTENDANCE STATUS */}
          <div className="relative flex items-center bg-[var(--input)] rounded-xl border border-[var(--border)] px-3">
            <Clock size={14} className="text-[var(--muted)] mr-2" />
            <select
              value={attendanceFilter}
              onChange={(e) => { setAttendanceFilter(e.target.value); setPage(1); }}
              className="text-xs font-semibold bg-transparent py-3 outline-none appearance-none cursor-pointer text-[var(--text)] w-full focus:outline-none"
            >
              <option value="all">All Attendance</option>
              <option value="present">🟢 Present</option>
              <option value="late">🟡 Late Check-In</option>
              <option value="remote">🌐 Remote / WFH</option>
              <option value="on_leave">🏖️ On Leave</option>
              <option value="absent">🔴 Absent / No Logs</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 text-[var(--muted)] pointer-events-none" />
          </div>

          {/* TRIGGER BUTTONS */}
          <div className="flex gap-2">
            <button
              onClick={() => { setPage(1); fetchUsers(); }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl font-bold text-xs text-white hover:opacity-95 transition cursor-pointer"
              style={{ background: "var(--primary)" }}
            >
              <Search size={14} />
              Filter
            </button>
            <button
              onClick={handleResetFilters}
              className="flex items-center justify-center p-3 rounded-xl border transition hover:bg-neutral-500/10 cursor-pointer text-[var(--text)] border-[var(--border)] bg-[var(--input)]"
              title="Reset All Filters"
            >
              <RotateCcw size={14} />
            </button>

            {/* VIEW TOGGLING */}
            <div className="flex items-center gap-1 bg-black/[0.03] dark:bg-white/[0.03] p-1 rounded-xl border border-[var(--border)] shrink-0">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                  viewMode === "table" 
                    ? "bg-[var(--card)] text-[var(--primary)] border border-neutral-200/50 dark:border-neutral-700/30" 
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
                title="Tabular Matrix View"
              >
                <List size={14} />
              </button>
              <button
                onClick={() => setViewMode("card")}
                className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                  viewMode === "card" 
                    ? "bg-[var(--card)] text-[var(--primary)] border border-neutral-200/50 dark:border-neutral-700/30" 
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
                title="Symmetric Card View"
              >
                <LayoutGrid size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RENDER CHOSEN COMPONENT BASIS VIEW FILTER */}
      <div className="min-h-[400px] transition-all duration-300 rounded-xl">
        {viewMode === "table" ? (
          <UserTable
            users={users}
            loading={loading}
            onDeleteUser={handleDeleteTrigger}
            onEditUser={handleEditTrigger}
            onStatusChange={handleStatusChangeTrigger}
            statusConfig={statusConfig}
          />
        ) : (
          <UserCardGrid
            users={users}
            loading={loading}
            limit={limit}
            onDeleteUser={handleDeleteTrigger}
            onEditUser={handleEditTrigger}
            onStatusChange={handleStatusChangeTrigger}
            statusConfig={statusConfig}
          />
        )}
      </div>

      {/* PAGINATION TOOL BAR DOCK */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-xs mt-4">
        <Pagination
          page={pagination?.page || page}
          limit={pagination?.limit || limit}
          total={pagination?.total || users.length}
          totalPages={pagination?.totalPages || Math.ceil((pagination?.total || users.length) / limit) || 1}
          onPageChange={({ page: newPage, limit: newLimit }) => {
            setPage(newPage);
            if (newLimit !== limit) {
              setLimit(newLimit);
              setPage(1);
            }
          }}
        />
      </div>

      {/* DRAWERS & DIALOG INJECTIONS */}
      <AddUserDrawer
        open={openDrawer}
        onClose={() => { setOpenDrawer(false); setEditingUser(null); }}
        page={page}
        limit={limit}
        editingUser={editingUser}
        onUserSaved={fetchUsers}
      />

      <ConfirmDialog
        open={dialogConfig.open}
        onClose={closeDialog}
        onConfirm={handleUnifiedConfirm}
        title={dialogConfig.title}
        message={dialogConfig.message}
        loading={actionLoading}
      />
    </div>
  );
}