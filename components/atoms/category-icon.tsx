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

export default function CategoryIcon({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
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
    case "women":
      return <Sparkles className={className} />;
    case "men":
      return <Crown className={className} />;

    case "unisex":
      return <Users className={className} />;
    case "dkhoun":
      return <FlameKindling className={className} />;
    case "hair-care":
      return <Brush className={className} />;
    case "room-freshener":
      return <School className={className} />;
    case "car-freshener":
      return <Car className={className} />;
    case "giveaway":
      return <Gift className={className} />;
    default:
      return <Gem className={className} />;
  }
}
