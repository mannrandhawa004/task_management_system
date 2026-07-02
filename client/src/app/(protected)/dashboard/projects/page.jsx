"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Search, SearchX, FolderX, LayoutGrid, List, FolderKanban } from "lucide-react";
import { getProjectsThunk } from "@/features/projects/thunks/projectThunk";
import { canCreateProject } from "@/lib/permissions";
import ProjectTable from "@/components/projects/ProjectTable";
import CreateProjectDrawer from "@/components/projects/CreateProjectDrawer";
import Pagination from "@/components/common/Pagination";

const STATUS_FILTERS = [
  { key: "all",       label: "All Projects" },
  { key: "active",    label: "Active"       },
  { key: "inactive",  label: "Inactive"     },
  { key: "completed", label: "Completed"    },
];

export default function Page() {
  const dispatch = useDispatch();
  const [status, setStatus]           = useState("all");
  const [search, setSearch]           = useState("");
  const [view, setView]               = useState("table");
  const [openDrawer, setOpenDrawer]   = useState(false);
  const { projects, loading, pagination } = useSelector((s) => s.project);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(getProjectsThunk({ page: pagination.currentPage, limit: pagination.pageSize }));
  }, [dispatch]);

  const filteredProjects = projects.filter((p) => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === "all" || p.status === status;
    return matchSearch && matchStatus;
  });

  const isApiEmpty    = !loading && projects.length === 0;
  const isSearchEmpty = !loading && projects.length > 0 && filteredProjects.length === 0;

  return (
    <div className="space-y-5 max-w-7xl mx-auto w-full">

      {/* ── PAGE HEADER CARD ── */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-1.5 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
              <FolderKanban size={15} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]">Workspace</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[var(--text)]">Projects</h1>
          <p className="mt-1 text-xs md:text-sm font-medium text-[var(--muted)] max-w-xl">
            Manage, organize, and track your platform work spaces and team deliverables.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-3 shrink-0">
          {/* View toggle */}
          <div className="flex items-center gap-1 bg-black/[0.03] dark:bg-white/[0.03] p-1 rounded-2xl border border-[var(--border)]">
            <button
              onClick={() => setView("table")}
              className={`p-2 rounded-xl transition-all cursor-pointer ${view === "table" ? "bg-[var(--card)] text-[var(--primary)] shadow-sm border border-[var(--border)]" : "text-[var(--muted)] hover:text-[var(--text)]"}`}
              title="Table View"
            >
              <List size={14} />
            </button>
            <button
              onClick={() => setView("card")}
              className={`p-2 rounded-xl transition-all cursor-pointer ${view === "card" ? "bg-[var(--card)] text-[var(--primary)] shadow-sm border border-[var(--border)]" : "text-[var(--muted)] hover:text-[var(--text)]"}`}
              title="Card View"
            >
              <LayoutGrid size={14} />
            </button>
          </div>

          {canCreateProject(user) && (
            <button
              onClick={() => setOpenDrawer(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm text-white hover:opacity-90 hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer shadow-sm"
              style={{ background: "var(--primary)" }}
            >
              <Plus size={16} />
              Create Project
            </button>
          )}
        </div>
      </div>

      {/* ── SEARCH + STATUS FILTERS BAR ── */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-4 shadow-sm flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
        {/* Search input */}
        <div className="relative flex-1 flex items-center bg-[var(--hover)]/40 rounded-2xl border border-[var(--border)] px-3 focus-within:border-[var(--primary)] focus-within:ring-1 focus-within:ring-[var(--primary)]/20 transition-all">
          <Search size={14} className="text-[var(--muted)] mr-2 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name or description…"
            className="w-full py-2.5 bg-transparent text-xs font-bold text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
          />
        </div>

        {/* Status filter pills */}
        <div className="flex gap-1.5 bg-black/[0.03] dark:bg-white/[0.03] p-1 rounded-2xl border border-[var(--border)] shrink-0 flex-wrap sm:flex-nowrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatus(f.key)}
              className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap ${
                status === f.key
                  ? "bg-[var(--card)] text-[var(--primary)] shadow-sm border border-[var(--border)]"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="min-h-[400px]">
        {isApiEmpty ? (
          <div className="flex flex-col items-center justify-center py-24 text-center rounded-3xl border border-dashed border-[var(--border)] bg-[var(--card)]">
            <div className="p-5 rounded-2xl mb-4 bg-[var(--primary)]/10 text-[var(--primary)]">
              <FolderX size={32} />
            </div>
            <h3 className="text-base font-black text-[var(--text)]">No projects yet</h3>
            <p className="mt-1.5 text-xs text-[var(--muted)] max-w-xs leading-relaxed">
              Get started by creating your very first project workspace.
            </p>
          </div>
        ) : isSearchEmpty ? (
          <div className="flex flex-col items-center justify-center py-24 text-center rounded-3xl border border-[var(--border)] bg-[var(--card)]">
            <div className="p-5 rounded-2xl mb-4 bg-[var(--hover)] text-[var(--muted)]">
              <SearchX size={32} />
            </div>
            <h3 className="text-base font-black text-[var(--text)]">No matching results</h3>
            <p className="mt-1.5 text-xs text-[var(--muted)] max-w-xs leading-relaxed">
              No projects match <span className="font-bold text-[var(--text)]">"{search}"</span>. Try different keywords.
            </p>
          </div>
        ) : (
          <ProjectTable projects={filteredProjects} loading={loading} user={user} view={view} />
        )}
      </div>

      {/* ── PAGINATION ── */}
      {!isApiEmpty && projects.length > 0 && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm">
          <Pagination
            page={pagination?.currentPage || 1}
            limit={pagination?.pageSize || 10}
            total={pagination?.totalItems || projects.length}
            totalPages={pagination?.totalPages || 1}
            onPageChange={({ page, limit }) => dispatch(getProjectsThunk({ page, limit }))}
          />
        </div>
      )}

      <CreateProjectDrawer open={openDrawer} onClose={() => setOpenDrawer(false)} />
    </div>
  );
}