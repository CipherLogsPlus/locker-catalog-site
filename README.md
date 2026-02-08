# Locker Catalog Site

Simple static website for a storage-locker resale business.

## Version 1 Scope
- Home page (`index.html`)
- Catalog page (`catalog.html`)
- Catalog admin helper (`admin.html`)

## Add New Catalog Items
Open:
- Local: `http://localhost:8080/admin.html`
- Live: `https://cipherlogsplus.github.io/locker-catalog-site/admin.html`

Fast workflow (no local git commands):
1. Add items in `admin.html` and choose an image file (optional).
2. In `Publish Live`, enter your GitHub token and click `Publish Live to Website`.
3. Wait about 30-90 seconds for GitHub Pages to rebuild.

Image behavior:
- If you choose a file, `Publish Live` uploads it to `assets/items/` automatically.
- If you skip file upload, you can still use `Image URL/Path` manually.

Token requirements:
- Fine-grained PAT
- Repository access: `CipherLogsPlus/locker-catalog-site`
- Permission: `Contents` = `Read and Write`

Fallback workflow (manual git):
1. Click `Download items.json`.
2. Replace the file at `data/items.json` with the downloaded file.
3. Add photos to `assets/items/` and set `image` paths like `assets/items/tv.jpg`.
4. Run:
   - `git add .`
   - `git commit -m "Update catalog"`
   - `git push`

`catalog.html` reads data from `data/items.json`.

Each JSON item supports:
- `title` (required)
- `price` (required)
- `category`
- `condition`
- `status`
- `note`
- `mediaLabel` (used when no image)
- `image` (optional relative path)

## Deploy to GitHub Pages
1. Create a new GitHub repository.
2. Upload all files from this folder.
3. In GitHub: `Settings` -> `Pages`.
4. Set source to `Deploy from a branch`.
5. Select `main` branch and `/ (root)` folder.
6. Save and wait for the Pages URL to go live.

## Next Steps Later
- Add real item photos.
- Add simple contact options.
- Add sold items archive.
