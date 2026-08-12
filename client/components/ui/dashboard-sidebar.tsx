"use client";

import React, { useState } from 'react';
import { 
  Search, 
  LayoutDashboard, 
  Settings, 
  LogOut,
  ChevronDown,
  ChevronRight,
  Activity,
  CreditCard,
  Terminal,
  PanelLeftClose,
  PanelLeftOpen,
  Command,
  X,
  Code
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { LogoutButton } from '../LogoutButton';

export type NavItemData = {
  id: string;
  title: string;
  icon: React.ElementType;
  badge?: number | string;
  shortcut?: string;
  children?: NavItemData[];
  href: string;
};

export type NavGroupData = {
  heading?: string;
  items: NavItemData[];
};

const navGroups: NavGroupData[] = [
  {
    items: [
      { id: 'search', title: 'Scanner', icon: Search, shortcut: '⌘K', href: '/scanner' },
      { id: 'home', title: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
      { id: 'scans', title: 'Scan History', icon: Activity, href: '/dashboard/history' },
    ]
  },
  {
    heading: 'Workspace',
    items: [
      { id: 'billing', title: 'Billing & Plan', icon: CreditCard, href: '/billing' },
    ]
  },
  {
    heading: 'Developers',
    items: [
      { id: 'cli', title: 'CLI Tokens', icon: Terminal, href: '/dashboard/cli-tokens' },
    ]
  }
];

const bottomItems: NavItemData[] = [
  { id: 'settings', title: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

function WorkspaceSwitcher({ selected, onSelect }: { selected?: string, onSelect?: (ws: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalSelected, setInternalSelected] = useState('Personal Workspace');
  
  const current = selected || internalSelected;
  const handleSelect = onSelect || setInternalSelected;

  return (
    <div className="relative">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-2 py-2 mb-4 rounded-lg hover:bg-white/5 cursor-pointer transition-colors select-none group"
      >
        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-[6px] overflow-hidden shrink-0">
            <Image src="/logo.png" alt="VibeForge" width={32} height={32} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[13px] font-medium leading-none mb-1 text-white truncate max-w-[120px]">{current}</span>
            <span className="text-[11px] text-zinc-400 leading-none">VibeForge</span>
          </div>
        </Link>
        <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors shrink-0" strokeWidth={1.5} />
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-[52px] left-0 w-full bg-card border border-border/50 rounded-lg shadow-xl z-50 py-1 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100">
            {['Personal Workspace'].map(ws => (
              <div 
                key={ws}
                onClick={() => { handleSelect(ws); setIsOpen(false); }}
                className={`px-3 py-2 mx-1 text-[13px] rounded-md cursor-pointer transition-colors ${current === ws ? 'bg-[#00c97a]/10 text-[#00c97a] font-medium' : 'text-zinc-300 hover:bg-white/10 hover:text-white'}`}
              >
                {ws}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function NavItem({ 
  item, 
  activeId, 
  onSelect,
  level = 0
}: { 
  item: NavItemData; 
  activeId: string; 
  onSelect: (id: string) => void;
  level?: number;
}) {
  const isActive = activeId === item.id;
  const hasChildren = !!item.children;
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else {
      onSelect(item.id);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <Link 
        href={item.href}
        className={`group flex items-center justify-between py-[7px] rounded-r-[6px] cursor-pointer transition-colors duration-150 select-none border-l-2
          ${isActive 
            ? 'border-green-500 bg-green-500/10 text-green-400 pl-3' 
            : 'text-zinc-400 border-transparent hover:bg-white/10 hover:text-white'
          }
        `}
        style={{ paddingLeft: isActive ? undefined : `${level * 12 + 10}px`, paddingRight: '10px' }}
        onClick={handleClick}
      >
        <div className="flex items-center gap-2.5">
          <item.icon 
            className={`w-[16px] h-[16px] transition-colors
              ${isActive ? 'text-green-400' : 'text-zinc-500 group-hover:text-white'}
            `} 
            strokeWidth={1.5} 
          />
          <span className="text-[13px] tracking-wide truncate">
            {item.title}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {item.shortcut && (
             <kbd className="hidden group-hover:inline-flex items-center justify-center h-5 px-1.5 text-[10px] font-medium font-mono text-zinc-400 bg-white/5 border border-white/10 rounded-[4px] shadow-xs">
               {item.shortcut}
             </kbd>
          )}
          {item.badge && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-medium rounded-full bg-[#00c97a]/10 text-[#00c97a]">
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <ChevronRight 
              className={`w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} 
              strokeWidth={2}
            />
          )}
        </div>
      </Link>

      {hasChildren && (
        <div 
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
            isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden min-h-0 relative flex flex-col gap-0.5 mt-0.5">
            <div 
              className="absolute top-0 bottom-0 border-l border-black/5 dark:border-white/5"
              style={{ left: `${level * 12 + 17.5}px` }}
            />
            {item.children!.map(child => (
              <NavItem 
                key={child.id} 
                item={child} 
                activeId={activeId} 
                onSelect={onSelect} 
                level={level + 1} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SidebarNav({ 
  className = '',
  activeId,
  onSelect,
  activeWorkspace,
  onWorkspaceSelect,
  user
}: { 
  className?: string,
  activeId?: string,
  onSelect?: (id: string) => void,
  activeWorkspace?: string,
  onWorkspaceSelect?: (ws: string) => void,
  user?: { name: string, email: string, avatarUrl: string }
}) {
  const [internalId, setInternalId] = useState('home');
  const currentId = activeId !== undefined ? activeId : internalId;
  const handleSelect = onSelect || setInternalId;
  const [avatarError, setAvatarError] = useState(false);

  return (
    <div className={`flex flex-col w-[260px] h-full bg-[#09090b] border-r border-white/10 p-3 font-sans ${className}`}>
      <WorkspaceSwitcher selected={activeWorkspace} onSelect={onWorkspaceSelect} />

      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col gap-4 mt-2">
        {navGroups.map((group, idx) => (
          <div key={idx} className="flex flex-col gap-0.5">
            {group.heading && (
              <span className="px-2.5 mb-1 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase mt-2">
                {group.heading}
              </span>
            )}
            {group.items.map(item => (
              <NavItem 
                key={item.id} 
                item={item} 
                activeId={currentId} 
                onSelect={handleSelect} 
              />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-white/10 flex flex-col gap-0.5 pb-10">
        {bottomItems.map(item => (
          <NavItem 
            key={item.id} 
            item={item} 
            activeId={currentId} 
            onSelect={handleSelect} 
          />
        ))}
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 mt-2 mb-2 rounded-lg bg-black/20 border border-white/5">
            {user.avatarUrl && !avatarError ? (
              <img 
                src={user.avatarUrl} 
                alt={user.name} 
                onError={() => setAvatarError(true)}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-green-500 text-black flex items-center justify-center font-bold text-sm shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col overflow-hidden">
              <span className="text-[13px] font-medium text-white truncate">{user.name}</span>
              <span className="text-[11px] text-zinc-500 truncate">{user.email}</span>
            </div>
          </div>
        )}
        <LogoutButton />
      </div>
    </div>
  );
}
