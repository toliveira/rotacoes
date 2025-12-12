"use client";

import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import CarCard from "@/components/CarCard";

export default function CarsPage() {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [q, setQ] = useState("");
  const [minYear, setMinYear] = useState<string>("");
  const [maxYear, setMaxYear] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [minKm, setMinKm] = useState<string>("");
  const [maxKm, setMaxKm] = useState<string>("");
  const [fuel, setFuel] = useState("");
  const [minPower, setMinPower] = useState<string>("");
  const [maxPower, setMaxPower] = useState<string>("");
  const [origin, setOrigin] = useState("");

  const carsQuery = trpc.cars.list.useQuery({
    brand: brand || undefined,
    model: model || undefined,
    minYear: minYear ? Number(minYear) : undefined,
    maxYear: maxYear ? Number(maxYear) : undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    minKm: minKm ? Number(minKm) : undefined,
    maxKm: maxKm ? Number(maxKm) : undefined,
    fuel: fuel || undefined,
    minPower: minPower ? Number(minPower) : undefined,
    maxPower: maxPower ? Number(maxPower) : undefined,
    origin: origin || undefined,
  });

  const cars = ((carsQuery.data ?? []) as Array<{
    id: string;
    brand: string;
    model: string;
    year: number;
    km: number;
    fuel: string;
    price: number;
    description?: string;
  }>).filter(c => {
    if (!q) return true;
    const hay = `${c.brand} ${c.model} ${c.description ?? ""}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  useEffect(() => {
    if (carsQuery.error) {
      toast.error("Failed to load cars");
    }
  }, [carsQuery.error]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(12);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setVisible(v => Math.min(v + 12, cars.length));
      }
    }, { threshold: 1 });
    io.observe(el);
    return () => io.disconnect();
  }, [cars.length]);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-semibold">Car Listings</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Input placeholder="Brand" value={brand} onChange={e => setBrand(e.target.value)} />
        <Input placeholder="Model" value={model} onChange={e => setModel(e.target.value)} />
        <Input placeholder="Search" value={q} onChange={e => setQ(e.target.value)} />
        <Button onClick={() => carsQuery.refetch()} disabled={carsQuery.isFetching}>Filter</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Input placeholder="Min Year" value={minYear} onChange={e => setMinYear(e.target.value)} />
        <Input placeholder="Max Year" value={maxYear} onChange={e => setMaxYear(e.target.value)} />
        <Input placeholder="Min Price" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
        <Input placeholder="Max Price" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
        <Input placeholder="Min Km" value={minKm} onChange={e => setMinKm(e.target.value)} />
        <Input placeholder="Max Km" value={maxKm} onChange={e => setMaxKm(e.target.value)} />
        <Input placeholder="Fuel" value={fuel} onChange={e => setFuel(e.target.value)} />
        <Input placeholder="Min Power" value={minPower} onChange={e => setMinPower(e.target.value)} />
        <Input placeholder="Max Power" value={maxPower} onChange={e => setMaxPower(e.target.value)} />
        <Input placeholder="Origin" value={origin} onChange={e => setOrigin(e.target.value)} />
      </div>

      {carsQuery.isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cars.slice(0, visible).map((car) => (
          <CarCard key={car.id} car={car as any} />
        ))}
        <div ref={sentinelRef} />
      </div>
    </div>
  );
}
