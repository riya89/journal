import { useState } from "react";
import LiquidEffect from "../components/LiquidEffect";

/**
 * Demo page to showcase the LiquidEffect component
 * This page allows you to test different configurations
 */
export default function LiquidEffectDemo() {
  const [metalness, setMetalness] = useState(0.75);
  const [roughness, setRoughness] = useState(0.25);
  const [displacementScale, setDisplacementScale] = useState(5);
  const [enableRain, setEnableRain] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-900">
      {/* Liquid Effect Background */}
      <LiquidEffect
        metalness={metalness}
        roughness={roughness}
        displacementScale={displacementScale}
        enableRain={enableRain}
      />

      {/* Control Panel */}
      <div className="relative z-10 p-8 max-w-md mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6 space-y-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Liquid Effect Demo
          </h1>

          {/* Metalness Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metalness: {metalness.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={metalness}
              onChange={(e) => setMetalness(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Roughness Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Roughness: {roughness.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={roughness}
              onChange={(e) => setRoughness(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Displacement Scale Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Displacement: {displacementScale}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={displacementScale}
              onChange={(e) => setDisplacementScale(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Rain Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="rain"
              checked={enableRain}
              onChange={(e) => setEnableRain(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="rain" className="text-sm font-medium text-gray-700">
              Enable Rain Effect
            </label>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              Move your mouse around to interact with the liquid effect!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
