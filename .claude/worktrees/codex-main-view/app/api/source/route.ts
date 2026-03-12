import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"

// Allowed directories for security — only serve source files from these paths
const ALLOWED_PREFIXES = [
  "components/tp-ui/",
  "lib/",
  "app/globals.css",
]

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path")

  if (!path) {
    return NextResponse.json({ error: "Missing path parameter" }, { status: 400 })
  }

  // Security: prevent directory traversal
  if (path.includes("..") || path.startsWith("/")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 403 })
  }

  // Security: only serve from allowed directories
  const isAllowed = ALLOWED_PREFIXES.some((prefix) => path.startsWith(prefix))
  if (!isAllowed) {
    return NextResponse.json({ error: "Path not allowed" }, { status: 403 })
  }

  try {
    const fullPath = join(process.cwd(), path)
    const content = await readFile(fullPath, "utf-8")
    return new NextResponse(content, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }
}
