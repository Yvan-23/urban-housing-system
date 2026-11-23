import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map as MapIcon, Layers, Search, MousePointer2, Maximize2, Download, Calendar,
  Building2, Activity, Filter, Eye, EyeOff, ChevronRight, ChevronLeft,
  Settings2, Clock, Loader2
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';

const staticLayers = [
  { id: 'districts',      name: 'District Boundaries',    active: true,  color: 'text-blue-500' },
  { id: 'density',        name: 'Housing Density Heatmap', active: true,  color: 'text-orange-500' },
  { id: 'projects',       name: 'Housing Records',         active: false, color: 'text-emerald-500' },
  { id: 'infrastructure', name: 'Utility Overlays',        active: false, color: 'text-purple-500' },
  { id: 'population',     name: 'Population Density',      active: false, color: 'text-amber-500' },
];

const GISVisualization = () => {
  const { showNotification } = useNotification();
  const [gisData, setGisData]         = useState(null);
  const [loadingGIS, setLoadingGIS]   = useState(true);
  const [activeLayers, setActiveLayers] = useState(staticLayers.filter(l => l.active).map(l => l.id));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [timelineValue, setTimelineValue] = useState(2024);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    const fetchGIS = async () => {
      try {
        const res = await api.get('/analytics/gis');
        setGisData(res.data?.data);
      } catch (err) {
        console.error('GIS data load failed:', err);
      } finally {
        setLoadingGIS(false);
      }
    };
    fetchGIS();
  }, []);

  // Map housing records to visual markers — distribute across map if no coordinates
  const mapPoints = (gisData?.mapPoints || []).length > 0
    ? gisData.mapPoints
    : (gisData?.byDistrict
        ? Object.entries(gisData.byDistrict).map(([district, count], i) => ({
            id: i,
            name: district,
            status: 'Available',
            district,
            count,
            x: `${15 + (i * 20) % 70}%`,
            y: `${20 + (i * 15) % 60}%`,
          }))
        : []);

  const colorForStatus = (s) => {
    switch ((s || '').toLowerCase()) {
      case 'available': return 'bg-emerald-500';
      case 'sold':      return 'bg-red-500';
      case 'rented':    return 'bg-blue-500';
      default:          return 'bg-amber-500';
    }
  };

  const toggleLayer = (id) => {
    setActiveLayers(prev =>
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
    const layer = staticLayers.find(l => l.id === id);
    showNotification(`${layer.name} ${activeLayers.includes(id) ? 'deactivated' : 'activated'}.`, 'info');
  };

  const handleSimulate = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setTimelineValue(2020);
    showNotification("Running urban growth simulation timelapse...", 'info');
    
    let year = 2020;
    const interval = setInterval(() => {
      year += 1;
      setTimelineValue(year);
      if (year >= 2030) {
        clearInterval(interval);
        setIsSimulating(false);
        showNotification("Simulation complete. 2030 housing saturation reached.", 'success');
      }
    }, 400);
  };

  const handleMapExport = () => {
    showNotification("Generating high-resolution geospatial snapshot...", 'success');
  };

  const handleProjectClick = (p) => {
    setSelectedProject(p);
    showNotification(`Loading real-time status for ${p.name}.`, 'info');
  };

  // Dynamic values based on timeline
  const heatmapIntensity = (timelineValue - 2020) / 10;
  const boundaryScale = 0.9 + (timelineValue - 2020) * 0.02;

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white dark:bg-secondary-950 rounded-3xl overflow-hidden shadow-2xl border border-secondary-200 dark:border-secondary-800 relative">
      
      {/* Top Controls Overlay */}
      <div className="absolute top-6 left-6 right-6 z-30 flex justify-between items-center pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="card p-2 flex items-center gap-2 bg-white/90 dark:bg-secondary-900/90 backdrop-blur-md shadow-xl border-secondary-200/50">
            <Search className="text-secondary-400 ml-2" size={18} />
            <input 
              type="text" 
              placeholder="Locate district or project..." 
              className="bg-transparent border-none focus:ring-0 text-sm w-64 outline-none"
            />
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-3 bg-white/90 dark:bg-secondary-900/90 backdrop-blur-md rounded-xl shadow-xl border border-secondary-200/50 text-secondary-600 hover:text-primary-600 transition-colors"
          >
            <Layers size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
           <button 
            onClick={handleMapExport}
            className="px-4 py-2.5 bg-primary-600 text-white rounded-xl shadow-xl font-bold text-sm flex items-center gap-2 hover:bg-primary-700 transition-colors active:scale-95"
           >
             <Download size={16} />
             Export Map
           </button>
           <button className="p-3 bg-white/90 dark:bg-secondary-900/90 backdrop-blur-md rounded-xl shadow-xl border border-secondary-200/50 text-secondary-600">
             <Maximize2 size={20} />
           </button>
        </div>
      </div>

      {/* Main Map Content */}
      <div className="flex-1 relative bg-secondary-50 dark:bg-secondary-900 overflow-hidden cursor-crosshair">
        {/* Mock Map Background Layer */}
        <div className="absolute inset-0 opacity-40 dark:opacity-20 pointer-events-none">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #3b82f6 1px, transparent 0)', backgroundSize: '60px 60px' }}></div>
        </div>

        {/* Heatmap Layer Simulation (Reactive to Slider) */}
        <AnimatePresence>
          {activeLayers.includes('density') && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
               <motion.div 
                animate={{ scale: boundaryScale, opacity: 0.1 + heatmapIntensity * 0.4 }}
                className="w-[800px] h-[600px] bg-gradient-radial from-orange-500 via-orange-300/20 to-transparent blur-3xl"
               ></motion.div>
               <motion.div 
                animate={{ x: heatmapIntensity * 50, opacity: 0.1 + heatmapIntensity * 0.3 }}
                className="absolute top-[20%] left-[30%] w-[400px] h-[300px] bg-gradient-radial from-orange-600 via-orange-400/10 to-transparent blur-3xl"
               ></motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* District Boundaries Layer Simulation (Reactive to Slider) */}
        <AnimatePresence>
           {activeLayers.includes('districts') && (
             <motion.svg 
               initial={{ opacity: 0, scale: 1.1 }}
               animate={{ opacity: 1, scale: boundaryScale }}
               exit={{ opacity: 0, scale: 1.1 }}
               className="absolute inset-0 w-full h-full text-primary-500/30" 
               viewBox="0 0 1000 1000"
             >
                <motion.path 
                  animate={{ strokeDashoffset: isSimulating ? [0, 20, 0] : 0 }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  d="M100,100 L400,150 L500,400 L300,500 L100,400 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="8,8" 
                />
                <path d="M500,100 L800,150 L900,400 L700,600 L500,400 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="8,8" />
                <path d="M100,600 L300,550 L500,800 L400,900 L100,850 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="8,8" />
                <path d="M600,600 L850,550 L950,850 L700,950 L550,850 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="8,8" />
             </motion.svg>
           )}
        </AnimatePresence>

        {/* Project Markers from DB */}
        {activeLayers.includes('projects') && mapPoints.map((p, i) => (
          <motion.div key={p.id || i}
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            whileHover={{ scale: 1.2, zIndex: 50 }}
            onClick={() => { setSelectedProject(p); showNotification(`Loading status for ${p.name}.`, 'info'); }}
            className="absolute cursor-pointer group"
            style={{ left: p.x || `${15 + (i * 20) % 70}%`, top: p.y || `${20 + (i * 15) % 60}%` }}
          >
            <div className={`p-2 rounded-full ${colorForStatus(p.status)} text-white shadow-lg ring-4 ring-white/20 ${isSimulating ? 'animate-bounce' : 'animate-pulse'}`}>
              <Building2 size={16} />
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 hidden group-hover:block z-50">
              <div className="bg-secondary-900 text-white text-xs py-2 px-3 rounded-lg whitespace-nowrap shadow-2xl border border-white/10">
                <p className="font-bold">{p.name}</p>
                <p className="text-[10px] text-white/60">{p.status} {p.district ? `• ${p.district}` : ''}</p>
              </div>
              <div className="w-2 h-2 bg-secondary-900 rotate-45 mx-auto -mt-1 border-r border-b border-white/10" />
            </div>
          </motion.div>
        ))}

        {/* Floating Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div 
              initial={{ x: -400 }}
              animate={{ x: 0 }}
              exit={{ x: -400 }}
              className="absolute left-6 top-24 bottom-32 w-80 bg-white/90 dark:bg-secondary-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-secondary-200/50 p-6 z-20 overflow-y-auto"
            >
              <h3 className="text-xs font-bold text-secondary-400 uppercase tracking-widest mb-6">Map Layer Controls</h3>
              <div className="space-y-4">
                {staticLayers.map((layer) => (
                  <div key={layer.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary-50 dark:hover:bg-secondary-800/50 transition-colors cursor-pointer" onClick={() => toggleLayer(layer.id)}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeLayers.includes(layer.id) ? 'bg-primary-500 text-white' : 'bg-secondary-100 dark:bg-secondary-800 text-secondary-400'}`}>
                        {activeLayers.includes(layer.id) ? <Eye size={16} /> : <EyeOff size={16} />}
                      </div>
                      <span className={`text-sm font-bold ${activeLayers.includes(layer.id) ? 'text-secondary-900 dark:text-white' : 'text-secondary-500'}`}>{layer.name}</span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${layer.color.replace('text-', 'bg-')}`}></div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-secondary-100 dark:border-secondary-800">
                <h3 className="text-xs font-bold text-secondary-400 uppercase tracking-widest mb-4">Selected Asset</h3>
                {selectedProject ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                      <h4 className="font-bold text-sm text-secondary-900 dark:text-white mb-1">{selectedProject.name}</h4>
                      <p className="text-xs text-secondary-500 mb-2">{selectedProject.status}</p>
                      {selectedProject.district && (
                        <p className="text-xs text-secondary-400">District: <span className="font-semibold">{selectedProject.district}</span></p>
                      )}
                      {selectedProject.price != null && (
                        <p className="text-xs text-secondary-400 mt-1">Price: <span className="font-semibold">${Number(selectedProject.price).toLocaleString()}</span></p>
                      )}
                      {selectedProject.count != null && (
                        <p className="text-xs text-secondary-400 mt-1">Units: <span className="font-semibold">{selectedProject.count}</span></p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center border-2 border-dashed border-secondary-200 dark:border-secondary-800 rounded-2xl">
                    <MousePointer2 className="mx-auto text-secondary-300 mb-2" size={24} />
                    <p className="text-xs text-secondary-400">Click a marker on the map to view details.</p>
                  </div>
                )}

                {/* DB summary */}
                {gisData && (
                  <div className="mt-6 pt-6 border-t border-secondary-100 dark:border-secondary-800">
                    <h3 className="text-xs font-bold text-secondary-400 uppercase tracking-widest mb-3">Database Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-secondary-500">Total Records</span>
                        <span className="font-bold text-secondary-900 dark:text-white">{gisData.total ?? 0}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-secondary-500">With Coordinates</span>
                        <span className="font-bold text-secondary-900 dark:text-white">{gisData.mapPoints?.length ?? 0}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-secondary-500">Districts</span>
                        <span className="font-bold text-secondary-900 dark:text-white">{Object.keys(gisData.byDistrict || {}).length}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Timeline Overlay */}
        <div className="absolute bottom-6 left-6 right-6 z-30 pointer-events-none">
           <div className="max-w-4xl mx-auto card p-6 bg-white/90 dark:bg-secondary-900/90 backdrop-blur-md shadow-2xl border-secondary-200/50 pointer-events-auto">
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-3 shrink-0">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-lg">
                       <Clock size={18} />
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Temporal Analysis</p>
                       <p className="text-sm font-black text-primary-600">{timelineValue}</p>
                    </div>
                 </div>
                 <div className="flex-1 relative flex items-center">
                    <input 
                      type="range" 
                      min="2020" 
                      max="2030" 
                      step="1" 
                      value={timelineValue}
                      onChange={(e) => setTimelineValue(parseInt(e.target.value))}
                      className="w-full h-2 bg-secondary-100 dark:bg-secondary-800 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                    <div className="absolute top-6 left-0 right-0 flex justify-between text-[10px] font-bold text-secondary-400">
                       <span>2020</span>
                       <span>2022</span>
                       <span>2024</span>
                       <span>2026</span>
                       <span>2028</span>
                       <span>2030</span>
                    </div>
                 </div>
                 <button 
                  onClick={handleSimulate}
                  disabled={isSimulating}
                  className={`px-6 py-2 rounded-full font-bold text-xs transition-all ${isSimulating ? 'bg-secondary-400 text-white cursor-not-allowed' : 'bg-secondary-900 dark:bg-white dark:text-secondary-900 text-white hover:opacity-90'}`}
                 >
                   {isSimulating ? 'Simulating...' : 'Simulate Growth'}
                 </button>
              </div>
           </div>
        </div>

        {/* Interaction HUD Overlay */}
        <div className="absolute top-24 right-6 space-y-3 z-20">
           {[
             { icon: MapIcon, label: '3D View' },
             { icon: Activity, label: 'Live Traffic' },
             { icon: Settings2, label: 'GIS Settings' },
           ].map((tool, i) => (
             <button 
              key={i}
              className="flex items-center justify-center p-3 bg-white/90 dark:bg-secondary-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-secondary-200/50 text-secondary-600 hover:text-primary-600 transition-all hover:scale-110 active:scale-95"
              title={tool.label}
             >
               <tool.icon size={20} />
             </button>
           ))}
        </div>
      </div>
    </div>
  );
};

export default GISVisualization;
