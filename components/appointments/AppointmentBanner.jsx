"use client"

import clsx from "clsx"
import styles from "./AppointmentBanner.module.scss"

/**
 * AppointmentBanner — dark radial-gradient hero on the Appointments page.
 * Card below should use -mt-[60px] to overlap.
 */
export function AppointmentBanner({ title, actions, className }) {
  return (
    <div
      className={clsx(styles.root, className)}
      style={{
        background:
          "radial-gradient(99.09% 59.99% at 50% 55.44%, #46286C 0%, #25113E 39.08%, #372153 78.16%, #6C4F90 100%)",
      }}
    >
      <img
        src="/assets/8b46197b8125e32aedb152d3d430b818c39f3157.svg"
        alt=""
        aria-hidden="true"
        className={styles.pattern}
        style={{ mixBlendMode: "screen", height: "100%", width: "auto", objectFit: "fill" }}
      />
      <svg aria-hidden="true" className={styles.noiseSvg}>
        <filter id="banner-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.80" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#banner-noise)" />
      </svg>
      <div className={styles.inner}>
        <div className={styles.row}>
          <h1 className={styles.title}>{title}</h1>
          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </div>
      </div>
    </div>
  )
}
