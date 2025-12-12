"use client";

import { trpc } from "@/lib/trpc";
import ListSkeleton from "@/components/ListSkeleton";

export default function PartnersPage() {
  const partnersQuery = trpc.partners.list.useQuery();

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-semibold">Partners</h1>
      {partnersQuery.isLoading && <ListSkeleton />}
      {partnersQuery.error && <p className="text-red-600">Failed to load partners</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(partnersQuery.data ?? []).map(p => (
          <div key={p.id} className="border rounded-lg p-4 text-center transition-transform hover:scale-[1.01]">
            {p.logoUrl ? (
              <img src={p.logoUrl} alt={p.name} className="mx-auto h-12 object-contain" />
            ) : (
              <div className="h-12" />
            )}
            <div className="mt-2 font-medium">{p.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
