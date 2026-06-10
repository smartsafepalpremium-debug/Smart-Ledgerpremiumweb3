import { useState } from "react";
import { useSubmitKyc } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useAuth } from "@/contexts/auth-context";

export default function Kyc() {
  const { user, updateUser } = useAuth();
  const [documentType, setDocumentType] = useState("passport");
  const [documentNumber, setDocumentNumber] = useState("");
  const [country, setCountry] = useState(user?.country ?? "");
  const [error, setError] = useState("");

  const isVerified = user?.status === "verified";

  const { mutate, isPending, isSuccess } = useSubmitKyc({
    mutation: {
      onSuccess: (data: any) => {
        updateUser({ ...user!, status: data.status });
      },
      onError: (err: any) => setError(err?.data?.error ?? "Submission failed"),
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!user) return;
    mutate({ data: { userId: user.id, documentType, documentNumber, country } });
  };

  return (
    <DashboardLayout>
      <div className="px-8 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">KYC Verification</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Verify your identity to unlock full features</p>
          </div>
          {isVerified && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-400/20 border border-green-400/30 text-green-400 text-xs font-semibold">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Verified
            </span>
          )}
        </div>

        {isVerified ? (
          <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-400/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-green-400">Identity Verified</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              Your identity has been successfully verified. You have access to all platform features.
            </p>
          </div>
        ) : isSuccess ? (
          <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-yellow-400/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-yellow-400">Under Review</h2>
            <p className="text-sm text-muted-foreground mt-2">Your KYC submission is being reviewed. This usually takes 1-2 business days.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-semibold text-foreground mb-5">Identity Documents</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="text-sm text-destructive">{error}</p>}

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Document type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "passport", label: "Passport" },
                      { value: "drivers_license", label: "Driver License" },
                      { value: "national_id", label: "National ID" },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setDocumentType(value)}
                        className={`py-2 px-2 rounded-lg border text-xs font-medium transition-all ${documentType === value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Document number</label>
                  <input
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter your document number"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Country of issuance</label>
                  <input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="United States"
                    required
                  />
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 text-xs text-muted-foreground">
                  Your information is encrypted and stored securely. We comply with all privacy regulations.
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {isPending ? "Submitting..." : "Submit for Verification"}
                </button>
              </form>
            </div>

            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Why verify?</h3>
                <div className="space-y-3">
                  {[
                    { icon: "✓", text: "Higher deposit and withdrawal limits" },
                    { icon: "✓", text: "Access to investment plans" },
                    { icon: "✓", text: "Eligibility for loans" },
                    { icon: "✓", text: "Enhanced account security" },
                    { icon: "✓", text: "Card order eligibility" },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                      <span className="text-primary font-bold">{icon}</span>
                      {text}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-sm font-semibold text-foreground mb-3">Verification steps</h3>
                {[
                  { step: "1", title: "Submit documents", desc: "Provide your government-issued ID details" },
                  { step: "2", title: "Under review", desc: "Our team reviews within 1-2 business days" },
                  { step: "3", title: "Verified", desc: "Full platform access unlocked" },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="flex gap-3 mb-3 last:mb-0">
                    <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-primary text-[10px] font-bold">{step}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{title}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
