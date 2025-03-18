<template>
  <div class="min-h-screen flex items-center justify-center px-4 bg-gray-50">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
      <div>
        <h1 class="text-3xl font-bold text-center text-gray-900">AI Market Analyst</h1>
      </div>

      <div class="space-y-6">
        <h2 class="text-2xl font-semibold text-center text-gray-800">
          {{ isLogin ? 'Login' : 'Sign Up' }}
        </h2>
        
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              v-model="email"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              v-model="password"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
            />
          </div>
        </div>

        <button
          @click="handleAuth"
          :disabled="loading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm 
            text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none 
            focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 
            disabled:cursor-not-allowed transition-colors">
          {{ loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up') }}
        </button>

        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>

        <div v-if="successMessage" class="rounded-md bg-green-50 p-4">
          <p class="text-sm text-green-700">{{ successMessage }}</p>
        </div>

        <p class="text-center text-sm text-gray-600">
          {{ isLogin ? 'Need an account?' : 'Already have an account?' }}
          <a
            href="#"
            @click.prevent="toggleAuthMode"
            class="font-medium text-blue-600 hover:text-blue-500">
            {{ isLogin ? 'Sign Up' : 'Login' }}
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase';

const router = useRouter();
const isLogin = ref(true);
const email = ref('');
const password = ref('');
const error = ref('');
const successMessage = ref('');
const loading = ref(false);

const toggleAuthMode = () => {
  isLogin.value = !isLogin.value;
  error.value = '';
  successMessage.value = '';
};

const handleAuth = async () => {
  if (!email.value || !password.value) {
    error.value = 'Email and password are required';
    return;
  }
  
  loading.value = true;
  error.value = '';
  successMessage.value = '';
  
  try {
    if (isLogin.value) {
      // Login
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value
      });
      
      if (authError) throw authError;
      
      console.log('Login successful:', data.user.email);
      router.push('/notes');
    } else {
      // Sign up
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.value,
        password: password.value
      });
      
      if (authError) throw authError;
      
      if (data.user && !data.session) {
        successMessage.value = 'Registration successful! Check your email for the confirmation link.';
        // Don't redirect since we need email confirmation
      } else {
        console.log('Sign up and auto-login successful');
        router.push('/notes');
      }
    }
  } catch (err) {
    console.error('Authentication error:', err);
    error.value = err.message || 'Authentication failed';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: white;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

label {
  font-size: 14px;
  font-weight: bold;
}

input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

button {
  padding: 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  color: #f44336;
  font-size: 14px;
}

.success-message {
  color: #4CAF50;
  font-size: 14px;
}

.toggle-auth {
  text-align: center;
  font-size: 14px;
  margin-top: 10px;
}

a {
  color: #2196F3;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
