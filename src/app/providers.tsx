"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { useEffect, useState } from "react";
import superjson from "superjson";
import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { initFirebaseClientEnhancers } from "@/lib/firebaseClientEnhancers";
import { LanguageProvider } from "@/contexts/LanguageContext";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => {
    const qc = new QueryClient();
    
    // Add global error handling
    if (typeof window !== "undefined") {
        qc.getQueryCache().subscribe(event => {
            if (event.type === "updated" && event.action.type === "error") {
                const error = event.query.state.error;
                redirectToLoginIfUnauthorized(error);
                console.error("[API Query Error]", error);
            }
        });

        qc.getMutationCache().subscribe(event => {
            if (event.type === "updated" && event.action.type === "error") {
                const error = event.mutation.state.error;
                redirectToLoginIfUnauthorized(error);
                console.error("[API Mutation Error]", error);
            }
        });
    }
    return qc;
  });

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
          fetch(input, init) {
            return globalThis.fetch(input, {
              ...(init ?? {}),
              credentials: "include",
            });
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light">
          <LanguageProvider>
            <TooltipProvider>
              <Initializer />
              {children}
              <Toaster />
            </TooltipProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = "/admin";
};

function Initializer() {
  useEffect(() => {
    initFirebaseClientEnhancers();
  }, []);
  return null;
}
