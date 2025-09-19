import { Train, Bus, Zap, Car, MapPin, ArrowRight } from "lucide-react"

export const TransportIcons = {
  train: Train,
  bus: Bus,
  metro: Zap,
  monorail: Train,
  auto: Car,
  walk: MapPin,
  transfer: ArrowRight,
}

export function TransportIcon({ type, className }: { type: keyof typeof TransportIcons; className?: string }) {
  const Icon = TransportIcons[type]
  return <Icon className={className} />
}
