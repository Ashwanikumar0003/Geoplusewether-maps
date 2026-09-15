import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const weatherKey = env.VITE_WEATHER_API_KEY || process.env.VITE_WEATHER_API_KEY || 'ded2e9295eef42a58cf200357261409';
  const mapsKey = env.VITE_MAPS_API_KEY || process.env.VITE_MAPS_API_KEY || 'AIzaSyDcreY8qQrmwiLuikjBa8y1zDPO2GXF-4A';

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'import.meta.env.VITE_WEATHER_API_KEY': JSON.stringify(weatherKey),
      'import.meta.env.VITE_MAPS_API_KEY': JSON.stringify(mapsKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
