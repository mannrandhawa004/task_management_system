import React from 'react';

export default function Reviews() {
  const reviews = [
    {
      quote: "The per-tenant MySQL isolation is a complete game changer for our enterprise clients. Knowing our data (`tenant_cloudscale`) has zero row overlap gives our compliance team complete peace of mind.",
      author: "Marcus Sterling",
      role: "VP of Engineering at CloudScale",
      avatar: "MS",
      color: "bg-brand-500",
      rating: 5
    },
    {
      quote: "We migrated 45 developers from Jira over a single weekend using the REST API. The Socket.IO real-time Kanban updates are instantaneous even across global time zones.",
      author: "Elena Rostova",
      role: "Principal Product Manager at FinPulse",
      avatar: "ER",
      color: "bg-accent-green",
      rating: 5
    },
    {
      quote: "The automated check-in/out attendance tracker saves our HR department 12 hours every week. Office GPS validation with IP geofencing completely eliminated timesheet discrepancies.",
      author: "David K. Thorne",
      role: "Chief Operations Officer at Apex Labs",
      avatar: "DT",
      color: "bg-blue-500",
      rating: 5
    }
  ];

  return (
    <section className="py-28 px-6 max-w-7xl mx-auto border-t border-light-border dark:border-dark-border text-center relative overflow-hidden" id="reviews">
      
      {/* Decorative ambient background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-brand-500/5 dark:bg-brand-500/10 blur-[130px] rounded-full pointer-events-none -z-10"></div>

      <div className="max-w-3xl mx-auto mb-16 gsap-scroll-header">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/15 text-brand-500 font-mono text-xs font-bold mb-4 shadow-sm border border-brand-500/20">
          <i className="fa-solid fa-quote-left"></i> Verified Customer Success
        </div>
        <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-slate-900 dark:text-white tracking-tight mb-5 leading-tight">
          Loved by Engineering &amp; Operations Leaders
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
          See how teams across distributed engineering, healthcare, and finance scale their operations with dedicated MySQL pools and real-time sprint boards.
        </p>
      </div>

      <div className="gsap-scroll-grid grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
        {reviews.map((rev, idx) => (
          <div
            key={idx}
            className="gsap-scroll-card bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-3xl p-8 shadow-soft dark:shadow-soft-dark flex flex-col justify-between hover:-translate-y-2 hover:border-brand-500 transition-all duration-300 group relative"
          >
            <div>
              <div className="flex items-center gap-1 text-amber-400 text-sm mb-5">
                {[...Array(rev.rating)].map((_, i) => (
                  <i key={i} className="fa-solid fa-star"></i>
                ))}
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-8 italic">
                "{rev.quote}"
              </p>
            </div>
            <div className="flex items-center gap-3.5 pt-5 border-t border-light-border dark:border-dark-border">
              <div className={`w-11 h-11 rounded-2xl ${rev.color} text-white font-bold flex items-center justify-center text-sm shadow-md group-hover:scale-105 transition-transform flex-shrink-0`}>
                {rev.avatar}
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">{rev.author}</div>
                <div className="text-xs text-slate-400 font-medium">{rev.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
