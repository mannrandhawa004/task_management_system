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
  Loader2
} from "lucide-react";

import { getAllUsersThunk, changeStatusThunk } from "@/features/auth/thunks/authThunk";
import UserTable from "@/components/users/UserTable";
import UserCardGrid from "@/components/users/UserCardGrid";
import AddUserDrawer from "@/components/users/AddUserDrawer";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { showToast } from "@/lib/toast";

export default function UsersPage() {
  const dispatch = useDispatch();

  const [page, setPage] = useState(1);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [viewMode, setViewMode] = useState("card"); // "table" | "card"
  const [statusFilter, setStatusFilter] = useState("all");

  const [dialogConfig, setDialogConfig] = useState({
    open: false,
    type: null, // "delete_user" | "update_status"
    title: "",
    message: "",
    metaData: null
  });

  const [actionLoading, setActionLoading] = useState(false);
  const limit = 9;

  const { users, pagination, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getAllUsersThunk({ page, limit }));
  }, [dispatch, page]);

  const statusConfig = {
    active: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20", label: "Active" },
    inactive: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20", label: "Pending" },
    suspended: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20", label: "Suspended" },
  };

  const filteredUsers = users?.filter((user) => {
    if (statusFilter === "all") return true;
    return user?.status === statusFilter;
  }) || [];

  const handleDeleteTrigger = (user) => {
    setDialogConfig({
      open: true,
      type: "delete_user",
      title: "Purge Platform User Account",
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

  const handleUnifiedConfirm = async () => {
    try {
      setActionLoading(true);
      if (dialogConfig.type === "delete_user") {
        // Delete execution logic
      } else if (dialogConfig.type === "update_status") {
        await dispatch(changeStatusThunk({
          userId: dialogConfig.metaData.userId,
          status: dialogConfig.metaData.status
        })).unwrap();

        showToast.success("Systemic clearance permissions re-mapped successfully");
      }
      dispatch(getAllUsersThunk({ page, limit }));
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

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 animate-fade-in">
      
      {/* HEADER ACTION CONTAINER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-2">
        <div>
          <h1 
            className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--text)] to-[var(--muted)]"
            style={{ color: "var(--text)" }}
          >
            Users Registry
          </h1>
          <p className="text-sm mt-1.5 font-medium opacity-80" style={{ color: "var(--muted)" }}>
            Monitor permissions, review access states, and manage global directory identities.
          </p>
        </div>

        <button
          onClick={() => setOpenDrawer(true)}
          className="group relative flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-300 hover:opacity-95 hover:shadow-[0_4px_20px_rgba(0,0,0,0.15)] active:scale-[0.98] cursor-pointer self-start sm:self-auto overflow-hidden dynamic-btn-shadow"
          style={{ background: "var(--primary)" }}
        >
          <Plus size={16} className="transition-transform duration-300 group-hover:rotate-90" />
          Add User
        </button>
      </div>

      {/* FILTER CONTROLS TOOLBAR TOOL DOCK */}
      <div 
        className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-4 rounded-xl border backdrop-blur-md transition-all duration-500 ${
          loading ? "ring-1 ring-amber-500/20 shadow-sm" : "shadow-xs"
        }`} 
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2.5 text-xs font-semibold px-2" style={{ color: "var(--muted)" }}>
          {loading ? (
            <>
              <Loader2 size={13} className="animate-spin text-amber-500" />
              <span>Syncing index directory...</span>
            </>
          ) : (
            <span className="bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-md tracking-wide">
              Showing {filteredUsers.length} of {users?.length || 0} entries
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          
          {/* CUSTOM STYLED PREMIUM DROPDOWN */}
          <div className="relative flex items-center bg-black/[0.03] dark:bg-white/[0.03] pl-3 pr-8 py-2 rounded-lg border border-transparent hover:border-neutral-300 dark:hover:border-neutral-700 transition-all group cursor-pointer">
            <Filter size={13} className="mr-2 text-[var(--muted)] group-hover:text-[var(--text)] transition-colors" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold bg-transparent outline-none appearance-none cursor-pointer text-[var(--text)] w-full focus:outline-none"
            >
              <option value="all" className="bg-[var(--card)] text-[var(--text)]">All States</option>
              <option value="active" className="bg-[var(--card)] text-[var(--text)]">🟢 Active State</option>
              <option value="inactive" className="bg-[var(--card)] text-[var(--text)]">🟡 Pending Hold</option>
              <option value="suspended" className="bg-[var(--card)] text-[var(--text)]">🔴 Suspended Vault</option>
            </select>
            <div className="absolute right-2.5 pointer-events-none text-[var(--muted)] group-hover:text-[var(--text)] transition-colors">
              <ChevronDown size={14} strokeWidth={2.5} />
            </div>
          </div>

          {/* VIEW TOGGLE */}
          <div className="flex items-center gap-1 bg-black/[0.03] dark:bg-white/[0.03] p-1 rounded-lg border border-neutral-200/30 dark:border-neutral-800/30">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-all duration-200 ${
                viewMode === "table" 
                  ? "bg-[var(--card)] text-[var(--primary)] shadow-xs scale-100 font-bold border border-neutral-200/50 dark:border-neutral-700/30" 
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
              title="Tabular Matrix View"
            >
              <List size={15} />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`p-1.5 rounded-md transition-all duration-200 ${
                viewMode === "card" 
                  ? "bg-[var(--card)] text-[var(--primary)] shadow-xs scale-100 font-bold border border-neutral-200/50 dark:border-neutral-700/30" 
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
              title="Symmetric Card View"
            >
              <LayoutGrid size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* RENDER CHOSEN COMPONENT BASIS VIEW FILTER */}
      <div className="min-h-[400px] transition-all duration-300 rounded-xl">
        {viewMode === "table" ? (
          <UserTable
            users={filteredUsers}
            loading={loading}
            onDeleteUser={handleDeleteTrigger}
            onStatusChange={handleStatusChangeTrigger}
            statusConfig={statusConfig}
          />
        ) : (
          <UserCardGrid
            users={filteredUsers}
            loading={loading}
            limit={limit}
            onDeleteUser={handleDeleteTrigger}
            onStatusChange={handleStatusChangeTrigger}
            statusConfig={statusConfig}
          />
        )}
      </div>

      {/* PAGINATION TOOL BAR DOCK */}
      {pagination && (
        <div 
          className="pt-6 border-t flex justify-between items-center text-xs font-semibold tracking-wide" 
          style={{ borderColor: "var(--border)" }}
        >
          <p style={{ color: "var(--muted)" }} className="opacity-90">
            Total of <span className="text-[var(--text)] font-bold">{pagination.total}</span> registered entities
          </p>

          <div className="flex items-center gap-3">
            <button
              disabled={!pagination.hasPrevPage || loading}
              onClick={() => setPage((prev) => prev - 1)}
              className="p-2 rounded-lg border transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-[var(--text)] bg-[var(--card)] border-[var(--border)] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] active:scale-95"
            >
              <ChevronLeft size={14} />
            </button>

            <span className="text-xs select-none" style={{ color: "var(--muted)" }}>
              Page <strong className="text-[var(--text)] font-bold bg-black/5 dark:bg-white/5 px-2 py-1 rounded-md mx-0.5">{page}</strong> of {Math.ceil(pagination.total / limit) || 1}
            </span>

            <button
              disabled={!pagination.hasNextPage || loading}
              onClick={() => setPage((prev) => prev + 1)}
              className="p-2 rounded-lg border transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-[var(--text)] bg-[var(--card)] border-[var(--border)] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] active:scale-95"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* DRAWERS & DIALOG INJECTIONS */}
      <AddUserDrawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        page={page}
        limit={limit}
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