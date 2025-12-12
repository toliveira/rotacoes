"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";
import metadata from "@/lib/metadata.json";
import { Combobox } from "@/components/ui/combobox";
import { MultiSelect } from "@/components/ui/multi-select";
import { ImageUpload } from "@/components/ImageUpload";
import { useLanguage } from "@/contexts/LanguageContext";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

const schema = z.object({
  brand: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  year: z.coerce.number().int().optional(),
  price: z.coerce.number().optional(),
  purchasePrice: z.coerce.number().optional(),
  km: z.coerce.number().optional(),
  fuel: z.string().min(1).optional(),
  motorPower: z.coerce.number().optional(),
  engineSize: z.coerce.number().optional(),
  description: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
  status: z.enum(['available', 'sold', 'reserved']).optional(),
  soldTo: z.string().optional(),
  soldPrice: z.coerce.number().optional(),
  soldDate: z.coerce.date().optional(),
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

export default function AdminCarEditPage() {
  const { t } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id ?? "");
  const getQuery = trpc.cars.getById.useQuery({ id }, { enabled: !!id });
  const { data: clients } = trpc.clients.list.useQuery();
  const updateMutation = trpc.cars.update.useMutation({
    onSuccess: () => {
        toast.success("Car updated successfully");
        router.push("/admin/cars");
    }
  });

  const form = useForm<FormValues>({ 
      resolver: zodResolver(schema) as any,
      values: getQuery.data ? {
        ...getQuery.data,
        // Ensure arrays are initialized if missing
        equipment: getQuery.data.equipment || [],
        imageUrls: getQuery.data.imageUrls || [],
      } : undefined
  });

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
  const seatsOptions = useMemo(() => metadata.lotacao_de_lugares.map(v => ({ value: v, label: v })), []);
  const equipmentOptions = useMemo(() => metadata.equipamento_essencial.map(v => ({ value: v, label: t(`car_attributes.equipment.${v}`) })), [t]);

  if (getQuery.isLoading) return <div>Loading...</div>;
  if (getQuery.error) return <div className="text-red-600">Failed to load</div>;
  if (!getQuery.data) return <div>Not found</div>;

  async function onSubmit(values: FormValues) {
    await updateMutation.mutateAsync({ id, data: values });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("cars.title_edit")}</h1>
        <p className="text-muted-foreground">{t("cars.subtitle_edit")}</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
                <CardHeader><CardTitle>{t("cars.details")}</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField name="brand" control={form.control} render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t("cars.fields.brand")}</FormLabel>
                        <FormControl>
                            <Combobox 
                                options={brandOptions} 
                                value={field.value} 
                                onChange={(val) => {
                                    field.onChange(val);
                                    form.setValue("model", ""); 
                                }} 
                                placeholder={t("cars.placeholders.select_brand")}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="model" control={form.control} render={({ field }) => (
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
                    <FormField name="year" control={form.control} render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t("cars.fields.year")}</FormLabel>
                        <FormControl><Input type="number" {...field} value={(field.value as any) ?? ''} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="condition" control={form.control} render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t("cars.fields.condition")}</FormLabel>
                        <FormControl>
                            <Combobox options={conditionOptions} value={field.value || ''} onChange={field.onChange} placeholder={t("cars.placeholders.select_condition")} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="price" control={form.control} render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t("cars.fields.price")}</FormLabel>
                        <FormControl><Input type="number" step="0.01" {...field} value={(field.value as any) ?? ''} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="purchasePrice" control={form.control} render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t("cars.fields.purchase_price")}</FormLabel>
                        <FormControl><Input type="number" step="0.01" {...field} value={(field.value as any) ?? ''} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="km" control={form.control} render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t("cars.fields.km")}</FormLabel>
                        <FormControl><Input type="number" {...field} value={(field.value as any) ?? ''} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                     <FormField name="motorPower" control={form.control} render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t("cars.fields.motor_power")}</FormLabel>
                        <FormControl><Input type="number" {...field} value={(field.value as any) ?? ''} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                     <FormField name="engineSize" control={form.control} render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t("cars.fields.engine_size")}</FormLabel>
                        <FormControl><Input type="number" {...field} value={(field.value as any) ?? ''} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                     <FormField name="fuel" control={form.control} render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t("cars.fields.fuel")}</FormLabel>
                        <FormControl>
                            <Combobox options={fuelOptions} value={field.value} onChange={field.onChange} placeholder={t("cars.placeholders.select_fuel")} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>{t("cars.specs")}</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField name="vehicleType" control={form.control} render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t("cars.fields.vehicle_type")}</FormLabel>
                        <FormControl>
                            <Combobox options={vehicleTypeOptions} value={field.value || ''} onChange={field.onChange} placeholder={t("cars.placeholders.select_type")} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="bodyType" control={form.control} render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t("cars.fields.body_type")}</FormLabel>
                        <FormControl>
                            <Combobox options={bodyTypeOptions} value={field.value || ''} onChange={field.onChange} placeholder={t("cars.placeholders.select_body")} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="transmission" control={form.control} render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t("cars.fields.transmission")}</FormLabel>
                        <FormControl>
                            <Combobox options={transmissionOptions} value={field.value || ''} onChange={field.onChange} placeholder={t("cars.placeholders.select_transmission")} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="traction" control={form.control} render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t("cars.fields.traction")}</FormLabel>
                        <FormControl>
                            <Combobox options={tractionOptions} value={field.value || ''} onChange={field.onChange} placeholder={t("cars.placeholders.select_traction")} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="doors" control={form.control} render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t("cars.fields.doors")}</FormLabel>
                        <FormControl>
                            <Combobox options={doorsOptions} value={field.value || ''} onChange={field.onChange} placeholder={t("cars.placeholders.select_doors")} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="seats" control={form.control} render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t("cars.fields.seats")}</FormLabel>
                        <FormControl>
                            <Combobox options={seatsOptions} value={field.value ? String(field.value) : ''} onChange={field.onChange} placeholder={t("cars.placeholders.select_seats")} />
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
                        <FormItem>
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

            <Card>
                <CardHeader><CardTitle>{t("cars.colors_equipment")}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField name="colorExterior" control={form.control} render={({ field }) => (
                            <FormItem>
                            <FormLabel>{t("cars.fields.color_exterior")}</FormLabel>
                            <FormControl>
                                <Combobox options={colorOptions} value={field.value || ''} onChange={field.onChange} placeholder={t("cars.placeholders.select_color")} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />
                        <FormField name="colorInterior" control={form.control} render={({ field }) => (
                            <FormItem>
                            <FormLabel>{t("cars.fields.color_interior")}</FormLabel>
                            <FormControl>
                                <Combobox options={colorOptions} value={field.value || ''} onChange={field.onChange} placeholder={t("cars.placeholders.select_color")} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                    
                    <FormField name="equipment" control={form.control} render={({ field }) => (
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
                    <FormField name="description" control={form.control} render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t("cars.fields.description")}</FormLabel>
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
                <CardHeader><CardTitle>{t("cars.sales_status")}</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField name="status" control={form.control} render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t("cars.fields.status")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || 'available'}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={t("cars.placeholders.select_status")} />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="available">{t("car_attributes.sales_status.available")}</SelectItem>
                                <SelectItem value="reserved">{t("car_attributes.sales_status.reserved")}</SelectItem>
                                <SelectItem value="sold">{t("car_attributes.sales_status.sold")}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )} />

                    {form.watch("status") === 'sold' && (
                        <>
                            <FormField name="soldTo" control={form.control} render={({ field }) => (
                                <FormItem>
                                <FormLabel>{t("cars.fields.sold_to")}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t("cars.placeholders.select_client")} />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {clients?.map((client: any) => (
                                            <SelectItem key={client.id} value={client.id}>
                                                {client.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )} />
                            <FormField name="soldPrice" control={form.control} render={({ field }) => (
                                <FormItem>
                                <FormLabel>{t("cars.fields.sold_price")}</FormLabel>
                                <FormControl><Input type="number" step="0.01" {...field} value={(field.value as any) ?? ''} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )} />
                            <FormField name="soldDate" control={form.control} render={({ field }) => (
                                <FormItem>
                                <FormLabel>{t("cars.fields.sold_date")}</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="date" 
                                        value={field.value ? new Date(field.value as any).toISOString().split('T')[0] : ''} 
                                        onChange={(e) => field.onChange(e.target.valueAsDate)}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )} />
                        </>
                    )}
                </CardContent>
            </Card>

          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? t("common.saving") : t("common.save")}
          </Button>
        </form>
      </Form>
    </div>
  );
}
