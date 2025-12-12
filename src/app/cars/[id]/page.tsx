"use client";

import { trpc } from "@/lib/trpc";
import { useParams } from "next/navigation";
import Image from "next/image";
import { formatEUR } from "@/lib/utils";
import { useState } from "react";

export default function CarDetailPage() {
  const params = useParams();
  const id = String(params?.id ?? "");
  const carQuery = trpc.cars.getById.useQuery({ id }, { enabled: !!id });

  if (!id) return <div className="p-6">Invalid car id</div>;
  if (carQuery.isLoading) return <div className="p-6">Loading...</div>;
  if (carQuery.error) return <div className="p-6 text-red-600">Failed to load</div>;
  if (!carQuery.data) return <div className="p-6">Not found</div>;

  const car = carQuery.data;
  const relatedQuery = trpc.cars.list.useQuery({ brand: car.brand, model: car.model }, { enabled: !!car });
  const related = ((relatedQuery.data ?? []) as Array<{ id: string; brand: string; model: string }>).filter((c) => c.id !== car.id).slice(0, 4);
  const contactMutation = trpc.system.contact.useMutation();
  const [contactState, setContactState] = useState({ name: "", email: "", message: "" });

  return (
    <div className="container mx-auto px-4 py-6 space-y-4">
      <h1 className="text-2xl font-semibold">{car.brand} {car.model}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div>Year: {car.year}</div>
          <div>Kilometers: {car.km}</div>
          <div>Fuel: {car.fuel}</div>
          <div>Power: {car.motorPower} hp</div>
          {car.origin && <div>Origin: {car.origin}</div>}
          <div className="font-semibold">Price: {formatEUR(car.price)}</div>
        </div>
        <div>
          <p className="text-muted-foreground mb-4">{car.description}</p>
          {Array.isArray(car.imageUrls) && car.imageUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {car.imageUrls.map((src, i) => (
                <div key={i} className="relative w-full h-40">
                  <Image src={src} alt={`${car.brand} ${car.model}`} fill className="object-cover rounded" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-medium">Related cars</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {related.map((rc) => (
            <a key={rc.id} href={`/cars/${rc.id}`} className="border rounded p-3 hover:shadow-sm">
              <div className="text-sm text-muted-foreground">{rc.brand}</div>
              <div className="font-medium">{rc.model}</div>
            </a>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-medium">Contact / Inquiry</h2>
        <form
          className="grid grid-cols-1 md:grid-cols-3 gap-3"
          onSubmit={async e => {
            e.preventDefault();
            await contactMutation.mutateAsync(contactState);
            setContactState({ name: "", email: "", message: "" });
            alert("Inquiry sent");
          }}
        >
          <input
            className="border rounded px-3 py-2"
            placeholder="Your name"
            value={contactState.name}
            onChange={e => setContactState(s => ({ ...s, name: e.target.value }))}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Your email"
            value={contactState.email}
            onChange={e => setContactState(s => ({ ...s, email: e.target.value }))}
          />
          <input
            className="border rounded px-3 py-2 md:col-span-3"
            placeholder="Message"
            value={contactState.message}
            onChange={e => setContactState(s => ({ ...s, message: e.target.value }))}
          />
          <button className="bg-primary text-primary-foreground rounded px-4 py-2" type="submit" disabled={contactMutation.isPending}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
