"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Gift, Heart, X, PartyPopper, Cake } from "lucide-react";

export default function BirthdayGreetingModal({ user }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user || !user.dob) return;

    // Check if today is user's birthday
    const today = new Date();
    const dob = new Date(user.dob);

    const isSameMonth = today.getMonth() === dob.getMonth();
    const isSameDay = today.getDate() === dob.getDate();

    // Leap year logic: Feb 28 on non-leap year celebrating Feb 29
    const isLeapYear = (year) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const isFeb28NonLeap =
      today.getMonth() === 1 &&
      today.getDate() === 28 &&
      !isLeapYear(today.getFullYear()) &&
      dob.getMonth() === 1 &&
      dob.getDate() === 29;

    if ((isSameMonth && isSameDay) || isFeb28NonLeap) {
      const sessionKey = `birthday_modal_shown_${user.id}_${today.getFullYear()}`;
      if (!sessionStorage.getItem(sessionKey)) {
        setIsOpen(true);
      }
    }
  }, [user]);

  const handleDismiss = () => {
    if (user) {
      const today = new Date();
      sessionStorage.setItem(`birthday_modal_shown_${user.id}_${today.getFullYear()}`, "true");
    }
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-rose-500/30 p-8 shadow-2xl text-center bg-[var(--card)]"
          >
            {/* Background Glow */}
            <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-rose-500/20 blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl pointer-events-none animate-pulse" />

            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-2 rounded-full text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors cursor-pointer z-10"
            >
              <X size={20} />
            </button>

            {/* Celebratory Icon Header */}
            <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-rose-500 to-purple-600 text-white shadow-lg shadow-rose-500/30">
              <Cake size={44} className="animate-bounce" />
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-zinc-900 shadow-md"
              >
                <PartyPopper size={18} />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                className="absolute -bottom-1 -left-1 flex h-7 w-7 items-center justify-center rounded-full bg-pink-500 text-white shadow-md"
              >
                <Heart size={14} />
              </motion.div>
            </div>

            {/* Title & Greeting */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1 text-xs font-black uppercase tracking-widest text-rose-500">
                <Sparkles size={14} className="animate-spin" style={{ animationDuration: "6s" }} />
                <span>Special Celebration</span>
              </div>

              <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-rose-500 via-purple-500 to-amber-500 bg-clip-text text-transparent">
                Happy Birthday, {user?.name?.split(" ")[0] || "Champion"}! 🎉
              </h2>

              <p className="text-sm font-medium text-[var(--muted)] leading-relaxed max-w-md mx-auto">
                Wishing you a fantastic birthday filled with joy, success, and celebration! Thank you for being such an invaluable part of our team. May this year bring you closer to all your dreams and goals! 🚀✨
              </p>
            </div>

            {/* Action Button */}
            <div className="mt-8">
              <button
                onClick={handleDismiss}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-600 text-white font-black text-sm shadow-lg shadow-rose-500/25 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <Gift size={18} />
                <span>Thank You & Let's Celebrate! 🎈</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
