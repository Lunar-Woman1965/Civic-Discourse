import { Badge } from "@/components/ui/badge";

type Role = "USER" | "MODERATOR" | "PLATFORM_FOUNDER";

type RoleBadgeProps = {
  role?: Role | null;
  isFounder?: boolean;
  isAdmin?: boolean;
};

const FounderIcon = () => (
  <span
    className="inline-block h-3.5 w-3.5 rounded-full border border-sky-200 bg-[radial-gradient(circle_at_35%_30%,#ffffff_0%,#dff7ff_28%,#9fc7dd_55%,#6f8fa8_100%)] shadow-sm"
    aria-hidden="true"
  />
);

export function RoleBadge({ role, isFounder, isAdmin }: RoleBadgeProps) {
  const label =
    role === "PLATFORM_FOUNDER" || isFounder
      ? "Founder"
      : role === "MODERATOR"
        ? "Moderator"
        : isAdmin
          ? "Admin"
          : null;

  if (!label) return null;

  const className =
    label === "Founder"
      ? "border-sky-200 bg-sky-50 text-sky-900"
      : label === "Admin"
        ? "border-red-200 bg-red-100 text-red-800"
        : "border-blue-200 bg-blue-100 text-blue-800";

  return (
    <Badge
      variant="secondary"
      className={`inline-flex items-center gap-1.5 font-semibold ${className}`}
    >
      {label === "Founder" && <FounderIcon />}
      {label}
    </Badge>
  );
}