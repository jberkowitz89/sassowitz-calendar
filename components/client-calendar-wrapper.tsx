"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

// Dynamically import the CalendarView component with no SSR
const CalendarViewDynamic = dynamic(() => import("./calendar-view").then((mod) => ({ default: mod.CalendarView })), {
  ssr: false,
  loading: () => <CalendarLoading />,
})

function CalendarLoading() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="h-8 w-40 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex gap-2">
          <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-28 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-1 lg:col-span-2 h-96 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  )
}

export function ClientCalendarWrapper() {
  return (
    <Suspense fallback={<CalendarLoading />}>
      <CalendarViewDynamic />
    </Suspense>
  )
}
