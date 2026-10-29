import Link from "next/link";

export function Brand({ href = "/", compact = false }: { href?: string; compact?: boolean }) {
  return (
    <Link href={href} className="focus-ring inline-flex items-center gap-2.5 rounded-lg">
      <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-lg bg-primary">
        <span className="absolute left-[10px] top-[8px] h-[20px] w-[3px] rounded-full bg-primaryInk" />
        <span className="absolute left-[16px] top-[13px] h-[15px] w-[3px] rounded-full bg-primaryInk" />
        <span className="absolute left-[22px] top-[9px] h-[19px] w-[3px] rounded-full bg-primaryInk" />
      </span>
      {!compact && (
        <span className="font-display text-lg font-bold tracking-[0.08em] text-ink">
          STATSMAN
        </span>
      )}
    </Link>
  );
}
