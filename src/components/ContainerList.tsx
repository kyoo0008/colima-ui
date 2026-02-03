import { useEffect, useState } from 'react';
import { Play, Square, RotateCcw, Trash2, RefreshCw } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { useAppStore } from '../stores/appStore';
import type { Container, ContainerAction } from '../types/docker';

function formatPorts(ports: Container['Ports']): string {
  if (!ports || ports.length === 0) return '-';
  return ports
    .filter(p => p.PublicPort)
    .map(p => `${p.PublicPort}:${p.PrivatePort}`)
    .join(', ') || '-';
}

function formatCreated(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function getStateColor(state: string): string {
  switch (state.toLowerCase()) {
    case 'running':
      return 'bg-green-500';
    case 'exited':
      return 'bg-gray-500';
    case 'paused':
      return 'bg-yellow-500';
    case 'restarting':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
}

export function ContainerList() {
  const { containers, setContainers, setSelectedContainer, setIsLoading, setError } = useAppStore();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchContainers = async () => {
    setIsLoading(true);
    try {
      const result = await invoke<Container[]>('list_containers');
      setContainers(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContainers();
    const interval = setInterval(fetchContainers, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (containerId: string, action: ContainerAction, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionLoading(containerId);
    try {
      await invoke('container_action', { containerId, action });
      await fetchContainers();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-[#2a2a4a]">
        <h2 className="text-lg font-semibold text-white">Containers</h2>
        <button
          onClick={fetchContainers}
          className="p-2 rounded hover:bg-[#2a2a4a] transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-[#1a1a2e]">
            <tr className="text-left text-xs text-gray-400 uppercase">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Image</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Ports</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {containers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No containers found
                </td>
              </tr>
            ) : (
              containers.map((container) => {
                const name = container.Names[0]?.replace(/^\//, '') || container.Id.slice(0, 12);
                const isRunning = container.State === 'running';
                const isLoading = actionLoading === container.Id;

                return (
                  <tr
                    key={container.Id}
                    onClick={() => setSelectedContainer(container)}
                    className="border-b border-[#2a2a4a] hover:bg-[#1e1e3a] cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${getStateColor(container.State)}`} />
                        <span className="text-white font-medium">{name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-sm truncate max-w-[200px]">
                      {container.Image}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-400">{container.Status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {formatPorts(container.Ports)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {formatCreated(container.Created)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {isRunning ? (
                          <button
                            onClick={(e) => handleAction(container.Id, 'stop', e)}
                            disabled={isLoading}
                            className="p-1.5 rounded hover:bg-[#2a2a4a] transition-colors disabled:opacity-50"
                            title="Stop"
                          >
                            <Square className="w-4 h-4 text-red-400" />
                          </button>
                        ) : (
                          <button
                            onClick={(e) => handleAction(container.Id, 'start', e)}
                            disabled={isLoading}
                            className="p-1.5 rounded hover:bg-[#2a2a4a] transition-colors disabled:opacity-50"
                            title="Start"
                          >
                            <Play className="w-4 h-4 text-green-400" />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleAction(container.Id, 'restart', e)}
                          disabled={isLoading}
                          className="p-1.5 rounded hover:bg-[#2a2a4a] transition-colors disabled:opacity-50"
                          title="Restart"
                        >
                          <RotateCcw className="w-4 h-4 text-blue-400" />
                        </button>
                        <button
                          onClick={(e) => handleAction(container.Id, 'remove', e)}
                          disabled={isLoading}
                          className="p-1.5 rounded hover:bg-[#2a2a4a] transition-colors disabled:opacity-50"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
