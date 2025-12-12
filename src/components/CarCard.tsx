import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { formatEUR } from "@/lib/utils";

export interface CarCardProps {
  car: {
    id: string;
    brand: string;
    model: string;
    year: number;
    km: number;
    fuel: string;
    price: number;
    imageUrls?: string[];
  };
}

export default function CarCard({ car }: CarCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <Link href={`/cars/${car.id}`} className="border rounded-lg p-4 hover:shadow-md transition-shadow block">
        {Array.isArray(car.imageUrls) && car.imageUrls.length > 0 && (
          <div className="relative w-full h-32 mb-3 overflow-hidden rounded">
            <Image src={car.imageUrls[0]} alt={`${car.brand} ${car.model}`} fill className="object-cover" />
          </div>
        )}
        <div className="text-sm text-muted-foreground mb-1">{car.brand}</div>
        <div className="text-lg font-medium">{car.model}</div>
        <div className="mt-2 text-sm">Year: {car.year} • {car.km} km • {car.fuel}</div>
        <div className="mt-2 font-semibold">{formatEUR(car.price)}</div>
      </Link>
    </motion.div>
  );
}
