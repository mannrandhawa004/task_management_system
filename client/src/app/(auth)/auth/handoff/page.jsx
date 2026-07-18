"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CircleAlert, Loader2, ShieldCheck } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/v1";

export default function OnboardingHandoffPage() {
    const router = useRouter();
    const exchangeStarted = useRef(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (exchangeStarted.current) return;
        exchangeStarted.current = true;

        const fragment = new URLSearchParams(window.location.hash.slice(1));
        const token = fragment.get("token");
        window.history.replaceState({}, "", "/auth/handoff");

        const exchangeToken = async () => {
            try {
                if (!token) {
                    throw new Error("This onboarding link is missing or invalid. Sign in with your workspace credentials.");
                }
                const response = await fetch(`${API_URL}/auth/onboarding/exchange`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token }),
                });
                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                    throw new Error(data.message || "This onboarding link could not be verified.");
                }

                const tenantSlug = data.data?.tenantSlug;
                if (tenantSlug) localStorage.setItem("active_tenant_slug", tenantSlug);
                router.replace("/dashboard");
            } catch (exchangeError) {
                setError(exchangeError.message || "The secure workspace session could not be created.");
            }
        };

        exchangeToken();
    }, [router]);

    return (
        <main className="relative isolate grid min-h-svh place-items-center overflow-hidden bg-[var(--bg)] p-5">
            <div className="pointer-events-none absolute inset-0 opacity-45 [background-size:46px_46px] [background-image:linear-gradient(rgba(11,87,58,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(11,87,58,.12)_1px,transparent_1px)] dark:[background-image:linear-gradient(rgba(246,157,57,.11)_1px,transparent_1px),linear-gradient(90deg,rgba(246,157,57,.11)_1px,transparent_1px)] [mask-image:radial-gradient(circle_at_center,black,transparent_76%)]" />
            <div className="pointer-events-none absolute left-[12%] top-[12%] h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl dark:bg-orange-400/10" />

            <section className="relative z-10 w-full max-w-[500px] rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-7 text-center shadow-[0_34px_100px_rgba(20,35,27,.16)] sm:p-10 dark:shadow-[0_34px_100px_rgba(0,0,0,.48)]">
                <Image
                    src="/assets/taskflow-logo-modern.png"
                    alt="TaskFlow"
                    width={156}
                    height={30}
                    priority
                    className="mx-auto h-auto w-[150px] object-contain"
                />

                {error ? (
                    <>
                        <span className="mx-auto mt-8 grid h-14 w-14 place-items-center rounded-2xl bg-rose-500/10 text-rose-500">
                            <CircleAlert size={27} />
                        </span>
                        <h1 className="mt-5 text-2xl font-bold tracking-[-.04em] text-[var(--text)]">Secure link unavailable</h1>
                        <p className="mx-auto mt-3 max-w-sm text-sm font-medium leading-6 text-[var(--muted)]">{error}</p>
                        <Link
                            href="/"
                            className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 text-xs font-extrabold text-white transition hover:-translate-y-0.5 hover:brightness-105"
                        >
                            Go to workspace sign in <ArrowRight size={16} />
                        </Link>
                    </>
                ) : (
                    <>
                        <span className="mx-auto mt-8 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-600/10 text-emerald-700 dark:bg-orange-400/10 dark:text-orange-300">
                            <ShieldCheck size={27} />
                        </span>
                        <h1 className="mt-5 text-2xl font-bold tracking-[-.04em] text-[var(--text)]">Opening your workspace</h1>
                        <p className="mx-auto mt-3 max-w-sm text-sm font-medium leading-6 text-[var(--muted)]">
                            Your payment is verified. We are exchanging the single-use onboarding link for an encrypted TaskFlow session.
                        </p>
                        <div className="mt-7 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.12em] text-[var(--primary)]">
                            <Loader2 size={16} className="animate-spin" /> Signing you in securely
                        </div>
                    </>
                )}
            </section>
        </main>
    );
}
