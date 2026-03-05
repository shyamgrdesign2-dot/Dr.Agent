import { Mulish } from "next/font/google"
import { DrAgentPage } from "@/components/tp-appointment-screen/DrAgentPage"

const mulish = Mulish({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700", "800"],
})

export const metadata = {
  title: "TP Appointment Screen — TatvaPractice",
  description: "TatvaPractice appointment queue with tabs, filters, and AI-assisted workflow.",
}

export default function TPAppointmentPage() {
  return (
    <div className={mulish.variable}>
      <DrAgentPage />
    </div>
  )
}
