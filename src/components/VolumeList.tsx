import { useEffect, useState } from 'react';
import { Trash2, RefreshCw, Plus } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { useAppStore } from '../stores/appStore';
import type { Volume } from '../types/docker';

function formatSize(bytes: number | undefined): string {
  if (!bytes || bytes === 0) return '-';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function VolumeList() {
  const { volumes, setVolumes, setIsLoading, setError } = useAppStore();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [newVolumeName, setNewVolumeName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchVolumes = async () => {
    setIsLoading(true);
    try {
      const result = await invoke<Volume[]>('list_volumes');
      setVolumes(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVolumes();
  }, []);

  const handleDelete = async (volumeName: string) => {
    setActionLoading(volumeName);
    try {
      await invoke('remove_volume', { volumeName });
      await fetchVolumes();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVolumeName.trim()) return;

    setIsCreating(true);
    try {
      await invoke('create_volume', { volumeName: newVolumeName.trim() });
      await fetchVolumes();
      setNewVolumeName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-[#2a2a4a]">
        <h2 className="text-lg font-semibold text-white">Volumes</h2>
        <div className="flex items-center gap-2">
          <form onSubmit={handleCreate} className="flex items-center gap-2">
            <input
              type="text"
              value={newVolumeName}
              onChange={(e) => setNewVolumeName(e.target.value)}
              placeholder="Volume name"
              className="px-3 py-1.5 bg-[#16162a] border border-[#2a2a4a] rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
            />
            <button
              type="submit"
              disabled={isCreating || !newVolumeName.trim()}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Create
            </button>
          </form>
          <button
            onClick={fetchVolumes}
            className="p-2 rounded hover:bg-[#2a2a4a] transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-[#1a1a2e]">
            <tr className="text-left text-xs text-gray-400 uppercase">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Driver</th>
              <th className="px-4 py-3 font-medium">Mountpoint</th>
              <th className="px-4 py-3 font-medium">Size</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {volumes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No volumes found
                </td>
              </tr>
            ) : (
              volumes.map((volume) => {
                const isLoading = actionLoading === volume.Name;

                return (
                  <tr
                    key={volume.Name}
                    className="border-b border-[#2a2a4a] hover:bg-[#1e1e3a] transition-colors"
                  >
                    <td className="px-4 py-3 text-white font-medium">{volume.Name}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{volume.Driver}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm font-mono truncate max-w-[300px]" title={volume.Mountpoint}>
                      {volume.Mountpoint}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {formatSize(volume.UsageData?.Size)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {volume.CreatedAt ? new Date(volume.CreatedAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(volume.Name)}
                        disabled={isLoading}
                        className="p-1.5 rounded hover:bg-[#2a2a4a] transition-colors disabled:opacity-50"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                      </button>
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
