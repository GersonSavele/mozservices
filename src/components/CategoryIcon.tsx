import {
  Hammer,
  Wrench,
  Droplets,
  Zap,
  Paintbrush,
  Building2,
  Leaf,
  Sparkles,
  Scissors,
  Hand,
  Car,
  Shirt,
  Wind,
  Laptop,
  Navigation,
  Truck,
  Shield,
  ChefHat,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  hammer: Hammer,
  wrench: Wrench,
  droplets: Droplets,
  zap: Zap,
  paintbrush: Paintbrush,
  building2: Building2,
  leaf: Leaf,
  sparkles: Sparkles,
  scissors: Scissors,
  hand: Hand,
  car: Car,
  shirt: Shirt,
  wind: Wind,
  laptop: Laptop,
  navigation: Navigation,
  truck: Truck,
  shield: Shield,
  chefhat: ChefHat,
};

/**
 * Ícone profissional (Lucide, traço fino) associado a uma categoria.
 * `slug` vem da coluna `categorias.icone` na base de dados (ex: "hammer").
 * Cai em `Briefcase` como ícone genérico se o slug não for reconhecido.
 */
export default function CategoryIcon({
  slug,
  className = "w-4 h-4",
  strokeWidth = 1.75,
}: {
  slug: string | null | undefined;
  className?: string;
  strokeWidth?: number;
}) {
  const Icon = (slug && ICON_MAP[slug]) || Briefcase;
  return <Icon className={className} strokeWidth={strokeWidth} />;
}
