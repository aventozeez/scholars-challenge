import Link from "next/link";
import { Trophy, LayoutDashboard, HelpCircle, Users, Zap, Settings } from "lucide-react";

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/questions", label: "Questions", icon: HelpCircle },
  { href: "/admin/teams", label: "Teams", icon: Users },
  { href: "/admin/live/rapid-fire", label: "Rapid Fire", icon: Zap },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a1628] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#051020] border-r border-white/10 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#f5a623] rounded-lg flex items-center justify-center">
              <Trophy size={16} className="text-[#0a1628]" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">Scholars Admin</div>
              <div className="text-white/40 text-xs">Control Panel</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {adminNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white/70 transition-colors text-sm"
          >
            <Settings size={18} />
            Back to Site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
