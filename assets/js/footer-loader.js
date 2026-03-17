/**
 * footer-loader.js
 * Dynamically loads the shared footer component into the page.
 */
document.addEventListener('DOMContentLoaded', () => {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        fetch('/components/footer.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load footer component');
                }
                return response.text();
            })
            .then(async html => {
                footerPlaceholder.innerHTML = html;
                
                // After loading footer, fetch services from Supabase
                if (window.supabase) {
                    const { createClient } = window.supabase;
                    const sb = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
                    
                    try {
                        const { data: services, error } = await sb
                            .from('services')
                            .select('title, slug')
                            .order('order_num', { ascending: true });
                            
                        if (error) throw error;
                        
                        const servicesLinks = document.getElementById('footer-services-links');
                        if (servicesLinks && services) {
                            services.forEach(srv => {
                                const link = document.createElement('a');
                                link.href = `/pages/services/services.html?slug=${srv.slug}`;
                                link.textContent = srv.title;
                                servicesLinks.appendChild(link);
                            });
                        }
                    } catch (err) {
                        console.error('Error fetching services for footer:', err);
                    }
                }
            })
            .catch(error => {
                console.error('Error loading footer:', error);
            });
    }
});
