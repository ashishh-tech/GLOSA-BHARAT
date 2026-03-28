// GLOSA-BHARAT Frontend Config — Production URLs

const CONFIG = {
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL ||
               'https://glosa-backend-68595042977.asia-south1.run.app',
  AI_URL: import.meta.env.VITE_AI_URL ||
          'https://glosa-ai-68595042977.asia-south1.run.app',
  ENV: import.meta.env.MODE || 'development'
};

export default CONFIG;
