import Link from "next/link";
import Image from "next/image";
import {
    CheckCircle2,
    LockKeyhole,
    Radio,
} from "lucide-react";

import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
import LoginForm from "./LoginForm";

const workflowItems = [
    { title: "Finalize product scope", meta: "Product · Today", state: "In review" },
    { title: "Prepare launch campaign", meta: "Marketing · Friday", state: "On track" },
    { title: "QA workspace permissions", meta: "Engineering · Monday", state: "Ready" },
];

const gridClasses = "absolute inset-0 pointer-events-none opacity-40 [background-size:48px_48px] [background-image:linear-gradient(rgba(11,87,58,.13)_1px,transparent_1px),linear-gradient(90deg,rgba(11,87,58,.13)_1px,transparent_1px)] dark:[background-image:linear-gradient(rgba(246,157,57,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(246,157,57,.12)_1px,transparent_1px)] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]";

export default function LoginExperience() {
    return (
        <main className="relative isolate grid min-h-svh place-items-center overflow-hidden bg-[radial-gradient(circle_at_12%_12%,rgba(11,87,58,.12),transparent_27%),radial-gradient(circle_at_88%_86%,rgba(105,82,205,.09),transparent_25%),var(--bg)] p-3 [font-family:'Segoe_UI',Inter,system-ui,sans-serif] dark:bg-[radial-gradient(circle_at_12%_12%,rgba(246,157,57,.12),transparent_28%),radial-gradient(circle_at_88%_86%,rgba(105,82,205,.08),transparent_25%),var(--bg)] sm:p-4">
            <div className={gridClasses} aria-hidden="true" />
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full border border-emerald-700/15 dark:border-orange-400/15" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-emerald-700/5 ring-1 ring-emerald-700/15 dark:bg-orange-400/5 dark:ring-orange-400/15" aria-hidden="true" />

            <section
                className="relative z-10 grid h-[min(700px,calc(100svh-24px))] min-h-[560px] w-full max-w-[1120px] grid-cols-1 overflow-hidden rounded-[28px] border border-black/[.07] bg-[#fbfcfa]/95 shadow-[0_34px_100px_rgba(26,39,31,.16)] backdrop-blur-xl dark:border-white/[.08] dark:bg-[#0c0d0c]/95 dark:shadow-[0_34px_110px_rgba(0,0,0,.5)] lg:grid-cols-[.92fr_1.08fr] [@media(max-height:700px)]:h-[calc(100svh-16px)] [@media(max-height:700px)]:min-h-[540px]"
                aria-label="TaskFlow sign in"
            >
                <aside className="relative hidden min-h-0 flex-col overflow-hidden bg-[linear-gradient(145deg,#0b583f,#062a20)] p-8 text-white dark:bg-[linear-gradient(145deg,#5b2b10,#241107)] lg:flex xl:p-10 [@media(max-height:700px)]:p-7">
                    <div className="absolute inset-0 opacity-20 [background-size:42px_42px] [background-image:linear-gradient(rgba(255,255,255,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.16)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,transparent,black_28%,black)]" aria-hidden="true" />
                    <div className="pointer-events-none absolute right-[-190px] top-[16%] h-[380px] w-[380px] rounded-full bg-emerald-300/20 blur-[55px] dark:bg-orange-300/20" aria-hidden="true" />

                    <Link className="relative z-10 inline-flex w-fit" href="/" aria-label="TaskFlow home">
                        <Image src="/assets/taskflow-logo-modern.png" alt="TaskFlow" width={156} height={30} priority className="h-auto w-[148px] object-contain drop-shadow-[0_9px_20px_rgba(0,0,0,.16)]" />
                    </Link>

                    <div className="relative z-10 mt-8 [@media(max-height:700px)]:mt-5">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[.15em] text-emerald-100/80 dark:text-orange-100/80">
                            <Radio size={12} /> One connected workspace
                        </span>
                        <h1 className="mt-3 max-w-[440px] text-[42px] font-bold leading-[.98] tracking-[-.06em] xl:text-[48px] [@media(max-height:700px)]:text-[38px]">
                            Move work forward<br />with less noise.
                        </h1>
                        <p className="mt-3 max-w-[420px] text-[13px] font-medium leading-5 text-white/65">
                            Projects, people, attendance, and progress—clear enough for everyone to act on.
                        </p>
                    </div>

                    <div className="relative z-10 mt-auto rounded-[18px] border border-white/15 bg-white/[.09] p-4 shadow-[0_22px_54px_rgba(0,0,0,.16)] backdrop-blur-xl [@media(max-height:700px)]:p-3.5">
                        <div className="flex items-center justify-between">
                            <div className="grid gap-0.5">
                                <span className="text-[9px] font-semibold text-white/50">Today&apos;s flow</span>
                                <strong className="text-[13px]">Launch workspace</strong>
                            </div>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-1 text-[9px] font-bold text-white/75">
                                <i className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_0_4px_rgba(110,231,183,.12)] dark:bg-orange-300" /> Live
                            </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-[9px] font-semibold text-white/55">
                            <span>Team progress</span><strong className="text-white">76%</strong>
                        </div>
                        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
                            <i className="block h-full w-[76%] rounded-full bg-[linear-gradient(90deg,#6ce0b3,#f9c47f)]" />
                        </div>

                        <div className="mt-3 grid gap-1.5">
                            {workflowItems.map((item, index) => (
                                <article
                                    className={`flex min-w-0 items-center gap-2 rounded-[10px] bg-white/[.065] px-2.5 py-2 ${index === 2 ? "[@media(max-height:700px)]:hidden" : ""}`}
                                    key={item.title}
                                >
                                    <CheckCircle2 className="shrink-0 text-emerald-200 dark:text-orange-200" size={14} />
                                    <div className="grid min-w-0 flex-1 gap-0.5">
                                        <strong className="truncate text-[9px]">{item.title}</strong>
                                        <small className="text-[8px] text-white/42">{item.meta}</small>
                                    </div>
                                    <span className="shrink-0 text-[8px] font-semibold text-white/45">{item.state}</span>
                                </article>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 mt-4 grid grid-cols-3 gap-3 [@media(max-height:700px)]:mt-3">
                        <div className="grid gap-0.5"><strong className="text-[13px]">99.9%</strong><span className="text-[7px] uppercase tracking-[.08em] text-white/40">Workspace uptime</span></div>
                        <div className="grid gap-0.5"><strong className="text-[13px]">2FA</strong><span className="text-[7px] uppercase tracking-[.08em] text-white/40">Account security</span></div>
                        <div className="grid gap-0.5"><strong className="text-[13px]">Live</strong><span className="text-[7px] uppercase tracking-[.08em] text-white/40">Team updates</span></div>
                    </div>
                </aside>

                <section className="flex min-h-0 min-w-0 flex-col overflow-y-auto bg-white/40 px-6 py-5 dark:bg-black/10 sm:px-9 sm:py-6 lg:px-12 xl:px-16 [@media(max-height:700px)]:py-4">
                    <div className="flex min-h-10 items-center justify-between lg:justify-end">
                        <Link className="inline-flex items-center lg:hidden" href="/" aria-label="TaskFlow home">
                            <Image src="/assets/taskflow-logo-modern.png" alt="TaskFlow" width={130} height={25} priority className="h-auto w-[126px] object-contain" />
                        </Link>

                        <div className="inline-flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[.08em] text-[var(--muted)] [&_button]:grid [&_button]:h-9 [&_button]:w-9 [&_button]:cursor-pointer [&_button]:place-items-center [&_button]:rounded-[11px] [&_button]:border [&_button]:border-[var(--border)] [&_button]:bg-[var(--input)] [&_button]:text-[var(--text)] [&_button]:shadow-sm [&_svg]:h-4 [&_svg]:w-4">
                            <span className="hidden sm:inline">Appearance</span>
                            <ThemeToggle />
                        </div>
                    </div>

                    <div className="my-auto grid w-full place-items-center py-4 [@media(max-height:700px)]:py-2">
                        <LoginForm />
                    </div>

                    <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[9px] font-medium text-[var(--muted)] [@media(max-height:700px)]:mt-1">
                        <LockKeyhole size={12} /> Protected by encrypted sessions and workspace-level access controls.
                    </p>
                </section>
            </section>
        </main>
    );
}
