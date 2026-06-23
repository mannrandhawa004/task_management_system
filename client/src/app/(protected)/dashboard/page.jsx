"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FolderKanban,
  ClipboardList,
  CheckCircle2,
  Loader2,
  X,
  Calendar,
  Layers,
  User,
  TrendingUp,
  ListTodo,
  Clock3,
  Sparkles,
  BarChart3,
} from "lucide-react";

import { myTaskThunk, getTaskByIdThunk } from "@/features/tasks/thunks/taskThunk";
import { clearCurrentTask } from "@/features/tasks/slice/taskSlice";
import { getAllUsersThunk } from "@/features/auth/thunks/authThunk";
import { getProjectDetailsThunk } from "@/features/projects/thunks/projectThunk";
import {
  getProjectStatsThunk,
  getInProgressTasksThunk,
  getCompletedTasksThunk,
  getUpcomingTasksThunk,
  getOverdueTasksThunk,
  getRecentlyActiveProjectsThunk,
  getRecentlyActiveTasksThunk,
  getDailyTaskProgressThunk,
} from "@/features/dashboard/thunks/dashboardThunks";
import { getSocket } from "@/lib/socket";

import { ProjectDistributionChart, TaskBreakdownChart, ProjectStatusChart } from "../../../components/dashboard/DashboardCharts";
import CriticalDeadlinesRadar from "../../../components/dashboard/CriticalDeadlinesRadar";
import RecentlyActiveProjects from "../../../components/dashboard/RecentlyActiveProjects";
import RecentlyActiveTasks from "../../../components/dashboard/RecentlyActiveTasks";
import DailyTaskProgressChart from "../../../components/dashboard/DailyTaskProgressChart";
import AppLoader from "@/components/common/AppLoader";
import Image from "next/image";


function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getTodayLabel() {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function DashboardPage() {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [overviewTitle, setOverviewTitle] = useState("");
  const [overviewFilterKey, setOverviewFilterKey] = useState("all");
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const { currentTask, taskLoading } = useSelector((state) => state.task);
  const { project: currentProject, loading: projectLoading } = useSelector((state) => state.project);
  const dashboard = useSelector((state) => state.dashboard);

  const isAdmin =
    user?.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "super_admin";

  // Fetch dashboard stats from API - single source of truth
  useEffect(() => {
    dispatch(getProjectStatsThunk({ page: 1, limit: 10 }));
    dispatch(getInProgressTasksThunk({ page: 1, limit: 10 }));
    dispatch(getCompletedTasksThunk({ page: 1, limit: 10 }));
    dispatch(getUpcomingTasksThunk({ page: 1, limit: 10 }));
    dispatch(getOverdueTasksThunk({ page: 1, limit: 10 }));
    dispatch(getRecentlyActiveProjectsThunk({ limit: 5 }));
    dispatch(getRecentlyActiveTasksThunk({ limit: 5 }));
    dispatch(getDailyTaskProgressThunk({ days: 30 }));
  }, [dispatch]);

  // Fetch additional data based on user role
  useEffect(() => {
    if (isAdmin) {
      dispatch(getAllUsersThunk({ page: 1, limit: 50 }));
    } else {
      dispatch(myTaskThunk());
    }
  }, [dispatch, isAdmin]);

  // Real-time socket listeners for dashboard updates
  useEffect(() => {
    const socket = getSocket();

    const handleActivityUpdate = () => {
      dispatch(getRecentlyActiveProjectsThunk({ limit: 5 }));
      dispatch(getRecentlyActiveTasksThunk({ limit: 5 }));
    };

    const handleTaskActivity = (data) => {
      // Safe parsing: always extract the project ID if the event sent one
      const eventProjectId = data?.projectId ? Number(data.projectId) : null;

      // Option A: Clean re-fetching passing the contextual project ID filter
      const queryFilters = { page: 1, limit: 10, ...(eventProjectId && { projectId: eventProjectId }) };

      dispatch(getInProgressTasksThunk(queryFilters));
      dispatch(getCompletedTasksThunk(queryFilters));
      dispatch(getUpcomingTasksThunk(queryFilters));
      dispatch(getOverdueTasksThunk(queryFilters));

      // Also ensure our active activity widgets pull the change
      dispatch(getRecentlyActiveProjectsThunk({ limit: 5 }));
      dispatch(getRecentlyActiveTasksThunk({ limit: 5 }));
    };

    // Listeners
    socket.on("project_activity_updated", handleActivityUpdate);
    socket.on("task_deleted", handleTaskActivity); // Passes data down to our helper
    socket.on("task_created", handleTaskActivity);
    socket.on("task_updated", handleTaskActivity);
    socket.on("audit_log_created", handleActivityUpdate);

    return () => {
      socket.off("project_activity_updated", handleActivityUpdate);
      socket.off("task_deleted", handleTaskActivity);
      socket.off("task_created", handleTaskActivity);
      socket.off("task_updated", handleTaskActivity);
      socket.off("audit_log_created", handleActivityUpdate);
    };
  }, [dispatch]);

  // Extract data from dashboard API responses
  const projectsData = dashboard.projectStats?.data || [];
  const projectMetrics = dashboard.projectStats?.metrics || {};

  const inProgressTasksData = dashboard.inProgressTasks?.data || [];
  const inProgressMetrics = dashboard.inProgressTasks?.metrics || {};

  const completedTasksData = dashboard.completedTasks?.data || [];
  const completedMetrics = dashboard.completedTasks?.metrics || {};

  const upcomingTasksData = dashboard.upcomingTasks?.data || [];
  const totalUpcomingTasks = dashboard.upcomingTasks.metrics || {}

  const overdueTasksData = dashboard.criticalRadar?.overdueTasks || [];
  const upcomingDeadlineTasks = dashboard.criticalRadar?.upcomingDeadlinesTasks || [];

  // Recently active projects
  const recentlyActiveProjectsData = dashboard.recentlyActiveProjects?.data || [];
  const recentlyActiveProjectsLoading = dashboard.recentlyActiveProjects?.loading || false;

  // Recently active tasks
  const recentlyActiveTasksData = dashboard.recentlyActiveTasks?.data || [];
  const recentlyActiveTasksLoading = dashboard.recentlyActiveTasks?.loading || false;

  // Daily task progress
  const dailyTaskProgressData = dashboard.dailyTaskProgress?.data || [];
  const dailyTaskProgressLoading = dashboard.dailyTaskProgress?.loading || false;

  // Project stats
  const totalProjectsCount = projectMetrics.totalProjects || projectsData.length;
  const activeProjectsCount = projectsData.filter(p => p?.status === 'active').length;

  const projectStatusData = [
    { name: "Active", value: activeProjectsCount, color: "#F59E0B" },
    { name: "Completed", value: completedMetrics.completedCount || 0, color: "#22C55E" },
    { name: "Inactive", value: projectMetrics.inactiveCount || 0, color: "#fb3a18ff" }
  ].filter((p) => p.value > 0);

  const pendingUrgentTasks = [...overdueTasksData]
    .filter((t) => t.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  const taskStatusData = [
    { name: "Upcoming", value: totalUpcomingTasks.upcomingTodoCount || 0, color: "#3b82f6" },
    { name: "In Progress", value: inProgressMetrics.inProgressCount || 0, color: "#F59E0B" },
    { name: "Completed", value: completedMetrics.completedCount || 0, color: "#22C55E" },
  ].filter((item) => item.value > 0);

  const projectDistributionData = projectsData
    .filter(p => p && p.name)
    .slice(0, 10)
    .map((p) => ({
      name: p.name.length > 10 ? `${p.name.substring(0, 10)}…` : p.name,
      tasks: p.remain_tasks || 0,
    }));

  const getOverviewData = () => {
    switch (overviewFilterKey) {
      case "projects":
        return {
          items: projectsData,
          pagination: dashboard.projectStats?.pagination || {},
          loading: dashboard.projectStats?.loading,
          type: "project"
        };
      case "completed":
        return {
          items: completedTasksData,
          pagination: dashboard.completedTasks?.pagination || {},
          loading: dashboard.completedTasks?.loading,
          type: "task"
        };
      case "upcoming":
        return {
          items: upcomingTasksData,
          pagination: dashboard.upcomingTasks?.pagination || {},
          type: "task"
        };
      case "in_progress":
        return {
          items: inProgressTasksData,
          pagination: dashboard.inProgressTasks?.pagination || {},
          loading: dashboard.inProgressTasks?.loading,
          type: "task"
        };
      case "overdue":
        return {
          items: overdueTasksData,
          pagination: dashboard.overdueTasks?.pagination || {},
          // loading: dashboard.overdueTasks?.loading,
          type: "task"
        };
      default:
        return {
          items: [],
          pagination: {},
          loading: false,
          type: "task"
        };
    }
  };

  const { items: currentOverviewItems, pagination: currentOverviewPagination, type: currentOverviewType, loading: currentOverviewLoading } = getOverviewData();

  const handleOpenTaskModal = (taskId) => {
    dispatch(getTaskByIdThunk(taskId));
    setIsModalOpen(true);
  };

  const handleOpenProjectModal = (projectId) => {
    setSelectedProjectId(projectId);
    dispatch(getProjectDetailsThunk(projectId));
    setIsProjectModalOpen(true);
  };

  const handleCloseProjectModal = () => {
    setIsProjectModalOpen(false);
    setSelectedProjectId(null);
  };

  const handleOpenOverview = (filterKey, title) => {
    setOverviewFilterKey(filterKey);
    setOverviewTitle(title);
    setIsOverviewOpen(true);
  };

  const handleCloseOverview = () => {
    setIsOverviewOpen(false);
    setOverviewFilterKey("all");
    setOverviewTitle("");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    dispatch(clearCurrentTask());
  };

  const handlePageChange = (newPage) => {
    if (overviewFilterKey === "projects") {
      dispatch(getProjectStatsThunk({ page: newPage, limit: 10 }));
    } else if (overviewFilterKey === "completed") {
      dispatch(getCompletedTasksThunk({ page: newPage, limit: 10 }));
    } else if (overviewFilterKey === "upcoming") {
      dispatch(getUpcomingTasksThunk({ page: newPage, limit: 10 }));
    } else if (overviewFilterKey === "in_progress") {
      dispatch(getInProgressTasksThunk({ page: newPage, limit: 10 }));
    } else if (overviewFilterKey === "overdue") {
      dispatch(getOverdueTasksThunk({ page: newPage, limit: 10 }));
    }
  };

  const hasInitialData = projectsData.length > 0 || inProgressTasksData.length > 0 || completedTasksData.length > 0 || upcomingTasksData.length > 0;
  if (authLoading || (dashboard.isLoading && !hasInitialData)) {
    return <AppLoader fullScreen message="Loading dashboard…" />;
  }

  // Calculate total tasks from metrics (not just displayed data)
  const totalTasksCount = (inProgressMetrics.inProgressCount || 0) + (completedMetrics.completedCount || 0) + (totalUpcomingTasks.upcomingTodoCount || 0);

  const stats = [
    {
      title: "Total Projects",
      value: totalProjectsCount,
      sub: `${activeProjectsCount} active`,
      icon: <FolderKanban className="w-5 h-5" />,
      accent: "from-violet-500/20 to-violet-500/5",
      iconBg: "bg-violet-500/15 text-violet-400",
      border: "hover:border-violet-500/30",
      filterKey: "projects",
    },
    {
      title: isAdmin ? "Total Tasks" : "In Progress",
      value: isAdmin ? totalTasksCount : inProgressMetrics.inProgressCount || inProgressTasksData.length,
      sub: isAdmin ? `${inProgressMetrics.inProgressCount || inProgressTasksData.length} in progress` : "tasks active",
      icon: <ClipboardList className="w-5 h-5" />,
      accent: "from-amber-500/20 to-amber-500/5",
      iconBg: "bg-amber-500/15 text-amber-400",
      border: "hover:border-amber-500/30",
      filterKey: "in_progress",
    },
    {
      title: "Completed",
      value: completedMetrics.completedCount || completedTasksData.length,
      sub: totalTasksCount > 0
        ? `${Math.round(((completedMetrics.completedCount || completedTasksData.length) / totalTasksCount) * 100)}% completion`
        : "No tasks yet",
      icon: <CheckCircle2 className="w-5 h-5" />,
      accent: "from-emerald-500/20 to-emerald-500/5",
      iconBg: "bg-emerald-500/15 text-emerald-400",
      border: "hover:border-emerald-500/30",
      filterKey: "completed",
    },
    {
      title: "Upcoming",
      value: totalUpcomingTasks.upcomingTodoCount,
      sub: `${overdueTasksData.length} tasks overdue`,
      icon: <Calendar className="w-5 h-5" />,
      accent: "from-blue-500/20 to-blue-500/5",
      iconBg: "bg-blue-500/15 text-blue-400",
      border: "hover:border-blue-500/30",
      filterKey: "upcoming",
    },
  ];







  return (
    <main className="min-h-screen p-5 md:p-8 space-y-6 bg-[var(--bg)] text-[var(--text)] overflow-x-hidden">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-[var(--border)]/60">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-15 h-15 rounded-xl bg-gradient-to-br from-[var(--primary)] to-violet-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-[var(--primary)]/20 rounded-xl">
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user?.name || "User avatar"}
                  className="h-full w-full object-cover rounded-xl"
                  height={200}
                  width={200}
                />
              ) : (
                user?.name?.slice(0, 2).toUpperCase() || "??"
              )}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[var(--bg)]" />
          </div>

          <div>
            <p className="text-xs font-semibold text-[var(--muted)]">
              {getGreeting()}
            </p>
            <h1 className="text-xl md:text-2xl font-black tracking-tight leading-tight">
              {user?.name || "Welcome back"}
            </h1>
          </div>
        </div>

        {/* Right: role badge */}
        {/* <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border uppercase tracking-wider ${roleColor}`}>
          <Sparkles size={11} />
          {user?.role || "Member"}
        </span> */}
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <StatCard key={i} {...s} onClick={() => {
            handleOpenOverview(s.filterKey || "all", s.title);
          }} />
        ))}
      </div>

      {/* ── CHARTS ROW ── */}
      <div className="space-y-4">
        <SectionLabel icon={<BarChart3 size={14} />} title="Analytics" />

        {isAdmin ? (
          <div className="space-y-4">
            {/* Full-width distribution chart */}
            <ProjectDistributionChart data={projectDistributionData} />

            {/* 2-column status charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* <ProjectStatusChart projectData={projectStatusData} totalProjects={totalProjectsCount} /> */}
              <TaskBreakdownChart
                chartData={taskStatusData}
                totalTasks={totalTasksCount}
                todoCount={totalUpcomingTasks.upcomingTodoCount || 0}
                inProgressCount={inProgressMetrics.inProgressCount || 0}
                completedCount={completedMetrics.completedCount || 0}
                fullSpan={false}
              />
              <DailyTaskProgressChart data={dailyTaskProgressData} loading={dailyTaskProgressLoading} />
            </div>

            {/* Full-width progress trend chart */}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Full-width task breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <TaskBreakdownChart
                chartData={taskStatusData}
                totalTasks={totalTasksCount}
                todoCount={totalUpcomingTasks.upcomingTodoCount || 0}
                inProgressCount={inProgressMetrics.inProgressCount || 0}
                completedCount={completedMetrics.completedCount || 0}
                fullSpan={true}
              />

              {/* Full-width progress trend chart */}
              <DailyTaskProgressChart data={dailyTaskProgressData} loading={dailyTaskProgressLoading} />
            </div>
          </div>
        )}
      </div>

      {/* ── LOWER CONTENT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Activity Section */}
        <div className="lg:col-span-2">
          <SectionLabel icon={<ListTodo size={14} />} title="Activity Timeline" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RecentlyActiveProjects
              projects={recentlyActiveProjectsData}
              loading={recentlyActiveProjectsLoading}
            />
            <RecentlyActiveTasks
              tasks={recentlyActiveTasksData}
              loading={recentlyActiveTasksLoading}
            />
          </div>
        </div>

        {/* Right: Deadlines */}
        <div>
          <SectionLabel icon={<Clock3 size={14} />} title="Critical Deadlines" />
          <CriticalDeadlinesRadar overdueTasks={pendingUrgentTasks} deadlineTasks={upcomingDeadlineTasks} onInspectTask={handleOpenTaskModal} />
        </div>
      </div>

      {/* ── TASK DETAIL MODAL ── */}

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          onClick={handleCloseModal}
        >
          <div
            className="relative w-full max-w-lg overflow-hidden border shadow-2xl rounded-3xl bg-[var(--card)] border-[var(--border)] flex flex-col max-h-[88vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 rounded-full bg-[var(--primary)]" />
                <span className="text-xs font-black uppercase tracking-widest text-[var(--muted)]">
                  Task Details
                </span>
                {currentTask?.id && (
                  <span className="text-[9px] font-bold text-[var(--muted)] bg-[var(--hover)] border border-[var(--border)] px-1.5 py-0.5 rounded-md">
                    #{currentTask.id}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 rounded-xl text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {taskLoading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3 text-[var(--muted)]">
                  <Loader2 className="animate-spin w-7 h-7 text-[var(--primary)]" />
                  <p className="text-xs font-bold uppercase tracking-wider">Loading task…</p>
                </div>
              ) : currentTask ? (
                <>
                  {/* Status + priority badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={currentTask.status} />
                    <PriorityBadge priority={currentTask.priority} />
                  </div>

                  {/* Title */}
                  <h2 className="text-lg font-black leading-snug">{currentTask.title}</h2>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Description</p>
                    <p className="text-xs font-medium text-[var(--text)] leading-relaxed bg-[var(--input)] border border-[var(--border)] p-3.5 rounded-2xl whitespace-pre-wrap">
                      {currentTask.description || "No description provided for this task."}
                    </p>
                  </div>

                  {/* Meta grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-[var(--hover)] border border-[var(--border)] space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] flex items-center gap-1">
                        <Layers size={10} /> Project
                      </p>
                      <p className="text-xs font-black truncate">
                        {currentTask.project?.name || "—"}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[var(--hover)] border border-[var(--border)] space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] flex items-center gap-1">
                        <Calendar size={10} /> Due Date
                      </p>
                      <p className="text-xs font-black">
                        {currentTask.due_date
                          ? new Date(currentTask.due_date).toLocaleDateString(undefined, { dateStyle: "medium" })
                          : "No deadline"}
                      </p>
                    </div>
                  </div>

                  {/* Assigned members */}
                  <div className="space-y-2.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">
                      Assigned Members
                    </p>
                    {!currentTask.assigned_users || currentTask.assigned_users.filter(Boolean).length === 0 ? (
                      <div className="flex items-center gap-2 p-3 rounded-2xl border border-dashed border-blue-500/20 bg-blue-500/5 text-blue-400">
                        <User size={13} />
                        <p className="text-xs font-bold">No members assigned yet</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                        {currentTask.assigned_users.filter(Boolean).map((member, idx) => {
                          const displayName = member.name || "Unknown User";
                          const key = member.id ?? `${displayName}-${idx}`;
                          const initials = displayName.substring(0, 2).toUpperCase();
                          return (
                            <div
                              key={key}
                              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[var(--input)] border border-[var(--border)] text-xs font-semibold"
                            >
                              <div className="w-7 h-7 rounded-lg bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center font-black text-[10px] shrink-0">
                                {initials}
                              </div>
                              <span className="truncate">{displayName}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-widest">
                    Failed to load task details.
                  </p>
                </div>
              )}
            </div>


            <div className="px-6 py-4 border-t border-[var(--border)] flex justify-end">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-5 py-2 text-xs font-black uppercase tracking-wider rounded-xl border border-[var(--border)] hover:bg-[var(--hover)] transition-all cursor-pointer active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── OVERVIEW LIST MODAL ── */}
      <OverviewModal
        open={isOverviewOpen}
        title={overviewTitle}
        items={currentOverviewItems}
        type={currentOverviewType}
        pagination={currentOverviewPagination}
        loading={currentOverviewLoading}
        onClose={handleCloseOverview}
        onInspect={(id, type) => {
          handleCloseOverview();
          if (type === "project") {
            handleOpenProjectModal(id);
          } else {
            handleOpenTaskModal(id);
          }
        }}
        onPageChange={handlePageChange}
      />

      {/* ── PROJECT DETAIL MODAL ── */}
      {isProjectModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          onClick={handleCloseProjectModal}
        >
          <div
            className="relative w-full max-w-lg overflow-hidden border shadow-2xl rounded-3xl bg-[var(--card)] border-[var(--border)] flex flex-col max-h-[88vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 rounded-full bg-[var(--primary)]" />
                <span className="text-xs font-black uppercase tracking-widest text-[var(--muted)]">
                  Project Details
                </span>
                {currentProject?.id && (
                  <span className="text-[9px] font-bold text-[var(--muted)] bg-[var(--hover)] border border-[var(--border)] px-1.5 py-0.5 rounded-md">
                    #{currentProject.id}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleCloseProjectModal}
                className="p-1.5 rounded-xl text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {projectLoading || currentProject?.id !== selectedProjectId ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3 text-[var(--muted)]">
                  <Loader2 className="animate-spin w-7 h-7 text-[var(--primary)]" />
                  <p className="text-xs font-bold uppercase tracking-wider">Loading project…</p>
                </div>
              ) : currentProject ? (
                <>
                  {/* Status badge */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border ${currentProject.status === "completed" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                      currentProject.status === "active" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                        "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
                      }`}>
                      {currentProject.status || "active"}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-lg font-black leading-snug">{currentProject.name}</h2>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Description</p>
                    <p className="text-xs font-medium text-[var(--text)] leading-relaxed bg-[var(--input)] border border-[var(--border)] p-3.5 rounded-2xl whitespace-pre-wrap">
                      {currentProject.description || "No description provided for this project."}
                    </p>
                  </div>

                  {/* Meta grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-[var(--hover)] border border-[var(--border)] space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] flex items-center gap-1">
                        <User size={10} /> Creator
                      </p>
                      <p className="text-xs font-black truncate">
                        {currentProject.creator_name || "—"}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[var(--hover)] border border-[var(--border)] space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] flex items-center gap-1">
                        <Calendar size={10} /> Created At
                      </p>
                      <p className="text-xs font-black">
                        {currentProject.created_at
                          ? new Date(currentProject.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })
                          : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Details stats */}
                  <div className="p-3.5 rounded-2xl bg-[var(--hover)] border border-[var(--border)] space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Project Metrics</p>
                    <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                      <div>Tasks Bound: <span className="text-[var(--primary)]">{currentProject.tasks_count || 0}</span></div>
                      <div>Your Role: <span className="text-emerald-500 uppercase">{currentProject.role || "Member"}</span></div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-widest">
                    Failed to load project details.
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[var(--border)] flex justify-end">
              <button
                type="button"
                onClick={handleCloseProjectModal}
                className="px-5 py-2 text-xs font-black uppercase tracking-wider rounded-xl border border-[var(--border)] hover:bg-[var(--hover)] transition-all cursor-pointer active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="p-1.5 rounded-md bg-[var(--primary)]/10 text-[var(--primary)]">
        {icon}
      </div>
      <h2 className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">{title}</h2>
    </div>
  );
}

function StatCard({ title, value, sub, icon, accent, iconBg, border, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative text-left w-full overflow-hidden rounded-2xl border p-5 md:p-6 bg-[var(--card)] border-[var(--border)] transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${border} focus:outline-none cursor-pointer`}
    >
      {/* Background gradient accent */}
      <div className={`absolute inset-0 bg-gradient-to-br ${accent} pointer-events-none`} />

      <div className="relative flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] truncate">
            {title}
          </p>
          <p className="text-2xl font-black tracking-tight leading-none">{value}</p>
          <p className="text-[10px] font-semibold text-[var(--muted)] flex items-center gap-1">
            <TrendingUp size={9} className="shrink-0" />
            <span className="truncate">{sub}</span>
          </p>
        </div>
        <div className={`p-2.5 rounded-lg ${iconBg} shrink-0`}>{icon}</div>
      </div>
    </button>
  );
}

function OverviewModal({ open, title, items, type, pagination, loading, onClose, onInspect, onPageChange }) {
  if (!open) return null;

  const { page = 1, totalPages = 1, total = 0, hasNextPage = false, hasPrevPage = false } = pagination || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md" onClick={onClose}>
      <div className="relative w-full max-w-3xl overflow-hidden border shadow-2xl rounded-3xl bg-[var(--card)] border-[var(--border)] max-h-[88vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black">{title}</h3>
            {total > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[var(--hover)] text-[var(--muted)]">
                Total: {total}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-[var(--muted)] hover:text-[var(--text)] p-2 rounded-lg text-xs font-bold uppercase transition-all">Close</button>
        </div>

        {/* Modal body */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 relative min-h-[240px]">
          {loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[var(--card)]/70 backdrop-blur-[2px] transition-all duration-200">
              <Loader2 className="animate-spin w-8 h-8 text-[var(--primary)] mb-2" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Fetching update…</span>
            </div>
          )}
          {(!items || items.length === 0) ? (
            <div className="py-16 text-center text-[var(--muted)]">No items to show.</div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {items.map((t) => {
                const isProj = type === "project";
                return (
                  <div key={t.id || t._id} className="p-3.5 rounded-xl border bg-[var(--input)] border-[var(--border)] flex items-center justify-between gap-4 hover:bg-[var(--hover)] transition-all">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold truncate text-sm">{isProj ? t.name : t.title}</p>
                      {isProj ? (
                        <p className="text-[11px] text-[var(--muted)] truncate mt-0.5">
                          {t.description || "No project overview description logged."}
                        </p>
                      ) : (
                        <p className="text-[11px] text-[var(--muted)] mt-0.5">
                          {t.project?.name || "—"} • status: <span className="lowercase">{t?.status || "todo"}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {isProj ? (
                        <span className={`px-1.5 py-0.5 rounded text-[9px] border font-black uppercase tracking-wider ${t.status === "completed" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                          t.status === "active" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-neutral-500/10 text-[var(--muted)]"
                          }`}>{t.status || "active"}</span>
                      ) : (
                        <p className="text-[10px] font-bold text-[var(--muted)] bg-[var(--hover)] border border-[var(--border)] px-1.5 py-0.5 rounded-md">
                          {t.due_date ? new Date(t.due_date).toLocaleDateString() : "No due"}
                        </p>
                      )}
                      <button
                        onClick={() => onInspect(t.id || t._id, type)}
                        className="px-3 py-1 rounded-lg bg-[var(--primary)] text-white text-xs font-bold cursor-pointer transition-all active:scale-95 hover:brightness-110"
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal footer (Pagination Controls) */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[var(--border)] flex items-center justify-between shrink-0 bg-[var(--card)]">
            <span className="text-xs text-[var(--muted)] font-semibold">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={!hasPrevPage}
                onClick={() => onPageChange(page - 1)}
                className="px-3 py-1.5 text-xs font-bold rounded-xl border border-[var(--border)] hover:bg-[var(--hover)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled={!hasNextPage}
                onClick={() => onPageChange(page + 1)}
                className="px-3 py-1.5 text-xs font-bold rounded-xl border border-[var(--border)] hover:bg-[var(--hover)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = {
    completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    in_progress: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    todo: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  };
  const label = status?.replace("_", " ") || "To Do";
  return (
    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider border ${cfg[status] || cfg.todo}`}>
      {label}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const cfg = {
    high: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    low: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  };
  return (
    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider border ${cfg[priority] || cfg.medium}`}>
      {priority || "medium"}
    </span>
  );
}
