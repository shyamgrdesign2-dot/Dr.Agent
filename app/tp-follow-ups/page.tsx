import { Mulish } from "next/font/google"
import { FollowUpsPage } from "@/components/tp-follow-ups/FollowUpsPage"

const mulish = Mulish({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700", "800"],
})

export const metadata = {
  title: "Follow Ups — TatvaPractice",
  description: "TatvaPractice follow-up patient listing with filters and smart date picker.",
}

export default function TPFollowUpsPage() {
  return (
    <div className={mulish.variable}>
      <FollowUpsPage />
    </div>
  )
}
