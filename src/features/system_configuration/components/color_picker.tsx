import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ColorPickerProps {
  color: string;
  onChange: (hex: string) => void;
  showPalette?: boolean;
  onTogglePalette?: () => void;
}

export const PRESET_COLORS = [
  '#2563EB', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
];

// HSV <-> HEX Conversion Helpers
function hexToHsv(hex: string): { h: number; s: number; v: number } {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  if (clean.length !== 6) return { h: 217, s: 84, v: 92 };

  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : Math.round((delta / max) * 100);
  const v = Math.round(max * 100);

  return { h, s, v };
}

function hsvToHex(h: number, s: number, v: number): string {
  const sat = s / 100;
  const val = v / 100;
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return val - val * sat * Math.max(Math.min(k, 4 - k, 1), 0);
  };
  const r = Math.round(f(5) * 255);
  const g = Math.round(f(3) * 255);
  const b = Math.round(f(1) * 255);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

export default function ColorPicker({
  color,
  onChange,
  showPalette = true,
  onTogglePalette,
}: ColorPickerProps) {
  const [hsv, setHsv] = useState(() => hexToHsv(color));
  const [inputHex, setInputHex] = useState(() => color.replace('#', '').toUpperCase());

  const paletteRef = useRef<HTMLDivElement>(null);
  const hueSliderRef = useRef<HTMLDivElement>(null);
  const isDraggingPalette = useRef(false);
  const isDraggingHue = useRef(false);

  // Sync external color changes
  useEffect(() => {
    const formatted = color.replace('#', '').toUpperCase();
    if (formatted !== inputHex) {
      setInputHex(formatted);
      setHsv(hexToHsv(color));
    }
  }, [color]);

  // Handle Palette 2D dragging (Saturation & Value)
  const updateSaturationValue = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!paletteRef.current) return;
      const rect = paletteRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const y = Math.max(0, Math.min(clientY - rect.top, rect.height));

      const newS = Math.round((x / rect.width) * 100);
      const newV = Math.round((1 - y / rect.height) * 100);

      const nextHsv = { ...hsv, s: newS, v: newV };
      setHsv(nextHsv);
      const newHex = hsvToHex(nextHsv.h, nextHsv.s, nextHsv.v);
      setInputHex(newHex.replace('#', ''));
      onChange(newHex);
    },
    [hsv, onChange]
  );

  // Handle Hue Slider dragging
  const updateHue = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!hueSliderRef.current) return;
      const rect = hueSliderRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;

      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const newH = Math.round((x / rect.width) * 360) % 360;

      const nextHsv = { ...hsv, h: newH };
      setHsv(nextHsv);
      const newHex = hsvToHex(nextHsv.h, nextHsv.s, nextHsv.v);
      setInputHex(newHex.replace('#', ''));
      onChange(newHex);
    },
    [hsv, onChange]
  );

  // Mouse / Touch listeners for smooth dragging
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (isDraggingPalette.current) {
        updateSaturationValue(e);
      } else if (isDraggingHue.current) {
        updateHue(e);
      }
    };

    const handleUp = () => {
      isDraggingPalette.current = false;
      isDraggingHue.current = false;
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [updateSaturationValue, updateHue]);

  // Handle text input for hex
  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6).toUpperCase();
    setInputHex(val);
    if (val.length === 6 || val.length === 3) {
      const fullHex = `#${val}`;
      setHsv(hexToHsv(fullHex));
      onChange(fullHex);
    }
  };

  const handlePresetSelect = (preset: string) => {
    const clean = preset.replace('#', '').toUpperCase();
    setInputHex(clean);
    setHsv(hexToHsv(preset));
    onChange(preset);
  };

  const normalizedCurrentHex = `#${inputHex}`.toUpperCase();

  return (
    <div className="space-y-2 w-full max-w-full overflow-hidden">
      {/* Top Swatch + Hex Input Row */}
      <div className="flex items-center gap-2.5 w-full">
        {/* Color Swatch */}
        <button
          type="button"
          onClick={onTogglePalette}
          className="w-9 h-9 rounded-lg shadow-2xs border border-slate-200 shrink-0 transition-transform cursor-pointer p-0"
          style={{ backgroundColor: normalizedCurrentHex }}
          title="Click to toggle color picker"
        />

        {/* Hex Input */}
        <div className="flex-1 flex items-center border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <span className="text-slate-400 font-medium text-[13.5px] mr-2 select-none">
            #
          </span>
          <input
            type="text"
            value={inputHex}
            onChange={handleHexInputChange}
            placeholder="2563EB"
            maxLength={6}
            className="w-full bg-transparent border-none outline-none text-[13.5px] font-mono font-medium text-slate-800 uppercase tracking-wide"
          />
        </div>
      </div>

      {/* Expanded Palette Card */}
      {showPalette && (
        <div className="border border-slate-200/90 bg-[#F8FAFC]/80 rounded-xl p-3 space-y-2.5 w-full box-border overflow-hidden">
          {/* 2D Saturation / Value Gradient Box */}
          <div
            ref={paletteRef}
            onMouseDown={(e) => {
              isDraggingPalette.current = true;
              updateSaturationValue(e.nativeEvent);
            }}
            onTouchStart={(e) => {
              isDraggingPalette.current = true;
              updateSaturationValue(e.nativeEvent);
            }}
            className="h-[85px] sm:h-[95px] w-full rounded-lg relative overflow-hidden cursor-crosshair select-none shadow-2xs border border-slate-200/50 box-border"
            style={{
              backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
            }}
          >
            {/* Horizontal gradient: White to transparent */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to right, #FFFFFF, transparent)',
              }}
            />
            {/* Vertical gradient: Transparent to Black */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to top, #000000, transparent)',
              }}
            />

            {/* Circular Handle / Thumb */}
            <div
              className="w-5 h-5 rounded-full border-2 border-white shadow-md pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
              style={{
                left: `${hsv.s}%`,
                top: `${100 - hsv.v}%`,
              }}
            />
          </div>

          {/* Rainbow Hue Slider Strip */}
          <div
            ref={hueSliderRef}
            onMouseDown={(e) => {
              isDraggingHue.current = true;
              updateHue(e.nativeEvent);
            }}
            onTouchStart={(e) => {
              isDraggingHue.current = true;
              updateHue(e.nativeEvent);
            }}
            className="h-2 w-full rounded-full relative cursor-pointer select-none shadow-2xs box-border"
            style={{
              background:
                'linear-gradient(to right, #FF0000 0%, #FFFF00 17%, #00FF00 33%, #00FFFF 50%, #0000FF 67%, #FF00FF 83%, #FF0000 100%)',
            }}
          >
            {/* Slider Handle */}
            <div
              className="w-4 h-4 rounded-full border-2 border-white shadow-md bg-white absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none"
              style={{
                left: `${(hsv.h / 360) * 100}%`,
              }}
            />
          </div>

          {/* Presets Row + Hex Tag */}
          <div className="flex items-center justify-between pt-0.5 w-full">
            {/* Preset Swatches */}
            <div className="flex items-center gap-1.5 overflow-x-hidden">
              {PRESET_COLORS.map((preset) => {
                const isSelected =
                  normalizedCurrentHex.toLowerCase() === preset.toLowerCase();
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={`w-6 h-6 rounded-lg transition-all cursor-pointer border-none p-0 shrink-0 ${
                      isSelected
                        ? 'ring-2 ring-offset-2 ring-[#2563EB] scale-105'
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: preset }}
                    title={preset}
                  />
                );
              })}
            </div>

            {/* Hex Display Tag */}
            <div className="border border-slate-200 rounded-md px-2 py-0.5 text-[11px] font-mono font-medium text-slate-600 bg-white shadow-2xs shrink-0">
              {normalizedCurrentHex}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
