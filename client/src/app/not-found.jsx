"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileQuestion, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
    const router = useRouter();

    const handleGoBack = () => {
        const lastDashboardPath = sessionStorage.getItem("last_valid_dashboard_path");

        if (lastDashboardPath && lastDashboardPath !== window.location.pathname) {
            router.replace(lastDashboardPath);
            return;
        }

        router.replace("/dashboard");
    };

    return (
        <main className="min-h-screen w-full flex items-center justify-center p-6 bg-[var(--bg)] text-[var(--text)]">
            <div className="w-full max-w-md text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">

                {/* ICON CONTAINER */}
                <div className="relative flex justify-center">
                    <div className="absolute inset-0 bg-[var(--primary)]/10 blur-2xl rounded-full w-28 h-28 mx-auto -z-10" />
                    <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-md text-[var(--primary)]">
                        <FileQuestion className="w-12 h-12 stroke-[1.5]" />
                    </div>
                </div>

                {/* ERROR STRINGS */}
                <div className="space-y-2.5">
                    <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-[var(--text)] to-[var(--muted)] bg-clip-text text-transparent">
                        404 Error
                    </h1>
                    <h2 className="text-lg font-bold text-[var(--text)]">
                        Node Path Missing
                    </h2>
                    <p className="text-sm text-[var(--muted)] max-w-sm mx-auto leading-relaxed">
                        The page directory endpoint you are trying to access has either migrated or does not exist in the active runtime space.
                    </p>
                </div>

                {/* ACTION SHORTCUT ROUTING LINKS */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-center pt-2">
                    <button
                        type="button"
                        onClick={handleGoBack}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--hover)] transition-all cursor-pointer shadow-sm active:scale-[0.98]"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>

                    <Link
                        href="/dashboard"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[var(--primary)] hover:brightness-110 transition-all shadow-sm shadow-[var(--primary)]/20 active:scale-[0.98]"
                    >
                        <Home className="w-4 h-4" />
                        Return to Dashboard
                    </Link>
                </div>

                {/* METADATA SYSTEM ID */}
                <div className="pt-6 border-t border-[var(--border)]/60 flex justify-center gap-4 text-[10px] uppercase font-bold tracking-wider text-[var(--muted)]">
                    <span>Status: 404 UNRESOLVED</span>
                    <span>•</span>
                    <span>Scope: Router Edge</span>
                </div>

            </div>
        </main>
    );
}
