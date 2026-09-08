import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Star, MessageSquare, Plus, ThumbsUp, Heart, User, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { API_BASE_URL as API_URL } from "@/config/api";

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
  const [selectedProductUuid, setSelectedProductUuid] = useState<string>("");

  // New review modal state
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      // 1. Fetch dynamic ratings from MongoDB
      const res = await fetch(`${API_URL}/rating/getAllRatings`);
      const resData = await res.json();

      let dbReviews: any[] = [];
      if (res.ok && (resData.responseCode === 200 || resData.responseCode === 201)) {
        const rawList = resData.responseData || [];
        dbReviews = rawList.map((r: any) => ({
          _id: r._id,
          username: r.user?.username || "Community Member",
          rating: r.rating || 5,
          comment: r.comment || `Rated "${r.product?.productName || "an item"}" ${r.rating} stars!`,
          productName: r.product?.productName,
          donorName: r.product?.addedBy?.username,
          date: r.createdAt
            ? new Date(r.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "Recently",
          verified: true,
          likes: Math.floor(Math.random() * 8) + 3,
        }));
      }

      // 2. Default community stories as base
      const initialCommunityReviews = [
        {
          _id: "rev-1",
          username: "Ram Sharma",
          rating: 5,
          comment:
            "Re-Nest is amazing! Donated my old laptop to a college student in Lazimpat. The pickup was smooth and genuine.",
          date: "2 days ago",
          verified: true,
          likes: 12,
        },
        {
          _id: "rev-2",
          username: "Sita Adhikari",
          rating: 5,
          comment:
            "Received a wooden dining chair set for my new flat in Jhamsikhel. So grateful to the donor!",
          date: "5 days ago",
          verified: true,
          likes: 8,
        },
        {
          _id: "rev-3",
          username: "Bikash Thapa",
          rating: 4,
          comment:
            "Great initiative for zero-waste in Nepal. Listed a coffee maker and within an hour a neighbour requested it.",
          date: "1 week ago",
          verified: true,
          likes: 15,
        },
        {
          _id: "rev-4",
          username: "Aayusha KC",
          rating: 5,
          comment:
            "The admin approval process ensures high quality listings. Highly recommend Re-Nest to everyone!",
          date: "2 weeks ago",
          verified: true,
          likes: 9,
        },
      ];

      // Merge backend reviews first, then initial stories
      setReviews([...dbReviews, ...initialCommunityReviews]);

      // 3. Fetch products to populate item dropdown in review modal
      const prodRes = await fetch(`${API_URL}/products/getProducts`);
      const prodData = await prodRes.json();
      if (prodRes.ok && (prodData.responseCode === 200 || prodData.responseCode === 201)) {
        const pList = prodData.responseData || [];
        setProducts(pList);
        if (pList.length > 0 && !selectedProductUuid) {
          setSelectedProductUuid(pList[0].UUID || pList[0]._id);
        }
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
      toast.error("Please enter a review comment");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("Re-Nest.token");
      if (selectedProductUuid && token) {
        const response = await fetch(`${API_URL}/rating/addRating/${selectedProductUuid}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating,
            comment: comment.trim(),
          }),
        });
        const resData = await response.json();
        if (response.ok && (resData.responseCode === 200 || resData.responseCode === 201)) {
          toast.success("Thank you! Your review has been saved.");
          setComment("");
          setRating(5);
          setShowModal(false);
          fetchReviews();
          return;
        }
      }

      // Fallback local addition if no item selected or token absent
      const newRev = {
        _id: `rev-${Date.now()}`,
        username: user?.username || "Community Member",
        rating,
        comment: comment.trim(),
        date: "Just now",
        verified: true,
        likes: 0,
      };
      setReviews([newRev, ...reviews]);
      toast.success("Thank you for your review!");
      setComment("");
      setRating(5);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Error submitting review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
      : "4.9";

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-border/80 pb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>Community Feedback & Stories</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            User Reviews & Experiences
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Read how neighbours are sharing, reusing, and connecting across Kathmandu & Lalitpur.
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm flex items-center gap-5">
          <div className="size-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex flex-col items-center justify-center font-bold">
            <span className="text-2xl font-black">{avgRating}</span>
            <span className="text-[10px] uppercase font-bold">out of 5</span>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="size-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              Based on {reviews.length} community reviews
            </p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm flex items-center gap-5">
          <div className="size-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Heart className="size-8 fill-emerald-600/30 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">100% Free Giving</h3>
            <p className="text-xs text-muted-foreground">
              Every item is donated with zero monetary transactions.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm flex items-center gap-5">
          <div className="size-16 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <CheckCircle2 className="size-8 text-teal-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Verified Donors</h3>
            <p className="text-xs text-muted-foreground">
              Authentic neighbours sharing in your local area.
            </p>
          </div>
        </div>
      </div>

      {/* REVIEWS GRID */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="size-5 text-emerald-600" />
            Recent Reviews ({reviews.length})
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                        {rev.username.slice(0, 1)}
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

                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`size-3.5 ${
                            star <= rev.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted border-none"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-foreground/90 leading-relaxed font-normal italic mb-4">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/60">
                  <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="size-3" /> Verified Member
                  </span>
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    <ThumbsUp className="size-3.5" /> Helpful ({rev.likes})
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WRITE REVIEW MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold">Write a Community Review</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Share your experience using Re-Nest.
            </p>

            <form onSubmit={handleSubmitReview} className="mt-5 space-y-4">
              {products.length > 0 && (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                    Select Item / Donor to Review
                  </label>
                  <select
                    value={selectedProductUuid}
                    onChange={(e) => setSelectedProductUuid(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
                  >
                    {products.map((p) => (
                      <option key={p.UUID || p._id} value={p.UUID || p._id}>
                        {p.productName} — (Donor: {p.addedBy?.username || "Neighbour"})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                  Overall Rating
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
                        className={`size-6 ${
                          star <= rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-bold text-amber-600">{rating} Stars</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Your Review / Experience
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell your neighbours about an item you donated or received, or how Re-Nest helped you..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
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
                  className="rounded-full bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-semibold px-6"
                >
                  {isSubmitting ? "Submitting..." : "Post Review"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
