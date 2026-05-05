import Image from "next/image";
import { cn } from "@/lib/utils";

type ChannelIconProps = {
  channel: "tokopedia" | "whatsapp";
  size?: number;
  className?: string;
};

const channelIconSrc = {
  tokopedia: "/images/channel-icons/tokopedia.svg",
  whatsapp: "/images/channel-icons/whatsapp-figma.png",
};

const channelIconAlt = {
  tokopedia: "Tokopedia",
  whatsapp: "WhatsApp",
};

export function ChannelIcon({ channel, size = 18, className }: ChannelIconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-grid shrink-0 place-items-center leading-none", className)}
      style={{ width: size, height: size }}
      title={channelIconAlt[channel]}
    >
      <Image
        src={channelIconSrc[channel]}
        alt=""
        width={size}
        height={size}
        className="block h-full w-full object-contain"
      />
    </span>
  );
}
