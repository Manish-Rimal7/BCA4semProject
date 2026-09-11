import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Plus, Sprout, X, Sun, Moon, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = user?.role === "admin"
    ? [
        { to: "/admin", label: "Admin Dashboard", isAdmin: true },
        { to: "/", label: "Browse" },
        { to: "/requests", label: "My Requests" },
        { to: "/donations", label: "My Donations" },
        { to: "/dashboard", label: "My Items" },
        { to: "/profile", label: "Profile" },
      ]
    : [
        { to: "/", label: "Browse" },
        { to: "/requests", label: "My Requests" },
        { to: "/donations", label: "My Donations" },
        { to: "/dashboard", label: "Dashboard" },
        { to: "/profile", label: "Profile" },
      ];

  const nav = (
    <>
      {links.map((l) => (
        <Link
          key={l.to}
          to={l.to as any}
          onClick={() => setOpen(false)}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-sm transition-all flex items-center gap-1.5",
            (l as any).isAdmin
              ? "bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow-sm"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
          activeProps={{
            className: (l as any).isAdmin
              ? "ring-2 ring-emerald-500 bg-emerald-700 text-white font-bold"
              : "bg-secondary text-foreground font-medium",
          }}
          activeOptions={{ exact: l.to === "/" }}
        >
          {(l as any).isAdmin && <ShieldCheck className="size-4 shrink-0" />}
          {l.label}
        </Link>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[image:var(--gradient-moss)] shadow-sm">
            <Sprout className="size-5 text-white" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">Re-Nest</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">{nav}</nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          {/* THEME TOGGLE BUTTON */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-all hover:bg-secondary hover:scale-105"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="size-4 text-amber-400" />
            ) : (
              <Moon className="size-4 text-slate-700" />
            )}
          </button>

          <Button asChild size="sm" className="rounded-full">
            <Link to="/donate">
              <Plus className="size-4" />
              Donate an item
            </Link>
          </Button>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm transition-colors hover:bg-secondary font-medium"
              >
                <span className="flex size-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold uppercase">
                  {user.username ? user.username.slice(0, 1) : "U"}
                </span>
                <span>{user.username || "Profile"}</span>
                {user.role === "admin" && (
                  <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                    Admin
                  </span>
                )}
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate({ to: "/" });
                }}
                className="rounded-full border border-border/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                Sign out
              </button>
            </div>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="rounded-full">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link to="/register">Join</Link>
              </Button>
            </>
          )}
        </div>

        {/* MOBILE MENU TOGGLE & THEME */}
        <div className="ml-auto flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex size-8 items-center justify-center rounded-full border border-border bg-card text-foreground"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="size-4 text-amber-400" />
            ) : (
              <Moon className="size-4 text-slate-700" />
            )}
          </button>
          <button
            className="rounded-lg p-2"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <div className={cn("border-t border-border md:hidden", open ? "block" : "hidden")}>
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
          {nav}
          <Link
            to="/donate"
            onClick={() => setOpen(false)}
            className="mt-2 rounded-full bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground"
          >
            Donate an item
          </Link>
          {user ? (
            <button
              onClick={() => {
                logout();
                setOpen(false);
              }}
              className="rounded-full border border-border px-3 py-2 text-sm"
            >
              Sign out
            </button>
          ) : (
            <div className="flex gap-2">
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full border border-border px-3 py-2 text-center text-sm"
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full border border-border px-3 py-2 text-center text-sm"
              >
                Join
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
