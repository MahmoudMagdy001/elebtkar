/**
 * payment-logic.js — Moyasar Integration Logic
 * ─────────────────────────────────────────────
 * Handles Moyasar Form initialization and Supabase recording.
 */

window.PaymentHandler = {
    tempCustomerData: null,
    tempPlanData: null,

    /**
     * Start the payment process - show user info form first
     */
    initPayment(planData) {
        this.tempPlanData = planData;
        
        // Update header
        const titleEl = document.getElementById('paymentPlanTitle');
        const priceEl = document.getElementById('paymentPlanPrice');
        if (titleEl) titleEl.textContent = planData.title;
        if (priceEl) priceEl.textContent = `${planData.price.toLocaleString()} ريال سعودي`;

        // Form & Moyasar containers
        const custForm = document.getElementById('paymentCustomerForm');
        const mysrContainer = document.querySelector('.mysr-form');
        const modal = document.getElementById('paymentModal');

        if (!modal) return;

        // Reset view
        custForm.style.display = 'block';
        mysrContainer.style.display = 'none';
        modal.classList.add('active');

        // Setup "Proceed" button once
        const proceedBtn = document.getElementById('proceedToPay');
        if (proceedBtn) {
            proceedBtn.onclick = () => this.handleProceedToPay();
        }
    },

    /**
     * Validate user info and show Moyasar form
     */
    handleProceedToPay() {
        const name = document.getElementById('custName').value.trim();
        const email = document.getElementById('custEmail').value.trim();
        const phone = document.getElementById('custPhone').value.trim();

        if (!name || !email || !phone) {
            alert('يرجى تعبئة كافة البيانات للتواصل معك.');
            return;
        }

        this.tempCustomerData = { name, email, phone };

        // Hide customer form, show Moyasar
        document.getElementById('paymentCustomerForm').style.display = 'none';
        const mysrContainer = document.querySelector('.mysr-form');
        mysrContainer.style.display = 'block';

        this.startMoyasar();
    },

    /**
     * Initialize Moyasar Form
     */
    startMoyasar() {
        if (!window.MOYASAR_PUBLISHABLE_KEY || window.MOYASAR_PUBLISHABLE_KEY === 'pk_test_...') {
            alert('خطأ في إعدادات الدفع. يرجى مراجعة المسؤول.');
            return;
        }

        const amountInHalalas = Math.round(this.tempPlanData.price * 100);

        Moyasar.init({
            element: '.mysr-form',
            amount: amountInHalalas,
            currency: 'SAR',
            description: `باقة: ${this.tempPlanData.title} | للعميل: ${this.tempCustomerData.name}`,
            publishable_api_key: window.MOYASAR_PUBLISHABLE_KEY,
            callback_url: window.location.origin + '/pages/services/payment-callback.html',
            methods: ['creditcard', 'applepay', 'stcpay'],
            apple_pay: {
                label: 'الابتكار | Elebtkar',
                validate_merchant_url: 'https://api.moyasar.com/v1/applepay/initiate',
                country: 'SA'
            },
            on_completed: async (payment) => {
                await this.recordPayment(payment);
            },
            on_failure: (error) => {
                console.error('Payment failed:', error);
                alert('فشلت عملية الدفع. يرجى المحاولة مرة أخرى.');
            }
        });
    },

    /**
     * Final step: Save everything to Supabase
     */
    async recordPayment(payment) {
        const { createClient } = supabase;
        const sb = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

        try {
            const { error } = await sb
                .from('purchases')
                .insert([{
                    moyasar_payment_id: payment.id,
                    amount: payment.amount / 100,
                    status: payment.status,
                    plan_id: this.tempPlanData.id,
                    user_name: this.tempCustomerData.name,
                    user_email: this.tempCustomerData.email,
                    user_phone: this.tempCustomerData.phone,
                    currency: payment.currency || 'SAR',
                    metadata: { plan_name: this.tempPlanData.title }
                }]);

            if (error) throw error;

            alert('تمت عملية الدفع بنجاح! سيتم التواصل معك قريباً.');
            window.location.reload();
        } catch (err) {
            console.error('Record failed:', err);
            alert('تم الدفع ولكن فشل الربط بالقاعدة. شكراً لك، طلبك محفوظ في مويسر.');
        }
    }
};
