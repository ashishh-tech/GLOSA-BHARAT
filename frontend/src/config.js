// GLOSA-BHARAT Frontend Config
// Automatically uses env vars in production, falls back to Cloud Run URLs

const CONFIG = {
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL ||
               'https://glosa-backend-xxxx-el.a.run.app',
  AI_URL: import.meta.env.VITE_AI_URL ||
          'https://glosa-ai-xxxx-el.a.run.app',
  ENV: import.meta.env.MODE || 'development'
};

export default CONFIG;
