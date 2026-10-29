import { createRouter, createWebHashHistory } from 'vue-router';

export const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
        {
            path: '/demo/:id',
            name: 'demo',
            component: () => import('../views/DemoView.vue'),
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'not-found',
            component: () => import('../views/NotFoundView.vue'),
        },
    ],
    scrollBehavior: () => ({ top: 0 }),
});

router.afterEach((to) => {
    if (to.name === 'demo') return;
    document.title = to.name === 'home' ? 'Vue Lab — Experiments' : 'Page not found — Vue Lab';
});
