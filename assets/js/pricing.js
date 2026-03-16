/**
 * pricing.js — Pricing Plans Logic
 * ─────────────────────────────────────────────
 * Fetches pricing plans from Supabase and renders them.
 */

document.addEventListener("DOMContentLoaded", async () => {
    const pricingContainer = document.getElementById('pricingContainer');
    if (!pricingContainer) return;

    // Use existing Supabase client if available, otherwise init
    let sb;
    if (window.supabase && typeof window.supabase.createClient === 'function') {
        sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    } else {
        console.error('Supabase SDK not loaded');
        return;
    }

    async function fetchPlans() {
        try {
            const { data, error } = await sb
                .from('pricing_plans')
                .select('*')
                .eq('is_active', true)
                .order('order_num', { ascending: true });

            if (error) throw error;
            renderPlans(data);
        } catch (err) {
            console.error('Error fetching pricing plans:', err);
            pricingContainer.innerHTML = '<p class="text-center">حدث خطأ أثناء تحميل الباقات.</p>';
        }
    }

    function renderPlans(plans) {
        pricingContainer.innerHTML = '';

        plans.forEach(plan => {
            const card = document.createElement('div');
            card.className = `pricing-card ${plan.is_popular ? 'popular' : ''}`;
            
            const features = Array.isArray(plan.features) ? plan.features : [];
            const featuresHtml = features.map(f => `<li><i class="ph ph-check"></i> ${f}</li>`).join('');

            card.innerHTML = `
                ${plan.is_popular ? '<div class="popular-badge">الأكثر طلباً</div>' : ''}
                <div class="pricing-header">
                    <h3 class="plan-title">${plan.title}</h3>
                    <p class="plan-subtitle">${plan.subtitle || ''}</p>
                    <div class="plan-price">
                        <span class="currency">${plan.currency || 'ر.س'}</span>
                        <span class="amount">${plan.price}</span>
                        <span class="cycle">/ ${plan.billing_cycle || 'شهرياً'}</span>
                    </div>
                </div>
                <ul class="plan-features">
                    ${featuresHtml}
                </ul>
                <div class="pricing-footer">
                    <button class="btn-primary buy-btn" data-plan-id="${plan.id}">اطلب الآن</button>
                </div>
            `;

            // Attach click event
            const buyBtn = card.querySelector('.buy-btn');
            buyBtn.addEventListener('click', () => {
                if (window.PaymentHandler) {
                    window.PaymentHandler.initPayment(plan);
                } else {
                    console.error('PaymentHandler not found');
                }
            });

            pricingContainer.appendChild(card);
        });
    }

    await fetchPlans();
});
