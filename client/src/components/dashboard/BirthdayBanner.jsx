"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, PartyPopper, Cake, X } from "lucide-react";

export default function BirthdayBanner({ user }) {
  const [isBirthday, setIsBirthday] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user || !user.dob) return;

    const today = new Date();
    const dob = new Date(user.dob);

    const isSameMonth = today.getMonth() === dob.getMonth();
    const isSameDay = today.getDate() === dob.getDate();

    const isLeapYear = (year) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const isFeb28NonLeap =
      today.getMonth() === 1 &&
      today.getDate() === 28 &&
      !isLeapYear(today.getFullYear()) &&
      dob.getMonth() === 1 &&
      dob.getDate() === 29;

    if ((isSameMonth && isSameDay) || isFeb28NonLeap) {
      setIsBirthday(true);
    }
  }, [user]);

  if (!isBirthday || dismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-rose-500/30 bg-gradient-to-r from-rose-500/15 via-purple-500/15 to-amber-500/15 p-4 md:p-6 shadow-md transition-all animate-in fade-in duration-300">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-rose-500/20 blur-2xl pointer-events-none" />
      <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 to-purple-600 text-white shadow-md shadow-rose-500/20">
            <Cake size={24} className="animate-bounce" />
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-rose-500 flex items-center gap-1">
                <Sparkles size={12} /> Special Day
              </span>
            </div>
            <h3 className="text-base md:text-lg font-black text-[var(--text)]">
              🎂 Happy Birthday, {user?.name || "Friend"}!
            </h3>
            <p className="text-xs md:text-sm font-medium text-[var(--muted)]">
              Wishing you an incredible year ahead filled with joy, happiness, and prosperity!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-white/10 dark:bg-black/20 px-4 py-1.5 text-xs font-bold border border-[var(--border)]">
            <PartyPopper size={14} className="text-amber-400" />
            Have a wonderful day!
          </span>
          <button
            onClick={() => setDismissed(true)}
            className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
            title="Dismiss banner"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
