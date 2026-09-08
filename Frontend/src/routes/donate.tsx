import { useState, useRef, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { categories } from "@/lib/mock-data";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Field } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { API_BASE_URL as API_URL } from "@/config/api";

const conditions = ["New", "Like new", "Good", "Well loved"];

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Donate an item — Re-Nest" },
      {
        name: "description",
        content: "List something you no longer need and let a neighbour give it a second home.",
      },
      { property: "og:title", content: "Donate an item — Re-Nest" },
      { property: "og:description", content: "List something you no longer need, for free." },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <DonatePage />
    </ProtectedRoute>
  ),
});

function DonatePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Cloths");
  const [customCategory, setCustomCategory] = useState("");
  const [dbCategories, setDbCategories] = useState<string[]>([
    "Cloths",
    "Books",
    "Electronics",
    "Furniture",
  ]);
  const [condition, setCondition] = useState("Good");
  const [location, setLocation] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/category/getAllCategories`)
      .then((res) => res.json())
      .then((data) => {
        if (data.responseCode === 200 && Array.isArray(data.responseData)) {
          const names = data.responseData.map((c: any) => c.name);
          // Combine predefined categories with DB categories uniquely
          const combined = Array.from(
            new Set(["Cloths", "Books", "Electronics", "Furniture", ...names])
          );
          setDbCategories(combined);
          if (combined.length > 0) {
            setCategory(combined[0]);
          }
        }
      })
      .catch(console.error);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Donate an item</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Describe it honestly, wear and all. Someone will want it.
      </p>

      <form
        className="mt-8 space-y-6 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!title || !description || !location) {
            toast.error("Fill in every required field");
            return;
          }

          const selectedCategoryName =
            category === "__SUGGEST_NEW__" ? customCategory.trim() : category;

          if (!selectedCategoryName) {
            toast.error("Please select or enter a category name");
            return;
          }

          setLoading(true);
          try {
            const token = localStorage.getItem("Re-Nest.token");
            const response = await fetch(`${API_URL}/products/addProduct`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                productName: title,
                productCategory: selectedCategoryName,
                condition: condition,
                location: location,
                description: description,
                productImage: imagePreview,
              }),
            });

            const data = await response.json();

            if (response.ok && (data.responseCode === 200 || data.responseCode === 201)) {
              toast.success("Item submitted — pending admin approval!");
              navigate({ to: "/" });
            } else {
              toast.error(data.responseMessage || data.message || "Failed to list item");
            }
          } catch (error) {
            console.error(error);
            toast.error("Network error while listing item");
          } finally {
            setLoading(false);
          }
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
        />

        {imagePreview ? (
          <div className="relative overflow-hidden rounded-2xl border border-border">
            <img src={imagePreview} alt="Preview" className="aspect-[4/3] w-full object-cover" />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute right-3 top-3 rounded-full"
              onClick={() => setImagePreview("")}
            >
              Remove photo
            </Button>
          </div>
        ) : (
          <div
            className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/40 px-6 py-12 text-center transition-colors hover:bg-secondary/60"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="size-8 text-primary" />
            <p className="mt-3 text-sm font-medium">Add a photo</p>
            <p className="mt-1 text-xs text-muted-foreground">
              One clear photo in daylight gets three times more requests
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Choose file
            </Button>
          </div>
        )}

        <Field
          label="What is it?"
          value={title}
          onChange={setTitle}
          placeholder="item's name"
        />

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Description</span>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="How old is it, what condition, how to collect…"
            className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/40"
          />
        </label>

        <div>
          <span className="mb-2 block text-sm font-medium">Category</span>
          <div className="flex flex-wrap gap-2 mb-3">
            {dbCategories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setCategory(c);
                }}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm transition-colors",
                  category === c
                    ? "border-primary bg-primary text-primary-foreground font-semibold"
                    : "border-border bg-background text-muted-foreground hover:bg-secondary"
                )}
              >
                {c}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setCategory("__SUGGEST_NEW__")}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors border-dashed",
                category === "__SUGGEST_NEW__"
                  ? "border-emerald-600 bg-emerald-600 text-white font-semibold"
                  : "border-emerald-600/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
              )}
            >
              + Suggest New Category
            </button>
          </div>

          {category === "__SUGGEST_NEW__" && (
            <div className="mt-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
              <label className="block text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                Suggest Category to Admin:
              </label>
              <input
                type="text"
                required
                placeholder="Enter suggested category (e.g. Sports, Toys, Gardening...)"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full rounded-xl border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
              />
              <p className="text-[11px] text-muted-foreground italic">
                Note: Upon admin approval of your product, this category will automatically be created in the platform database!
              </p>
            </div>
          )}
        </div>

        <div>
          <span className="mb-2 block text-sm font-medium">Condition</span>
          <div className="flex flex-wrap gap-2">
            {conditions.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCondition(c)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm transition-colors",
                  condition === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-secondary",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <Field
          label="Pickup area"
          value={location}
          onChange={setLocation}
          placeholder="name of streets , area, city"
        />

        <Button type="submit" size="lg" className="w-full rounded-full" disabled={loading}>
          {loading ? "Listing item..." : "List this item"}
        </Button>
      </form>
    </div>
  );
}
