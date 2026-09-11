import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { AuthShell, Field } from "@/components/AuthShell";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Re-Nest" },
      {
        name: "description",
        content: "Log in to track your requests and the items you've given away.",
      },
      { property: "og:title", content: "Log in — Re-Nest" },
      { property: "og:description", content: "Log in to your Re-Nest account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Pick up where you left off — your requests are waiting."
      footer={
        <>
          New here?{" "}
          <Link
            to="/register"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        // 1. Make the submission handler async
        onSubmit={async (e) => {
          e.preventDefault();
          if (!email || !password) {
            toast.error("Enter your email and password");
            return;
          }

          try {
            const loggedInUser = await login(email, password);
            if (loggedInUser?.role === "admin") {
              toast.success(`Welcome back, ${loggedInUser.username || "Admin"}! Accessing Admin Dashboard.`);
              navigate({ to: "/admin" });
            } else {
              toast.success(`Welcome back, ${loggedInUser?.username || "Neighbour"}!`);
              navigate({ to: "/dashboard" });
            }
          } catch (error: any) {
            toast.error(error?.message || "Login failed. Check your credentials.");
          }
        }}
      >
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="manish@example.com"
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
        />
        <Button type="submit" className="w-full rounded-full" size="lg">
          Log in
        </Button>
      </form>
    </AuthShell>
  );
}
