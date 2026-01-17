"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"

const WIZARD_LOGO = "/images/wizard-logo-long.webp"
const HERO_BLANK_BG = "/images/hero-blank-bg.jpg"
const HERO_BLANK_MOBILE = "/images/hero-blank-mobile.webp"

export function IntroSection() {
    const [showContent, setShowContent] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const sectionRef = useRef<HTMLElement>(null)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"],
    })

    // Continuous spinning background rotation (not scroll-based)
    // Zoom in by 40% to hide corners: 1.2 * 1.4 = 1.68, 2.0 * 1.4 = 2.8
    const bgScale = useTransform(scrollYProgress, [0, 1], [1.68, 2.8])
    // Parallax effect - background moves slower than scroll
    const bgY = useTransform(scrollYProgress, [0, 1], [0, 300])
    // Logo stays completely fixed - no movement
    const logoScale = useTransform(scrollYProgress, [0, 1], [1, 1])
    const logoOpacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 1, 0.9])

    useEffect(() => {
        setShowContent(true)
    }, [])

    const sparkles = [
        { left: "8%", top: "12%", delay: 0, size: "lg" },
        { left: "88%", top: "18%", delay: 0.3, size: "md" },
        { left: "12%", top: "78%", delay: 0.6, size: "lg" },
        { left: "82%", top: "72%", delay: 0.9, size: "md" },
        { left: "50%", top: "8%", delay: 0.4, size: "sm" },
        { left: "92%", top: "48%", delay: 0.8, size: "lg" },
        { left: "6%", top: "42%", delay: 0.2, size: "md" },
        { left: "94%", top: "32%", delay: 1.1, size: "sm" },
        { left: "25%", top: "22%", delay: 0.5, size: "sm" },
        { left: "75%", top: "85%", delay: 0.7, size: "md" },
        { left: "35%", top: "88%", delay: 1.0, size: "lg" },
        { left: "65%", top: "15%", delay: 1.3, size: "sm" },
    ]

    const getSparkleSize = (size: string) => {
        switch (size) {
            case "lg":
                return "w-4 h-4 md:w-6 md:h-6"
            case "md":
                return "w-3 h-3 md:w-4 md:h-4"
            default:
                return "w-2 h-2 md:w-3 md:h-3"
        }
    }

    // Mobile hero - with spinning background and persistent logo
    if (isMobile) {
        return (
            <section id="home" ref={sectionRef} className="relative w-full min-h-screen h-[100dvh] overflow-hidden bg-[#0A4D3C] scroll-mt-24">
                {/* Continuous spinning background for mobile - zoomed in 40% to hide corners */}
                <motion.div
                    className="absolute inset-[-20%] z-0 origin-center"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                    style={{
                        scale: bgScale, // Already includes 40% zoom
                        y: bgY
                    }}
                >
                    <img
                        src={HERO_BLANK_BG}
                        alt="Emerald green cosmic background with golden accents"
                        className="w-full h-full object-cover"
                    />
                </motion.div>

                {/* Persistent centered logo - mobile - long version spans width - 25% bigger */}
                <motion.div
                    className="absolute inset-0 z-[5] flex items-center justify-center pointer-events-none px-4"
                    style={{ scale: logoScale, opacity: logoOpacity }}
                >
                    <img
                        src={WIZARD_LOGO}
                        alt="The Wizard of AI"
                        className="w-[100%] max-w-[500px] h-auto drop-shadow-2xl"
                        style={{ filter: "drop-shadow(0 0 30px rgba(212,168,75,0.4))" }}
                    />
                </motion.div>

                {/* Golden sparkles for mobile */}
                {sparkles.slice(0, 8).map((sparkle, i) => (
                    <motion.div
                        key={`mobile-sparkle-${i}`}
                        className="absolute w-2 h-2 z-10 pointer-events-none"
                        style={{ left: sparkle.left, top: sparkle.top }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            opacity: [0, 1, 0.7, 1, 0],
                            scale: [0, 1.2, 0.9, 1.2, 0],
                            rotate: [0, 180, 360],
                        }}
                        transition={{
                            duration: 3,
                            delay: sparkle.delay,
                            repeat: Infinity,
                            repeatDelay: 1,
                        }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                            <path
                                d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z"
                                fill="#D4A84B"
                                style={{ filter: "drop-shadow(0 0 6px rgba(212,168,75,0.9))" }}
                            />
                        </svg>
                    </motion.div>
                ))}

                {/* Scroll indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20 pb-safe"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                >
                    <span className="text-[#D4A84B] text-[10px] font-medium tracking-[0.25em] uppercase drop-shadow-lg">
                        Scroll to Begin
                    </span>
                    <motion.div
                        className="w-5 h-8 border-2 border-[#D4A84B]/70 rounded-full flex justify-center pt-1.5"
                        animate={{ borderColor: ["rgba(212,168,75,0.5)", "rgba(212,168,75,0.9)", "rgba(212,168,75,0.5)"] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <motion.div
                            className="w-1 h-2 bg-[#D4A84B] rounded-full"
                            animate={{ y: [0, 8, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </motion.div>
                </motion.div>

                {/* Bottom gradient fade */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A4D3C] to-transparent z-10 pointer-events-none" />
            </section>
        )
    }

    return (
        <section id="home" ref={sectionRef} className="relative w-full min-h-screen h-[100dvh] overflow-hidden bg-[#0A4D3C] scroll-mt-24">
            {/* Continuous spinning background */}
            <motion.div
                className="absolute inset-[-20%] z-0 origin-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                style={{
                    scale: bgScale,
                    y: bgY
                }}
            >
                <img
                    src={HERO_BLANK_BG}
                    alt="Emerald green cosmic background with golden accents"
                    className="w-full h-full object-cover"
                />
            </motion.div>

            {/* Persistent centered logo - stays fixed - long version spans width - 25% bigger */}
            <motion.div
                className="absolute inset-0 z-[5] flex items-center justify-center pointer-events-none px-8"
                style={{ scale: logoScale, opacity: logoOpacity }}
            >
                <img
                    src={WIZARD_LOGO}
                    alt="The Wizard of AI"
                    className="w-[100%] max-w-[1000px] h-auto drop-shadow-2xl"
                    style={{ filter: "drop-shadow(0 0 40px rgba(212,168,75,0.4))" }}
                />
            </motion.div>

            {/* Sparkles */}
            <AnimatePresence>
                {showContent &&
                    sparkles.map((sparkle, i) => (
                        <motion.div
                            key={i}
                            className={`absolute ${getSparkleSize(sparkle.size)} z-10 pointer-events-none`}
                            style={{ left: sparkle.left, top: sparkle.top }}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                                opacity: [0, 1, 0.7, 1, 0],
                                scale: [0, 1.3, 0.9, 1.3, 0],
                                rotate: [0, 180, 360],
                            }}
                            transition={{
                                duration: 3.5,
                                delay: sparkle.delay,
                                repeat: Number.POSITIVE_INFINITY,
                                repeatDelay: 1.2,
                            }}
                        >
                            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                                <path
                                    d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z"
                                    fill="#D4A84B"
                                    style={{ filter: "drop-shadow(0 0 10px rgba(212,168,75,0.95))" }}
                                />
                            </svg>
                        </motion.div>
                    ))}
            </AnimatePresence>

            {/* Glow effect */}
            <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] md:w-[600px] md:h-[600px] rounded-full pointer-events-none z-[3]"
                animate={{
                    opacity: [0.05, 0.15, 0.05],
                    scale: [1, 1.15, 1],
                }}
                transition={{
                    duration: 5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                }}
                style={{
                    background: "radial-gradient(circle, rgba(212,168,75,0.2) 0%, rgba(232,197,90,0.1) 40%, transparent 70%)",
                }}
            />

            {/* Scroll indicator - More visible */}
            <motion.div
                className="absolute bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 md:gap-3 z-[100] pb-safe"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
                transition={{ delay: 0.5, duration: 0.8 }}
            >
                <span className="text-[#D4A84B] text-xs md:text-sm font-bold tracking-[0.25em] uppercase drop-shadow-2xl"
                    style={{ textShadow: "0 0 20px rgba(212,168,75,0.8), 0 2px 10px rgba(0,0,0,0.9)" }}
                >
                    Scroll to Begin
                </span>
                <motion.div
                    className="w-6 h-10 md:w-7 md:h-12 border-3 border-[#D4A84B] rounded-full flex justify-center pt-2 md:pt-2.5"
                    style={{
                        boxShadow: "0 0 30px rgba(212,168,75,0.6), inset 0 0 20px rgba(212,168,75,0.2)",
                        borderWidth: "3px"
                    }}
                    animate={{
                        borderColor: ["rgba(212,168,75,0.7)", "rgba(212,168,75,1)", "rgba(212,168,75,0.7)"],
                        boxShadow: [
                            "0 0 30px rgba(212,168,75,0.6), inset 0 0 20px rgba(212,168,75,0.2)",
                            "0 0 50px rgba(212,168,75,0.9), inset 0 0 30px rgba(212,168,75,0.4)",
                            "0 0 30px rgba(212,168,75,0.6), inset 0 0 20px rgba(212,168,75,0.2)"
                        ]
                    }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                    <motion.div
                        className="w-1.5 h-3 md:w-2 md:h-3.5 bg-[#D4A84B] rounded-full"
                        style={{ boxShadow: "0 0 10px rgba(212,168,75,0.8)" }}
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    />
                </motion.div>
            </motion.div>

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 md:h-40 bg-gradient-to-t from-[#0A4D3C] to-transparent z-10 pointer-events-none" />
        </section>
    )
}
