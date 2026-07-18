import React, { useState, useEffect } from 'react';
import gsap from 'gsap';

export default function FeatureShowcase() {
  const [activeTab, setActiveTab] = useState('all');
  const [dashboardSpotlight, setDashboardSpotlight] = useState(0);
  
  // Interactive Simulator States
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedLog, setSimulatedLog] = useState({
    event: "SOCKET_IO_CONNECT",
    tenant: "department_scoped_pool",
    table: "project",
    status: "SYNC_COMPLETE",
    latency: "3.8ms",
    timestamp: new Date().toLocaleTimeString()
  });

  // Ensure new/filtered cards always animate cleanly to 100% visibility on tab change
  useEffect(() => {
    const cards = document.querySelectorAll('#showcase .gsap-scroll-card');
    if (cards.length > 0) {
      gsap.fromTo(cards,
        { opacity: 0, y: 25, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: "power3.out", overwrite: "auto" }
      );
    }
  }, [activeTab]);

  const categories = [
    { id: 'all', label: 'Full Platform Suite', icon: 'fa-layer-group', count: '6 Modules' },
    { id: 'analytics', label: 'Dual-View Dashboard', icon: 'fa-table-columns', count: 'Projects' },
    { id: 'workflow', label: 'Department Scoping & Tasks', icon: 'fa-kanban', count: 'Workflows' },
    { id: 'team', label: 'HR Attendance & MFA', icon: 'fa-user-shield', count: 'Security & HR' },
  ];

  const dashboardFeatures = [
    {
      title: "Dual-View Grid & Table Dashboard",
      desc: "Switch effortlessly between sleek Grid Card View and density-optimized Table View. Features live department badges, RLS visibility rules, and instant status indicators.",
      metric: "Grid + Table Sync",
      icon: "fa-table-cells-large",
      color: "brand",
      apiQuery: "SELECT * FROM project WHERE department_id = req.user.departmentId AND is_active = 1",
      socketEvent: "project:list_updated { departmentId: 4, action: 'REFRESH' }"
    },
    {
      title: "Granular Task Lifecycle Governance",
      desc: "Tasks support explicit priority levels (`Low`, `Medium`, `High`, `Urgent`), workflow statuses (`To Do`, `In Progress`, `Review`, `Completed`), and due dates via raw parameterized MySQL 8 queries.",
      metric: "100% RLS Scoped",
      icon: "fa-list-check",
      color: "green",
      apiQuery: "UPDATE tasks SET status = 'in_progress' WHERE id = ? AND department_id = ?",
      socketEvent: "task:status_changed { taskId: 1042, newStatus: 'in_progress' }"
    },
    {
      title: "Real-Time Socket.IO Collaboration",
      desc: "Powered by Socket.IO 4 for instantaneous task updates, assignment notifications, and live room broadcasting without requiring browser page reloads.",
      metric: "Zero Latency",
      icon: "fa-tower-broadcast",
      color: "blue",
      apiQuery: "SELECT u.id, u.name, u.role FROM users u JOIN department d ON u.department_id = d.id",
      socketEvent: "socket:room_broadcast { room: 'project_88', event: 'MEMBER_ASSIGNED' }"
    }
  ];

  const triggerLiveSimulation = (idx) => {
    setDashboardSpotlight(idx);
    setIsSimulating(true);
    const feat = dashboardFeatures[idx];
    setSimulatedLog({
      event: feat.socketEvent.split(' ')[0],
      tenant: "department_scoped_pool",
      table: idx === 0 ? "project" : "tasks",
      status: "LIVE_BROADCAST",
      latency: Math.floor(Math.random() * 5 + 2) + ".2ms",
      timestamp: new Date().toLocaleTimeString()
    });

    setTimeout(() => {
      setIsSimulating(false);
    }, 1400);
  };

  return (
    <section className="py-28 px-6 max-w-7xl mx-auto border-t border-light-border dark:border-dark-border relative overflow-hidden" id="showcase">
      
      {/* Background ambient multi-color spotlights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-brand-500/10 dark:bg-brand-500/15 blur-[160px] rounded-full pointer-events-none -z-10 animate-pulse-soft"></div>
      <div className="absolute bottom-1/3 right-5 w-[500px] h-[400px] bg-blue-500/10 dark:bg-blue-500/15 blur-[150px] rounded-full pointer-events-none -z-10"></div>

      {/* Header with GSAP Scroll Class */}
      <div className="max-w-4xl mx-auto text-center mb-16 gsap-scroll-header">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/15 text-brand-500 font-mono text-xs font-bold mb-4 shadow-sm border border-brand-500/20">
          <i className="fa-solid fa-bolt animate-bounce"></i> Next.js 16 App Router &amp; Express 5 Live API Inspector
        </div>
        <h2 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-slate-900 dark:text-white tracking-tight mb-5 leading-tight">
          See TaskFlow's Exact Architecture in Action
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
          Every screenshot below is paired with live feature explanations from our project documentation, Socket.IO telemetry logs, and the exact MySQL 8 queries executing inside your department-scoped connection pool.
        </p>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8 p-1.5 bg-slate-100 dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl max-w-2xl mx-auto shadow-inner">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === cat.id
                  ? 'bg-brand-500 text-white shadow-orange-glow scale-105 ring-2 ring-brand-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <i className={`fa-solid ${cat.icon}`}></i>
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${activeTab === cat.id ? 'bg-black/20 text-white' : 'bg-slate-200 dark:bg-dark-bg text-slate-500'}`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* GSAP Scroll Grid Container */}
      <div className="gsap-scroll-grid space-y-16">
        
        {/* ==================== ROW 1: MASTER DASHBOARD + INTERACTIVE SIMULATOR ==================== */}
        {(activeTab === 'all' || activeTab === 'analytics') && (
          <div className="gsap-scroll-card rounded-[32px] overflow-hidden border-2 border-brand-500/40 dark:border-brand-500/50 bg-white dark:bg-dark-card shadow-2xl group hover:border-brand-500 transition-all duration-500 relative">
            
            {/* Top Bar macOS with Live Simulator Button */}
            <div className="bg-slate-100 dark:bg-[#11151f] px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-light-border dark:border-dark-border">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-red-400/90 hover:bg-red-500 transition-colors cursor-pointer"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-amber-400/90 hover:bg-amber-500 transition-colors cursor-pointer"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-green-400/90 hover:bg-green-500 transition-colors cursor-pointer"></span>
                <span className="ml-2 text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
                  Dual-View Project Dashboard (`/v1/project?departmentId=engineering`)
                </span>
              </div>

              {/* Live WebSocket Telemetry Console Pill */}
              <div className="flex items-center gap-3 bg-white dark:bg-[#181d29] px-4 py-1.5 rounded-full border border-light-border dark:border-dark-border text-xs font-mono text-slate-600 dark:text-slate-300 shadow-sm">
                <span className={`w-2.5 h-2.5 rounded-full ${isSimulating ? 'bg-brand-500 animate-ping' : 'bg-accent-green animate-pulse'}`}></span>
                <span className="text-[11px]">
                  <strong className="text-brand-500">Socket.IO:</strong> {simulatedLog.event} (`{simulatedLog.latency}`)
                </span>
              </div>

              <button 
                onClick={() => triggerLiveSimulation((dashboardSpotlight + 1) % 3)}
                className="px-4 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-orange-glow transition-all flex items-center gap-2 cursor-pointer scale-100 active:scale-95"
              >
                <i className={`fa-solid fa-rotate ${isSimulating ? 'animate-spin' : ''}`}></i>
                <span>Simulate Socket.IO Stream</span>
              </button>
            </div>

            {/* Split Content: Left Screenshot + Right Feature Breakdown & Query Inspector */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              
              {/* Left Column: Big Interactive Screenshot */}
              <div className="lg:col-span-7 relative overflow-hidden bg-slate-50 dark:bg-dark-bg border-b lg:border-b-0 lg:border-r border-light-border dark:border-dark-border flex flex-col justify-between">
                <div className="relative overflow-hidden flex-1">
                  <img src="/assets/light_dashboard.png" alt="Dashboard Light" className="block dark:hidden w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.015] min-h-[460px]" />
                  <img src="/assets/dark_dashboard.png" alt="Dashboard Dark" className="hidden dark:block w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.015] min-h-[460px]" />
                  
                  {/* Floating Telemetry Badge Overlay */}
                  <div className={`absolute bottom-5 left-5 right-5 sm:right-auto bg-white/95 dark:bg-[#151924]/95 backdrop-blur-md border border-light-border dark:border-dark-border p-4 rounded-2xl shadow-2xl flex items-center gap-4 z-10 transition-all duration-300 ${isSimulating ? 'scale-105 ring-2 ring-brand-500' : ''}`}>
                    <div className="w-11 h-11 rounded-2xl bg-brand-500/15 text-brand-500 flex items-center justify-center text-xl font-extrabold flex-shrink-0 shadow-sm">
                      <i className={`fa-solid ${dashboardFeatures[dashboardSpotlight].icon}`}></i>
                    </div>
                    <div className="text-left font-sans">
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{dashboardFeatures[dashboardSpotlight].title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-brand-500/15 text-brand-500 font-mono font-bold">RLS Scoped</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 leading-tight mt-1">
                        Socket Event: <code className="text-accent-green">{dashboardFeatures[dashboardSpotlight].socketEvent}</code>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Query Code Bar */}
                <div className="bg-[#0f131d] px-5 py-3 text-[11px] font-mono text-slate-300 flex items-center justify-between border-t border-light-border dark:border-dark-border">
                  <div className="flex items-center gap-2 overflow-hidden truncate">
                    <span className="text-brand-500 font-bold">Raw MySQL 8:</span>
                    <span className="text-slate-400 truncate">{dashboardFeatures[dashboardSpotlight].apiQuery}</span>
                  </div>
                  <span className="text-accent-green flex-shrink-0 font-bold ml-2">⚡ Parameterized</span>
                </div>
              </div>

              {/* Right Column: Detailed Feature Explanations */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-white dark:bg-dark-card">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-dark-bg text-slate-700 dark:text-slate-300 font-mono text-[11px] font-bold mb-5 border border-light-border dark:border-dark-border">
                    <i className="fa-solid fa-microchip text-brand-500"></i> Project &amp; Task Lifecycle Engine
                  </div>
                  <h3 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white mb-3">
                    Dual-View Project Dashboard
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                    Our Next.js 16 App Router frontend connects directly to Express 5 REST endpoints (`/v1/project`) with Row-Level Security (RLS). Users only view projects and tasks within their authorized department boundary.
                  </p>

                  {/* Interactive Feature Accordions / Spots */}
                  <div className="space-y-3">
                    {dashboardFeatures.map((feat, idx) => {
                      const isActive = dashboardSpotlight === idx;
                      return (
                        <div
                          key={idx}
                          onClick={() => triggerLiveSimulation(idx)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                            isActive
                              ? 'border-brand-500 bg-brand-500/5 shadow-md scale-[1.01] ring-1 ring-brand-500/20'
                              : 'border-light-border dark:border-dark-border hover:border-slate-400 bg-slate-50/50 dark:bg-dark-bg/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2.5 font-display font-bold text-sm text-slate-900 dark:text-white">
                              <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs transition-transform ${isActive ? 'bg-brand-500 text-white scale-110 shadow-orange-glow' : 'bg-slate-200 dark:bg-dark-card text-slate-500'}`}>
                                <i className={`fa-solid ${feat.icon}`}></i>
                              </span>
                              <span>{feat.title}</span>
                            </div>
                            <span className={`text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-lg ${isActive ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-400 bg-slate-100 dark:bg-dark-bg'}`}>
                              {feat.metric}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pl-9">
                            {feat.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Highlight */}
                <div className="mt-8 pt-4 border-t border-light-border dark:border-dark-border flex items-center justify-between text-xs font-bold text-brand-500">
                  <span className="flex items-center gap-1.5"><i className="fa-solid fa-circle-check text-accent-green"></i> Redux Toolkit State (`projectSlice`)</span>
                  <a href="#pricing" className="hover:underline flex items-center gap-1">
                    <span>Deploy Dashboard Pool</span> <i className="fa-solid fa-arrow-right"></i>
                  </a>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== ROW 2: TWO-COLUMN DEEP DIVES (KANBAN & ATTENDANCE) ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Kanban Board + Feature Explanation */}
          {(activeTab === 'all' || activeTab === 'workflow') && (
            <div className="gsap-scroll-card rounded-3xl overflow-hidden border border-light-border dark:border-dark-border bg-white dark:bg-dark-card shadow-soft dark:shadow-soft-dark group hover:border-brand-500 transition-all duration-300 flex flex-col justify-between">
              <div>
                {/* macOS Bar */}
                <div className="bg-slate-100/90 dark:bg-[#121620] px-5 py-3.5 flex items-center justify-between border-b border-light-border dark:border-dark-border">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-400"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                    <span className="w-3 h-3 rounded-full bg-green-400"></span>
                    <span className="ml-1 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">Kanban Task Board (`/v1/task`)</span>
                  </div>
                  <span className="text-[10px] bg-brand-500/15 text-brand-500 font-bold px-3 py-1 rounded-full border border-brand-500/20">
                    ⚡ Socket.IO 4 Sync
                  </span>
                </div>

                {/* Image */}
                <div className="relative bg-slate-50 dark:bg-dark-bg overflow-hidden border-b border-light-border dark:border-dark-border max-h-[360px]">
                  <img src="/assets/light_task_board.png" alt="Task Board Light" className="block dark:hidden w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                  <img src="/assets/dark_task_board.png" alt="Task Board Dark" className="hidden dark:block w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                </div>

                {/* Detailed Feature Explanation Below Image */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-brand-500 uppercase tracking-wider">Workflow &amp; Scoping Engine</span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="text-xs text-slate-500 font-semibold">Department-Scoped Boards</span>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-100 dark:bg-dark-bg text-slate-500 px-2 py-0.5 rounded border border-light-border dark:border-dark-border">
                      `PATCH /v1/task/update/{11}/status`
                    </span>
                  </div>
                  <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white mb-2 group-hover:text-brand-500 transition-colors">
                    Interactive Kanban Task Lifecycle
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
                    Drag and drop tickets across custom statuses (`To Do`, `In Progress`, `Review`, `Completed`) with priorities (`Low` to `Urgent`). Features our <strong>Add Member Drawer</strong> with instant client-side memory search and department filtering.
                  </p>

                  {/* Key Feature Bullets */}
                  <div className="grid grid-cols-2 gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-dark-bg p-4 rounded-2xl border border-light-border dark:border-dark-border">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-check text-brand-500"></i>
                      <span>4 Priority Tiers (`Urgent`)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-check text-brand-500"></i>
                      <span>Add Member Memory Search</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-check text-brand-500"></i>
                      <span>Department Scoping Toggle</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-check text-brand-500"></i>
                      <span>Socket.IO Live Room Broadcast</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 dark:bg-[#121620]/60 border-t border-light-border dark:border-dark-border flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                <span className="font-mono text-[11px] text-slate-400">Middleware: `taskAccessMiddleware`</span>
                <span className="text-brand-500 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                  <span>Inspect Workflow Rules</span> <i className="fa-solid fa-arrow-right"></i>
                </span>
              </div>
            </div>
          )}

          {/* Attendance Tracker + Feature Explanation */}
          {(activeTab === 'all' || activeTab === 'team') && (
            <div className="gsap-scroll-card rounded-3xl overflow-hidden border border-light-border dark:border-dark-border bg-white dark:bg-dark-card shadow-soft dark:shadow-soft-dark group hover:border-accent-green transition-all duration-300 flex flex-col justify-between">
              <div>
                {/* macOS Bar */}
                <div className="bg-slate-100/90 dark:bg-[#121620] px-5 py-3.5 flex items-center justify-between border-b border-light-border dark:border-dark-border">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-400"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                    <span className="w-3 h-3 rounded-full bg-green-400"></span>
                    <span className="ml-1 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">HR Attendance &amp; Leave Ledger</span>
                  </div>
                  <span className="text-[10px] bg-green-500/15 text-accent-green font-bold px-3 py-1 rounded-full border border-green-500/20">
                    🛰️ Office &bull; Remote &bull; Hybrid
                  </span>
                </div>

                {/* Image */}
                <div className="relative bg-slate-50 dark:bg-dark-bg overflow-hidden border-b border-light-border dark:border-dark-border max-h-[360px]">
                  <img src="/assets/light_attendence.png" alt="Attendance Light" className="block dark:hidden w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                  <img src="/assets/dark_attendence.png" alt="Attendance Dark" className="hidden dark:block w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                </div>

                {/* Detailed Feature Explanation Below Image */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-accent-green uppercase tracking-wider">HR &amp; Leave Quota Engine</span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="text-xs text-slate-500 font-semibold">Automated Check-In / Out</span>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-100 dark:bg-dark-bg text-slate-500 px-2 py-0.5 rounded border border-light-border dark:border-dark-border">
                      `POST /v1/attendance/check-in`
                    </span>
                  </div>
                  <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white mb-2 group-hover:text-accent-green transition-colors">
                    HR Attendance &amp; Leave Management
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
                    One-click employee check-in/check-out with explicit work location tagging (`Office`, `Remote`, `Hybrid`) and break duration logging. Configurable leave quotas (`Annual`, `Sick`, `Casual`, `Maternity/Paternity`).
                  </p>

                  {/* Key Feature Bullets */}
                  <div className="grid grid-cols-2 gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-dark-bg p-4 rounded-2xl border border-light-border dark:border-dark-border">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-check text-accent-green"></i>
                      <span>Location Tagging (`Office/Hybrid`)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-check text-accent-green"></i>
                      <span>4 Leave Quota Types (`Sick/PTO`)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-check text-accent-green"></i>
                      <span>Hierarchical Leave Approval</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-check text-accent-green"></i>
                      <span>Salary Deduction &amp; HR Logs</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 dark:bg-[#121620]/60 border-t border-light-border dark:border-dark-border flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                <span className="font-mono text-[11px] text-slate-400">Endpoint: `/v1/leaves/apply`</span>
                <span className="text-accent-green flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                  <span>Explore HR Suite</span> <i className="fa-solid fa-arrow-right"></i>
                </span>
              </div>
            </div>
          )}

        </div>

        {/* ==================== ROW 3: THREE-COLUMN MASTER SUITE EXPLANATIONS ==================== */}
        {(activeTab === 'all' || activeTab === 'workflow' || activeTab === 'team') && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            
            {/* 1. All Tasks Master List */}
            {(activeTab === 'all' || activeTab === 'workflow') && (
              <div className="gsap-scroll-card rounded-3xl overflow-hidden border border-light-border dark:border-dark-border bg-white dark:bg-dark-card shadow-soft dark:shadow-soft-dark group hover:border-blue-500 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="bg-slate-100/90 dark:bg-[#121620] px-4 py-3 flex items-center justify-between border-b border-light-border dark:border-dark-border">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                      <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 ml-1">Master Tasks Pool</span>
                    </div>
                    <span className="text-[10px] bg-blue-500/15 text-blue-500 font-bold px-2.5 py-0.5 rounded">RLS Scoped</span>
                  </div>
                  <div className="relative bg-slate-50 dark:bg-dark-bg overflow-hidden border-b border-light-border dark:border-dark-border max-h-[250px]">
                    <img src="/assets/light_all_task.png" alt="All Tasks Light" className="block dark:hidden w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                    <img src="/assets/dark_all_task.png" alt="All Tasks Dark" className="hidden dark:block w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-6">
                    <div className="text-[10px] font-mono font-bold text-blue-500 uppercase tracking-wider mb-1.5">Global Command Search</div>
                    <h4 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2.5 group-hover:text-blue-500 transition-colors">
                      Unified Task &amp; Project Search
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                      Fast, unified global search across projects, tasks, and employee directories. Filter by priority (`Urgent`), department, assignee, or deadline with instant client-side Redux store caching.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-light-border dark:border-dark-border">
                      <span className="text-[10px] bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-slate-300 px-2 py-1 rounded border border-light-border dark:border-dark-border">Global Search Bar</span>
                      <span className="text-[10px] bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-slate-300 px-2 py-1 rounded border border-light-border dark:border-dark-border">Redux Toolkit (`taskSlice`)</span>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-3.5 bg-slate-50 dark:bg-[#121620]/60 border-t border-light-border dark:border-dark-border flex items-center justify-between text-[11px] font-bold text-blue-500">
                  <span>Explore Tasks Engine</span>
                  <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                </div>
              </div>
            )}

            {/* 2. Projects Workspace */}
            {(activeTab === 'all' || activeTab === 'workflow') && (
              <div className="gsap-scroll-card rounded-3xl overflow-hidden border border-light-border dark:border-dark-border bg-white dark:bg-dark-card shadow-soft dark:shadow-soft-dark group hover:border-purple-500 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="bg-slate-100/90 dark:bg-[#121620] px-4 py-3 flex items-center justify-between border-b border-light-border dark:border-dark-border">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                      <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 ml-1">Department Scoping</span>
                    </div>
                    <span className="text-[10px] bg-purple-500/15 text-purple-500 font-bold px-2.5 py-0.5 rounded">`/v1/project`</span>
                  </div>
                  <div className="relative bg-slate-50 dark:bg-dark-bg overflow-hidden border-b border-light-border dark:border-dark-border max-h-[250px]">
                    <img src="/assets/dark_all_projects.png" alt="All Projects" className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-6">
                    <div className="text-[10px] font-mono font-bold text-purple-500 uppercase tracking-wider mb-1.5">Departmental Boundaries</div>
                    <h4 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2.5 group-hover:text-purple-500 transition-colors">
                      Department &amp; Team Scoping
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                      Assign projects to specific departments (`Engineering`, `Marketing`, `Project Management`). Create specialized sub-teams with dedicated Team Leads and assign entire squads in a single click.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-light-border dark:border-dark-border">
                      <span className="text-[10px] bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-slate-300 px-2 py-1 rounded border border-light-border dark:border-dark-border">Add Member Drawer</span>
                      <span className="text-[10px] bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-slate-300 px-2 py-1 rounded border border-light-border dark:border-dark-border">Team Leads Hierarchy</span>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-3.5 bg-slate-50 dark:bg-[#121620]/60 border-t border-light-border dark:border-dark-border flex items-center justify-between text-[11px] font-bold text-purple-500">
                  <span>Explore Department Scopes</span>
                  <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                </div>
              </div>
            )}

            {/* 3. Team Directory & Roles */}
            {(activeTab === 'all' || activeTab === 'team') && (
              <div className="gsap-scroll-card rounded-3xl overflow-hidden border border-light-border dark:border-dark-border bg-white dark:bg-dark-card shadow-soft dark:shadow-soft-dark group hover:border-amber-500 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="bg-slate-100/90 dark:bg-[#121620] px-4 py-3 flex items-center justify-between border-b border-light-border dark:border-dark-border">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                      <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 ml-1">RBAC &amp; MFA MFA</span>
                    </div>
                    <span className="text-[10px] bg-amber-500/15 text-amber-500 font-bold px-2.5 py-0.5 rounded">Microsoft Auth</span>
                  </div>
                  <div className="relative bg-slate-50 dark:bg-dark-bg overflow-hidden border-b border-light-border dark:border-dark-border max-h-[250px]">
                    <img src="/assets/light_employees.png" alt="Employees Light" className="block dark:hidden w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                    <img src="/assets/dark_all_user.png" alt="Users Dark" className="hidden dark:block w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-6">
                    <div className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-wider mb-1.5">Microsoft Authenticator &bull; 10 Roles</div>
                    <h4 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2.5 group-hover:text-amber-500 transition-colors">
                      MFA &amp; 10-Tier RBAC Hierarchy
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                      Seamless QR code setup using standard RFC 6238 TOTP. Two-step verification tokens (`requires2FA: true`). Strict 10-tier governance (`Super Admin`, `Admin`, `HR`, `Department Head`, `Team Lead`... `Intern`).
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-light-border dark:border-dark-border">
                      <span className="text-[10px] bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-slate-300 px-2 py-1 rounded border border-light-border dark:border-dark-border">QR Code Scan (No Typing)</span>
                      <span className="text-[10px] bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-slate-300 px-2 py-1 rounded border border-light-border dark:border-dark-border">10 Hierarchical Roles</span>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-3.5 bg-slate-50 dark:bg-[#121620]/60 border-t border-light-border dark:border-dark-border flex items-center justify-between text-[11px] font-bold text-amber-500">
                  <span>Inspect Security Specs</span>
                  <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </section>
  );
}
