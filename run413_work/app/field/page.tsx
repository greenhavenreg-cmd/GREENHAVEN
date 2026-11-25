import type { Metadata } from "next"
import { FieldDeskClient } from "@/components/field/field-desk-client"

export const metadata: Metadata = {
  title: "Field Research · GreenHaven",
  description: "Pi-authenticated Field Research and reporting for Pioneers inside Pi Browser.",
  robots: { index: false, follow: false },
}

/** Field reporting remains available, but only inside the Pi-authenticated app shell. */
export default function FieldDeskPage() {
  return <FieldDeskClient />
}
