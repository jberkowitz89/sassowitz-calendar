"use client"

import { useState, useEffect } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function PdfExportButton() {
  const [isExporting, setIsExporting] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const { toast } = useToast()

  // This ensures the component only renders on the client
  useEffect(() => {
    setIsClient(true)
    console.log("PDF Export Button mounted")
  }, [])

  const exportToPdf = async () => {
    try {
      console.log("Export to PDF clicked")
      setIsExporting(true)

      // Dynamically import html2pdf to reduce bundle size
      const html2pdf = (await import("html2pdf.js")).default

      // Get the calendar element - adjust the selector based on your actual calendar container
      const calendarElement = document.querySelector("#calendar-container") as HTMLElement

      if (!calendarElement) {
        throw new Error("Calendar element not found")
      }

      console.log("Calendar element found:", calendarElement)

      // Create a clone of the calendar to apply print-specific styles
      const calendarClone = calendarElement.cloneNode(true) as HTMLElement

      // Create a temporary container for our optimized calendar
      const tempContainer = document.createElement("div")
      tempContainer.style.position = "absolute"
      tempContainer.style.left = "-9999px"
      tempContainer.style.top = "-9999px"
      document.body.appendChild(tempContainer)

      // Apply minimal styling to make it fit on one page
      simplifyForPdf(calendarClone)

      // Configure PDF options for optimal calendar fit
      const opt = {
        margin: 10,
        filename: `sassowitz-calendar-${new Date().toISOString().split("T")[0]}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 1,
          useCORS: true,
          logging: false,
          letterRendering: true,
          allowTaint: true,
          windowWidth: 1200,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "landscape" as "landscape" | "portrait",
          compress: true,
        },
      }

      // Generate and download the PDF
      await html2pdf().from(calendarClone).set(opt).save()

      // Clean up the temporary container
      document.body.removeChild(tempContainer)

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

  // Function to simplify the calendar for PDF export
  const simplifyForPdf = (element: HTMLElement) => {
    // Add a class for print-specific CSS
    element.classList.add("pdf-export")

    // Remove buttons and interactive elements
    const buttons = element.querySelectorAll("button, [role='button']")
    buttons.forEach((btn) => btn.remove())

    // Remove "Add Event" text and related elements
    const addEventElements = Array.from(element.querySelectorAll("*")).filter(
      (el) =>
        el.textContent?.includes("Add Event") ||
        el.textContent?.includes("Click") ||
        el.textContent?.includes("create one") ||
        el.textContent?.includes("No events for this month yet"),
    )
    addEventElements.forEach((el) => el.remove())

    // Apply basic styling to ensure it fits on one page
    element.style.width = "1100px"
    element.style.maxWidth = "1100px"
    element.style.fontSize = "12px"
    element.style.margin = "0"
    element.style.padding = "10px"
    element.style.boxSizing = "border-box"
    element.style.pageBreakInside = "avoid"
    element.style.breakInside = "avoid"

    // Find all tables and ensure they fit
    const tables = element.querySelectorAll("table")
    tables.forEach((table) => {
      if (table instanceof HTMLElement) {
        table.style.width = "100%"
        table.style.tableLayout = "fixed"
        table.style.borderCollapse = "collapse"
      }
    })

    // Find all cells and reduce padding
    const cells = element.querySelectorAll("td, th")
    cells.forEach((cell) => {
      if (cell instanceof HTMLElement) {
        cell.style.padding = "4px"
        cell.style.fontSize = "12px"
      }
    })

    // Log the simplified element for debugging
    console.log("Simplified calendar for PDF:", element)
  }

  // Don't render anything on the server
  if (!isClient) {
    return null
  }

  return (
    <Button
      onClick={exportToPdf}
      disabled={isExporting}
      variant="default"
      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2"
    >
      <Download className="h-4 w-4" />
      {isExporting ? "Exporting..." : "Export as PDF"}
    </Button>
  )
}
