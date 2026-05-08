import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, ClipboardList, Target, Star, 
  Package, HeartPulse, FileText, Settings, BookOpen, 
  History, BarChart3
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/beratungsverlauf', label: 'Beratungen', icon: History },
  { path: '/kunden', label: 'Kunden', icon: Users },
  { path: '/leistungskatalog', label: 'Leistungen', icon: BookOpen },
  { path: '/tarife', label: 'Tarife', icon: Package },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/admin', label: 'Admin', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-20 lg:w-64 bg-card border-r border-border flex flex-col z-50">
      {/* Logo */}
      <div className="p-4 lg:p-6 flex items-center gap-3 border-b border-border">
        <img 
          src="https://media.base44.com/images/public/user_69ebb5f9878e5267e7fcc9b3/96b390eb9_AlbGymLogomark.png" 
          alt="AlbGym" 
          className="w-10 h-10 object-contain"
        />
        <span className="hidden lg:block text-lg font-bold text-foreground tracking-tight">
          Empfehlungs<span className="text-primary">navigator</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2 lg:px-3">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary' : 'group-hover:text-foreground'}`} />
                  <span className="hidden lg:block text-sm font-medium">{item.label}</span>
                  {isActive && (
                    <div className="hidden lg:block ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          AlbGym Navigator
        </div>
      </div>
    </aside>
  );
}