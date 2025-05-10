"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function PdfExportButton() {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const exportToPdf = async () => {
    try {
      setIsExporting(true)

      // Dynamically import html2pdf to reduce bundle size
      const html2pdf = (await import("html2pdf.js")).default

      // Get the calendar element - adjust the selector based on your actual calendar container
      const calendarElement = document.querySelector("#calendar-container")

      if (!calendarElement) {
        throw new Error("Calendar element not found")
      }

      const opt = {
        margin: 10,
        filename: `sassowitz-calendar-${new Date().toISOString().split("T")[0]}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
      }

      // Generate and download the PDF
      await html2pdf().from(calendarElement).set(opt).save()

      toast({
        title: "PDF exported successfully",
        description: "Your calendar has been exported as a PDF",
      })
    } catch (error) {
      console.error("PDF export failed:", error)
      toast({
        title: "PDF export failed",
        description: "There was an error exporting your calendar",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button onClick={exportToPdf} disabled={isExporting} variant="outline" className="flex items-center gap-2">
      <Download className="h-4 w-4" />
      {isExporting ? "Exporting..." : "Export as PDF"}
    </Button>
  )
}