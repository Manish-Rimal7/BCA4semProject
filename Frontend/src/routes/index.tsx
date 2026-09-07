import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ItemCard } from "../components/ItemCard";
import { EmptyState } from "../components/EmptyState";
import {
  Search,
  Plus,
  Filter,
  Heart,
  Sparkles,
  Gift,
  Recycle,
  Users,
  ArrowRight,
  ShieldCheck,
  MapPin,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "Re-Nest — Hyperlocal Community Giving & Reuse" }],
  }),
  component: IndexPage,
});

function IndexPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const fetchProducts = () => {
    fetch("http://localhost:8091/api/products/getProducts")
      .then((res) => res.json())
      .then((data) => {
        if (data.responseCode === 200 && Array.isArray(data.responseData)) {
          setItems(data.responseData);
        } else if (Array.isArray(data)) {
          setItems(data);
        }
      })
      .catch((err) => console.error("Failed to fetch products:", err))
      .finally(() => setLoading(false));
  };

  const fetchCategories = () => {
    fetch("http://localhost:8091/api/category/getAllCategories")
      .then((res) => res.json())
      .then((data) => {
        const predefined = [
          { name: "Cloths" },
          { name: "Books" },
          { name: "Electronics" },
          { name: "Furniture" },
        ];
        if (data.responseCode === 200 && Array.isArray(data.responseData)) {
          const dbCats = data.responseData;
          // Merge unique by name
          const merged = [...predefined];
          dbCats.forEach((c: any) => {
            if (!merged.some((m) => m.name.toLowerCase() === c.name.toLowerCase())) {
              merged.push(c);
            }
          });
          setCategories(merged);
        } else {
          setCategories(predefined);
        }
      })
      .catch((err) => console.error("Failed to fetch categories:", err));
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const INITIAL_VISIBLE_COUNT = 8; // 2 rows in 4-column grid
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [searchQuery, selectedCategory]);

  const filteredItems = items.filter((item: any) => {
    const name = item.productName || item.title || "";
    const cat = item.productCategory || item.category || "";
    const condition = item.condition || "";
    const desc = item.description || "";

    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      condition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      cat.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const visibleItems = filteredItems.slice(0, visibleCount);
  const hasMoreItems = visibleCount < filteredItems.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 8); // Add 2 more rows (+8 items)
  };

  const availableCount = items.filter((i) => i.status !== "given").length;
  const giftedCount = items.filter((i) => i.status === "given" || !!i.givenTo).length;

  return (
    <div className="min-h-screen">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900/10 via-background to-background py-16 md:py-24 border-b border-border/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/15 via-transparent to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-6 animate-in fade-in slide-in-from-bottom-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Hyperlocal Circular Giving Platform</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15] mb-6">
            Give More, Waste Less, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-800 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
              Build Better Communities.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            Re-Nest connects neighbours to share, donate, and re-home loved items freely. No money changes hands — just kindness and sustainability.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <Link
              to="/donate"
              className="inline-flex items-center gap-2.5 bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3.5 rounded-full font-semibold shadow-lg shadow-emerald-700/20 hover:shadow-emerald-700/30 transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              <span>Donate an Item</span>
            </Link>

            <a
              href="#community-feed"
              className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-6 py-3.5 rounded-full font-semibold border border-border transition-all"
            >
              <span>Explore Items Feed</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </a>
          </div>

          {/* STATS OVERLAY */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto pt-6 border-t border-border/60">
            <div className="p-3 rounded-2xl bg-card/60 backdrop-blur border border-border/80">
              <p className="text-2xl md:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">{items.length}</p>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Total Shared</p>
            </div>
            <div className="p-3 rounded-2xl bg-card/60 backdrop-blur border border-border/80">
              <p className="text-2xl md:text-3xl font-extrabold text-teal-700 dark:text-teal-400">{giftedCount}</p>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Successfully Gifted</p>
            </div>
            <div className="p-3 rounded-2xl bg-card/60 backdrop-blur border border-border/80">
              <p className="text-2xl md:text-3xl font-extrabold text-emerald-800 dark:text-emerald-300">100%</p>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Free & Hyperlocal</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 bg-muted/30 border-b border-border/60">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">How Re-Nest Works</h2>
            <p className="text-sm text-muted-foreground">Three simple steps to give and receive in your local neighbourhood.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative p-6 rounded-2xl bg-card border border-border/80 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xl mb-4">
                1
              </div>
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <Gift className="w-5 h-5 text-emerald-600" />
                List Your Item
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Snap a picture of books, electronics, furniture or clothes you no longer need and set your pickup location.
              </p>
            </div>

            <div className="relative p-6 rounded-2xl bg-card border border-border/80 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold text-xl mb-4">
                2
              </div>
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <Heart className="w-5 h-5 text-teal-600" />
                Neighbours Express Interest
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Interested locals submit a request explaining how the item will be helpful or meaningful to them.
              </p>
            </div>

            <div className="relative p-6 rounded-2xl bg-card border border-border/80 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/10 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xl mb-4">
                3
              </div>
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-700" />
                Hand Over Locally
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Choose the recipient whose purpose touches you most and pass it on with a smile!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* COMMUNITY FEED SECTION */}
      <section id="community-feed" className="py-16 container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>Available Near You</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Community Browse Feed</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Discover approved items donated by neighbours in your community.
            </p>
          </div>
          <Link
            to="/donate"
            className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-full font-medium text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            List a New Item
          </Link>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-card p-4 rounded-2xl border border-border shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search items by name, category, condition, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3.5 py-2.5 text-sm border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-emerald-600/40 capitalize font-medium"
            >
              <option value="all">All Categories ({items.length})</option>
              {categories.map((c: any) => (
                <option key={c._id || c.name} value={c.name.toLowerCase()}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* FEED GRID */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="h-72 bg-muted animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {visibleItems.map((item: any, idx: number) => (
                <ItemCard
                  key={item.UUID || item.id || item._id || idx}
                  item={item}
                  onInterestToggle={fetchProducts}
                />
              ))}
            </div>

            {/* VIEW MORE PAGINATION BUTTON */}
            {hasMoreItems && (
              <div className="mt-10 flex flex-col items-center justify-center">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-3.5 rounded-full font-semibold text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                  <span>View More Items</span>
                  <Plus className="w-4 h-4" />
                </button>
                <p className="text-xs text-muted-foreground mt-2.5 font-medium">
                  Showing {visibleItems.length} of {filteredItems.length} items
                </p>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="No items found"
            description="Try adjusting your search query or category filter, or be the first to list a new item!"
          />
        )}
      </section>

      {/* WHY Re-Nest / CALLOUT BANNER */}
      <section className="bg-emerald-900 text-white py-16 border-t border-emerald-800">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-800/80 text-emerald-300 flex items-center justify-center mx-auto mb-4 border border-emerald-700">
            <Recycle className="w-6 h-6" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to clear and make a difference?</h2>
          <p className="text-emerald-100 max-w-xl mx-auto text-base mb-8">
            Things move, no money changes hands. Built for neighbours, not shoppers. Join the movement today!
          </p>
          <Link
            to="/donate"
            className="inline-flex items-center gap-2 bg-white text-emerald-900 hover:bg-emerald-50 px-8 py-3.5 rounded-full font-bold shadow-lg transition-all"
          >
            <Plus className="w-5 h-5 text-emerald-700" />
            <span>Donate an Item Now</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

