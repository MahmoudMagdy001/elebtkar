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
            .then(html => {
                footerPlaceholder.innerHTML = html;
            })
            .catch(error => {
                console.error('Error loading footer:', error);
            });
    }
});
