import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { ItemCard } from "@/components/ItemCard";
import { Button } from "@/components/ui/button";
import { Heart, Gift, Sparkles, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/requests")({
  head: () => ({
    meta: [{ title: "My Requests & Gifts — Re-Nest" }],
  }),
  component: () => (
    <ProtectedRoute>
      <MyRequestsPage />
    </ProtectedRoute>
  ),
});

function MyRequestsPage() {
  const { user } = useAuth();
  const [requestedProducts, setRequestedProducts] = useState<any[]>([]);
  const [giftedProducts, setGiftedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"requests" | "gifts">("requests");

  // Review modal state for receiver after process completion
  const [selectedProductForReview, setSelectedProductForReview] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  const API_URL = "http://localhost:8091/api";

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForReview) return;
    if (!reviewComment.trim()) {
      toast.error("Please enter a review message");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const token = localStorage.getItem("Re-Nest.token");
      const targetId = selectedProductForReview.UUID || selectedProductForReview._id;
      const response = await fetch(`${API_URL}/rating/addRating/${targetId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });

      const resData = await response.json();
      if (response.ok && (resData.responseCode === 200 || resData.responseCode === 201)) {
        toast.success("Review submitted! Thank you for sharing your feedback with the community.");
        setSelectedProductForReview(null);
        setReviewComment("");
        setReviewRating(5);
        fetchMyRequests();
      } else {
        toast.error(resData.responseMessage || "Failed to submit review");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error submitting review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const fetchMyRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("Re-Nest.token");
      const response = await fetch(`${API_URL}/products/myRequests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const resData = await response.json();
      if (response.ok && (resData.responseCode === 200 || resData.responseCode === 201)) {
        const data = resData.responseData || {};
        setRequestedProducts(data.requestedProducts || []);
        setGiftedProducts(data.giftedProducts || []);
      } else {
        toast.error(resData.responseMessage || "Failed to load requests");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error while loading requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-muted-foreground">
        Loading your requested items and gifts…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Requests & Gifts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track products you've expressed interest in and view items gifted directly to you.
          </p>
        </div>
        <Button asChild className="rounded-full">
          <Link to="/">Browse More Items</Link>
        </Button>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex border-b border-border/80 gap-6">
        <button
          type="button"
          onClick={() => setActiveTab("requests")}
          className={cn(
            "flex items-center gap-2 pb-3 text-sm font-semibold transition-all relative border-b-2 -mb-px",
            activeTab === "requests"
              ? "border-emerald-700 text-emerald-800 dark:text-emerald-400 font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Heart className={cn("size-4", activeTab === "requests" && "fill-current")} />
          <span>Requested Items</span>
          <span className="ml-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-bold text-foreground">
            {requestedProducts.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("gifts")}
          className={cn(
            "flex items-center gap-2 pb-3 text-sm font-semibold transition-all relative border-b-2 -mb-px",
            activeTab === "gifts"
              ? "border-emerald-700 text-emerald-800 dark:text-emerald-400 font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Gift className="size-4" />
          <span>Gifted to Me</span>
          <span className="ml-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 text-xs font-bold">
            {giftedProducts.length}
          </span>
        </button>
      </div>

      {/* Tab Content 1: Requested Items */}
      {activeTab === "requests" && (
        <div>
          {requestedProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <Heart className="mx-auto size-10 text-muted-foreground/50" />
              <h3 className="mt-4 text-base font-semibold">No active requests yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Browse our feed and click "I'm Interested" to request items from neighbours.
              </p>
              <Button asChild variant="outline" className="mt-5 rounded-full">
                <Link to="/">Explore Items</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {requestedProducts.map((p: any) => {
                const isGiftedToMe =
                  p.givenTo && (p.givenTo._id === user?.id || p.givenTo === user?.id || p.givenTo.mail === user?.mail);
                const isGiftedToOther = p.givenTo && !isGiftedToMe;

                // Find user's own stated purpose
                const myInterest = p.interestedUsers?.find((u: any) => {
                  const uObj = u?.user || u;
                  return (uObj._id || uObj.id || uObj) === user?.id || uObj.mail === user?.mail;
                });
                const myPurpose = myInterest?.purpose || "";

                return (
                  <div
                    key={p.UUID || p._id}
                    className="flex flex-col justify-between rounded-2xl border border-border bg-card p-4 shadow-sm"
                  >
                    <ItemCard item={p} onInterestToggle={fetchMyRequests} />

                    {/* Request Status Banner */}
                    <div className="mt-3 space-y-2">
                      {isGiftedToMe ? (
                        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-2.5 text-xs text-emerald-900 dark:text-emerald-300 font-semibold">
                          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                          <span>🎉 The donor gifted this item to you!</span>
                        </div>
                      ) : isGiftedToOther ? (
                        <div className="flex items-center gap-2 rounded-xl bg-amber-500/15 border border-amber-500/30 p-2.5 text-xs text-amber-900 dark:text-amber-300 font-medium">
                          <AlertCircle className="size-4 shrink-0 text-amber-600" />
                          <span>Assigned to another neighbour</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 rounded-xl bg-blue-500/10 border border-blue-500/20 p-2.5 text-xs text-blue-900 dark:text-blue-300 font-medium">
                          <Clock className="size-4 shrink-0 text-blue-600" />
                          <span>Pending donor decision</span>
                        </div>
                      )}

                      {/* Stated Purpose */}
                      {myPurpose ? (
                        <div className="rounded-xl border border-border/40 bg-muted/40 p-2.5 text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground uppercase tracking-wide text-[10px] block mb-0.5">
                            Your Stated Reason:
                          </span>
                          <p className="italic text-foreground">"{myPurpose}"</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 2: Gifted to Me */}
      {activeTab === "gifts" && (
        <div>
          {giftedProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <Gift className="mx-auto size-10 text-emerald-600/60" />
              <h3 className="mt-4 text-base font-semibold">No gifted items received yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                When a donor chooses your stated purpose for an item, it will appear here!
              </p>
              <Button asChild variant="outline" className="mt-5 rounded-full">
                <Link to="/">Request Items</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {giftedProducts.map((p: any) => {
                const donor = p.addedBy || {};
                return (
                  <div
                    key={p.UUID || p._id}
                    className="flex flex-col justify-between rounded-2xl border border-emerald-500/40 bg-card p-4 shadow-md relative overflow-hidden"
                  >
                    <div className="mb-3 flex items-center justify-between rounded-xl bg-emerald-500/15 p-2.5 text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                      <span className="flex items-center gap-1.5">
                        <Gift className="size-4 text-emerald-600" /> Gifted to You
                      </span>
                      <span className="text-[10px] uppercase font-bold bg-emerald-700 text-white px-2 py-0.5 rounded-full">
                        Completed
                      </span>
                    </div>

                    <ItemCard item={p} onInterestToggle={fetchMyRequests} />

                    <div className="mt-3 rounded-xl border border-border/50 bg-secondary/40 p-3 text-xs space-y-2">
                      <p className="font-semibold text-foreground">Donor Details:</p>
                      <p className="text-muted-foreground">
                        Given by: <span className="font-medium text-foreground">{donor.username || "Community Member"}</span>
                      </p>
                      {donor.mail && (
                        <p className="text-muted-foreground">
                          Contact: <span className="font-medium text-foreground">{donor.mail}</span>
                        </p>
                      )}

                      <Button
                        onClick={() => setSelectedProductForReview(p)}
                        size="sm"
                        className="mt-2 w-full rounded-full text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="size-3.5" /> Rate Donor & Leave Review
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* RATING & REVIEW MODAL FOR GIFT RECEIVER */}
      {selectedProductForReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setSelectedProductForReview(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="size-5 text-emerald-600" />
                  Rate Donor & Experience
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Item: <span className="font-semibold text-foreground">{selectedProductForReview.productName}</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleReviewSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                  Rating for Donor ({selectedProductForReview.addedBy?.username || "Donor"})
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Heart
                        className={`size-6 ${
                          star <= reviewRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-bold text-amber-600">{reviewRating} Stars</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Your Review / Thanks to Donor
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder={`Write your experience receiving "${selectedProductForReview.productName}"...`}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedProductForReview(null)}
                  className="rounded-full text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingReview || !reviewComment.trim()}
                  className="rounded-full bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-semibold px-6"
                >
                  {isSubmittingReview ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
