import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { User } from "../../types/user";
import { useState } from "react";

interface AssignSelectProps {
  users: User[];
  selected: string[];           // array of user IDs
  onChange: (ids: string[]) => void;
}

export function AssignSelect({ users, selected, onChange }: AssignSelectProps) {
  const [query, setQuery] = useState("");

  // Filter users for the dropdown/autocomplete
  const available = users.filter(
    u => !selected.includes(u.uid) && (u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()))
  );

  // Add selected user
  function addUser(uid: string) {
    onChange([...selected, uid]);
    setQuery("");
  }

  // Remove selected user
  function removeUser(uid: string) {
    onChange(selected.filter(id => id !== uid));
  }

  return (
    <div>
      <Label>Assign to users</Label>
      <div className="flex flex-wrap gap-2 my-2">
        {selected.map(uid => {
          const user = users.find(u => u.uid === uid);
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
        onChange={e => setQuery(e.target.value)}
        placeholder="Type to search users..."
        className="mb-2"
      />
      {query.length > 0 && (
        <div className="border rounded mt-2 bg-white z-10 shadow-lg max-h-40 overflow-auto">
          {available.length === 0 && (
            <div className="p-2 text-muted-foreground text-sm">No users found.</div>
          )}
          {available.map(u => (
            <div
              key={u.uid}
              className="cursor-pointer p-2 hover:bg-gray-100 flex items-center justify-between"
              onClick={() => addUser(u.uid)}
            >
              <span>{u.name}</span>
              <span className="text-xs text-gray-500">{u.email}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
