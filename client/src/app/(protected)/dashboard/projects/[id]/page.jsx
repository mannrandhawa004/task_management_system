"use client";

import { use, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Users, FolderKanban, ShieldCheck, CheckSquare, Layers } from "lucide-react";

import { getProjectDetailsThunk, getProjectMembersThunk } from "@/features/projects/thunks/projectThunk";
import { getProjectTasksThunk } from "@/features/tasks/thunks/taskThunk";
import { clearTasks } from "@/features/tasks/slice/taskSlice";
import { canManageProjectMembers } from "@/lib/permissions";

import ProjectCardSkeleton from "@/components/projects/ProjectCardSkeleton";
import ProjectDetailsHeader from "@/components/projects/ProjectDetailsHeader";
import ProjectOverviewCard from "@/components/projects/ProjectOverviewCard";
import ProjectMembersTable from "@/components/projects/ProjectMembersTable";
import AddMemberDrawer from "@/components/projects/AddMemberDrawer";
import ProjectTasksSection from "@/components/tasks/ProjectTasksSection";
import CreateTaskDrawer from "@/components/tasks/CreateTaskDrawer";

export default function Page({ params }) {
  const dispatch = useDispatch();
  const { id: projectId } = use(params);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("members");
  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false);

  const [taskStatus, setTaskStatus] = useState("all");
  const [taskPage, setTaskPage] = useState(1);
  const taskLimit = 10;

  const { project, members, loading, memberLoading } = useSelector((state) => state.project);
  const { tasks } = useSelector((state) => state.task);
  const { users, user } = useSelector((state) => state.auth);

  // Calculate permission dynamically based on loaded user and project data
  const canManageMembers = project && user ? canManageProjectMembers(user, project) : false;

  useEffect(() => {
    if (!projectId) return;
    dispatch(clearTasks());
    dispatch(getProjectDetailsThunk(projectId));
    dispatch(getProjectMembersThunk(projectId));
  }, [dispatch, projectId]);

  useEffect(() => {
    if (!projectId) return;
    dispatch(
      getProjectTasksThunk({
        projectId,
        page: taskPage,
        limit: taskLimit,
        status: taskStatus === "all" ? undefined : taskStatus,
      })
    );
  }, [dispatch, projectId, taskPage, taskStatus]);

  if (loading || !project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <ProjectCardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-4">
      {/* HEADER SECTION */}
      <ProjectDetailsHeader project={project} />

      {/* OVERVIEW STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <ProjectOverviewCard
          title="Total Members"
          value={members?.length || 0}
          icon={Users}
          color="#3b82f6"
        />
        <ProjectOverviewCard
          title="Assigned Tasks"
          value={tasks?.length || 0}
          icon={CheckSquare}
          color="#8b5cf6"
        />
        <ProjectOverviewCard
          title="Current Status"
          value={project.status || "Active"}
          icon={FolderKanban}
          color="#22c55e"
        />
        <ProjectOverviewCard
          title="Your Access Tier"
          value={project?.role || user?.role || "Member"}
          icon={ShieldCheck}
          color="#f59e0b"
        />
      </div>

      {/* SEGMENTED TAB SWITCH NAVIGATION */}
      <div className="flex items-center justify-between border-b pb-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex gap-1 p-1 rounded-xl bg-black/5 dark:bg-white/5">
          <button
            type="button"
            onClick={() => setActiveTab("members")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all duration-200 cursor-pointer select-none"
            style={{
              background: activeTab === "members" ? "var(--card)" : "transparent",
              color: activeTab === "members" ? "var(--primary)" : "var(--muted)",
              boxShadow: activeTab === "members" ? "var(--shadow)" : "none",
            }}
          >
            <Users size={16} strokeWidth={activeTab === "members" ? 2.5 : 2} />
            Members ({members?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tasks")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all duration-200 cursor-pointer select-none"
            style={{
              background: activeTab === "tasks" ? "var(--card)" : "transparent",
              color: activeTab === "tasks" ? "var(--primary)" : "var(--muted)",
              boxShadow: activeTab === "tasks" ? "var(--shadow)" : "none",
            }}
          >
            <Layers size={16} strokeWidth={activeTab === "tasks" ? 2.5 : 2} />
            Tasks ({tasks?.length || 0})
          </button>
        </div>
      </div>

      {/* ACTIVE MOUNT BLOCKS */}
      <div className="min-h-[300px]">
        {activeTab === "members" && (
          <div className="animate-in fade-in duration-200">
            <ProjectMembersTable
              loading={memberLoading}
              members={members}
              projectId={projectId}
              canManageMembers={canManageMembers}
              onAddMember={() => setDrawerOpen(true)}
            />
            {canManageMembers && (
              <AddMemberDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                projectId={projectId}
                users={users}
                existingMembers={members}
              />
            )}
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="animate-in fade-in duration-200">
            <ProjectTasksSection
              project={project}
              onCreateTask={() => setTaskDrawerOpen(true)}
              canCreateTask={canManageMembers}
              status={taskStatus}
              setStatus={setTaskStatus}
              page={taskPage}
              setPage={setTaskPage}
            />
            {canManageMembers && (
              <CreateTaskDrawer
                open={taskDrawerOpen}
                onClose={() => setTaskDrawerOpen(false)}
                projectId={projectId}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}