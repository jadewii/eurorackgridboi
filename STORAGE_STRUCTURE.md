# EUROGRID Storage Structure

## Recommended Supabase Bucket Organization

Instead of creating multiple root-level buckets that could conflict with other projects, we should use ONE main bucket called `eurogrid` with organized folders:

```
eurogrid/ (Public bucket)
├── modules/
│   ├── art/        (PNG module images: 01.png - 36.png)
│   └── live/       (GIF animated modules: 01.gif - 17.gif)
├── icons/
│   └── jacknut.png (Currency icon)
├── plants/         (If needed for plant shop)
└── stickers/       (If needed for sticker shop)
```

## Current File References Updated:
- `collection.html`: Updated to use `/storage/v1/object/public/eurogrid/modules/art/` and `/eurogrid/modules/live/`
- `my-racks.html`: Updated to use `/eurogrid/modules/live/` and `/eurogrid/icons/`
- `rack-shop.html`: Updated to use `/eurogrid/icons/jacknut.png`

## Migration Steps:
1. Create a single `eurogrid` bucket in Supabase
2. Make it public
3. Create the folder structure inside:
   - `modules/art/` - Upload 01.png through 36.png here
   - `modules/live/` - Upload 01.gif through 17.gif here  
   - `icons/` - Upload jacknut.png here
4. Delete the old separate buckets (eurorackgif, eurorackart, icons) if no longer needed

## Benefits:
- Clean separation between projects
- All EUROGRID assets in one place
- Easy to backup/migrate entire project
- No naming conflicts with other projects
- Clear folder organization