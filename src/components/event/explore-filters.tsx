"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface ExploreFiltersProps {
  categories: { id: string; name: string; slug: string }[];
  cities: string[];
}

export function ExploreFilters({ categories, cities }: ExploreFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearFilters() {
    router.push(pathname);
  }

  const hasFilters =
    searchParams.get("search") ||
    searchParams.get("category") ||
    searchParams.get("city") ||
    searchParams.get("price");

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search events..."
          className="pl-9"
          defaultValue={searchParams.get("search") || ""}
          onChange={(e) => {
            const val = e.target.value;
            clearTimeout((window as any)._searchTimer);
            (window as any)._searchTimer = setTimeout(
              () => updateParam("search", val),
              400
            );
          }}
        />
      </div>

      {/* Category */}
      <Select
        value={searchParams.get("category") || "__all"}
        onValueChange={(v) => updateParam("category", v === "__all" ? "" : (v ?? ""))}
      >
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="__all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* City */}
      <Select
        value={searchParams.get("city") || "__all"}
        onValueChange={(v) => updateParam("city", v === "__all" ? "" : (v ?? ""))}
      >
        <SelectTrigger className="w-full sm:w-[140px]">
          <SelectValue placeholder="City" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="__all">All Cities</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Price */}
      <Select
        value={searchParams.get("price") || "__all"}
        onValueChange={(v) => updateParam("price", v === "__all" ? "" : (v ?? ""))}
      >
        <SelectTrigger className="w-full sm:w-[120px]">
          <SelectValue placeholder="Price" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="__all">All</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="mr-1 size-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
