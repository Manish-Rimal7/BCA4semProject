import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: ReactNode;
  adminOnly?: boolean;
}) {
  const { user, ready, toggleAdminRole } = useAuth();
  const [elevating, setElevating] = useState(false);

  if (!ready) {
    return <div className="mx-auto max-w-6xl px-4 py-20 text-muted-foreground">Loading…</div>;
  }

  const handleEnableAdmin = async () => {
    setElevating(true);
    try {
      await toggleAdminRole();
    } catch (err: any) {
      console.error(err);
    } finally {
      setElevating(false);
    }
  };

  if (!user || (adminOnly && user.role !== "admin")) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-secondary">
          <Lock className="size-6 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold">
          {adminOnly && user ? "Admin Dashboard Access" : "You need an account"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {adminOnly && user
            ? "Your account currently has the 'user' role. Click below to grant admin privileges and unlock the full Admin Panel."
            : "Log in to keep track of the things you've requested and given away."}
        </p>
        {!user ? (
          <div className="mt-6 flex gap-2">
            <Button asChild className="rounded-full">
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/register">Create account</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center gap-3">
            <Button
              onClick={handleEnableAdmin}
              disabled={elevating}
              className="rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-6 shadow-md"
            >
              {elevating ? "Activating…" : "Activate Admin Mode & Enter"}
            </Button>
            <Button asChild variant="ghost" size="sm" className="rounded-full text-xs text-muted-foreground">
              <Link to="/">Return to Browse</Link>
            </Button>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
