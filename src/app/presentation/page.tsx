"use client";

import { MapView } from "@/components/Map";

export default function PresentationPage() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-semibold">About Our Business</h1>
      <p className="text-muted-foreground">We sell quality cars with transparent history and reliable warranties.</p>
      <div className="h-[400px]">
        <MapView />
      </div>
      <div>
        <h2 className="text-xl font-medium">Contact</h2>
        <p>Email: info@example.com</p>
        <p>Phone: +351 000 000 000</p>
        <p>Hours: Mon–Fri 9:00–18:00</p>
      </div>
    </div>
  );
}
