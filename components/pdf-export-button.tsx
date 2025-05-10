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

      // Create a clean container for the PDF content
      const pdfContainer = document.createElement("div")
      pdfContainer.style.width = "1100px"
      pdfContainer.style.backgroundColor = "white"
      pdfContainer.style.padding = "20px"
      pdfContainer.style.fontFamily = "Arial, sans-serif"
      tempContainer.appendChild(pdfContainer)

      // Add a title
      const title = document.createElement("h1")
      title.textContent = "Calendar - May 2025"
      title.style.textAlign = "center"
      title.style.fontSize = "24px"
      title.style.marginBottom = "15px"
      title.style.fontWeight = "bold"
      title.style.color = "#333"
      pdfContainer.appendChild(title)

      // Extract and clean up the calendar grid
      const calendarGrid = extractCalendarGrid(calendarClone)
      if (calendarGrid) {
        pdfContainer.appendChild(calendarGrid)
      } else {
        // If we couldn't extract the grid, use the whole calendar but clean it
        cleanupCalendar(calendarClone)
        pdfContainer.appendChild(calendarClone)
      }

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
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "landscape" as "landscape" | "portrait",
          compress: true,
        },
      }

      // Generate and download the PDF
      await html2pdf().from(pdfContainer).set(opt).save()

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

  // Function to extract just the calendar grid
  const extractCalendarGrid = (element: HTMLElement): HTMLElement | null => {
    // Try to find the calendar table or grid
    const table = element.querySelector("table")
    if (table) {
      const tableClone = table.cloneNode(true) as HTMLElement
      styleCalendarTable(tableClone)
      return tableClone
    }

    // If no table, look for grid elements
    const grid = element.querySelector(".calendar-grid, [class*='calendar-grid'], [class*='calendarGrid']")
    if (grid) {
      const gridClone = grid.cloneNode(true) as HTMLElement
      styleCalendarGrid(gridClone)
      return gridClone
    }

    return null
  }

  // Function to style a calendar table
  const styleCalendarTable = (table: HTMLElement) => {
    table.style.width = "100%"
    table.style.borderCollapse = "collapse"
    table.style.tableLayout = "fixed"
    table.style.marginBottom = "20px"

    // Style table headers (days of week)
    const headers = table.querySelectorAll("th")
    headers.forEach((header) => {
      if (header instanceof HTMLElement) {
        header.style.padding = "8px"
        header.style.backgroundColor = "#f5f5f5"
        header.style.border = "1px solid #ddd"
        header.style.fontWeight = "bold"
        header.style.textAlign = "center"
      }
    })

    // Style table cells (days)
    const cells = table.querySelectorAll("td")
    cells.forEach((cell) => {
      if (cell instanceof HTMLElement) {
        cell.style.padding = "8px"
        cell.style.border = "1px solid #ddd"
        cell.style.height = "80px"
        cell.style.verticalAlign = "top"
        cell.style.textAlign = "right"

        // If the cell has a green background (weekend), preserve it
        if (
          cell.classList.contains("weekend") ||
          window.getComputedStyle(cell).backgroundColor.includes("green") ||
          cell.querySelector("[style*='background-color: green']")
        ) {
          cell.style.backgroundColor = "#e8f5e9"
        }

        // Remove any "Add Event" text or buttons
        removeAddEventElements(cell)
      }
    })
  }

  // Function to style a calendar grid
  const styleCalendarGrid = (grid: HTMLElement) => {
    grid.style.display = "grid"
    grid.style.gridTemplateColumns = "repeat(7, 1fr)"
    grid.style.gap = "4px"
    grid.style.width = "100%"

    // Style grid cells
    const cells = grid.querySelectorAll("div")
    cells.forEach((cell) => {
      if (cell instanceof HTMLElement) {
        cell.style.border = "1px solid #ddd"
        cell.style.padding = "8px"
        cell.style.minHeight = "80px"

        // If the cell has a green background (weekend), preserve it
        if (
          cell.classList.contains("weekend") ||
          window.getComputedStyle(cell).backgroundColor.includes("green") ||
          cell.querySelector("[style*='background-color: green']")
        ) {
          cell.style.backgroundColor = "#e8f5e9"
        }

        // Remove any "Add Event" text or buttons
        removeAddEventElements(cell)
      }
    })
  }

  // Function to clean up the entire calendar
  const cleanupCalendar = (calendar: HTMLElement) => {
    // Remove any "Add Event" buttons or prompts
    removeAddEventElements(calendar)

    // Remove any navigation elements
    const navElements = calendar.querySelectorAll(".navigation, .nav-buttons, [class*='navigation'], [class*='nav-']")
    navElements.forEach((el) => el.remove())

    // Style the calendar container
    calendar.style.width = "100%"
    calendar.style.fontFamily = "Arial, sans-serif"
    calendar.style.color = "#333"
  }

  // Function to remove "Add Event" elements
  const removeAddEventElements = (element: HTMLElement) => {
    // Remove elements with "Add Event" text
    const textNodes = Array.from(element.querySelectorAll("*")).filter(
      (el) =>
        el.textContent?.includes("Add Event") ||
        el.textContent?.includes("Click") ||
        el.textContent?.includes("create one"),
    )

    textNodes.forEach((node) => node.remove())

    // Remove buttons
    const buttons = element.querySelectorAll("button, [role='button'], .button, [class*='button']")
    buttons.forEach((button) => button.remove())

    // Remove the specific "No events" message
    const noEventsMsg = Array.from(element.querySelectorAll("*")).filter((el) =>
      el.textContent?.includes("No events for this month yet"),
    )

    noEventsMsg.forEach((node) => node.remove())
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
