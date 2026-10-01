import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MyDonationsManager } from "@/components/MyDonationsManager";

export const Route = createFileRoute("/mydonations")({
  head: () => ({
    meta: [{ title: "My Donations — Re-Nest" }],
  }),
  component: () => (
    <ProtectedRoute>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <MyDonationsManager />
      </div>
    </ProtectedRoute>
  ),
});
