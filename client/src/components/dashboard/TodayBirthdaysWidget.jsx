"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Cake, Sparkles, User, Building2, Gift, ChevronRight, PartyPopper } from "lucide-react";
import Image from "next/image";
import { api } from "@/lib/axios";

export default function TodayBirthdaysWidget({ user }) {
  const router = useRouter();
  const [birthdays, setBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);

  // Only show widget for HR, Admin, Super Admin
  const userRole = user?.role_name || user?.role || "";
  const normalizedRole = userRole.toLowerCase().replace(/ /g, "_");
  const canViewWidget = [
    "super_admin",
    "admin",
    "hr",
    "human_resources",
  ].includes(normalizedRole);

  useEffect(() => {
    if (!canViewWidget) {
      setLoading(false);
      return;
    }

    const fetchBirthdays = async () => {
      try {
        const res = await api.get("/users/birthdays/today");
        setBirthdays(res.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch today's birthdays:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBirthdays();
  }, [canViewWidget]);

  if (!canViewWidget) return null;

  const calculateAge = (dobString) => {
    if (!dobString) return null;
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 && age < 100 ? age : null;
  };

  return (
    <div className="p-5 rounded-2xl border bg-[var(--card)] border-[var(--border)] shadow-sm flex flex-col  ">
      {/* Clean Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border)]/60 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-rose-500/20 to-purple-500/20 flex items-center justify-center text-rose-500 font-black">
            <Cake size={14} className="animate-bounce" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text)]">Today's Birthdays</h3>
            <p className="text-[11px] text-[var(--muted)]">Celebration corner</p>
          </div>
        </div>
        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
          {birthdays.length} {birthdays.length === 1 ? "Person" : "People"}
        </span>
      </div>

      {loading ? (
        <div className="my-auto py-8 text-center text-xs font-bold text-[var(--muted)] animate-pulse">
          Checking birthday calendar...
        </div>
      ) : birthdays.length === 0 ? (
        <div className=" py-8 text-center ">
          <div className="w-10 h-10 rounded-xl bg-[var(--input)] flex items-center justify-center text-[var(--muted)]">
            <PartyPopper size={18} className="opacity-40" />
          </div>
          <p className="text-xs font-bold text-[var(--muted)]">No birthdays celebrating today!</p>
          <p className="text-[11px] text-[var(--muted)]/70">Check back tomorrow for upcoming celebrations.</p>
        </div>
      ) : (
        <div className="min-h-auto max-h-[240px] overflow-y-auto pr-1 no-scrollbar">
          {birthdays.map((emp) => {
            const age = calculateAge(emp.dob);
            return (
              <div
                key={emp.id}
                onClick={() => router.push(`/dashboard/users/${emp.id}`)}
                className="group relative flex justify-between  gap-2.5 rounded-xl border border-[var(--border)]/60 bg-[var(--input)]/30 py-2 px-2.5 hover:bg-[var(--hover)] hover:border-rose-500/30 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative h-9 w-9 shrink-0 rounded-xl bg-gradient-to-tr from-rose-500 to-purple-600 text-white font-black overflow-hidden flex items-center justify-center shadow-2xs text-xs">
                    {emp.avatar ? (
                      <Image
                        src={emp.avatar}
                        alt={emp.name || "Employee avatar"}
                        width={36}
                        height={36}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      emp.name?.slice(0, 2).toUpperCase() || "??"
                    )}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-xs text-[var(--text)] truncate group-hover:text-rose-500 transition-colors">
                        {emp.name}
                      </h4>
                      {age && (
                        <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider rounded bg-rose-500/10 text-rose-500 px-1 py-0.5">
                          {age} Yrs
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-[var(--muted)] truncate">
                      <span className="capitalize text-[var(--primary)]">{emp.role || "Employee"}</span>
                      <span>•</span>
                      <span className="truncate">{emp.department_name || "General"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-lg">
                    <Gift size={11} /> Wish
                  </span>
                  <div className="h-7 w-7 rounded-lg bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] group-hover:text-[var(--text)] group-hover:border-rose-500/30 transition-all">
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
