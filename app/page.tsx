import { Header } from "@/components/header"
import { ClientCalendarWrapper } from "@/components/client-calendar-wrapper"
import { PdfExportButton } from "@/components/pdf-export-button"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <ClientCalendarWrapper />
      </div>
    </main>
  )
}
