import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Camera,
  Search,
  MapPin,
  Image as ImageIcon,
  Send,
  Upload,
  Layers,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface MultimodalStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MultimodalStudioModal: React.FC<MultimodalStudioModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'image_gen' | 'image_analysis' | 'search_grounding' | 'maps_grounding'>(
    'image_gen'
  );

  // Image Gen State
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Vision Analysis State
  const [selectedPhotoBase64, setSelectedPhotoBase64] = useState<string | null>(null);
  const [analysisPrompt, setAnalysisPrompt] = useState('Analyze this document/photo and extract all details, key text, and structural layout.');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Grounding State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const [mapsQuery, setMapsQuery] = useState('');
  const [mapsResult, setMapsResult] = useState<string | null>(null);
  const [isMapping, setIsMapping] = useState(false);

  if (!isOpen) return null;

  // Handlers
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim() || isGeneratingImage) return;
    setIsGeneratingImage(true);
    try {
      const res = await fetch('/api/agent/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          size: imageSize,
          modelPreference: 'gemini-3-pro-image-preview',
        }),
      });
      const data = await res.json();
      if (data.imageUrl) setGeneratedImage(data.imageUrl);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      setSelectedPhotoBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzePhoto = async () => {
    if (!selectedPhotoBase64 || isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/agent/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Data: selectedPhotoBase64,
          mimeType: 'image/jpeg',
          prompt: analysisPrompt,
        }),
      });
      const data = await res.json();
      setAnalysisResult(data.analysis || 'Analysis complete.');
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSearchGrounding = async () => {
    if (!searchQuery.trim() || isSearching) return;
    setIsSearching(true);
    try {
      const res = await fetch('/api/agent/grounding/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      setSearchResult(data.result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleMapsGrounding = async () => {
    if (!mapsQuery.trim() || isMapping) return;
    setIsMapping(true);
    try {
      const res = await fetch('/api/agent/grounding/maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: mapsQuery }),
      });
      const data = await res.json();
      setMapsResult(data.result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsMapping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Multimodal Intelligence & Grounding Studio</h2>
              <p className="text-xs text-slate-400">High-Resolution Image Generation, Vision Analysis, & Real-time Grounding</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/20 overflow-x-auto">
          <button
            onClick={() => setActiveTab('image_gen')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 shrink-0 ${
              activeTab === 'image_gen'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Image Generation (1K/2K/4K)</span>
          </button>

          <button
            onClick={() => setActiveTab('image_analysis')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 shrink-0 ${
              activeTab === 'image_analysis'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Image Understanding</span>
          </button>

          <button
            onClick={() => setActiveTab('search_grounding')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 shrink-0 ${
              activeTab === 'search_grounding'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Google Search Grounding</span>
          </button>

          <button
            onClick={() => setActiveTab('maps_grounding')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 shrink-0 ${
              activeTab === 'maps_grounding'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Google Maps Grounding</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 1. Image Generation Tab */}
          {activeTab === 'image_gen' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Image Prompt (using gemini-3-pro-image-preview)
                </label>
                <textarea
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="e.g. Futuristic holographic AI employee workspace with sleek glass interfaces and floating data streams..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 outline-none focus:border-cyan-500"
                />
              </div>

              {/* Resolution Affordance (1K, 2K, 4K) as mandated by prompt */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Resolution Affordance
                </label>
                <div className="flex gap-3">
                  {(['1K', '2K', '4K'] as const).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setImageSize(sz)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex-1 border ${
                        imageSize === sz
                          ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {sz} Ultra Quality
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerateImage}
                disabled={!imagePrompt.trim() || isGeneratingImage}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {isGeneratingImage ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>Generate High-Resolution Asset</span>
              </button>

              {generatedImage && (
                <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center">
                  <span className="text-xs font-semibold text-cyan-400 mb-2">Generated Asset ({imageSize})</span>
                  <img
                    src={generatedImage}
                    alt="Generated"
                    className="max-h-72 rounded-xl object-contain border border-slate-800 shadow-xl"
                  />
                </div>
              )}
            </div>
          )}

          {/* 2. Image Analysis Tab */}
          {activeTab === 'image_analysis' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Upload Photo/Document for Analysis (gemini-3.1-pro-preview)
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition flex items-center gap-2">
                    <Upload className="w-4 h-4 text-cyan-400" />
                    <span>Choose File</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                  {selectedPhotoBase64 && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Photo Loaded</span>
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Analysis Prompt</label>
                <input
                  type="text"
                  value={analysisPrompt}
                  onChange={(e) => setAnalysisPrompt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                />
              </div>

              <button
                onClick={handleAnalyzePhoto}
                disabled={!selectedPhotoBase64 || isAnalyzing}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {isAnalyzing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
                <span>Analyze with Gemini Pro</span>
              </button>

              {analysisResult && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  <span className="font-semibold text-cyan-400 block mb-1">Visual Insights:</span>
                  {analysisResult}
                </div>
              )}
            </div>
          )}

          {/* 3. Search Grounding Tab */}
          {activeTab === 'search_grounding' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Search Grounding Query (gemini-3.5-flash with googleSearch)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. Current top biotechnology startups in Munich 2026..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={handleSearchGrounding}
                    disabled={!searchQuery.trim() || isSearching}
                    className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition flex items-center gap-2 disabled:opacity-40"
                  >
                    {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    <span>Ground Search</span>
                  </button>
                </div>
              </div>

              {searchResult && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  <span className="font-semibold text-cyan-400 block mb-1">Google Grounded Insights:</span>
                  {searchResult}
                </div>
              )}
            </div>
          )}

          {/* 4. Maps Grounding Tab */}
          {activeTab === 'maps_grounding' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Maps Grounding Location (gemini-3.5-flash with googleMaps)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={mapsQuery}
                    onChange={(e) => setMapsQuery(e.target.value)}
                    placeholder="e.g. Max Planck Institute of Biochemistry Martinsried..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={handleMapsGrounding}
                    disabled={!mapsQuery.trim() || isMapping}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center gap-2 disabled:opacity-40"
                  >
                    {isMapping ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                    <span>Ground Location</span>
                  </button>
                </div>
              </div>

              {mapsResult && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  <span className="font-semibold text-emerald-400 block mb-1">Google Maps Grounded Info:</span>
                  {mapsResult}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
