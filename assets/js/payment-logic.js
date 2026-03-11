/**
 * payment-logic.js — Moyasar Integration Logic
 * ─────────────────────────────────────────────
 * Handles Moyasar Form initialization and Supabase recording.
 */

window.PaymentHandler = {
    /**
     * Initialize Moyasar Form inside a modal
     * @param {Object} planData - { title, price, id }
     */
    async initPayment(planData) {
        if (!window.MOYASAR_PUBLISHABLE_KEY || window.MOYASAR_PUBLISHABLE_KEY === 'pk_test_...') {
            console.error('Moyasar Publishable Key is missing or default.');
            alert('خطأ في إعدادات الدفع. يرجى مراجعة المسؤول.');
            return;
        }

        const amountInHalalas = Math.round(planData.price * 100);

        // Show Modal
        const modal = document.getElementById('paymentModal');
        if (modal) modal.classList.add('active');

        // Note: Moyasar Form requires a container with class "mysr-form"
        Moyasar.init({
            element: '.mysr-form',
            amount: amountInHalalas,
            currency: 'SAR',
            description: `الاشتراك في باقة: ${planData.title}`,
            publishable_api_key: window.MOYASAR_PUBLISHABLE_KEY,
            callback_url: window.location.origin + '/pages/services/payment-callback.html',
            methods: ['creditcard', 'applepay', 'stcpay'],
            apple_pay: {
                label: 'الابتكار | Elebtkar',
                validate_merchant_url: 'https://api.moyasar.com/v1/applepay/initiate',
                country: 'SA'
            },
            on_completed: async (payment) => {
                await this.recordPayment(payment, planData);
            },
            on_failure: (error) => {
                console.error('Payment failed:', error);
                alert('فشلت عملية الدفع. يرجى المحاولة مرة أخرى.');
            }
        });
    },

    /**
     * Record payment details in Supabase
     */
    async recordPayment(payment, planData) {
        const { createClient } = supabase;
        const sb = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

        try {
            const { error } = await sb
                .from('payments')
                .insert([{
                    moyasar_id: payment.id,
                    amount: payment.amount / 100, // Halalas to SAR
                    status: payment.status,
                    plan_name: planData.title,
                    user_name: 'عميل', // Ideally captured from a pre-payment form
                    user_email: '',
                    created_at: new Date().toISOString()
                }]);

            if (error) throw error;

            alert('تمت عملية الدفع بنجاح! شكراً لثقتكم.');
            window.location.reload();
        } catch (err) {
            console.error('Error recording payment in Supabase:', err);
            alert('تم الدفع ولكن فشل تسجيل البيانات. يرجى التواصل مع الدعم.');
        }
    }
};
