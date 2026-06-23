"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Pencil, Trash2, User, Mail, ShieldAlert, Calendar, Eye } from "lucide-react";
import Link from "next/link";

import ConfirmDialog from "../common/ConfirmDialog";
import UpdateProjectDrawer from "./UpdateProjectDrawer";
import { deleteProjectThunk } from "@/features/projects/thunks/projectThunk";
import { showToast } from "@/lib/toast";
import { canUpdateProject, canDeleteProject } from "@/lib/permissions";

export default function ProjectTable({ projects = [], loading, user, view }) {
  const dispatch = useDispatch();
  const [localProjects, setLocalProjects] = useState(projects);

  useEffect(() => {
    setLocalProjects(projects);
  }, [projects]);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleOpenDelete = (project) => {
    setSelectedProject(project);
    setDeleteOpen(true);
  };

  const handleOpenUpdate = (project) => {
    setSelectedProject(project);
    setUpdateOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedProject) return;
    const projectId = selectedProject.id;
    const previousProjects = [...localProjects];

    setLocalProjects((prev) => prev.filter((p) => p.id !== projectId));
    setDeleteOpen(false);

    try {
      setDeleteLoading(true);
      await dispatch(deleteProjectThunk(projectId)).unwrap();
      showToast.success("Project deleted successfully");
      setSelectedProject(null);
    } catch (err) {
      setLocalProjects(previousProjects);
      showToast.error(err || "Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "completed":
        return { background: "rgba(34, 197, 94, 0.12)", color: "#22c55e" };
      case "active":
        return { background: "rgba(59, 130, 246, 0.12)", color: "#3b82f6" };
      default:
        return { background: "rgba(245, 158, 11, 0.12)", color: "#f59e0b" };
    }
  };

  if (loading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 rounded-2xl border p-5 space-y-4 animate-pulse" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="flex justify-between"><div className="h-5 w-1/2 bg-neutral-400/20 rounded-lg" /><div className="h-5 w-16 bg-neutral-400/20 rounded-full" /></div>
            <div className="space-y-2"><div className="h-3 w-full bg-neutral-400/20 rounded-md" /><div className="h-3 w-4/5 bg-neutral-400/20 rounded-md" /></div>
            <div className="pt-4 space-y-2"><div className="h-3 w-1/3 bg-neutral-400/20 rounded-md" /><div className="h-3 w-1/2 bg-neutral-400/20 rounded-md" /></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {view === "card" ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {localProjects.map((project) => (
            <div
              key={project.id}
              className="group flex flex-col justify-between rounded-2xl border p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              style={{ borderColor: "var(--border)", background: "var(--card)", boxShadow: "var(--shadow)" }}
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-bold text-lg tracking-tight truncate" style={{ color: "var(--text)" }}>
                    {project.name}
                  </h3>
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold tracking-wide shrink-0 capitalize" style={getStatusStyles(project.status)}>
                    {project.status}
                  </span>
                </div>

                <p className="text-xs mt-3 leading-relaxed line-clamp-2" style={{ color: "var(--muted)" }}>
                  {project.description || "No description provided."}
                </p>

                <div className="my-4 border-t border-dashed" style={{ borderColor: "var(--border)" }} />

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center gap-2.5" style={{ color: "var(--text)" }}>
                    <div className="p-1.5 rounded-lg" style={{ background: "var(--input)" }}><User size={13} /></div>
                    <span className="font-semibold truncate">{project.creator_name}</span>
                  </div>
                  <div className="flex items-center gap-2.5 opacity-70 pl-8" style={{ color: "var(--muted)" }}>
                    <Mail size={12} />
                    <span className="truncate">{project.creator_email}</span>
                  </div>
                  <div className="flex items-center gap-2.5" style={{ color: "var(--text)" }}>
                    <div className="p-1.5 rounded-lg" style={{ background: "var(--input)" }}><ShieldAlert size={13} /></div>
                    <span>Role: <strong className="text-[var(--primary)] font-semibold">{project.role || "Member"}</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5" style={{ color: "var(--muted)" }}>
                    <div className="p-1.5 rounded-lg" style={{ background: "var(--input)" }}><Calendar size={13} /></div>
                    <span>{new Date(project.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center gap-2 mt-6 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="p-2 rounded-xl text-emerald-500 hover:bg-emerald-500/10 transition-all active:scale-90"
                  title="View Details"
                >
                  <Eye size={16} strokeWidth={2.5} />
                </Link>

                {canUpdateProject(user) && (
                  <button
                    onClick={() => handleOpenUpdate(project)}
                    className="p-2 rounded-xl text-blue-500 hover:bg-blue-500/10 transition-all active:scale-90"
                    title="Edit Properties"
                  >
                    <Pencil size={16} strokeWidth={2.5} />
                  </button>
                )}

                {canDeleteProject(user) && (
                  <button
                    onClick={() => handleOpenDelete(project)}
                    className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-all active:scale-90"
                    title="Purge Project"
                  >
                    <Trash2 size={16} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border shadow-sm" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <table className="w-full text-sm border-collapse text-left">
            <thead>
              <tr className="border-b text-xs font-bold uppercase tracking-wider" style={{ background: "var(--input)", borderColor: "var(--border)", color: "var(--muted)" }}>
                <th className="p-4 w-12 text-center">#</th>
                <th className="p-4">Project Workspace</th>
                <th className="p-4">Operational Status</th>
                <th className="p-4">Project Authority</th>
                <th className="p-4">Access Tier</th>
                <th className="p-4">Date Launched</th>
                <th className="p-4 text-right pr-6">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
              {localProjects.map((project, index) => (
                <tr key={project.id} className="transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                  <td className="p-4 text-center font-bold opacity-40">{index + 1}</td>
                  <td className="p-4 max-w-xs">
                    <div className="font-bold text-base tracking-tight truncate" style={{ color: "var(--text)" }}>{project.name}</div>
                    <div className="text-xs truncate mt-0.5" style={{ color: "var(--muted)" }}>{project.description || "No description written"}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 text-xs rounded-full font-bold uppercase tracking-wider inline-block" style={getStatusStyles(project.status)}>
                      {project.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold" style={{ color: "var(--text)" }}>{project.creator_name}</div>
                    <div className="text-xs opacity-70" style={{ color: "var(--muted)" }}>{project.creator_email}</div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wide" style={{ backgroundColor: "var(--input)", borderColor: "var(--border)", color: "var(--text)" }}>
                      {project.role || "Member"}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-medium" style={{ color: "var(--muted)" }}>
                    {new Date(project.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                  </td>
                  <td className="p-4 text-right pr-6">
                    <div className="flex justify-end items-center gap-1.5">
                      <Link href={`/dashboard/projects/${project.id}`} className="p-2 rounded-xl text-emerald-500 hover:bg-emerald-500/10 transition-all" title="Open View">
                        <Eye size={15} strokeWidth={2.5} />
                      </Link>
                      {canUpdateProject(user) && (
                        <button onClick={() => handleOpenUpdate(project)} className="p-2 rounded-xl text-blue-500 hover:bg-blue-500/10 transition-all" title="Edit Layout">
                          <Pencil size={15} strokeWidth={2.5} />
                        </button>
                      )}
                      {canDeleteProject(user) && (
                        <button onClick={() => handleOpenDelete(project)} className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-all" title="Remove Record">
                          <Trash2 size={15} strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <UpdateProjectDrawer open={updateOpen} onClose={() => setUpdateOpen(false)} project={selectedProject} />
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Project"
        message="Are you sure you want to delete this project? All associated tasks and member records will be permanently removed."
        confirmLabel="Delete Project"
        variant="danger"
      />
    </>
  );
}