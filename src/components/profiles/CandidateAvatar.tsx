import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Shield, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface CandidateAvatarProps {
  avatarUrl?: string | null;
  username?: string;
  fullName?: string;
  isHrReady?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showGradientRing?: boolean;
}

export function CandidateAvatar({
  avatarUrl,
  username,
  fullName,
  isHrReady = false,
  size = "md",
  className,
  showGradientRing = false,
}: CandidateAvatarProps) {
  const sizeClasses = {
    sm: "h-10 w-10",
    md: "h-14 w-14",
    lg: "h-24 w-24",
    xl: "h-32 w-32",
  };

  const badgeSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
    xl: "h-7 w-7",
  };

  const fallbackIconSizes = {
    sm: "h-5 w-5",
    md: "h-7 w-7",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const badgePositions = {
    sm: "-bottom-0.5 -right-0.5",
    md: "-bottom-1 -right-1",
    lg: "-bottom-1 -right-1",
    xl: "-bottom-1 -right-1",
  };

  const displayName = fullName || username || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative inline-block">
      {showGradientRing && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-primary/80 to-primary/60 blur-sm"></div>
      )}
      <Avatar
        className={cn(
          "relative border-4 border-background shadow-lg",
          showGradientRing && "ring-4 ring-primary/20",
          sizeClasses[size],
          className
        )}
      >
        <AvatarImage
          src={avatarUrl || undefined}
          alt={displayName}
          className="object-cover"
        />
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {avatarUrl ? (
            <User className={fallbackIconSizes[size]} />
          ) : (
            initials
          )}
        </AvatarFallback>
      </Avatar>
      {isHrReady && (
        <div
          className={cn(
            "absolute bg-background rounded-full p-1 shadow-lg",
            badgePositions[size]
          )}
        >
          <Shield
            className={cn(
              "text-primary fill-primary/20",
              badgeSizes[size]
            )}
          />
        </div>
      )}
    </div>
  );
}
