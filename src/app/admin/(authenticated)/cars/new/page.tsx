"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMemo, useState } from "react";
import metadata from "@/lib/metadata.json";
import { Combobox } from "@/components/ui/combobox";
import { MultiSelect } from "@/components/ui/multi-select";
import { ImageUpload } from "@/components/ImageUpload";
import { useLanguage } from "@/contexts/LanguageContext";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const schema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.coerce.number().int(),
  price: z.coerce.number(),
  purchasePrice: z.coerce.number().optional(),
  km: z.coerce.number(),
  fuel: z.string().min(1),
  motorPower: z.coerce.number(),
  engineSize: z.coerce.number().optional(),
  description: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
  // New fields
  vehicleType: z.string().optional(),
  bodyType: z.string().optional(),
  transmission: z.string().optional(),
  traction: z.string().optional(),
  condition: z.string().optional(),
  colorExterior: z.string().optional(),
  colorInterior: z.string().optional(),
  doors: z.string().optional(),
  seats: z.coerce.number().optional(),
  equipment: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function AdminCarNewPage() {
  const { t } = useLanguage();
  const form = useForm<FormValues>({ 
    resolver: zodResolver(schema) as any, 
    defaultValues: { 
      fuel: "petrol",
      equipment: [],
      // Set reasonable defaults or leave empty
    } 
  });
  const createMutation = trpc.cars.create.useMutation();

  const selectedBrand = form.watch("brand");

  // Options generation
  const brandOptions = useMemo(() => {
    return Object.keys(metadata.marcas_e_modelos).map((brand) => ({
      value: brand,
      label: brand,
    }));
  }, []);

  const modelOptions = useMemo(() => {
    if (!selectedBrand) return [];
    // @ts-ignore - we know brand exists in metadata
    const models = metadata.marcas_e_modelos[selectedBrand] || [];
    return models.map((model: string) => ({
      value: model,
      label: model,
    }));
  }, [selectedBrand]);

  const fuelOptions = useMemo(() => metadata.tipos_de_combustivel.map(v => ({ value: v, label: t(`car_attributes.fuel_types.${v}`) })), [t]);
  const vehicleTypeOptions = useMemo(() => metadata.tipos_de_veiculo.map(v => ({ value: v, label: t(`car_attributes.vehicle_types.${v}`) })), [t]);
  const bodyTypeOptions = useMemo(() => metadata.tipos_de_carrocaria.map(v => ({ value: v, label: t(`car_attributes.body_types.${v}`) })), [t]);
  const transmissionOptions = useMemo(() => metadata.tipos_de_transmissao.map(v => ({ value: v, label: t(`car_attributes.transmission_types.${v}`) })), [t]);
  const tractionOptions = useMemo(() => metadata.tipos_de_tracao.map(v => ({ value: v, label: t(`car_attributes.traction_types.${v}`) })), [t]);
  const conditionOptions = useMemo(() => metadata.estado_do_veiculo.map(v => ({ value: v, label: t(`car_attributes.vehicle_conditions.${v}`) })), [t]);
  const colorOptions = useMemo(() => metadata.cores_exteriores.map(v => ({ value: v, label: t(`car_attributes.colors.${v}`) })), [t]);
  const doorsOptions = useMemo(() => metadata.numero_de_portas.map(v => ({ value: v, label: v.replace("_", "-") })), []);
  // seats is number, but select is string based usually, or we can use Input type=number. 
  // Metadata has "lotacao_de_lugares": ["2", "4", "5"...]
  // Let's use Combobox for seats too as it suggests common values, but allow custom? 
  // Combobox usually enforces options. Let's use the metadata options.
  const seatsOptions = useMemo(() => metadata.lotacao_de_lugares.map(v => ({ value: v, label: v })), []);
  const equipmentOptions = useMemo(() => metadata.equipamento_essencial.map(v => ({ value: v, label: t(`car_attributes.equipment.${v}`) })), [t]);


  async function onSubmit(values: FormValues) {
    await createMutation.mutateAsync({
      brand: values.brand,
      model: values.model,
      year: Number(values.year),
      price: Number(values.price),
      purchasePrice: values.purchasePrice ? Number(values.purchasePrice) : undefined,
      km: Number(values.km),
      fuel: values.fuel,
      motorPower: Number(values.motorPower),
      engineSize: values.engineSize ? Number(values.engineSize) : undefined,
      description: values.description,
      imageUrls: values.imageUrls,
      // New fields
      vehicleType: values.vehicleType,
      bodyType: values.bodyType,
      transmission: values.transmission,
      traction: values.traction,
      condition: values.condition,
      colorExterior: values.colorExterior,
      colorInterior: values.colorInterior,
      doors: values.doors,
      seats: values.seats ? Number(values.seats) : undefined,
      equipment: values.equipment,
    });

    window.location.href = "/admin/cars";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("cars.title_new")}</h1>
        <p className="text-muted-foreground">{t("cars.subtitle_new")}</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          <Card>
            <CardHeader><CardTitle>{t("cars.details")}</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Info */}
            <FormField control={form.control} name="brand" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("cars.fields.brand")}</FormLabel>
                <FormControl>
                  <Combobox 
                    options={brandOptions} 
                    value={field.value} 
                    onChange={(val) => {
                      field.onChange(val);
                      form.setValue("model", ""); // Reset model when brand changes
                    }} 
                    placeholder={t("cars.placeholders.select_brand")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="model" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("cars.fields.model")}</FormLabel>
                <FormControl>
                  <Combobox 
                    options={modelOptions} 
                    value={field.value} 
                    onChange={field.onChange} 
                    placeholder={t("cars.placeholders.select_model")}
                    emptyText={selectedBrand ? t("cars.messages.no_model") : t("cars.messages.select_brand_first")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="year" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("cars.fields.year")}</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={(field.value as any) ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="condition" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("cars.fields.condition")}</FormLabel>
                <FormControl>
                  <Combobox options={conditionOptions} value={field.value || ''} onChange={field.onChange} placeholder={t("cars.placeholders.select_condition")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="price" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("cars.fields.price")}</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} value={(field.value as any) ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="purchasePrice" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("cars.fields.purchase_price")}</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} value={(field.value as any) ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{t("cars.specs")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 {/* Tech Specs */}
                <FormField control={form.control} name="km" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("cars.fields.km")}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={(field.value as any) ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="motorPower" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("cars.fields.motor_power")}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={(field.value as any) ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="engineSize" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("cars.fields.engine_size")}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={(field.value as any) ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                 <FormField control={form.control} name="fuel" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("cars.fields.fuel")}</FormLabel>
                    <FormControl>
                      <Combobox options={fuelOptions} value={field.value} onChange={field.onChange} placeholder={t("cars.placeholders.select_fuel")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <FormField control={form.control} name="vehicleType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("cars.fields.vehicle_type")}</FormLabel>
                    <FormControl>
                      <Combobox options={vehicleTypeOptions} value={field.value || ''} onChange={field.onChange} placeholder={t("cars.placeholders.select_type")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="bodyType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("cars.fields.body_type")}</FormLabel>
                    <FormControl>
                      <Combobox options={bodyTypeOptions} value={field.value || ''} onChange={field.onChange} placeholder={t("cars.placeholders.select_body")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="transmission" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("cars.fields.transmission")}</FormLabel>
                    <FormControl>
                      <Combobox options={transmissionOptions} value={field.value || ''} onChange={field.onChange} placeholder={t("cars.placeholders.select_transmission")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="traction" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("cars.fields.traction")}</FormLabel>
                    <FormControl>
                      <Combobox options={tractionOptions} value={field.value || ''} onChange={field.onChange} placeholder={t("cars.placeholders.select_traction")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="doors" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("cars.fields.doors")}</FormLabel>
                    <FormControl>
                      <Combobox options={doorsOptions} value={field.value || ''} onChange={field.onChange} placeholder={t("cars.placeholders.select_doors")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="seats" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("cars.fields.seats")}</FormLabel>
                    <FormControl>
                      <Combobox options={seatsOptions} value={field.value ? String(field.value) : ''} onChange={field.onChange} placeholder={t("cars.placeholders.select_seats")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{t("cars.colors_equipment")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="colorExterior" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("cars.fields.color_exterior")}</FormLabel>
                    <FormControl>
                      <Combobox options={colorOptions} value={field.value || ''} onChange={field.onChange} placeholder={t("cars.placeholders.select_color")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="colorInterior" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("cars.fields.color_interior")}</FormLabel>
                    <FormControl>
                      <Combobox options={colorOptions} value={field.value || ''} onChange={field.onChange} placeholder={t("cars.placeholders.select_color")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="equipment" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("cars.fields.equipment")}</FormLabel>
                  <FormControl>
                    <MultiSelect 
                      options={equipmentOptions} 
                      value={field.value || []} 
                      onChange={field.onChange} 
                      placeholder={t("cars.placeholders.select_equipment")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{t("cars.fields.description")}</CardTitle></CardHeader>
            <CardContent>
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormControl>
                    <RichTextEditor 
                      value={field.value || ''} 
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{t("cars.images")}</CardTitle></CardHeader>
            <CardContent>
              <FormField name="imageUrls" control={form.control} render={({ field }) => (
                <FormItem className="md:col-span-2">
                    <FormControl>
                        <ImageUpload 
                            value={field.value || []} 
                            onChange={field.onChange}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <div className="md:col-span-2 flex items-center gap-3">
            <Button type="submit" disabled={createMutation.isPending}>{t("common.save")}</Button>
            {createMutation.isPending && <span>{t("common.saving")}</span>}
          </div>
        </form>
      </Form>
    </div>
  );
}
