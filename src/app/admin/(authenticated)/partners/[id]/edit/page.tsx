"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useParams } from "next/navigation";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { SingleImageUpload } from "@/components/SingleImageUpload";
import { useLanguage } from "@/contexts/LanguageContext";

import { Card, CardContent } from "@/components/ui/card";

import { useEffect } from "react";

const schema = z.object({
  name: z.string().min(1).optional(),
  logoUrl: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().optional()
});

export default function AdminPartnerEditPage() {
  const { t } = useLanguage();
  const params = useParams();
  const id = String(params?.id ?? "");
  const getQuery = trpc.partners.getById.useQuery({ id }, { enabled: !!id });
  const updateMutation = trpc.partners.update.useMutation();
  const form = useForm({ 
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      website: "",
      logoUrl: "",
      description: ""
    }
  });

  const partner = getQuery.data as { name: string; logoUrl?: string; website?: string; description?: string } | undefined;

  useEffect(() => {
    if (partner) {
      form.reset({
        name: partner.name,
        website: partner.website || "",
        logoUrl: partner.logoUrl || "",
        description: partner.description || ""
      });
    }
  }, [partner, form]);

  if (getQuery.isLoading) return <div>Loading...</div>;
  if (getQuery.error) return <div className="text-red-600">Failed to load</div>;
  if (!getQuery.data) return <div>Not found</div>;

  async function onSubmit(values: any) {
    await updateMutation.mutateAsync({ id, data: values });
    window.location.href = "/admin/partners";
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">{t("partners.title_edit")}</h1>
        <p className="text-muted-foreground">{t("partners.subtitle_edit")}</p>
      </div>
      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("partners.fields.name")}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t("partners.placeholders.enter_name")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="website" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("partners.fields.website")}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t("partners.placeholders.enter_website")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="logoUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("partners.fields.logo")}</FormLabel>
                  <FormControl>
                    <SingleImageUpload 
                      value={field.value || ''} 
                      onChange={field.onChange} 
                      folder="partners"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="description" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>{t("partners.fields.description")}</FormLabel>
                  <FormControl>
                    <RichTextEditor 
                      value={field.value || ''} 
                      onChange={field.onChange} 
                      placeholder={t("partners.placeholders.enter_description")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="md:col-span-2">
                <Button type="submit" disabled={updateMutation.isPending}>{t("common.save")}</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

