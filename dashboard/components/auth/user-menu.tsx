"use client";

import { useSession } from "next-auth/react";
import { SignOutButton } from "./sign-out-button";

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3">
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || "User avatar"}
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-sm font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
            {session.user.name?.[0]?.toUpperCase() ||
              session.user.email?.[0]?.toUpperCase() ||
              "U"}
          </div>
        )}
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {session.user.name || session.user.email}
        </span>
      </div>
      <SignOutButton className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">
        Sign Out
      </SignOutButton>
    </div>
  );
}
