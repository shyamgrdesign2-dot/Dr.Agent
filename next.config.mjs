import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Pin Turbopack's workspace root to this project. Without this Next.js picks
  // a parent directory (e.g. ~/Users/shyamsundar) that contains a stray
  // package-lock.json, which causes module resolution (tailwindcss, etc.) to
  // fail from the wrong node_modules tree.
  turbopack: {
    root: __dirname,
  },
}

export default nextConfig
