import { useEffect, useState } from "react";
import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  MapPin,
  Users,
  Heart,
  ShieldCheck,
  Check,
  X,
  Trash2,
  Gift,
  MessageSquareQuote,
  CheckCircle2,
  Clock,
  Sparkles,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { RatingStars } from "@/components/RatingStars";
import { StatusPill } from "@/components/StatusPill";
import { ItemCard } from "@/components/ItemCard";
import { InterestModal } from "@/components/InterestModal";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/Loader";
import { useAuth } from "@/context/AuthContext";
import { cn, formatNepalDateTime } from "@/lib/utils";
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
  const [productRating, setProductRating] = useState(5);
  const [donorRating, setDonorRating] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [adminActionLoading, setAdminActionLoading] = useState(false);
  const [relatedItems, setRelatedItems] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmittingInterest, setIsSubmittingInterest] = useState(false);

  // Give item quantity modal state
  const [giveModal, setGiveModal] = useState<{
    isOpen: boolean;
    recipientId: string;
    recipientName: string;
    maxQuantity: number;
    amount: number;
  }>({
    isOpen: false,
    recipientId: "",
    recipientName: "",
    maxQuantity: 1,
    amount: 1,
  });
  const [isSubmittingGive, setIsSubmittingGive] = useState(false);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      const token = localStorage.getItem("token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const response = await fetch(`${API_URL}/products/getProducts/${id}`, { headers });
      const resData = await response.json();

      if (response.ok) {
        const itemObj =
          resData.responseData?.product ||
          (resData.responseData && Object.keys(resData.responseData).length > 0 && resData.responseData.productName ? resData.responseData : null) ||
          resData.responseMessage?.product ||
          (resData.responseMessage && typeof resData.responseMessage === "object" ? resData.responseMessage : null);

        if (itemObj) {
          setData(itemObj);

          // Fetch related items in same category on-demand
          if (itemObj.productCategory) {
            const excludeId = itemObj.UUID || itemObj._id || id;
            fetch(
              `${API_URL}/products/getProducts?category=${encodeURIComponent(itemObj.productCategory)}&limit=4&exclude=${encodeURIComponent(excludeId)}`
            )
              .then((res) => res.json())
              .then((allRes) => {
                const all = allRes.responseData?.products || allRes.responseData || [];
                if (Array.isArray(all)) {
                  setRelatedItems(all.slice(0, 3));
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
  const interestedCount = data?.interestedCount ?? interestedList.length;
  const isInterested = Boolean(
    data?.isInterested ||
    (user &&
      interestedList.some((u: any) => {
        const uObj = u?.user || u;
        return (uObj._id || uObj.id || uObj) === user.id;
      }))
  );

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

  const handleConfirmGive = async () => {
    if (!giveModal.recipientId) return;
    setIsSubmittingGive(true);
    try {
      const token = localStorage.getItem("Re-Nest.token");
      const targetId = data?.UUID || data?._id || id;
      const res = await fetch(`${API_URL}/products/giveProduct/${targetId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId: giveModal.recipientId,
          quantityToGive: giveModal.amount,
        }),
      });

      const resData = await res.json();
      if (res.ok && (resData.responseCode === 200 || resData.responseCode === 201)) {
        toast.success(resData.responseMessage || `Successfully given ${giveModal.amount} unit(s) to ${giveModal.recipientName}!`);
        const savedRecipientName = giveModal.recipientName;
        setGiveModal((prev) => ({ ...prev, isOpen: false }));
        fetchProduct();
      } else {
        toast.error(resData.responseMessage || "Failed to assign item");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error assigning item");
    } finally {
      setIsSubmittingGive(false);
    }
  };

  const handleRateProductAndDonor = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) {
      toast.error("Please log in to submit a rating");
      return;
    }
    if (isOwner) {
      toast.error("Donors cannot rate their own products");
      return;
    }
    if (!isReceiver) {
      toast.error("Only the recipient who received this item from the donor can rate this product and donor");
      return;
    }
    if (productRating < 1 || donorRating < 1) {
      toast.error("Please provide both a product rating and a donor rating (1 to 5 stars)");
      return;
    }
    setIsSubmittingRating(true);
    try {
      const token = localStorage.getItem("Re-Nest.token");
      const targetId = data?.UUID || data?._id || id;
      const response = await fetch(`${API_URL}/rating/addRating/${targetId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productRating,
          donorRating,
          rating: productRating,
          comment: ratingComment.trim(),
          experienceType: "receiver",
        }),
      });

      const resData = await response.json();
      if (response.ok && (resData.responseCode === 200 || resData.responseCode === 201)) {
        toast.success("Thank you! Your ratings for the product and donor have been submitted.");
        setRatingSubmitted(true);
        fetchProduct();
      } else {
        toast.error(resData.responseMessage || "Failed to submit rating");
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
    return <Loader text="Loading product details…" fullHeight />;
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
  const availableQuantity = typeof data.quantity === "number" ? data.quantity : 1;
  const initialQuantity = typeof data.initialQuantity === "number" ? data.initialQuantity : Math.max(availableQuantity, 1);
  const donorName = data.addedBy?.username || "Community Member";
  const avgRating = data.averageRating || 0;

  const myUserId = user?.id || (user as any)?._id;
  const isAdmin = Boolean(user && user.role === "admin");
  const isOwner = Boolean(
    user &&
      data.addedBy &&
      String(data.addedBy._id || data.addedBy.id || data.addedBy) === String(myUserId)
  );
  const isPrivileged = isOwner || isAdmin;

  const isReceiver = Boolean(
    user &&
      ((data.givenTo &&
        String(data.givenTo._id || data.givenTo.id || data.givenTo) === String(myUserId)) ||
        (data.givenRecipients &&
          data.givenRecipients.some((g: any) => {
            const gId = g.user?._id || g.user?.id || g.user;
            return gId && String(gId) === String(myUserId);
          })))
  );

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
            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-5">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Category</dt>
                <dd className="mt-1 font-medium">{category}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Condition</dt>
                <dd className="mt-1 font-medium">{condition}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Quantity</dt>
                <dd className="mt-1 font-semibold text-emerald-700 dark:text-emerald-400">
                  {availableQuantity > 0 ? (
                    <>
                      {availableQuantity} {availableQuantity === 1 ? "unit" : "units"}
                      {initialQuantity > availableQuantity && (
                        <span className="block text-[11px] font-normal text-muted-foreground">
                          ({availableQuantity} of {initialQuantity} left)
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-muted-foreground">0 units (All given)</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Location</dt>
                <dd className="mt-1 font-medium">{location}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Interested</dt>
                <dd className="mt-1 font-medium">{interestedCount} neighbours</dd>
              </div>
            </dl>
          </div>

          {/* INTERESTED NEIGHBOURS & MESSAGES SECTION - EXCLUSIVE TO DONOR & ADMIN */}
          {isPrivileged && (
            <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Heart className="size-5 text-emerald-600 fill-emerald-600" />
                    Interested Neighbours ({interestedList.length})
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Neighbours who expressed interest and shared how this item will help them.
                  </p>
                </div>
                {availableQuantity > 0 && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    {availableQuantity} unit{availableQuantity === 1 ? "" : "s"} to give
                  </span>
                )}
              </div>

              {interestedList.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center bg-secondary/20">
                  <Users className="size-8 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">No requests received yet</p>
                  <p className="text-xs text-muted-foreground/80 mt-1">
                    When neighbours request this item, their profile and message will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {interestedList.map((entry: any, index: number) => {
                    const uObj = entry?.user || entry;
                    const reqName = uObj?.username || "Neighbour";
                    const reqMail = isPrivileged && uObj ? uObj.mail : null;
                    const reqId = uObj?._id || uObj?.id || uObj;
                    const isCurrentRequester = user && String(user.id) === String(reqId);

                    return (
                      <div
                        key={reqId || index}
                        className={cn(
                          "rounded-xl border p-4 transition-all bg-card/80",
                          isCurrentRequester
                            ? "border-emerald-600/40 bg-emerald-500/5 shadow-xs"
                            : "border-border/80 hover:border-border"
                        )}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <span className="flex size-10 items-center justify-center rounded-full bg-emerald-700 text-white font-bold text-sm shrink-0 uppercase shadow-xs">
                              {reqName.slice(0, 1)}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-sm">{reqName}</p>
                                {isCurrentRequester && (
                                  <span className="rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold">
                                    You
                                  </span>
                                )}
                              </div>
                              {reqMail && (
                                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                                  {reqMail}
                                </p>
                              )}
                              <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                                <Clock className="size-3" />
                                <span>
                                  Requested {entry.interestedAt ? formatNepalDateTime(entry.interestedAt) : "recently"}
                                </span>
                              </p>
                            </div>
                          </div>

                          {/* GIVE BUTTON FOR OWNER */}
                          <div className="shrink-0 sm:self-center">
                            {availableQuantity > 0 ? (
                              <Button
                                size="sm"
                                onClick={() =>
                                  setGiveModal({
                                    isOpen: true,
                                    recipientId: reqId,
                                    recipientName: reqName,
                                    maxQuantity: availableQuantity,
                                    amount: 1,
                                  })
                                }
                                className="rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs"
                              >
                                <Gift className="mr-1.5 size-3.5" />
                                <span>Give / Assign Item</span>
                              </Button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                                <CheckCircle2 className="size-3" /> All units assigned
                              </span>
                            )}
                          </div>
                        </div>

                        {/* MESSAGE/PURPOSE BUBBLE */}
                        <div className="mt-3 rounded-lg bg-secondary/40 border border-border/50 p-3 flex items-start gap-2 text-xs">
                          <MessageSquareQuote className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <span className="font-semibold text-foreground/80 block text-[11px] uppercase tracking-wider mb-0.5">
                              Reason / Intended Use:
                            </span>
                            <p className="italic text-muted-foreground text-xs leading-relaxed">
                              {entry.purpose && entry.purpose.trim()
                                ? `"${entry.purpose.trim()}"`
                                : "No custom message was attached with this interest request."}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* UNITS GIVEN AWAY HISTORY (IF ANY) */}
          {data.givenRecipients && data.givenRecipients.length > 0 && (
            <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 shadow-sm">
              <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-2 mb-3">
                <CheckCircle2 className="size-5 text-emerald-600" />
                Handover & Gift History ({data.givenRecipients.length})
              </h3>
              <div className="space-y-2.5">
                {data.givenRecipients.map((g: any, i: number) => {
                  const gUser = g?.user || {};
                  const gName = gUser?.username || "A neighbour";
                  const gQty = g?.quantity || 1;
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl bg-background/90 border border-emerald-500/20 p-3 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex size-7 items-center justify-center rounded-full bg-emerald-700 text-white font-bold text-xs">
                          {gQty}
                        </span>
                        <div>
                          <p className="font-semibold text-foreground">
                            {gQty} {gQty === 1 ? "unit" : "units"} gifted to <strong>{gName}</strong>
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {g.givenAt ? formatNepalDateTime(g.givenAt) : "Recently"}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 text-[10px]">
                        Handed Over
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
            <div className="flex items-center gap-2">
              <StatusPill status={status} />
              {availableQuantity > 0 ? (
                <span className="rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold">
                  {availableQuantity} unit{availableQuantity === 1 ? "" : "s"} available
                </span>
              ) : (
                <span className="rounded-full bg-muted text-muted-foreground border border-border px-2.5 py-1 text-[11px] font-semibold">
                  Fully Gifted Away
                </span>
              )}
            </div>
            <h1 className="mt-3 text-3xl leading-tight font-bold">{title}</h1>
            <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-4" /> {location}
              </span>
              <span className="inline-flex items-center gap-2">
                <Users className="size-4" /> {interestedCount} neighbours interested
              </span>
            </div>

            {isPrivileged && data.addedBy && (
              <div className="mt-6 border-t border-border pt-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Donor Details (Privileged)</p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-secondary font-semibold uppercase">
                    {donorName.slice(0, 1)}
                  </span>
                  <div>
                    <p className="font-medium">{donorName}</p>
                    {data.addedBy.mail && (
                      <p className="text-xs text-muted-foreground">{data.addedBy.mail}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 space-y-3">
              {isOwner ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-center">
                  <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-1">
                    You Listed This Item
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Review the requests and messages from neighbours in the list and assign units directly.
                  </p>
                </div>
              ) : status === "given" || availableQuantity === 0 ? (
                <div className="rounded-xl border border-muted bg-muted/60 p-4 text-center">
                  <p className="text-sm font-semibold text-foreground">
                    This item has been fully given away!
                  </p>
                  {data.givenTo && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Assigned to: {data.givenTo.username || "a neighbour"}
                    </p>
                  )}
                </div>
              ) : (
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
              )}
              <p className="text-center text-xs text-muted-foreground">
                Free. No money changes hands.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold">Ratings & Feedback</h2>

            {isOwner ? (
              <div className="mt-2 space-y-2">
                <p className="text-xs text-muted-foreground">
                  As the donor, you cannot rate your own product. Here is the feedback from neighbours:
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <RatingStars
                    value={Math.round(avgRating) || 5}
                    size={24}
                    interactive={false}
                  />
                  <span className="text-xs font-semibold text-foreground">
                    {avgRating > 0
                      ? `${avgRating.toFixed(1)} / 5 Stars (from verified recipient)`
                      : "No recipient ratings yet"}
                  </span>
                </div>
              </div>
            ) : isReceiver ? (
              <div className="mt-3 space-y-4">
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-950 dark:text-emerald-200">
                  <span className="font-bold">🎉 You received this item from {donorName}!</span>
                  <p className="mt-0.5 text-muted-foreground">
                    As the verified recipient, you can rate both this product and the donor.
                  </p>
                </div>

                {ratingSubmitted ? (
                  <div className="rounded-xl bg-muted/60 p-4 text-center">
                    <p className="text-xs font-bold text-emerald-600">✓ Ratings successfully submitted!</p>
                    <p className="text-xs text-muted-foreground mt-1">Thank you for helping our community stay trusted and kind.</p>
                  </div>
                ) : (
                  <form onSubmit={handleRateProductAndDonor} className="space-y-4">
                    {/* Rate Product */}
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                        1. Rate Product Condition & Quality
                      </label>
                      <div className="flex items-center gap-2">
                        <RatingStars
                          value={productRating}
                          size={24}
                          interactive={!isSubmittingRating}
                          onChange={(val) => setProductRating(val)}
                        />
                        {productRating > 0 && (
                          <span className="text-xs font-bold text-emerald-600">
                            {productRating} / 5 Stars
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Rate Donor */}
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                        2. Rate Donor Kindness & Communication ({donorName})
                      </label>
                      <div className="flex items-center gap-2">
                        <RatingStars
                          value={donorRating}
                          size={24}
                          interactive={!isSubmittingRating}
                          onChange={(val) => setDonorRating(val)}
                        />
                        {donorRating > 0 && (
                          <span className="text-xs font-bold text-amber-600">
                            {donorRating} / 5 Stars
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Comment */}
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                        Review Message (optional)
                      </label>
                      <textarea
                        rows={2}
                        value={ratingComment}
                        onChange={(e) => setRatingComment(e.target.value)}
                        placeholder="Say thanks to the donor or comment on the item..."
                        className="w-full rounded-xl border border-input bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="sm"
                      disabled={isSubmittingRating || productRating < 1 || donorRating < 1}
                      className="rounded-full bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-semibold px-5"
                    >
                      {isSubmittingRating ? "Submitting..." : "Submit Ratings for Product & Donor"}
                    </Button>
                  </form>
                )}
              </div>
            ) : (
              <div className="mt-2 space-y-2">
                <p className="text-xs text-muted-foreground">
                  Only the recipient who received this item from the donor can submit ratings.
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <RatingStars
                    value={Math.round(avgRating) || 5}
                    size={24}
                    interactive={false}
                  />
                  <span className="text-xs font-semibold text-foreground">
                    {avgRating > 0
                      ? `${avgRating.toFixed(1)} / 5 Stars (from verified recipient)`
                      : "No recipient ratings yet"}
                  </span>
                </div>
              </div>
            )}
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

      {/* GIVE / ASSIGN QUANTITY MODAL */}
      {giveModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold">Assign Item to Neighbour</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Recipient: <strong className="text-foreground">{giveModal.recipientName}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGiveModal((prev) => ({ ...prev, isOpen: false }))}
                className="size-8 flex items-center justify-center rounded-full hover:bg-secondary text-muted-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {giveModal.maxQuantity > 1 ? (
              <div className="space-y-3 rounded-xl border border-border/80 bg-secondary/30 p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">Select Quantity to Give:</span>
                  <span className="text-muted-foreground">{giveModal.maxQuantity} units available</span>
                </div>
                <div className="flex items-center justify-center gap-3 py-2">
                  <button
                    type="button"
                    disabled={giveModal.amount <= 1}
                    onClick={() => setGiveModal((prev) => ({ ...prev, amount: Math.max(1, prev.amount - 1) }))}
                    className="size-10 flex items-center justify-center rounded-xl border border-border bg-background hover:bg-secondary font-bold text-lg disabled:opacity-50"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={giveModal.maxQuantity}
                    value={giveModal.amount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 1;
                      setGiveModal((prev) => ({
                        ...prev,
                        amount: Math.max(1, Math.min(val, prev.maxQuantity)),
                      }));
                    }}
                    className="w-20 text-center rounded-xl border border-border bg-background p-2 text-base font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
                  />
                  <button
                    type="button"
                    disabled={giveModal.amount >= giveModal.maxQuantity}
                    onClick={() => setGiveModal((prev) => ({ ...prev, amount: Math.min(prev.maxQuantity, prev.amount + 1) }))}
                    className="size-10 flex items-center justify-center rounded-xl border border-border bg-background hover:bg-secondary font-bold text-lg disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
                <p className="text-[11px] text-center text-muted-foreground">
                  {giveModal.maxQuantity - giveModal.amount > 0
                    ? `After giving, ${giveModal.maxQuantity - giveModal.amount} unit(s) will remain in the feed for other neighbours.`
                    : "This will give all remaining units and mark the item as fully gifted."}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Are you sure you want to give this item to <strong>{giveModal.recipientName}</strong>?
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 rounded-full"
                onClick={() => setGiveModal((prev) => ({ ...prev, isOpen: false }))}
                disabled={isSubmittingGive}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-sm"
                onClick={handleConfirmGive}
                disabled={isSubmittingGive}
              >
                {isSubmittingGive ? "Assigning..." : `Confirm & Give (${giveModal.amount} unit${giveModal.amount === 1 ? "" : "s"})`}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
