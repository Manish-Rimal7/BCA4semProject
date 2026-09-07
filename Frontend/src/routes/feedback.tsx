import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ShieldAlert, Lightbulb, MessageSquare, Mail, Send, CheckCircle, ArrowUpRight, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [{ title: "Report & Suggestions — Re-Nest" }],
  }),
  component: FeedbackPage,
});

function FeedbackPage() {
  const { user } = useAuth();
  const [type, setType] = useState<"report" | "suggestion" | "feedback" | "inappropriate">("feedback");
  const [name, setName] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.mail || "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const API_URL = "http://localhost:8091/api";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/feedback/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("Re-Nest.token") || ""}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          type,
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const resData = await response.json();
      if (response.ok && (resData.responseCode === 200 || resData.responseCode === 201)) {
        toast.success("Thank you! Your feedback has been sent.");
        setSubmitted(true);
      } else {
        toast.error(resData.responseMessage || "Failed to submit feedback.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error connecting to server. You can also send an email directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const mailtoLink = `mailto:?subject=${encodeURIComponent(
    `[${type.toUpperCase()}] ${subject || "User Feedback"}`
  )}&body=${encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\nType: ${type}\n\nMessage:\n${message}`
  )}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* HEADER BANNER */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3">
          <Lightbulb className="w-4 h-4 text-emerald-600" />
          <span>We're Here to Help & Improve</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Report & Suggestions</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2 leading-relaxed">
          Found a bug, want to suggest a new feature, or report an inappropriate listing? Let us know directly below or send an email.
        </p>
      </div>

      {/* QUICK CHOICE TABS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <button
          type="button"
          onClick={() => setType("feedback")}
          className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${type === "feedback"
              ? "border-emerald-700 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 font-bold shadow-sm"
              : "border-border bg-card text-muted-foreground hover:bg-muted/40"
            }`}
        >
          <MessageSquare className="size-5 text-emerald-600" />
          <span className="text-xs">General Feedback</span>
        </button>

        <button
          type="button"
          onClick={() => setType("suggestion")}
          className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${type === "suggestion"
              ? "border-teal-700 bg-teal-500/10 text-teal-900 dark:text-teal-300 font-bold shadow-sm"
              : "border-border bg-card text-muted-foreground hover:bg-muted/40"
            }`}
        >
          <Lightbulb className="size-5 text-teal-600" />
          <span className="text-xs">Feature Suggestion</span>
        </button>

        <button
          type="button"
          onClick={() => setType("report")}
          className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${type === "report"
              ? "border-amber-700 bg-amber-500/10 text-amber-900 dark:text-amber-300 font-bold shadow-sm"
              : "border-border bg-card text-muted-foreground hover:bg-muted/40"
            }`}
        >
          <ShieldAlert className="size-5 text-amber-600" />
          <span className="text-xs">Report Bug/Issue</span>
        </button>

        <button
          type="button"
          onClick={() => setType("inappropriate")}
          className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${type === "inappropriate"
              ? "border-rose-700 bg-rose-500/10 text-rose-900 dark:text-rose-300 font-bold shadow-sm"
              : "border-border bg-card text-muted-foreground hover:bg-muted/40"
            }`}
        >
          <HelpCircle className="size-5 text-rose-600" />
          <span className="text-xs">Inappropriate Item</span>
        </button>
      </div>

      {/* MAIN FORM CARD */}
      <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm">
        {submitted ? (
          <div className="text-center py-10 space-y-4">
            <div className="size-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="size-10" />
            </div>
            <h3 className="text-2xl font-bold">Feedback Received!</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Thank you for reaching out. Our team will review your report/suggestion promptly.
            </p>
            <div className="pt-4">
              <Button
                onClick={() => {
                  setSubmitted(false);
                  setSubject("");
                  setMessage("");
                }}
                className="rounded-full bg-emerald-700 text-white"
              >
                Send Another Response
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manish Rimal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Your Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Subject / Summary *
              </label>
              <input
                type="text"
                required
                placeholder="Short summary of your feedback or report..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Detailed Message / Description *
              </label>
              <textarea
                required
                rows={5}
                placeholder="Provide clear details or steps so our team can assist you..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-xl border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
              {/* MAILTO FALLBACK BUTTON */}
              <a
                href={mailtoLink}
                className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-emerald-700 transition-colors font-medium"
              >
                <Mail className="size-4 text-emerald-600" />
                <span>Or send directly via email client</span>
                <ArrowUpRight className="size-3" />
              </a>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-8 py-2.5 shadow-sm"
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="mr-2 size-4" /> Send Report / Suggestion
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
