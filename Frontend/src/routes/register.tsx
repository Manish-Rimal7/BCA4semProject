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
  const [mail, setMail] = useState("");
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
          if (!username.trim() || !mail.trim() || !password) {
            toast.error("Please enter your name, mail, and password");
            return;
          }
          if (!/^[A-Za-z\s]+$/.test(username.trim())) {
            toast.error("Display name should only contain letters and spaces");
            return;
          }
          if (password.length < 8 || !/(?=.*[A-Z])/.test(password)) {
            toast.error("Password must be at least 8 characters and contain at least one uppercase letter (A-Z)");
            return;
          }
          if (confirm && password !== confirm) {
            toast.error("Passwords don't match");
            return;
          }

          try {
            await register(
              username.trim(),
              address.trim(),
              age ? Number(age) : undefined,
              mail.trim().toLowerCase(),
              password
            );
            toast.success("Account created successfully! Please log in with your mail and password.");
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
        <Field label="Address (Optional)" value={address} onChange={setAddress} placeholder="Kathmandu" />
        <Field label="Age (Optional)" type="number" value={age} onChange={setAge} placeholder="21" />
        <Field
          label="Mail"
          type="email"
          value={mail}
          onChange={setMail}
          placeholder="manish@example.com"
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
        />
        <p className="text-[11px] text-muted-foreground -mt-2">
          Must be at least 8 characters with at least one uppercase letter (e.g. Password123).
        </p>
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
