import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { useUiStore } from "../store/uiStore";
import useNavLinks from "../hooks/useNavLinks";
import { LogOut } from "lucide-react";
import { useAuthStore } from "../store/auth";

export default function Sidebar() {
  const { user } = useAuthStore();
  const { sidebarCollapsed, setSidebarCollapsed } = useUiStore();
  const links = useNavLinks(user.role);
  const { pathname } = useLocation();

  const sections = useMemo(() => {
    const map = new Map();
    for (const l of links) {
      if (!map.has(l.section)) map.set(l.section, []);
      map.get(l.section).push(l);
    }
    return Array.from(map.entries());
  }, [links]);

  return (
    <aside className="h-screen sticky top-0 border-r border-white/10 bg-[#0B1220] text-slate-200 flex flex-col">
      <div className="h-16 flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/10" />
          {!sidebarCollapsed && (
            <span className="font-semibold tracking-wide">Insight ERP</span>
          )}
        </div>

        <button
          className="p-2 rounded-lg hover:bg-white/10"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span>{sidebarCollapsed ? "»" : "«"}</span>
        </button>
      </div>

      <motion.div
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 260 }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className="overflow-y-auto pb-4 flex-1"
      >
        {sections.map(([section, items]) => (
          <div key={section} className="mt-4">
            {!sidebarCollapsed && (
              <div className="px-4 text-xs uppercase tracking-wider opacity-60 mb-2">
                {section}
              </div>
            )}
            <nav className="flex flex-col gap-1">
              {items.map((item) => {
                const active = pathname.startsWith(item.to);
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `mx-2 flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                        active || isActive ? "bg-white/10" : "hover:bg-white/5"
                      }`
                    }
                  >
                    <Icon size={18} />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                    {active && (
                      <motion.span
                        layoutId="active-pill"
                        className="ml-auto h-2 w-2 rounded-full bg-emerald-400"
                      />
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}

        {/* Odjava */}
        <div className="mt-6 border-t border-white/10 pt-3 mx-2">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5">
            <LogOut size={18} />
            {!sidebarCollapsed && <span>Odjava</span>}
          </button>
        </div>
      </motion.div>
    </aside>
  );
}
