import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type LogoLoaderProps = {
  size?: number;
  className?: string;
  priority?: boolean;
};

export function LogoLoader({ size = 32, className }: LogoLoaderProps) {
  return (
    <Loader2
      className={cn("animate-spin text-primary", className)}
      style={{ width: size, height: size }}
      aria-label="Loading"
    />
  );
}
