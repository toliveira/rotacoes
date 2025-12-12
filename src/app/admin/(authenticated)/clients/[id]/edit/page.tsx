"use client";

import { ClientForm } from "@/components/forms/ClientForm";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Plus, Trash, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

export default function EditClientPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const { data: client, isLoading: isClientLoading, refetch: refetchClient } = trpc.clients.get.useQuery(id);

  const updateMutation = trpc.clients.update.useMutation({
    onSuccess: () => {
      toast.success("Client updated successfully");
      // router.push("/admin/clients"); // Don't redirect on update, stay to manage files
    },
  });

  const [newFile, setNewFile] = useState({ name: "", url: "" });

  const handleAddFile = () => {
    if (!newFile.name || !newFile.url) return;
    
    const currentFiles = client?.files || [];
    const updatedFiles = [...currentFiles, { ...newFile, uploadedAt: new Date() }];
    
    updateMutation.mutate({
        id,
        data: { files: updatedFiles }
    }, {
        onSuccess: () => {
            setNewFile({ name: "", url: "" });
            refetchClient();
            toast.success("File added");
        }
    });
  };

  const handleDeleteFile = (index: number) => {
    const currentFiles = client?.files || [];
    const updatedFiles = currentFiles.filter((_, i) => i !== index);
     updateMutation.mutate({
        id,
        data: { files: updatedFiles }
    }, {
        onSuccess: () => {
            refetchClient();
            toast.success("File removed");
        }
    });
  }

  if (isClientLoading) return <div>Loading...</div>;
  if (!client) return <div>Client not found</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t("clients.edit")}</h2>
        <p className="text-muted-foreground">{t("clients.subtitle_edit")}</p>
      </div>
      
      <Card>
        <CardContent className="p-6">
            <ClientForm
                defaultValues={client}
                onSubmit={(data) => updateMutation.mutate({ id, data })}
                isLoading={updateMutation.isPending}
            />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Files Section */}
        <Card>
            <CardHeader>
                <CardTitle>{t("clients.files")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Input 
                        placeholder="File Name" 
                        value={newFile.name} 
                        onChange={(e) => setNewFile({...newFile, name: e.target.value})}
                    />
                    <Input 
                        placeholder="URL" 
                        value={newFile.url} 
                        onChange={(e) => setNewFile({...newFile, url: e.target.value})}
                    />
                    <Button onClick={handleAddFile} size="icon">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                <div className="space-y-2">
                    {client.files?.map((file: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                                <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                    {file.name} <ExternalLink className="h-3 w-3" />
                                </a>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(file.uploadedAt).toLocaleDateString()}
                                </span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteFile(index)} className="h-6 w-6 text-destructive">
                                <Trash className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
