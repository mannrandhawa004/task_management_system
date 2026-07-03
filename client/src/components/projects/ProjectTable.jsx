"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Pencil, Trash2, Eye, Calendar, User, Mail, Shield, FolderKanban } from "lucide-react";
import Link from "next/link";
import ConfirmDialog from "../common/ConfirmDialog";
import UpdateProjectDrawer from "./UpdateProjectDrawer";
import { deleteProjectThunk } from "@/features/projects/thunks/projectThunk";
import { showToast } from "@/lib/toast";
import { canUpdateProject, canDeleteProject } from "@/lib/permissions";

// ── Dark-aware status badge tokens ────────────────────────────────────────────
const statusTone = {
  active: {
    bg:     "bg-blue-500/10 dark:bg-blue-400/[0.12]",
    text:   "text-blue-600 dark:text-blue-300",
    border: "border-blue-500/20 dark:border-blue-400/20",
    dot:    "bg-blue-400",
  },
  completed: {
    bg:     "bg-emerald-500/10 dark:bg-emerald-400/[0.12]",
    text:   "text-emerald-600 dark:text-emerald-300",
    border: "border-emerald-500/20 dark:border-emerald-400/20",
    dot:    "bg-emerald-400",
  },
  inactive: {
    bg:     "bg-amber-500/10 dark:bg-amber-400/[0.12]",
    text:   "text-amber-600 dark:text-amber-300",
    border: "border-amber-500/20 dark:border-amber-400/20",
    dot:    "bg-amber-400",
  },
};

function StatusBadge({ status }) {
  const t = statusTone[status] || statusTone.inactive;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${t.bg} ${t.text} ${t.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.dot}`} />
      {status}
    </span>
  );
}

// ── Action buttons shared helper ─────────────────────────────────────────────
function ActionBtn({ href, onClick, icon: Icon, label, variant = "primary" }) {
  const cls =
    variant === "danger"
      ? "text-[var(--muted)] hover:text-rose-400 dark:hover:text-rose-400 hover:bg-rose-500/10 dark:hover:bg-rose-400/10 hover:border-rose-500/20 border-transparent"
      : "text-[var(--primary)] hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/30 border-[var(--border)] bg-black/[0.02] dark:bg-white/[0.04]";

  const shared = `h-8 w-8 rounded-xl border flex items-center justify-center transition-all active:scale-95 cursor-pointer ${cls}`;

  if (href) return (
    <Link href={href} className={shared} title={label}><Icon size={14} /></Link>
  );
  return (
    <button type="button" onClick={onClick} className={shared} title={label}><Icon size={14} /></button>
  );
}

function getTwoInitials(name) {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function CreatorAvatar({ project, sizeClass = "w-7 h-7", textClass = "text-xs", roundedClass = "rounded-lg" }) {
  const [imgError, setImgError] = useState(false);
  const avatarUrl = project?.avatar || project?.creator_avatar;
  const initials = getTwoInitials(project?.creator_name);

  return (
    <div className={`relative overflow-hidden shrink-0 flex items-center justify-center bg-[var(--primary)]/15 text-[var(--primary)] font-black border border-[var(--primary)]/20 shadow-2xs ${sizeClass} ${textClass} ${roundedClass}`}>
      {avatarUrl && !imgError ? (
        <img
          src={avatarUrl}
          alt={project?.creator_name || "Creator"}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ProjectTable({ projects = [], loading, user, view }) {
  const dispatch = useDispatch();
  const [localProjects, setLocalProjects]   = useState(projects);
  const [deleteOpen, setDeleteOpen]         = useState(false);
  const [updateOpen, setUpdateOpen]         = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [deleteLoading, setDeleteLoading]   = useState(false);

  useEffect(() => { setLocalProjects(projects); }, [projects]);

  const openDelete = (project) => { setSelectedProject(project); setDeleteOpen(true); };
  const openUpdate = (project) => { setSelectedProject(project); setUpdateOpen(true); };

  const handleDelete = async () => {
    if (!selectedProject) return;
    const id = selectedProject.id;
    const prev = [...localProjects];
    setLocalProjects((p) => p.filter((x) => x.id !== id));
    setDeleteOpen(false);
    try {
      setDeleteLoading(true);
      await dispatch(deleteProjectThunk(id)).unwrap();
      showToast.success("Project deleted successfully");
      setSelectedProject(null);
    } catch (err) {
      setLocalProjects(prev);
      showToast.error(err || "Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  const roleLabel = (project) =>
    user?.role?.toLowerCase() === "super_admin" ? "Super Admin" : (project.role || "Member");

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    if (view === "card") {
      return (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 animate-pulse flex flex-col gap-4">
              <div className="flex justify-between">
                <div className="h-4 w-1/2 bg-[var(--hover)] rounded-lg" />
                <div className="h-5 w-16 bg-[var(--hover)] rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-[var(--hover)] rounded-md" />
                <div className="h-3 w-4/5 bg-[var(--hover)] rounded-md" />
              </div>
              <div className="mt-auto h-9 bg-[var(--hover)] rounded-xl w-full" />
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] overflow-hidden animate-pulse">
        <div className="h-11 bg-[var(--hover)] border-b border-[var(--border)]" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-[var(--border)]/60">
            <div className="w-8 h-8 bg-[var(--hover)] rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-[var(--hover)] rounded-lg w-48" />
              <div className="h-2.5 bg-[var(--hover)] rounded-lg w-64" />
            </div>
            <div className="h-6 bg-[var(--hover)] rounded-lg w-20" />
            <div className="h-6 bg-[var(--hover)] rounded-lg w-28" />
            <div className="h-6 bg-[var(--hover)] rounded-lg w-16" />
            <div className="flex gap-2">
              {[0,1,2].map(j => <div key={j} className="h-8 w-8 bg-[var(--hover)] rounded-xl" />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CARD VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (view === "card") {
    return (
      <>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in duration-300">
          {localProjects.map((project) => (
            <div
              key={project.id}
              className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
            >
              {/* Accent stripe */}
              <div className="h-[3px] bg-gradient-to-r from-[var(--primary)] via-[var(--primary)]/40 to-transparent" />

              <div className="p-5 flex-1 flex flex-col gap-3">
                {/* Title + status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <FolderKanban size={17} />
                  </div>
                  <StatusBadge status={project.status} />
                </div>

                <div>
                  <h3 className="font-black text-sm tracking-tight text-[var(--text)] truncate group-hover:text-[var(--primary)] transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-[11px] text-[var(--muted)] line-clamp-2 mt-1 leading-relaxed">
                    {project.description || "No description provided."}
                  </p>
                </div>

                {/* Meta grid */}
                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <div className="flex flex-col gap-1 bg-black/[0.03] dark:bg-white/[0.04] rounded-xl p-2.5 border border-[var(--border)]/60">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] flex items-center gap-1"><User size={9}/> Creator</span>
                    <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                      <CreatorAvatar project={project} sizeClass="w-5 h-5" textClass="text-[8px]" roundedClass="rounded-md" />
                      <span className="text-[11px] font-black text-[var(--text)] truncate">{project.creator_name || "—"}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 bg-black/[0.03] dark:bg-white/[0.04] rounded-xl p-2.5 border border-[var(--border)]/60">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] flex items-center gap-1"><Shield size={9}/> Role</span>
                    <span className="text-[11px] font-black text-[var(--primary)] truncate">{roleLabel(project)}</span>
                  </div>
                  <div className="col-span-2 flex flex-col gap-1 bg-black/[0.03] dark:bg-white/[0.04] rounded-xl p-2.5 border border-[var(--border)]/60">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] flex items-center gap-1"><Calendar size={9}/> Launched</span>
                    <span className="text-[11px] font-black text-[var(--text)]">{new Date(project.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 pb-4">
                <div className="flex items-center gap-2 pt-3 border-t border-[var(--border)]/60">
                  <ActionBtn href={`/dashboard/projects/${project.id}`} icon={Eye} label="View" />
                  {canUpdateProject(user) && <ActionBtn onClick={() => openUpdate(project)} icon={Pencil} label="Edit" />}
                  {canDeleteProject(user) && <ActionBtn onClick={() => openDelete(project)} icon={Trash2} label="Delete" variant="danger" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        <UpdateProjectDrawer open={updateOpen} onClose={() => setUpdateOpen(false)} project={selectedProject} />
        <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} loading={deleteLoading} title="Delete Project" message="Are you sure you want to delete this project? All associated tasks and member records will be permanently removed." confirmLabel="Delete Project" variant="danger" />
      </>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TABLE VIEW
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <>
      <div className="overflow-hidden rounded-3xl border border-[var(--border)] shadow-sm bg-[var(--card)] animate-in fade-in duration-200">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-black/[0.02] dark:bg-white/[0.03]">
                {["Project", "Status", "Creator", "Role", "Launched", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-[var(--muted)] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {localProjects.map((project, idx) => (
                <tr
                  key={project.id}
                  className={`hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors duration-150 ${idx !== localProjects.length - 1 ? "border-b border-[var(--border)]/60" : ""}`}
                >
                  {/* Project name + description */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
                        <FolderKanban size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-[var(--text)] truncate">{project.name}</p>
                        <p className="text-[11px] text-[var(--muted)] truncate max-w-[220px]">{project.description || "—"}</p>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <StatusBadge status={project.status} />
                  </td>

                  {/* Creator */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <CreatorAvatar project={project} sizeClass="w-8 h-8" textClass="text-xs" roundedClass="rounded-xl" />
                      <div className="min-w-0">
                        <p className="text-xs font-black text-[var(--text)] truncate max-w-[130px]">{project.creator_name || "—"}</p>
                        <p className="text-[10px] text-[var(--muted)] truncate max-w-[130px]">{project.creator_email || ""}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border bg-black/[0.03] dark:bg-white/[0.04] border-[var(--border)] text-[var(--text)]">
                      <Shield size={10} className="text-[var(--primary)]" />
                      {roleLabel(project)}
                    </span>
                  </td>

                  {/* Launched */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={11} className="text-[var(--muted)] shrink-0" />
                      <span className="text-xs font-bold text-[var(--muted)] whitespace-nowrap">
                        {new Date(project.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <ActionBtn href={`/dashboard/projects/${project.id}`} icon={Eye} label="View" />
                      {canUpdateProject(user) && <ActionBtn onClick={() => openUpdate(project)} icon={Pencil} label="Edit" />}
                      {canDeleteProject(user) && <ActionBtn onClick={() => openDelete(project)} icon={Trash2} label="Delete" variant="danger" />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <UpdateProjectDrawer open={updateOpen} onClose={() => setUpdateOpen(false)} project={selectedProject} />
      <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} loading={deleteLoading} title="Delete Project" message="Are you sure you want to delete this project? All associated tasks and member records will be permanently removed." confirmLabel="Delete Project" variant="danger" />
    </>
  );
}