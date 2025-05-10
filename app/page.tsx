import { Header } from "@/components/header"
import { ClientCalendarWrapper } from "@/components/client-calendar-wrapper"
import { PdfExportButton } from "@/components/pdf-export-button"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Add the export button above the calendar */}
        <div className="flex justify-end mb-4">
          <PdfExportButton />
        </div>

        {/* Make sure the calendar wrapper has the id that the PDF export function looks for */}
        <div id="calendar-container">
          <ClientCalendarWrapper />
        </div>
      </div>
    </main>
  )
}