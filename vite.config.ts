import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // WICHTIG für GitHub Pages: './' sorgt dafür, dass Pfade relativ sind
  // (funktioniert egal ob die App unter / oder /portoiq/ läuft)
  base: './',
  server: {
    port: 5201,
  },
});
