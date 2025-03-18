<template>
  <div class="max-w-4xl mx-auto px-4 py-6">
    <div class="space-y-6">
      <!-- Analysis Request Form -->
      <div class="bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-slate-800 mb-3">Request Market Analysis</h2>
        <div class="space-y-4">
          <select v-model="analysisType" class="w-full px-3 py-2 text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200">
            <option value="stock">Stock Analysis</option>
            <option value="crypto">Crypto Analysis</option>
          </select>
          <input
            v-model="symbol"
            type="text"
            class="w-full px-3 py-2 text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200"
            :placeholder="analysisType === 'stock' ? 'Enter stock symbol (e.g., AAPL)' : 'Enter crypto symbol (e.g., BTC)'"
          />
          <textarea
            v-model="additionalContext"
            rows="2"
            class="w-full px-3 py-2 text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 resize-none"
            placeholder="Any specific aspects you want to analyze? (optional)"
          ></textarea>
        </div>
        <button
          @click="requestAnalysis"
          :disabled="!isValidRequest || saving"
          class="mt-3 px-4 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200 shadow-sm">
          {{ saving ? 'Analyzing...' : 'Analyze' }}
        </button>
      </div>

      <!-- Analysis List -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold text-slate-800">Your Analysis History</h2>
        
        <div v-if="loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-2 border-slate-800 border-t-transparent mx-auto"></div>
        </div>

        <div v-else-if="analyses.length === 0" 
          class="text-center py-12 bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200">
          <p class="text-slate-500">No analyses yet. Request your first analysis above!</p>
        </div>

        <div v-else class="space-y-4">
          <div v-for="analysis in analyses" 
            :key="analysis.id" 
            class="bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
            <div class="p-6">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <span class="inline-block px-2 py-1 text-xs rounded-md" 
                    :class="analysis.type === 'stock' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'">
                    {{ analysis.type.toUpperCase() }}
                  </span>
                  <h3 class="text-xl font-semibold mt-2">{{ analysis.symbol }}</h3>
                </div>
                <button
                  @click="deleteAnalysis(analysis.id)"
                  class="text-rose-600 hover:text-rose-700">
                  <span class="sr-only">Delete</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <p class="text-slate-600 mb-4">{{ analysis.context }}</p>
              
              <div class="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p class="text-slate-700 whitespace-pre-wrap">{{ analysis.analysis }}</p>
              </div>
              
              <div class="mt-4 text-sm text-slate-500">
                Analyzed on: {{ new Date(analysis.created_at).toLocaleString() }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase';
import axios from 'axios';

const router = useRouter();
const analysisType = ref('stock');
const symbol = ref('');
const additionalContext = ref('');
const analyses = ref([]);
const loading = ref(true);
const saving = ref(false);

const isValidRequest = computed(() => {
  return symbol.value.trim().length > 0;
});

const requestAnalysis = async () => {
  if (!isValidRequest.value) return;
  
  saving.value = true;
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw new Error('Authentication error: ' + userError.message);
    if (!userData.user) throw new Error("Not authenticated");
    
    const mistralApiKey = import.meta.env.VITE_MISTRAL_API_KEY;
    if (!mistralApiKey) throw new Error('Mistral API key not found');
    
    const prompt = `As a financial analyst, please provide a comprehensive analysis of ${symbol.value.toUpperCase()} ${analysisType.value === 'stock' ? 'stock' : 'cryptocurrency'}. 
    Include the following aspects:
    1. Current market position
    2. Recent performance trends
    3. Key factors affecting price
    4. Potential risks and opportunities
    ${additionalContext.value ? '\nAdditional context to consider: ' + additionalContext.value : ''}
    
    Please provide the analysis in a clear, structured format.`;
    
    const response = await axios.post('https://api.mistral.ai/v1/chat/completions', {
      model: 'mistral-small',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800, // Increased for more detailed analysis
      temperature: 0.7, // Added for more nuanced responses
    }, {
      headers: {
        'Authorization': `Bearer ${mistralApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const analysis = response.data.choices[0].message.content.trim();
    
    // Save to Supabase with error handling
    const { data, error } = await supabase
      .from('market_analyses')
      .insert([{
        type: analysisType.value,
        symbol: symbol.value.toUpperCase(),
        context: additionalContext.value || null, // Handle empty context
        analysis,
        user_id: userData.user.id
      }])
      .select();
      
    if (error) {
      console.error('Supabase error:', error);
      throw new Error('Failed to save analysis to database');
    }
    
    if (!data || data.length === 0) {
      throw new Error('No data returned from database');
    }
    
    analyses.value.unshift(data[0]);
    
    // Clear form
    symbol.value = '';
    additionalContext.value = '';
    
  } catch (err) {
    console.error('Error requesting analysis:', err);
    alert(`Failed to generate analysis: ${err.message || 'Unknown error'}`);
  } finally {
    saving.value = false;
  }
};

const loadAnalyses = async () => {
  loading.value = true;
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Not authenticated");
    
    const { data, error } = await supabase
      .from('market_analyses')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    analyses.value = data || [];
  } catch (err) {
    console.error('Error loading analyses:', err);
  } finally {
    loading.value = false;
  }
};

const deleteAnalysis = async (id) => {
  if (!confirm('Are you sure you want to delete this analysis?')) return;
  
  try {
    const { error } = await supabase
      .from('market_analyses')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    analyses.value = analyses.value.filter(a => a.id !== id);
  } catch (err) {
    console.error('Error deleting analysis:', err);
    alert('Failed to delete analysis. Please try again.');
  }
};

onMounted(loadAnalyses);
</script>

