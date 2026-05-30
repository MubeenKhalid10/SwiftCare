import Image from "next/image";

type LogoLoaderProps = {
  size?: number;
  className?: string;
  priority?: boolean;
};

export function LogoLoader({ size = 32, className, priority = false }: LogoLoaderProps) {
  const classes = ["animate-pulse", "object-contain", className].filter(Boolean).join(" ");

  return (
    <Image
      src="/assets/logo.png"
      alt="SwiftCare"
      width={size}
      height={size}
      className={classes}
      priority={priority}
    />
  );
}
