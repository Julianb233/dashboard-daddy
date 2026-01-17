import type React from "react"
import type { Metadata, Viewport } from "next"
// import { Analytics } from "@vercel/analytics/next" // Commented out as we don't have Vercel Analytics setup
import { Roboto, Libre_Baskerville, Alex_Brush, Oswald } from "next/font/google"
import SmoothScroll from "@/components/smooth-scroll"
import CustomCursor from "@/components/custom-cursor"
import "./globals.css"

const roboto = Roboto({
  weight: ["300", "400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
})

const alexBrush = Alex_Brush({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-alex-brush",
  display: "swap",
})

const libreBaskerville = Libre_Baskerville({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-libre-baskerville",
  display: "swap",
})

const oswald = Oswald({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://v0-the-wizard-of-ai.vercel.app"),
  title: "The Wizard of AI - Julian Bradley | AI Consulting & Business Automation",
  description:
    "Transform your business with AI consulting and automation solutions. Julian Bradley helps business owners, executives, and content creators harness AI to scale operations, automate workflows, and multiply opportunities. Expert in AI agents, Bottleneck Bots & Exactech AI. Book your free strategy call today.",
  keywords: [
    "AI consulting",
    "business automation",
    "AI agents",
    "workflow automation",
    "AI transformation",
    "Julian Bradley",
    "Bottleneck Bots",
    "Exactech AI",
    "custom AI solutions",
    "AI implementation",
    "business process automation",
    "AI strategy",
    "automation consulting",
    "AI automation services",
    "workflow optimization",
    "AI-powered business solutions"
  ],
  authors: [{ name: "Julian Bradley" }],
  creator: "Julian Bradley",
  publisher: "The Wizard of AI",
  generator: "v0.app",
  openGraph: {
    title: "The Wizard of AI - Julian Bradley | AI Consulting & Business Automation",
    description: "Your Golden Ticket to AI Transformation. Automate workflows, multiply opportunities, and save time with AI solutions from expert consultant Julian Bradley.",
    url: "https://v0-the-wizard-of-ai.vercel.app",
    siteName: "The Wizard of AI",
    images: [
      {
        url: "/images/wizard-profile-2.jpg",
        width: 1200,
        height: 1200,
        alt: "The Wizard of AI - Julian Bradley",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Wizard of AI - Julian Bradley",
    description: "Your Golden Ticket to AI Transformation. Automate workflows, multiply opportunities, and save time.",
    images: ["/images/wizard-profile-2.jpg"],
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Comprehensive Schema Markup for SEO and AI Understanding
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "The Wizard of AI",
    "alternateName": "Wizard of AI",
    "url": "https://v0-the-wizard-of-ai.vercel.app",
    "logo": "https://v0-the-wizard-of-ai.vercel.app/images/wizard-logo-long.webp",
    "image": "https://v0-the-wizard-of-ai.vercel.app/images/wizard-profile-2.jpg",
    "description": "AI consulting and business automation solutions helping businesses transform operations, automate workflows, and scale with AI agents. Expert in custom AI agents, workflow automation, and business transformation.",
    "foundingDate": "2024",
    "founder": {
      "@type": "Person",
      "name": "Julian Bradley",
      "jobTitle": "AI Consultant & Business Automation Expert",
      "email": "julian@aiacrobatics.com",
      "url": "https://v0-the-wizard-of-ai.vercel.app",
      "sameAs": [
        "https://www.linkedin.com/in/julian-bradley",
        "https://twitter.com/wizardofai"
      ]
    },
    "sameAs": [
      "https://www.linkedin.com/in/julian-bradley",
      "https://twitter.com/wizardofai"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Sales & Consulting",
      "email": "julian@aiacrobatics.com",
      "areaServed": ["US", "CA", "GB", "Worldwide"],
      "availableLanguage": "English"
    },
    "slogan": "Your Golden Ticket to AI Transformation",
    "areaServed": "Worldwide"
  }

  const professionalServiceSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "The Wizard of AI - Julian Bradley",
    "description": "AI consulting and business automation solutions helping businesses transform operations, automate workflows, and scale with AI agents.",
    "url": "https://v0-the-wizard-of-ai.vercel.app",
    "logo": "https://v0-the-wizard-of-ai.vercel.app/images/wizard-logo-long.webp",
    "image": "https://v0-the-wizard-of-ai.vercel.app/images/wizard-profile-2.jpg",
    "provider": {
      "@type": "Person",
      "name": "Julian Bradley",
      "jobTitle": "AI Consultant & Business Automation Expert",
      "email": "julian@aiacrobatics.com",
      "url": "https://v0-the-wizard-of-ai.vercel.app",
      "image": "https://v0-the-wizard-of-ai.vercel.app/images/wizard-profile-2.jpg",
      "description": "AI consultant and business automation expert helping 100+ businesses implement AI agents, custom automation, and transformation strategies.",
      "knowsAbout": [
        "AI Consulting",
        "Business Automation",
        "AI Agents",
        "Workflow Automation",
        "AI Transformation",
        "Process Automation",
        "AI Implementation",
        "Bottleneck Bots",
        "Exactech AI",
        "Custom AI Solutions",
        "Business Scaling",
        "Operational Efficiency",
        "AI Strategy"
      ],
      "sameAs": [
        "https://www.linkedin.com/in/julian-bradley",
        "https://twitter.com/wizardofai"
      ]
    },
    "areaServed": "Worldwide",
    "serviceType": [
      "AI Consulting",
      "Business Automation",
      "AI Agents",
      "Workflow Automation",
      "AI Transformation",
      "Process Automation",
      "Custom AI Development",
      "AI Strategy Consulting",
      "Business Process Optimization"
    ],
    "sameAs": [
      "https://www.linkedin.com/in/julian-bradley",
      "https://twitter.com/wizardofai"
    ],
    "offers": {
      "@type": "Offer",
      "description": "AI consulting and automation solutions for business owners, executives, content creators, and startups",
      "areaServed": "Worldwide",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  }

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Julian Bradley",
    "url": "https://v0-the-wizard-of-ai.vercel.app",
    "image": "https://v0-the-wizard-of-ai.vercel.app/images/wizard-profile-2.jpg",
    "jobTitle": "AI Consultant & Business Automation Expert",
    "email": "julian@aiacrobatics.com",
    "description": "AI consultant and business automation expert helping 100+ businesses implement AI agents, custom automation, and transformation strategies. Specializes in scaling operations without proportional hiring increases.",
    "sameAs": [
      "https://www.linkedin.com/in/julian-bradley",
      "https://twitter.com/wizardofai"
    ],
    "knowsAbout": [
      "AI Consulting",
      "Business Automation",
      "AI Agents",
      "Workflow Automation",
      "AI Transformation",
      "Process Automation",
      "AI Implementation",
      "Bottleneck Bots",
      "Exactech AI",
      "Custom AI Solutions",
      "Business Scaling",
      "Operational Efficiency",
      "AI Strategy"
    ],
    "worksFor": {
      "@type": "Organization",
      "name": "The Wizard of AI"
    }
  }

  return (
    <html lang="en" className="bg-[#0A4D3C] overflow-x-hidden">
      <head>
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {/* Professional Service Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(professionalServiceSchema) }}
        />
        {/* Person Schema for Author Authority */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        {/* Additional SEO Meta Tags */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="bingbot" content="index, follow" />
        <meta name="theme-color" content="#0A4D3C" />
        <meta name="msapplication-TileColor" content="#0A4D3C" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <link rel="canonical" href="https://v0-the-wizard-of-ai.vercel.app" />
      </head>
      <body
        className={`font-sans antialiased overflow-x-hidden bg-[#0A4D3C] ${roboto.variable} ${libreBaskerville.variable} ${alexBrush.variable} ${oswald.variable}`}
      >
        <CustomCursor />
        <SmoothScroll>{children}</SmoothScroll>
        {/* <Analytics /> */}
      </body>
    </html>
  )
}
