"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface ImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export function ImageUpload({ value = [], onChange, disabled }: ImageUploadProps) {
  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);

  const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const result = reader.result as string;
        // remove "data:image/png;base64," prefix
        const base64 = result.split(',')[1];
        resolve(base64);
    };
    reader.onerror = error => reject(error);
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const base64 = await toBase64(file);
        
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            key: `cars/${Date.now()}-${file.name}`, 
            dataBase64: base64, 
            contentType: file.type || "application/octet-stream" 
          })
        });
        
        const json = await res.json();
        if (json.success && json.url) {
          newUrls.push(json.url);
        } else {
          toast.error(`${t("cars.messages.upload_fail_file")} ${file.name}`);
        }
      }
      
      onChange([...value, ...newUrls]);
      toast.success(t("cars.messages.upload_success"));
    } catch (error) {
      console.error(error);
      toast.error(t("cars.messages.upload_error"));
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleRemove = (urlToRemove: string) => {
    onChange(value.filter((url) => url !== urlToRemove));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {value.map((url) => (
          <div key={url} className="relative group aspect-square rounded-md overflow-hidden border bg-muted">
            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                type="button"
                onClick={() => handleRemove(url)}
                variant="destructive"
                size="icon"
                className="h-6 w-6"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={t("cars.images")}
              className="object-cover w-full h-full"
            />
          </div>
        ))}
        <div className="flex items-center justify-center aspect-square rounded-md border border-dashed hover:bg-muted/50 transition-colors relative">
             <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full absolute inset-0">
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleUpload}
                    disabled={disabled || uploading}
                />
                {uploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                ) : (
                    <>
                        <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                        <span className="text-xs text-muted-foreground">{t("common.upload")}</span>
                    </>
                )}
             </label>
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        {value.length} {t("common.images_count")}
      </div>
    </div>
  );
}
