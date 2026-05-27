"use client";

import { useEffect, useState, useTransition } from "react";
import {
  createDiscountCode,
  deleteDiscountCode,
  getDiscountCodes,
} from "@/actions/discount-codes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Loader2, Tag, Percent, IndianRupee } from "lucide-react";

interface DiscountCode {
  id: string;
  code: string;
  type: string;
  value: number;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
}

export function DiscountManager({ eventId }: { eventId: string }) {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function loadCodes() {
    const data = await getDiscountCodes(eventId);
    setCodes(data as DiscountCode[]);
    setLoading(false);
  }

  useEffect(() => {
    loadCodes();
  }, [eventId]);

  function handleCreate() {
    if (!code.trim() || !value) {
      setError("Code and value are required.");
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      setError("Value must be a positive number.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await createDiscountCode(eventId, {
        code: code.trim(),
        type,
        value: type === "percentage" ? numValue : Math.round(numValue * 100),
        maxUses: maxUses ? parseInt(maxUses) : undefined,
        expiresAt: expiresAt || undefined,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setCode("");
        setValue("");
        setMaxUses("");
        setExpiresAt("");
        loadCodes();
      }
    });
  }

  function handleDelete(codeId: string) {
    startTransition(async () => {
      await deleteDiscountCode(codeId, eventId);
      loadCodes();
    });
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <Tag className="size-5" />
        Discount Codes
      </h2>

      {/* Create form */}
      <div className="rounded-xl border p-4">
        <p className="mb-3 text-sm font-medium">Create New Code</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Input
            placeholder="Code (e.g. EARLY20)"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
          <Select
            value={type}
            onValueChange={(v) => setType(v as "percentage" | "fixed")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">
                <span className="flex items-center gap-1">
                  <Percent className="size-3" /> Percentage
                </span>
              </SelectItem>
              <SelectItem value="fixed">
                <span className="flex items-center gap-1">
                  <IndianRupee className="size-3" /> Fixed
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder={type === "percentage" ? "Discount %" : "Amount (₹)"}
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <div className="flex gap-2">
            <Input
              placeholder="Max uses"
              type="number"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-3 flex items-end gap-3">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground">Expires at</label>
            <Input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>
          <Button onClick={handleCreate} disabled={isPending}>
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            Create
          </Button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {/* Existing codes */}
      {codes.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No discount codes created yet.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {codes.map((dc) => (
            <div
              key={dc.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="font-mono">
                  {dc.code}
                </Badge>
                <span className="text-sm">
                  {dc.type === "percentage" ? (
                    <span className="flex items-center gap-1">
                      <Percent className="size-3" />
                      {dc.value}% off
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      ₹{(dc.value / 100).toLocaleString("en-IN")} off
                    </span>
                  )}
                </span>
                <span className="text-xs text-muted-foreground">
                  {dc.current_uses}
                  {dc.max_uses ? `/${dc.max_uses}` : ""} used
                </span>
                {dc.expires_at && (
                  <span className="text-xs text-muted-foreground">
                    Exp: {new Date(dc.expires_at).toLocaleDateString("en-IN")}
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(dc.id)}
                disabled={isPending}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
