"use client";

import { useEffect, useState } from "react";
import { getGreetingFr } from "@/lib/my-work/mock-data";
import { UserAvatar } from "@/components/ui/user-avatar";

export function Greeting() {
  const greeting = getGreetingFr();
  const [name, setName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((data) => {
        setName(data.name ?? data.email ?? "");
        setAvatarUrl(data.avatarUrl ?? null);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex items-center gap-2 min-w-0">
      <UserAvatar name={name} avatarUrl={avatarUrl} size="sm" className="shrink-0" />
      <h1 className="text-xl font-semibold truncate min-w-0">
        {greeting}{name ? `, ${name}` : ""}
      </h1>
    </div>
  );
}
