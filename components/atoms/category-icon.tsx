import {
  SupabasePaths,
  SupabaseStorageBuckets,
} from "@/lib/constants/supabase-storage";
import { cn } from "@/lib/utils";
import {
  Brush,
  Car,
  Crown,
  FlameKindling,
  Gem,
  Gift,
  School,
  Sparkles,
  Users,
} from "lucide-react";
import Image from "next/image";

export default function CategoryIcon({
  name,
  className = "",
  image = "",
}: {
  name: string;

  className?: string;
  image?: string | null;
}) {
  if (image) {
    const src =
      SupabasePaths.IMAGES +
      "/" +
      SupabaseStorageBuckets.IMAGES.folders.CATEGORIES +
      "/" +
      image;

    return (
      <Image
        src={src}
        alt={name}
        className={cn("p-1", className)}
        width={64}
        height={64}
      />
    );
  }

  // [
  //   {
  //     slug: "women",
  //   },
  //   {
  //     slug: "men",
  //   },
  //   {
  //     slug: "unisex",
  //   },
  //   {
  //     slug: "dkhoun",
  //   },
  //   {
  //     slug: "hair-care",
  //   },
  //   {
  //     slug: "room-freshener",
  //   },
  //   {
  //     slug: "car-freshener",
  //   },
  //   {
  //     slug: "giveaway",
  //   },
  // ];

  switch (name) {
    case "fragrance-sprays":
      return <Sparkles className={className} />;
    case "hair-care":
      return <Brush className={className} />;

    case "mens-perfumes":
      return <Crown className={className} />;
    case "skin-care":
      return <FlameKindling className={className} />;
    case "unisex-perfumes":
      return <Users className={className} />;
    case "womens-perfumes":
      return <Sparkles className={className} />;
    default:
      return <Gem className={className} />;
  }
}
