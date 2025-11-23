import Image from "next/image";
import { useState } from "react";
import { User } from "../../types/user";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface AssignSelectProps {
  users: User[];
  selected: string[]; // array of user IDs
  onChange: (ids: string[]) => void;
}

export function AssignSelect({ users, selected, onChange }: AssignSelectProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  // Filter users for the dropdown/autocomplete
  const available = users.filter(
    (u) =>
      !selected.includes(u.uid) &&
      (u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase()))
  );

  // Add selected user
  function addUser(uid: string) {
    onChange([...selected, uid]);
    setQuery("");
  }

  // Remove selected user
  function removeUser(uid: string) {
    onChange(selected.filter((id) => id !== uid));
  }

  return (
    <div>
      <Label>Assign to users</Label>
      <div className="flex flex-wrap gap-2 my-2">
        {selected.map((uid) => {
          const user = users.find((u) => u.uid === uid);
          return user ? (
            <span
              key={uid}
              className="inline-flex items-center bg-gray-200 text-gray-800 px-2 rounded-md text-sm"
            >
              {user.name}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="ml-1 px-1"
                onClick={() => removeUser(uid)}
                aria-label={`Remove ${user.name}`}
              >
                ×
              </Button>
            </span>
          ) : null;
        })}
      </div>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Type to search users..."
        className="mb-2"
      />

      {(focused || query.length > 0) && (
        <div className="border rounded mt-2 bg-white z-10 shadow-lg max-h-40 overflow-auto">
          {available.length === 0 ? (
            <div className="p-2 text-muted-foreground text-sm">
              No users found.
            </div>
          ) : (
            available.map((u) => (
              <div
                key={u.uid}
                className="cursor-pointer p-2 hover:bg-gray-100 flex items-center justify-between"
                onMouseDown={() => addUser(u.uid)}
              >
                <span className="flex items-center">
                  {u.avatarUrl && (
                    <Image
                      src={u.avatarUrl}
                      alt={u.name || "User"}
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full mr-2"
                    />
                  )}
                  {u.name}
                  <span className="ml-2 text-xs text-gray-500">{u.email}</span>
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
