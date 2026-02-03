import { useEffect, useState } from 'react';
import { Trash2, RefreshCw, Download } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { useAppStore } from '../stores/appStore';
import type { Image } from '../types/docker';

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

export function ImageList() {
  const { images, setImages, setIsLoading, setError } = useAppStore();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pullImage, setPullImage] = useState('');
  const [isPulling, setIsPulling] = useState(false);

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const result = await invoke<Image[]>('list_images');
      setImages(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleDelete = async (imageId: string) => {
    setActionLoading(imageId);
    try {
      await invoke('remove_image', { imageId });
      await fetchImages();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handlePull = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pullImage.trim()) return;

    setIsPulling(true);
    try {
      await invoke('pull_image', { imageName: pullImage.trim() });
      await fetchImages();
      setPullImage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsPulling(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-[#2a2a4a]">
        <h2 className="text-lg font-semibold text-white">Images</h2>
        <div className="flex items-center gap-2">
          <form onSubmit={handlePull} className="flex items-center gap-2">
            <input
              type="text"
              value={pullImage}
              onChange={(e) => setPullImage(e.target.value)}
              placeholder="Image name (e.g., nginx:latest)"
              className="px-3 py-1.5 bg-[#16162a] border border-[#2a2a4a] rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
            />
            <button
              type="submit"
              disabled={isPulling || !pullImage.trim()}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Pull
            </button>
          </form>
          <button
            onClick={fetchImages}
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
              <th className="px-4 py-3 font-medium">Repository</th>
              <th className="px-4 py-3 font-medium">Tag</th>
              <th className="px-4 py-3 font-medium">Image ID</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Size</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {images.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No images found
                </td>
              </tr>
            ) : (
              images.map((image) => {
                const [repo, tag] = (image.RepoTags?.[0] || '<none>:<none>').split(':');
                const isLoading = actionLoading === image.Id;

                return (
                  <tr
                    key={image.Id}
                    className="border-b border-[#2a2a4a] hover:bg-[#1e1e3a] transition-colors"
                  >
                    <td className="px-4 py-3 text-white font-medium">{repo}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-[#2a2a4a] rounded text-sm text-gray-300">
                        {tag}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm font-mono">
                      {image.Id.replace('sha256:', '').slice(0, 12)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {formatDate(image.Created)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {formatSize(image.Size)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(image.Id)}
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
