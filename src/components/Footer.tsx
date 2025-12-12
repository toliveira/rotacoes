import { COMPANY } from "@/const";

export default function Footer() {
  return (
    <footer className="border-t mt-8">
      <div className="container mx-auto px-4 py-8 text-sm text-muted-foreground grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-2">
          <div className="font-medium text-foreground">{COMPANY.name}</div>
          <div>VAT {COMPANY.vat}</div>
          <div>{COMPANY.address}, {COMPANY.city}, {COMPANY.country}</div>
          <div>Email: <a className="hover:underline" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></div>
          <div>Phone: <a className="hover:underline" href={`tel:${COMPANY.phone}`}>{COMPANY.phone}</a></div>
        </div>

        <div className="space-y-2">
          <div className="font-medium text-foreground">Quick Links</div>
          <div className="grid grid-cols-2 gap-2">
            {COMPANY.links.map(l => (
              <a key={l.label} href={l.href} className="hover:underline">{l.label}</a>
            ))}
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Terms</a>
          </div>
        </div>

        <div className="space-y-2">
          <div className="font-medium text-foreground">Social</div>
          <div className="flex items-center gap-4">
            <a href={COMPANY.socials.instagram} aria-label="Instagram" className="hover:underline">Instagram</a>
            <a href={COMPANY.socials.facebook} aria-label="Facebook" className="hover:underline">Facebook</a>
            <a href={COMPANY.socials.linkedin} aria-label="LinkedIn" className="hover:underline">LinkedIn</a>
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="container mx-auto px-4 py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {COMPANY.name}
        </div>
      </div>
    </footer>
  );
}
