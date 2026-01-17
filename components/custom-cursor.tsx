"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function CustomCursor() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [isVisible, setIsVisible] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        // Check if mobile - don't show custom cursor on mobile
        const checkMobile = () => {
            const mobile = window.innerWidth < 768 || "ontouchstart" in window
            setIsMobile(mobile)
            setIsVisible(!mobile)
        }

        checkMobile()
        window.addEventListener("resize", checkMobile)

        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY })
            setIsVisible(true)
        }

        const handleMouseLeave = () => {
            setIsVisible(false)
        }

        if (!isMobile) {
            window.addEventListener("mousemove", handleMouseMove)
            document.addEventListener("mouseleave", handleMouseLeave)
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove)
            document.removeEventListener("mouseleave", handleMouseLeave)
            window.removeEventListener("resize", checkMobile)
        }
    }, [isMobile])

    if (isMobile || !isVisible) return null

    return (
        <>
            {/* Primary Golden orb cursor */}
            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[99999]"
                style={{
                    x: mousePosition.x - 12,
                    y: mousePosition.y - 12,
                }}
                animate={{
                    scale: [1, 1.05, 1],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                <div
                    className="w-6 h-6 rounded-full"
                    style={{
                        background: "radial-gradient(circle, #D4A84B 0%, #E8C55A 50%, #B8923F 100%)",
                        boxShadow: "0 0 15px rgba(212, 168, 75, 0.6), 0 0 30px rgba(212, 168, 75, 0.3), inset 0 0 10px rgba(255, 255, 255, 0.2)",
                        border: "2px solid rgba(212, 168, 75, 0.4)",
                    }}
                />
            </motion.div>

            {/* Secondary orb - follows with slight delay/offset for dual effect */}
            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[99998]"
                style={{
                    x: mousePosition.x - 8,
                    y: mousePosition.y - 8,
                }}
                animate={{
                    scale: [1, 1.08, 1],
                }}
                transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.2,
                }}
            >
                <div
                    className="w-4 h-4 rounded-full"
                    style={{
                        background: "radial-gradient(circle, #E8C55A 0%, #D4A84B 50%, #B8923F 100%)",
                        boxShadow: "0 0 12px rgba(232, 197, 90, 0.5), 0 0 24px rgba(232, 197, 90, 0.25), inset 0 0 8px rgba(255, 255, 255, 0.15)",
                        border: "1.5px solid rgba(232, 197, 90, 0.35)",
                    }}
                />
            </motion.div>

            {/* Outer glow ring */}
            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[99997]"
                style={{
                    x: mousePosition.x - 16,
                    y: mousePosition.y - 16,
                }}
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.35, 0.2],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                <div
                    className="w-8 h-8 rounded-full border-2"
                    style={{
                        borderColor: "rgba(212, 168, 75, 0.3)",
                        boxShadow: "0 0 20px rgba(212, 168, 75, 0.2)",
                    }}
                />
            </motion.div>
        </>
    )
}
