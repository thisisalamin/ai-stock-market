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
          <h2 class="text-lg font-semibold text-slate-800 mb-4">Live Market Trends</h2>
          <div v-if="marketTrends?.length" class="space-y-3">
            <div v-for="trend in marketTrends" :key="trend.id"
              class="p-3 bg-white rounded-lg border border-slate-100">
              <div class="flex justify-between items-center">
                <div class="flex items-center space-x-2">
                  <span :class="trend.type === 'up' ? 'text-green-500' : 'text-red-500'">
                    {{ trend.type === 'up' ? '↑' : '↓' }}
                  </span>
                  <span class="font-medium">{{ trend.symbol }}</span>
                </div>
                <div class="text-right">
                  <div class="font-medium">${{ trend.price.toFixed(2) }}</div>
                  <div :class="trend.type === 'up' ? 'text-green-600' : 'text-red-600'" class="text-sm">
                    {{ trend.percentChange > 0 ? '+' : ''}}{{ trend.percentChange.toFixed(2) }}%
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center text-slate-500 py-4">
            Loading market data...
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
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { supabase } from '../supabase';
import axios from 'axios';
import { marked } from 'marked';
import { getQuote } from '../services/finnhubService';
import { connectWebSocket, subscribeToSymbol, unsubscribeFromSymbol, subscribe, closeConnection } from '../services/websocketService';

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

// Track multiple symbols for market trends
const trackedSymbols = ref(['AAPL', 'MSFT', 'GOOGL', 'AMZN']);
const updateInterval = ref(null);

// Fetch quote for a single symbol using service
const fetchQuote = async (symbol) => {
  if (!symbol) return null;
  
  try {
    const quote = await getQuote(symbol);
    
    if (quote && quote.c) {
      return {
        id: Date.now(),
        type: quote.d > 0 ? 'up' : 'down',
        symbol: symbol,
        description: `${quote.d > 0 ? 'Up' : 'Down'} ${Math.abs(quote.dp).toFixed(2)}% at $${quote.c}`,
        price: quote.c,
        lastClose: quote.pc,
        change: quote.d,
        percentChange: quote.dp
      };
    }
    return null;
  } catch (err) {
    console.error(`Error fetching quote for ${symbol}:`, err);
    return null;
  }
};

// Update all market trends
const updateMarketTrends = async () => {
  try {
    const quotes = await Promise.all(
      trackedSymbols.value.map(symbol => fetchQuote(symbol))
    );
    const validQuotes = quotes.filter(quote => quote !== null);
    if (validQuotes.length > 0) {
      marketTrends.value = validQuotes;
    }
  } catch (error) {
    console.error('Error updating market trends:', error);
  }
};

// Initialize WebSocket connection
onMounted(async () => {
  marketTrends.value = [];
  await updateMarketTrends(); // Initial load

  // Setup WebSocket
  connectWebSocket();
  const unsubscribe = subscribe((trade) => {
    const index = marketTrends.value.findIndex(t => t.symbol === trade.s);
    if (index !== -1) {
      const trend = marketTrends.value[index];
      marketTrends.value[index] = {
        ...trend,
        price: trade.p,
        type: trade.p > trend.price ? 'up' : 'down',
        change: trade.p - trend.lastClose,
        percentChange: ((trade.p - trend.lastClose) / trend.lastClose) * 100
      };
    }
  });

  // Subscribe to all tracked symbols
  trackedSymbols.value.forEach(symbol => {
    subscribeToSymbol(symbol);
  });

  // Cleanup
  onUnmounted(() => {
    trackedSymbols.value.forEach(symbol => {
      unsubscribeFromSymbol(symbol);
    });
    unsubscribe();
    closeConnection();
    if (updateInterval.value) {
      clearInterval(updateInterval.value);
    }
  });
});

// Watch for symbol changes
watch(symbol, () => {
  if (symbol.value) {
    fetchQuote();
  }
});
</script>

