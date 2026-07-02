"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Users, Plus, Trash2, UserMinus } from "lucide-react";

import ConfirmDialog from "../common/ConfirmDialog";
import { getProjectMembersThunk, removeProjectMemberThunk } from "@/features/projects/thunks/projectThunk";
import { showToast } from "@/lib/toast";

export default function ProjectMembersTable({
  members = [],
  loading = false,
  projectId,
  onAddMember,
  canManageMembers,
}) {
  const dispatch = useDispatch();
  const [selectedMember, setSelectedMember] = useState(null);
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
    return <MembersSkeleton />;
  }

  return (
    <>
      <div className="overflow-hidden rounded-3xl border border-[var(--border)] shadow-sm bg-[var(--card)]">
        {/* Card header */}
        <div className="px-6 py-5 border-b border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-black text-base text-[var(--text)] flex items-center gap-2">
              <Users size={18} className="text-[var(--primary)]" />
              Project Members
            </h2>
            <p className="text-[11px] text-[var(--muted)] mt-0.5">
              Manage project collaborators and access levels
            </p>
          </div>

          {canManageMembers && (
            <button
              onClick={onAddMember}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-white bg-[var(--primary)] hover:opacity-90 transition cursor-pointer select-none"
            >
              <Plus size={14} strokeWidth={2.5} />
              Add New Member
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
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
                  <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {members.length > 0 ? (
                members.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] border-b border-[var(--border)]/60 last:border-b-0"
                  >
                    {/* Avatar + name + email */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-black text-sm shrink-0">
                          {member.member_name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
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

                    {/* Role badge */}
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

                    {/* Joined date */}
                    <td className="px-5 py-4">
                      <span className="text-xs font-bold text-[var(--muted)]">
                        {new Date(member.joined_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                      </span>
                    </td>

                    {/* Delete action */}
                    {canManageMembers && (
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setSelectedMember(member)}
                          title="Remove member"
                          className="h-8 w-8 rounded-xl border border-transparent flex items-center justify-center text-[var(--muted)] hover:text-rose-400 dark:hover:text-rose-400 hover:bg-rose-500/10 dark:hover:bg-rose-400/10 hover:border-rose-500/20 transition-all active:scale-95 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={canManageMembers ? 4 : 3} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="bg-[var(--primary)]/10 text-[var(--primary)] rounded-2xl p-4 inline-flex">
                        <UserMinus size={28} />
                      </div>
                      <h3 className="font-black text-base text-[var(--text)]">
                        No Members Yet
                      </h3>
                      <p className="text-[11px] text-[var(--muted)] max-w-xs mx-auto">
                        Add collaborators to co-manage this project.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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

function MembersSkeleton() {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] overflow-hidden animate-pulse">
      {/* Header skeleton */}
      <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-36 bg-neutral-400/20 rounded-lg" />
          <div className="h-3 w-52 bg-neutral-400/10 rounded-md" />
        </div>
        <div className="h-8 w-28 bg-neutral-400/20 rounded-xl" />
      </div>
      {/* Row skeletons */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-6 py-4 border-b border-[var(--border)]/60 last:border-b-0"
        >
          <div className="w-9 h-9 rounded-xl bg-neutral-400/20 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 bg-neutral-400/20 rounded-md" />
            <div className="h-2.5 w-48 bg-neutral-400/10 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}