import React from 'react';

export default function Reviews() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto border-t border-light-border dark:border-dark-border text-center" id="reviews">
      
      <div className="max-w-3xl mx-auto mb-16">
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight mb-4">
          Trusted By Engineering Leaders
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-base">
          See how teams use our multi-tenant database pools and real-time sprint boards to ship 40% faster.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto text-left">
        
        {/* Review 1 */}
        <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-3xl p-6 shadow-soft dark:shadow-soft-dark flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1 text-amber-400 text-sm mb-4">
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 italic">
              "The per-tenant MySQL isolation is a complete game changer for our enterprise clients. Knowing our data has zero row overlap gives our compliance team complete peace of mind."
            </p>
          </div>
          <div className="flex items-center gap-3 pt-4 border-t border-light-border dark:border-dark-border">
            <div className="w-10 h-10 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center text-sm shadow">
              MS
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900 dark:text-white">Marcus Sterling</div>
              <div className="text-[11px] text-slate-400">VP of Engineering at CloudScale</div>
            </div>
          </div>
        </div>

        {/* Review 2 */}
        <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-3xl p-6 shadow-soft dark:shadow-soft-dark flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1 text-amber-400 text-sm mb-4">
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 italic">
              "We migrated 45 developers from Jira over a single weekend using the REST API. The Socket.IO real-time Kanban updates are instantaneous even across global time zones."
            </p>
          </div>
          <div className="flex items-center gap-3 pt-4 border-t border-light-border dark:border-dark-border">
            <div className="w-10 h-10 rounded-full bg-accent-green text-white font-bold flex items-center justify-center text-sm shadow">
              EL
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900 dark:text-white">Elena Rostova</div>
              <div className="text-[11px] text-slate-400">Lead Product Manager at FinTech Ops</div>
            </div>
          </div>
        </div>

        {/* Review 3 */}
        <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-3xl p-6 shadow-soft dark:shadow-soft-dark flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1 text-amber-400 text-sm mb-4">
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 italic">
              "The real-time attendance tracker with geofencing eliminated all timesheet discrepancies. Our HR team loves the automated daily reports generated directly from the tenant schema."
            </p>
          </div>
          <div className="flex items-center gap-3 pt-4 border-t border-light-border dark:border-dark-border">
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-sm shadow">
              DK
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900 dark:text-white">David Kim</div>
              <div className="text-[11px] text-slate-400">Operations Director at Apex Creative</div>
            </div>
          </div>
        </div>

      </div>

    </section>
  );
}
