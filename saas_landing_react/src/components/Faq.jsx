import React, { useState } from 'react';

const FAQ_DATA = [
  {
    q: "How does Microsoft Authenticator MFA (TOTP) setup and login work?",
    a: "TaskFlow integrates standard RFC 6238 Time-Based One-Time Passwords (TOTP). During setup, the backend (`/v1/auth/2fa/generate`) returns a Data URL QR code image that you scan directly with Microsoft Authenticator—no manual 16-digit code typing required! When logging in, if 2FA is active, our two-step flow issues short-lived temporary JWT tokens (`requires2FA: true`) and requires your 6-digit confirmation code before releasing full HTTP-only session cookies."
  },
  {
    q: "How does Row-Level Security (RLS) and Department Scoping protect our tasks and projects?",
    a: "Our raw parameterized MySQL 8 queries enforce strict visibility rules (`SELECT * FROM project WHERE department_id = ? OR is_global = 1`). Users can only view projects, tasks, and employee directories within their authorized department boundaries (e.g., Engineering vs. Marketing). Super Admins have toggle controls to expand visibility cross-departmentally when required."
  },
  {
    q: "How does the Add Member Drawer and client-side memory search work?",
    a: "When adding team members to a project or task (`/v1/project/{id}/members`), our Add Member Drawer loads with instant client-side Redux store caching and memory search (`userSlice`). It automatically defaults to showing only employees from the project's assigned department, eliminating clutter and preventing accidental assignment across organizational silos."
  },
  {
    q: "Can we switch between Grid Card View and density-optimized Table View?",
    a: "Yes! The dashboard features a real-time Dual-View layout engine. You can toggle instantly between our visual Kanban/Grid Card View and our density-optimized technical Table View with live department badges, statuses (`To Do`, `In Progress`, `Review`, `Completed`), and due dates."
  },
  {
    q: "How does the HR Attendance & Leave Quota calculation work?",
    a: "Daily attendance (`/v1/attendance/check-in`) logs employee check-in and check-out timestamps along with explicit work location tagging (`Office`, `Remote`, `Hybrid`) and break durations. Our leave engine (`/v1/leaves/apply`) manages configurable quotas across Annual, Sick, Casual, and Maternity/Paternity categories with hierarchical approval workflows and automated salary deduction reporting."
  },
  {
    q: "What tech stack powers this platform?",
    a: "The frontend is built on Next.js 16 (App Router), React 19, Redux Toolkit (`@reduxjs/toolkit`), and Tailwind CSS. The high-performance backend runs on Node.js, Express 5, raw parameterized MySQL 8 queries (`mysql2/promise`), Cloudinary media storage, and Socket.IO 4 for instantaneous WebSocket room broadcasting."
  }
];

export default function Faq() {
  const [openIdx, setOpenIdx] = useState(0);

  const toggle = (i) => {
    setOpenIdx(openIdx === i ? null : i);
  };

  return (
    <section className="py-28 px-6 max-w-4xl mx-auto border-t border-light-border dark:border-dark-border relative" id="faq">
      
      <div className="text-center mb-16 gsap-scroll-header">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-dark-card text-slate-700 dark:text-slate-300 font-mono text-xs font-bold mb-4 border border-light-border dark:border-dark-border">
          <i className="fa-solid fa-circle-question text-brand-500"></i> Technical Architecture &amp; MFA Specs
        </div>
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight mb-3">
          Frequently Asked Questions
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-base">
          Got questions about our Next.js 16 / Express 5 architecture, Microsoft Authenticator MFA, or RLS scoping? We've got answers.
        </p>
      </div>

      <div className="gsap-scroll-grid space-y-4">
        {FAQ_DATA.map((item, i) => {
          const isOpen = openIdx === i;
          return (
            <div 
              key={i} 
              className={`gsap-scroll-card bg-white dark:bg-dark-card border rounded-2xl overflow-hidden shadow-soft transition-all duration-300 ${
                isOpen ? 'border-brand-500/80 ring-1 ring-brand-500/20 shadow-md' : 'border-light-border dark:border-dark-border hover:border-slate-400'
              }`}
            >
              <button 
                type="button"
                onClick={() => toggle(i)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
              >
                <span className="font-display font-bold text-base text-slate-900 dark:text-white">{item.q}</span>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${isOpen ? 'bg-brand-500 text-white rotate-180' : 'bg-slate-100 dark:bg-dark-bg text-slate-500'}`}>
                  <i className="fa-solid fa-chevron-down text-xs"></i>
                </span>
              </button>
              
              {isOpen && (
                <div className="px-6 pb-6 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-light-border dark:border-dark-border pt-4">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </section>
  );
}
