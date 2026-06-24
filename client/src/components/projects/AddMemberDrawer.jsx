"use client";

import { useMemo, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { X, Plus, Trash2, UserPlus, Loader2, Search, Check } from "lucide-react";
import { addProjectMemberThunk, getProjectMembersThunk } from "@/features/projects/thunks/projectThunk";
import { getAllUsers } from "@/features/auth/services/auth.service";
import { showToast } from "@/lib/toast";

export default function AddMemberDrawer({
  open,
  onClose,
  projectId,
  users = [],
  existingMembers = [],
}) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([{ userId: "", roleId: 2 }]);

  const [usersLoading, setUsersLoading] = useState(false);
  const [apiUsers, setApiUsers] = useState([]);

  const fetchUsers = async (currentPage = 1, searchValue = "") => {
    try {
      setUsersLoading(true);
      const response = await getAllUsers(currentPage, 15);
      let data = response.data || [];
      if (searchValue) {
        data = data.filter(
          (user) =>
            user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            user.email.toLowerCase().includes(searchValue.toLowerCase())
        );
      }
      setApiUsers(data);
    } catch {
      showToast.error("Failed to sync directory parameters.");
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    fetchUsers(1, search);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      fetchUsers(1, search);
    }, 350);
    return () => clearTimeout(timer);
  }, [search, open]);

  const existingMemberIds = existingMembers.map((m) => Number(m.member_id));

  const availableUsers = useMemo(() => {
    return apiUsers.filter(
      (user) => user.status === "active" && !existingMemberIds.includes(Number(user.id))
    );
  }, [apiUsers, existingMembers]);

  const addRow = () => {
    setRows((prev) => [...prev, { userId: "", roleId: 2 }]);
  };

  const removeRow = (index) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const handleSubmit = async () => {
    const validRows = rows.filter((r) => r.userId !== "");
    if (validRows.length === 0) {
      return showToast.error("Please select at least one team member to add.");
    }

    try {
      setLoading(true);
      const payload = {
        userId: validRows.map((r) => Number(r.userId)),
        roleId: validRows.map((r) => Number(r.roleId)),
      };

      await dispatch(addProjectMemberThunk({ projectId, data: payload })).unwrap();
      await dispatch(getProjectMembersThunk(projectId));
      showToast.success("Team roster updated successfully");

      setRows([{ userId: "", roleId: 2 }]);
      onClose();
    } catch (err) {
      showToast.error(err || "Failed to provision users.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* BACKDROP SHIELD */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      />

      {/* DRAWER BODY CONTAINER */}
      <aside
        className="fixed top-0 right-0 h-screen w-full sm:w-[540px] z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 ease-out"
        style={{ background: "var(--card)", borderLeft: "1px solid var(--border)" }}
      >
        {/* DRAWER HEADER */}
        <div className="flex justify-between items-center px-6 sm:px-8 py-5 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl text-[var(--primary)] bg-black/5 dark:bg-white/5 border border-[var(--border)]">
              <UserPlus size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight" style={{ color: "var(--text)" }}>Add Members</h2>
              <p className="text-xs font-medium mt-0.5" style={{ color: "var(--muted)" }}>Provision platform users to this workspace node.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/5 transitionactive:scale-95 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* COMPONENT BODY VIEWPORT */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-6">

          {/* MODERN SEARCH CONTAINER */}
          <div className="relative group">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] transition-colors group-focus-within:text-[var(--text)]" />
            <input
              placeholder="Filter global user identity records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border pl-11 pr-4 py-3 text-xs font-bold outline-none transition-all focus:ring-4 focus:ring-[var(--primary)]/10 focus:border-neutral-400"
              style={{ borderColor: "var(--border)", background: "var(--input)", color: "var(--text)" }}
            />
          </div>

          {/* RECORD ALLOCATION GRID ROWS */}
          <div className="space-y-4">
            <label className="text-[11px] font-extrabold uppercase tracking-wider block" style={{ color: "var(--muted)" }}>
              Workspace Assignments Matrix
            </label>

            {rows.map((row, index) => (
              <div
                key={`member-row-${index}`}
                className="group/row relative flex flex-col sm:flex-row items-stretch gap-3 p-3.5 rounded-2xl border transition-all duration-200 hover:border-neutral-400/40 focus-within:ring-2 focus-within:ring-[var(--primary)]/10"
                style={{ borderColor: "var(--border)", background: "var(--input)" }}
              >
                {/* ACCOUNT PROFILE SELECT BLOCK */}
                <div className="flex-1 relative">
                  <select
                    value={row.userId}
                    onChange={(e) => handleChange(index, "userId", e.target.value)}
                    className="w-full bg-transparent py-2 text-xs font-bold outline-none appearance-none cursor-pointer"
                    style={{ color: "var(--text)" }}
                  >
                    {/* ✅ Visibility Fix: Added clean, absolute theme text configurations for cross-runtime matching */}
                    <option value="" disabled className="bg-white dark:bg-zinc-900 text-zinc-400 font-bold">
                      {usersLoading ? "Querying server directory..." : "Choose collaborator profile..."}
                    </option>
                    {availableUsers.map((user) => (
                      <option
                        key={user.id}
                        value={user.id}
                        className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold py-2"
                      >
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] text-[var(--muted)] pointer-events-none">▼</div>
                </div>

                {/* ACCESS PERMISSION SELECT BLOCK */}
                <div className="sm:w-32 shrink-0 border-t sm:border-t-0 sm:border-l pt-2.5 sm:pt-0 sm:pl-3 relative flex items-center" style={{ borderColor: "var(--border)" }}>
                  <select
                    value={row.roleId}
                    onChange={(e) => handleChange(index, "roleId", Number(e.target.value))}
                    className="w-full bg-transparent py-2 pr-4 text-xs font-extrabold tracking-wider uppercase cursor-pointer text-[var(--primary)] outline-none appearance-none"
                  >
                    {/* ✅ Visibility Fix: Hardcoded static values to combat browser dark-mode component generation overrides */}
                    <option value={2} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold uppercase">Member</option>
                    <option value={1} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold uppercase">Manager</option>
                  </select>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[9px] text-[var(--primary)] pointer-events-none">▼</div>
                </div>

                {/* DESTRUCT ROW BUTTON COMPONENT */}
                {rows.length > 1 && (
                  <button
                    onClick={() => removeRow(index)}
                    className="absolute -top-2 -right-2 sm:static p-2 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer active:scale-90"
                    title="Discard operational line element"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* APPEND NEW MATRIX ROW ACTION LINE */}
          <button
            onClick={addRow}
            className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest cursor-pointer hover:opacity-80 transition-all select-none active:scale-95"
            style={{ color: "var(--primary)" }}
          >
            <Plus size={13} strokeWidth={3} />
            Append Assignment Row
          </button>
        </div>

        {/* BOTTOM FIXED CONTROLS INTERACTIVE PANEL */}
        <div className="p-6 border-t flex gap-3 backdrop-blur-md bg-black/[0.02] dark:bg-white/[0.02]" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={onClose}
            className="flex-1 py-3.5 border rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer"
            style={{ color: "var(--text)", borderColor: "var(--border)", background: "var(--card)" }}
          >
            Discard
          </button>

          <button
            disabled={loading}
            onClick={handleSubmit}
            className="flex-1 py-3.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider text-white shadow-md flex justify-center items-center gap-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-40"
            style={{ background: "var(--primary)" }}
          >
            {loading ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} strokeWidth={3} />}
            Commit Directives
          </button>
        </div>
      </aside>
    </>
  );
}