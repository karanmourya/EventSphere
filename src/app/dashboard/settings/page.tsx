"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { getAccount, updateProfile, updateAvatar, signOut } from "@/actions/account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  CalendarDays,
  Camera,
  Save,
  LogOut,
  Loader2,
  ExternalLink,
} from "lucide-react";

export default function SettingsPage() {
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  // Form
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    getAccount().then((data) => {
      setAccount(data);
      if (data?.profile) {
        setName(data.profile.name ?? "");
        setBio(data.profile.bio ?? "");
        setLinkedinUrl(data.profile.linkedin_url ?? "");
      }
      setLoading(false);
    });
  }, []);

  function handleSave() {
    setMessage(null);
    startTransition(async () => {
      const result = await updateProfile({ name, bio, linkedin_url: linkedinUrl });
      if (result.error) {
        setMessage({ text: result.error, type: "error" });
      } else {
        setMessage({ text: "Profile updated!", type: "success" });
      }
    });
  }

  function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    startTransition(async () => {
      const result = await updateAvatar(formData);
      if (result.error) {
        setMessage({ text: result.error, type: "error" });
      } else {
        setMessage({ text: "Avatar updated!", type: "success" });
        // Refresh account data
        const data = await getAccount();
        setAccount(data);
      }
    });
  }

  function handleSignOut() {
    startTransition(async () => {
      await signOut();
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!account) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        Not authenticated.
      </p>
    );
  }

  const profile = account.profile;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">
        Account Settings
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Manage your profile and preferences
      </p>

      {/* Avatar */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <Avatar className="size-20">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="text-xl">
              {profile?.name?.charAt(0).toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            <Camera className="size-3.5" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </div>
        <div>
          <p className="font-medium">{profile?.name ?? "User"}</p>
          <p className="text-sm text-muted-foreground">@{profile?.username}</p>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Account Info (read-only) */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <Mail className="size-3.5" />
            Email
          </label>
          <Input value={account.email ?? ""} disabled className="bg-muted" />
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <User className="size-3.5" />
            Username
          </label>
          <Input
            value={profile?.username ?? ""}
            disabled
            className="bg-muted"
          />
        </div>
      </div>

      {/* Editable fields */}
      <div className="mb-6 flex flex-col gap-4">
        <div>
          <label className="mb-1.5 text-sm font-medium">Display Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="mb-1.5 text-sm font-medium">Bio</label>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself..."
            rows={3}
          />
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
            <ExternalLink className="size-3.5" />
            LinkedIn URL
          </label>
          <Input
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>
      </div>

      {message && (
        <div
          className={`mb-4 rounded-lg border p-3 text-sm ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200"
              : "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <Button onClick={handleSave} disabled={isPending}>
        {isPending ? (
          <Loader2 className="mr-1 size-4 animate-spin" />
        ) : (
          <Save className="mr-1 size-4" />
        )}
        Save Changes
      </Button>

      <Separator className="my-8" />

      {/* Session info + Logout */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="size-3.5" />
          Member since{" "}
          {account.created_at
            ? new Date(account.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "N/A"}
        </div>
        <Button variant="destructive" onClick={handleSignOut} disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-1 size-4 animate-spin" />
          ) : (
            <LogOut className="mr-1 size-4" />
          )}
          Sign Out
        </Button>
      </div>
    </div>
  );
}
