"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";

export default function MicrosoftLoginPopup() {
  const [step, setStep] = useState<"email" | "password" | "loading">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "email" && email) {
      setStep("password");
    } else if (step === "password" && password) {
      setStep("loading");
      setTimeout(() => {
        // Send success message to parent window and close
        if (window.opener) {
          window.opener.postMessage({ type: "MOCK_MS_AUTH_SUCCESS", email }, "*");
        }
        window.close();
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f2f2f2] font-sans">
      <div className="w-full max-w-[440px] bg-white shadow-xl sm:p-11 p-8 rounded-sm">
        <div className="flex items-center mb-6">
          {/* Microsoft Logo & Text */}
          <svg width="24" height="24" viewBox="0 0 21 21">
            <path fill="#f25022" d="M1 1h9v9H1z"/>
            <path fill="#00a4ef" d="M1 11h9v9H1z"/>
            <path fill="#7fba00" d="M11 1h9v9h-9z"/>
            <path fill="#ffb900" d="M11 11h9v9h-9z"/>
          </svg>
          <span className="text-[#737373] font-semibold text-[21px] tracking-tight ml-2" style={{ fontFamily: '"Segoe UI", sans-serif' }}>
            Microsoft
          </span>
        </div>

        {step === "loading" ? (
          <div className="py-8 flex flex-col items-center justify-center">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-[#0067b8] rounded-full animate-spin mb-4" />
            <p className="text-slate-600 text-[15px]">Trying to sign you in</p>
          </div>
        ) : (
          <form onSubmit={handleNext}>
            {step === "email" && (
              <>
                <h2 className="text-[#1b1b1b] text-2xl font-semibold mb-3 tracking-tight">Sign in</h2>
                <div className="mb-4">
                  <input
                    type="email"
                    autoFocus
                    placeholder="Email, phone, or Skype"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-b border-black outline-none py-1.5 text-[15px] pb-2 focus:border-b-2 focus:border-[#0067b8] transition-colors"
                  />
                </div>
                <div className="text-[13px] mt-3">
                  <p>No account? <a href="#" className="text-[#0067b8] hover:underline">Create one!</a></p>
                  <p className="mt-4"><a href="#" className="text-[#0067b8] hover:underline">Can't access your account?</a></p>
                </div>
              </>
            )}

            {step === "password" && (
              <>
                <div className="flex items-center gap-2 mb-4 text-[#1b1b1b] text-[15px]">
                  <button type="button" onClick={() => setStep("email")} className="p-1 -ml-1 rounded-full hover:bg-slate-100 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  {email}
                </div>
                <h2 className="text-[#1b1b1b] text-2xl font-semibold mb-3 tracking-tight">Enter password</h2>
                <div className="mb-4">
                  <input
                    type="password"
                    autoFocus
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-b border-black outline-none py-1.5 text-[15px] pb-2 focus:border-b-2 focus:border-[#0067b8] transition-colors"
                  />
                </div>
                <div className="text-[13px] mt-3 mb-6">
                  <a href="#" className="text-[#0067b8] hover:underline">Forgot my password</a>
                </div>
              </>
            )}

            <div className="flex justify-end mt-8">
              <button
                type="submit"
                className="bg-[#0067b8] hover:bg-[#005da6] text-white px-8 py-1.5 font-semibold text-[15px] min-w-[108px] transition-colors"
              >
                Next
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="fixed bottom-6 right-8 flex gap-6 text-[12px] text-[#737373]">
        <a href="#" className="hover:text-[#1b1b1b]">Terms of use</a>
        <a href="#" className="hover:text-[#1b1b1b]">Privacy & cookies</a>
        <span className="font-bold tracking-widest text-[16px] leading-[12px]">...</span>
      </div>
    </div>
  );
}
