import LoginForm from "@/features/auth/components/LoginForm";
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";

export default function Home() {
  return (
    <main
      className="relative z-10 isolate flex min-h-screen items-center justify-center overflow-hidden p-4 sm:p-6"
      style={{ background: "var(--bg)" }}
    >
      {/* Subtle background glow */}
      <div
        className="absolute left-[10%] top-[15%] h-[300px] w-[300px] rounded-full blur-3xl opacity-50 pointer-events-none"
        style={{ background: "var(--blob-1)" }}
      />
      <div
        className="absolute bottom-[15%] right-[10%] h-[300px] w-[300px] rounded-full blur-3xl opacity-50 pointer-events-none"
        style={{ background: "var(--blob-2)" }}
      />

      {/* Theme Switcher Top Right */}
      <div className="absolute right-6 top-6 z-50">
        <ThemeToggle />
      </div>

      {/* Compact Container tailored for laptop screens */}
      <div
        className="relative z-10 w-full max-w-5xl overflow-hidden rounded-[28px] border lg:grid lg:grid-cols-[1.05fr_0.95fr] shadow-[0_20px_70px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_70px_rgba(0,0,0,0.35)] transition-all"
        style={{
          background: "var(--card)",
          borderColor: "var(--border)",
        }}
      >
        {/* LEFT SIDE: Simple & Clean Hero */}
        <div className="relative hidden lg:flex flex-col justify-between p-10 text-white overflow-hidden">
          {/* Background image */}
          <img
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"
            alt="Team collaboration"
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Simple overlay */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />

          {/* Content */}
          <div className="relative z-10 flex h-full flex-col justify-between py-2">
            <div>
              <h1 className="text-xl font-bold tracking-wide">TaskFlow</h1>
              <p className="mt-2 text-xs leading-relaxed text-zinc-300 max-w-xs">
                Manage projects, tasks and teams with a modern workflow.
              </p>
            </div>

            <div className="my-8">
              <h2 className="text-3xl xl:text-4xl font-bold leading-tight tracking-tight">
                Organize your work beautifully.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300 max-w-sm">
                Collaborate with your team, assign tasks and track progress in real time.
              </p>
            </div>

            <p className="text-xs font-medium text-zinc-400">
              Built for productivity teams.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: Compact Form */}
        <div className="flex items-center justify-center p-6 sm:p-8 lg:p-10">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
