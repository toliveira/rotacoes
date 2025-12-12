import { cn } from "@/lib/utils";

export default function Section({
  title,
  description,
  className,
  children,
}: {
  title?: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("space-y-4", className)}>
      {title && <h2 className="text-xl font-medium">{title}</h2>}
      {description && <p className="text-muted-foreground">{description}</p>}
      {children}
    </section>
  );
}

