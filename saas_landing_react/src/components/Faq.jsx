import React, { useState } from 'react';

const FAQ_DATA = [
  {
    q: "How does multi-tenant database isolation work?",
    a: "Every tenant workspace provisioned on our Pro and Enterprise tiers receives its own isolated 21-table MySQL database (`tenant_acmecorp`) within our connection pool. There is no shared row data between organizations, ensuring 100% security and SOC 2 Type II compliance."
  },
  {
    q: "Can I migrate existing Jira or Trello sprint boards into TaskFlow?",
    a: "Yes! Our automated migration tool lets you import boards, lists, cards, assignees, and custom labels directly from Jira, Trello, Asana, and Monday.com via REST API with a single click."
  },
  {
    q: "How does the real-time Socket.IO attendance tracker verify employees?",
    a: "The attendance module cross-references office GPS geofencing boundaries with corporate IP whitelists and cryptographic TOTP timestamps, logging check-ins and check-outs automatically into the HR ledger."
  },
  {
    q: "What happens when an isolated database pool sits idle?",
    a: "We utilize an intelligent LRU (Least Recently Used) connection pool eviction strategy that automatically scales down idle tenant pools to save memory while preserving instant zero-downtime wakeup upon activity."
  },
  {
    q: "Can we use custom domain endpoints or single sign-on (SSO)?",
    a: "Yes, Pro and Enterprise tiers include custom domain CNAME mapping (`app.yourcompany.com`) along with OAuth 2.0 / SAML 2.0 integration for Google Workspace, Microsoft Azure AD, and Okta."
  }
];

export default function Faq() {
  const [openIdx, setOpenIdx] = useState(null);

  const toggle = (i) => {
    setOpenIdx(openIdx === i ? null : i);
  };

  return (
    <section className="py-24 px-6 max-w-4xl mx-auto border-t border-light-border dark:border-dark-border" id="faq">
      
      <div className="text-center mb-16">
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight mb-3">
          Frequently Asked Questions
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-base">
          Got questions about our architecture or tenant provisioning? We've got answers.
        </p>
      </div>

      <div className="space-y-4">
        {FAQ_DATA.map((item, i) => {
          const isOpen = openIdx === i;
          return (
            <div 
              key={i} 
              className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl overflow-hidden shadow-soft transition-all"
            >
              <button 
                type="button"
                onClick={() => toggle(i)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 font-display font-bold text-base text-slate-900 dark:text-white focus:outline-none"
              >
                <span>{item.q}</span>
                <div className={`w-8 h-8 rounded-full bg-slate-100 dark:bg-dark-bg flex items-center justify-center text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-brand-500/10 text-brand-500' : ''}`}>
                  <i className="fa-solid fa-chevron-down text-xs"></i>
                </div>
              </button>
              
              {isOpen && (
                <div className="px-6 pb-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-light-border dark:border-dark-border pt-4 animate-fadeIn">
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
