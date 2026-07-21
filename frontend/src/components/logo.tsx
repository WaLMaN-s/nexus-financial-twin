import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="relative flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm">
        <svg viewBox="0 0 24 24" className="size-4 text-white" fill="none">
          <path
            d="M5 19V5l7 8 7-8v14"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-[15px] font-semibold tracking-tight">
        NEXUS
        <span className="ml-1.5 font-normal text-muted-foreground">
          Financial Twin
        </span>
      </span>
    </span>
  );
}
