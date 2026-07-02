"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Users, Plus, Trash2, UserMinus, LayoutGrid, List } from "lucide-react";

import ConfirmDialog from "../common/ConfirmDialog";
import { getProjectMembersThunk, removeProjectMemberThunk } from "@/features/projects/thunks/projectThunk";
import { showToast } from "@/lib/toast";

function getTwoInitials(name) {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function MemberAvatar({ member, sizeClass = "w-9 h-9", textClass = "text-sm" }) {
  const [imgError, setImgError] = useState(false);
  const initials = getTwoInitials(member?.member_name || member?.name);

  return (
    <div className={`relative rounded-xl overflow-hidden shrink-0 flex items-center justify-center bg-[var(--primary)]/15 text-[var(--primary)] font-black border border-[var(--primary)]/20 shadow-2xs ${sizeClass} ${textClass}`}>
      {member?.avatar && !imgError ? (
        <img
          src={member.avatar}
          alt={member?.member_name || "Member"}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

export default function ProjectMembersTable({
  members = [],
  loading = false,
  projectId,
  onAddMember,
  canManageMembers,
}) {
  const dispatch = useDispatch();
  const [selectedMember, setSelectedMember] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // "table" | "card"
  const { actionLoading } = useSelector((state) => state.project);

  const handleRemove = async () => {
    if (!selectedMember) return;
    try {
      await dispatch(
        removeProjectMemberThunk({
          projectId,
          userId: selectedMember.member_id,
        })
      ).unwrap();

      await dispatch(getProjectMembersThunk(projectId));
      showToast.success("Member removed successfully");
      setSelectedMember(null);
    } catch (error) {
      showToast.error("Failed to remove member");
    }
  };

  if (loading) {
    return <MembersSkeleton viewMode={viewMode} />;
  }

  return (
    <>
      <div className="overflow-hidden rounded-3xl border border-[var(--border)] shadow-sm bg-[var(--card)]">
        {/* Card header */}
        <div className="px-6 py-5 border-b border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-black text-base text-[var(--text)] flex items-center gap-2">
              <Users size={18} className="text-[var(--primary)]" />
              Project Members Directory
            </h2>
            <p className="text-[11px] text-[var(--muted)] mt-0.5">
              Manage project collaborators, role assignments, and access levels
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* View Toggle Switcher */}
            <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-[var(--border)] shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className="px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 text-xs font-black select-none"
                style={{
                  background: viewMode === "table" ? "var(--card)" : "transparent",
                  color: viewMode === "table" ? "var(--primary)" : "var(--muted)",
                  boxShadow: viewMode === "table" ? "var(--shadow)" : "none",
                }}
              >
                <List size={14} strokeWidth={2.5} />
                Table View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("card")}
                className="px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 text-xs font-black select-none"
                style={{
                  background: viewMode === "card" ? "var(--card)" : "transparent",
                  color: viewMode === "card" ? "var(--primary)" : "var(--muted)",
                  boxShadow: viewMode === "card" ? "var(--shadow)" : "none",
                }}
              >
                <LayoutGrid size={14} strokeWidth={2.5} />
                Card View
              </button>
            </div>

            {canManageMembers && (
              <button
                onClick={onAddMember}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-white bg-[var(--primary)] hover:opacity-90 transition cursor-pointer select-none shrink-0 shadow-sm"
              >
                <Plus size={14} strokeWidth={2.5} />
                Add Member
              </button>
            )}
          </div>
        </div>

        {/* Content View */}
        {members.length > 0 ? (
          viewMode === "table" ? (
            /* Table View */
            <div className="overflow-x-auto animate-in fade-in duration-200">
              <table className="w-full text-sm border-collapse text-left">
                <thead>
                  <tr className="bg-black/[0.02] dark:bg-white/[0.03]">
                    <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">
                      Member
                    </th>
                    <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">
                      Role
                    </th>
                    <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">
                      Joined
                    </th>
                    {canManageMembers && (
                      <th className="px-5 py-3.5 text-right text-[10px] font-black uppercase tracking-widest text-[var(--muted)] pr-6">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {members.map((member) => (
                    <tr
                      key={member.id}
                      className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] border-b border-[var(--border)]/60 last:border-b-0 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <MemberAvatar member={member} sizeClass="w-9 h-9" textClass="text-sm" />
                          <div className="min-w-0">
                            <p className="font-black text-sm text-[var(--text)] truncate">
                              {member.member_name}
                            </p>
                            <p className="text-xs text-[var(--muted)] truncate">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border inline-flex items-center gap-1.5 ${
                            member.role_name === "manager"
                              ? "bg-blue-500/10 dark:bg-blue-400/[0.12] text-blue-600 dark:text-blue-300 border-blue-500/20 dark:border-blue-400/20"
                              : "bg-emerald-500/10 dark:bg-emerald-400/[0.12] text-emerald-600 dark:text-emerald-300 border-emerald-500/20 dark:border-emerald-400/20"
                          }`}
                        >
                          {member.role_name}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-xs font-bold text-[var(--muted)]">
                          {new Date(member.joined_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                        </span>
                      </td>

                      {canManageMembers && (
                        <td className="px-5 py-4 text-right pr-6">
                          <button
                            onClick={() => setSelectedMember(member)}
                            title="Remove member"
                            className="h-8 w-8 rounded-xl border border-transparent inline-flex items-center justify-center text-[var(--muted)] hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 dark:hover:bg-rose-400/10 hover:border-rose-500/20 transition-all active:scale-95 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Card View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6 animate-in fade-in duration-200">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="rounded-2xl border border-[var(--border)] p-5 bg-black/[0.02] dark:bg-white/[0.02] hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <MemberAvatar member={member} sizeClass="w-10 h-10" textClass="text-sm" />
                      <div className="min-w-0">
                        <h4 className="font-black text-sm text-[var(--text)] truncate">
                          {member.member_name}
                        </h4>
                        <p className="text-xs text-[var(--muted)] truncate mt-0.5">
                          {member.email}
                        </p>
                      </div>
                    </div>

                    {canManageMembers && (
                      <button
                        onClick={() => setSelectedMember(member)}
                        title="Remove member"
                        className="h-7 w-7 rounded-lg border border-transparent inline-flex items-center justify-center text-[var(--muted)] hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 dark:hover:bg-rose-400/10 transition-all active:scale-95 cursor-pointer shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[var(--border)]/60 flex items-center justify-between text-xs">
                    <span
                      className={`px-2.5 py-0.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                        member.role_name === "manager"
                          ? "bg-blue-500/10 dark:bg-blue-400/[0.12] text-blue-600 dark:text-blue-300 border-blue-500/20 dark:border-blue-400/20"
                          : "bg-emerald-500/10 dark:bg-emerald-400/[0.12] text-emerald-600 dark:text-emerald-300 border-emerald-500/20 dark:border-emerald-400/20"
                      }`}
                    >
                      {member.role_name}
                    </span>
                    <span className="text-[11px] font-semibold text-[var(--muted)]">
                      {new Date(member.joined_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Empty State */
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="bg-[var(--primary)]/10 text-[var(--primary)] rounded-2xl p-4 inline-flex mb-3.5">
              <UserMinus size={28} />
            </div>
            <h3 className="font-black text-base text-[var(--text)]">
              No Members Yet
            </h3>
            <p className="text-xs text-[var(--muted)] max-w-xs mx-auto mt-1 font-medium">
              Add collaborators to co-manage this project workspace.
            </p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        loading={actionLoading}
        title="Remove Project Member?"
        message={`Are you sure you want to remove ${selectedMember?.member_name}? They will lose access to this project immediately.`}
        confirmLabel="Remove Member"
        variant="danger"
        onConfirm={handleRemove}
      />
    </>
  );
}

function MembersSkeleton({ viewMode }) {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] overflow-hidden animate-pulse">
      <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-36 bg-neutral-400/20 rounded-lg" />
          <div className="h-3 w-52 bg-neutral-400/10 rounded-md" />
        </div>
        <div className="h-8 w-44 bg-neutral-400/20 rounded-xl" />
      </div>

      {viewMode === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl border border-[var(--border)] p-4 bg-black/[0.02] space-y-3" />
          ))}
        </div>
      ) : (
        [...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-6 py-4 border-b border-[var(--border)]/60 last:border-b-0"
          >
            <div className="w-9 h-9 rounded-xl bg-neutral-400/20 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 bg-neutral-400/20 rounded-md" />
              <div className="h-2.5 w-48 bg-neutral-400/10 rounded-md" />
            </div>
            <div className="h-6 w-20 bg-neutral-400/20 rounded-xl" />
          </div>
        ))
      )}
    </div>
  );
}