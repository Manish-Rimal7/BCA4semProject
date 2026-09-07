import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { AuthShell, Field } from "@/components/AuthShell";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create an account — Re-Nest" },
      {
        name: "description",
        content: "Join your neighbourhood giving circle and start rehoming things for free.",
      },
      { property: "og:title", content: "Create an account — Re-Nest" },
      { property: "og:description", content: "Join your neighbourhood giving circle." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [address, setAddress] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <AuthShell
      title="Join the circle"
      subtitle="Two minutes to sign up, then start giving and receiving."
      footer={
        <>
          Already a member?{" "}
          <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!username || !address || !age || !email || !password) {
            toast.error("Fill in every field");
            return;
          }
          if (password !== confirm) {
            toast.error("Passwords doesn't match");
            return;
          }

          try {
            await register(username, address, Number(age), email, password);
            toast.success("Account created successfully");
            navigate({ to: "/login" });
          } catch (error: any) {
            toast.error(error?.message || "Registration failed. Please try again.");
          }
        }}
      >
        <Field
          label="Display name"
          value={username}
          onChange={setUsername}
          placeholder="Manish Rimal"
        />
        <Field label="Address" value={address} onChange={setAddress} placeholder="Kathmandu" />
        <Field label="Age" type="number" value={age} onChange={setAge} placeholder="21" />
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
        <Field
          label="Confirm password"
          type="password"
          value={confirm}
          onChange={setConfirm}
          placeholder="••••••••"
        />
        <Button type="submit" className="w-full rounded-full" size="lg">
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
