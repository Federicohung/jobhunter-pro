export const metadata = {
  title: 'JobHunter Pro — Panel',
  description: 'Panel de seguimiento de búsqueda de empleo',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
