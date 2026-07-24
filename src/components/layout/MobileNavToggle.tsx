"use client";

import Link from "next/link";
import { useState } from "react";

export function MobileNavToggle({
  navLinks,
  phone,
}: {
  navLinks: { href: string; label: string }[];
  phone: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-menu"
        aria-label={open ? "メニューを閉じる" : "メニューを開く"}
        onClick={() => setOpen((v) => !v)}
        className="tap-target flex w-11 flex-col items-center justify-center gap-1.5 rounded-md border border-neutral-300 px-2"
      >
        <span className="block h-0.5 w-6 bg-neutral-800" />
        <span className="block h-0.5 w-6 bg-neutral-800" />
        <span className="block h-0.5 w-6 bg-neutral-800" />
      </button>

      {open && (
        <div
          id="mobile-nav-menu"
          className="absolute inset-x-0 top-16 z-50 border-b border-neutral-200 bg-white shadow-lg"
        >
          <nav className="flex flex-col p-4 text-base font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="tap-target flex items-center border-b border-neutral-100 py-3"
              >
                {link.label}
              </Link>
            ))}
            <a href={`tel:${phone.replace(/[^0-9]/g, "")}`} className="tap-target flex items-center py-3 font-semibold text-brand-700">
              📞 {phone}
            </a>
          </nav>
        </div>
      )}
    </div>
  );
}
