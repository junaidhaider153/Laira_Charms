import type { OptionGroup } from "./types";

export const FIXTURE_OPTION_GROUPS: Record<string, OptionGroup[]> = {
  // Option groups for prod-004: Custom Pastel Nameplate Keychain (Rs. 1,800 base)
  "prod-004": [
    {
      id: "grp-004-color",
      productId: "prod-004",
      name: "Clay Palette Shade",
      type: "single_choice",
      isRequired: true,
      sortOrder: 1,
      values: [
        {
          id: "val-color-pink",
          groupId: "grp-004-color",
          label: "Strawberry Milk Pink",
          priceDeltaMinor: 0,
          isAvailable: true,
          sortOrder: 1,
          colorHex: "#FFD1DC",
        },
        {
          id: "val-color-mint",
          groupId: "grp-004-color",
          label: "Matcha Mint",
          priceDeltaMinor: 0,
          isAvailable: true,
          sortOrder: 2,
          colorHex: "#D4EDDA",
        },
        {
          id: "val-color-custard",
          groupId: "grp-004-color",
          label: "Buttercup Custard",
          priceDeltaMinor: 0,
          isAvailable: true,
          sortOrder: 3,
          colorHex: "#FFF3CD",
        },
        {
          id: "val-color-lavender",
          groupId: "grp-004-color",
          label: "Lilac Mist",
          priceDeltaMinor: 0,
          isAvailable: true,
          sortOrder: 4,
          colorHex: "#E2D9F3",
        },
      ],
    },
    {
      id: "grp-004-name",
      productId: "prod-004",
      name: "Custom Stamped Name",
      type: "text",
      isRequired: true,
      sortOrder: 2,
      values: [],
      textConfig: {
        maxLength: 10,
        placeholder: "e.g. LAIRA",
        helperText: "Up to 10 letters stamped in uppercase whimsical font. Alphanumeric only.",
        allowedPattern: "^[a-zA-Z0-9 ]+$",
      },
    },
    {
      id: "grp-004-clasp",
      productId: "prod-004",
      name: "Hardware Finish",
      type: "single_choice",
      isRequired: true,
      sortOrder: 3,
      values: [
        {
          id: "val-clasp-star",
          groupId: "grp-004-clasp",
          label: "Gold Star Swivel Clasp",
          priceDeltaMinor: 0,
          isAvailable: true,
          sortOrder: 1,
        },
        {
          id: "val-clasp-silver-heart",
          groupId: "grp-004-clasp",
          label: "Silver Heart Keychain Ring",
          priceDeltaMinor: 5000, // +Rs. 50
          isAvailable: true,
          sortOrder: 2,
        },
        {
          id: "val-clasp-rose-lobster",
          groupId: "grp-004-clasp",
          label: "Rose Gold Lobster Hook",
          priceDeltaMinor: 10000, // +Rs. 100
          isAvailable: true,
          sortOrder: 3,
        },
      ],
    },
    {
      id: "grp-004-addon",
      productId: "prod-004",
      name: "Accent Charm Trinket",
      type: "single_choice",
      isRequired: false,
      sortOrder: 4,
      values: [
        {
          id: "val-addon-none",
          groupId: "grp-004-addon",
          label: "No Additional Trinket",
          priceDeltaMinor: 0,
          isAvailable: true,
          sortOrder: 1,
        },
        {
          id: "val-addon-daisy",
          groupId: "grp-004-addon",
          label: "Mini Clay Daisy Bell",
          priceDeltaMinor: 15000, // +Rs. 150
          isAvailable: true,
          sortOrder: 2,
        },
        {
          id: "val-addon-sparkle",
          groupId: "grp-004-addon",
          label: "Sparkle Resin Heart Charm",
          priceDeltaMinor: 20000, // +Rs. 200
          isAvailable: true,
          sortOrder: 3,
        },
      ],
    },
  ],

  // Option groups for prod-005: Initial Letter Phone Strap Charm (Rs. 1,350 base)
  "prod-005": [
    {
      id: "grp-005-letter",
      productId: "prod-005",
      name: "Sculpted Initial Letter",
      type: "text",
      isRequired: true,
      sortOrder: 1,
      values: [],
      textConfig: {
        maxLength: 1,
        placeholder: "e.g. A",
        helperText: "Single alphabet letter (A-Z) sculpted in candy clay finish.",
        allowedPattern: "^[a-zA-Z]$",
      },
    },
    {
      id: "grp-005-cord",
      productId: "prod-005",
      name: "Phone Wrist Cord Color",
      type: "single_choice",
      isRequired: true,
      sortOrder: 2,
      values: [
        {
          id: "val-cord-cream",
          groupId: "grp-005-cord",
          label: "Soft Cream Silk Cord",
          priceDeltaMinor: 0,
          isAvailable: true,
          sortOrder: 1,
          colorHex: "#FDFBF7",
        },
        {
          id: "val-cord-pink",
          groupId: "grp-005-cord",
          label: "Baby Pink Braided Cord",
          priceDeltaMinor: 0,
          isAvailable: true,
          sortOrder: 2,
          colorHex: "#FFCCD5",
        },
        {
          id: "val-cord-sage",
          groupId: "grp-005-cord",
          label: "Pastel Sage Green Cord",
          priceDeltaMinor: 0,
          isAvailable: true,
          sortOrder: 3,
          colorHex: "#CCE3DE",
        },
      ],
    },
    {
      id: "grp-005-beads",
      productId: "prod-005",
      name: "Beaded Accent Accent",
      type: "single_choice",
      isRequired: false,
      sortOrder: 3,
      values: [
        {
          id: "val-bead-standard",
          groupId: "grp-005-beads",
          label: "Standard Pastel Beads",
          priceDeltaMinor: 0,
          isAvailable: true,
          sortOrder: 1,
        },
        {
          id: "val-bead-pearls",
          groupId: "grp-005-beads",
          label: "Lustrous Faux Pearls Accent",
          priceDeltaMinor: 10000, // +Rs. 100
          isAvailable: true,
          sortOrder: 2,
        },
        {
          id: "val-bead-crystal",
          groupId: "grp-005-beads",
          label: "Faceted Aurora Crystals",
          priceDeltaMinor: 15000, // +Rs. 150
          isAvailable: true,
          sortOrder: 3,
        },
      ],
    },
  ],
};

