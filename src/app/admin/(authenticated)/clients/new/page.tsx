"use client";

import { ClientForm } from "@/components/forms/ClientForm";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

export default function NewClientPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const createMutation = trpc.clients.create.useMutation({
    onSuccess: () => {
      toast.success("Client created successfully");
      router.push("/admin/clients");
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t("clients.new")}</h2>
        <p className="text-muted-foreground">{t("clients.subtitle_new")}</p>
      </div>
      <Card>
        <CardContent className="p-6">
          <ClientForm
            onSubmit={(data) => createMutation.mutate(data)}
            isLoading={createMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
