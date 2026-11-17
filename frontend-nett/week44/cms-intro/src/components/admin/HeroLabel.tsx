'use client'

import {useRowLabel} from "@payloadcms/ui";

export const HeroLabel = () => {
    const {data, rowNumber } = useRowLabel<{ heading?: string}>()

    return (
        <span>
            Hero {(rowNumber ?? 0 ) + 1}: {data?.heading || "no Heading yet"}
        </span>
    )

}