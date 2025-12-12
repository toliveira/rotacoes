"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { X, Upload } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface SingleImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  folder?: string;
}

export function SingleImageUpload({ value, onChange, disabled, folder = "default" }: SingleImageUploadProps) {
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

    const file = files[0];
    setUploading(true);

    try {
      const base64 = await toBase64(file);
      
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          key: `${folder}/${Date.now()}-${file.name}`, 
          dataBase64: base64, 
          contentType: file.type || "application/octet-stream" 
        })
      });
      
      const json = await res.json();
      if (json.success && json.url) {
        onChange(json.url);
        toast.success(t("cars.messages.upload_success"));
      } else {
        toast.error(`${t("cars.messages.upload_fail_file")} ${file.name}`);
      }
    } catch (error) {
      console.error(error);
      toast.error(t("cars.messages.upload_error"));
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className="space-y-4">
      {value ? (
        <div className="relative aspect-square w-40 rounded-md overflow-hidden border bg-muted group">
          <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              type="button"
              onClick={handleRemove}
              variant="destructive"
              size="icon"
              className="h-6 w-6"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Upload"
            className="object-cover w-full h-full"
          />
        </div>
      ) : (
        <div className="flex items-center justify-center aspect-square w-40 rounded-md border border-dashed hover:bg-muted/50 transition-colors relative">
          <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground text-center px-2">
                {uploading ? t("common.saving") : t("common.upload")}
              </p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleUpload}
              disabled={disabled || uploading}
            />
          </label>
        </div>
      )}
    </div>
  );
}
