import { useState } from 'react'
import { Link, useParams } from '@/components/ui/AppLink'
import cn from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Breadcrumbs } from '@/components/ui/SectionHeading'
import { Accordion } from '@/components/ui/Accordion'
import { Modal } from '@/components/ui/Modal'
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
    eyebrow: 'Contact Us',
    title: 'Shipping Policy',
    subtitle:
      'Every bottle ships in a protective box with a tamper-proof seal. Here is how, when and where we deliver.',
    updated: '2026-08-01',
    sections: [
      {
        kind: 'cards',
        items: [
          { icon: 'truck', image: '/promise-delivery.jpg', title: 'Standard Surface', body: 'Standard surface delivery with complimentary shipping available on qualifying orders. Delivered safely in 4–6 working days.' },
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
      {
        kind: 'faq',
        heading: 'Shipping & Delivery FAQs',
        items: [
          {
            title: 'Can I change my delivery address after placing an order?',
            body: 'No. Once an order is confirmed, the delivery address cannot be changed because automated fulfillment and courier manifest booking begin immediately. If an address was entered incorrectly, please cancel the order from My Account while it is in Confirmed or Processing status and place a new order with the updated address.',
          },
        ],
      },
    ],
  },

  'return-refund': {
    eyebrow: 'Contact Us',
    title: 'Return, Refund & Cancellation Policy',
    subtitle:
      'At Raheman Perfumes, we are dedicated to crafting an exceptional luxury fragrance experience. Please review our policies regarding product hygiene, transit damage claims, refunds, and order cancellations.',
    updated: '2026-11-24',
    sections: [
      {
        kind: 'cards',
        items: [
          {
            icon: 'clock',
            title: 'Report Within 24 Hours',
            body: 'In the rare case of transit damage, broken flacons, leakage, or defective items, report to our team within 24 hours of delivery.',
          },
          {
            icon: 'shield',
            title: 'Unboxing Video Required',
            body: 'To claim a refund or replacement for damaged, broken, or leaked goods, an uncut unboxing video showing outer packaging is mandatory.',
          },
          {
            icon: 'phone',
            title: 'Direct Support',
            body: 'Reach us via WhatsApp at +91 98201 12345 or email atelier@rahemanperfumes.in for prompt resolution within 3–4 business days.',
          },
        ],
      },
      {
        kind: 'prose',
        heading: 'Return & Hygiene Policy',
        body: [
          'We want you to enjoy the timeless essence of our fragrances. Due to personal hygiene reasons and the nature of fine perfumery products, we do not accept returns or exchanges once a product has been delivered, opened, unsealed, or used.',
          'Perfumes, concentrated perfume oils, and pure attars are personal care items. If you receive a product that is damaged, broken, leaking, or incorrectly shipped, you are fully entitled to an immediate replacement or refund subject to the verification terms below.',
          'Product Sensitivities & Patch Test: Our artisanal perfumes contain pure French oils, natural botanical extracts, and up to 40% oil concentrations. While formulated to the highest international quality standards, individual skin chemistry and sensitivities vary. We are not responsible for reactions caused by sensitivities to specific fragrance ingredients. Please conduct a skin patch test before full use. We do not accept returns or process refunds based on personal scent preferences or skin allergies.',
        ],
      },
      {
        kind: 'steps',
        heading: 'How to Claim for Damaged, Broken, or Leaked Goods',
        items: [
          {
            title: 'Refuse Damaged Outer Parcels on Delivery',
            body: 'If the courier parcel arrives visibly crushed, tampered with, or leaking upon delivery, please refuse the package immediately from the courier partner and notify our team.',
          },
          {
            title: 'Record an Uncut Unboxing Video',
            body: 'To claim a replacement or refund for damaged, cracked, leaking flacons or missing items, you must provide a continuous, uncut unboxing video showing the outer shipping label, sealed carton, and the product in its original packaging as unboxed.',
          },
          {
            title: 'Contact Us Within 24 Hours',
            body: 'Reach out to our team at atelier@rahemanperfumes.in or WhatsApp +91 98201 12345 within 24 hours of delivery with subject line "Refund/Damage Claim for Order [Order Number]" attaching your unboxing video and photos.',
          },
          {
            title: 'Verification & Resolution Within 3–4 Days',
            body: 'Our verification team will inspect your claim within 3–4 working days. Once accepted, a complimentary replacement flacon will be dispatched or a full refund initiated.',
          },
        ],
      },
      {
        kind: 'prose',
        heading: 'Non-Delivery Issues',
        body: [
          'If your tracking status is updated to "Delivered" but you have not received your parcel, you must notify our team within 48 hours of the delivery status update. Claims reported after 48 hours will not be eligible for courier investigation or refund.',
          'Upon notification, our internal logistics desk will launch a priority courier investigation with the carrier partner (Delhivery, Bluedart, etc.). You will receive a formal resolution within 3–4 working days.',
        ],
      },
      {
        kind: 'table',
        heading: 'Refund Timelines & Payment Methods',
        columns: ['Claim / Order Scenario', 'Eligibility Requirement', 'Verification Time', 'Refund Processing Timeline'],
        rows: [
          [
            'Prepaid Order Cancelled Before Packing',
            'Cancelled via My Account before warehouse packing begins',
            'Immediate',
            '4–5 business days to original payment method',
          ],
          [
            'Damaged, Leaked, or Defective Item',
            'Unboxing video reported within 24 hours of delivery',
            '3–4 business days',
            '5–6 business days (Original card/UPI or replacement)',
          ],
          [
            'Cash on Delivery (COD) Approved Refund',
            'Verified damage/defect claim on COD delivery',
            '3–4 business days',
            '5–6 business days to your provided Bank Account (NEFT/IMPS) or UPI',
          ],
          [
            'Courier Non-Delivery Investigation',
            'Reported within 48 hours of marked delivery',
            '3–4 business days',
            '100% full refund to original payment source upon courier confirmation',
          ],
        ],
      },
      {
        kind: 'prose',
        heading: 'Order Cancellation Policy',
        body: [
          'Before Dispatch: You may cancel your order at any time before it is packed and dispatched from our atelier warehouse. For prepaid orders (UPI, Credit/Debit Card, Net Banking), a 100% full refund will be initiated to your original payment method within 4–5 business days.',
          'After Dispatch: Once an order has been packed and handed to our courier partner with an assigned tracking AWB, it is in transit and cannot be cancelled or recalled en route. However, you may refuse to accept the delivery at your doorstep. Once the returned parcel reaches our facility and passes basic quality checks, the applicable refund will be processed to the original payment method.',
          'How to Cancel: Visit My Account → Orders to cancel orders in Processing status, or WhatsApp our concierge team at +91 98201 12345 with your order number.',
        ],
      },
      {
        kind: 'faq',
        heading: 'Frequently Asked Questions',
        items: [
          {
            title: 'Can I return or exchange a perfume if I do not like the smell?',
            body: 'No. Due to hygiene, safety regulations, and the intimate nature of personal fragrances, we do not accept returns or exchanges for opened, used, or delivered bottles based on personal scent preference. We recommend reviewing the detailed note breakdown on the product page or trying 12ml/30ml travel sizes first.',
          },
          {
            title: 'Why is an uncut unboxing video mandatory for damage claims?',
            body: 'Fine glass flacons and concentrated perfume oils require strict transit verification to ensure issues are resolved fairly and quickly with our shipping carriers. An uncut video clearly displaying the shipping label and unboxing guarantees immediate approval for replacement or refund.',
          },
          {
            title: 'How long do refunds take to reflect in my account?',
            body: 'Once a refund is approved by our team, prepaid refunds (Credit/Debit Card, Net Banking, UPI) typically reflect in your account within 5–6 business days. For COD orders, refunds are credited directly to your shared Bank Account via IMPS/NEFT or UPI within 5–6 working days.',
          },
          {
            title: 'What should I do if my tracking status says "Delivered" but I never got it?',
            body: 'Please contact us within 48 hours of the delivery notification. We will open an escalation ticket with the courier service to trace GPS coordinates and delivery proof, providing a resolution within 3–4 working days.',
          },
          {
            title: 'Can I cancel an order after it has been shipped?',
            body: 'Orders in transit cannot be recalled. If you no longer need the package, simply refuse the delivery when the courier partner attempts handover. Once returned to our warehouse, your refund will be initiated.',
          },
        ],
      },
    ],
  },

  faqs: {
    eyebrow: 'Contact Us',
    title: 'Fragrance FAQs',
    subtitle: 'Oil strength, lasting power, storage and common questions our team answers.',
    updated: '2026-08-01',
    sections: [
      {
        kind: 'faq',
        heading: 'About Our Perfumes',
        items: [
          { title: 'What is the difference between Original, Inspired and Mixed?', body: 'Original bottles are genuine branded perfumes bought directly from official distributors. Inspired perfumes are our own versions of famous designer scents, made at up to 40% oil concentration. Mixed blends are our in-house custom layers of two or more scents.' },
          { title: 'How long does a Raheman perfume last on skin?', body: 'Our own perfumes use up to 40% pure perfume oil concentration instead of the usual 15–20%. Expect 8–12 hours on skin and even longer on clothes. One or two sprays are enough.' },
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
    eyebrow: 'Contact Us',
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
          'Eau de Toilette (EDT) has 8–12% oil and feels light and fresh — good for hot days. Eau de Parfum (EDP) has 15–20% oil and lasts through a workday. Extrait de Parfum has up to 40% oil concentration and is the ultra-long-lasting strength we use in our Inspired perfumes — just two sprays last from morning till night.',
          'If you are trying a strong oil perfume for the first time, start with 50ml since you need fewer sprays each day.',
        ],
      },
      {
        kind: 'cards',
        items: [
          { icon: 'package', image: '/promise-delivery.jpg', title: 'Box Size', body: '50ml bottles ship in a 9 × 9 × 14 cm box; 100ml in 11 × 11 × 17 cm. Easy to store or carry.' },
          { icon: 'plane', image: '/cat-unisex.jpg?v=3', title: 'Flight Cabin Rules', body: 'Perfume bottles up to 100ml are allowed in flight cabin bags.' },
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
    eyebrow: 'Contact Us',
    title: 'Contact Us',
    subtitle: 'Our team reads every message directly. Expect a reply within one working day.',
    updated: '2026-08-01',
    sections: [
      { kind: 'contact' },
      {
        kind: 'cards',
        items: [
          { icon: 'phone', image: '/care-concierge.jpg', title: 'Call Or WhatsApp', body: '+91 98201 12345 · Monday to Saturday, 10:00 AM–7:00 PM' },
          { icon: 'mail', image: '/signin-atelier.jpg?v=3', title: 'Email', body: 'atelier@rahemanperfumes.in · replies within one working day' },
        ],
      },
      {
        kind: 'faq',
        heading: 'Before You Write',
        items: [
          { title: 'Where is my order?', body: 'Check the tracking page first — it shows live scan updates from the courier. If your parcel has not moved in 48 hours, message us and we will follow up directly.' },
          { title: 'Can I change my delivery address?', body: 'No. Once an order is confirmed, the delivery address cannot be changed because fulfillment processing and courier manifest booking begin immediately. Please verify your address carefully before placing your order. If you need to deliver to a different address, you can cancel your order from My Account while it is in Confirmed or Processing status and place a new order with the correct address.' },
          { title: 'Do you take bulk or corporate orders?', body: 'Yes. Wedding favours, corporate gifts and hotel amenities are available in minimum orders of 25 or more with custom labels. Write to us with quantities and a target date.' },
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
          'Today we bring together handcrafted inspired blends, genuine designer perfumes, and traditional Kannauj attars.',
        ],
      },
      {
        kind: 'cards',
        items: [
          { icon: 'verified', image: '/promise-authentic.jpg', title: 'Authentic Originals', body: 'Bought directly from official suppliers and carefully verified before stocking.' },
          { icon: 'flask', image: '/promise-custom.jpg', title: 'Hand-Made Blends', body: 'Our inspired blends and mixes are measured and blended carefully by hand.' },
          { icon: 'award', image: '/family-gourmand.jpg', title: 'Honest Pricing', body: 'No extra showroom markup — you pay fairly for the quality of oil in the bottle.' },
          { icon: 'shield', image: '/promise-quality.jpg', title: 'Sealed & Safe', body: 'Every order leaves our shop with a tamper-proof authenticity seal.' },
        ],
      },
      {
        kind: 'list',
        heading: 'How We Work',
        items: [
          'Raw oils are carefully sourced and checked when they arrive — poor quality lots are rejected',
          'Each fragrance blend rests properly before bottling so the scent becomes smooth and long lasting',
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
            bio: 'Imran started Raheman Perfumes with a simple goal: every attar and strong perfume should get the same care and quality check. He oversees every oud blend himself.',
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
            body: [
              'Oud, known scientifically as Aquilaria agallocha, transforms into liquid gold only when the tree is naturally inoculated with specialized fungal flora. Yet, an oud connoisseur can blind-smell Cambodian agarwood and distinguish it within seconds from wild Assam Hindi oud.',
              'The secret lies in the microclimate and traditional distillation techniques. Cambodian oud trees flourish along the humid, tropical coastal ranges of Koh Kong and Pursat. During hydro-distillation, the resin yields high concentrations of balsamic esters and sweet sesquiterpenes. The initial aroma greets the senses with sun-drenched dried apricots, wild fig, caramelized dates, and a glowing golden honey undertone with almost zero aggressive funk.',
              'By contrast, Hindi Oud distilled in Assam undergoes an ancestral water fermentation period in earthen copper degs. This traditional process produces a powerfully masculine, animalic, barnyard, and rich dark leather sillage that gradually melts into dark smokey vetiver and ancient forest floor over 12 hours.',
              'At Raheman Perfumes, we celebrate both traditions: pairing Cambodian sweetness with our modern European luxury formulas, while honoring pure Hindi oud in our limited-batch heritage attars.',
            ],
          },
          {
            tag: 'Guide',
            title: 'Understanding Top, Middle & Base Notes',
            excerpt:
              'What you smell in the first 10 minutes is different from what stays after 4 hours. Here is a simple way to test a perfume before buying.',
            date: '2026-07-29',
            readTime: '6 min read',
            body: [
              'Every master fragrance is an olfactory pyramid of evaporative physics. When you spray a fine French parfum, the lighter molecules with lower boiling points take flight first, while dense resins linger on your skin until dawn.',
              'Top Notes (0–15 Minutes): These are your first impression. Volatile citrus fruits (bergamot, frozen lemon, pink grapefruit) and aromatic herbs (mint, cardamom, lavender) burst forth immediately. Never judge a perfume solely on its opening spray.',
              'Heart / Middle Notes (30 Minutes – 4 Hours): As the bright top notes evaporate, the true character of the fragrance emerges. Floral accords (Taif rose, night-blooming jasmine), spices (cinnamon, nutmeg), and sweet gourmand elements bloom here, defining the emotion of your scent trail.',
              'Base Notes (4 Hours – 24 Hours): The foundation and anchor. Composed of heavyweight molecules like aged Indian sandalwood, dark oud, Madagascar vanilla, ambergris, and tonka bean. The base notes bond with your personal skin lipids to create your unique sillage.',
              'Pro tip from our perfumers: When sampling a fragrance, spray on your inner forearm and wait at least 45 minutes before deciding. Let the heart and base speak.',
            ],
          },
          {
            tag: 'Craft',
            title: 'Why Resting Perfumes Makes Them Last Longer',
            excerpt:
              'Letting a freshly mixed bottle sit in cool dark glass helps the oils settle together so the smell is smoother and stays longer.',
            date: '2026-07-02',
            readTime: '5 min read',
            body: [
              'In commercial mass production, perfumes are mixed and rushed to retail shelves within 48 hours. In haute parfumerie, however, patience is an essential ingredient.',
              'Maceration and maturation are biochemical phenomena. When pure concentrated perfume oils are combined with perfumer’s alcohol, microscopic chemical bonds take weeks to stabilize into cohesive molecular clusters.',
              'During the first 21 to 30 days of cold dark resting in ultraviolet-shielded glass flacons, sharp alcoholic edges soften. Volatile terpenes gently dissolve into heavier fixatives, removing harsh chemical spikes and producing a remarkably smooth, velvety texture on the skin.',
              'At Raheman Atelier, all our signature perfumes are cold-rested for a minimum of 4 weeks prior to hand-pouring, ensuring unparalleled depth and longevity in every single bottle.',
            ],
          },
          {
            tag: 'Buying',
            title: 'How To Choose Your Signature Scent',
            excerpt:
              'A practical guide to matching top, heart, and base notes with Indian weather and daily occasions.',
            date: '2026-06-18',
            readTime: '6 min read',
            body: [
              'Finding your signature scent is not about following fleeting celebrity trends; it is about matching your fragrance profile with your daily lifestyle, climate, and body chemistry.',
              'For Hot & Humid Days: High heat accelerates evaporation. Heavy sweet vanillas or dense leathers can become cloying and overwhelming. Instead, gravitate toward crisp aquatic, frozen citrus, marine, and green vetiver compositions that stay fresh and uplifting all day.',
              'For Evenings & Formal Occasions: When temperatures drop, opt for scents with projection and presence: spiced cardamom, amber resin, rich smoky oud, and Madagascar vanilla.',
              'Testing Etiquette: Always test on clean, unscented skin. Do not rub your wrists together after spraying, as friction creates heat that bruises the delicate top volatile molecules and distorts the intended scent profile.',
            ],
          },
          {
            tag: 'Care',
            title: 'Storing Perfume In An Indian Summer',
            excerpt:
              'High heat and humidity can weaken fresh scents fast. Keep bottles in a cool, dark drawer away from windows.',
            date: '2026-05-30',
            readTime: '4 min read',
            body: [
              'Indian summers bring intense heat and fluctuating humidity that can quietly ruin even the most expensive luxury fragrance if stored improperly.',
              'The three enemies of fine perfume are direct UV light, fluctuating heat, and high moisture. Bathrooms are notoriously the worst place to keep your perfumes: hot shower steam and humidity seep into atomizers and cause oxidation.',
              'Best Practice: Store your bottles in their original packaging or in an ambient dark bedroom wardrobe or drawer. Keep temperatures steady between 18°C and 25°C. When protected from light and heat, pure oil perfumes can retain their peak brilliance for 5 to 10 years.',
            ],
          },
          {
            tag: 'Oils',
            title: 'Sandalwood: How To Spot Real Quality',
            excerpt:
              'Pure sandalwood oil grows slowly and is often mixed with fillers by cheap sellers. Here is what we check before buying.',
            date: '2026-05-09',
            readTime: '6 min read',
            body: [
              'True Mysore Sandalwood (Santalum album) is one of the most revered and adulterated natural essences in the global fragrance industry.',
              'Synthetic substitutes like Polysantol or Javanol offer immediate woody projection, but they lack the multidimensional creamy, buttery, milky warmth that develops only from 30-year-old mature heartwood.',
              'How to spot authenticity: Authentic sandalwood oil has a thick, viscous honey-like golden drape. When applied to the skin, its opening is surprisingly subtle, soft, and milky. As body heat warms the oil over 2 hours, it expands into an enveloping aura of celestial creamy warmth that lasts on fabric for days.',
              'We ethically source our pure sandalwood heartwood oil from sustainable, certified plantations with government oversight, ensuring pure heritage quality in every drop.',
            ],
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
        options={['Order enquiry', 'Bulk & corporate gifting', 'General support', 'Something else']}
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

      {section.kind === 'posts' && <PostsSection section={section} />}
    </section>
  )
}

function PostsSection({ section }) {
  const [activePost, setActivePost] = useState(null)

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {section.items.map((post) => (
          <article
            key={post.title}
            onClick={() => setActivePost(post)}
            className="card-surface card-lift group flex flex-col p-6 cursor-pointer transition hover:border-brand-gold/60 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-label-sm font-bold uppercase tracking-wider text-brand-goldDark">{post.tag}</span>
              <span className="text-xs font-semibold text-brand-goldDark group-hover:translate-x-0.5 transition-transform">
                Read Guide →
              </span>
            </div>
            <h3 className="mt-3 font-serif text-xl font-semibold leading-snug text-brand-charcoal transition-colors group-hover:text-brand-goldDark">
              {post.title}
            </h3>
            <p className="mt-3 flex-1 text-body-sm leading-relaxed text-brand-muted">{post.excerpt}</p>
            <p className="mt-5 flex items-center gap-3 border-t border-brand-border pt-4 text-body-sm text-brand-muted">
              <span>{new Date(post.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              <span aria-hidden="true">·</span>
              <span>{post.readTime}</span>
            </p>
          </article>
        ))}
      </div>

      <Modal
        open={Boolean(activePost)}
        onClose={() => setActivePost(null)}
        title={activePost?.title}
        size="lg"
      >
        {activePost && (
          <div className="space-y-4 pt-1 text-brand-charcoal">
            <div className="flex items-center gap-3 border-b border-brand-border/70 pb-3 text-xs text-brand-muted">
              <span className="font-bold uppercase tracking-wider text-brand-goldDark">{activePost.tag}</span>
              <span>·</span>
              <span>{new Date(activePost.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              <span>·</span>
              <span>{activePost.readTime}</span>
            </div>
            <div className="space-y-3.5 text-sm leading-relaxed text-ink-variant">
              {(activePost.body || [activePost.excerpt]).map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </>
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
            <h1 className="max-w-4xl font-serif text-[30px] font-medium leading-tight text-brand-charcoal sm:text-[40px]">
              {page.title}
            </h1>
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
              Return & Refund Policy
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
