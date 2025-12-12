"use client";

import { trpc } from "@/lib/trpc";
import { Spinner } from "@/components/ui/spinner";
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
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AdminPartnersPage() {
  const { t } = useLanguage();
  const listQuery = trpc.partners.list.useQuery();
  const delMutation = trpc.partners.delete.useMutation();
  const [selectedPartner, setSelectedPartner] = useState<any>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t("partners.title")}</h1>
        <Link href="/admin/partners/new">
          <Button>{t("partners.title_new")}</Button>
        </Link>
      </div>
      {listQuery.isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Spinner /> {t("common.loading")}</div>
      )}
      {!listQuery.isLoading && (listQuery.data?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-md bg-muted/10">
          <p className="text-lg font-medium text-muted-foreground mb-4">{t("common.no_results")}</p>
          <Link href="/admin/partners/new">
            <Button>{t("partners.title_new")}</Button>
          </Link>
        </div>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("partners.fields.name")}</TableHead>
                    <TableHead>{t("partners.fields.website")}</TableHead>
                    <TableHead>{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(listQuery.data ?? []).map(p => (
                    <TableRow 
                      key={p.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedPartner(p)}
                    >
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.website}</TableCell>
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
                              <Link href={`/admin/partners/${p.id}/edit`} onClick={(e) => e.stopPropagation()}>
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
                                  await delMutation.mutateAsync({ id: p.id! });
                                  listQuery.refetch();
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

          <Sheet open={!!selectedPartner} onOpenChange={(open) => !open && setSelectedPartner(null)}>
            <SheetContent className="flex flex-col h-full">
              <SheetHeader>
                <SheetTitle>{selectedPartner?.name}</SheetTitle>
                <SheetDescription>{t("partners.details")}</SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {selectedPartner?.logoUrl && (
                    <div>
                      <h3 className="text-sm font-medium mb-1">{t("partners.fields.logo")}</h3>
                      <div className="relative w-32 h-32 border rounded-md overflow-hidden">
                        <img src={selectedPartner.logoUrl} alt={selectedPartner.name} className="object-contain w-full h-full" />
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-sm font-medium">{t("partners.fields.website")}</h3>
                    <a href={selectedPartner?.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {selectedPartner?.website || '-'}
                    </a>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium">{t("partners.fields.description")}</h3>
                    <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: selectedPartner?.description || '-' }} />
                  </div>
                </div>
              </div>
              <SheetFooter className="sm:justify-end gap-2 border-t pt-4">
                <Link href={`/admin/partners/${selectedPartner?.id}/edit`}>
                  <Button variant="outline">{t("common.edit")}</Button>
                </Link>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (confirm(t("common.confirm_delete"))) {
                      await delMutation.mutateAsync({ id: selectedPartner.id! });
                      listQuery.refetch();
                      setSelectedPartner(null);
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
