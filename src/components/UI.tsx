import { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";

export function Button({
  variant = "solid",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "solid" | "outline" | "ghost" }) {
  const base =
    "rounded-xl font-semibold text-sm px-4 py-3 disabled:opacity-40 disabled:pointer-events-none";
  const styles: Record<string, string> = {
    solid: "bg-rust text-white shadow-card hover:bg-rustdark active:shadow-none",
    outline: "border-[1.5px] border-rust text-rust hover:bg-rust/[0.06]",
    ghost: "border-[1.5px] border-ink/12 text-ink hover:bg-ink/[0.04]",
  };
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Input({ label, className = "", ...props }: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block mb-4">
      {label && <span className="block text-xs font-semibold text-ink/70 mb-1.5">{label}</span>}
      <input
        className={`w-full rounded-xl border-[1.5px] border-ink/12 bg-white px-3.5 py-3 text-sm outline-none focus:border-rust focus:shadow-[0_0_0_3px_rgba(189,91,40,0.12)] ${className}`}
        {...props}
      />
    </label>
  );
}

export function Textarea({
  label,
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="block mb-4">
      {label && <span className="block text-xs font-semibold text-ink/70 mb-1.5">{label}</span>}
      <textarea
        className={`w-full rounded-xl border-[1.5px] border-ink/12 bg-white px-3.5 py-3 text-sm outline-none focus:border-rust focus:shadow-[0_0_0_3px_rgba(189,91,40,0.12)] min-h-[90px] leading-relaxed ${className}`}
        {...props}
      />
    </label>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pendente: "bg-ochre/15 text-[#9C6C1E]",
    aceite: "bg-green/12 text-green",
    concluida: "bg-ink/8 text-ink/60",
    recusada: "bg-red-500/10 text-red-600",
    cancelada: "bg-red-500/10 text-red-600",
  };
  const labels: Record<string, string> = {
    pendente: "Pendente",
    aceite: "Aceite",
    concluida: "Concluído",
    recusada: "Recusado",
    cancelada: "Cancelado",
  };
  return (
    <span
      className={`text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full ${
        map[status] ?? "bg-ink/8 text-ink/60"
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}

export function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange?: (v: number) => void;
}) {
  return (
    <div className="flex gap-1.5 justify-center text-3xl">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          onClick={() => onChange?.(n)}
          className={`cursor-pointer transition-transform hover:scale-110 ${
            n <= value ? "text-ochre" : "text-ink/15"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export function Screen({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-paper flex flex-col">{children}</div>;
}

export function TopBar({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-ink/8 bg-white/95 backdrop-blur sticky top-0 z-10">
      {onBack && (
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-paper flex items-center justify-center text-sm hover:bg-ink/8 active:scale-95"
        >
          ←
        </button>
      )}
      <span className="font-display font-semibold text-[15px]">{title}</span>
    </div>
  );
}

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`bg-white border border-ink/8 rounded-xl shadow-card ${className}`}>
      {children}
    </div>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p className="text-xs text-red-600 mb-3 bg-red-500/8 border border-red-500/15 rounded-lg px-3 py-2">
      {children}
    </p>
  );
}
