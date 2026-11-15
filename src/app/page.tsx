"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useOptionalCart } from "@/context/cart-context";
import { Icon } from "@/components/ui/Icon";

// Featured Charms Showcase items matching design spec
const FEATURED_CHARMS = [
  {
    id: "honey-bear-charm",
    slug: "honey-bear-clay-charm",
    name: "Cuddle Bear Clay Charm",
    priceMinor: 180000,
    priceFormatted: "Rs. 1,800",
    badge: "🍯 Studio Favorite",
    category: "critters",
    description: "Chubby polymer bear with warm caramel undertones, fine hand-painted blush cheeks, and stainless silver swivel ring.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBxTq8MIlWsTVOdWjmqhR3BpAej9PqZLlfhzXIpakycP2BoMR5RjSOBySxHE41agokCtRDlRJ16ULkQesRTFO-Wk_BNqgsw6UfzsJfTdTxjXp9Xl404QKdksjUVYtZi6JHLWtMgcHWUW3Z8IFwjBjEA7xw-bznUkh-KN9xgBcm0MbZHlVxI6ktQ0EP7kvlFDZtnZzN4u2xh-bFcbUmYMAHqD08PGYGbLAhO18YZwT1ve0NKX08x1mV_",
  },
  {
    id: "acrobat-spidey-keyring",
    slug: "acrobat-spidey-keyring",
    name: "Acrobat Spidey Keyring",
    priceMinor: 220000,
    priceFormatted: "Rs. 2,200",
    badge: "🕸️ Best Seller",
    category: "heroes",
    description: "Vibrant crimson and indigo hero sculpted hanging inverted by hand-twisted silver wire webbing with spider-sigil backing.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCFJBErDthdL3hVVV_JEZdWGc_oU1MbdwwMf7N05yOHobzRAdhFQzY2dHP2bBcMUH3TURWPZry_MqkgwllT4iqW18pIYzjPusDn1AI9dicV74sUAnz0K-IJqR09LW_jAzu-OHCjV5SCZVULgMXgD_HUQ2bpBaWg5pPIUjGmz7rRo6jTEO_0IWcaTXuYvM2i13mXIWwaCHWaAK8BDWFWNX3OMynRwB-ECro2oB8HDFP8ShOdfj6pmCp",
  },
  {
    id: "chibi-shinobi-pendant",
    slug: "chibi-shinobi-pendant",
    name: "Chibi Shinobi Pendant",
    priceMinor: 200000,
    priceFormatted: "Rs. 2,000",
    badge: "🍃 Anime Edition",
    category: "heroes",
    description: "Features iconic spiky hair and leaf forehead protector with rich mandarin jumpsuits sculpted from pre-tinted polymer.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCvJiLMGHVgmSLO-6F0UY_UImVAurSHTuB2iEnH54oMICk91WQaREUHHDMk5K-YW2uNQXaAgEPt38azjf7Kr_fEH6NuPFyhrA5kWNrLqqkOQmza3ajscOGtJaDXmXE_X3gwnE53-N6QiPsHbapRed7qdIATFRviCQ41A_TP9YH-kMKrzdCyfDxPSzsAtpGX7l76mW7p-bZydT4znfe2_PvpZX_1FT-tn5Yh2Aj6odFC2rVNW4hHfylB",
  },
  {
    id: "shadow-star-walker",
    slug: "shadow-star-walker",
    name: "Shadow Star Walker",
    priceMinor: 190000,
    priceFormatted: "Rs. 1,900",
    badge: "⭐ Pixel Star Clasp",
    category: "gaming",
    description: "Midnight charcoal silhouette with electric amethyst eyes paired with our custom five-point golden star clip clasp.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAMlAn47ftbMELAtDcCJTo2MUrH864bbZ5fVvKE0UrawWPsCvSJEqXlfNWxceX87dhIi46YcOzV3HQlql7v7SmsGy-FNiSy59WamVM2LWubBFN_tFolop8IoQjzUVp6tFpgpB0Bwse7Z_ViBLg7JWcv1FsWYABr022mQ8ZT89W_RNr8qU_hvdlbx5nnEip0s13_evWXtncTp2zDk3MOgdeHPA1Pi6gGMmIqN4pAQHmbKLK6j88UI292",
  },
  {
    id: "honey-teddy-keepsake",
    slug: "honey-teddy-keepsake",
    name: "Honey Teddy Keepsake",
    priceMinor: 185000,
    priceFormatted: "Rs. 1,850",
    badge: "🧸 Small Batch",
    category: "critters",
    description: "Curved arms and cozy posture, fired with triple-strength core clay to survive backpacks, keyrings, and travel cases.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBxTq8MIlWsTVOdWjmqhR3BpAej9PqZLlfhzXIpakycP2BoMR5RjSOBySxHE41agokCtRDlRJ16ULkQesRTFO-Wk_BNqgsw6UfzsJfTdTxjXp9Xl404QKdksjUVYtZi6JHLWtMgcHWUW3Z8IFwjBjEA7xw-bznUkh-KN9xgBcm0MbZHlVxI6ktQ0EP7kvlFDZtnZzN4u2xh-bFcbUmYMAHqD08PGYGbLAhO18YZwT1ve0NKX08x1mV_",
  },
  {
    id: "matcha-roll-neko-charm",
    slug: "matcha-roll-neko-charm",
    name: "Matcha Roll Neko Charm",
    priceMinor: 170000,
    priceFormatted: "Rs. 1,700",
    badge: "🍵 Pastry Cafe",
    category: "pastry",
    description: "Soft jade green clay swirl topped with miniature powdered sugar texture and a glossy resin strawberry slice.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDk3Z-iguUECUvUWJT-ZaI6_ZMBsBs9TGn3fRt6Le6RmO_XKTL16uROILplBPC0oTIKr1h_r-lk29-TByvGj4aNtNdDs_UAuV0TYQFrl664uEknA-v30wMS2_FeEvgZy5cswIhqN7pH6yi_LStl6vhX3LtJBW2EQ7V1AO04pv_7rTTSAT42J4DP0N6BtoYdNAGGLTRn0x5PsqgCWxy34-bKwt-T9NxBR--o5MKjUQY",
  },
  {
    id: "amber-caramel-purin-charm",
    slug: "amber-caramel-purin-charm",
    name: "Amber Caramel Purin Charm",
    priceMinor: 165000,
    priceFormatted: "Rs. 1,650",
    badge: "🍮 Custard Purin",
    category: "pastry",
    description: "Jelly-like glazed polymer custard with hand-dripped caramel syrup layer and delicate gold star dangle bead.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGv135mV4alOOTxXNWNYmVdD8ShpejuRiombUoJ5ld9GMNxxAPObvrSeNkWwA8ySNWpDvmnMVlyMNRiCOiTn3aulUH3HeIG370Kr_CxR_ivx6owkYrO9eEfrtV27_Zm8ZlT1HCKEQJbObadZF1RuEz7xmjIV-PJWd9659-AxMFLhAzGj6Rwa7IhH_EbS5OZzyrj5h4r3K5fM5uE2CgxZqVDA9GNQawzVSmUnGiqJs",
  },
  {
    id: "mochi-usagi-snow-bunny",
    slug: "mochi-usagi-snow-bunny",
    name: "Mochi Usagi Snow Bunny",
    priceMinor: 175000,
    priceFormatted: "Rs. 1,750",
    badge: "🐰 Limited Restock",
    category: "critters",
    description: "Silky matte-textured bunny silhouette with gentle blush accents and miniature pastel chime bell.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCP08iCBRGaLFOWpY3ISIZt6BqxgZ9C0cO0-DE7Rjz9Z2_TMhtC0QEnr65fdKUAP6_bi7Clnnt0ydfrWKZAbcQFm0FL2uBccyOGKeU0T4KxeXvEh_APhkyde_mJl6axqvB5ZBqB6a9fJAyLTPbYc5uiBRRedS30Vtv_7b9KnU7OwD-6tkqHCz2te_QOikLYu6DaIWM3C0kFAV3hqXcGLjwe1bWOWiPWWSAHXAQeQaU",
  },
];

// Interactive Atelier Options
const CHAR_OPTIONS = [
  {
    name: "Honey Bear",
    pricePaisa: 140000,
    priceFormatted: "Rs. 1,400",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBxTq8MIlWsTVOdWjmqhR3BpAej9PqZLlfhzXIpakycP2BoMR5RjSOBySxHE41agokCtRDlRJ16ULkQesRTFO-Wk_BNqgsw6UfzsJfTdTxjXp9Xl404QKdksjUVYtZi6JHLWtMgcHWUW3Z8IFwjBjEA7xw-bznUkh-KN9xgBcm0MbZHlVxI6ktQ0EP7kvlFDZtnZzN4u2xh-bFcbUmYMAHqD08PGYGbLAhO18YZwT1ve0NKX08x1mV_",
  },
  {
    name: "Acrobat Spidey",
    pricePaisa: 160000,
    priceFormatted: "Rs. 1,600",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCFJBErDthdL3hVVV_JEZdWGc_oU1MbdwwMf7N05yOHobzRAdhFQzY2dHP2bBcMUH3TURWPZry_MqkgwllT4iqW18pIYzjPusDn1AI9dicV74sUAnz0K-IJqR09LW_jAzu-OHCjV5SCZVULgMXgD_HUQ2bpBaWg5pPIUjGmz7rRo6jTEO_0IWcaTXuYvM2i13mXIWwaCHWaAK8BDWFWNX3OMynRwB-ECro2oB8HDFP8ShOdfj6pmCp",
  },
  {
    name: "Chibi Shinobi",
    pricePaisa: 150000,
    priceFormatted: "Rs. 1,500",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCvJiLMGHVgmSLO-6F0UY_UImVAurSHTuB2iEnH54oMICk91WQaREUHHDMk5K-YW2uNQXaAgEPt38azjf7Kr_fEH6NuPFyhrA5kWNrLqqkOQmza3ajscOGtJaDXmXE_X3gwnE53-N6QiPsHbapRed7qdIATFRviCQ41A_TP9YH-kMKrzdCyfDxPSzsAtpGX7l76mW7p-bZydT4znfe2_PvpZX_1FT-tn5Yh2Aj6odFC2rVNW4hHfylB",
  },
  {
    name: "Shadow Star Walker",
    pricePaisa: 150000,
    priceFormatted: "Rs. 1,500",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAMlAn47ftbMELAtDcCJTo2MUrH864bbZ5fVvKE0UrawWPsCvSJEqXlfNWxceX87dhIi46YcOzV3HQlql7v7SmsGy-FNiSy59WamVM2LWubBFN_tFolop8IoQjzUVp6tFpgpB0Bwse7Z_ViBLg7JWcv1FsWYABr022mQ8ZT89W_RNr8qU_hvdlbx5nnEip0s13_evWXtncTp2zDk3MOgdeHPA1Pi6gGMmIqN4pAQHmbKLK6j88UI292",
  },
];

const CLASP_OPTIONS = [
  { name: "Golden Star Carabiner", pricePaisa: 50000, priceFormatted: "Rs. 500", icon: "hotel_class", color: "text-tertiary" },
  { name: "Heart Rosy Clasp", pricePaisa: 50000, priceFormatted: "Rs. 500", icon: "favorite", color: "text-strawberry-blush" },
  { name: "Classic Swivel Ring", pricePaisa: 30000, priceFormatted: "Rs. 300", icon: "radio_button_checked", color: "text-outline" },
  { name: "Pastel Beaded Strap", pricePaisa: 40000, priceFormatted: "Rs. 400", icon: "all_inclusive", color: "text-secondary" },
];

const DANGLE_OPTIONS = [
  { name: "Strawberry", emoji: "🍓", pricePaisa: 30000, priceFormatted: "+Rs. 300" },
  { name: "Chime Bell", emoji: "🔔", pricePaisa: 20000, priceFormatted: "+Rs. 200" },
  { name: "Mini Macaron", emoji: "🧁", pricePaisa: 40000, priceFormatted: "+Rs. 400" },
  { name: "Star Gem", emoji: "✨", pricePaisa: 20000, priceFormatted: "+Rs. 200" },
];

export default function HomePage() {
  const { addItem, openDrawer } = useOptionalCart();
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedChar, setSelectedChar] = useState(CHAR_OPTIONS[0]);
  const [selectedClasp, setSelectedClasp] = useState(CLASP_OPTIONS[0]);
  const [selectedDangles, setSelectedDangles] = useState([DANGLE_OPTIONS[0], DANGLE_OPTIONS[1]]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Toggle Dangles (max 2)
  const toggleDangle = (dangle: typeof DANGLE_OPTIONS[0]) => {
    setSelectedDangles((prev) => {
      const exists = prev.some((d) => d.name === dangle.name);
      if (exists) {
        return prev.filter((d) => d.name !== dangle.name);
      }
      if (prev.length >= 2) {
        return [prev[1], dangle];
      }
      return [...prev, dangle];
    });
  };

  const danglesTotalPaisa = selectedDangles.reduce((sum, d) => sum + d.pricePaisa, 0);
  const atelierTotalPaisa = selectedChar.pricePaisa + selectedClasp.pricePaisa + danglesTotalPaisa;

  // Add Item to Bag from Featured Vitrine
  const handleQuickAdd = (charm: typeof FEATURED_CHARMS[0]) => {
    addItem({
      productId: charm.id,
      slug: charm.slug,
      title: charm.name,
      basePriceMinor: charm.priceMinor,
      unitPriceMinor: charm.priceMinor,
      quantity: 1,
      imageUrl: charm.image,
      leadTimeDays: 2,
    });
    setToastMessage(`Added ${charm.name} to Bag!`);
    openDrawer();
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Add Custom Atelier Item to Bag
  const handleAddCustomToBag = () => {
    const customSummary = `${selectedChar.name} with ${selectedClasp.name} & ${selectedDangles.map((d) => d.name).join(", ")}`;
    addItem({
      productId: `custom-${selectedChar.name.toLowerCase().replace(/\s+/g, "-")}`,
      slug: "custom-order",
      title: `Custom ${selectedChar.name} Charm`,
      basePriceMinor: selectedChar.pricePaisa,
      unitPriceMinor: atelierTotalPaisa,
      quantity: 1,
      imageUrl: selectedChar.image,
      customization: {
        Character: selectedChar.name,
        Hardware: selectedClasp.name,
        Dangles: selectedDangles.map((d) => d.name).join(", "),
      },
      customText: customSummary,
      leadTimeDays: 5,
    });
    setToastMessage(`Custom ${selectedChar.name} Charm Queued for Atelier!`);
    openDrawer();
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredCharms =
    activeCategory === "all"
      ? FEATURED_CHARMS
      : FEATURED_CHARMS.filter((item) => item.category === activeCategory);

  return (
    <div className="flex flex-col w-full bg-background min-h-screen pt-4 sm:pt-6">
      {/* SECTION 1: HERO WITH SCALLOP / CLOUD CONTOUR */}
      <section className="relative w-full overflow-hidden bg-surface-custard pb-20 pt-8 sm:pt-12">
        {/* Decorative Floating Pastel Doodles & Glows */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute left-8 top-12 h-24 w-24 rounded-full bg-strawberry-subtle/70 blur-2xl" />
          <div className="absolute right-12 top-20 h-32 w-32 rounded-full bg-peach-cream/30 blur-3xl" />
          <div className="absolute bottom-24 left-1/3 h-28 w-28 rounded-full bg-matcha-soft/20 blur-2xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1240px] px-4 sm:px-6">
          {/* Breadcrumb badge pill */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-surface-cloud px-4 py-1.5 shadow-sm text-espresso-deep border border-border-warm/40">
              <span className="text-strawberry-blush font-bold">🍓</span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-espresso-muted">
                Polymer Clay, Resin &amp; Endless Affection • Limited Atelier Studio
              </span>
              <span className="text-matcha-soft">✨</span>
            </div>
          </div>

          {/* Hero Header & JUMPING HONEY BEAR CHARACTER */}
          <div className="text-center max-w-3xl mx-auto mb-10 relative">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-display text-espresso-deep tracking-tight mb-5 leading-tight relative inline-block">
              Tiny Pals &amp; Sweet Keepsakes,<br />
              <span className="relative inline-flex items-center flex-wrap justify-center gap-2">
                <span className="text-strawberry-blush inline-block">Handcrafted Just for You</span>
                <span className="text-strawberry-blush">✨</span>

                {/* JUMPING HONEY BEAR MASCOT */}
                <span className="relative inline-block ml-1 align-middle group cursor-pointer" title="Hugging Honey Bear jumps for joy!">
                  {/* Sparkle particles */}
                  <span className="absolute -top-3 -right-2 text-tertiary-container animate-sparkle-pop pointer-events-none text-base">✦</span>
                  <span className="absolute top-1 -left-3 text-strawberry-blush animate-sparkle-pop pointer-events-none text-sm">✧</span>
                  <span className="absolute -bottom-1 -right-3 text-matcha-soft animate-sparkle-pop pointer-events-none text-xs">✨</span>

                  {/* Animated jumping bear container */}
                  <span className="inline-block animate-honey-jump origin-bottom transform-gpu hover:scale-110 transition-transform">
                    <span className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full p-1 bg-surface-cloud shadow-md border-2 border-strawberry-blush/60 flex items-center justify-center overflow-hidden inline-block align-middle backdrop-blur-sm">
                      <img
                        alt="Jumping Honey Bear mascot"
                        className="w-full h-full object-contain p-1 rounded-full pointer-events-none"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDP4rSCttNte0ScSbQJmrjALN9EA9jiusvAp-1Hnl-qjQh2Oj4cGyMw-p2VSEArXWC6Ibeegm7BMcCqCFlDrNpau4w25o4MYuN-dGUdSHypAzQxeSvwY03du3tVLFHvBeryL881auOaUHMDDzDpM-GlLzxi25wcXiYha5awoQpkNMH8jTrBLsSpGtRyQaLoNtzt_6BXu9qVPOEPGvFddiPbYmIBNve60CxJ322B4b3T7itKapvRVFJt"
                      />
                    </span>
                  </span>
                  {/* Squish shadow beneath bear */}
                  <span className="block w-10 sm:w-12 h-2 mx-auto bg-espresso-deep/15 rounded-full blur-[1px] -mt-1 scale-90" />
                </span>
              </span>
              <span className="sr-only"> - Handcrafted keepsakes baked to brighten everyday rituals</span>
            </h1>

            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
              Handcrafted keepsakes baked to brighten everyday rituals. Playful polymer clay charms, hand-glazed figurines, and tactile bag trinkets baked with slow affection and sealed with triple diamond UV glaze for everyday adventures.
            </p>

            {/* CTA Action Hub */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-strawberry-blush px-8 py-3.5 font-label-lg text-label-lg text-on-primary shadow-md hover:opacity-95 transition-all transform hover:-translate-y-0.5 active:scale-95"
              >
                <span>Browse Ready-Made Charms</span>
                <span>🍓</span>
              </Link>
              <Link
                href="/custom-order"
                className="inline-flex items-center gap-2 rounded-full bg-surface-cloud px-7 py-3.5 font-label-lg text-label-lg text-espresso-deep shadow-sm hover:bg-surface-container transition-all transform hover:-translate-y-0.5 border border-border-warm"
              >
                <span>Request Bespoke Charm</span>
                <Icon name="auto_awesome" className="text-[18px] text-strawberry-blush" aria-hidden="true" />
              </Link>
            </div>

            {/* Micro Feature Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-peach-tint px-3.5 py-1 text-label-sm font-label-sm text-tertiary shadow-sm">
                <Icon name="brush" className="text-[14px]" aria-hidden="true" /> Hand-sculpted Polymer Clay
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-matcha-tint px-3.5 py-1 text-label-sm font-label-sm text-secondary shadow-sm">
                <Icon name="water_drop" className="text-[14px]" aria-hidden="true" /> Water-resistant UV Glaze
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-strawberry-subtle px-3.5 py-1 text-label-sm font-label-sm text-primary shadow-sm">
                <Icon name="star" className="text-[14px]" aria-hidden="true" /> 100% Unique Artisanal 1-of-1
              </span>
            </div>
          </div>

          {/* Hero Visual Vitrine Showcase (4 Charm Showcase Cards) */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {FEATURED_CHARMS.slice(0, 4).map((charm, idx) => (
              <div
                key={charm.id}
                className={`group relative rounded-3xl bg-surface-cloud p-3 shadow-md hover:shadow-xl transition-all duration-300 border border-border-warm/40 ${
                  idx % 2 === 1 ? "-translate-y-1 sm:translate-y-2" : ""
                }`}
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-surface-custard">
                  <img
                    alt={charm.name}
                    className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    src={charm.image}
                  />
                  <span className="absolute top-2.5 left-2.5 rounded-full bg-surface-cloud/95 px-2.5 py-0.5 font-label-sm text-label-sm text-espresso-deep backdrop-blur-sm shadow-xs">
                    {charm.badge}
                  </span>
                </div>
                <div className="pt-3 pb-1 px-1 flex items-center justify-between">
                  <div className="overflow-hidden">
                    <p className="font-title-sm text-title-sm text-espresso-deep truncate">{charm.name}</p>
                    <p className="font-label-sm text-label-sm text-espresso-muted">{charm.priceFormatted}</p>
                  </div>
                  <button
                    onClick={() => handleQuickAdd(charm)}
                    className="w-8 h-8 rounded-full bg-peach-tint flex items-center justify-center text-strawberry-blush shadow-xs hover:bg-strawberry-blush hover:text-white transition-colors shrink-0 ml-2"
                  >
                    <Icon name="add_shopping_cart" className="text-[16px]" aria-hidden="true" />
                    <span className="sr-only">Quick add {charm.name} to bag</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scalloped Cloud Divider Bottom Mask */}
        <div className="absolute bottom-0 left-0 right-0 h-10 w-full overflow-hidden leading-none z-10 pointer-events-none">
          <svg className="relative block w-full h-10 text-background" fill="currentColor" preserveAspectRatio="none" viewBox="0 0 1200 120">
            <path d="M0,0 C150,90 350,-40 500,60 C650,140 900,-20 1200,40 L1200,120 L0,120 Z" />
          </svg>
        </div>
      </section>

      {/* SECTION 2: FEATURED CHARMS OF THE WEEK WITH SWINGING SPIDEY */}
      <section className="w-full py-16 bg-background relative overflow-visible" id="featured-charms">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 relative">
          {/* Header with SWINGING UPSIDE-DOWN SPIDEY */}
          <div className="relative text-center max-w-2xl mx-auto mb-12">
            {/* Animated Hanging Spidey Mascot on Silk Cobweb line */}
            <div className="hidden sm:block absolute -top-16 right-0 md:-right-8 lg:-right-16 z-20 pointer-events-auto group cursor-pointer" title="Acrobat Spidey hanging from a silky web thread!">
              <div className="origin-top animate-spidey-sway" style={{ transformOrigin: "top center" }}>
                <div className="w-[2px] h-14 bg-gradient-to-b from-stone-400/80 via-stone-300 to-strawberry-blush mx-auto relative">
                  <span className="absolute top-2 -left-2 text-[10px] text-espresso-muted/60">🕸️</span>
                  <span className="absolute top-8 -right-2 text-[8px] text-strawberry-blush">✦</span>
                </div>
                <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-strawberry-blush bg-surface-cloud shadow-lg overflow-hidden group-hover:scale-110 group-hover:rotate-12 transition-all p-0.5">
                  <img
                    alt="Swinging Upside-Down Spidey Charm"
                    className="w-full h-full object-contain p-0.5 transform rotate-180 hover:rotate-180"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkROyQ2bBrnZfR5p9m5lzVwlxS1pcqWnUwHnddkweLhpBebPO5749QAuSp1BEqnabG3E1XFqDcThcrr6cbUuMojwq-Vq2-pr9ReRATj4fv58PVfGE_-aMmke4jsGx2k0StN7a55IUzRRDO27fCgYuFkhkdf7oNB-bM1FOz9BXYM-inELMRsK6SufPLnim4NVY2NkhOziV6JZ2bfgpjFWC0snKbNUGMQ4f9yZeY5fC_NSq6654Tq6Ip"
                  />
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                </div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-espresso-deep text-on-primary text-[10px] px-2 py-0.5 rounded-full font-label-sm shadow-sm pointer-events-none">
                  Thwip! 🕸️
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 text-strawberry-blush mb-2">
              <span>✦</span>
              <h2 className="font-headline text-2xl md:text-headline-md text-espresso-deep font-bold">
                Featured Charms of the Week
              </h2>
              <span>✦</span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Fresh out of the studio oven! Each piece is individually sculpted, oven-fired, hand-painted with fine acrylic inks, and sealed in triple glossy UV crystal glaze.
            </p>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              {[
                { id: "all", label: "All Charms (42)" },
                { id: "critters", label: "Cute Critters" },
                { id: "heroes", label: "Anime & Pop Heroes" },
                { id: "gaming", label: "Gaming Sprites" },
                { id: "pastry", label: "Sweet Pastry Charms" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id)}
                  className={`rounded-full px-4 py-1.5 font-label-md text-label-md shadow-xs transition-all ${
                    activeCategory === tab.id
                      ? "bg-strawberry-blush text-on-primary shadow-sm"
                      : "bg-surface-cloud text-espresso-deep hover:bg-surface-custard border border-border-warm/40"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid: 8-Vitrine Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCharms.map((charm) => (
              <div
                key={charm.id}
                className="group bg-surface-cloud rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between border border-border-warm/40"
              >
                <div>
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-surface-custard mb-4">
                    <img
                      alt={charm.name}
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      src={charm.image}
                    />
                    <div className="absolute top-3 left-3 bg-surface-cloud/95 backdrop-blur-sm rounded-full px-3 py-1 font-label-sm text-label-sm text-espresso-deep shadow-xs flex items-center gap-1">
                      {charm.badge}
                    </div>
                    <button
                      type="button"
                      title="Save to lovelist"
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-cloud/90 text-espresso-muted hover:text-strawberry-blush flex items-center justify-center transition-colors shadow-xs"
                    >
                      <Icon name="favorite" className="text-[18px]" aria-hidden="true" />
                      <span className="sr-only">Save to lovelist</span>
                    </button>
                  </div>
                  <h3 className="font-title-md text-title-md text-espresso-deep font-bold mb-1">
                    {charm.name}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-4 line-clamp-2">
                    {charm.description}
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-border-warm/30">
                  <span className="font-headline-sm text-headline-sm text-espresso-deep font-bold">
                    {charm.priceFormatted}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(charm)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-peach-tint hover:bg-strawberry-blush hover:text-on-primary text-strawberry-blush px-4 py-2 font-label-md text-label-md transition-all shadow-xs active:scale-95"
                  >
                    <span>Add</span>
                    <Icon name="add_shopping_cart" className="text-[16px]" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom View All Button */}
          <div className="mt-12 text-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-strawberry-blush text-on-primary px-8 py-3.5 font-label-lg text-label-lg shadow-sm hover:opacity-95 transition-all transform hover:-translate-y-0.5"
            >
              <span>View All 42 Creations</span>
              <Icon name="arrow_forward" className="text-[18px]" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 3: BUILD YOUR BESPOKE CHARM WITH HOVERING SHADOW ENDER */}
      <section className="w-full py-20 bg-surface-custard relative overflow-hidden" id="customizer">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 relative z-10">
          {/* Heading with HOVERING / TELEPORTING SHADOW ENDER CHARACTER */}
          <div className="relative text-center max-w-2xl mx-auto mb-14">
            {/* Floating Amethyst Ender Guardian */}
            <div
              className="hidden md:flex absolute -top-8 -left-12 lg:-left-20 flex-col items-center group cursor-pointer"
              title="Shadow Star Walker watching over your custom creations!"
            >
              <div className="relative w-16 h-20 lg:w-20 lg:h-24 rounded-2xl bg-espresso-deep/90 border border-purple-400/50 p-1 flex flex-col items-center justify-center animate-ender-float">
                <img
                  alt="Hovering Shadow Star Walker"
                  className="w-full h-full object-contain p-0.5 rounded-xl"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqcUvA5IBYRyGT_pniC4JxE53G4ZN0VtoMVTNyRgu25ygEbRkGSkxqu0pMM4GheVEMBUs-M29Q1RLkbInQi5UiKeYS_-yT9IjZRxnBDx_JbNWhZ5QTNRh9IRngoLbfZWipo2s4lG8TyImX3UvceTpHZpzWiwNHw6TTm190s4ESn82tWZ5zsIJuAgZknDcq3XikAbvEjJqOozcxV8GtfNWlr_GbBCMPMWYXdpqeH26RYqYB-lFmJPrT"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-purple-400 animate-ping" />
              </div>
              <span className="mt-2 text-[11px] font-label-sm text-purple-700 bg-surface-cloud/90 px-2 py-0.5 rounded-full shadow-xs">
                Teleporting Observer
              </span>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-strawberry-subtle text-primary px-4 py-1 font-label-sm text-label-sm uppercase tracking-wider mb-3 font-bold">
              <span>✨</span> Interactive Charm Atelier
            </span>
            <h2 className="font-headline text-3xl md:text-headline-lg text-espresso-deep font-bold tracking-tight">
              Build Your Bespoke Charm
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">
              Pick your hand-sculpted clay muse, pair it with artisan clasp hardware, and string tiny sweets to create your signature bag companion.
            </p>
          </div>

          {/* Customizer Studio Grid: Controls & Live Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Interactive Controls (Left 7 Cols) */}
            <div className="lg:col-span-7 bg-surface-cloud rounded-3xl p-6 lg:p-8 shadow-sm space-y-8 border border-border-warm/40">
              {/* STEP 1: Select Charm Figurine */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-label-lg text-label-lg text-espresso-deep flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-strawberry-blush text-on-primary text-label-sm flex items-center justify-center font-bold">
                      1
                    </span>
                    Choose Core Clay Pal
                  </span>
                  <span className="font-label-sm text-label-sm text-strawberry-blush font-semibold">
                    {selectedChar.name} (+{selectedChar.priceFormatted})
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {CHAR_OPTIONS.map((char) => {
                    const isSelected = selectedChar.name === char.name;
                    return (
                      <button
                        key={char.name}
                        type="button"
                        onClick={() => setSelectedChar(char)}
                        className={`flex flex-col items-center p-3 rounded-2xl text-center transition-all ${
                          isSelected
                            ? "bg-surface-custard border-2 border-strawberry-blush shadow-xs"
                            : "bg-surface-cloud border border-border-warm/40 hover:bg-surface-custard"
                        }`}
                      >
                        <div className="w-14 h-14 rounded-full overflow-hidden mb-2 bg-surface-custard shadow-xs">
                          <img alt={char.name} className="w-full h-full object-cover" src={char.image} />
                        </div>
                        <span className="font-title-sm text-title-sm text-espresso-deep leading-snug font-semibold truncate w-full">
                          {char.name}
                        </span>
                        <span className="font-label-sm text-label-sm text-espresso-muted">{char.priceFormatted}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 2: Choose Hardware Clasp */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-label-lg text-label-lg text-espresso-deep flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-strawberry-blush text-on-primary text-label-sm flex items-center justify-center font-bold">
                      2
                    </span>
                    Choose Hardware Clasp
                  </span>
                  <span className="font-label-sm text-label-sm text-strawberry-blush font-semibold">
                    {selectedClasp.name} (+{selectedClasp.priceFormatted})
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {CLASP_OPTIONS.map((clasp) => {
                    const isSelected = selectedClasp.name === clasp.name;
                    return (
                      <button
                        key={clasp.name}
                        type="button"
                        onClick={() => setSelectedClasp(clasp)}
                        className={`p-3 rounded-2xl text-center flex flex-col items-center transition-all ${
                          isSelected
                            ? "bg-surface-custard border-2 border-strawberry-blush shadow-xs"
                            : "bg-surface-cloud border border-border-warm/40 hover:bg-surface-custard"
                        }`}
                      >
                        <Icon name={clasp.icon} className={`text-[26px] ${clasp.color} mb-1`} aria-hidden="true" />
                        <span className="font-title-sm text-title-sm text-espresso-deep font-semibold truncate w-full">
                          {clasp.name}
                        </span>
                        <span className="font-label-sm text-label-sm text-espresso-muted">{clasp.priceFormatted}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 3: Add Dangle Accents */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-label-lg text-label-lg text-espresso-deep flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-strawberry-blush text-on-primary text-label-sm flex items-center justify-center font-bold">
                      3
                    </span>
                    Select Tiny Dangles (Pick up to 2)
                  </span>
                  <span className="font-label-sm text-label-sm text-espresso-muted">Multi-select allowed</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {DANGLE_OPTIONS.map((dangle) => {
                    const isSelected = selectedDangles.some((d) => d.name === dangle.name);
                    return (
                      <button
                        key={dangle.name}
                        type="button"
                        onClick={() => toggleDangle(dangle)}
                        className={`p-3 rounded-2xl text-center flex flex-col items-center transition-all ${
                          isSelected
                            ? "bg-surface-custard border-2 border-strawberry-blush shadow-xs"
                            : "bg-surface-cloud border border-border-warm/40 hover:bg-surface-custard"
                        }`}
                      >
                        <span className="text-2xl mb-1">{dangle.emoji}</span>
                        <span className="font-title-sm text-title-sm text-espresso-deep font-semibold">
                          {dangle.name}
                        </span>
                        <span className="font-label-sm text-label-sm text-espresso-muted">
                          {dangle.priceFormatted}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Live Atelier Preview Card (Right 5 Cols Sticky) */}
            <div className="lg:col-span-5 bg-surface-cloud rounded-3xl p-6 lg:p-8 shadow-md sticky top-32 border border-border-warm/40">
              <div className="flex items-center justify-between border-b pb-4 mb-5 border-border-warm">
                <span className="font-title-sm text-title-sm text-espresso-deep font-bold">Studio Preview</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-matcha-tint text-secondary px-3 py-0.5 text-label-sm font-label-sm font-semibold">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" /> Made to Order
                </span>
              </div>

              {/* Dynamic Visual Canvas */}
              <div className="relative w-full aspect-square rounded-2xl bg-surface-custard p-4 flex flex-col items-center justify-center overflow-hidden mb-6 shadow-inner border border-border-warm/30">
                {/* Clasp Badge */}
                <div className="mb-2 px-3 py-1 bg-surface-cloud rounded-full shadow-xs text-label-sm font-label-sm text-espresso-deep flex items-center gap-1">
                  <Icon name={selectedClasp.icon} className={`text-[16px] ${selectedClasp.color}`} aria-hidden="true" />
                  <span>{selectedClasp.name}</span>
                </div>

                {/* Figurine Centerpiece */}
                <div className="w-40 h-40 sm:w-44 sm:h-44 rounded-2xl overflow-hidden shadow-lg bg-surface-cloud relative group">
                  <img
                    alt="Customized Charm Preview"
                    className="w-full h-full object-cover transition-all duration-300"
                    src={selectedChar.image}
                  />
                </div>

                {/* Dangles Ribbon */}
                <div className="mt-3 flex items-center gap-2">
                  {selectedDangles.length > 0 ? (
                    selectedDangles.map((d) => (
                      <span
                        key={d.name}
                        className="px-2.5 py-1 bg-surface-cloud/90 rounded-full text-label-sm font-label-sm text-espresso-deep shadow-xs"
                      >
                        {d.emoji} {d.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-espresso-muted italic">No dangles selected</span>
                  )}
                </div>
              </div>

              {/* Custom Recipe Bill */}
              <div className="space-y-2 mb-6 text-sm">
                <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
                  <span>{selectedChar.name} Clay Base</span>
                  <span>{selectedChar.priceFormatted}</span>
                </div>
                <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
                  <span>{selectedClasp.name}</span>
                  <span>{selectedClasp.priceFormatted}</span>
                </div>
                {selectedDangles.length > 0 && (
                  <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
                    <span>Dangles ({selectedDangles.map((d) => d.name).join(", ")})</span>
                    <span>Rs. {(danglesTotalPaisa / 100).toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-border-warm flex justify-between items-baseline">
                  <span className="font-title-md text-title-md text-espresso-deep font-bold">Estimated Total</span>
                  <span className="font-headline-sm text-headline-sm text-strawberry-blush font-bold">
                    Rs. {(atelierTotalPaisa / 100).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Add Custom Creation Button */}
              <button
                type="button"
                onClick={handleAddCustomToBag}
                className="w-full rounded-full bg-strawberry-blush text-on-primary py-4 font-label-lg text-label-lg font-bold shadow-md hover:opacity-95 transition-all transform hover:-translate-y-0.5 active:scale-98 flex items-center justify-center gap-2"
              >
                <Icon name="brush" className="text-[20px]" aria-hidden="true" />
                <span>Craft &amp; Add Custom to Bag</span>
              </button>
              <p className="text-center font-label-sm text-label-sm text-espresso-muted mt-3">
                Hand-glazed &amp; baked in 3-5 studio business days.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: THE SECRET RECIPE: CRAFTED TO LAST */}
      <section className="w-full py-20 bg-background" id="quality-recipe">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-peach-tint text-tertiary px-4 py-1 font-label-sm text-label-sm uppercase tracking-wider mb-3 font-bold">
              <span>🍰</span> Studio Durability Recipe
            </span>
            <h2 className="font-headline text-3xl md:text-headline-lg text-espresso-deep font-bold tracking-tight">
              Not Fragile: Built for Daily Adventures
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">
              We know charms live rough lives on backpacks, tote bags, and keys. Here is how we engineered our keepsakes to last through years of cuddles and pocket scratches.
            </p>
          </div>

          {/* 4 Pillars of Handmade Durability */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-surface-custard rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow border border-border-warm/30">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-strawberry-subtle text-primary flex items-center justify-center mb-5 shadow-xs">
                  <Icon name="local_fire_department" className="text-[28px]" aria-hidden="true" />
                </div>
                <h3 className="font-headline text-lg md:text-title-md text-espresso-deep font-bold mb-2">
                  100% Handcrafted
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  We slow-cure polymer clay at gentle calibrated temperatures, ensuring zero brittle bubbles and maximum flex-strength under drops.
                </p>
              </div>
              <div className="pt-4 flex items-center gap-1.5 text-strawberry-blush font-label-sm text-label-sm font-semibold">
                <Icon name="check_circle" className="text-[16px]" aria-hidden="true" /> Impact Tested
              </div>
            </div>

            <div className="bg-surface-custard rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow border border-border-warm/30">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-peach-tint text-tertiary flex items-center justify-center mb-5 shadow-xs">
                  <Icon name="diamond" className="text-[28px]" aria-hidden="true" />
                </div>
                <h3 className="font-headline text-lg md:text-title-md text-espresso-deep font-bold mb-2">
                  UV Diamond Glaze
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Every charm receives three micro-layers of crystal UV resin. The shell mimics kiln-fired porcelain gloss and shields painted acrylics.
                </p>
              </div>
              <div className="pt-4 flex items-center gap-1.5 text-tertiary font-label-sm text-label-sm font-semibold">
                <Icon name="check_circle" className="text-[16px]" aria-hidden="true" /> 100% Water Resistant
              </div>
            </div>

            <div className="bg-surface-custard rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow border border-border-warm/30">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-matcha-tint text-secondary flex items-center justify-center mb-5 shadow-xs">
                  <Icon name="link" className="text-[28px]" aria-hidden="true" />
                </div>
                <h3 className="font-headline text-lg md:text-title-md text-espresso-deep font-bold mb-2">
                  Personalized Atelier
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Screw eye pins are anchored deep into the raw clay core with industrial adhesive before firing, withstanding 20+ lbs of purse pull.
                </p>
              </div>
              <div className="pt-4 flex items-center gap-1.5 text-secondary font-label-sm text-label-sm font-semibold">
                <Icon name="check_circle" className="text-[16px]" aria-hidden="true" /> Snag-Proof Guarantee
              </div>
            </div>

            <div className="bg-surface-custard rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow border border-border-warm/30">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-strawberry-subtle text-primary flex items-center justify-center mb-5 shadow-xs">
                  <Icon name="redeem" className="text-[28px]" aria-hidden="true" />
                </div>
                <h3 className="font-headline text-lg md:text-title-md text-espresso-deep font-bold mb-2">
                  Sweet Bakery Unboxing
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Shipped inside tiny recyclable bakery boxes packed with pastel crinkle paper, wax seal stickers, and care instructions.
                </p>
              </div>
              <div className="pt-4 flex items-center gap-1.5 text-strawberry-blush font-label-sm text-label-sm font-semibold">
                <Icon name="check_circle" className="text-[16px]" aria-hidden="true" /> Ready to Gift
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: IN THE WILD / CHARM DIARIES */}
      <section className="w-full py-20 bg-surface-custard relative overflow-hidden" id="customer-gallery">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-strawberry-subtle text-primary px-4 py-1 font-label-sm text-label-sm uppercase tracking-wider mb-2 font-bold">
                <span>📷</span> Everyday Moments
              </span>
              <h2 className="font-headline text-3xl md:text-headline-lg text-espresso-deep font-bold tracking-tight">
                Charm Diaries • In the Wild
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                See where our handmade companions end up! Tag <span className="font-bold text-strawberry-blush">@LairaCharms</span> to be featured.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-strawberry-blush text-on-primary flex items-center justify-center font-bold text-label-sm border-2 border-surface-cloud shadow-xs">
                4.9
              </div>
              <span className="font-label-md text-label-md text-espresso-deep font-semibold">
                Over 1,400+ 5-Star Keepsake Bags
              </span>
            </div>
          </div>

          {/* Customer Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-cloud rounded-3xl p-5 shadow-sm space-y-4 border border-border-warm/40">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-surface-custard">
                <img
                  alt="Honey Bear Charm clipped to natural cotton canvas tote"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxTq8MIlWsTVOdWjmqhR3BpAej9PqZLlfhzXIpakycP2BoMR5RjSOBySxHE41agokCtRDlRJ16ULkQesRTFO-Wk_BNqgsw6UfzsJfTdTxjXp9Xl404QKdksjUVYtZi6JHLWtMgcHWUW3Z8IFwjBjEA7xw-bznUkh-KN9xgBcm0MbZHlVxI6ktQ0EP7kvlFDZtnZzN4u2xh-bFcbUmYMAHqD08PGYGbLAhO18YZwT1ve0NKX08x1mV_"
                />
              </div>
              <div>
                <div className="flex items-center gap-1 text-strawberry-blush text-[16px] mb-1">
                  <span>♥</span><span>♥</span><span>♥</span><span>♥</span><span>♥</span>
                </div>
                <p className="font-body-sm text-body-sm text-espresso-deep italic">
                  &ldquo;The honey bear charm has survived months on my tote through rain and university commutes without a single scratch! Cutest accessory I own.&rdquo;
                </p>
                <p className="font-label-sm text-label-sm text-espresso-muted mt-2">— Maya K. • Lahore</p>
              </div>
            </div>

            <div className="bg-surface-cloud rounded-3xl p-5 shadow-sm space-y-4 border border-border-warm/40">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-surface-custard">
                <img
                  alt="Upside down Spidey keychain on commuter backpack"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCFJBErDthdL3hVVV_JEZdWGc_oU1MbdwwMf7N05yOHobzRAdhFQzY2dHP2bBcMUH3TURWPZry_MqkgwllT4iqW18pIYzjPusDn1AI9dicV74sUAnz0K-IJqR09LW_jAzu-OHCjV5SCZVULgMXgD_HUQ2bpBaWg5pPIUjGmz7rRo6jTEO_0IWcaTXuYvM2i13mXIWwaCHWaAK8BDWFWNX3OMynRwB-ECro2oB8HDFP8ShOdfj6pmCp"
                />
              </div>
              <div>
                <div className="flex items-center gap-1 text-strawberry-blush text-[16px] mb-1">
                  <span>♥</span><span>♥</span><span>♥</span><span>♥</span><span>♥</span>
                </div>
                <p className="font-body-sm text-body-sm text-espresso-deep italic">
                  &ldquo;Spidey hanging upside down on my backpack gets compliments every day! The resin shine looks like smooth candy glass.&rdquo;
                </p>
                <p className="font-label-sm text-label-sm text-espresso-muted mt-2">— Julian R. • Karachi</p>
              </div>
            </div>

            <div className="bg-surface-cloud rounded-3xl p-5 shadow-sm space-y-4 border border-border-warm/40">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-surface-custard">
                <img
                  alt="Shadow Ender star keychain on game pouch"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMlAn47ftbMELAtDcCJTo2MUrH864bbZ5fVvKE0UrawWPsCvSJEqXlfNWxceX87dhIi46YcOzV3HQlql7v7SmsGy-FNiSy59WamVM2LWubBFN_tFolop8IoQjzUVp6tFpgpB0Bwse7Z_ViBLg7JWcv1FsWYABr022mQ8ZT89W_RNr8qU_hvdlbx5nnEip0s13_evWXtncTp2zDk3MOgdeHPA1Pi6gGMmIqN4pAQHmbKLK6j88UI292"
                />
              </div>
              <div>
                <div className="flex items-center gap-1 text-strawberry-blush text-[16px] mb-1">
                  <span>♥</span><span>♥</span><span>♥</span><span>♥</span><span>♥</span>
                </div>
                <p className="font-body-sm text-body-sm text-espresso-deep italic">
                  &ldquo;The gold star clasp on the shadow walker charm matches my bag cleanly. It arrived in the sweetest bakery box with stickers.&rdquo;
                </p>
                <p className="font-label-sm text-label-sm text-espresso-muted mt-2">— Chloe T. • Islamabad</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: FAQ & SWEET CARE INSTRUCTIONS */}
      <section className="w-full py-20 bg-background" id="faq">
        <div className="max-w-[880px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-strawberry-subtle text-primary px-4 py-1 font-label-sm text-label-sm uppercase tracking-wider mb-2 font-bold">
              <span>🌸</span> Helpful Answers
            </span>
            <h2 className="font-headline text-3xl md:text-headline-md text-espresso-deep font-bold">
              Frequently Wondered Questions
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">
              Everything you need to know about polymer clay care, custom commission slots, and shipping in Pakistan.
            </p>
          </div>

          {/* Accordion Pills */}
          <div className="space-y-4">
            <details className="group bg-surface-cloud rounded-2xl p-5 shadow-xs transition-all open:bg-surface-custard border border-border-warm/40">
              <summary className="flex items-center justify-between font-title-sm text-title-sm text-espresso-deep font-bold cursor-pointer list-none">
                <span>Are clay charms waterproof and scratch-resistant?</span>
                <Icon name="expand_more" className="text-[20px] text-strawberry-blush transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <div className="pt-3 font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Yes! While unfinished polymer clay can be porous, every Laira Charms piece is sealed with 3 glossy coats of jewelry-grade UV resin. They easily survive rain, sink splashes, and daily pocket rubbing.
              </div>
            </details>

            <details className="group bg-surface-cloud rounded-2xl p-5 shadow-xs transition-all open:bg-surface-custard border border-border-warm/40">
              <summary className="flex items-center justify-between font-title-sm text-title-sm text-espresso-deep font-bold cursor-pointer list-none">
                <span>Can I request a custom character or pet portrait?</span>
                <Icon name="expand_more" className="text-[20px] text-strawberry-blush transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <div className="pt-3 font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Absolutely! We open bespoke pet and anime commission slots monthly. You can submit reference photos through our Custom Atelier, and we will sculpt your favorite furry friend or gaming avatar with custom hardware.
              </div>
            </details>

            <details className="group bg-surface-cloud rounded-2xl p-5 shadow-xs transition-all open:bg-surface-custard border border-border-warm/40">
              <summary className="flex items-center justify-between font-title-sm text-title-sm text-espresso-deep font-bold cursor-pointer list-none">
                <span>How fast do charm orders ship across Pakistan?</span>
                <Icon name="expand_more" className="text-[20px] text-strawberry-blush transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <div className="pt-3 font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Ready-to-ship charms from our collection dispatch within 2 to 3 business days. Custom Atelier pieces require 7 to 14 business days for artisanal sculpting, baking, and UV curing before departing our sweet studio via PostEx and TCS.
              </div>
            </details>

            <details className="group bg-surface-cloud rounded-2xl p-5 shadow-xs transition-all open:bg-surface-custard border border-border-warm/40">
              <summary className="flex items-center justify-between font-title-sm text-title-sm text-espresso-deep font-bold cursor-pointer list-none">
                <span>What is your return &amp; transit replacement policy?</span>
                <Icon name="expand_more" className="text-[20px] text-strawberry-blush transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <div className="pt-3 font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Because each keepsake charm is bespoke and made to order, sales are final. However, under Punjab Consumer Protection Act 2005 §12, liability for transit damage is fully honored: if an item arrives damaged, simply email unboxing photos/video within 48 hours of courier delivery to lairacharmsofficial@gmail.com for a free replacement.
              </div>
            </details>
          </div>

          {/* Quick Contact Box */}
          <div className="mt-12 rounded-3xl bg-peach-tint p-6 text-center border border-border-warm/40">
            <h4 className="font-title-sm text-title-sm text-espresso-deep font-bold mb-1">
              Have a special question?
            </h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
              Our studio maker reads every message personally with a cup of warm tea.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-surface-cloud text-espresso-deep px-6 py-2.5 font-label-md text-label-md shadow-xs hover:bg-surface-custard transition-all border border-border-warm/40"
            >
              <Icon name="mail" className="text-[16px] text-strawberry-blush" aria-hidden="true" />
              <span>Message Studio Maker</span>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 7: RUNNING SHINOBI WANDERING MASCOT TRACK */}
      <section className="w-full relative overflow-hidden bg-surface-custard/70 border-t border-b border-border-warm py-4 select-none">
        <div className="absolute inset-0 bg-[radial-gradient(#dbc0c3_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 relative flex items-center justify-between pointer-events-none">
          <span className="font-label-sm text-label-sm text-espresso-muted/70 tracking-wider uppercase flex items-center gap-2 font-bold">
            <span>🍃</span> Studio Delivery Express Path
          </span>
          <span className="font-label-sm text-label-sm text-espresso-muted/60 hidden sm:inline">
            Hover on ninja to sprint! ✨
          </span>
        </div>

        {/* Character running along screen track */}
        <div className="relative w-full h-16 overflow-hidden pointer-events-auto">
          <div
            className="absolute top-1 left-0 flex items-center gap-2 cursor-pointer group shinobi-runner-track animate-shinobi-sprint"
          >
            {/* Ninja Figurine */}
            <div className="relative w-12 h-14 rounded-full bg-surface-cloud shadow-md border-2 border-orange-300 p-0.5 transform -rotate-12 group-hover:scale-125 transition-transform animate-shinobi-bob">
              <img
                alt="Running Chibi Shinobi"
                className="w-full h-full object-contain rounded-full pointer-events-none"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbU26_JaA85KI0I3T5PGMyOgIbFCxgkxMnGcWoUPTQPp5eycUh32CA3kaJUiODb6OEoWjvz3JP8xHj1BIeJObe5laytXPi7v6JXlwnjJfNcGBnwt4qiCovOk-fe6UAr9YHlfpMOzkBbR3uMR0nJWbNlVKQX8MtztKbJJ7W0RebV1dZhx1ijWXESG57xEXZsZJAe97e1RZzZYqieLbdWleuk1ZGSKUm6t-UyN6GgdnFsXNf-xcKRffW"
              />
            </div>
            {/* Anime Running Smoke / Star Puffs */}
            <div className="flex items-center -space-x-1 opacity-75">
              <span className="text-xs text-orange-400 animate-puff-dust">💨</span>
              <span className="text-[10px] text-amber-500 animate-puff-dust">✦</span>
              <span className="text-xs text-strawberry-blush animate-puff-dust">🍓</span>
            </div>
            {/* Dialogue speech bubble on hover */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-espresso-deep text-on-primary text-label-sm px-2.5 py-1 rounded-full shadow-lg -translate-y-6 -translate-x-4">
              Special Delivery Express! 📦💨
            </div>
          </div>
        </div>
      </section>

      {/* TOAST NOTIFICATION ON QUICK ACTIONS */}
      {toastMessage && (
        <div className="fixed bottom-24 right-6 z-50 transform transition-all duration-300">
          <div className="bg-espresso-deep text-on-primary rounded-2xl px-5 py-3.5 shadow-2xl flex items-center gap-3 border border-border-warm">
            <span className="w-8 h-8 rounded-full bg-strawberry-blush text-on-primary flex items-center justify-center text-sm font-bold">
              🍓
            </span>
            <div>
              <p className="font-title-sm text-title-sm text-on-primary font-bold">Added to Bag!</p>
              <p className="font-label-sm text-label-sm text-peach-cream">{toastMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
