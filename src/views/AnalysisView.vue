<template>
  <div class="max-w-6xl mx-auto px-4 py-6">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Analysis Request Panel -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-slate-800 mb-4">Ask AI Advisor</h2>
          
          <div class="space-y-4">
            <div class="flex gap-4">
              <select v-model="analysisType" class="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg">
                <option value="stock">Stock Analysis</option>
                <option value="crypto">Crypto Analysis</option>
              </select>
              <input v-model="symbol" type="text" class="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg"
                :placeholder="analysisType === 'stock' ? 'Enter stock symbol (e.g., AAPL)' : 'Enter crypto symbol (e.g., BTC)'" />
            </div>

            <select v-model="queryType" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg">
              <option value="analysis">General Analysis</option>
              <option value="buy">Should I Buy?</option>
              <option value="sell">Should I Sell?</option>
              <option value="risks">Risk Assessment</option>
              <option value="trends">Market Trends</option>
            </select>

            <textarea v-model="additionalContext" rows="2" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg"
              placeholder="Any specific concerns or questions? (optional)"></textarea>
          </div>

          <button @click="requestAnalysis" :disabled="!isValidRequest || analyzing"
            class="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300
              transition-colors flex items-center justify-center space-x-2">
            <span v-if="analyzing" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
            <span>{{ analyzing ? 'Analyzing...' : 'Get AI Analysis' }}</span>
          </button>
        </div>

        <!-- Latest Analysis Result -->
        <div v-if="latestAnalysis" class="bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200 p-6 shadow-sm">
          <div class="flex justify-between items-start mb-4">
            <div>
              <span class="px-2 py-1 text-xs rounded-full" 
                :class="analysisType === 'stock' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'">
                {{ analysisType.toUpperCase() }}
              </span>
              <h3 class="text-xl font-semibold mt-2">{{ symbol.toUpperCase() }}</h3>
            </div>
            <span class="text-sm text-slate-500">{{ new Date().toLocaleString() }}</span>
          </div>
          
          <div class="prose prose-slate max-w-none">
            <div v-html="formattedAnalysis"></div>
          </div>
        </div>
      </div>

      <!-- Market Trends & Portfolio Panel -->
      <div class="space-y-6">
        <div class="bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-slate-800 mb-4">Market Trends</h2>
          <div v-if="marketTrends.length" class="space-y-3">
            <div v-for="trend in marketTrends" :key="trend.id"
              class="p-3 bg-white rounded-lg border border-slate-100">
              <div class="flex items-center space-x-2">
                <span :class="trend.type === 'up' ? 'text-green-500' : 'text-red-500'">
                  {{ trend.type === 'up' ? '↑' : '↓' }}
                </span>
                <span class="font-medium">{{ trend.symbol }}</span>
              </div>
              <p class="text-sm text-slate-600 mt-1">{{ trend.description }}</p>
            </div>
          </div>
          <div v-else class="text-center text-slate-500 py-4">
            No market trends available
          </div>
        </div>

        <div class="bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-slate-800 mb-4">Your Portfolio</h2>
          <!-- Portfolio items would go here -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { supabase } from '../supabase';
import axios from 'axios';
import { marked } from 'marked';

const analysisType = ref('stock');
const symbol = ref('');
const queryType = ref('analysis');
const additionalContext = ref('');
const analyzing = ref(false);
const latestAnalysis = ref('');
const marketTrends = ref([]);

const isValidRequest = computed(() => symbol.value.trim().length > 0);

const formattedAnalysis = computed(() => {
  return latestAnalysis.value ? marked(latestAnalysis.value) : '';
});

const generatePrompt = () => {
  const basePrompt = `As an AI financial advisor, provide a detailed ${queryType.value} for ${symbol.value.toUpperCase()} 
    ${analysisType.value}. ${additionalContext.value ? '\nContext: ' + additionalContext.value : ''}`;

  const promptExtensions = {
    analysis: '\nInclude: current market position, performance trends, and key factors affecting price.',
    buy: '\nAnalyze if this is a good buying opportunity. Consider: current price, market conditions, and potential risks.',
    sell: '\nEvaluate if selling is recommended. Consider: current gains/losses, market outlook, and alternative opportunities.',
    risks: '\nProvide a comprehensive risk assessment including: market risks, company/asset-specific risks, and external factors.',
    trends: '\nAnalyze current market trends, trading patterns, and potential future movements.'
  };

  return basePrompt + promptExtensions[queryType.value];
};

const requestAnalysis = async () => {
  if (!isValidRequest.value) return;
  
  analyzing.value = true;
  try {
    const response = await axios.post('https://api.mistral.ai/v1/chat/completions', {
      model: 'mistral-small',
      messages: [{ 
        role: 'user', 
        content: generatePrompt()
      }],
      temperature: 0.7,
      max_tokens: 1000
    }, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_MISTRAL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    latestAnalysis.value = response.data.choices[0].message.content;
    
    // Save analysis to database
    await saveAnalysis(latestAnalysis.value);
    
  } catch (err) {
    console.error('Analysis error:', err);
    alert('Failed to generate analysis. Please try again.');
  } finally {
    analyzing.value = false;
  }
};

const saveAnalysis = async (analysis) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('market_analyses').insert({
    user_id: user.id,
    type: analysisType.value,
    symbol: symbol.value.toUpperCase(),
    query_type: queryType.value,
    context: additionalContext.value,
    analysis: analysis
  });
};

// Initialize with some sample market trends
marketTrends.value = [
  { id: 1, type: 'up', symbol: 'BTC', description: 'Bitcoin showing strong momentum' },
  { id: 2, type: 'down', symbol: 'TSLA', description: 'Tesla facing selling pressure' }
];
</script>

