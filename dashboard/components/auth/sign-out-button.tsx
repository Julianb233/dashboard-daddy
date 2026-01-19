"use client";

import { signOut } from "next-auth/react";

interface SignOutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function SignOutButton({
  className = "",
  children,
}: SignOutButtonProps) {
  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/signin" });
  };

  return (
    <button onClick={handleSignOut} className={className}>
      {children || "Sign Out"}
    </button>
  );
}
