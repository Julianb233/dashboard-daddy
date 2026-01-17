"use client"

import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const router = useRouter()
    const pathname = usePathname()

    const menuItems = [
        { label: "Work With Julian", href: "/work-with-julian" },
        { label: "AI Employee", href: "/ai-employee" },
        { label: "AI Solutions", href: "/ai-solutions" },
        { label: "Coaching", href: "/coaching" },
        { label: "My Apps", href: "/apps" },
        { label: "Resources", href: "/resources" },
        { label: "My Book", href: "/book" },
        { label: "Login", href: "/login" },
        { label: "Home", href: "#home" },
    ] as const

    // Logo grows as user scrolls - using Framer Motion's scroll for Lenis compatibility
    const { scrollY } = useScroll()
    // Base scale is 1.0 (reduced by 200% from 3.0), then grows to 1.3 on scroll
    const logoScale = useTransform(scrollY, [0, 300], [1.0, 1.3])
    const scrolledValue = useTransform(scrollY, (latest) => latest >= 50)

    useEffect(() => {
        const unsubscribe = scrolledValue.on("change", (latest) => {
            setScrolled(latest)
        })
        return () => unsubscribe()
    }, [scrolledValue])

    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "unset"
        }
    }, [menuOpen])

    const scrollToHash = (hashHref: string) => {
        const elementId = hashHref.replace("#", "")
        const element = document.getElementById(elementId)
        if (!element) return

        // Use Lenis if available, otherwise fallback to native smooth scroll
        const lenis = (window as any).lenis
        if (lenis) {
            lenis.scrollTo(element, {
                offset: -80, // Account for header height
                duration: 1.5,
                easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            })
        } else {
            element.scrollIntoView({ behavior: "smooth", block: "start" })
        }
    }

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        // Let the browser handle external links normally.
        if (href.startsWith("http")) {
            setMenuOpen(false)
            return
        }

        e.preventDefault()
        setMenuOpen(false)

        // Hash links: if not on home, navigate home with hash; otherwise scroll with offset via scroll-mt.
        if (href.startsWith("#")) {
            if (pathname !== "/") {
                router.push("/" + href)
                return
            }

            // Keep URL hash in sync for deep-linking.
            window.history.replaceState(null, "", href)
            scrollToHash(href)
            return
        }

        router.push(href)
    }

    return (
        <>
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "backdrop-blur-md bg-[#0A4D3C]/40" : "bg-transparent"
                    }`}
            >
                <div className="mx-auto px-4 md:px-8 flex items-center justify-between h-20 md:h-24">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center origin-left"
                        style={{ scale: logoScale }}
                    >
                        <a
                            href={pathname === "/" ? "#home" : "/#home"}
                            onClick={(e) => handleNavClick(e, "#home")}
                            className="block"
                        >
                            <Image
                                src="/images/wizard-logo-long.png"
                                alt="The Wizard of AI"
                                width={600}
                                height={120}
                                className="h-[67px] md:h-20 w-auto drop-shadow-lg"
                                style={{ filter: "drop-shadow(0 2px 8px rgba(212,168,75,0.3))" }}
                                priority
                            />
                        </a>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-2 md:gap-4"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="p-2.5 bg-transparent border border-[#D4A84B]/30 hover:border-[#D4A84B]/60 rounded-lg transition-all text-[#D4A84B]"
                            aria-label="Menu"
                            aria-expanded={menuOpen}
                        >
                            {menuOpen ? <X className="w-5 h-5 md:w-6 md:h-6" /> : <Menu className="w-5 h-5 md:w-6 md:h-6" />}
                        </motion.button>
                    </motion.div>
                </div>
            </motion.header>

            {/* Full-screen menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 bg-[#0A4D3C]/98 backdrop-blur-xl z-[60] flex items-center justify-center"
                        onClick={() => setMenuOpen(false)}
                    >
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                setMenuOpen(false)
                            }}
                            className="absolute top-5 md:top-6 right-5 md:right-6 p-2.5 bg-transparent border border-[#D4A84B]/30 hover:border-[#D4A84B]/60 rounded-lg transition-all text-[#D4A84B]"
                            aria-label="Close menu"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <motion.nav
                            initial="closed"
                            animate="open"
                            exit="closed"
                            variants={{
                                open: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
                                closed: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
                            }}
                            className="text-center px-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <motion.ul className="space-y-5 md:space-y-7 text-3xl md:text-5xl font-black uppercase text-[#FDF8E8]">
                                {menuItems.map((item) => (
                                    <motion.li
                                        key={item.label}
                                        variants={{
                                            open: { opacity: 1, y: 0, rotate: 0 },
                                            closed: { opacity: 0, y: 18, rotate: -4 },
                                        }}
                                    >
                                        <a
                                            href={item.href}
                                            className="inline-block hover:text-[#D4A84B] transition-colors duration-300"
                                            onClick={(e) => handleNavClick(e, item.href)}
                                        >
                                            {item.label}
                                        </a>
                                    </motion.li>
                                ))}
                            </motion.ul>

                            <motion.div
                                variants={{
                                    open: { opacity: 1, y: 0 },
                                    closed: { opacity: 0, y: 16 },
                                }}
                                className="mt-10 md:mt-14"
                            >
                                <a
                                    href="#apply"
                                    onClick={(e) => handleNavClick(e, "#apply")}
                                    className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-[#D4A84B] text-[#0A4D3C] font-black uppercase tracking-wider text-sm md:text-base hover:bg-[#E8C55A] transition-colors shadow-[0_12px_40px_rgba(212,168,75,0.18)]"
                                >
                                    Book a Consultation
                                </a>
                            </motion.div>
                        </motion.nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
