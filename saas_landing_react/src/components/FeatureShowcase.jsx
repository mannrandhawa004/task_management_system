import React, { useState, useEffect } from 'react';
import gsap from 'gsap';

export default function FeatureShowcase() {
  const [activeTab, setActiveTab] = useState('all');
  const [dashboardSpotlight, setDashboardSpotlight] = useState(0);
  
  // Interactive Simulator States
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedLog, setSimulatedLog] = useState({
    event: "SOCKET_IO_CONNECT",
    tenant: "tenant_acmecorp",
    table: "tasks",
    status: "SYNC_COMPLETE",
    latency: "4.2ms",
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
    { id: 'all', label: 'Full Platform Suite', icon: 'fa-layer-group', count: '6 Previews' },
    { id: 'analytics', label: 'Executive Analytics', icon: 'fa-chart-pie', count: 'Dashboards' },
    { id: 'workflow', label: 'Kanban & Tasks', icon: 'fa-kanban', count: 'Workflows' },
    { id: 'team', label: 'HR & Attendance', icon: 'fa-users-viewfinder', count: 'Team & Security' },
  ];

  const dashboardFeatures = [
    {
      title: "Real-Time Project Velocity",
      desc: "Track sprint burn-down rates and completion velocity in real time. Aggregates data across all 21 tenant tables (`tenant_acmecorp`) to forecast delivery accuracy within ±3%.",
      metric: "+34% Delivery Speed",
      icon: "fa-gauge-high",
      color: "brand",
      apiQuery: "SELECT AVG(velocity) FROM tenant_acmecorp.sprints WHERE status = 'ACTIVE'",
      socketEvent: "sprint:velocity_updated { delta: '+34%' }"
    },
    {
      title: "Critical Deadlines Radar",
      desc: "AI-powered risk detection highlights overdue tasks, bottlenecked dependencies, and team member overload before milestones are impacted.",
      metric: "Zero Missed SLAs",
      icon: "fa-bullseye",
      color: "green",
      apiQuery: "SELECT * FROM tenant_acmecorp.tasks WHERE due_date <= NOW() AND status != 'DONE'",
      socketEvent: "radar:risk_alert { priority: 'HIGH', count: 0 }"
    },
    {
      title: "Daily Task Progress Gauge",
      desc: "Live visual breakdown of In-Progress vs. Completed vs. Upcoming tasks across every departmental sub-squad (`Engineering`, `Design`, `HR`).",
      metric: "Instant Telemetry",
      icon: "fa-chart-column",
      color: "blue",
      apiQuery: "SELECT status, COUNT(*) FROM tenant_acmecorp.tasks GROUP BY status",
      socketEvent: "task:status_summary { in_progress: 42, completed: 189 }"
    }
  ];

  const triggerLiveSimulation = (idx) => {
    setDashboardSpotlight(idx);
    setIsSimulating(true);
    const feat = dashboardFeatures[idx];
    setSimulatedLog({
      event: feat.socketEvent.split(' ')[0],
      tenant: "tenant_acmecorp",
      table: idx === 0 ? "sprints" : "tasks",
      status: "LIVE_BROADCAST",
      latency: Math.floor(Math.random() * 6 + 2) + ".1ms",
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
          <i className="fa-solid fa-bolt animate-bounce"></i> Interactive Product Telemetry &amp; Live API Inspector
        </div>
        <h2 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-slate-900 dark:text-white tracking-tight mb-5 leading-tight">
          See Exactly How TaskFlow Works
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
          We don’t just show static screenshots. Every preview below is paired with live feature explanations, WebSocket telemetry logs, and the exact MySQL queries running inside your isolated tenant pool (`tenant_slug`).
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
                  Master Analytics (`tenant_acmecorp`)
                </span>
              </div>

              {/* Live WebSocket Telemetry Console Pill */}
              <div className="flex items-center gap-3 bg-white dark:bg-[#181d29] px-4 py-1.5 rounded-full border border-light-border dark:border-dark-border text-xs font-mono text-slate-600 dark:text-slate-300 shadow-sm">
                <span className={`w-2.5 h-2.5 rounded-full ${isSimulating ? 'bg-brand-500 animate-ping' : 'bg-accent-green animate-pulse'}`}></span>
                <span className="text-[11px]">
                  <strong className="text-brand-500">WS Log:</strong> {simulatedLog.event} (`{simulatedLog.latency}`)
                </span>
              </div>

              <button 
                onClick={() => triggerLiveSimulation((dashboardSpotlight + 1) % 3)}
                className="px-4 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-orange-glow transition-all flex items-center gap-2 cursor-pointer scale-100 active:scale-95"
              >
                <i className={`fa-solid fa-rotate ${isSimulating ? 'animate-spin' : ''}`}></i>
                <span>Simulate Live Telemetry</span>
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
                        <span className="text-[10px] px-2 py-0.5 rounded bg-brand-500/15 text-brand-500 font-mono font-bold">Live Stream</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 leading-tight mt-1">
                        Socket.IO: <code className="text-accent-green">{dashboardFeatures[dashboardSpotlight].socketEvent}</code>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Query Code Bar */}
                <div className="bg-[#0f131d] px-5 py-3 text-[11px] font-mono text-slate-300 flex items-center justify-between border-t border-light-border dark:border-dark-border">
                  <div className="flex items-center gap-2 overflow-hidden truncate">
                    <span className="text-brand-500 font-bold">MySQL Query:</span>
                    <span className="text-slate-400 truncate">{dashboardFeatures[dashboardSpotlight].apiQuery}</span>
                  </div>
                  <span className="text-accent-green flex-shrink-0 font-bold ml-2">⚡ 3.4ms</span>
                </div>
              </div>

              {/* Right Column: Detailed Feature Explanations */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-white dark:bg-dark-card">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-dark-bg text-slate-700 dark:text-slate-300 font-mono text-[11px] font-bold mb-5 border border-light-border dark:border-dark-border">
                    <i className="fa-solid fa-layer-group text-brand-500"></i> Click Any Feature Below To Inspect
                  </div>
                  <h3 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white mb-3">
                    Executive Analytics Suite
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                    Our master dashboard aggregates real-time metrics across all 21 isolated tenant tables (`users`, `projects`, `tasks`, `attendance`) to give leadership instant answers without database latency.
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
                  <span className="flex items-center gap-1.5"><i className="fa-solid fa-circle-check text-accent-green"></i> 100% Isolated tenant data</span>
                  <a href="#pricing" className="hover:underline flex items-center gap-1">
                    <span>Deploy Analytics Pool</span> <i className="fa-solid fa-arrow-right"></i>
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
                    <span className="ml-1 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">Kanban Board &amp; Sprint Management</span>
                  </div>
                  <span className="text-[10px] bg-brand-500/15 text-brand-500 font-bold px-3 py-1 rounded-full border border-brand-500/20">
                    ⚡ Socket.IO Sync
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
                      <span className="text-xs font-mono font-bold text-brand-500 uppercase tracking-wider">Workflow Engine</span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="text-xs text-slate-500 font-semibold">Zero-Latency Drag &amp; Drop</span>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-100 dark:bg-dark-bg text-slate-500 px-2 py-0.5 rounded border border-light-border dark:border-dark-border">
                      `/v1/tasks/kanban`
                    </span>
                  </div>
                  <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white mb-2 group-hover:text-brand-500 transition-colors">
                    Real-Time Kanban Task Boards
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
                    Empower your developers to drag and drop sprint tickets (`To Do`, `In Progress`, `Code Review`, `Completed`) with zero latency. Every card movement broadcasts instantly to all connected teammates via Socket.IO WebSockets.
                  </p>

                  {/* Key Feature Bullets */}
                  <div className="grid grid-cols-2 gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-dark-bg p-4 rounded-2xl border border-light-border dark:border-dark-border">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-check text-brand-500"></i>
                      <span>Automated Assignee Routing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-check text-brand-500"></i>
                      <span>Priority &amp; Due Date Tags</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-check text-brand-500"></i>
                      <span>Sub-task Dependency Linking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-check text-brand-500"></i>
                      <span>GitHub Commit Auto-Attach</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 dark:bg-[#121620]/60 border-t border-light-border dark:border-dark-border flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                <span className="font-mono text-[11px] text-slate-400">Query: `SELECT * FROM tenant_slug.tasks`</span>
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
                    <span className="ml-1 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">HR Attendance &amp; Leave Calendar</span>
                  </div>
                  <span className="text-[10px] bg-green-500/15 text-accent-green font-bold px-3 py-1 rounded-full border border-green-500/20">
                    🛰️ GPS &amp; IP Validated
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
                      <span className="text-xs font-mono font-bold text-accent-green uppercase tracking-wider">Security &amp; HR Engine</span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="text-xs text-slate-500 font-semibold">Automated Check-In / Out</span>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-100 dark:bg-dark-bg text-slate-500 px-2 py-0.5 rounded border border-light-border dark:border-dark-border">
                      `/v1/attendance/check-in`
                    </span>
                  </div>
                  <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white mb-2 group-hover:text-accent-green transition-colors">
                    Cryptographic HR Attendance Ledgers
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
                    Eliminate timesheet fraud and manual logging errors. Employees check in via browser with automatic verification against office GPS coordinate boundaries (`lat, long`) and corporate IP whitelists.
                  </p>

                  {/* Key Feature Bullets */}
                  <div className="grid grid-cols-2 gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-dark-bg p-4 rounded-2xl border border-light-border dark:border-dark-border">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-check text-accent-green"></i>
                      <span>GPS Geofenced Check-In</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-check text-accent-green"></i>
                      <span>Corporate IP Whitelist Checks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-check text-accent-green"></i>
                      <span>One-Click PTO Approvals</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-check text-accent-green"></i>
                      <span>Monthly Payroll Export Ledger</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 dark:bg-[#121620]/60 border-t border-light-border dark:border-dark-border flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                <span className="font-mono text-[11px] text-slate-400">Query: `INSERT INTO attendance_logs`</span>
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
                      <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 ml-1">Master Tasks List</span>
                    </div>
                    <span className="text-[10px] bg-blue-500/15 text-blue-500 font-bold px-2.5 py-0.5 rounded">SQL Filtered</span>
                  </div>
                  <div className="relative bg-slate-50 dark:bg-dark-bg overflow-hidden border-b border-light-border dark:border-dark-border max-h-[250px]">
                    <img src="/assets/light_all_task.png" alt="All Tasks Light" className="block dark:hidden w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                    <img src="/assets/dark_all_task.png" alt="All Tasks Dark" className="hidden dark:block w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-6">
                    <div className="text-[10px] font-mono font-bold text-blue-500 uppercase tracking-wider mb-1.5">Centralized Ticket Pool</div>
                    <h4 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2.5 group-hover:text-blue-500 transition-colors">
                      Granular Task Search &amp; Filtering
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                      Search across thousands of tasks instantly with multi-parameter SQL filters (`Assignee`, `Priority`, `Milestone`). Export structured reports to CSV or PDF with one click.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-light-border dark:border-dark-border">
                      <span className="text-[10px] bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-slate-300 px-2 py-1 rounded border border-light-border dark:border-dark-border">Multi-Select Bulk Edit</span>
                      <span className="text-[10px] bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-slate-300 px-2 py-1 rounded border border-light-border dark:border-dark-border">CSV/PDF Export</span>
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
                      <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 ml-1">Projects Workspace</span>
                    </div>
                    <span className="text-[10px] bg-purple-500/15 text-purple-500 font-bold px-2.5 py-0.5 rounded">Milestones</span>
                  </div>
                  <div className="relative bg-slate-50 dark:bg-dark-bg overflow-hidden border-b border-light-border dark:border-dark-border max-h-[250px]">
                    <img src="/assets/dark_all_projects.png" alt="All Projects" className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-6">
                    <div className="text-[10px] font-mono font-bold text-purple-500 uppercase tracking-wider mb-1.5">Portfolio Management</div>
                    <h4 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2.5 group-hover:text-purple-500 transition-colors">
                      Multi-Project Milestone Tracking
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                      Monitor budget burn rates, sprint completion percentages, and client deliverables side-by-side. Give external stakeholders secure, read-only portal access to verify real-time status.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-light-border dark:border-dark-border">
                      <span className="text-[10px] bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-slate-300 px-2 py-1 rounded border border-light-border dark:border-dark-border">Budget Burn Rate</span>
                      <span className="text-[10px] bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-slate-300 px-2 py-1 rounded border border-light-border dark:border-dark-border">Client Portal CNAME</span>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-3.5 bg-slate-50 dark:bg-[#121620]/60 border-t border-light-border dark:border-dark-border flex items-center justify-between text-[11px] font-bold text-purple-500">
                  <span>Explore Projects Suite</span>
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
                      <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 ml-1">Team Directory</span>
                    </div>
                    <span className="text-[10px] bg-amber-500/15 text-amber-500 font-bold px-2.5 py-0.5 rounded">RBAC Security</span>
                  </div>
                  <div className="relative bg-slate-50 dark:bg-dark-bg overflow-hidden border-b border-light-border dark:border-dark-border max-h-[250px]">
                    <img src="/assets/light_employees.png" alt="Employees Light" className="block dark:hidden w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                    <img src="/assets/dark_all_user.png" alt="Users Dark" className="hidden dark:block w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-6">
                    <div className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-wider mb-1.5">Identity &amp; Access Control</div>
                    <h4 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2.5 group-hover:text-amber-500 transition-colors">
                      Granular Role-Based Security
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                      Enforce Principle of Least Privilege across your organization. Assign strict permissions (`Super Admin`, `Project Manager`, `Developer`, `HR Auditor`) and mandate 2FA TOTP authentication.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-light-border dark:border-dark-border">
                      <span className="text-[10px] bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-slate-300 px-2 py-1 rounded border border-light-border dark:border-dark-border">2FA / TOTP Required</span>
                      <span className="text-[10px] bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-slate-300 px-2 py-1 rounded border border-light-border dark:border-dark-border">Custom RBAC Silos</span>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-3.5 bg-slate-50 dark:bg-[#121620]/60 border-t border-light-border dark:border-dark-border flex items-center justify-between text-[11px] font-bold text-amber-500">
                  <span>Inspect RBAC Roles</span>
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
