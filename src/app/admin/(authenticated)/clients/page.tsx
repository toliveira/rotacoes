"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Plus, Edit, Trash2, MoreVertical, ExternalLink } from "lucide-react";

function ClientDetailsContent({ client, onDelete }: { client: any, onDelete: () => void }) {
  const { t } = useLanguage();
  const { data: cars, isLoading: isCarsLoading } = trpc.cars.list.useQuery({ soldTo: client.id });

  return (
    <>
      <SheetHeader>
        <SheetTitle>{client.name}</SheetTitle>
        <SheetDescription>{t("clients.details")}</SheetDescription>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">{t("clients.contact_info")}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">{t("clients.email")}</span>
                <span className="font-medium truncate" title={client.email}>{client.email || '-'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">{t("clients.phone")}</span>
                <span className="font-medium">{client.phone || '-'}</span>
              </div>
            </div>
          </div>

          {client.nif && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">{t("clients.nif")}</h3>
              <p className="font-medium">{client.nif}</p>
            </div>
          )}

          {client.address && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">{t("clients.address")}</h3>
              <p className="font-medium">{client.address}</p>
            </div>
          )}

          {client.notes && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">{t("clients.notes")}</h3>
              <div className="bg-muted/50 p-3 rounded-md text-sm whitespace-pre-wrap">
                {client.notes}
              </div>
            </div>
          )}

          {/* Files Section */}
          {client.files && client.files.length > 0 && (
            <div>
               <h3 className="text-sm font-medium text-muted-foreground mb-3">{t("clients.files")}</h3>
               <div className="space-y-2">
                   {client.files.map((file: any, index: number) => (
                       <div key={index} className="flex items-center justify-between p-2 border rounded text-sm">
                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                               {file.name} <ExternalLink className="h-3 w-3" />
                           </a>
                           <span className="text-xs text-muted-foreground">
                               {new Date(file.uploadedAt).toLocaleDateString()}
                           </span>
                       </div>
                   ))}
               </div>
            </div>
          )}

          {/* Purchased Vehicles Section */}
          <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">{t("clients.purchases")}</h3>
              <div className="border rounded-md">
               <Table>
                  <TableHeader>
                      <TableRow>
                      <TableHead>Car</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Date</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {isCarsLoading ? (
                           <TableRow><TableCell colSpan={3}>{t("common.loading")}</TableCell></TableRow>
                      ) : cars?.length === 0 ? (
                           <TableRow><TableCell colSpan={3}>{t("clients.noPurchases")}</TableCell></TableRow>
                      ) : (
                          cars?.map((car: any) => (
                              <TableRow key={car.id}>
                                  <TableCell>
                                      <Link href={`/admin/cars/${car.id}/edit`} className="hover:underline">
                                          {car.brand} {car.model} ({car.year})
                                      </Link>
                                  </TableCell>
                                  <TableCell>
                                      {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(car.soldPrice || car.price)}
                                  </TableCell>
                                  <TableCell>
                                      {car.soldDate ? new Date(car.soldDate).toLocaleDateString() : "-"}
                                  </TableCell>
                              </TableRow>
                          ))
                      )}
                  </TableBody>
              </Table>
              </div>
          </div>
        </div>
      </div>
      <SheetFooter className="sm:justify-end gap-2 border-t pt-4">
        <Link href={`/admin/clients/${client.id}/edit`}>
          <Button variant="outline">{t("common.edit")}</Button>
        </Link>
        <Button
          variant="destructive"
          onClick={onDelete}
        >
          {t("common.delete")}
        </Button>
      </SheetFooter>
    </>
  );
}

export default function ClientsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { data: clients, isLoading, refetch } = trpc.clients.list.useQuery();
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const deleteMutation = trpc.clients.delete.useMutation({
    onSuccess: () => {
        toast.success(t("common.success_deleted"));
        refetch();
    }
  });

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm(t("common.confirm_delete"))) {
        deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t("clients.title")}</h2>
        <Button onClick={() => router.push("/admin/clients/new")}>
          <Plus className="mr-2 h-4 w-4" />
          {t("clients.new")}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground p-4">{t("common.loading")}</div>
      ) : clients?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-md bg-muted/10">
          <p className="text-lg font-medium text-muted-foreground mb-4">{t("common.no_results")}</p>
          <Link href="/admin/clients/new">
            <Button>{t("clients.create_first")}</Button>
          </Link>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("clients.name")}</TableHead>
                  <TableHead>{t("clients.email")}</TableHead>
                  <TableHead>{t("clients.phone")}</TableHead>
                  <TableHead className="w-[100px]">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients?.map((client: any) => (
                  <TableRow 
                    key={client.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedClient(client)}
                  >
                    <TableCell>{client.name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
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
                            <Link href={`/admin/clients/${client.id}/edit`} onClick={(e) => e.stopPropagation()}>
                              <Edit className="mr-2 h-4 w-4" />
                              {t("common.edit")}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => handleDelete(e, client.id)}
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
      )}

      <Sheet open={!!selectedClient} onOpenChange={(open) => !open && setSelectedClient(null)}>
        <SheetContent className="flex flex-col h-full sm:max-w-xl">
          {selectedClient && (
            <ClientDetailsContent 
              client={selectedClient} 
              onDelete={() => {
                if (confirm(t("common.confirm_delete"))) {
                  deleteMutation.mutate(selectedClient.id);
                  setSelectedClient(null);
                }
              }} 
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
