/**
 * Personal Notes panel — free-form notes area.
 */
import React, { useEffect, useState } from "react";

const PERSONAL_NOTES_STORAGE_KEY = "tp-rxpad-personal-notes";

export function PersonalNotesContent() {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(PERSONAL_NOTES_STORAGE_KEY);
    if (saved != null) {
      setNotes(saved);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(PERSONAL_NOTES_STORAGE_KEY, notes);
  }, [notes]);

  return (
    <div className="content-stretch flex flex-col items-start relative size-full">
      <div className="flex-[1_0_0] min-h-px min-w-px relative w-full overflow-y-auto">
        <div className="content-stretch flex flex-col gap-[12px] items-start p-[12px] w-full">
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.currentTarget.value)}
            placeholder="Write personal notes..."
            className="min-h-[360px] w-full resize-y rounded-[10px] border border-tp-slate-100 bg-white px-3 py-2 font-['Inter',sans-serif] text-[14px] leading-[20px] text-tp-slate-700 placeholder:text-tp-slate-400 focus:border-tp-blue-200 focus:outline-none focus:ring-0"
          />
          <p className="text-[12px] leading-[16px] text-tp-slate-500">
            Doctor-only note. This content is not included in print and is never shared with the patient.
          </p>
        </div>
      </div>
    </div>
  );
}
