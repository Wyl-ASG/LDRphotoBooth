import React, { useState } from 'react';
import { LAYOUT_DEFINITIONS } from '../utils/layoutsConfig';
import { LayoutGrid, X, Check, Edit3 } from 'lucide-react';

export const LayoutPickerModal = ({
  isOpen,
  onClose,
  selectedLayoutId,
  onSelectLayout,
  customTitle,
  onTitleChange,
  customDate,
  onDateChange,
}) => {
  const [activeTab, setActiveTab] = useState('all');

  if (!isOpen) return null;

  const filteredLayouts = LAYOUT_DEFINITIONS.filter((layout) => {
    if (activeTab === 'strip') return layout.type === 'strip';
    if (activeTab === '4R') return layout.type === '4R';
    if (activeTab === '4R-portrait') return layout.type === '4R-portrait';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border-4 border-pink-300 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-pink-400 px-6 py-4 flex items-center justify-between text-white border-b-4 border-pink-500">
          <div className="flex items-center gap-3">
            <LayoutGrid size={28} />
            <h3 className="text-2xl font-black brand-font tracking-wide">Choose Photo Layout</h3>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Category Filter & Custom Text */}
        <div className="p-6 bg-pink-50/50 border-b border-pink-100 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-pink-200">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'all' ? 'bg-pink-500 text-white shadow' : 'text-gray-600 hover:bg-pink-50'
                }`}
              >
                All Formats (12)
              </button>
              <button
                onClick={() => setActiveTab('strip')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'strip' ? 'bg-pink-500 text-white shadow' : 'text-gray-600 hover:bg-pink-50'
                }`}
              >
                2x6 Strips (A-D)
              </button>
              <button
                onClick={() => setActiveTab('4R')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === '4R' ? 'bg-pink-500 text-white shadow' : 'text-gray-600 hover:bg-pink-50'
                }`}
              >
                6x4 4R Landscape (E-J, L)
              </button>
              <button
                onClick={() => setActiveTab('4R-portrait')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === '4R-portrait' ? 'bg-pink-500 text-white shadow' : 'text-gray-600 hover:bg-pink-50'
                }`}
              >
                6x4 4R Portrait (K)
              </button>
            </div>
          </div>

          {/* Text customization controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-pink-200 shadow-sm">
            <div>
              <label className="text-xs font-black text-pink-600 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Edit3 size={14} /> Custom Title (Script Font)
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="e.g. Groom & Bride"
                className="w-full px-4 py-2 rounded-xl border-2 border-pink-100 outline-none text-gray-800 font-bold focus:border-pink-400"
              />
            </div>
            <div>
              <label className="text-xs font-black text-pink-600 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Edit3 size={14} /> Custom Date
              </label>
              <input
                type="text"
                value={customDate}
                onChange={(e) => onDateChange(e.target.value)}
                placeholder="e.g. 2026.08.12"
                className="w-full px-4 py-2 rounded-xl border-2 border-pink-100 outline-none text-gray-800 font-bold focus:border-pink-400"
              />
            </div>
          </div>
        </div>

        {/* Layout Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredLayouts.map((layout) => {
            const isSelected = layout.id === selectedLayoutId;
            return (
              <div
                key={layout.id}
                onClick={() => {
                  onSelectLayout(layout.id);
                  onClose();
                }}
                className={`group cursor-pointer rounded-2xl border-4 p-3 flex flex-col items-center transition-all ${
                  isSelected
                    ? 'border-pink-500 bg-pink-50/80 shadow-lg scale-[1.02]'
                    : 'border-gray-200 bg-white hover:border-pink-300 hover:shadow-md'
                }`}
              >
                {/* SVG Visual Diagram of the exact print sheet */}
                <div className="w-full h-56 bg-neutral-900 rounded-xl p-2 relative shadow-inner mb-3 flex items-center justify-center overflow-hidden border border-neutral-800">
                  <svg
                    viewBox={`0 0 ${layout.canvasWidth} ${layout.canvasHeight}`}
                    className="w-full h-full object-contain"
                  >
                    {/* Dark card background */}
                    <rect x="0" y="0" width={layout.canvasWidth} height={layout.canvasHeight} fill="#111111" />

                    {/* Photo Boxes */}
                    {layout.boxes.map((box, idx) => {
                      const bx = (box.x / 100) * layout.canvasWidth;
                      const by = (box.y / 100) * layout.canvasHeight;
                      const bw = (box.w / 100) * layout.canvasWidth;
                      const bh = (box.h / 100) * layout.canvasHeight;

                      const border = Math.max(4, Math.min(bw, bh) * 0.03);
                      const ix = bx + border;
                      const iy = by + border;
                      const iw = bw - border * 2;
                      const ih = bh - border * 2;
                      const halfW = iw / 2;

                      return (
                        <g key={idx}>
                          {/* Outer White Frame */}
                          <rect x={bx} y={by} width={bw} height={bh} fill="#ffffff" rx={Math.min(bw, bh) * 0.02} />

                          {/* Left Half (Person 1) - 0 gap */}
                          <rect x={ix} y={iy} width={halfW} height={ih} fill="#fce7f3" />

                          {/* Right Half (Person 2) - 0 gap */}
                          <rect x={ix + halfW} y={iy} width={halfW} height={ih} fill="#fbcfe8" />

                          {/* Divider line visual indicator */}
                          <line
                            x1={ix + halfW}
                            y1={iy}
                            x2={ix + halfW}
                            y2={iy + ih}
                            stroke="#f472b6"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                          />

                          {/* Mini avatars indication */}
                          <circle cx={ix + halfW / 2} cy={iy + ih / 2} r={Math.min(halfW, ih) * 0.22} fill="#ec4899" opacity="0.6" />
                          <circle cx={ix + halfW + halfW / 2} cy={iy + ih / 2} r={Math.min(halfW, ih) * 0.22} fill="#3b82f6" opacity="0.6" />
                        </g>
                      );
                    })}

                    {/* Text sections */}
                    {(layout.headers || []).concat(layout.footers || []).map((sec, idx) => {
                      const sx = (sec.x / 100) * layout.canvasWidth;
                      const sy = (sec.y / 100) * layout.canvasHeight;
                      const sw = (sec.w / 100) * layout.canvasWidth;
                      const sh = (sec.h / 100) * layout.canvasHeight;
                      return (
                        <g key={idx}>
                          <text
                            x={sx + sw / 2}
                            y={sy + sh / 2}
                            fill="#ffffff"
                            fontSize={Math.min(sw, sh) * 0.35}
                            fontFamily="cursive"
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            {customTitle || 'Groom & Bride'}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-pink-500 text-white rounded-full p-1.5 shadow">
                      <Check size={16} />
                    </div>
                  )}
                </div>

                <div className="w-full text-center">
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-black text-gray-800 text-lg">{layout.name}</span>
                    <span className="bg-pink-100 text-pink-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      {layout.poses} {layout.poses === 1 ? 'Pose' : 'Poses'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-bold">{layout.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
