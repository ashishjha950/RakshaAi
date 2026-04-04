/**
 * MapHeatmapLayer.tsx — OpenStreetMap tile layer + threat heatmap overlay.
 *
 * Uses react-native-maps UrlTile for OSM tiles (no API key required).
 * Renders a Heatmap overlay from backend threat coordinate data.
 *
 * ⚠️ NOTE: react-native-maps Heatmap is only available on iOS and Android.
 * Web not supported (out of scope for this app).
 */
import React from 'react';
import { UrlTile, Heatmap } from 'react-native-maps';
import { OSM_TILE_URL } from '@/utils/constants';

export interface HeatmapPoint {
  latitude: number;
  longitude: number;
  weight?: number;
}

interface Props {
  heatmapPoints?: HeatmapPoint[];
}

export const MapHeatmapLayer: React.FC<Props> = ({ heatmapPoints = [] }) => (
  <>
    {/* OpenStreetMap tile layer — no API key required */}
    <UrlTile
      urlTemplate={OSM_TILE_URL.replace('{s}', 'a')}
      maximumZ={19}
      flipY={false}
      tileSize={256}
    />

    {/* Threat heatmap overlay */}
    {heatmapPoints.length > 0 && (
      <Heatmap
        points={heatmapPoints}
        opacity={0.7}
        radius={40}
        gradient={{
          colors: ['#FFA70000', '#FFA700', '#FF4500', '#DC143C'],
          startPoints: [0.1, 0.45, 0.75, 1.0],
          colorMapSize: 256,
        }}
      />
    )}
  </>
);
