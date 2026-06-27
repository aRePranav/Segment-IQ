import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">
          {eyebrow}
        </p>
      )}
      <h2 className="text-balance text-3xl font-semibold leading-tight text-ink md:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-ink-muted md:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
