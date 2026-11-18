import { useEffect } from 'react'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Accordion } from '@/components/ui/Accordion'
import { Reveal } from '@/components/ui/Reveal'
import { Hero, Pillars } from '@/components/home/Hero'
import { CategoryGrid, BrandStrip } from '@/components/home/Collections'
import {
  BestSellers,
  DealsOfDay,
  WhyShopWithUs,
} from '@/components/home/Showcase'
import { HOME_FAQ, HOUSE_BLURB } from '@/data/content'
import { useCatalogueStore } from '@/store/catalogueStore'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

/**
 * Storefront home.
 *
 * Reads top to bottom as an editorial page: hero, the pillars, what we stock
 * (categories then maisons), the provenance explainer, then merchandising rails
 * and trust proof.
 */
export function HomePage() {
  useDocumentTitle('Raheman Perfumes — Original Perfumes, Attars & Combos')
  const refreshShowcase = useCatalogueStore((state) => state.refreshShowcase)

  useEffect(() => {
    refreshShowcase()
  }, [refreshShowcase])

  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Store',
      name: 'Raheman Perfumes',
      description: HOUSE_BLURB,
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'IN',
      },
      telephone: '+91-98201-12345',
    })
    document.head.appendChild(script)
    return () => {
      document.head.removeChild(script)
    }
  }, [])

  return (
    <>
      {/* The hero is above the fold and animates itself in, so it is deliberately
          not wrapped — a reveal there would read as the page loading slowly
          rather than as the page arriving. Everything below is revealed as it
          comes into view. */}
      <Hero />

      <Reveal>
        <Pillars />
      </Reveal>
      <Reveal>
        <CategoryGrid />
      </Reveal>

      {/* The maisons sit directly under the category grid: the two answer the
          same "what do you stock" question, so they read as one beat. */}
      <Reveal>
        <BrandStrip />
      </Reveal>

      <Reveal>
        <BestSellers />
      </Reveal>
      <Reveal>
        <DealsOfDay />
      </Reveal>
      <Reveal>
        <WhyShopWithUs />
      </Reveal>

      {/* FAQ */}
      <Reveal as="section" className="bridal-banner border-b border-[#ECE0CC] py-16 lg:py-20">
        <div className="shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <SectionHeading title="Before You Order" />
            <div className="mt-7 flex flex-wrap gap-3">
              <Button variant="primary" to="/pages/faqs">
                All Fragrance FAQs
              </Button>
              <Button variant="outline" href="https://wa.me/919820112345">
                <Icon name="whatsapp" className="h-4 w-4" />
                Ask a Perfumer
              </Button>
            </div>
          </div>

          <Accordion items={HOME_FAQ} />
        </div>
      </Reveal>

      {/* Closing CTA */}
      <Reveal as="section" className="shell py-16 lg:py-20">
        <div
          className="relative overflow-hidden rounded-xl bg-brand-charcoal bg-cover bg-center bg-no-repeat px-8 py-16 text-center text-brand-ivory shadow-2xl lg:px-16 lg:py-20"
          style={{ backgroundImage: "url('/finder.png?v=2')" }}
        >
          {/* Gentle darkening overlay so text remains crystal clear */}
          <div className="pointer-events-none absolute inset-0 bg-black/35 backdrop-brightness-95" aria-hidden="true" />
          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="font-serif text-3xl font-medium leading-tight lg:text-headline-xl">
              Find the scent that becomes your signature.
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button variant="gold" size="lg" to="/shop">
                Shop Fragrances
                <Icon name="arrow-right" className="h-4 w-4" />
              </Button>
              <Button variant="outline-inverse" size="lg" to="/offers">
                View Current Offers
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </>
  )
}

export default HomePage
