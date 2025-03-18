import { createRouter, createWebHistory } from 'vue-router';
import AuthView from './views/AuthView.vue';
import AnalysisView from './views/AnalysisView.vue';
import { supabase } from './supabase';

const routes = [
  { path: '/', component: AuthView, meta: { requiresAuth: false } },
  { path: '/analysis', component: AnalysisView, meta: { requiresAuth: true } }
];

export const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const { data } = await supabase.auth.getSession();
  const isLoggedIn = !!data.session;
  
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/');
  } else if (to.path === '/' && isLoggedIn) {
    next('/analysis');
  } else {
    next();
  }
});
