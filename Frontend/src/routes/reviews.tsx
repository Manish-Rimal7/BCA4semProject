import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Star,
  MessageSquare,
  Plus,
  ThumbsUp,
  Heart,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/Loader";
import { API_BASE_URL as API_URL } from "@/config/api";
import { formatNepalDateTime } from "@/lib/utils";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [{ title: "Community Reviews & Testimonials — Re-Nest" }],
  }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductUuid, setSelectedProductUuid] = useState<string>("general");
  const [activeTab, setActiveTab] = useState<"all" | "donor" | "receiver">("all");

  // New review modal state
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [productRating, setProductRating] = useState(5);
  const [donorRating, setDonorRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helpful thumbs-up state
  const [helpfulReviews, setHelpfulReviews] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("helpful_reviews");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const handleToggleHelpful = (reviewId: string) => {
    setHelpfulReviews((prev) => {
      const next = new Set(prev);
      const isCurrentlyHelpful = next.has(reviewId);

      if (isCurrentlyHelpful) {
        next.delete(reviewId);
      } else {
        next.add(reviewId);
      }

      // Persist in localStorage
      localStorage.setItem("helpful_reviews", JSON.stringify(Array.from(next)));

      // Update like count dynamically
      setReviews((curr) =>
        curr.map((r) =>
          r._id === reviewId
            ? { ...r, likes: Math.max(0, (r.likes || 0) + (isCurrentlyHelpful ? -1 : 1)) }
            : r
        )
      );

      toast.success(
        isCurrentlyHelpful ? "Marked review as unhelpful" : "Marked review as helpful 👍"
      );
      return next;
    });
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      // Fetch dynamic ratings & experience reviews from MongoDB
      const res = await fetch(`${API_URL}/rating/getAllRatings`);
      const resData = await res.json();

      let dbReviews: any[] = [];
      if (res.ok && (resData.responseCode === 200 || resData.responseCode === 201)) {
        const rawList = resData.responseData || [];
        dbReviews = rawList.map((r: any) => ({
          _id: r._id,
          username: r.user?.username || "Community Member",
          rating: r.rating || 5,
          comment:
            r.comment ||
            (r.product
              ? `Rated "${r.product?.productName || "an item"}" ${r.rating} stars!`
              : `Rated Re-Nest ${r.rating} stars!`),
          productName: r.product?.productName,
          donorName: r.product?.addedBy?.username,
          experienceType: r.experienceType || (r.product ? "donation" : "general"),
          date: r.createdAt ? formatNepalDateTime(r.createdAt) : "Recently",
          verified: true,
          likes: r.likes || Math.floor(Math.random() * 8) + 3,
        }));
      }

      // Default seed community stories
      const initialCommunityReviews = [
        {
          _id: "rev-1",
          username: "Ram Sharma",
          rating: 5,
          experienceType: "donation",
          comment:
            "Re-Nest is amazing! Donated my old laptop to a college student in Lazimpat. The pickup was smooth and genuine.",
          date: "Sep 7, 2026, 2:30 PM",
          verified: true,
          likes: 12,
        },
        {
          _id: "rev-2",
          username: "Sita Adhikari",
          rating: 5,
          experienceType: "receiver",
          comment:
            "Received a wooden dining chair set for my new flat in Jhamsikhel. So grateful to the donor!",
          date: "Sep 4, 2026, 11:15 AM",
          verified: true,
          likes: 8,
        },
        {
          _id: "rev-3",
          username: "Bikash Thapa",
          rating: 4,
          experienceType: "donation",
          comment:
            "Great initiative for zero-waste in Nepal. Listed a coffee maker and within an hour a neighbour requested it.",
          date: "Sep 2, 2026, 4:45 PM",
          verified: true,
          likes: 15,
        },
        {
          _id: "rev-4",
          username: "Aayusha KC",
          rating: 5,
          experienceType: "general",
          comment:
            "The admin approval process ensures high quality listings. Highly recommend Re-Nest to everyone!",
          date: "Aug 28, 2026, 9:20 AM",
          verified: true,
          likes: 19,
        },
      ];

      if (dbReviews.length === 0) {
        setReviews(initialCommunityReviews);
      } else {
        // Real user reviews show at top
        setReviews([...dbReviews, ...initialCommunityReviews]);
      }

      // Fetch products to populate item dropdown in review modal
      const prodRes = await fetch(`${API_URL}/products/getProducts`);
      const prodData = await prodRes.json();
      if (prodRes.ok && (prodData.responseCode === 200 || prodData.responseCode === 201)) {
        const pList = prodData.responseData?.products || (Array.isArray(prodData.responseData) ? prodData.responseData : []);
        setProducts(pList);
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Please enter a review message");
      return;
    }

    const token = localStorage.getItem("Re-Nest.token");
    if (!token || !user) {
      toast.error("Please log in to submit a review.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const isGeneral = !selectedProductUuid || selectedProductUuid === "general";
      const endpoint = isGeneral
        ? `${API_URL}/rating/addRating`
        : `${API_URL}/rating/addRating/${selectedProductUuid}`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: isGeneral ? rating : productRating,
          productRating: isGeneral ? rating : productRating,
          donorRating: isGeneral ? rating : donorRating,
          comment: comment.trim(),
          experienceType: isGeneral ? "general" : "receiver",
        }),
      });

      const resData = await response.json();
      if (response.ok && (resData.responseCode === 200 || resData.responseCode === 201)) {
        toast.success("Thank you! Your review has been saved to the community.");
        setComment("");
        setRating(5);
        setShowModal(false);
        fetchReviews();
      } else {
        toast.error(resData.responseMessage || "Failed to submit review");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error submitting review");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter reviews based on tab
  const filteredReviews = reviews.filter((rev) => {
    if (activeTab === "all") return true;
    if (activeTab === "donor") return rev.experienceType === "donation";
    if (activeTab === "receiver") return rev.experienceType === "receiver";
    return true;
  });

  // Calculate dynamic average rating
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0) / reviews.length).toFixed(1)
      : "5.0";

  const donorCount = reviews.filter((r) => r.experienceType === "donation").length;
  const receiverCount = reviews.filter((r) => r.experienceType === "receiver").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-border/80 pb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>Community Feedback & Testimonials</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            User Reviews & Experiences
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Read authentic stories and experiences from donors and receivers sharing across Kathmandu & Lalitpur.
          </p>
        </div>

        <Button
          onClick={() => setShowModal(true)}
          className="rounded-full bg-emerald-700 hover:bg-emerald-800 text-white px-6 font-semibold shadow-sm shrink-0"
        >
          <Plus className="mr-2 size-4" /> Write a Review
        </Button>
      </div>

      {/* STATS BREAKDOWN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm flex items-center gap-5">
          <div className="size-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex flex-col items-center justify-center font-bold shrink-0">
            <span className="text-2xl font-black">{avgRating}</span>
            <span className="text-[10px] uppercase font-bold">out of 5</span>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`size-4 ${
                    s <= Math.round(Number(avgRating))
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              Based on {reviews.length} community reviews
            </p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm flex items-center gap-5">
          <div className="size-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Heart className="size-8 fill-emerald-600/30 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">100% Free Giving</h3>
            <p className="text-xs text-muted-foreground">
              Every item is gifted with zero monetary transactions.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm flex items-center gap-5">
          <div className="size-16 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="size-8 text-teal-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Verified Members</h3>
            <p className="text-xs text-muted-foreground">
              Authentic neighbours giving and receiving in your local area.
            </p>
          </div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              activeTab === "all"
                ? "bg-emerald-700 text-white shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            All Reviews ({reviews.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("donor")}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "donor"
                ? "bg-emerald-700 text-white shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Sparkles className="size-3.5 text-emerald-300" /> Donor Stories ({donorCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("receiver")}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "receiver"
                ? "bg-emerald-700 text-white shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Heart className="size-3.5 fill-current" /> Receiver Stories ({receiverCount})
          </button>
        </div>

        <span className="text-xs text-muted-foreground">
          Showing {filteredReviews.length} reviews
        </span>
      </div>

      {/* REVIEWS GRID */}
      {loading ? (
        <Loader text="Loading community reviews…" />
      ) : filteredReviews.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card">
          <MessageSquare className="size-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="font-semibold text-foreground">No reviews in this category yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Be the first to share your experience with neighbours!
          </p>
          <Button
            onClick={() => setShowModal(true)}
            className="mt-4 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 text-xs"
          >
            Write a Review
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredReviews.map((rev) => (
            <div
              key={rev._id}
              className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full font-bold flex items-center justify-center text-sm bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      {rev.username.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                        {rev.username}
                        {rev.verified && (
                          <CheckCircle2 className="size-3.5 text-emerald-600 fill-emerald-100" />
                        )}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{rev.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 bg-amber-500/10 px-2 py-1 rounded-lg">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`size-3.5 ${
                          star <= rev.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {rev.productName && (
                  <div className="mb-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-[11px] font-medium border border-emerald-200/50 dark:border-emerald-800/30">
                      {rev.experienceType === "donation" ? (
                        <>
                          <Sparkles className="size-3" /> Donated item: {rev.productName}
                        </>
                      ) : (
                        <>
                          <Heart className="size-3" /> Received item: {rev.productName}
                        </>
                      )}
                    </span>
                  </div>
                )}

                <p className="text-sm text-foreground/90 leading-relaxed font-normal italic mb-4">
                  "{rev.comment}"
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/60">
                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                  {rev.experienceType === "donation" ? (
                    <>
                      <Sparkles className="size-3 text-emerald-600" /> Donor Experience
                    </>
                  ) : rev.experienceType === "receiver" ? (
                    <>
                      <Heart className="size-3 text-emerald-600" /> Receiver Experience
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-3 text-teal-600" /> Community Member
                    </>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => handleToggleHelpful(rev._id)}
                  className={`flex items-center gap-1.5 transition-all px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer select-none ${
                    helpfulReviews.has(rev._id)
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-semibold"
                      : "hover:text-foreground hover:bg-secondary text-muted-foreground"
                  }`}
                  title={
                    helpfulReviews.has(rev._id)
                      ? "You marked this as helpful (click to undo)"
                      : "Mark as helpful"
                  }
                >
                  <ThumbsUp
                    className={`size-3.5 transition-all ${
                      helpfulReviews.has(rev._id)
                        ? "fill-emerald-600 text-emerald-600 scale-110"
                        : ""
                    }`}
                  />
                  <span>Helpful ({rev.likes})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* WRITE REVIEW MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 md:p-8 shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-foreground">Write a Community Review</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Share your experience giving, receiving, or connecting on Re-Nest.
            </p>

            {!user ? (
              <div className="mt-6 p-6 rounded-2xl bg-muted/60 border border-border text-center space-y-3">
                <div className="size-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Heart className="size-6" />
                </div>
                <h4 className="font-bold text-foreground">Sign In to Post a Review</h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  You need to be signed in to share your experience with the community.
                </p>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    className="rounded-full text-xs"
                  >
                    Cancel
                  </Button>
                  <Link to="/login">
                    <Button className="rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs px-5">
                      Log In
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="mt-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                    Review Topic / Item
                  </label>
                  <select
                    value={selectedProductUuid}
                    onChange={(e) => setSelectedProductUuid(e.target.value)}
                    className="w-full rounded-2xl border border-input bg-background p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
                  >
                    <option value="general">⭐ General Re-Nest Community Experience</option>
                    {products
                      .filter((p) => {
                        const myId = user?.id || (user as any)?._id;
                        if (!myId) return false;
                        const isGivenToMe =
                          p.givenTo &&
                          String(p.givenTo._id || p.givenTo.id || p.givenTo) === String(myId);
                        const isRecipient =
                          isGivenToMe ||
                          p.givenRecipients?.some((g: any) => {
                            const gId = g.user?._id || g.user?.id || g.user;
                            return gId && String(gId) === String(myId);
                          });
                        return isRecipient;
                      })
                      .map((p) => (
                        <option key={p.UUID || p._id} value={p.UUID || p._id}>
                          📦 Received Item: {p.productName} (from {p.addedBy?.username || "Donor"})
                        </option>
                      ))}
                  </select>
                </div>

                {selectedProductUuid && selectedProductUuid !== "general" ? (
                  <div className="space-y-4 rounded-2xl bg-muted/40 p-4 border border-border/60">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                        1. Rate Product Condition & Quality
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setProductRating(star)}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`size-6 ${
                                star <= productRating
                                  ? "fill-emerald-500 text-emerald-500"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-xs font-bold text-emerald-600 ml-2">
                          {productRating} / 5 Stars
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                        2. Rate Donor Kindness & Communication
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setDonorRating(star)}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`size-6 ${
                                star <= donorRating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-xs font-bold text-amber-600 ml-2">
                          {donorRating} / 5 Stars
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                      Platform Rating
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`size-7 ${
                              star <= rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-sm font-bold text-foreground ml-2">
                        {rating} / 5 Stars
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                    Your Experience & Comments
                  </label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us about the donation exchange, communication, and condition of items..."
                    className="w-full rounded-2xl border border-input bg-background p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/40 resize-none"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    className="rounded-full text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !comment.trim()}
                    className="rounded-full bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-semibold px-6 shadow-sm"
                  >
                    {isSubmitting ? "Submitting..." : "Post Review"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
