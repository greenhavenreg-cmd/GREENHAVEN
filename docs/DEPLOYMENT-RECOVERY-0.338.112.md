# GH-CONNECT 0.338.112 recovery package

This package is based on the authoritative 0.338.112 archive and carries forward the Pi authentication surgical changes.

## Critical recovery note
The Vercel deployment for commit 3bca793 failed because the commit deleted the entire tracked `lib/` directory (including `lib/app-release.ts`), not because `lib/app-release.ts` is defective. This package restores the complete `lib/` tree from the authoritative source. Do not remove or omit `lib/` when copying these files into the existing Git working tree.

## Apply safely
1. Back up the current local repository.
2. Extract this archive.
3. Copy the CONTENTS of the extracted project folder into the root of the existing local Git repository, allowing files to be restored/overwritten.
4. Preserve the existing `.git/` directory. Do not nest the project folder inside the repository.
5. In GitHub Desktop, confirm that deleted `lib/` files now appear as restored/modified rather than remaining deleted.
6. Run `npm ci --legacy-peer-deps`, then `npm run prebuild` using Node 24.15+ (the deployment log used Node 24.22.3).
7. Only commit and push to `testnet` after checks pass.

This package does not deploy, change Vercel settings, modify Supabase, or touch Production/Mainnet credentials.
