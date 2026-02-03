import { RefreshCw, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export function BuildList() {
  // Build history는 docker buildx history를 통해 조회 가능하지만
  // 간단한 구현을 위해 placeholder로 남겨둠
  const builds: {
    id: string;
    image: string;
    status: 'building' | 'success' | 'failed';
    startedAt: string;
    duration: string;
  }[] = [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-[#2a2a4a]">
        <h2 className="text-lg font-semibold text-white">Builds</h2>
        <button
          className="p-2 rounded hover:bg-[#2a2a4a] transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {builds.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="w-16 h-16 mb-4 rounded-full bg-[#2a2a4a] flex items-center justify-center">
              <Loader2 className="w-8 h-8" />
            </div>
            <p className="text-lg font-medium">No builds yet</p>
            <p className="text-sm mt-2">Build history will appear here</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 bg-[#1a1a2e]">
              <tr className="text-left text-xs text-gray-400 uppercase">
                <th className="px-4 py-3 font-medium">Image</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Started</th>
                <th className="px-4 py-3 font-medium">Duration</th>
              </tr>
            </thead>
            <tbody>
              {builds.map((build) => (
                <tr
                  key={build.id}
                  className="border-b border-[#2a2a4a] hover:bg-[#1e1e3a] transition-colors"
                >
                  <td className="px-4 py-3 text-white font-medium">{build.image}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      {build.status === 'building' && (
                        <>
                          <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                          <span className="text-blue-400">Building</span>
                        </>
                      )}
                      {build.status === 'success' && (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-green-400">Success</span>
                        </>
                      )}
                      {build.status === 'failed' && (
                        <>
                          <XCircle className="w-4 h-4 text-red-400" />
                          <span className="text-red-400">Failed</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{build.startedAt}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{build.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
