import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Lädt Umgebungsvariablen aus .env Dateien (falls vorhanden)
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    // WICHTIG für GitHub Pages: './' sorgt dafür, dass Pfade relativ sind 
    // (funktioniert egal ob die App unter / oder /portoiq/ läuft)
    base: './', 
    server: {
      port: 5201,
    },
    define: {
      // WICHTIG: Damit 'process.env.API_KEY' im Browser-Code funktioniert (wie vom Code gefordert),
      // ersetzen wir es hier beim Build durch den tatsächlichen Wert oder undefined.
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Verhindert "process is not defined" Fehler im Browser
      'process.env': {}
    }
  };
});