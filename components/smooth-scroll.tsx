"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Lenis from "lenis"
import { usePathname } from "next/navigation"

export default function SmoothScroll({
    children,
}: {
    children: React.ReactNode
}) {
    const [isMobile, setIsMobile] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768 || "ontouchstart" in window)
        }
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    useEffect(() => {
        if (isMobile) return

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            touchMultiplier: 2,
            wheelMultiplier: 1,
            infinite: false,
        })

            // Expose Lenis instance globally for hash navigation
            ; (window as any).lenis = lenis

        // Sync Lenis with Framer Motion's scroll system
        // This ensures Framer Motion's useScroll hooks work correctly with Lenis
        lenis.on("scroll", ({ scroll }: { scroll: number }) => {
            // Update window scroll position for Framer Motion compatibility
            // Using requestAnimationFrame ensures smooth updates without conflicts
            requestAnimationFrame(() => {
                window.scrollTo(0, scroll)
            })
        })

        function raf(time: number) {
            lenis.raf(time)
            requestAnimationFrame(raf)
        }

        requestAnimationFrame(raf)

        // Handle hash navigation with Lenis
        const handleHashChange = () => {
            const hash = window.location.hash
            if (hash) {
                const element = document.querySelector(hash)
                if (element) {
                    lenis.scrollTo(element as HTMLElement, {
                        offset: -80, // Account for header height
                        duration: 1.5,
                        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                    })
                }
            }
        }

        // Handle initial hash on mount
        if (window.location.hash) {
            setTimeout(handleHashChange, 100)
        }

        window.addEventListener("hashchange", handleHashChange)

        return () => {
            lenis.destroy()
            delete (window as any).lenis
            window.removeEventListener("hashchange", handleHashChange)
        }
    }, [isMobile, pathname])

    return <>{children}</>
}
