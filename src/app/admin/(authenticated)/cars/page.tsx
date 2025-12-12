"use client";

import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { formatEUR } from "@/lib/utils";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AdminCarsPage() {
  const carsQuery = trpc.cars.list.useQuery({});
  const delMutation = trpc.cars.delete.useMutation();
  const [selectedCar, setSelectedCar] = useState<any>(null);
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t("cars.title")}</h1>
        <Link href="/admin/cars/new">
          <Button>{t("cars.title_new")}</Button>
        </Link>
      </div>

      {carsQuery.isLoading && <p>{t("common.loading")}</p>}
      {carsQuery.error && <p className="text-red-600">Failed to load</p>}

      {!carsQuery.isLoading && !carsQuery.error && (carsQuery.data?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-md bg-muted/10">
          <p className="text-lg font-medium text-muted-foreground mb-4">{t("common.no_results")}</p>
          <Link href="/admin/cars/new">
            <Button>{t("cars.title_new")}</Button>
          </Link>
        </div>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("cars.fields.brand")}</TableHead>
                    <TableHead>{t("cars.fields.model")}</TableHead>
                    <TableHead>{t("cars.fields.year")}</TableHead>
                    <TableHead>{t("cars.fields.price")}</TableHead>
                    <TableHead>{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {((carsQuery.data ?? []) as Array<{ id: string; brand: string; model: string; year: number; price: number; [key: string]: any }>).map((car) => (
                    <TableRow 
                      key={car.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedCar(car)}
                    >
                      <TableCell>{car.brand}</TableCell>
                      <TableCell>{car.model}</TableCell>
                      <TableCell>{car.year}</TableCell>
                      <TableCell>{formatEUR(car.price)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t("common.actions")}</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/cars/${car.id}/edit`} onClick={(e) => e.stopPropagation()}>
                                <Edit className="mr-2 h-4 w-4" />
                                {t("common.edit")}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm(t("common.confirm_delete"))) {
                                  await delMutation.mutateAsync({ id: car.id! });
                                  carsQuery.refetch();
                                }
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t("common.delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Sheet open={!!selectedCar} onOpenChange={(open) => !open && setSelectedCar(null)}>
            <SheetContent className="flex flex-col h-full">
              <SheetHeader>
                <SheetTitle>{selectedCar?.brand} {selectedCar?.model}</SheetTitle>
                <SheetDescription>{t("cars.details")}</SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-6">
                {selectedCar?.imageUrls && selectedCar.imageUrls.length > 0 && (
                  <div className="aspect-video w-full rounded-md overflow-hidden bg-muted">
                    <img src={selectedCar.imageUrls[0]} alt="Car" className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground block">{t("cars.fields.price")}</span>
                    <span className="font-medium">{selectedCar ? formatEUR(selectedCar.price) : '-'}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground block">{t("cars.fields.year")}</span>
                    <span className="font-medium">{selectedCar?.year}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground block">{t("cars.fields.fuel")}</span>
                    <span className="font-medium capitalize">{selectedCar ? t(`car_attributes.fuel_types.${selectedCar.fuel}`) : '-'}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground block">{t("cars.fields.km")}</span>
                    <span className="font-medium">{selectedCar?.km?.toLocaleString()} km</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground block">{t("cars.fields.engine_size")}</span>
                    <span className="font-medium">{selectedCar?.engineSize} cm³</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground block">{t("cars.fields.transmission")}</span>
                    <span className="font-medium capitalize">{selectedCar ? t(`car_attributes.transmission_types.${selectedCar.transmission}`) : '-'}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground block">{t("cars.fields.condition")}</span>
                    <span className="font-medium capitalize">{selectedCar ? t(`car_attributes.vehicle_conditions.${selectedCar.condition}`) : '-'}</span>
                  </div>
                </div>

                {selectedCar?.description && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">{t("cars.fields.description")}</h3>
                    <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: selectedCar.description }} />
                  </div>
                )}
                
                {selectedCar?.equipment && selectedCar.equipment.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">{t("cars.fields.equipment")}</h3>
                    <div className="flex flex-wrap gap-1">
                      {selectedCar.equipment.map((eq: string) => (
                        <span key={eq} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                          {t(`car_attributes.equipment.${eq}`)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                </div>
              </div>
              <SheetFooter className="sm:justify-end gap-2 border-t pt-4">
                <Link href={`/admin/cars/${selectedCar?.id}/edit`}>
                  <Button variant="outline">{t("common.edit")}</Button>
                </Link>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (confirm(t("common.confirm_delete"))) {
                      await delMutation.mutateAsync({ id: selectedCar.id! });
                      carsQuery.refetch();
                      setSelectedCar(null);
                    }
                  }}
                >
                  {t("common.delete")}
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </>
      ))}
    </div>
  );
}
