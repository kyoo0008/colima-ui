import { useEffect, useState } from 'react';
import { ArrowLeft, Play, Square, RotateCcw, Trash2, Terminal, FileText, Info, Activity } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { useAppStore } from '../stores/appStore';
import type { ContainerAction } from '../types/docker';

type DetailTab = 'logs' | 'inspect' | 'stats' | 'terminal';

export function ContainerDetail() {
  const {
    selectedContainer,
    setSelectedContainer,
    containerLogs,
    setContainerLogs,
    containerInspect,
    setContainerInspect,
    containerStats,
    setContainerStats,
    setError
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<DetailTab>('logs');
  const [isLoading, setIsLoading] = useState(false);

  const container = selectedContainer;
  if (!container) return null;

  const name = container.Names[0]?.replace(/^\//, '') || container.Id.slice(0, 12);
  const isRunning = container.State === 'running';

  const fetchLogs = async () => {
    try {
      const logs = await invoke<string>('get_container_logs', {
        containerId: container.Id,
        tail: 500
      });
      setContainerLogs(logs);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const fetchInspect = async () => {
    try {
      const inspect = await invoke<string>('inspect_container', { containerId: container.Id });
      setContainerInspect(JSON.parse(inspect));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const fetchStats = async () => {
    try {
      const stats = await invoke<string>('get_container_stats', { containerId: container.Id });
      setContainerStats(JSON.parse(stats));
    } catch (err) {
      console.error('Stats error:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs();
      const interval = setInterval(fetchLogs, 3000);
      return () => clearInterval(interval);
    } else if (activeTab === 'inspect') {
      fetchInspect();
    } else if (activeTab === 'stats' && isRunning) {
      fetchStats();
      const interval = setInterval(fetchStats, 2000);
      return () => clearInterval(interval);
    }
  }, [activeTab, container.Id]);

  const handleAction = async (action: ContainerAction) => {
    setIsLoading(true);
    try {
      await invoke('container_action', { containerId: container.Id, action });
      if (action === 'remove') {
        setSelectedContainer(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const tabs: { id: DetailTab; label: string; icon: typeof FileText }[] = [
    { id: 'logs', label: 'Logs', icon: FileText },
    { id: 'inspect', label: 'Inspect', icon: Info },
    { id: 'stats', label: 'Stats', icon: Activity },
    { id: 'terminal', label: 'Terminal', icon: Terminal },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#2a2a4a]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedContainer(null)}
            className="p-2 rounded hover:bg-[#2a2a4a] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-400" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-white">{name}</h2>
            <p className="text-sm text-gray-400">{container.Image}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isRunning ? (
            <button
              onClick={() => handleAction('stop')}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors disabled:opacity-50"
            >
              <Square className="w-4 h-4" />
              Stop
            </button>
          ) : (
            <button
              onClick={() => handleAction('start')}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              Start
            </button>
          )}
          <button
            onClick={() => handleAction('restart')}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            Restart
          </button>
          <button
            onClick={() => handleAction('remove')}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 hover:bg-red-600 rounded text-sm transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Remove
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2a2a4a]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                isActive
                  ? 'text-white border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'logs' && (
          <div className="bg-black rounded p-4 h-full overflow-auto font-mono text-sm">
            {containerLogs ? (
              <pre className="text-gray-300 whitespace-pre-wrap">{containerLogs}</pre>
            ) : (
              <p className="text-gray-500">No logs available</p>
            )}
          </div>
        )}

        {activeTab === 'inspect' && containerInspect && (
          <div className="space-y-4">
            <div className="bg-[#16162a] rounded p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">General</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">ID:</span>
                  <span className="text-white ml-2">{containerInspect.Id.slice(0, 12)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Created:</span>
                  <span className="text-white ml-2">{new Date(containerInspect.Created).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className="text-white ml-2">{containerInspect.State.Status}</span>
                </div>
                <div>
                  <span className="text-gray-500">Restart Count:</span>
                  <span className="text-white ml-2">{containerInspect.RestartCount}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#16162a] rounded p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Environment Variables</h3>
              <div className="space-y-1 text-sm font-mono">
                {containerInspect.Config.Env?.map((env, i) => (
                  <div key={i} className="text-gray-300">{env}</div>
                ))}
              </div>
            </div>

            <div className="bg-[#16162a] rounded p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Mounts</h3>
              {containerInspect.Mounts?.length > 0 ? (
                <div className="space-y-2 text-sm">
                  {containerInspect.Mounts.map((mount, i) => (
                    <div key={i} className="text-gray-300">
                      <span className="text-gray-500">{mount.Type}:</span> {mount.Source} → {mount.Destination}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No mounts</p>
              )}
            </div>

            <div className="bg-[#16162a] rounded p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Network</h3>
              <div className="text-sm">
                <span className="text-gray-500">IP Address:</span>
                <span className="text-white ml-2">{containerInspect.NetworkSettings?.IPAddress || '-'}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-4">
            {!isRunning ? (
              <p className="text-gray-500">Container is not running</p>
            ) : containerStats ? (
              <>
                <div className="bg-[#16162a] rounded p-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">CPU Usage</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min(containerStats.cpu_percent, 100)}%` }}
                      />
                    </div>
                    <span className="text-white text-sm">{containerStats.cpu_percent.toFixed(2)}%</span>
                  </div>
                </div>

                <div className="bg-[#16162a] rounded p-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Memory Usage</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${containerStats.memory_percent}%` }}
                      />
                    </div>
                    <span className="text-white text-sm">
                      {(containerStats.memory_usage / 1024 / 1024).toFixed(1)} MB / {(containerStats.memory_limit / 1024 / 1024 / 1024).toFixed(1)} GB
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#16162a] rounded p-4">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Network I/O</h3>
                    <div className="text-sm">
                      <div className="text-gray-300">
                        RX: {(containerStats.network_rx / 1024 / 1024).toFixed(2)} MB
                      </div>
                      <div className="text-gray-300">
                        TX: {(containerStats.network_tx / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#16162a] rounded p-4">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Block I/O</h3>
                    <div className="text-sm">
                      <div className="text-gray-300">
                        Read: {(containerStats.block_read / 1024 / 1024).toFixed(2)} MB
                      </div>
                      <div className="text-gray-300">
                        Write: {(containerStats.block_write / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-gray-500">Loading stats...</p>
            )}
          </div>
        )}

        {activeTab === 'terminal' && (
          <div className="bg-black rounded p-4 h-full flex items-center justify-center">
            <p className="text-gray-500">Terminal feature requires xterm.js integration</p>
          </div>
        )}
      </div>
    </div>
  );
}
