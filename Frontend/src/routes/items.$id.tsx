import { useEffect, useState } from "react";
import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Users, Heart, ShieldCheck, Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { RatingStars } from "@/components/RatingStars";
import { StatusPill } from "@/components/StatusPill";
import { ItemCard } from "@/components/ItemCard";
import { InterestModal } from "@/components/InterestModal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { API_BASE_URL as API_URL } from "@/config/api";

export const Route = createFileRoute("/items/$id")({
  head: () => ({
    meta: [
      { title: "Item details — Re-Nest" },
      { name: "description", content: "View product details and express interest on Re-Nest." },
    ],
  }),
  component: ItemDetail,
});

function ItemDetail() {
  const { id } = useParams({ from: "/items/$id" });
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [adminActionLoading, setAdminActionLoading] = useState(false);
  const [relatedItems, setRelatedItems] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmittingInterest, setIsSubmittingInterest] = useState(false);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/products/getProducts/${id}`);
      const resData = await response.json();

      if (response.ok) {
        const itemObj =
          resData.responseData?.product ||
          (resData.responseData && Object.keys(resData.responseData).length > 0 && resData.responseData.productName ? resData.responseData : null) ||
          resData.responseMessage?.product ||
          (resData.responseMessage && typeof resData.responseMessage === "object" ? resData.responseMessage : null);

        if (itemObj) {
          setData(itemObj);

          // Fetch related items in same category
          if (itemObj.productCategory) {
            fetch(`${API_URL}/products/getProducts`)
              .then((res) => res.json())
              .then((allRes) => {
                const all = allRes.responseData || [];
                if (Array.isArray(all)) {
                  setRelatedItems(
                    all
                      .filter(
                        (p: any) =>
                          p.productCategory === itemObj.productCategory &&
                          (p.UUID ? p.UUID !== itemObj.UUID : p._id !== itemObj._id)
                      )
                      .slice(0, 3)
                  );
                }
              })
              .catch(console.error);
          }
        } else {
          toast.error("Item unavailable or deleted");
        }
      } else {
        toast.error("Item unavailable or deleted");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Network error while loading item");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const interestedList = data?.interestedUsers || [];
  const isInterested =
    user &&
    interestedList.some((u: any) => {
      const uObj = u?.user || u;
      return (uObj._id || uObj.id || uObj) === user.id || uObj.mail === user.mail;
    });

  const handleToggleInterest = async (purpose?: string) => {
    if (!user) {
      toast.error("Please log in to express interest");
      return;
    }

    setIsSubmittingInterest(true);
    try {
      const token = localStorage.getItem("Re-Nest.token");
      const response = await fetch(`${API_URL}/products/toggleInterest/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ purpose }),
      });

      const resData = await response.json();
      if (response.ok) {
        toast.success(!isInterested ? "Interest registered with purpose!" : "Interest removed");
        setIsModalOpen(false);
        fetchProduct();
      } else {
        toast.error(resData.responseMessage || "Failed to update interest");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error updating interest");
    } finally {
      setIsSubmittingInterest(false);
    }
  };

  const handleInterestButtonClick = () => {
    if (!user) {
      toast.error("Please log in to express interest");
      return;
    }
    if (isInterested) {
      handleToggleInterest();
    } else {
      setIsModalOpen(true);
    }
  };

  const handleRateProduct = async (newRating: number) => {
    if (!user) {
      toast.error("Please log in to submit a rating");
      return;
    }
    setIsSubmittingRating(true);
    try {
      const token = localStorage.getItem("Re-Nest.token");
      const response = await fetch(`${API_URL}/rating/addRating/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: newRating }),
      });

      const resData = await response.json();
      if (response.ok) {
        setRating(newRating);
        toast.success(`Rated ${newRating} star${newRating === 1 ? "" : "s"}!`);
        fetchProduct();
      } else {
        toast.error(resData.responseMessage || "Failed to rate item");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error submitting rating");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleAdminApprove = async () => {
    setAdminActionLoading(true);
    try {
      const token = localStorage.getItem("Re-Nest.token");
      const targetId = data?.UUID || data?._id || id;
      const res = await fetch(`${API_URL}/products/approveProduct/${targetId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await res.json();
      if (res.ok) {
        toast.success("Product approved! It is now visible to everyone on the feed.");
        fetchProduct();
      } else {
        toast.error(resData.responseMessage || "Failed to approve product");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error approving product");
    } finally {
      setAdminActionLoading(false);
    }
  };

  const handleAdminReject = async () => {
    setAdminActionLoading(true);
    try {
      const token = localStorage.getItem("Re-Nest.token");
      const targetId = data?.UUID || data?._id || id;
      const res = await fetch(`${API_URL}/products/rejectProduct/${targetId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await res.json();
      if (res.ok) {
        toast.success("Product approval revoked");
        fetchProduct();
      } else {
        toast.error(resData.responseMessage || "Failed to revoke product");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error rejecting product");
    } finally {
      setAdminActionLoading(false);
    }
  };

  const handleAdminDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setAdminActionLoading(true);
    try {
      const token = localStorage.getItem("Re-Nest.token");
      const targetId = data?.UUID || data?._id || id;
      const res = await fetch(`${API_URL}/products/deleteProduct/${targetId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await res.json();
      if (res.ok) {
        toast.success("Product deleted successfully");
        navigate({ to: "/admin" });
      } else {
        toast.error(resData.responseMessage || "Failed to delete product");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting product");
    } finally {
      setAdminActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-muted-foreground">
        Loading product details…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Item Not Found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This product might have been removed or does not exist.
        </p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/">Back to browse</Link>
        </Button>
      </div>
    );
  }

  const title = data.productName || data.title || "Untitled";
  const category = data.productCategory || data.category || "General";
  const condition = data.condition || "Good";
  const location = data.location || "Local";
  const description = data.description || "No description provided.";
  const image =
    data.productImage ||
    data.image ||
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=60";
  const status = data.status || "available";
  const donorName = data.addedBy?.username || "Community Member";
  const donorMail = data.addedBy?.mail || "";
  const avgRating = data.averageRating || 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to browse
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]">
            <img src={image} alt={title} className="aspect-[4/3] w-full object-cover" />
          </div>
          <div className="mt-6 rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">About this item</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Category</dt>
                <dd className="mt-1 font-medium">{category}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Condition</dt>
                <dd className="mt-1 font-medium">{condition}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Location</dt>
                <dd className="mt-1 font-medium">{location}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Interested</dt>
                <dd className="mt-1 font-medium">{interestedList.length} neighbours</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="space-y-6">
          {/* ADMIN MODERATION CONTROLS CARD */}
          {user?.role === "admin" && (
            <div className="rounded-2xl border-2 border-emerald-600/40 bg-emerald-500/5 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="size-5 text-emerald-700 dark:text-emerald-400" />
                <h3 className="font-bold text-sm text-emerald-950 dark:text-emerald-200">
                  Admin Moderation Controls
                </h3>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                <span>Product Approval Status:</span>
                {data.isApproved ? (
                  <span className="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 font-bold">
                    Approved & Live
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 font-bold">
                    Pending Admin Approval
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {!data.isApproved ? (
                  <Button
                    size="sm"
                    disabled={adminActionLoading}
                    onClick={handleAdminApprove}
                    className="flex-1 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs"
                  >
                    <Check className="mr-1 size-3.5" /> Approve Product
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={adminActionLoading}
                    onClick={handleAdminReject}
                    className="flex-1 rounded-full text-amber-600 border-amber-500/30 text-xs font-semibold hover:bg-amber-50 dark:hover:bg-amber-950/20"
                  >
                    <X className="mr-1 size-3.5" /> Revoke Approval
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={adminActionLoading}
                  onClick={handleAdminDelete}
                  className="rounded-full text-destructive text-xs hover:bg-destructive/10"
                  title="Delete product"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
            <StatusPill status={status} />
            <h1 className="mt-3 text-3xl leading-tight font-bold">{title}</h1>
            <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-4" /> {location}
              </span>
              <span className="inline-flex items-center gap-2">
                <Users className="size-4" /> {interestedList.length} neighbours interested
              </span>
            </div>

            <div className="mt-6 border-t border-border pt-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Given by</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-secondary font-semibold uppercase">
                  {donorName.slice(0, 1)}
                </span>
                <div>
                  <p className="font-medium">{donorName}</p>
                  {donorMail && <p className="text-xs text-muted-foreground">{donorMail}</p>}
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Button
                size="lg"
                onClick={handleInterestButtonClick}
                disabled={isSubmittingInterest}
                className={cn(
                  "w-full rounded-full transition-all duration-200",
                  isInterested
                    ? "bg-emerald-700 text-white hover:bg-emerald-800"
                    : "bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground border border-border/40"
                )}
              >
                <Heart className={cn("mr-2 size-4", isInterested && "fill-current text-white")} />
                {isInterested ? "You're Interested (Click to remove)" : "I'm Interested in this item"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Free. No money changes hands.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold">Rate this item</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Share your feedback to help neighbours know this donor is reliable.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <RatingStars
                value={rating || Math.round(avgRating)}
                size={26}
                interactive={!isSubmittingRating}
                onChange={handleRateProduct}
              />
              {rating > 0 && <span className="text-sm font-medium text-emerald-600">Rated {rating} stars!</span>}
            </div>
          </div>
        </div>
      </div>

      {relatedItems.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-semibold">More in {category}</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedItems.map((i) => (
              <ItemCard key={i.UUID || i.id || i._id} item={i} />
            ))}
          </div>
        </section>
      )}

      <InterestModal
        isOpen={isModalOpen}
        itemTitle={title}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(purpose) => handleToggleInterest(purpose)}
        loading={isSubmittingInterest}
      />
    </div>
  );
}
