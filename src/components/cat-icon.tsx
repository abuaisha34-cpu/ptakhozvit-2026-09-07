import {
  Droplets,
  HeartPulse,
  LayoutGrid,
  Layers,
  ThermometerSun,
  Wheat,
  type LucideIcon,
} from "lucide-react";
import type { HandbookCategory } from "@/lib/broiler/handbook";
import { cn } from "@/lib/utils";

const ICONS: Record<HandbookCategory, LucideIcon> = {
  climate: ThermometerSun,
  litter: Layers,
  water: Droplets,
  feed: Wheat,
  density: LayoutGrid,
  health: HeartPulse,
};

const TONE: Record<HandbookCategory, string> = {
  climate: "bg-amber-50 text-amber-700",
  litter: "bg-lime-50 text-lime-700",
  water: "bg-sky-50 text-sky-700",
  feed: "bg-orange-50 text-orange-700",
  density: "bg-emerald-50 text-emerald-700",
  health: "bg-rose-50 text-rose-700",
};

export function CatIcon({
  category,
  className,
  size = "md",
}: {
  category: HandbookCategory;
  className?: string;
  size?: "sm" | "md";
}) {
  const Icon = ICONS[category] ?? LayoutGrid;
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-[12px]",
        size === "sm" ? "size-8" : "size-10",
        TONE[category],
        className,
      )}
    >
      <Icon className={size === "sm" ? "size-4" : "size-5"} strokeWidth={1.9} />
    </span>
  );
}
