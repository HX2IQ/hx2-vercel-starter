import Image from "next/image";

type Props = {
  size?: number;
  withWordmark?: boolean;
};

export default function Brand({ size = 28, withWordmark = true }: Props) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="rounded-xl border border-white/10 bg-white/5 grid place-items-center"
        style={{ width: size, height: size }}
      >
        <Image
        src="/optinodeiq-logo.png"
        alt="OptinodeIQ"
        width={Math.round(size * 0.9)}
        height={Math.round(size * 0.9)}
        className="opacity-100 brightness-125"
      />

      </div>
      {withWordmark && (
        <span className="tracking-wide font-semibold">OptinodeIQ</span>
      )}
    </div>
  );
}
