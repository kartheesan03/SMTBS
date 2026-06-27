document.addEventListener('DOMContentLoaded', () => {
    // Tab switching for Payment Statistics
    const tabs = document.querySelectorAll('.stats-tabs .tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Randomize bar heights for demonstration purposes
            const bars = document.querySelectorAll('.bar');
            bars.forEach(bar => {
                // Generate a random height between 30% and 90%
                const randomHeight = Math.floor(Math.random() * 60) + 30;
                bar.style.height = `${randomHeight}%`;
                
                // Update the label text above the bar
                const labelTop = bar.previousElementSibling;
                labelTop.textContent = `${randomHeight}%`;
            });
        });
    });

    // Nav item switching (Sidebar)
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // Simple interaction for Add Card button
    const addCardBtn = document.querySelector('.add-card');
    if(addCardBtn) {
        addCardBtn.addEventListener('click', () => {
            alert('Add Card functionality will be implemented here.');
        });
    }

    // Initialize bars to their starting positions for a nice animation effect on load
    setTimeout(() => {
        const initialHeights = [36, 52, 70, 84]; // Health, Shopping, Traveling, Food
        const bars = document.querySelectorAll('.bar');
        bars.forEach((bar, index) => {
            bar.style.height = '0%'; // Start at 0
            setTimeout(() => {
                bar.style.height = `${initialHeights[index]}%`;
            }, 100 * (index + 1)); // Staggered animation
        });
    }, 100);
});
