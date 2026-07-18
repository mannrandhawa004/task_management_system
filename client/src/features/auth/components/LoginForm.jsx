"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Building2,
    Eye,
    EyeOff,
    KeyRound,
    Loader2,
    LockKeyhole,
    Mail,
    ShieldCheck,
    UserPlus,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import { loginSchema } from "../validations/auth.validation";
import { loginThunk, verify2FALoginThunk } from "@/features/auth/thunks/authThunk";
import { showToast } from "@/lib/toast";

function FieldError({ id, message }) {
    if (!message) return null;

    return (
        <p id={id} className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-rose-500" role="alert">
            <AlertCircle size={13} />
            {message}
        </p>
    );
}

export default function LoginForm({ initialWorkspace = "" }) {
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState("login");
    const [tempToken, setTempToken] = useState(null);
    const [otp, setOtp] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);

    const dispatch = useDispatch();
    const router = useRouter();
    const { loading } = useSelector((state) => state.auth);
    const signupUrl = `${process.env.NEXT_PUBLIC_LANDING_URL || "http://localhost:5173"}/signup`;

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            tenantSlug: initialWorkspace,
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data) => {
        const response = await dispatch(loginThunk(data));

        if (loginThunk.fulfilled.match(response)) {
            localStorage.setItem("active_tenant_slug", data.tenantSlug);
            if (response.payload?.requires2FA) {
                setTempToken(response.payload.tempToken);
                setStep("2fa");
                showToast.success("2FA Required", "Enter the code from Microsoft Authenticator");
                return;
            }

            router.push("/dashboard");
            showToast.success("Login Success", "Welcome back.");
        } else {
            showToast.error("Login Failed", response.payload || "Invalid email or password");
        }
    };

    const handle2FASubmit = async (event) => {
        event.preventDefault();
        if (!otp || otp.length < 6) {
            showToast.error("Invalid Code", "Please enter a valid 6-digit code");
            return;
        }

        try {
            setOtpLoading(true);
            const response = await dispatch(verify2FALoginThunk({ tempToken, otp }));

            if (verify2FALoginThunk.fulfilled.match(response)) {
                const workspaceSlug = response.payload?.tenantSlug || getValues("tenantSlug");
                if (workspaceSlug) localStorage.setItem("active_tenant_slug", workspaceSlug);
                router.push("/dashboard");
                showToast.success("Login Success", "Identity verified. Welcome back!");
            } else {
                showToast.error("Verification Failed", response.payload || "Invalid verification code");
            }
        } finally {
            setOtpLoading(false);
        }
    };

    const goBackToLogin = () => {
        setStep("login");
        setOtp("");
        setTempToken(null);
    };

    if (step === "2fa") {
        return (
            <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-right-3 duration-500">
                <div
                    className="mb-4 grid h-12 w-12 place-items-center rounded-[14px] border"
                    style={{
                        color: "var(--primary)",
                        background: "color-mix(in srgb, var(--primary) 11%, transparent)",
                        borderColor: "color-mix(in srgb, var(--primary) 24%, var(--border))",
                    }}
                >
                    <ShieldCheck size={22} strokeWidth={1.8} />
                </div>

                <div className="mb-5">
                    <span
                        className="mb-3 inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.16em]"
                        style={{ color: "var(--primary)" }}
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] shadow-[0_0_0_5px_var(--ring)]" />
                        Identity checkpoint
                    </span>
                    <h1 className="text-[30px] font-bold leading-[1.05] tracking-[-0.045em] sm:text-[36px]" style={{ color: "var(--text)" }}>
                        Verify it&apos;s you.
                    </h1>
                    <p className="mt-2 max-w-md text-[13px] font-medium leading-5" style={{ color: "var(--muted)" }}>
                        Enter the six-digit code from Microsoft Authenticator to finish signing in securely.
                    </p>
                </div>

                <form onSubmit={handle2FASubmit} className="space-y-4">
                    <div>
                        <div className="mb-2.5 flex items-center justify-between">
                            <label htmlFor="otp-code" className="text-xs font-bold" style={{ color: "var(--text)" }}>
                                Verification code
                            </label>
                            <span className="text-[10px] font-semibold" style={{ color: "var(--muted)" }}>
                                {otp.length}/6 digits
                            </span>
                        </div>

                        <input
                            id="otp-code"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            autoComplete="one-time-code"
                            maxLength={6}
                            value={otp}
                            onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
                            placeholder="000000"
                            autoFocus
                            className="h-[56px] w-full rounded-xl border px-4 text-center text-xl font-black tracking-[0.42em] outline-none transition-all placeholder:opacity-35"
                            style={{
                                background: "var(--input)",
                                borderColor: "var(--border)",
                                color: "var(--text)",
                            }}
                        />

                        <div className="mt-3 grid grid-cols-6 gap-2" aria-hidden="true">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <span
                                    key={index}
                                    className="h-1 rounded-full transition-colors"
                                    style={{ background: index < otp.length ? "var(--primary)" : "var(--border)" }}
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={otpLoading || otp.length < 6}
                        className="group flex h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-[13px] font-extrabold text-white shadow-[0_18px_36px_-16px_var(--primary)] transition duration-300 hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ background: "var(--primary)" }}
                    >
                        {otpLoading ? (
                            <><Loader2 size={17} className="animate-spin" /> Verifying code...</>
                        ) : (
                            <>Verify and continue <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={goBackToLogin}
                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-colors hover:text-[var(--text)]"
                        style={{ color: "var(--muted)" }}
                    >
                        <ArrowLeft size={15} /> Back to sign in
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-right-3 duration-700">
            <div className="mb-5">
                <span
                    className="mb-3 inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.16em]"
                    style={{ color: "var(--primary)" }}
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] shadow-[0_0_0_5px_var(--ring)]" />
                    Secure workspace access
                </span>

                <h1 className="text-[32px] font-bold leading-[1.03] tracking-[-0.055em] sm:text-[38px]" style={{ color: "var(--text)" }}>
                    Welcome back.
                </h1>
                <p className="mt-2 max-w-md text-[13px] font-medium leading-5" style={{ color: "var(--muted)" }}>
                    Enter your workspace ID so TaskFlow can securely connect you to the correct tenant.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-[14px]" noValidate>
                <div>
                    <label htmlFor="login-workspace" className="mb-1.5 block text-[11px] font-bold" style={{ color: "var(--text)" }}>
                        Workspace ID
                    </label>

                    <div className="group/input relative">
                        <Building2
                            size={17}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] transition-colors group-focus-within/input:text-[var(--primary)]"
                        />
                        <input
                            id="login-workspace"
                            type="text"
                            autoComplete="organization"
                            spellCheck="false"
                            placeholder="acme-team"
                            aria-invalid={Boolean(errors.tenantSlug)}
                            aria-describedby={errors.tenantSlug ? "login-workspace-error" : "login-workspace-hint"}
                            {...register("tenantSlug", {
                                onChange: (event) => {
                                    event.target.value = event.target.value
                                        .toLowerCase()
                                        .replace(/[^a-z0-9-]/g, "");
                                },
                            })}
                            className="h-[46px] w-full rounded-xl border bg-[var(--input)] pl-11 pr-4 text-[13px] font-semibold text-[var(--text)] outline-none placeholder:font-medium placeholder:text-[var(--muted)] placeholder:opacity-60"
                            style={{ borderColor: errors.tenantSlug ? "rgb(244 63 94 / .7)" : "var(--border)" }}
                        />
                    </div>
                    <FieldError id="login-workspace-error" message={errors.tenantSlug?.message} />
                    {!errors.tenantSlug && (
                        <p id="login-workspace-hint" className="mt-1.5 text-[10px] font-medium text-[var(--muted)]">
                            The name before <b>.taskflow.io</b> in your workspace URL.
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="login-email" className="mb-1.5 block text-[11px] font-bold" style={{ color: "var(--text)" }}>
                        Work email
                    </label>

                    <div className="group/input relative">
                        <Mail
                            size={17}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] transition-colors group-focus-within/input:text-[var(--primary)]"
                        />
                        <input
                            id="login-email"
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            placeholder="you@company.com"
                            aria-invalid={Boolean(errors.email)}
                            aria-describedby={errors.email ? "login-email-error" : undefined}
                            {...register("email")}
                            className="h-[46px] w-full rounded-xl border bg-[var(--input)] pl-11 pr-4 text-[13px] font-semibold text-[var(--text)] outline-none placeholder:font-medium placeholder:text-[var(--muted)] placeholder:opacity-60"
                            style={{ borderColor: errors.email ? "rgb(244 63 94 / .7)" : "var(--border)" }}
                        />
                    </div>
                    <FieldError id="login-email-error" message={errors.email?.message} />
                </div>

                <div>
                    <div className="mb-1.5 flex items-center justify-between gap-4">
                        <label htmlFor="login-password" className="text-[11px] font-bold" style={{ color: "var(--text)" }}>
                            Password
                        </label>
                        <button
                            type="button"
                            onClick={() => showToast.info("Password help", "Contact your workspace administrator to reset access")}
                            className="cursor-pointer text-[11px] font-bold transition-opacity hover:opacity-70"
                            style={{ color: "var(--primary)" }}
                        >
                            Forgot password?
                        </button>
                    </div>

                    <div className="group/input relative">
                        <KeyRound
                            size={17}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] transition-colors group-focus-within/input:text-[var(--primary)]"
                        />
                        <input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            aria-invalid={Boolean(errors.password)}
                            aria-describedby={errors.password ? "login-password-error" : undefined}
                            {...register("password")}
                            className="h-[46px] w-full rounded-xl border bg-[var(--input)] pl-11 pr-12 text-[13px] font-semibold text-[var(--text)] outline-none placeholder:font-medium placeholder:text-[var(--muted)] placeholder:opacity-60"
                            style={{ borderColor: errors.password ? "rgb(244 63 94 / .7)" : "var(--border)" }}
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword((visible) => !visible)}
                            className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text)]"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            aria-pressed={showPassword}
                        >
                            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                    </div>
                    <FieldError id="login-password-error" message={errors.password?.message} />
                </div>

                <div className="flex items-center justify-between pt-0.5 text-xs">
                    <label className="flex cursor-pointer select-none items-center gap-2.5 font-semibold" style={{ color: "var(--muted)" }}>
                        <input
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 cursor-pointer rounded accent-[var(--primary)]"
                        />
                        Keep me signed in
                    </label>

                    <span className="hidden items-center gap-1.5 font-semibold sm:flex" style={{ color: "var(--muted)" }}>
                        <LockKeyhole size={13} /> Encrypted session
                    </span>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="group flex h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-[13px] font-extrabold text-white shadow-[0_18px_36px_-16px_var(--primary)] transition duration-300 hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ background: "var(--primary)" }}
                >
                    {loading ? (
                        <><Loader2 size={17} className="animate-spin" /> Signing you in...</>
                    ) : (
                        <>Sign in to workspace <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></>
                    )}
                </button>
            </form>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--input)] px-3.5 py-3">
                <span className="flex min-w-0 items-center gap-2 text-[10px] font-semibold text-[var(--muted)]">
                    <UserPlus className="shrink-0 text-[var(--primary)]" size={15} />
                    New workspace?
                </span>
                <a
                    href={signupUrl}
                    className="shrink-0 text-[10px] font-extrabold text-[var(--primary)] transition-opacity hover:opacity-70"
                >
                    Choose a plan and sign up
                </a>
            </div>

        </div>
    );
}
