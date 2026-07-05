"use client";

import { useMemo, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { X, UserPlus, Loader2, Search, Check, Users, Building2, AlertCircle } from "lucide-react";
import { addProjectMemberThunk, getProjectMembersThunk } from "@/features/projects/thunks/projectThunk";
import { getAllUsers } from "@/features/auth/services/auth.service";
import { showToast } from "@/lib/toast";

function getTwoInitials(name) {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function AddMemberDrawer({
  open,
  onClose,
  projectId,
  project = null,
  users = [],
  existingMembers = [],
}) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedMap, setSelectedMap] = useState({}); // { [userId]: roleId }

  const [usersLoading, setUsersLoading] = useState(false);
  const [apiUsers, setApiUsers] = useState([]);

  const fetchUsers = async (currentPage = 1, searchValue = "") => {
    try {
      setUsersLoading(true);
      const targetDepartmentId = project?.department_id || project?.department?.id;
      const filters = targetDepartmentId ? { departmentId: targetDepartmentId } : {};
      if (searchValue) {
        filters.name = searchValue;
      }
      const response = await getAllUsers(currentPage, 500, filters);
      let data = Array.isArray(response) ? response : (response?.data || response?.rows || []);
      setApiUsers(data);
    } catch {
      showToast.error("Failed to fetch user directory.");
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    fetchUsers(1, search);
    setSelectedMap({});
  }, [open, project]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      fetchUsers(1, search);
    }, 350);
    return () => clearTimeout(timer);
  }, [search, open]);

  const existingMemberIds = useMemo(() => {
    return existingMembers.map((m) => Number(m.member_id));
  }, [existingMembers]);

  const availableUsers = useMemo(() => {
    return apiUsers.filter(
      (user) => user.status === "active" && !existingMemberIds.includes(Number(user.id))
    );
  }, [apiUsers, existingMemberIds]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return availableUsers;
    return availableUsers.filter((u) => {
      const fullName = `${u.name || ""} ${u.first_name || ""} ${u.last_name || ""}`.toLowerCase();
      const email = (u.email || "").toLowerCase();
      const empId = (u.employee_id || "").toLowerCase();
      const deptName = (u.department_name || "").toLowerCase();
      return (
        fullName.includes(query) ||
        email.includes(query) ||
        empId.includes(query) ||
        deptName.includes(query)
      );
    });
  }, [availableUsers, search]);

  const toggleSelect = (userId, defaultRoleId = 2) => {
    setSelectedMap((prev) => {
      const copy = { ...prev };
      if (copy[userId]) {
        delete copy[userId];
      } else {
        copy[userId] = defaultRoleId;
      }
      return copy;
    });
  };

  const handleRoleChange = (userId, roleId, e) => {
    e.stopPropagation();
    setSelectedMap((prev) => ({
      ...prev,
      [userId]: roleId,
    }));
  };

  const selectAllVisible = () => {
    const newMap = { ...selectedMap };
    filteredUsers.forEach((u) => {
      if (!newMap[u.id]) newMap[u.id] = 2; // default to Member role
    });
    setSelectedMap(newMap);
  };

  const clearAll = () => {
    setSelectedMap({});
  };

  const handleSubmit = async () => {
    const userIds = Object.keys(selectedMap).map(Number);
    if (userIds.length === 0) {
      return showToast.error("Please select at least one team member to add.");
    }

    try {
      setLoading(true);
      const payload = {
        userId: userIds,
        roleId: userIds.map((id) => selectedMap[id]),
      };

      await dispatch(addProjectMemberThunk({ projectId, data: payload })).unwrap();
      await dispatch(getProjectMembersThunk(projectId));
      showToast.success(`Successfully added ${userIds.length} member(s) to project`);

      setSelectedMap({});
      setSearch("");
      onClose();
    } catch (err) {
      showToast.error(err || "Failed to provision users.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const selectedCount = Object.keys(selectedMap).length;
  const deptLabel = project?.department_name || project?.department?.name;

  return (
    <>
      {/* BACKDROP SHIELD */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      />

      {/* DRAWER BODY CONTAINER */}
      <aside
        className="fixed top-0 right-0 h-screen w-full sm:w-[580px] z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 ease-out"
        style={{ background: "var(--card)", borderLeft: "1px solid var(--border)" }}
      >
        {/* DRAWER HEADER */}
        <div className="flex justify-between items-center px-6 sm:px-8 py-5 border-b shrink-0" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl text-[var(--primary)] bg-[var(--primary)]/10 border border-[var(--primary)]/20 shadow-sm">
              <UserPlus size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight" style={{ color: "var(--text)" }}>
                Add Project Members
              </h2>
              <p className="text-xs font-medium mt-0.5 flex items-center gap-1.5" style={{ color: "var(--muted)" }}>
                {deptLabel ? (
                  <>
                    <Building2 size={13} className="text-[var(--primary)]" />
                    <span>Showing employees from <strong className="text-[var(--text)]">{deptLabel}</strong></span>
                  </>
                ) : (
                  <span>Showing all active organization employees</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/5 transition active:scale-95 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* SEARCH & SELECTION TOOLBAR */}
        <div className="px-6 sm:px-8 pt-6 pb-3 border-b shrink-0 space-y-3" style={{ borderColor: "var(--border)", background: "var(--background)" }}>
          <div className="relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] transition-colors group-focus-within:text-[var(--primary)]" />
            <input
              placeholder="Search by name, email, or employee ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border pl-11 pr-10 py-3 text-xs font-bold outline-none transition-all focus:ring-4 focus:ring-[var(--primary)]/10 focus:border-[var(--primary)]"
              style={{ borderColor: "var(--border)", background: "var(--input)", color: "var(--text)" }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-xs font-bold">
            <span style={{ color: "var(--muted)" }}>
              Available: <strong style={{ color: "var(--text)" }}>{filteredUsers.length}</strong> employee(s)
            </span>

            <div className="flex items-center gap-3">
              {selectedCount > 0 ? (
                <>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-[var(--primary)]/10 text-[var(--primary)] font-extrabold">
                    {selectedCount} Selected
                  </span>
                  <button
                    onClick={clearAll}
                    className="text-[var(--muted)] hover:text-red-500 transition underline cursor-pointer text-[11px]"
                  >
                    Clear
                  </button>
                </>
              ) : (
                filteredUsers.length > 0 && (
                  <button
                    onClick={selectAllVisible}
                    className="text-[var(--primary)] hover:opacity-80 transition underline cursor-pointer text-[11px]"
                  >
                    Select All Visible
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* USERS DIRECTORY VIEWPORT */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-3 custom-scrollbar">
          {usersLoading && apiUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-[var(--muted)]">
              <Loader2 className="animate-spin text-[var(--primary)]" size={28} />
              <p className="text-xs font-bold">Loading available employees...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed" style={{ borderColor: "var(--border)" }}>
              <div className="p-3 rounded-full bg-black/5 dark:bg-white/5 text-[var(--muted)] mb-3">
                {search ? <Search size={24} /> : <Users size={24} />}
              </div>
              <h4 className="text-sm font-extrabold" style={{ color: "var(--text)" }}>
                {search ? "No matching employees found" : "No available employees"}
              </h4>
              <p className="text-xs font-medium mt-1 max-w-xs" style={{ color: "var(--muted)" }}>
                {search
                  ? "Try adjusting your search query or clear the filter to see all members."
                  : deptLabel
                  ? `All active employees in ${deptLabel} are already added to this project.`
                  : "All active organization employees are already added to this project."}
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isSelected = !!selectedMap[user.id];
              const currentRole = selectedMap[user.id] || 2;
              const displayName = user.name || `${user.first_name || ""} ${user.last_name || ""}`;

              return (
                <div
                  key={user.id}
                  onClick={() => toggleSelect(user.id)}
                  className={`group relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-md shadow-[var(--primary)]/5"
                      : "border-[var(--border)] bg-[var(--input)] hover:border-neutral-400/40 hover:shadow-sm"
                  }`}
                >
                  {/* LEFT: CHECKBOX + AVATAR + INFO */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-3">
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                        isSelected
                          ? "bg-[var(--primary)] border-[var(--primary)] text-white scale-105 shadow-xs"
                          : "border-neutral-400/50 group-hover:border-neutral-400 bg-transparent"
                      }`}
                    >
                      {isSelected && <Check size={13} strokeWidth={3} />}
                    </div>

                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--primary)]/15 text-[var(--primary)] font-black text-sm flex items-center justify-center shrink-0 border border-[var(--primary)]/20">
                      {user.avatar ? (
                        <img src={user.avatar} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{getTwoInitials(displayName)}</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold truncate" style={{ color: "var(--text)" }}>
                          {displayName}
                        </h4>
                        {user.employee_id && (
                          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/5 text-[var(--muted)]">
                            #{user.employee_id}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs font-medium truncate" style={{ color: "var(--muted)" }}>
                        <span className="truncate">{user.email}</span>
                        {user.department_name && (
                          <span className="flex items-center gap-1 shrink-0 text-[11px] font-semibold text-[var(--primary)]">
                            • {user.department_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: ROLE SELECTOR PILL */}
                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={currentRole}
                      onChange={(e) => handleRoleChange(user.id, Number(e.target.value), e)}
                      className="px-3 py-1.5 rounded-xl border text-xs font-extrabold uppercase tracking-wider outline-none cursor-pointer transition shadow-2xs"
                      style={{
                        background: isSelected ? "var(--card)" : "var(--background)",
                        borderColor: isSelected ? "var(--primary)" : "var(--border)",
                        color: isSelected ? "var(--primary)" : "var(--text)",
                      }}
                    >
                      <option value={2} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold">
                        Member
                      </option>
                      <option value={1} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold">
                        Manager
                      </option>
                    </select>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* BOTTOM FIXED CONTROLS INTERACTIVE PANEL */}
        <div className="p-6 border-t flex items-center justify-between gap-4 backdrop-blur-md bg-black/[0.02] dark:bg-white/[0.02] shrink-0" style={{ borderColor: "var(--border)" }}>
          <div className="text-xs font-bold" style={{ color: "var(--muted)" }}>
            {selectedCount > 0 ? (
              <span className="text-[var(--primary)] font-extrabold">
                {selectedCount} employee(s) ready to add
              </span>
            ) : (
              <span>Select employees above</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-xl border text-xs font-extrabold uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer"
              style={{ color: "var(--text)", borderColor: "var(--border)", background: "var(--card)" }}
            >
              Cancel
            </button>

            <button
              disabled={loading || selectedCount === 0}
              onClick={handleSubmit}
              className="px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-[var(--primary)]/25 flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-40 disabled:shadow-none"
              style={{ background: "var(--primary)" }}
            >
              {loading ? <Loader2 className="animate-spin" size={15} /> : <Check size={15} strokeWidth={3} />}
              Add {selectedCount > 0 ? `(${selectedCount}) Members` : "Members"}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}