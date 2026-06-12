import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Image
        src="/assets/Logo.png"
        alt="SwiftCare"
        width={64}
        height={64}
        className="h-16 w-16 animate-pulse rounded-xl object-contain"
        priority
      />
    </div>
  );
}
