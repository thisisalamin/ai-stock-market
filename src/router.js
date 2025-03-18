import { createRouter, createWebHistory } from 'vue-router';
import AnalysisView from './views/AnalysisView.vue';
import { supabase } from './supabase';

const routes = [
  {
    path: '/',
    redirect: '/analysis' // Redirect root to analysis page
  },
  {
    path: '/analysis',
    name: 'analysis',
    component: AnalysisView,
    meta: { requiresAuth: true }
  }
];

export const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !session) {
    next('/');
  } else {
    next();
  }
});

export default router;
