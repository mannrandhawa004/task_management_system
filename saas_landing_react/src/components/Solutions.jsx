import React from 'react';

export default function Solutions() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto text-center border-t border-light-border dark:border-dark-border" id="solutions">
      
      <div className="max-w-3xl mx-auto mb-16">
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight mb-4">
          Industry Tailored Solutions
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-base">
          Discover how organizations across engineering, healthcare, and finance leverage our dedicated database pools.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        
        {/* Card 1: Remote Dev Teams */}
        <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-3xl p-5 shadow-soft dark:shadow-soft-dark text-left flex flex-col justify-between group hover:border-brand-500 transition-all">
          <div>
            <div className="w-full h-36 rounded-2xl bg-slate-100 dark:bg-dark-bg overflow-hidden mb-4 border border-light-border dark:border-dark-border">
              <img src="/assets/light_task_board.png" alt="Task Board Light" className="block dark:hidden w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" />
              <img src="/assets/dark_task_board.png" alt="Task Board Dark" className="hidden dark:block w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" />
            </div>
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mb-1.5">Remote Dev Teams</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
              Synchronize sprint boards across multiple time zones with real-time Socket.IO and GitHub commit linking.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-light-border dark:border-dark-border flex items-center justify-between text-xs font-semibold text-brand-500">
            <span>Explore Engineering</span> <i className="fa-solid fa-arrow-right"></i>
          </div>
        </div>

        {/* Card 2: Healthcare Operations */}
        <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-3xl p-5 shadow-soft dark:shadow-soft-dark text-left flex flex-col justify-between group hover:border-accent-green transition-all">
          <div>
            <div className="w-full h-36 rounded-2xl bg-slate-100 dark:bg-dark-bg overflow-hidden mb-4 border border-light-border dark:border-dark-border">
              <img src="/assets/light_attendence.png" alt="Attendance Light" className="block dark:hidden w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" />
              <img src="/assets/dark_attendence.png" alt="Attendance Dark" className="hidden dark:block w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" />
            </div>
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mb-1.5">Healthcare Operations</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
              Enforce strict patient and staff privacy with dedicated per-tenant database isolation and SOC 2 compliance.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-light-border dark:border-dark-border flex items-center justify-between text-xs font-semibold text-accent-green">
            <span>Healthcare Privacy</span> <i className="fa-solid fa-arrow-right"></i>
          </div>
        </div>

        {/* Card 3: Financial Enterprises */}
        <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-3xl p-5 shadow-soft dark:shadow-soft-dark text-left flex flex-col justify-between group hover:border-blue-500 transition-all">
          <div>
            <div className="w-full h-36 rounded-2xl bg-slate-100 dark:bg-dark-bg overflow-hidden mb-4 border border-light-border dark:border-dark-border">
              <img src="/assets/light_dashboard.png" alt="Dashboard Light" className="block dark:hidden w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" />
              <img src="/assets/dark_dashboard.png" alt="Dashboard Dark" className="hidden dark:block w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" />
            </div>
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mb-1.5">Financial Enterprises</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
              Cryptographic audit logs, role hierarchies, and automated timesheet ledgers built for audit validation.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-light-border dark:border-dark-border flex items-center justify-between text-xs font-semibold text-blue-500">
            <span>Financial Security</span> <i className="fa-solid fa-arrow-right"></i>
          </div>
        </div>

        {/* Card 4: Creative Agencies */}
        <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-3xl p-5 shadow-soft dark:shadow-soft-dark text-left flex flex-col justify-between group hover:border-purple-500 transition-all">
          <div>
            <div className="w-full h-36 rounded-2xl bg-slate-100 dark:bg-dark-bg overflow-hidden mb-4 border border-light-border dark:border-dark-border">
              <img src="/assets/light_employees.png" alt="Employees Light" className="block dark:hidden w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" />
              <img src="/assets/dark_all_user.png" alt="Employees Dark" className="hidden dark:block w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" />
            </div>
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mb-1.5">Creative Agencies</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
              Track client deliverables, employee working hours, and billing rates dynamically from one clean dashboard.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-light-border dark:border-dark-border flex items-center justify-between text-xs font-semibold text-purple-500">
            <span>Agency Workflows</span> <i className="fa-solid fa-arrow-right"></i>
          </div>
        </div>

      </div>

    </section>
  );
}
