import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';

// Create Vue app with error handling
const app = createApp(App);

// Global error handler
app.config.errorHandler = (error, vm, info) => {
  console.error('Vue Error:', error);
  console.error('Error Info:', info);
};

// Use the router
app.use(router);

// Mount the app to #app
app.mount('#app');

// Log environment check for development
if (import.meta.env.DEV) {
  console.log('Running in development mode');
  
  // Check if API keys are set
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.warn('⚠️ Supabase environment variables are missing or empty');
  }
  
  if (!import.meta.env.VITE_MISTRAL_API_KEY) {
    console.warn('⚠️ Mistral API key is missing or empty');
  }
}
