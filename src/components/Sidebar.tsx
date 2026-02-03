import { Box, Image, HardDrive, Wrench } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import type { TabType } from '../types/docker';

const tabs: { id: TabType; label: string; icon: typeof Box }[] = [
  { id: 'containers', label: 'Containers', icon: Box },
  { id: 'images', label: 'Images', icon: Image },
  { id: 'volumes', label: 'Volumes', icon: HardDrive },
  { id: 'builds', label: 'Builds', icon: Wrench },
];

export function Sidebar() {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <aside className="w-56 bg-[#16162a] border-r border-[#2a2a4a] flex flex-col">
      <div className="p-4 border-b border-[#2a2a4a]">
        <h1 className="text-lg font-semibold text-white flex items-center gap-2">
          <Box className="w-6 h-6 text-blue-400" />
          Colima UI
        </h1>
      </div>
      <nav className="flex-1 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                isActive
                  ? 'bg-[#2a2a4a] text-white border-l-2 border-blue-400'
                  : 'text-gray-400 hover:bg-[#1e1e3a] hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : ''}`} />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-[#2a2a4a] text-xs text-gray-500">
        Docker via Colima
      </div>
    </aside>
  );
}
