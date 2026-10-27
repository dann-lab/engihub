/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Desktop Left Sidebar Navigation
 * Aesthetic: Warm Nigerian campus study space.
 * Palette: Forest green `#1B4332`, sunny yellow-gold `#C67D0A` / `#E0A844`, warm cream background.
 */

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { NavigationModule } from '../../types';
import {
  BookOpen,
  CheckSquare,
  MessageSquare,
  Wrench,
  User,
  HelpCircle,
  Sun,
  Moon,
  Zap,
  LogOut,
  Shield,
  FileText
} from 'lucide-react';
import { getTimeGreeting, getRandomEncouragingLine, FlameIcon } from '../../utils/personality';

interface SidebarProps {
  currentTheme: 'light' | 'dark';
  onToggleTheme: () => void;
  activeModule: NavigationModule;
  onSelectModule: (module: NavigationModule) => void;
}

interface NavItem {
  id: NavigationModule;
  label: string;
  icon: React.ElementType;
  description: string;
  aliases: NavigationModule[];
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'learn',
    label: 'Learn',
    icon: BookOpen,
    description: 'Course lessons & tutor',
    aliases: ['learn', 'tutor', 'scanner']
  },
  {
    id: 'practice',
    label: 'Practice',
    icon: CheckSquare,
    description: 'CBT exam prep center',
    aliases: ['practice', 'cbt']
  },
  {
    id: 'ask',
    label: 'Ask',
    icon: MessageSquare,
    description: 'General study partner',
    aliases: ['ask']
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: Wrench,
    description: 'Problem lab & portfolio',
    aliases: ['projects', 'problem-lab', 'portfolio']
  },
  {
    id: 'me',
    label: 'Me',
    icon: User,
    description: 'Progress & records',
    aliases: ['me', 'dashboard', 'settings']
  }
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTheme,
  onToggleTheme,
  activeModule,
  onSelectModule
}) => {
  const { userProfile, updateProfileData, signOut, isAdmin, currentUser } = useAuth();
  const isLight = currentTheme === 'light';

  const greeting = getTimeGreeting(userProfile?.displayName || currentUser?.email || 'Student');
  const encouragingLine = React.useMemo(() => getRandomEncouragingLine(userProfile?.studyStreakDays || 1), [userProfile?.studyStreakDays]);

  const toggleLowData = async () => {
    if (!userProfile) return;
    const next = !userProfile.lowDataMode;
    await updateProfileData({ lowDataMode: next });
  };

  return (
    <aside
      className={`hidden md:flex flex-col w-64 lg:w-72 shrink-0 border-r transition-colors select-none ${
        isLight
          ? 'bg-[#FDFBF7] border-[#E8E1D3] text-[#142E22]'
          : 'bg-[#0B1612] border-[#223A30] text-[#F6F3EE]'
      }`}
    >
      {/* Brand Header */}
      <div className={`p-5 border-b ${isLight ? 'border-[#E8E1D3]' : 'border-[#223A30]'}`}>
        <div
          onClick={() => onSelectModule('me')}
          className="cursor-pointer group flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-serif text-lg font-bold shadow-xs ${
              isLight ? 'bg-[#1B4332] text-[#FDFBF7]' : 'bg-[#2D6A4F] text-[#F6F3EE]'
            }`}>
              E
            </div>
            <div>
              <span className="font-serif text-xl font-bold tracking-tight block leading-none">
                Engi<span className={isLight ? 'text-[#C67D0A]' : 'text-[#E0A844]'}>Hub</span>
              </span>
              <span className={`text-[10px] uppercase tracking-wider block mt-0.5 ${
                isLight ? 'text-[#687D72]' : 'text-[#6E8578]'
              }`}>
                Campus Study Space
              </span>
            </div>
          </div>

          {/* Study streak badge */}
          <div
            title={`${userProfile?.studyStreakDays || 1} day study streak`}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-colors ${
              isLight
                ? 'bg-[#FDF4E5] border border-[#E8D4B0] text-[#A86604]'
                : 'bg-[#1D2B20] border border-[#325C4B] text-[#E0A844]'
            }`}
          >
            <FlameIcon className={`w-3.5 h-3.5 ${isLight ? 'text-[#C67D0A]' : 'text-[#E0A844]'}`} />
            <span>{userProfile?.studyStreakDays || 1}d</span>
          </div>
        </div>

        {/* Personalized Student Greeting */}
        <div className={`mt-4 p-3 rounded-xl border ${
          isLight
            ? 'bg-[#F5EFE6] border-[#E8E1D3]'
            : 'bg-[#11221B] border-[#234436]'
        }`}>
          <p className="font-serif text-sm font-semibold leading-tight">
            {greeting}
          </p>
          <p className={`text-xs mt-1 leading-snug ${isLight ? 'text-[#405449]' : 'text-[#AEC1B6]'}`}>
            {encouragingLine}
          </p>
        </div>
      </div>

      {/* Main Navigation Items */}
      <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
        <span className={`px-3 text-[10px] font-semibold uppercase tracking-wider block mb-2 ${
          isLight ? 'text-[#687D72]' : 'text-[#6E8578]'
        }`}>
          Study Space
        </span>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.aliases.includes(activeModule);

          return (
            <button
              key={item.id}
              onClick={() => onSelectModule(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all tap-target-base ${
                isActive
                  ? isLight
                    ? 'bg-[#1B4332] text-white shadow-xs font-semibold'
                    : 'bg-[#1D3C2C] text-[#F6F3EE] border border-[#325C4B] font-semibold'
                  : isLight
                    ? 'text-[#405449] hover:bg-[#F5EFE6] hover:text-[#142E22]'
                    : 'text-[#AEC1B6] hover:bg-[#11221B] hover:text-[#F6F3EE]'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${
                isActive
                  ? isLight ? 'text-[#DDA15E]' : 'text-[#E0A844]'
                  : isLight ? 'text-[#687D72]' : 'text-[#6E8578]'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm leading-tight flex items-center justify-between">
                  <span>{item.label}</span>
                  {isActive && (
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      isLight ? 'bg-[#DDA15E]' : 'bg-[#E0A844]'
                    }`} />
                  )}
                </div>
                <div className={`text-[11px] truncate mt-0.5 ${
                  isActive
                    ? isLight ? 'text-white/80' : 'text-[#AEC1B6]'
                    : isLight ? 'text-[#687D72]' : 'text-[#6E8578]'
                }`}>
                  {item.description}
                </div>
              </div>
            </button>
          );
        })}

        {/* Admin Link if authorized */}
        {isAdmin && (
          <button
            onClick={() => onSelectModule('admin')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all tap-target-base ${
              activeModule === 'admin'
                ? isLight
                  ? 'bg-[#1B4332] text-white'
                  : 'bg-[#1D3C2C] text-[#F6F3EE] border border-[#325C4B]'
                : isLight
                  ? 'text-[#687D72] hover:bg-[#F5EFE6] hover:text-[#142E22]'
                  : 'text-[#6E8578] hover:bg-[#11221B] hover:text-[#F6F3EE]'
            }`}
          >
            <Shield className={`w-4 h-4 ${isLight ? 'text-[#C67D0A]' : 'text-[#E0A844]'}`} />
            <div className="flex-1">
              <span className="text-sm font-medium block">Admin Space</span>
              <span className={`text-[10px] block ${isLight ? 'text-[#687D72]' : 'text-[#6E8578]'}`}>
                Messages & submissions
              </span>
            </div>
          </button>
        )}
      </nav>

      {/* Footer Controls: Help, Low Data, Theme, Sign Out */}
      <div className={`p-3.5 border-t space-y-2 ${isLight ? 'border-[#E8E1D3]' : 'border-[#223A30]'}`}>
        <button
          onClick={() => onSelectModule('help')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            activeModule === 'help'
              ? isLight ? 'bg-[#E8F1EC] text-[#1B4332]' : 'bg-[#182922] text-[#E0A844]'
              : isLight ? 'text-[#405449] hover:bg-[#F5EFE6]' : 'text-[#AEC1B6] hover:bg-[#11221B]'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Help & Contact</span>
        </button>

        <div className="flex items-center justify-between pt-1 gap-2">
          {/* Low-Data Mode Toggle */}
          <button
            onClick={toggleLowData}
            title={
              userProfile?.lowDataMode
                ? 'Low-Data Mode active: image loading minimized'
                : 'Enable Low-Data mode for 2G/3G campus networks'
            }
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-mono transition-colors border ${
              userProfile?.lowDataMode
                ? isLight
                  ? 'bg-[#1B4332] text-white border-[#1B4332]'
                  : 'bg-[#2D6A4F] text-white border-[#2D6A4F]'
                : isLight
                  ? 'bg-[#F5EFE6] text-[#405449] border-[#E8E1D3] hover:text-[#142E22]'
                  : 'bg-[#11221B] text-[#AEC1B6] border-[#223A30] hover:text-[#F6F3EE]'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span className="text-[11px]">Data: {userProfile?.lowDataMode ? 'LOW' : 'STD'}</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle light/dark theme"
            className={`p-2 rounded-lg border transition-colors ${
              isLight
                ? 'bg-[#F5EFE6] border-[#E8E1D3] text-[#405449] hover:text-[#142E22]'
                : 'bg-[#11221B] border-[#223A30] text-[#AEC1B6] hover:text-[#F6F3EE]'
            }`}
          >
            {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </button>

          {/* Sign Out */}
          <button
            onClick={() => signOut()}
            title="Sign out of workspace"
            aria-label="Sign out"
            className={`p-2 rounded-lg border transition-colors ${
              isLight
                ? 'bg-[#F5EFE6] border-[#E8E1D3] text-[#687D72] hover:text-[#B91C1C]'
                : 'bg-[#11221B] border-[#223A30] text-[#6E8578] hover:text-[#EF4444]'
            }`}
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="pt-2 px-1 flex items-center justify-between text-[11px] font-mono text-[#687D72] dark:text-[#6E8578]">
          <a
            href="https://wa.me/2349040110170?text=Hello%20Danni%2C%20I%20have%20an%20inquiry%20regarding%20EngiHub"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#25D366] transition-colors"
            title="WhatsApp: 09040110170"
          >
            WA: 09040110170
          </a>
          <a
            href="https://dannistec.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline hover:text-[#142E22] dark:hover:text-[#F6F3EE] transition-colors"
          >
            Dannistec
          </a>
        </div>
      </div>
    </aside>
  );
};
