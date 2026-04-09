

# Add Media (Images + Video) to Every Block + Non-Techy Guidance

## Problem
Currently, only dedicated `image` and `video` block types support media. A non-technical admin cannot attach images or videos to a text block, list block, timeline entry, etc. There's also no guidance on recommended file types/sizes, no image preview before saving, and no carousel support for multiple images.

## Solution
Add an optional **media attachment panel** to every block editor. This panel lets the admin:
1. Upload one or more images (with carousel rendering if multiple)
2. Add a YouTube video URL
3. See friendly guidance on file types and sizes (e.g. "JPG or PNG, under 5MB, 1920×1080 recommended for hero")
4. Preview uploaded images and video inline before saving

On the public site, each block renders its attached media (single image, carousel, or embedded video) responsively.

## Architecture

### Content Schema Addition
Every block's `content` JSONB gains optional fields:
```json
{
  "media": {
    "images": [
      { "url": "...", "alt": "...", "caption": "" }
    ],
    "video_url": "",
    "layout": "single"  // "single" | "carousel" | "grid"
  },
  // ...existing fields
}
```
No database migration needed — it's just new keys in the existing JSONB column.

### New Shared Component: `BlockMediaEditor.tsx`
A reusable panel embedded into every block editor modal. Features:
- **Upload button** with drag-drop zone
- **Media Library picker** (reuse existing media library)
- **File guidance banner** per block type:
  - Hero: "Recommended: 1920×1080, JPG/PNG/WebP, under 5MB. This is your main banner image."
  - Text/List/Columns: "Recommended: 1200×800, JPG/PNG/WebP, under 3MB."
  - Timeline: "Recommended: 800×600, JPG/PNG/WebP, under 2MB."
- **Image preview thumbnails** with delete/reorder
- **YouTube URL input** with live embed preview
- **Layout selector** (single / carousel / grid) when multiple images

### New Shared Component: `BlockMediaDisplay.tsx`
A reusable renderer for the public site. Features:
- Single image: responsive `img` with `object-cover`
- Carousel: horizontal scroll with dots indicator, swipe on mobile
- Grid: 2-column grid for 2-4 images
- Video: YouTube embed with 16:9 aspect ratio
- Fully responsive across mobile/tablet/desktop

### Files to Create
1. `src/components/admin/BlockMediaEditor.tsx` — shared media editor panel
2. `src/components/BlockMediaDisplay.tsx` — shared public media renderer

### Files to Edit
1. **Every block editor** — add `<BlockMediaEditor>` panel at the bottom:
   - `TextBlockEditor.tsx`
   - `ListBlockEditor.tsx`
   - `TableBlockEditor.tsx`
   - `NumbersBlockEditor.tsx`
   - `StatsBlockEditor.tsx`
   - `TimelineBlockEditor.tsx`
   - `FAQBlockEditor.tsx`
   - `ColumnsBlockEditor.tsx`
   - `ImageBlockEditor.tsx` (migrate to use shared component)
   - `VideoBlockEditor.tsx` (migrate to use shared component)

2. **`BlockRenderer.tsx`** — add `<BlockMediaDisplay>` after each block's content output, reading from `content.media`

3. **`AddBlockModal.tsx`** — update default content to include empty `media: { images: [], video_url: "", layout: "single" }` for every block type

### Media Guidance Map (built into BlockMediaEditor)
```
hero:     "Main banner — 1920×1080px, JPG/PNG/WebP, max 5MB"
text:     "Section image — 1200×800px, JPG/PNG/WebP, max 3MB"
list:     "Section image — 1200×800px, JPG/PNG/WebP, max 3MB"
table:    "Supporting image — 1200×800px, JPG/PNG/WebP, max 3MB"
timeline: "Milestone photo — 800×600px, JPG/PNG/WebP, max 2MB"
faq:      "Header image — 1200×600px, JPG/PNG/WebP, max 3MB"
columns:  "Column image — 1200×800px, JPG/PNG/WebP, max 3MB"
stats:    "Background image — 1200×600px, JPG/PNG/WebP, max 3MB"
numbers:  "Background image — 1200×600px, JPG/PNG/WebP, max 3MB"
```

### Carousel Implementation
- CSS scroll-snap based (no external library needed)
- Dot indicators below
- Touch swipe on mobile, arrow buttons on desktop
- Auto-advances every 5 seconds (optional, toggleable in admin)

### Preview in Admin
- Uploaded images show as thumbnails with delete buttons
- YouTube URL shows live embed preview
- Layout selector shows visual icons for single/carousel/grid

## What Stays the Same
- Existing image/video block types still work
- All existing content unaffected (no `media` key = no media shown)
- Passkey auth, form submission, calculator all unchanged

## Result
Every block can have images and/or a video. Non-technical admins see clear guidance on what to upload, preview everything before saving, and the output looks great on all devices.

