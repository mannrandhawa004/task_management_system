/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { X, QrCode, Check, Loader2, Smartphone, AlertTriangle, ShieldCheck, Lock } from "lucide-react";
import { generate2FAThunk, verify2FASetupThunk, disable2FAThunk } from "@/features/auth/thunks/authThunk";
import { showToast } from "@/lib/toast";

export default function TwoFactorModal({ open, onClose, isEnabled = false }) {
  const dispatch = useDispatch();
  
  // State for setup
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);

  // State for disable
  const [password, setPassword] = useState("");
  const [disableLoading, setDisableLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (!isEnabled && !secret) {
      // Initiate 2FA generation to get QR Code
      const fetchQrCode = async () => {
        try {
          setLoading(true);
          const res = await dispatch(generate2FAThunk()).unwrap();
          setQrCodeUrl(res.qrCodeUrl);
          setSecret(res.secret);
        } catch (err) {
          showToast.error(err || "Failed to generate QR code for Microsoft Authenticator");
          onClose();
        } finally {
          setLoading(false);
        }
      };
      fetchQrCode();
    }
  }, [open, isEnabled, secret, dispatch, onClose]);

  const handleVerifySetup = async (e) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length < 6) {
      return showToast.error("Please enter the 6-digit code from Microsoft Authenticator");
    }

    try {
      setVerifyLoading(true);
      await dispatch(verify2FASetupThunk({ secret, token: verificationCode })).unwrap();
      showToast.success("Two-Factor Authentication is now active!");
      onClose();
    } catch (err) {
      showToast.error(err || "Invalid verification code. Please try again.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleDisable = async (e) => {
    e.preventDefault();
    if (!password) {
      return showToast.error("Please enter your account password");
    }

    try {
      setDisableLoading(true);
      await dispatch(disable2FAThunk(password)).unwrap();
      showToast.success("Two-Factor Authentication has been disabled.");
      onClose();
    } catch (err) {
      showToast.error(err || "Incorrect password. Failed to disable 2FA.");
    } finally {
      setDisableLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* MODAL DIALOG */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto relative w-full max-w-3xl overflow-hidden rounded-[28px] border shadow-2xl animate-in zoom-in-95 duration-200 backdrop-blur-xl"
          style={{ background: "var(--card)", borderColor: "var(--border)", boxShadow: "var(--shadow)" }}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between px-8 py-5 border-b sticky top-0 bg-[var(--card)] z-10" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--primary)]/10 text-[var(--primary)] shadow-sm">
                <ShieldCheck className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <div>
                <h2 className="text-base font-semibold tracking-tight text-[var(--text)]">
                  {isEnabled ? "Disable Two-Factor Authentication" : "Set Up Two-Factor Authentication"}
                </h2>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  {isEnabled ? "Manage your account security protection" : "Protect your account with Microsoft Authenticator"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--text)] transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* BODY (2-COLUMN HORIZONTAL GRID) */}
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[420px] divide-y md:divide-y-0 md:divide-x" style={{ borderColor: "var(--border)" }}>
            {!isEnabled ? (
              /* ================= SETUP FLOW ================= */
              <>
                {/* LEFT COLUMN: STEP-BY-STEP GUIDE */}
                <div className="md:col-span-6 p-8 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text)] mb-6">How to connect your app</h3>
                    <div className="space-y-5">
                      <div className="flex gap-3.5">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-semibold">1</div>
                        <div>
                          <p className="text-xs font-semibold text-[var(--text)]">Get Microsoft Authenticator</p>
                          <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed">Download the app from the iOS App Store or Google Play Store.</p>
                        </div>
                      </div>

                      <div className="flex gap-3.5">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-semibold">2</div>
                        <div>
                          <p className="text-xs font-semibold text-[var(--text)]">Add a new account</p>
                          <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed">In the app, tap <span className="text-[var(--text)] font-medium">+ Add account</span> &rarr; <span className="text-[var(--text)] font-medium">Work or school account</span>.</p>
                        </div>
                      </div>

                      <div className="flex gap-3.5">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-semibold">3</div>
                        <div>
                          <p className="text-xs font-semibold text-[var(--text)]">Scan the QR code</p>
                          <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed">Select <span className="text-[var(--text)] font-medium">Scan a QR code</span> and point your camera at the screen.</p>
                        </div>
                      </div>

                      <div className="flex gap-3.5">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-semibold">4</div>
                        <div>
                          <p className="text-xs font-semibold text-[var(--text)]">Enter verification code</p>
                          <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed">Type the 6-digit code generated by the app to activate 2FA.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--input)]/50 p-3.5 text-xs text-[var(--muted)]">
                    <ShieldCheck className="h-5 w-5 text-[var(--primary)] shrink-0" />
                    <span>2FA protects your workspace even if your password is compromised.</span>
                  </div>
                </div>

                {/* RIGHT COLUMN: QR SCANNER & VERIFICATION */}
                <div className="md:col-span-6 p-8 flex flex-col justify-between bg-black/[0.01] dark:bg-white/[0.01]">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-[var(--muted)] py-16">
                      <Loader2 className="h-7 w-7 animate-spin text-[var(--primary)]" />
                      <p className="text-xs font-medium">Generating secure QR code...</p>
                    </div>
                  ) : (
                    <form onSubmit={handleVerifySetup} className="flex flex-col justify-between h-full space-y-6">
                      <div className="flex flex-col items-center justify-center py-2">
                        <div className="relative rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm transition-all hover:shadow-md">
                          {qrCodeUrl ? (
                            <img src={qrCodeUrl} alt="QR Code" className="h-44 w-44 object-contain" />
                          ) : (
                            <div className="flex h-44 w-44 items-center justify-center text-xs text-neutral-400">Loading QR...</div>
                          )}
                        </div>
                        <span className="mt-3.5 flex items-center gap-1.5 text-xs font-medium text-[var(--muted)]">
                          <QrCode className="h-3.5 w-3.5 text-[var(--primary)]" />
                          Scan with your phone camera
                        </span>
                      </div>

                      <div className="space-y-2 pt-2">
                        <label className="block text-xs font-medium text-[var(--text)]">
                          Verification code
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="000000"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                          className="w-full rounded-xl border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-center text-lg font-mono font-semibold tracking-[0.45em] text-[var(--text)] outline-none transition-all placeholder:tracking-normal placeholder:text-[var(--muted)]/40 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 shadow-inner"
                          required
                          autoFocus
                        />
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
                        <button
                          type="button"
                          onClick={onClose}
                          className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-xs font-semibold text-[var(--text)] transition-colors hover:bg-[var(--hover)] active:scale-95 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={verifyLoading || verificationCode.length < 6}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                          {verifyLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          Activate 2FA
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </>
            ) : (
              /* ================= DISABLE FLOW ================= */
              <>
                {/* LEFT COLUMN: SECURITY NOTICE */}
                <div className="md:col-span-6 p-8 flex flex-col justify-between">
                  <div className="space-y-6">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text)]">Security Downgrade Notice</h3>
                    <div className="space-y-5 text-xs">
                      <div className="flex gap-3.5">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500 text-xs font-semibold">1</div>
                        <div>
                          <p className="font-semibold text-[var(--text)]">Reduced Account Protection</p>
                          <p className="text-[var(--muted)] mt-0.5 leading-relaxed">Without 2FA, your account relies solely on your password, leaving it more vulnerable to unauthorized access.</p>
                        </div>
                      </div>
                      <div className="flex gap-3.5">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500 text-xs font-semibold">2</div>
                        <div>
                          <p className="font-semibold text-[var(--text)]">Password-Only Login</p>
                          <p className="text-[var(--muted)] mt-0.5 leading-relaxed">You will no longer be asked for a verification code when signing in from new devices or browsers.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-3.5 text-xs text-[var(--muted)]">
                    <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                    <span>We recommend keeping Two-Factor Authentication enabled for optimal workspace security.</span>
                  </div>
                </div>

                {/* RIGHT COLUMN: PASSWORD CONFIRMATION */}
                <div className="md:col-span-6 p-8 flex flex-col justify-between bg-black/[0.01] dark:bg-white/[0.01]">
                  <form onSubmit={handleDisable} className="flex flex-col justify-between h-full space-y-6">
                    <div className="space-y-5">
                      <div className="rounded-2xl border border-[var(--border)] bg-[var(--input)]/50 p-4">
                        <h4 className="text-xs font-semibold text-[var(--text)]">Confirm your identity</h4>
                        <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">Please enter your current account password to authorize turning off two-factor authentication.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-[var(--text)]">
                          Account password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
                          <input
                            type="password"
                            placeholder="Enter current password..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-xl border border-[var(--border)] bg-[var(--input)] pl-10 pr-4 py-3 text-xs font-medium text-[var(--text)] outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-500/20 shadow-inner"
                            required
                            autoFocus
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
                      <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-xs font-semibold text-[var(--text)] transition-colors hover:bg-[var(--hover)] active:scale-95 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={disableLoading || !password}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-red-500 active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        {disableLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
                        Turn off 2FA
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
