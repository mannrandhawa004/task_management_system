"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Search, SearchX, FolderX, LayoutGrid, List, ChevronLeft, ChevronRight } from "lucide-react";
import { getProjectsThunk } from "@/features/projects/thunks/projectThunk";
import { canCreateProject } from "@/lib/permissions";
import ProjectTable from "@/components/projects/ProjectTable";
import CreateProjectDrawer from "@/components/projects/CreateProjectDrawer";
import Pagination from "@/components/common/Pagination";

const PROJECT_STATUS_FILTERS = [
  { key: "all", label: "All Projects" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
  { key: "completed", label: "Completed" },
];

export default function Page() {
  const dispatch = useDispatch();
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("table");
  const [openDrawer, setOpenDrawer] = useState(false);
  const { projects, loading, pagination } = useSelector((state) => state.project);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getProjectsThunk({ page: pagination.currentPage, limit: pagination.pageSize }));
  }, [dispatch]);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name?.toLowerCase().includes(search.toLowerCase()) ||
      project.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === "all" ? true : project.status === status;
    return matchesSearch && matchesStatus;
  });

  const isApiEmpty = !loading && projects.length === 0;
  const isSearchEmpty = !loading && projects.length > 0 && filteredProjects.length === 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-4">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row gap-5 justify-between items-start sm:items-center pb-2">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>
            Projects
          </h1>
          <p className="mt-1.5 text-sm font-medium" style={{ color: "var(--muted)" }}>
            Manage, organize, and track your platform work spaces.
          </p>
        </div>

        {canCreateProject(user) && (
          <button
            onClick={() => setOpenDrawer(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 font-semibold shadow-md cursor-pointer select-none transition-all duration-200 active:scale-98 hover:opacity-90"
            style={{
              background: "var(--primary)",
              color: "#fff",
              boxShadow: "0 4px 14px var(--ring)",
            }}
          >
            <Plus size={18} strokeWidth={2.5} />
            Create Project
          </button>
        )}
      </div>

      {/* SEARCH AND FILTERS BAR */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center p-2 rounded-2xl border" style={{ background: "var(--glass)", borderColor: "var(--border)" }}>
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" style={{ color: "var(--text)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name or description..."
            className="w-full rounded-xl border pl-11 pr-4 py-3 text-sm outline-none transition-all focus:ring-2"
            style={{
              background: "var(--input)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-4">
          {/* STATUS PILLS */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-black/5 dark:bg-white/5">
            {PROJECT_STATUS_FILTERS.map((item) => {
              const active = status === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setStatus(item.key)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all duration-200"
                  style={{
                    background: active ? "var(--card)" : "transparent",
                    color: active ? "var(--primary)" : "var(--muted)",
                    boxShadow: active ? "var(--shadow)" : "none",
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* VIEW SWITCHER */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-black/5 dark:bg-white/5 shrink-0">
            <button
              onClick={() => setView("table")}
              className="p-2 rounded-lg transition-all"
              style={{
                background: view === "table" ? "var(--card)" : "transparent",
                color: view === "table" ? "var(--primary)" : "var(--muted)",
              }}
              title="Table view"
            >
              <List size={16} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => setView("card")}
              className="p-2 rounded-lg transition-all"
              style={{
                background: view === "card" ? "var(--card)" : "transparent",
                color: view === "card" ? "var(--primary)" : "var(--muted)",
              }}
              title="Card grid view"
            >
              <LayoutGrid size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* RENDER CONDITIONS CONTAINER */}
      <div className="min-h-[400px]">
        {isApiEmpty ? (
          <div className="flex flex-col items-center justify-center py-24 text-center rounded-3xl border border-dashed" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <div className="p-5 rounded-2xl mb-4 text-red-400" style={{ backgroundColor: "var(--input)" }}>
              <FolderX size={32} />
            </div>
            <h3 className="text-xl font-bold tracking-tight" style={{ color: "var(--text)" }}>No projects yet</h3>
            <p className="mt-2 text-sm max-w-xs mx-auto leading-relaxed" style={{ color: "var(--muted)" }}>
              Get started by establishing your very first project framework dashboard.
            </p>
          </div>
        ) : isSearchEmpty ? (
          <div className="flex flex-col items-center justify-center py-24 text-center rounded-3xl border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <div className="p-5 rounded-2xl mb-4" style={{ backgroundColor: "var(--input)", color: "var(--muted)" }}>
              <SearchX size={32} />
            </div>
            <h3 className="text-xl font-bold tracking-tight" style={{ color: "var(--text)" }}>No matching results</h3>
            <p className="mt-2 text-sm max-w-xs mx-auto leading-relaxed" style={{ color: "var(--muted)" }}>
              We couldn't find matches matching "<span className="font-semibold text-[var(--text)]">{search}</span>". Try typing different keywords.
            </p>
          </div>
        ) : (
          <ProjectTable projects={filteredProjects} loading={loading} user={user} view={view} />
        )}
      </div>

      {/* PAGINATION CONTROLS */}
      {!isApiEmpty && projects.length > 0 && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-xs mt-4">
          <Pagination
            page={pagination?.currentPage || 1}
            limit={pagination?.pageSize || 10}
            total={pagination?.totalItems || projects.length}
            totalPages={pagination?.totalPages || 1}
            onPageChange={({ page, limit }) => {
              dispatch(getProjectsThunk({ page, limit }));
            }}
          />
        </div>
      )}

      <CreateProjectDrawer open={openDrawer} onClose={() => setOpenDrawer(false)} />
    </div>
  );
}