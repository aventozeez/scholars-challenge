"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Trophy, LayoutDashboard, HelpCircle, Users, Zap, ArrowLeft, LogOut, Layers, Radio } from "lucide-react";
import { useAdminAuth, adminLogout } from "@/lib/useAdminAuth";
import clsx from "clsx";

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/questions", label: "Questions", icon: HelpCircle },
  { href: "/admin/pools", label: "Question Pools", icon: Layers },
  { href: "/admin/teams", label: "Teams", icon: Users },
  { href: "/admin/live/rapid-fire", label: "Rapid Fire", icon: Zap },
  { href: "/admin/live/buzzer", label: "Buzzer Round", icon: Radio },
];

function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="w-64 bg-[#051020] border-r border-white/10 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#f5a623] rounded-lg flex items-center justify-center">
            <Trophy size={16} className="text-[#0a1628]" />
          </div>
          <div>
            <div className="text-white font-bold text-sm">Scholars Admin</div>
            <div className="text-white/40 text-xs">Control Panel</div>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-4 space-y-1">
        {adminNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-[#f5a623]/20 text-[#f5a623] border border-[#f5a623]/20"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white/70 transition-colors text-sm"
        >
          <ArrowLeft size={18} />
          Back to Site
        </Link>
        <button
          onClick={() => adminLogout(router)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  useAdminAuth(); // redirects to /admin/login if not authenticated
  return <>{children}</>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Login page renders without sidebar or auth guard
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#0a1628] flex">
        <AdminSidebar />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </AdminGuard>
  );
}
