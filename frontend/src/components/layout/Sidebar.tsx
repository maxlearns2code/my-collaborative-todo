"use client";

import { Button } from "@/components/ui/button";
import type { User } from "@/types/user";
import Image from "next/image";

interface SidebarProps {
  currentUser: User | null;
  ownedCount?: number;
  assignedCount?: number;
  completedCount?: number;
  openCount?: number;
  onLogout?: () => void;
}

export function Sidebar({
  currentUser,
  ownedCount = 0,
  assignedCount = 0,
  completedCount = 0,
  openCount = 0,
  onLogout,
}: SidebarProps) {
  return (
    <aside className="bg-white shadow min-h-screen w-72 flex flex-col p-6">
      {/* Logo and App Name */}
      <div className="mb-7">
        <div className="flex items-center justify-center mb-2">
          <Image
            src="/logo.jpg"
            alt="App Logo"
            width={48}
            height={48}
            className="rounded"
          />
        </div>
        <div className="text-center font-bold text-lg mb-1">
          Collaborative Todo
        </div>
      </div>
      {/* Profile section */}
      <div className="mb-6 flex flex-col items-center">
        {currentUser?.avatarUrl && (
          <Image
            src={currentUser.avatarUrl}
            alt={currentUser.name || "User"}
            width={64}
            height={64}
            className="rounded-full mb-2"
          />
        )}
        <div className="font-bold">{currentUser?.name ?? "Unnamed"}</div>
        <div className="text-xs text-gray-500 mb-1">{currentUser?.email}</div>
        {/* Example: Last login (adjust logic if needed) */}
        {currentUser && (
          <div className="text-[12px] text-gray-400">
            Last session: {new Date().toLocaleString()}
          </div>
        )}
        {onLogout && (
          <Button
            size="sm"
            variant="outline"
            className="mt-3"
            onClick={onLogout}
          >
            Log out
          </Button>
        )}
      </div>
      {/* Quick Stats */}
      <div className="mb-6">
        <div className="flex flex-col gap-1 text-sm items-center">
          <div>
            <span className="font-semibold">Owned:</span> {ownedCount}
          </div>
          <div>
            <span className="font-semibold">Assigned:</span> {assignedCount}
          </div>
          <div>
            <span className="font-semibold">Open:</span> {openCount}
          </div>
          <div>
            <span className="font-semibold">Completed:</span> {completedCount}
          </div>
        </div>
      </div>
      <div className="mt-auto text-xs text-gray-400 text-center">
        Arkivia Collaborative Todo
      </div>
    </aside>
  );
}
