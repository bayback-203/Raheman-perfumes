import { useState } from 'react'
import { Link, useParams } from '@/components/ui/AppLink'
import cn from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Breadcrumbs } from '@/components/ui/SectionHeading'
import { Accordion } from '@/components/ui/Accordion'
import { Input, Textarea, Select } from '@/components/ui/Form'
import { toast } from '@/store/uiStore'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { NotFoundPage } from './NotFoundPage'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Static editorial pages.
 *
 * Every entry is plain data so the copy can be moved to the backend CMS later
 * without touching the renderer below.
 */
const PAGES = {
  'shipping-policy': {
    eyebrow: 'Customer Care',
    title: 'Shipping Policy',
    subtitle:
      'Every bottle ships in a protective box with a tamper-proof seal. Here is how, when and where we deliver.',
    updated: '2026-08-01',
    sections: [
      {
        kind: 'cards',
        items: [
          { icon: 'truck', image: '/promise-delivery.jpg', title: 'Standard Surface', body: 'Complimentary above ₹999. Delivered in 4–6 working days across India.' },
          { icon: 'plane', image: '/studio.png', title: 'Express Air', body: '₹149 flat. Next-day metro delivery when ordered before 14:00 IST.' },
        ],
      },
      {
        kind: 'prose',
        heading: 'Packing & Dispatch Times',
        body: [
          'Orders placed before 2:00 PM on a working day are packed and given to the courier the same day. Orders after 2:00 PM, or on Sundays/holidays, go out the next working day.',
          'Perfumes with alcohol follow airline safety rules. Bottles above 100ml can only travel by road inside India, so fast air delivery is for smaller bottles only.',
        ],
      },
      {
        kind: 'list',
        heading: 'What Comes In The Box',
        items: [
          'Your perfume bottle wrapped safely in tissue and a strong box',
          'A tamper-proof safety seal on the cap',
          'A batch card showing when it was packed',
          'Secure 3-layer protective packaging for safe transit',
        ],
      },
      {
        kind: 'prose',
        heading: 'Track Your Order',
        body: [
          'A courier AWB number is emailed and texted the moment your parcel is scanned into the network. You can follow the scan history at any time from the tracking page, using either the order number or the AWB.',
        ],
      },
      {
        kind: 'prose',
        heading: 'International Shipping',
        body: [
          'We ship to the UAE, Singapore, the United Kingdom and the United States through a licensed freight partner. International orders carry a flat ₹2,499 freight charge, and any import duty or customs levy is payable by the recipient on arrival.',
        ],
      },
    ],
  },

  'return-refund': {
    eyebrow: 'Customer Care',
    title: 'No Return Policy',
    subtitle:
      'Due to strict personal care hygiene standards and the delicate nature of luxury fragrances and pure attars, all sales are final once delivered.',
    updated: '2026-11-17',
    sections: [
      {
        kind: 'prose',
        heading: 'Strict No Return & No Exchange Policy',
        body: [
          'Raheman Perfumes maintains a strict No Return and No Exchange Policy for all products once delivered.',
          'Perfumes, concentrated perfume oils, and pure attars are intimate personal care products. For hygiene, health, and authenticity reasons, opened or delivered bottles cannot be restocked, resold, or re-packaged.',
          'Please review product descriptions, notes, and size details carefully prior to placing your order. We do not accept returns or issue refunds based on personal scent preference or change of mind.',
        ],
      },
      {
        kind: 'prose',
        heading: 'Order Cancellation (Before Packing Only)',
        body: [
          'You can cancel an order ONLY while it is in Confirmed / Processing status — before our fulfillment team packs the parcel. To cancel, go to My Account → Orders and click Cancel Order.',
          'Once your parcel is marked as Packed or Shipped, cancellation is permanently locked and the parcel cannot be cancelled or recalled.',
          'For prepaid orders (UPI / Card / Net Banking / Razorpay) cancelled before packing, enter your UPI ID during cancellation. The Shop Owner will verify and manually transfer your full refund to your UPI ID within 2–3 working days.',
        ],
      },
      {
        kind: 'prose',
        heading: 'Damaged, Leaking Or Broken In Transit (Free Replacement)',
        body: [
          'Every Raheman perfume travels safely inside multi-layer shockproof bubble packaging with tamper-evident seals. However, in the rare event of damage or leakage caused by courier mishandling during transit:',
          '1. Please take clear photos or a short unboxing video showing the damaged parcel and bottle.',
          '2. Reach out to our Concierge on WhatsApp (+91 82608 66878) or email us at rahemanfragrance@gmail.com within 48 hours of delivery.',
          '3. Once verified, we will immediately dispatch a brand-new replacement bottle to your address free of cost.',
          'Please note: We provide free replacements for genuine transit damage or wrong deliveries. Returns or change-of-mind refunds for delivered items are strictly not permitted.',
        ],
      },
      {
        kind: 'faq',
        heading: 'Frequently Asked Questions',
        items: [
          {
            title: 'Can I return or exchange a perfume after delivery?',
            body: 'No. All sales are strictly final once delivered. Due to strict personal hygiene, health, and product purity standards, we do not accept returns or exchanges under any circumstances.',
          },
          {
            title: 'Can I cancel my order before it ships?',
            body: 'Yes, you can cancel your order from My Account as long as it is in Confirmed or Processing status before parcel packing begins. Once packed or shipped, cancellation is closed.',
          },
          {
            title: 'How do I receive a refund if I cancel an order before packing?',
            body: 'For prepaid orders cancelled before packing, provide your UPI ID in the cancellation modal. The Shop Owner reviews and transfers the refund directly to your UPI ID within 2–3 working days.',
          },
          {
            title: 'What if my bottle arrives broken or leaking?',
            body: 'Contact our support team within 48 hours of delivery with unboxing photos/video. Upon verification, we will send an immediate, complimentary replacement bottle.',
          },
        ],
      },
    ],
  },

  faqs: {
    eyebrow: 'Customer Care',
    title: 'Fragrance FAQs',
    subtitle: 'Oil strength, lasting power, storage and common questions our team answers.',
    updated: '2026-08-01',
    sections: [
      {
        kind: 'faq',
        heading: 'About Our Perfumes',
        items: [
          { title: 'What is the difference between Original, Inspired and Mixed?', body: 'Original bottles are genuine branded perfumes bought directly from official distributors, with batch codes you can verify. Inspired perfumes are our own versions of famous designer scents, made at 30–35% oil strength. Mixed blends are our in-house custom layers of two or more scents.' },
          { title: 'How long does a Raheman perfume last on skin?', body: 'Our own perfumes use 30–35% pure perfume oil instead of the usual 15–20%. Expect 8–12 hours on skin and even longer on clothes. One or two sprays are enough.' },
          { title: 'What is an attar, and how is it different?', body: 'An attar is an alcohol-free oil perfume made with pure natural oils like sandalwood or jojoba. Apply a little with the glass stick instead of spraying — it stays warm and lasts for hours.' },
          { title: 'Will an Inspired blend smell like the original?', body: 'It smells very close right from the first spray because it uses matching scent oils. Slight differences can appear hours later since brands use locked formulas, but you get the same feel at a much better price.' },
        ],
      },
      {
        kind: 'faq',
        heading: 'Care & Storage',
        items: [
          { title: 'How should I store my perfume?', body: 'Keep the bottle upright in a cool, dark cupboard away from sunlight, heat and bathroom steam. Heat and light weaken the scent quickly.' },
          { title: 'Why does the colour darken over time?', body: 'Natural oils naturally turn a little darker gold over time. This is normal aging and does not spoil the perfume at all.' },
          { title: 'My perfume smells different than the tester. Why?', body: 'Skin type, weather, humidity and temperature change how any scent feels. Let a new bottle rest 24 hours after delivery, then test it on clean moisturised skin.' },
          { title: 'Can I put perfume in a travel spray?', body: 'Yes! Always use a glass mini spray bottle instead of plastic, because perfume can react with plastic and spoil the smell.' },
        ],
      },
      {
        kind: 'faq',
        heading: 'Orders & Bottle Sizes',
        items: [
          { title: 'Which bottle size should I start with?', body: 'If you are trying a new fragrance for the first time, our compact 30ml size or pure 12ml attars are ideal to experience the scent profile before choosing larger 50ml or 100ml flacons.' },
        ],
      },
    ],
  },

  'size-guide': {
    eyebrow: 'Customer Care',
    title: 'Bottle Size Guide',
    subtitle: 'How long each volume actually lasts, so you can buy the right one the first time.',
    updated: '2026-08-01',
    sections: [
      {
        kind: 'table',
        heading: 'Size, Sprays & How Long It Lasts',
        columns: ['Size', 'Approx. sprays', 'At 2 sprays a day', 'At 4 sprays a day', 'Best for'],
        rows: [
          ['6ml attar roll-on', '≈ 240 uses', '—', '—', 'Testing, pocket, travel'],
          ['12ml pure ittar', '≈ 480 uses', '—', '—', 'Attar lovers, gifting'],
          ['30ml', '≈ 300 sprays', '≈ 5 months', '≈ 2.5 months', 'Daily favorite scent'],
          ['50ml', '≈ 500 sprays', '≈ 8 months', '≈ 4 months', 'Regular everyday use'],
          ['100ml', '≈ 1,000 sprays', '≈ 16 months', '≈ 8 months', 'Full-size value bottle'],
        ],
      },
      {
        kind: 'prose',
        heading: 'Which Perfume Strength Should I Choose?',
        body: [
          'Eau de Toilette (EDT) has 8–12% oil and feels light and fresh — good for hot days. Eau de Parfum (EDP) has 15–20% oil and lasts through a workday. Extrait de Parfum has 30–35% oil and is the strong level we use in most of our Inspired perfumes — just two sprays last from morning till night.',
          'If you are trying a strong oil perfume for the first time, start with 50ml since you need fewer sprays each day.',
        ],
      },
      {
        kind: 'cards',
        items: [
          { icon: 'package', image: '/promise-delivery.jpg', title: 'Box Size', body: '50ml bottles ship in a 9 × 9 × 14 cm box; 100ml in 11 × 11 × 17 cm. Easy to store or carry.' },
          { icon: 'plane', image: '/cat-unisex.jpg', title: 'Flight Cabin Rules', body: 'Perfume bottles up to 100ml are allowed in flight cabin bags.' },
          { icon: 'gift', image: '/promise-testing.jpg', title: 'Travel Sprays', body: 'Ask our team for empty glass mini spray bottles to carry your perfume easily while travelling.' },
        ],
      },
      {
        kind: 'prose',
        heading: 'Refilling A Travel Bottle Safely',
        body: [
          'Always refill into a clean glass spray bottle, never plastic. Leave a little air space at the top and never mix two different perfumes inside the same small bottle without washing and drying it first.',
        ],
      },
    ],
  },

  contact: {
    eyebrow: 'Customer Care',
    title: 'Contact Support',
    subtitle: 'Our team reads every message directly. Expect a reply within one working day.',
    updated: '2026-08-01',
    sections: [
      { kind: 'contact' },
      {
        kind: 'cards',
        items: [
          { icon: 'phone', image: '/care-concierge.jpg', title: 'Call Or WhatsApp', body: '+91 98201 12345 · Monday to Saturday, 10:00 AM–7:00 PM' },
          { icon: 'mail', image: '/signin-atelier.jpg', title: 'Email', body: 'atelier@rahemanperfumes.in · replies within one working day' },
        ],
      },
      {
        kind: 'faq',
        heading: 'Before You Write',
        items: [
          { title: 'Where is my order?', body: 'Check the tracking page first — it shows live scan updates from the courier. If your parcel has not moved in 48 hours, message us and we will follow up directly.' },
          { title: 'Can I change my delivery address?', body: 'Yes, as long as the parcel has not been picked up yet. Send the order number and the new address and we will update the delivery.' },
          { title: 'Do you take bulk or corporate orders?', body: 'Yes. Wedding favours, corporate gifts and hotel amenities are made in batches of 25 or more with custom labels. Write to us with quantities and a target date.' },
        ],
      },
    ],
  },

  about: {
    eyebrow: 'Our Shop',
    title: 'About Raheman Perfumes',
    subtitle:
      'One shop offering genuine branded perfumes, long-lasting inspired blends, and traditional pure attars.',
    updated: '2026-08-01',
    sections: [
      {
        kind: 'prose',
        heading: 'Our Story',
        body: [
          'Raheman Perfumes started with a simple collection of pure attars and one clear promise: test every bottle for quality before selling it, and only sell scents we are proud of.',
          'Today we bring together small-batch inspired blends, genuine designer perfumes, and traditional Kannauj attars.',
        ],
      },
      {
        kind: 'cards',
        items: [
          { icon: 'verified', image: '/promise-authentic.jpg', title: 'Authentic Originals', body: 'Bought directly from official suppliers with original batch codes checked before stocking.' },
          { icon: 'flask', image: '/promise-custom.jpg', title: 'Hand-Made Blends', body: 'Our inspired blends and mixes are measured and mixed carefully by hand in small batches.' },
          { icon: 'award', image: '/family-gourmand.jpg', title: 'Honest Pricing', body: 'No extra showroom markup — you pay fairly for the quality of oil in the bottle.' },
          { icon: 'shield', image: '/promise-quality.jpg', title: 'Sealed & Safe', body: 'Every order leaves our shop with a tamper-proof seal and batch details.' },
        ],
      },
      {
        kind: 'list',
        heading: 'How We Work',
        items: [
          'Raw oils are bought in small lots and checked when they arrive — poor lots are rejected',
          'Each blended batch rests properly before bottling so the scent becomes smooth and long lasting',
          'A sample from each batch is kept on record so we can check any feedback',
          'Every perfume is checked by our team before packing and sending out',
        ],
      },
      {
        kind: 'prose',
        heading: 'Honest Sourcing',
        body: [
          'We buy oud, sandalwood and rose oils only from trusted suppliers who follow legal and responsible sourcing.',
        ],
      },
    ],
  },

  perfumers: {
    eyebrow: 'Our Team',
    title: 'Our Perfume Makers',
    subtitle: 'Meet the people who make, test and check every blend at Raheman Perfumes.',
    updated: '2026-08-01',
    sections: [
      {
        kind: 'team',
        items: [
          {
            name: 'Imran Raheman',
            role: 'Founder & Head Maker',
            initials: 'IR',
            specialty: 'Oud, amber, leather',
            bio: 'Imran started Raheman Perfumes with a simple goal: every attar and strong perfume should get the same care and quality check. He checks every oud batch himself.',
          },
          {
            name: 'Meera Nair',
            role: 'Floral Specialist',
            initials: 'MN',
            specialty: 'Rose, jasmine, florals',
            bio: 'Meera spent years working with rose harvests in Kannauj and makes our natural floral blends smell fresh and true.',
          },
          {
            name: 'Arjun Sethi',
            role: 'Fresh & Daily Scents',
            initials: 'AS',
            specialty: 'Citrus, fresh, aqua',
            bio: 'Arjun creates bright daytime scents and tests citrus oils carefully so every fresh bottle stays crisp all day.',
          },
          {
            name: 'Fatima Sheikh',
            role: 'Attar & Oil Specialist',
            initials: 'FS',
            specialty: 'Pure attars & layering oils',
            bio: 'Fatima looks after cold resting and oil mixing across all our traditional alcohol-free attars and fragrance blends.',
          },
        ],
      },
    ],
  },

  journal: {
    eyebrow: 'Guides',
    title: 'Perfume Guides & Tips',
    subtitle: 'Simple notes from our team about perfume oils, storage and choosing the right scent.',
    updated: '2026-08-01',
    sections: [
      {
        kind: 'posts',
        items: [
          {
            tag: 'Oils',
            title: 'Why Cambodian Oud Smells Different From Hindi Oud',
            excerpt:
              'Same wood, different climate, very different smell. Learn what makes Cambodian oud sweet and smooth while Hindi oud is strong and earthy.',
            date: '2026-08-14',
            readTime: '7 min read',
          },
          {
            tag: 'Guide',
            title: 'Understanding Top, Middle & Base Notes',
            excerpt:
              'What you smell in the first 10 minutes is different from what stays after 4 hours. Here is a simple way to test a perfume before buying.',
            date: '2026-07-29',
            readTime: '6 min read',
          },
          {
            tag: 'Craft',
            title: 'Why Resting Perfumes Makes Them Last Longer',
            excerpt:
              'Letting a freshly mixed bottle sit in cool dark glass helps the oils settle together so the smell is smoother and stays longer.',
            date: '2026-07-02',
            readTime: '5 min read',
          },
          {
            tag: 'Buying',
            title: 'Batch Codes: How To Check An Original Perfume',
            excerpt:
              'A quick 5-minute check to verify any branded bottle batch code and spot signs of tampering.',
            date: '2026-06-18',
            readTime: '8 min read',
          },
          {
            tag: 'Care',
            title: 'Storing Perfume In An Indian Summer',
            excerpt:
              'High heat and humidity can weaken fresh scents fast. Keep bottles in a cool, dark drawer away from windows.',
            date: '2026-05-30',
            readTime: '4 min read',
          },
          {
            tag: 'Oils',
            title: 'Sandalwood: How To Spot Real Quality',
            excerpt:
              'Pure sandalwood oil grows slowly and is often mixed with fillers by cheap sellers. Here is what we check before buying.',
            date: '2026-05-09',
            readTime: '6 min read',
          },
        ],
      },
    ],
  },

  privacy: {
    eyebrow: 'Legal',
    title: 'Privacy Policy',
    subtitle: 'What we collect, why we collect it, and how to have it removed.',
    updated: '2026-08-01',
    sections: [
      {
        kind: 'prose',
        heading: 'What We Collect',
        body: [
          'When you place an order we collect your name, delivery address, email address and mobile number. These are used to deliver your order, to send tracking updates, and to reach you if the courier needs help finding the address.',
          'When you create an account we additionally store your saved addresses, your wishlist, your order history and any custom formulas you have made. Your date of birth is collected only if you volunteer it, for a birthday offer.',
        ],
      },
      {
        kind: 'list',
        heading: 'What We Never Collect Or Store',
        items: [
          'Card numbers, CVV codes and UPI credentials — these are entered on the payment gateway’s own hosted page and never reach our servers',
          'Any biometric data',
          'Your contacts, photos or files from your device',
        ],
      },
      {
        kind: 'prose',
        heading: 'Cookies',
        body: [
          'We use a small number of functional cookies and local storage keys to keep your cart, wishlist and session alive between visits. Analytics cookies are anonymised and aggregate only — they tell us that a page is popular, never who read it.',
          'You can clear these at any time from your browser settings. Doing so empties your cart and signs you out.',
        ],
      },
      {
        kind: 'prose',
        heading: 'Who We Share With',
        body: [
          'Your delivery name, address and mobile number are shared with the courier carrying your parcel, because they cannot deliver it otherwise. Your email address is shared with our email provider, which sends order confirmations and delivery updates on our behalf.',
          'We do not sell, rent or trade personal data. We do not run third-party advertising pixels on this website.',
        ],
      },
      {
        kind: 'faq',
        heading: 'Your Rights',
        items: [
          { title: 'How do I see what you hold about me?', body: 'Write to atelier@rahemanperfumes.in from your registered email address and we will send a full export of your account data within 30 days.' },
          { title: 'How do I delete my account?', body: 'The same address, and the same 30 days. Order records required for tax and warranty purposes are retained for the statutory period, with everything else removed.' },
          { title: 'Do you market to me without asking?', body: 'Never. Promotional and new stock emails are sent only if you opt in, and every email has an easy unsubscribe link.' },
        ],
      },
    ],
  },

  terms: {
    eyebrow: 'Legal',
    title: 'Terms of Service',
    subtitle: 'Simple terms for shopping at Raheman Perfumes.',
    updated: '2026-08-01',
    sections: [
      {
        kind: 'prose',
        heading: 'Using This Website',
        body: [
          'By placing an order, you confirm that your delivery details are correct and you agree to use this website fairly without misusing content or reselling our house blends without permission.',
        ],
      },
      {
        kind: 'prose',
        heading: 'Pricing And Stock Availability',
        body: [
          'All prices are in Indian Rupees and include 18% GST. If a pricing mistake happens before dispatch, we will let you know and you can cancel for a full refund.',
          'If any item runs out of stock after you order, we will contact you first to offer another option or give a full refund.',
        ],
      },
      {
        kind: 'prose',
        heading: 'Genuine Products & Brand Names',
        body: [
          'Original branded bottles sold here are 100% genuine items from official suppliers. Brand names used on inspired blends are only to explain the scent style — our inspired bottles are our own products.',
          'All Raheman Perfumes logos, bottle images, and descriptions belong to us.',
        ],
      },
      {
        kind: 'faq',
        heading: 'Liability And Disputes',
        items: [
          { title: 'What is your liability limit?', body: 'Our liability for any single order is limited to the amount you paid for it. We are not liable for indirect losses, including missed events or consequential costs.' },
          { title: 'Can I cancel an order?', body: 'Yes, ONLY before the parcel is packed (while status is Processing) from My Account → Orders. Once packed or shipped, cancellation is closed under our strict No Return Policy. Prepaid/Razorpay cancellations ask for your UPI ID for manual owner refund.' },
          { title: 'Which law governs these terms?', body: 'Indian law governs these terms and any dispute arising from a purchase made here.' },
          { title: 'Do these terms ever change?', body: 'These terms may be updated from time to time. The terms in force on the day you ordered are the ones that govern your order.' },
        ],
      },
    ],
  },
}

/** The contact form on /pages/contact. */
function ContactForm() {
  const [draft, setDraft] = useState({ name: '', email: '', order: '', topic: 'Order enquiry', message: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    const next = {}
    if (!draft.name.trim()) next.name = 'Required.'
    if (!EMAIL_PATTERN.test(draft.email)) next.email = 'Enter a valid email address.'
    if (draft.message.trim().length < 5) next.message = 'Tell us a little more so we can help properly.'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send message.')
      }
      setSent(true)
      toast({ title: 'Message sent', description: 'Our support team replies within one working day.' })
    } catch (err) {
      toast({
        title: 'Could not send message',
        description: err.message || 'Please check your connection and try again.',
        tone: 'error',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div className="card-surface flex flex-col items-center p-8 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-cream text-brand-goldDark">
          <Icon name="check-circle" className="h-6 w-6" />
        </span>
        <h3 className="mt-4 text-headline-sm font-semibold text-brand-charcoal">Thank you, {draft.name.split(' ')[0]}</h3>
        <p className="mt-2 max-w-md text-body-sm leading-relaxed text-brand-muted">
          Our team has received your message. Expect a reply at{' '}
          <span className="font-medium text-brand-charcoal">{draft.email}</span> within one working day.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            setSent(false)
            setDraft({ name: '', email: '', order: '', topic: 'Order enquiry', message: '' })
          }}
        >
          Send Another Message
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="card-surface grid gap-4 p-6 sm:grid-cols-2">
      <Input
        label="Your name"
        required
        value={draft.name}
        error={errors.name}
        onChange={(event) => setDraft({ ...draft, name: event.target.value })}
      />
      <Input
        label="Email"
        type="email"
        required
        icon="mail"
        value={draft.email}
        error={errors.email}
        onChange={(event) => setDraft({ ...draft, email: event.target.value })}
      />
      <Input
        label="Order number (optional)"
        placeholder="Enter order number (optional)"
        value={draft.order}
        onChange={(event) => setDraft({ ...draft, order: event.target.value.toUpperCase() })}
      />
      <Select
        label="What is this about?"
        options={['Order enquiry', 'Transit damage / Replacement', 'Bulk & corporate gifting', 'Something else']}
        value={draft.topic}
        onChange={(event) => setDraft({ ...draft, topic: event.target.value })}
      />
      <Textarea
        containerClassName="sm:col-span-2"
        label="Message"
        required
        rows={5}
        value={draft.message}
        error={errors.message}
        placeholder="Tell us what happened, and what would put it right…"
        onChange={(event) => setDraft({ ...draft, message: event.target.value.slice(0, 1200) })}
      />
      <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
        <p className="text-body-sm text-brand-muted">
          We reply from a monitored inbox — no ticket numbers, no bots.
        </p>
        <Button type="submit" variant="primary" loading={submitting} disabled={submitting}>
          <Icon name="mail" className="h-4 w-4" />
          {submitting ? 'Sending…' : 'Send Message'}
        </Button>
      </div>
    </form>
  )
}

/** Renders one content section by kind. */
function Section({ section }) {
  if (section.kind === 'contact') return <ContactForm />

  return (
    <section className="border-t border-brand-border pt-10 first:border-t-0 first:pt-0">
      {section.heading && (
        <h2 className="font-serif text-2xl font-medium text-brand-charcoal lg:text-headline-md">{section.heading}</h2>
      )}

      {section.kind === 'prose' && (
        <div className={cn('space-y-4', section.heading && 'mt-5')}>
          {section.body.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="max-w-3xl text-body-md leading-relaxed text-ink-variant">
              {paragraph}
            </p>
          ))}
        </div>
      )}

      {section.kind === 'list' && (
        <ul className={cn('max-w-3xl space-y-2.5', section.heading && 'mt-5')}>
          {section.items.map((item) => (
            <li key={item} className="flex items-start gap-3 text-body-md leading-relaxed text-ink-variant">
              <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-brand-goldDark" strokeWidth={3} />
              {item}
            </li>
          ))}
        </ul>
      )}

      {section.kind === 'steps' && (
        <ol className={cn('max-w-3xl space-y-5', section.heading && 'mt-6')}>
          {section.items.map((item, index) => (
            <li key={item.title} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand-gold/40 bg-brand-cream font-serif text-sm font-semibold text-brand-goldDark">
                {index + 1}
              </span>
              <div>
                <p className="text-body-md font-semibold text-brand-charcoal">{item.title}</p>
                <p className="mt-1 text-body-sm leading-relaxed text-ink-variant">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      )}

      {section.kind === 'cards' && (
        <div
          className={cn(
            'grid gap-5 sm:grid-cols-2',
            section.items.length !== 2 && 'lg:grid-cols-3',
            section.heading && 'mt-6',
          )}
        >
          {section.items.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-brand-border bg-white p-5 shadow-card"
            >
              {item.image ? (
                <div className="h-14 w-14 overflow-hidden rounded-lg border border-brand-border bg-neutral-50 shadow-sm">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-cream text-brand-goldDark">
                  <Icon name={item.icon} className="h-4 w-4" />
                </span>
              )}
              <h3 className="mt-4 text-body-md font-semibold text-brand-charcoal">{item.title}</h3>
              <p className="mt-1.5 text-body-sm leading-relaxed text-brand-muted">{item.body}</p>
            </div>
          ))}
        </div>
      )}

      {section.kind === 'table' && (
        <div className={cn('overflow-x-auto rounded border border-brand-border', section.heading && 'mt-6')}>
          <table className="w-full min-w-[44rem] border-collapse text-left">
            <thead>
              <tr className="bg-brand-cream/60">
                {section.columns.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="border-b border-brand-border px-4 py-3 text-label-sm font-bold uppercase tracking-wider text-brand-charcoal"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.rows.map((row) => (
                <tr key={row[0]} className="border-b border-brand-border last:border-b-0">
                  {row.map((cell, index) => (
                    <td
                      key={`${row[0]}-${index}`}
                      className={cn(
                        'px-4 py-3.5 text-body-sm',
                        index === 0 ? 'font-semibold text-brand-charcoal' : 'text-ink-variant',
                      )}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {section.kind === 'faq' && (
        <div className={cn('max-w-3xl', section.heading && 'mt-5')}>
          <Accordion
            // Accordion keys on `id`; these items only carry copy, so derive one.
            items={section.items.map((item, index) => ({ id: item.id ?? `${section.heading}-${index}`, ...item }))}
            allowMultiple
          />
        </div>
      )}

      {section.kind === 'team' && (
        <div className="grid gap-5 sm:grid-cols-2">
          {section.items.map((person) => (
            <article key={person.name} className="card-surface flex flex-col p-6">
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-charcoal font-serif text-lg font-semibold text-brand-gold">
                  {person.initials}
                </span>
                <div>
                  <h3 className="text-body-lg font-semibold text-brand-charcoal">{person.name}</h3>
                  <p className="text-body-sm text-brand-muted">{person.role}</p>
                </div>
              </div>
              <p className="mt-4 text-body-sm leading-relaxed text-ink-variant">{person.bio}</p>
              <p className="mt-4 flex items-center gap-2 border-t border-brand-border pt-4 text-label-sm font-bold uppercase text-brand-goldDark">
                <Icon name="sparkle" className="h-3.5 w-3.5" />
                {person.specialty}
              </p>
            </article>
          ))}
        </div>
      )}

      {section.kind === 'posts' && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {section.items.map((post) => (
            <article key={post.title} className="card-surface card-lift flex flex-col p-6">
              <span className="text-label-sm font-bold uppercase tracking-wider text-brand-goldDark">{post.tag}</span>
              <h3 className="mt-3 font-serif text-xl font-semibold leading-snug text-brand-charcoal">{post.title}</h3>
              <p className="mt-3 flex-1 text-body-sm leading-relaxed text-brand-muted">{post.excerpt}</p>
              <p className="mt-5 flex items-center gap-3 border-t border-brand-border pt-4 text-body-sm text-brand-muted">
                <span>{new Date(post.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                <span aria-hidden="true">·</span>
                <span>{post.readTime}</span>
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export function ContentPage() {
  const { slug } = useParams()
  const page = PAGES[slug]

  useDocumentTitle(page?.title ?? 'Not Found')

  if (!page) return <NotFoundPage />

  return (
    <div>
      {/* Hero (omitted on contact so the form sits right at the top cleanly) */}
      {slug !== 'contact' && (
        <section className="border-b border-brand-border bg-white">
          <div className="shell py-12 lg:py-16">
            <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: page.title }]} className="mb-6" />
            <p className="text-label-sm font-bold uppercase tracking-[0.2em] text-brand-goldDark">{page.eyebrow}</p>
            <h1 className="mt-3 max-w-4xl font-serif text-[30px] font-medium leading-tight text-brand-charcoal sm:text-[40px]">
              {page.title}
            </h1>
            <p className="mt-4 max-w-2xl text-body-lg leading-relaxed text-brand-muted">{page.subtitle}</p>
          </div>
        </section>
      )}

      <div className="shell py-12 lg:py-16">
        <div className="max-w-4xl space-y-10">
          {page.sections.map((section, index) => (
            <Section key={section.heading ?? `section-${index}`} section={section} />
          ))}
        </div>

        {slug !== 'privacy' && slug !== 'terms' && (
          <p className="mt-8 text-body-sm text-brand-muted">
            See also{' '}
            <Link to="/pages/shipping-policy" className="link-underline text-brand-goldDark">
              Shipping Policy
            </Link>
            ,{' '}
            <Link to="/pages/return-refund" className="link-underline text-brand-goldDark">
              No Return Policy
            </Link>{' '}
            and{' '}
            <Link to="/pages/faqs" className="link-underline text-brand-goldDark">
              Fragrance FAQs
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  )
}

export default ContentPage
