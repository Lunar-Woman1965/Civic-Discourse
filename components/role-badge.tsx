import { Badge } from "@/components/ui/badge";

type Role = "USER" | "MODERATOR" | "PLATFORM_FOUNDER";

type RoleBadgeProps = {
  role?: Role | null;
  isFounder?: boolean;
  isAdmin?: boolean;
};

const FounderIcon = () => (
  <span
  className="inline-block h-5 w-5 rounded-full border border-sky-200 bg-[radial-gradient(circle_at_30%_30%,#ffffff,#c4b5fd,#7dd3fc)]"
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