import { NextResponse } from 'next/server'

const GITHUB_RAW = 'https://raw.githubusercontent.com/Federicohung/jobhunter-pro/master/data/panel.json'

export async function GET() {
  try {
    const res = await fetch(GITHUB_RAW + '?t=' + Date.now(), { cache: 'no-store' })
    if (!res.ok) return NextResponse.json({ error: 'fetch_failed' }, { status: 502 })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
