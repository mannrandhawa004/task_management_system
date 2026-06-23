import LoginForm from "@/features/auth/components/LoginForm";
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";

export default function Home() {
  return (
    <main
      className="relative z-10 isolate flex min-h-screen items-center justify-center overflow-hidden px-6"
      style={{ background: "var(--bg)" }}
    >
      {/* background blobs */}
      <div
        className="absolute left-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full blur-3xl"
        style={{ background: "var(--blob-1)" }}
      />

      <div
        className="absolute bottom-[-150px] right-[-120px] h-[320px] w-[320px] rounded-full blur-3xl"
        style={{ background: "var(--blob-2)" }}
      />

      {/* theme switch */}
      <div className="absolute right-6 top-6 z-50">
        <ThemeToggle />
      </div>

      {/* container */}
      <div
        className="
    relative z-10
    w-full max-w-7xl
    overflow-hidden
    rounded-[36px]
    border
    lg:grid lg:grid-cols-[1.05fr_0.95fr]
    shadow-[0_30px_80px_rgba(0,0,0,0.12)]
  "
        style={{
          background: "var(--card)",
          borderColor: "var(--border)",
        }}
      >
        {/* LEFT */}
        <div className="relative hidden min-h-[700px] lg:block">
          {/* background image */}
          <img
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"
            alt="team collaboration"
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* overlay */}
          <div className="absolute inset-0 bg-black/50" />

          {/* content */}
          <div className="relative z-10 flex h-full flex-col justify-between p-14 text-white">
            <div>
              <h1 className="text-2xl font-semibold">TaskFlow</h1>

              <p className="mt-4 max-w-sm text-sm leading-7 text-zinc-200">
                Manage projects, tasks and teams with a modern workflow.
              </p>
            </div>

            <div>
              <h2 className="max-w-md text-5xl font-semibold leading-tight">
                Organize your work beautifully.
              </h2>

              <p className="mt-6 max-w-md text-base leading-7 text-zinc-200">
                Collaborate with your team, assign tasks and track progress in
                real time.
              </p>
            </div>
            {/* <div className="mt-10 flex gap-6">
              <div>
                <h4 className="text-3xl font-semibold">12k+</h4>
                <p className="text-zinc-300 text-sm">Active users</p>
              </div>

              <div>
                <h4 className="text-3xl font-semibold">98%</h4>
                <p className="text-zinc-300 text-sm">Delivery success</p>
              </div>
            </div> */}

            <p className="text-sm text-zinc-300">
              Built for productivity teams.
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center justify-center p-6 md:p-12">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
