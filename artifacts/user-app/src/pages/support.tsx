import { useState } from "react";
import { useSendUserContactMessage } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useAuth } from "@/contexts/auth-context";

const MAX_MESSAGE_LENGTH = 5000;

export default function Support() {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const { mutate, isPending } = useSendUserContactMessage({
    mutation: {
      onSuccess: () => {
        setSubject("");
        setMessage("");
        setError("");
        setSent(true);
      },
      onError: (err: any) => {
        setSent(false);
        setError(err?.data?.error ?? "Your message could not be sent. Please try again.");
      },
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(false);
    setError("");
    mutate({ data: { subject: subject.trim(), message: message.trim() } });
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1100px] space-y-6 px-4 py-6 sm:px-6 lg:px-9 lg:py-8">
        <section className="sl-rise">
          <p className="sl-kicker mb-3 text-primary">Direct support channel</p>
          <h1 className="text-3xl font-semibold tracking-[-.06em] text-foreground sm:text-4xl">Message the admin.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Send a question or account request directly from your dashboard. The admin can reply to {user?.email ?? "your account email"}.
          </p>
        </section>

        <div className="max-w-3xl">
          <section className="sl-rise rounded-2xl border border-border bg-card p-5 sm:p-7">
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MessageIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Send a message</h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">Messages are sent securely to the Smartledger Premium Web3 admin email.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              {sent && (
                <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" />
                  Your message was sent successfully. The admin can reply to your account email.
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="message-subject" className="text-sm font-medium text-foreground">Subject</label>
                <input
                  id="message-subject"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-input px-3.5 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
                  placeholder="How can we help?"
                  minLength={3}
                  maxLength={120}
                  required
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="admin-message" className="text-sm font-medium text-foreground">Message</label>
                  <span className="text-[11px] text-muted-foreground">{message.length}/{MAX_MESSAGE_LENGTH}</span>
                </div>
                <textarea
                  id="admin-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="min-h-[190px] w-full resize-y rounded-xl border border-border bg-input px-3.5 py-3 text-sm leading-6 text-foreground outline-none transition focus:ring-2 focus:ring-ring"
                  placeholder="Tell the admin what you need help with..."
                  maxLength={MAX_MESSAGE_LENGTH}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                data-testid="button-send-admin-message"
              >
                {isPending ? "Sending..." : "Send message"}
                {!isPending && <ArrowIcon className="h-4 w-4" />}
              </button>
            </form>
          </section>

        </div>
      </div>
    </DashboardLayout>
  );
}

function MessageIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H8l-4 2v-4.5A7.5 7.5 0 1 1 20 11.5Z" /><path d="M8 11.5h.01M12 11.5h.01M16 11.5h.01" strokeLinecap="round" strokeWidth={2.4} /></svg>;
}

function CheckIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="m5 12 4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function ArrowIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M5 12h13M13 6l6 6-6 6" /></svg>;
}