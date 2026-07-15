import React, { useState, useEffect } from 'react';
import gsap from 'gsap';

export default function FeatureShowcase() {
  const [activeTab, setActiveTab] = useState('all');
  const [dashboardSpotlight, setDashboardSpotlight] = useState(0);

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
      desc: "Track sprint burn-down rates and completion velocity in real time. Aggregates data across all 21 tenant tables to forecast project delivery accuracy within ±3%.",
      metric: "+34% Delivery Speed",
      icon: "fa-gauge-high",
      color: "brand"
    },
    {
      title: "Critical Deadlines Radar",
      desc: "AI-powered risk detection highlights overdue tasks, bottlenecked dependencies, and team member overload before milestones are impacted.",
      metric: "Zero Missed SLAs",
      icon: "fa-bullseye",
      color: "green"
    },
    {
      title: "Daily Task Progress Gauge",
      desc: "Live visual breakdown of In-Progress vs. Completed vs. Upcoming tasks across every departmental sub-squad (`Engineering`, `Design`, `HR`).",
      metric: "Instant Telemetry",
      icon: "fa-chart-column",
      color: "blue"
    }
  ];

  return (
    <section className="py-28 px-6 max-w-7xl mx-auto border-t border-light-border dark:border-dark-border relative overflow-hidden" id="showcase">
      
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-brand-500/10 dark:bg-brand-500/15 blur-[160px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute bottom-1/4 right-10 w-[400px] h-[400px] bg-blue-500/10 blur-[140px] rounded-full pointer-events-none -z-10"></div>

      {/* Header with GSAP Scroll Class */}
      <div className="max-w-3xl mx-auto text-center mb-16 gsap-scroll-header">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/15 text-brand-500 font-mono text-xs font-bold mb-4 shadow-sm border border-brand-500/20">
          <i className="fa-solid fa-display"></i> Interactive Product Telemetry &amp; Previews
        </div>
        <h2 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-slate-900 dark:text-white tracking-tight mb-5 leading-tight">
          See Exactly How TaskFlow Works
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
          We don’t just show static screenshots. Every preview below highlights the exact enterprise features, database workflows, and real-time synchronizations powering our platform.
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
      <div className="gsap-scroll-grid space-y-14">
        
        {/* ==================== ROW 1: MASTER DASHBOARD & INTERACTIVE SPOTLIGHT ==================== */}
        {(activeTab === 'all' || activeTab === 'analytics') && (
          <div className="gsap-scroll-card rounded-[32px] overflow-hidden border-2 border-brand-500/40 dark:border-brand-500/50 bg-white dark:bg-dark-card shadow-2xl group hover:border-brand-500 transition-all duration-500 relative">
            
            {/* Top Bar macOS */}
            <div className="bg-slate-100 dark:bg-[#11151f] px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-light-border dark:border-dark-border">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-red-400/90 hover:bg-red-500 transition-colors"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-amber-400/90 hover:bg-amber-500 transition-colors"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-green-400/90 hover:bg-green-500 transition-colors"></span>
                <span className="ml-2 text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
                  Dashboard Analytics Overview (`tenant_acmecorp`)
                </span>
              </div>

              <div className="flex items-center gap-2 bg-white dark:bg-dark-bg px-4 py-1.5 rounded-full border border-light-border dark:border-dark-border text-xs font-mono text-slate-500 dark:text-slate-300 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-accent-green animate-ping"></span>
                <i className="fa-solid fa-lock text-[10px] text-accent-green"></i>
                <span>app.taskflow.io/workspace/dashboard</span>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-brand-500 bg-brand-500/10 px-3.5 py-1.5 rounded-xl border border-brand-500/20">
                <i className="fa-solid fa-bolt"></i> Live Real-Time Telemetry
              </div>
            </div>

            {/* Split Content: Left Screenshot + Right Feature Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              
              {/* Left Column: Big Interactive Screenshot */}
              <div className="lg:col-span-7 relative overflow-hidden bg-slate-50 dark:bg-dark-bg border-b lg:border-b-0 lg:border-r border-light-border dark:border-dark-border">
                <img src="/assets/light_dashboard.png" alt="Dashboard Light" className="block dark:hidden w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.015] min-h-[440px]" />
                <img src="/assets/dark_dashboard.png" alt="Dashboard Dark" className="hidden dark:block w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.015] min-h-[440px]" />
                
                {/* Floating Telemetry Badge Overlay */}
                <div className="absolute bottom-5 left-5 right-5 sm:right-auto bg-white/95 dark:bg-[#151924]/95 backdrop-blur-md border border-light-border dark:border-dark-border p-3.5 rounded-2xl shadow-xl flex items-center gap-3.5 z-10">
                  <div className="w-10 h-10 rounded-xl bg-accent-green/15 text-accent-green flex items-center justify-center text-lg font-extrabold flex-shrink-0">
                    <i className="fa-solid fa-arrow-trend-up"></i>
                  </div>
                  <div className="text-left font-sans">
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{dashboardFeatures[dashboardSpotlight].title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-brand-500/15 text-brand-500 font-mono">Active Metric</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                      {dashboardFeatures[dashboardSpotlight].metric} via Socket.IO WebSocket stream
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Detailed Feature Explanations */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-white dark:bg-dark-card">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-dark-bg text-slate-700 dark:text-slate-300 font-mono text-[11px] font-bold mb-5 border border-light-border dark:border-dark-border">
                    <i className="fa-solid fa-microchip text-brand-500"></i> What You're Looking At
                  </div>
                  <h3 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white mb-3">
                    Unified Executive Dashboard
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                    Our master dashboard aggregates data across all 21 isolated tenant tables (`users`, `projects`, `tasks`, `attendance`) to give CTOs and engineering managers complete visibility without query lag.
                  </p>

                  {/* Interactive Feature Accordions / Spots */}
                  <div className="space-y-3">
                    {dashboardFeatures.map((feat, idx) => {
                      const isActive = dashboardSpotlight === idx;
                      return (
                        <div
                          key={idx}
                          onClick={() => setDashboardSpotlight(idx)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                            isActive
                              ? 'border-brand-500 bg-brand-500/5 shadow-md scale-[1.01]'
                              : 'border-light-border dark:border-dark-border hover:border-slate-400 bg-slate-50/50 dark:bg-dark-bg/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2.5 font-display font-bold text-sm text-slate-900 dark:text-white">
                              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${isActive ? 'bg-brand-500 text-white' : 'bg-slate-200 dark:bg-dark-card text-slate-500'}`}>
                                <i className={`fa-solid ${feat.icon}`}></i>
                              </span>
                              <span>{feat.title}</span>
                            </div>
                            <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded ${isActive ? 'bg-brand-500 text-white' : 'text-slate-400'}`}>
                              {feat.metric}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pl-8">
                            {feat.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Highlight */}
                <div className="mt-6 pt-4 border-t border-light-border dark:border-dark-border flex items-center justify-between text-xs font-bold text-brand-500">
                  <span className="flex items-center gap-1.5"><i className="fa-solid fa-circle-check text-accent-green"></i> 100% Real-time chart rendering</span>
                  <a href="#pricing" className="hover:underline flex items-center gap-1">
                    <span>Deploy Dashboard</span> <i className="fa-solid fa-arrow-right"></i>
                  </a>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== ROW 2: TWO-COLUMN DEEP DIVES (KANBAN & ATTENDANCE) ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
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
                  <span className="text-[10px] bg-brand-500/15 text-brand-500 font-bold px-3 py-1 rounded-full">Drag &amp; Drop</span>
                </div>

                {/* Image */}
                <div className="relative bg-slate-50 dark:bg-dark-bg overflow-hidden border-b border-light-border dark:border-dark-border max-h-[350px]">
                  <img src="/assets/light_task_board.png" alt="Task Board Light" className="block dark:hidden w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                  <img src="/assets/dark_task_board.png" alt="Task Board Dark" className="hidden dark:block w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                </div>

                {/* Detailed Feature Explanation Below Image */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono font-bold text-brand-500 uppercase tracking-wider">Workflow Feature</span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="text-xs text-slate-500 font-semibold">Instant Multi-User Sync</span>
                  </div>
                  <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white mb-2 group-hover:text-brand-500 transition-colors">
                    Real-Time Kanban Task Boards
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
                    Empower your developers to drag and drop sprint tickets (`To Do`, `In Progress`, `Code Review`, `Completed`) with zero latency. Every card movement broadcasts instantly to all connected teammates via Socket.IO WebSockets.
                  </p>

                  {/* Key Feature Bullets */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-dark-bg p-3.5 rounded-2xl border border-light-border dark:border-dark-border">
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
                <span className="font-mono text-[11px] text-slate-400">Endpoint: `/v1/tasks/kanban`</span>
                <span className="text-brand-500 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                  <span>View Board Demo</span> <i className="fa-solid fa-arrow-right"></i>
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
                  <span className="text-[10px] bg-green-500/15 text-accent-green font-bold px-3 py-1 rounded-full">GPS &amp; IP Validated</span>
                </div>

                {/* Image */}
                <div className="relative bg-slate-50 dark:bg-dark-bg overflow-hidden border-b border-light-border dark:border-dark-border max-h-[350px]">
                  <img src="/assets/light_attendence.png" alt="Attendance Light" className="block dark:hidden w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                  <img src="/assets/dark_attendence.png" alt="Attendance Dark" className="hidden dark:block w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                </div>

                {/* Detailed Feature Explanation Below Image */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono font-bold text-accent-green uppercase tracking-wider">Security Feature</span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="text-xs text-slate-500 font-semibold">Automated Check-In / Out</span>
                  </div>
                  <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white mb-2 group-hover:text-accent-green transition-colors">
                    Cryptographic HR Attendance Ledgers
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
                    Eliminate timesheet fraud and manual logging errors. Employees check in via browser with automatic verification against office GPS boundaries and corporate IP whitelists.
                  </p>

                  {/* Key Feature Bullets */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-dark-bg p-3.5 rounded-2xl border border-light-border dark:border-dark-border">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-check text-accent-green"></i>
                      <span>GPS Geofenced Office Check-In</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-check text-accent-green"></i>
                      <span>Corporate IP Whitelist Checks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-check text-accent-green"></i>
                      <span>One-Click PTO &amp; Leave Approvals</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-check text-accent-green"></i>
                      <span>Monthly Payroll Export Ledger</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 dark:bg-[#121620]/60 border-t border-light-border dark:border-dark-border flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                <span className="font-mono text-[11px] text-slate-400">Endpoint: `/v1/attendance/status`</span>
                <span className="text-accent-green flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                  <span>Explore HR Suite</span> <i className="fa-solid fa-arrow-right"></i>
                </span>
              </div>
            </div>
          )}

        </div>

        {/* ==================== ROW 3: THREE-COLUMN MASTER SUITE EXPLANATIONS ==================== */}
        {(activeTab === 'all' || activeTab === 'workflow' || activeTab === 'team') && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
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
                  <div className="relative bg-slate-50 dark:bg-dark-bg overflow-hidden border-b border-light-border dark:border-dark-border max-h-[240px]">
                    <img src="/assets/light_all_task.png" alt="All Tasks Light" className="block dark:hidden w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                    <img src="/assets/dark_all_task.png" alt="All Tasks Dark" className="hidden dark:block w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-5">
                    <div className="text-[10px] font-mono font-bold text-blue-500 uppercase tracking-wider mb-1">Centralized Ticket Pool</div>
                    <h4 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-blue-500 transition-colors">
                      Granular Task Search &amp; Filtering
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Search across thousands of tasks instantly with multi-parameter SQL filters (by Assignee, Priority, Status, or Sprint Milestone). Export structured reports to CSV or PDF with one click.
                    </p>
                  </div>
                </div>
                <div className="px-5 py-3.5 bg-slate-50 dark:bg-[#121620]/60 border-t border-light-border dark:border-dark-border flex items-center justify-between text-[11px] font-bold text-blue-500">
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
                  <div className="relative bg-slate-50 dark:bg-dark-bg overflow-hidden border-b border-light-border dark:border-dark-border max-h-[240px]">
                    <img src="/assets/dark_all_projects.png" alt="All Projects" className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-5">
                    <div className="text-[10px] font-mono font-bold text-purple-500 uppercase tracking-wider mb-1">Portfolio Management</div>
                    <h4 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-purple-500 transition-colors">
                      Multi-Project Milestone Tracking
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Monitor budget burn rates, sprint completion percentages, and client deliverables side-by-side. Give external stakeholders secure, read-only portal access to verify real-time status.
                    </p>
                  </div>
                </div>
                <div className="px-5 py-3.5 bg-slate-50 dark:bg-[#121620]/60 border-t border-light-border dark:border-dark-border flex items-center justify-between text-[11px] font-bold text-purple-500">
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
                  <div className="relative bg-slate-50 dark:bg-dark-bg overflow-hidden border-b border-light-border dark:border-dark-border max-h-[240px]">
                    <img src="/assets/light_employees.png" alt="Employees Light" className="block dark:hidden w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                    <img src="/assets/dark_all_user.png" alt="Users Dark" className="hidden dark:block w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-5">
                    <div className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-wider mb-1">Identity &amp; Access Control</div>
                    <h4 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-amber-500 transition-colors">
                      Granular Role-Based Security
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Enforce Principle of Least Privilege across your organization. Assign strict permissions (`Super Admin`, `Project Manager`, `Developer`, `HR Auditor`) and mandate 2FA TOTP authentication.
                    </p>
                  </div>
                </div>
                <div className="px-5 py-3.5 bg-slate-50 dark:bg-[#121620]/60 border-t border-light-border dark:border-dark-border flex items-center justify-between text-[11px] font-bold text-amber-500">
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
