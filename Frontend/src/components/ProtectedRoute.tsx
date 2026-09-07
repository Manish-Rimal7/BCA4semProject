import type { ReactNode } from "react";
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
  const { user, ready } = useAuth();

  if (!ready) {
    return <div className="mx-auto max-w-6xl px-4 py-20 text-muted-foreground">Loading…</div>;
  }

  if (!user || (adminOnly && user.role !== "admin")) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-secondary">
          <Lock className="size-6 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold">
          {adminOnly && user ? "Admins only" : "You need an account"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {adminOnly && user
            ? "This area is limited to community moderators."
            : "Log in to keep track of the things you've requested and given away."}
        </p>
        {!user && (
          <div className="mt-6 flex gap-2">
            <Button asChild className="rounded-full">
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/register">Create account</Link>
            </Button>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
