import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Sprout,
  Mail,
  Heart,
  MessageSquareText,
  ShieldAlert,
  ArrowUpRight,
  Send,
  X,
  CheckCircle,
  Lightbulb,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export function Footer() {
  const { user } = useAuth();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [type, setType] = useState<"report" | "suggestion" | "feedback" | "inappropriate">("feedback");
  const [name, setName] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.mail || "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const API_URL = "http://localhost:8091/api";

  const handleOpenFeedback = (defaultType: "report" | "suggestion" | "feedback" = "feedback") => {
    setType(defaultType);
    if (user) {
      setName(user.username || "");
      setEmail(user.mail || "");
    }
    setSubmitted(false);
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
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
    <>
      <footer className="border-t border-border bg-gradient-to-b from-card via-card to-muted/50 pt-16 pb-12 text-foreground">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            {/* Brand & Slogan Column */}
            <div className="md:col-span-1 space-y-4">
              <Link to="/" className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-xl bg-[image:var(--gradient-moss)]">
                  <Sprout className="size-5 text-white" />
                </span>
                <span className="font-display text-xl font-bold tracking-tight">Re-Nest</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A hyperlocal circular community platform. Re-home pre-loved items with neighbours freely — zero cost, zero waste.
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                <Heart className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                <span>Built for neighbours, not shoppers</span>
              </div>
            </div>

            {/* Quick Navigation Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Navigation</h4>
              <ul className="space-y-2.5 text-sm font-medium">
                <li>
                  <Link to="/" className="text-muted-foreground hover:text-emerald-700 transition-colors">
                    Browse Feed
                  </Link>
                </li>
                <li>
                  <Link to="/donate" className="text-muted-foreground hover:text-emerald-700 transition-colors">
                    Donate an Item
                  </Link>
                </li>
                <li>
                  <Link to="/requests" className="text-muted-foreground hover:text-emerald-700 transition-colors">
                    My Requests
                  </Link>
                </li>
                <li>
                  <Link to="/donations" className="text-muted-foreground hover:text-emerald-700 transition-colors">
                    My Donations
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="text-muted-foreground hover:text-emerald-700 transition-colors">
                    User Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Community & Feedback Shifted Right */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Community & Support</h4>
              <ul className="space-y-3 text-sm font-medium">
                <li>
                  <Link to="/reviews" className="inline-flex items-center gap-2 text-muted-foreground hover:text-emerald-700 transition-colors">
                    <MessageSquareText className="w-4 h-4 text-emerald-600" />
                    <span>Community Reviews</span>
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleOpenFeedback("report")}
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-amber-700 transition-colors text-left"
                  >
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Report & Suggestions</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
            <p>© {new Date().getFullYear()} Re-Nest — Things move, no money changes hands.</p>
            <div className="flex items-center gap-6 font-medium">
              <Link to="/reviews" className="hover:text-foreground">Reviews</Link>
              <button type="button" onClick={() => handleOpenFeedback("report")} className="hover:text-foreground">Report Issue</button>
            </div>
          </div>
        </div>
      </footer>

      {/* REPORT & SUGGESTION MODAL */}
      {showFeedbackModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setShowFeedbackModal(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 md:p-8 shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowFeedbackModal(false)}
              className="absolute right-5 top-5 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-5" />
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-extrabold flex items-center gap-2">
                <ShieldAlert className="size-5 text-emerald-600" />
                Report & Suggestions
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Let us know about an issue, suggest a feature, or report inappropriate listings.
              </p>
            </div>

            {/* TYPE TABS */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              <button
                type="button"
                onClick={() => setType("feedback")}
                className={`p-2.5 rounded-xl border text-center text-xs transition-all flex flex-col items-center gap-1 ${type === "feedback"
                    ? "border-emerald-700 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 font-bold"
                    : "border-border bg-background text-muted-foreground"
                  }`}
              >
                <MessageSquare className="size-4 text-emerald-600" />
                <span>Feedback</span>
              </button>

              <button
                type="button"
                onClick={() => setType("suggestion")}
                className={`p-2.5 rounded-xl border text-center text-xs transition-all flex flex-col items-center gap-1 ${type === "suggestion"
                    ? "border-teal-700 bg-teal-500/10 text-teal-900 dark:text-teal-300 font-bold"
                    : "border-border bg-background text-muted-foreground"
                  }`}
              >
                <Lightbulb className="size-4 text-teal-600" />
                <span>Suggest</span>
              </button>

              <button
                type="button"
                onClick={() => setType("report")}
                className={`p-2.5 rounded-xl border text-center text-xs transition-all flex flex-col items-center gap-1 ${type === "report"
                    ? "border-amber-700 bg-amber-500/10 text-amber-900 dark:text-amber-300 font-bold"
                    : "border-border bg-background text-muted-foreground"
                  }`}
              >
                <ShieldAlert className="size-4 text-amber-600" />
                <span>Report Bug</span>
              </button>

              <button
                type="button"
                onClick={() => setType("inappropriate")}
                className={`p-2.5 rounded-xl border text-center text-xs transition-all flex flex-col items-center gap-1 ${type === "inappropriate"
                    ? "border-rose-700 bg-rose-500/10 text-rose-900 dark:text-rose-300 font-bold"
                    : "border-border bg-background text-muted-foreground"
                  }`}
              >
                <HelpCircle className="size-4 text-rose-600" />
                <span>Item Issue</span>
              </button>
            </div>

            {submitted ? (
              <div className="text-center py-8 space-y-3">
                <div className="size-14 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="size-8" />
                </div>
                <h4 className="text-lg font-bold">Feedback Received!</h4>
                <p className="text-xs text-muted-foreground">
                  Thank you! Our admin team has received your message and will review it promptly.
                </p>
                <div className="pt-2">
                  <Button
                    onClick={() => setShowFeedbackModal(false)}
                    className="rounded-full bg-emerald-700 text-white text-xs px-6"
                  >
                    Close Window
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="ram10@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Subject / Summary *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Brief summary..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Message / Details *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide details so we can address your feedback..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-3 border-t border-border">
                  <a
                    href={mailtoLink}
                    className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-emerald-700 transition-colors font-medium"
                  >
                    <Mail className="size-3.5 text-emerald-600" />
                    <span>Or send via email</span>
                    <ArrowUpRight className="size-3" />
                  </a>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-6 py-2 shadow-sm"
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="mr-1.5 size-3.5" /> Submit
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
