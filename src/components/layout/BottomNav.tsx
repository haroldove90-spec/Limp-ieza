import React from 'react';
import { NavItem } from './Sidebar';

interface BottomNavProps {
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  navItems,
  activeTab,
  onTabChange
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-2 safe-area-pb">
      <nav className="grid grid-flow-col auto-cols-fr gap-1 items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-blue-700 font-bold bg-blue-50'
                  : 'text-slate-500 font-medium hover:text-slate-900'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                {typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {item.badgeCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] leading-tight tracking-tight mt-1 truncate max-w-[76px] text-center">
                {item.name}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
