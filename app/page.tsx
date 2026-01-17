import Header from "@/components/header"
import MasonryGallerySection from "@/components/masonry-gallery-section"
import RiderTechSection from "@/components/rider-tech-section"
import AIShowcase from "@/components/bike-showcase"
import SocialSection from "@/components/social-section"
import Footer from "@/components/footer"
import { AIAgentsSection } from "@/components/ai-agents-section"
import { AIServicesAccordion } from "@/components/ai-services-accordion"
import { ApplySection } from "@/components/apply-section"
import { AIAgents3DShowcase } from "@/components/ai-agents-3d-showcase"
import { IntroSection } from "@/components/intro-section"
import { GoldenTicketFlip, GoldenTicketBio } from "@/components/golden-ticket-flip"
import { YellowBrickRoadAnimated } from "@/components/yellow-brick-road-animated"
import MissionSection from "@/components/mission-section"
import { WhoIServeSection } from "@/components/who-i-serve-section"
import { TrustBadges } from "@/components/trust-badges"
import { MidPageCTA } from "@/components/mid-page-cta"
import { FAQSection } from "@/components/faq-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { WizardHatParallax } from "@/components/wizard-hat-parallax"

export default function Home() {
  return (
    <main className="relative overflow-x-hidden max-w-full bg-[#0A4D3C]">
      {/* ============================================
          SECTION ORDER (Top to Bottom as user scrolls):

          1. HEADER - Navigation bar at top
          2. HERO SECTION - Big logo with spinning green/gold background
          3. YELLOW BRICK ROAD - Animated road transition
          4. GOLDEN TICKET - Portrait that flips to reveal golden ticket
          5. MISSION STATEMENT - Text about the mission/vision
          6. TRUST BADGES - Stats numbers and partner logos
          7. FLOATING CTA BAR - Sticky "Book Your Call" popup (appears on scroll)
          8. PHOTO GALLERY - Grid of lifestyle photos
          9. WHO I HELP - Cards showing different audiences (Business Owners, Creators, etc.)
          10. SOLUTIONS CATALOG - Carousel of AI solutions (Lead Gen, Support Bot, etc.)
          11. ABOUT/PORTRAIT SECTION - Large portrait with sparkles
          12. AI AGENTS CAROUSEL - Flip cards carousel (Lead Gen Machine, 24-Hour Support Bot, etc.)
          13. AI AGENTS GRID - Grid layout of all AI agents
          14. SERVICES ACCORDION - Expandable list of services
          15. FAQ - Frequently asked questions
          16. TESTIMONIALS - Customer reviews carousel
          17. WIZARD HAT PARALLAX - Profile with wizard hat
          18. BOOK A CALL - Application/booking form section
          19. SOCIAL LINKS - Social media icons
          20. FOOTER - Bottom of page with links
          ============================================ */}

      {/* 1. HEADER - Navigation bar */}
      <Header />

      {/* 2. HERO SECTION - Big spinning background with "The Wizard of AI" logo */}
      <IntroSection />

      {/* 3. YELLOW BRICK ROAD - Animated yellow brick road transition */}
      <YellowBrickRoadAnimated />

      {/* 4. GOLDEN TICKET - Portrait of Julian that flips to golden ticket */}
      <GoldenTicketFlip />

      {/* 4b. GOLDEN TICKET BIO - Text content in next fold */}
      <GoldenTicketBio />

      {/* 5. MISSION STATEMENT - Text reveal about the mission */}
      <MissionSection />

      {/* 6. TRUST BADGES - Stats (500+ clients, etc.) and partner logos slider */}
      <TrustBadges />

      {/* 7. FLOATING CTA BAR - Persistent but Closable */}
      <MidPageCTA />

      {/* Main content wrapper */}
      <div className="relative z-10 overflow-x-hidden">
        {/* 8. PHOTO GALLERY - Masonry grid of lifestyle/professional photos */}
        <MasonryGallerySection />

        {/* 9. WHO I HELP - Cards: Business Owners, Content Creators, CEOs, Agency Owners, Startups, Innovators */}
        <WhoIServeSection />

        {/* 10. SOLUTIONS CATALOG - Slider with AI solutions: Lead Gen, Support Bot, Appointment Setter, etc. */}
        <RiderTechSection />

        {/* 11. ABOUT/PORTRAIT SECTION - Large portrait photo with sparkle effects */}
        <AIShowcase />

        {/* 12. AI AGENTS CAROUSEL - Horizontal scrolling flip cards (Lead Gen Machine, 24-Hour Support Bot, etc.) */}
        <AIAgents3DShowcase />

        {/* 13. AI AGENTS GRID - Grid layout showing all AI agents with descriptions */}
        <AIAgentsSection />

        {/* 14. SERVICES ACCORDION - Expandable/collapsible list of all services offered */}
        <AIServicesAccordion />

        {/* 15. FAQ - Frequently Asked Questions section */}
        <FAQSection />

        {/* 16. TESTIMONIALS - Customer reviews in a carousel/slider */}
        <TestimonialsSection />

        {/* 17. WIZARD HAT PARALLAX - Julian's profile with wizard hat */}
        <WizardHatParallax />

        {/* 18. BOOK A CALL - Application form to schedule a strategy call */}
        <ApplySection />

        {/* 19. SOCIAL LINKS - Social media icons (Instagram, LinkedIn, etc.) */}
        <SocialSection />

        {/* 20. FOOTER - Bottom of page with copyright and links */}
        <Footer />
      </div>
    </main>
  )
}
