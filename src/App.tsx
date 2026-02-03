import { Sidebar } from './components/Sidebar';
import { ContainerList } from './components/ContainerList';
import { ContainerDetail } from './components/ContainerDetail';
import { ImageList } from './components/ImageList';
import { VolumeList } from './components/VolumeList';
import { BuildList } from './components/BuildList';
import { useAppStore } from './stores/appStore';
import './index.css';

function App() {
  const { activeTab, selectedContainer, error, setError } = useAppStore();

  return (
    <div className="flex h-screen bg-[#1a1a2e]">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {error && (
          <div className="bg-red-900/50 border-b border-red-700 px-4 py-2 flex items-center justify-between">
            <span className="text-red-200 text-sm">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-200 hover:text-white"
            >
              ×
            </button>
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'containers' && (
            selectedContainer ? <ContainerDetail /> : <ContainerList />
          )}
          {activeTab === 'images' && <ImageList />}
          {activeTab === 'volumes' && <VolumeList />}
          {activeTab === 'builds' && <BuildList />}
        </div>
      </main>
    </div>
  );
}

export default App;
