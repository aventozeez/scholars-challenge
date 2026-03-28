import Link from "next/link";
import { Trophy, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0a1628] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-[#f5a623] rounded-xl flex items-center justify-center">
                <Trophy size={20} className="text-[#0a1628]" />
              </div>
              <div>
                <div className="font-bold text-lg">AventoLinks</div>
                <div className="text-[#f5a623] text-xs tracking-widest">SCHOLARS CHALLENGE</div>
              </div>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed">
              Nigeria&apos;s most exciting secondary school academic competition. Compete. Innovate. Win.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-[#f5a623] mb-4 text-sm tracking-wider uppercase">Quick Links</h4>
            <ul className="space-y-2 text-sm text-white/70">
              {[
                { label: "About the Challenge", href: "/about" },
                { label: "How It Works", href: "/#how-it-works" },
                { label: "Prizes & Awards", href: "/prizes" },
                { label: "Leaderboard", href: "/leaderboard" },
                { label: "Photo Gallery", href: "/gallery" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-[#f5a623] transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Competition */}
          <div>
            <h4 className="font-bold text-[#f5a623] mb-4 text-sm tracking-wider uppercase">Competition</h4>
            <ul className="space-y-2 text-sm text-white/70">
              {[
                { label: "Register Now (Free)", href: "/register" },
                { label: "Competition Stages", href: "/#stages" },
                { label: "FAQ", href: "/faq" },
                { label: "Admin Portal", href: "/admin" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-[#f5a623] transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-[#f5a623] mb-4 text-sm tracking-wider uppercase">Contact</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-[#f5a623]" />
                <span>scholars@aventolinks.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-[#f5a623]" />
                <span>+234 800 000 0000</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-[#f5a623] mt-0.5" />
                <span>Lagos, Nigeria</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            &copy; {new Date().getFullYear()} AventoLinks Scholars Challenge. All rights reserved.
          </p>
          <p className="text-white/40 text-sm">
            Built with Next.js &amp; Supabase
          </p>
        </div>
      </div>
    </footer>
  );
}
