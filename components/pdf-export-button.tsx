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
      tempContainer.appendChild(calendarClone)
      document.body.appendChild(tempContainer)

      // Apply extensive optimizations to the clone
      optimizeForPdf(calendarClone)

      // Configure PDF options for optimal calendar fit
      const opt = {
        margin: 0, // No margins for maximum space
        filename: `sassowitz-calendar-${new Date().toISOString().split("T")[0]}.pdf`,
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: {
          scale: 1.2, // Lower scale for better fit
          useCORS: true,
          logging: false,
          letterRendering: true,
          allowTaint: true,
          foreignObjectRendering: true,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "landscape" as "landscape" | "portrait",
          compress: true,
          putOnlyUsedFonts: true,
          precision: 16,
        },
        pagebreak: { mode: "avoid-all" },
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

  // Function to extensively optimize the calendar for PDF output
  const optimizeForPdf = (element: HTMLElement) => {
    // Add a class for print-specific CSS
    element.classList.add("pdf-export")

    // Remove interactive elements that aren't needed in PDF
    const interactiveElements = element.querySelectorAll(
      "button, input, select, a[role='button'], [aria-label='Add Event']",
    )
    interactiveElements.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.remove()
      }
    })

    // Find the month title and make it more prominent
    const monthTitle = element.querySelector("h1, h2, h3, .month-title")
    if (monthTitle instanceof HTMLElement) {
      monthTitle.style.fontSize = "24px"
      monthTitle.style.fontWeight = "bold"
      monthTitle.style.marginBottom = "10px"
      monthTitle.style.textAlign = "center"
    }

    // Optimize the calendar grid
    const calendarGrid = element.querySelector("table, .calendar-grid")
    if (calendarGrid instanceof HTMLElement) {
      calendarGrid.style.width = "100%"
      calendarGrid.style.tableLayout = "fixed"
      calendarGrid.style.borderCollapse = "collapse"
    }

    // Optimize calendar cells
    const cells = element.querySelectorAll("td, th, .calendar-cell, .calendar-day")
    cells.forEach((cell) => {
      if (cell instanceof HTMLElement) {
        cell.style.padding = "2px"
        cell.style.fontSize = "12px"
        cell.style.border = "1px solid #ddd"
        cell.style.textAlign = "center"
        cell.style.height = "auto"

        // If this is a day cell with a number
        if (cell.textContent && /^\d+$/.test(cell.textContent.trim())) {
          cell.style.fontWeight = "bold"
        }
      }
    })

    // Optimize event elements
    const events = element.querySelectorAll(".event, [class*='event']")
    events.forEach((event) => {
      if (event instanceof HTMLElement) {
        event.style.padding = "1px 2px"
        event.style.margin = "1px 0"
        event.style.fontSize = "10px"
        event.style.overflow = "hidden"
        event.style.textOverflow = "ellipsis"
        event.style.whiteSpace = "nowrap"
        event.style.borderRadius = "2px"
      }
    })

    // Set overall container styles
    element.style.fontFamily = "Arial, sans-serif"
    element.style.width = "100%"
    element.style.maxWidth = "100%"
    element.style.margin = "0"
    element.style.padding = "0"
    element.style.pageBreakInside = "avoid"
    element.style.breakInside = "avoid"

    // Remove any navigation elements
    const navElements = element.querySelectorAll(".navigation, .nav-buttons, [class*='navigation'], [class*='nav-']")
    navElements.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.remove()
      }
    })

    // Add a title at the top if none exists
    if (!monthTitle) {
      const title = document.createElement("h1")
      title.textContent = "Calendar"
      title.style.fontSize = "24px"
      title.style.fontWeight = "bold"
      title.style.textAlign = "center"
      title.style.marginBottom = "10px"

      if (element.firstChild) {
        element.insertBefore(title, element.firstChild)
      } else {
        element.appendChild(title)
      }
    }
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
