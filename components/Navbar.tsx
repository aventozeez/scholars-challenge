"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X, Trophy } from "lucide-react";
import clsx from "clsx";

const navLinks = [
  { label: "About", href: "/about" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Gallery", href: "/gallery" },
  { label: "FAQ", href: "/faq" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a1628]/95 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#f5a623] rounded-lg flex items-center justify-center">
              <Trophy size={18} className="text-[#0a1628]" />
            </div>
            <span className="text-white font-bold text-lg leading-tight">
              AventoLinks<br />
              <span className="text-[#f5a623] text-xs font-normal tracking-wider">SCHOLARS CHALLENGE</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white/80 hover:text-[#f5a623] text-sm font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/admin"
              className="text-white/60 hover:text-white text-sm transition-colors"
            >
              Admin
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={clsx(
          "md:hidden bg-[#0a1628] border-t border-white/10 transition-all duration-300 overflow-hidden",
          open ? "max-h-screen py-4" : "max-h-0"
        )}
      >
        <div className="px-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-white/80 hover:text-[#f5a623] py-2 text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-white/10 mt-2">
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="text-white/60 hover:text-white text-sm py-2 block"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
