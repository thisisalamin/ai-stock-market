<template>
  <div class="min-h-screen bg-slate-50">
    <div v-if="dbError" class="max-w-3xl mx-auto p-6 mt-8 bg-amber-50/50 border border-amber-200 rounded-xl backdrop-blur-sm">
      <h3 class="text-xl font-semibold text-yellow-800 mb-3">Database Setup Required</h3>
      <p class="text-yellow-700 mb-4">{{ dbError }}</p>
      <div class="space-y-4">
        <h4 class="font-medium text-yellow-800">Follow these steps to set up your Supabase database:</h4>
        <ol class="list-decimal ml-5 space-y-2 text-yellow-700">
          <li>Go to <a href="https://app.supabase.io" target="_blank" class="text-yellow-600 underline">your Supabase project dashboard</a></li>
          <li>Open the SQL Editor (left sidebar)</li>
          <li>Copy and run the following SQL commands:</li>
        </ol>
        <pre class="bg-white p-4 rounded-md border border-yellow-200 overflow-x-auto"><code>{{ sqlInstructions }}</code></pre>
        <button @click="checkDatabaseAgain" 
          class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
          {{ checkingDb ? 'Checking...' : "I've completed setup - Check again" }}
        </button>
      </div>
    </div>

    <div v-else-if="!loading" class="min-h-screen">
      <div v-if="!session" class="min-h-screen flex items-center justify-center p-4">
        <div class="max-w-md w-full bg-white/50 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-slate-200">
          <div class="text-center space-y-3">
            <h1 class="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">AI-Powered Stock Market & Crypto Analyst</h1>
            <p class="text-slate-500">Sign in to access your data</p>
          </div>
          <button @click="signInWithGoogle" 
            :disabled="loggingIn"
            class="mt-6 w-full flex items-center justify-center px-4 py-2.5 border border-slate-200 
              rounded-lg text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-all
              duration-200 hover:shadow focus:outline-none focus:ring-2 focus:ring-slate-200">
            <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {{ loggingIn ? 'Signing in...' : 'Sign in with Google' }}
          </button>
        </div>
      </div>
      
      <div v-else>
        <header class="bg-white/50 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-14 items-center">
              <h1 class="text-lg font-semibold text-slate-700">AI Market Analyst</h1>
              <button @click="handleLogout" 
                class="px-4 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 
                  shadow-sm transition-all duration-200">
                Sign Out
              </button>
            </div>
          </div>
        </header>
        <router-view />
      </div>
    </div>

    <div v-else class="min-h-screen flex items-center justify-center">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-slate-800 border-t-transparent"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from './supabase';
import { useRouter } from 'vue-router';
import { initializeDatabase, SQL_SETUP_INSTRUCTIONS } from './utils/initSupabase';

const router = useRouter();
const loading = ref(true);
const dbError = ref(null);
const sqlInstructions = ref(SQL_SETUP_INSTRUCTIONS);
const checkingDb = ref(false);
const session = ref(null);
const loggingIn = ref(false);

const checkDatabaseAgain = async () => {
  checkingDb.value = true;
  dbError.value = null;
  
  try {
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      dbError.value = "There was an issue connecting to the database. Please ensure your Supabase project is set up correctly.";
    } else {
      // Refresh the page to restart the app with the database ready
      window.location.reload();
    }
  } catch (error) {
    console.error("Error checking database:", error);
    dbError.value = "An unexpected error occurred when checking database connection.";
  } finally {
    checkingDb.value = false;
  }
};

const signInWithGoogle = async () => {
  try {
    loggingIn.value = true;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    
    if (error) {
      console.error("Google login error:", error);
      alert("Failed to sign in with Google. Please try again.");
    }
  } catch (error) {
    console.error("Unexpected error during Google login:", error);
    alert("An unexpected error occurred. Please try again.");
  } finally {
    loggingIn.value = false;
  }
};

const handleLogout = async () => {
  try {
    await supabase.auth.signOut();
    // Router handling is done in the auth state change listener
  } catch (error) {
    console.error("Logout error:", error);
    alert("Failed to log out. Please try again.");
  }
};

onMounted(async () => {
  try {
    // Check authentication state
    const { data, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.error("Auth error:", authError);
    } else if (data?.session) {
      session.value = data.session;
    }

    // Try to initialize database
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      dbError.value = "Database tables not found. Please set up your Supabase project using the instructions below.";
    } else {
      console.log("Database initialized successfully");
    }
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("Auth state change:", event, currentSession);
      if (event === 'SIGNED_IN') {
        session.value = currentSession;
        router.push('/analysis');
      } else if (event === 'SIGNED_OUT') {
        session.value = null;
        router.push('/');
      }
    });
    
    // Cleanup function for the subscription
    window.addEventListener('beforeunload', () => {
      subscription.unsubscribe();
    });
  } catch (error) {
    console.error("Error during initialization:", error);
    dbError.value = "An unexpected error occurred during application initialization.";
  } finally {
    loading.value = false;
  }
});
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
}

h1, h2, h3, h4 {
  margin-bottom: 15px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 18px;
}

.db-error {
  max-width: 800px;
  margin: 50px auto;
  padding: 20px;
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 4px;
  color: #856404;
}

.db-error ol {
  margin-left: 20px;
  margin-bottom: 15px;
}

.setup-instructions pre {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  margin-bottom: 20px;
  border: 1px solid #ddd;
}

.setup-instructions code {
  font-family: monospace;
  white-space: pre-wrap;
}

.retry-button {
  padding: 10px 15px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.retry-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.login-container {
  max-width: 400px;
  margin: 100px auto;
  padding: 30px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.login-container h1 {
  margin-bottom: 20px;
  color: #333;
}

.login-container p {
  margin-bottom: 30px;
  color: #666;
}

.google-login-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 12px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.google-login-button:hover {
  background-color: #f5f5f5;
}

.google-login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.google-icon {
  width: 18px;
  height: 18px;
  margin-right: 10px;
}

.header-bar {
  display: flex;
  justify-content: flex-end;
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #ddd;
  margin-bottom: 20px;
}

.logout-button {
  display: flex;
  align-items: center;
  padding: 10px 18px;
  background: linear-gradient(135deg, #ff5f6d 0%, #ffc371 100%);
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(255, 95, 109, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.logout-button:before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: all 0.4s;
}

.logout-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(255, 95, 109, 0.4);
}

.logout-button:hover:before {
  left: 100%;
}

.logout-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 5px rgba(255, 95, 109, 0.3);
}

.logout-icon {
  font-style: normal;
  margin-right: 8px;
  font-size: 18px;
  transform: rotate(90deg);
}
</style>
