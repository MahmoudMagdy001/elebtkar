/**
 * payment-callback.js — Processes Moyasar Redirect
 * ─────────────────────────────────────────────
 * Extracts payment ID and status, matches with session data, and records to Supabase.
 */

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get('id');
    const status = params.get('status');
    const message = params.get('message');

    const loader = document.getElementById('mainLoader');
    const icon = document.getElementById('statusIcon');
    const title = document.getElementById('statusTitle');
    const msg = document.getElementById('statusMessage');
    const actions = document.getElementById('statusActions');

    if (!paymentId || !status) {
        showStatus('error', 'بيانات غير مكتملة', 'لم نتمكن من العثور على معلومات الدفع.');
        return;
    }

    if (status !== 'paid') {
        showStatus('error', 'فشلت عملية الدفع', message || 'حدث خطأ أثناء معالجة الدفع.');
        return;
    }

    // Status is 'paid', proceed to record in Supabase
    try {
        const customerData = JSON.parse(sessionStorage.getItem('pending_payment_customer'));
        const planData = JSON.parse(sessionStorage.getItem('pending_payment_plan'));

        if (!customerData || !planData) {
            // Fallback: we have the payment but lost session data
            console.warn('Session data lost for payment:', paymentId);
            await recordMinimalPayment(paymentId);
            showStatus('success', 'تم الدفع بنجاح!', 'شكراً لك! تم استلام دفعتك وسنتواصل معك قريباً.');
            return;
        }

        await recordFullPayment(paymentId, customerData, planData);
        showStatus('success', 'تمت العملية بنجاح!', `شكراً ${customerData.name}! تم الاشتراك في باقة ${planData.title}.`);
        
        // Clear session data
        sessionStorage.removeItem('pending_payment_customer');
        sessionStorage.removeItem('pending_payment_plan');

    } catch (err) {
        console.error('Callback processing failed:', err);
        showStatus('error', 'خطأ في التحديث', 'تم الدفع بنجاح ولكن فشل تحديث السجلات. لا تقلق، سنراجع العملية يدوياً.');
    }

    function showStatus(type, titleText, messageText) {
        loader.style.display = 'none';
        icon.style.display = 'block';
        actions.style.display = 'block';
        
        if (type === 'success') {
            icon.innerHTML = '<i class="ph-fill ph-check-circle status-success"></i>';
        } else {
            icon.innerHTML = '<i class="ph-fill ph-x-circle status-error"></i>';
        }
        
        title.textContent = titleText;
        msg.textContent = messageText;
    }

    async function recordFullPayment(id, customer, plan) {
        const { createClient } = supabase;
        const sb = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

        const { error } = await sb
            .from('purchases')
            .insert([{
                moyasar_payment_id: id,
                amount: plan.price,
                status: 'paid',
                plan_id: plan.id,
                user_name: customer.name,
                user_email: customer.email,
                user_phone: customer.phone,
                currency: 'SAR',
                metadata: { 
                    plan_name: plan.title,
                    source: 'Moyasar Redirect Callback'
                }
            }]);

        if (error) throw error;
    }

    async function recordMinimalPayment(id) {
        const { createClient } = supabase;
        const sb = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

        // Record with whatever info we have (just ID)
        await sb
            .from('purchases')
            .insert([{
                moyasar_payment_id: id,
                status: 'paid',
                user_email: 'unknown_after_redirect@elebtikar-sa.com',
                amount: 0, 
                metadata: { notes: 'Session data lost during redirect' }
            }]);
    }
});
