# CMS & Image Instructions

## How to Update Images for People/Profiles

To use real pictures for the personnel directory (e.g., Raphael, Adefolami), follow these steps:

1. **Add Images:** Drag and drop your image files into the `public/images/` directory in the project folder. For example, save them as `adefolami.jpg`, `raphael.jpg`, or `cover.png`.
2. **Update CMS Data:** Open our local database file at `lib/cms/food/index.ts` (or the relevant tenant's file).
3. **Link the Images:** Locate the user profile you want to change. Update the `imageUrl` and `coverUrl` fields to point to your new file using a root-relative path (starting with `/`).

**Example:**
```typescript
{
  name: 'Dr. Adefolami Agunbiade',
  imageUrl: '/images/adefolami.jpg',
  coverUrl: '/images/adefolami-cover.jpg',
  // ...
}
```

*Note: You do not need to include `public/` in the URL path. Next.js natively resolves `/images/...` to the `public/images/` folder automatically. You also do not need to configure Next Image domains for local images.*
