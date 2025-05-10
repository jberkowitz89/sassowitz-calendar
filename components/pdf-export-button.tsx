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

      // Apply print-specific styles to the clone
      applyPrintStyles(calendarClone)

      // Configure PDF options for optimal calendar fit
      const opt = {
        margin: 5, // Use a single number for all margins (in mm)
        filename: `sassowitz-calendar-${new Date().toISOString().split("T")[0]}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 1.5, // Adjust scale for better quality while maintaining fit
          useCORS: true,
          logging: false,
          letterRendering: true,
          // Set a specific width that works well for most calendars
          width: 1240,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "landscape" as "landscape" | "portrait",
          compress: true,
          // Avoid page breaks inside the calendar
          putOnlyUsedFonts: true,
        },
        pagebreak: { mode: "avoid-all" },
      }

      // Generate and download the PDF
      await html2pdf().from(calendarClone).set(opt).save()

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

  // Function to apply print-specific styles to the calendar clone
  const applyPrintStyles = (element: HTMLElement) => {
    // Add a class to the clone for print-specific CSS
    element.classList.add("pdf-export")

    // Find all elements that might cause overflow and adjust them
    const cells = element.querySelectorAll(".calendar-cell, td, th")
    cells.forEach((cell) => {
      if (cell instanceof HTMLElement) {
        cell.style.padding = "4px"
        cell.style.fontSize = "12px"
      }
    })

    // Remove any unnecessary elements that take up space
    const nonEssentialElements = element.querySelectorAll(".non-essential, .hidden-in-print")
    nonEssentialElements.forEach((el) => el.remove())

    // Set a fixed width for the calendar to ensure proper scaling
    element.style.width = "1240px"
    element.style.maxWidth = "100%"
    element.style.margin = "0"
    element.style.padding = "0"

    // Ensure text doesn't overflow
    const textElements = element.querySelectorAll("p, span, div, h1, h2, h3, h4, h5, h6")
    textElements.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.style.overflow = "hidden"
        el.style.textOverflow = "ellipsis"
        el.style.whiteSpace = "nowrap"
      }
    })

    // Remove buttons and interactive elements
    const buttons = element.querySelectorAll('button, [role="button"]')
    buttons.forEach((btn) => {
      if (btn instanceof HTMLElement) {
        btn.remove()
      }
    })

    // Remove "Add Event" text and related elements
    const addEventElements = Array.from(element.querySelectorAll("*")).filter(
      (el) =>
        el.textContent?.includes("Add Event") ||
        el.textContent?.includes("Click") ||
        el.textContent?.includes("create one") ||
        el.textContent?.includes("No events for this month yet"),
    )
    addEventElements.forEach((el) => el.remove())
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
