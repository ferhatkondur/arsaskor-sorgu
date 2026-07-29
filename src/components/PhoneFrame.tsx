import type { ReactNode } from "react";

/**
 * Renders children inside a 390×844 phone-shaped viewport on desktop.
 * On mobile (< 768px), fills the screen.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-paper md:flex md:items-center md:justify-center md:py-8">
      <div
        className="w-full min-h-screen md:min-h-0 md:h-[844px] md:w-[390px] md:rounded-[40px] md:border md:border-rule bg-paper overflow-hidden md:overflow-y-auto"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {children}
      </div>
    </div>
  );
}
