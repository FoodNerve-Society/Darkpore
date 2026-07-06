# Implementation Plan: 1:1 Replication of `StorePublicView` Hero

## Goal
To completely replicate the visual design, animations, and structure of the `StorePublicView` snippet for the FoodNerve landing page Hero section, instead of adapting it.

## The Challenge
The code you provided relies on several imported components that do not exist in the FoodNerve repository (e.g., `<CategoryTabMenu>`, `<SearchBar>`, `<ProductSlideshow>`, `<ProductListGrid>`). Because I do not have the source code for those specific files, I must perfectly recreate their visual intent based on the structural context you provided.

## Proposed Changes: `TabbedHero.tsx`

I will rewrite `TabbedHero.tsx` to exactly match the architecture of `StorePublicView`:

### 1. The "Elite Mesh Background"
I will implement the exact `framer-motion` background you provided:
- The `hexToRgb` and `mixWithWhite` tinting logic (using a base theme color, e.g., an earthy green for FoodNerve).
- The three floating, blurring blobs (`filter: 'blur(100px)'`) animating infinitely across the screen.
- The subtle dotted radial gradient overlay.

### 2. The Hero Typography
I will apply the exact styles from your file:
- **Headline:** `background: linear-gradient(to bottom, ${themeColor} 20%, #0f172a 100%)` with `WebkitBackgroundClip: 'text'`.
- **Subheadline:** `color: 'rgba(15, 23, 42, 0.6)'` inside a delayed `motion.div` fade-in.

### 3. Recreating the Missing Components In-Line
Since I don't have your specific sub-components, I will build high-fidelity replicas directly into `TabbedHero`:
- **Sticky Search Bar:** A simple outlined text input mirroring a standard search bar, anchored with `position: 'sticky'`.
- **Category Tab Menu:** A scrollable row of tabs. I will ensure the active tab has the exact active/inactive states that a premium e-commerce tab menu uses.
- **Product Stage (`AnimatePresence`):** The exact directional sliding variants you provided (`x: dir > 0 ? 30 : -30`). 
- **Article Display:** Instead of `<ProductListGrid>`, I will use the horizontal scrolling article cards we built earlier, but style them to look like premium product cards to match the storefront vibe.

## User Review Required
> [!IMPORTANT]
> Because I do not have the actual code for `<CategoryTabMenu>`, `<ProductSlideshow>`, or `<SearchBar>`, I have to rebuild them from scratch to match the *vibe* of the file you sent. 
> 
> **Are you okay with me rebuilding these missing pieces to match the aesthetic, or would you prefer to paste the exact code for those components here so I can use them directly?**

Click **Proceed** if you want me to rebuild them, or reply with the component code if you have it!
