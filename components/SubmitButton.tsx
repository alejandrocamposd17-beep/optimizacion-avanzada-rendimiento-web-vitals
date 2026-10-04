"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingText,
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  pendingText: string;
  variant?: "primary" | "quiet";
  className?: string;
}) {
  const { pending } = useFormStatus();
  const styles =
    variant === "primary"
      ? "bg-anil text-white hover:bg-anil-deep disabled:bg-anil/60"
      : "bg-transparent text-white hover:bg-white/10";
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`rounded-lg px-5 py-3 font-semibold transition-colors disabled:cursor-wait ${styles} ${className}`}
    >
      {pending ? pendingText : children}
    </button>
  );
}
