import type { HeroBlock} from "@/payload-types";
import Image from "next/dist/client/legacy/image";

export default function Hero({heading, subheading, image}: HeroBlock) {
    const media = typeof image === "object" ? image : null

    return (
        <>
            {media?.url && (
                <Image src={media.url}
                       alt={media.alt}
                       width={media.width ?? 1200}
                       height={media.height ?? 600}
                />
            )}
            <div>
                <h1>{heading}</h1>
                {subheading && <p>{subheading}</p>}
            </div>
        </>
    );
}