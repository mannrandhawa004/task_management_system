import React from 'react';

export default function Reviews() {
  const reviews = [
    {
      quote: "The Row-Level Security (`department_id = ?`) and Add Member Drawer with instant client-side memory search completely eliminated task clutter between our Engineering and Marketing squads. It's brilliant.",
      author: "Marcus Sterling",
      role: "VP of Engineering at CloudScale",
      avatar: "MS",
      color: "bg-brand-500",
      rating: 5
    },
    {
      quote: "Rolling out Microsoft Authenticator TOTP QR setup (`requires2FA: true`) across 120 employees took less than 10 minutes. The two-step temporary JWT token verification flow is flawless and SOC 2 ready.",
      author: "Elena Rostova",
      role: "Principal Product Manager at FinPulse",
      avatar: "ER",
      color: "bg-accent-green",
      rating: 5
    },
    {
      quote: "The Next.js 16 App Router frontend paired with raw parameterized MySQL 8 queries over Express 5 is lightning fast. And our HR department loves the location-tagged daily attendance (`Office vs Hybrid`)!",
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
          <i className="fa-solid fa-quote-left"></i> Verified Technical Success
        </div>
        <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-slate-900 dark:text-white tracking-tight mb-5 leading-tight">
          Loved by Engineering, PMO &amp; HR Leaders
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
          See how distributed engineering squads, PMO directors, and HR leaders scale their operations using our Next.js 16 / Express 5 architecture.
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
              <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mb-8 font-normal italic">
                "{rev.quote}"
              </p>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-light-border dark:border-dark-border">
              <div className={`w-11 h-11 rounded-2xl ${rev.color} text-white font-extrabold flex items-center justify-center text-sm shadow-md flex-shrink-0 group-hover:scale-105 transition-transform`}>
                {rev.avatar}
              </div>
              <div>
                <div className="font-display font-bold text-sm text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors">
                  {rev.author}
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                  {rev.role}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
