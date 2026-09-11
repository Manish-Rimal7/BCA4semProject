import { useState, type ReactNode } from "react";
import { Sprout, Eye, EyeOff } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-[image:var(--gradient-moss)]">
        <Sprout className="size-6 text-primary-foreground" />
      </div>
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
        {children}
      </div>
      <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
    </div>
  );
}

export function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const actualType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <div className="relative">
        <input
          type={actualType}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/40 ${
            isPassword ? "pr-10" : ""
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none p-1"
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="size-4 text-muted-foreground hover:text-foreground transition-colors" />
            ) : (
              <Eye className="size-4 text-muted-foreground hover:text-foreground transition-colors" />
            )}
          </button>
        )}
      </div>
    </label>
  );
}
