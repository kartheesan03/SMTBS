document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.stats-tabs .tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const bars = document.querySelectorAll('.bar');
            bars.forEach(bar => {
                const randomHeight = Math.floor(Math.random() * 60) + 30;
                bar.style.height = `${randomHeight}%`;
                
                const labelTop = bar.previousElementSibling;
                labelTop.textContent = `${randomHeight}%`;
            });
        });
    });

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });

    const addCardBtn = document.querySelector('.add-card');
    if(addCardBtn) {
        addCardBtn.addEventListener('click', () => {
            alert('Add Card functionality will be implemented here.');
        });
    }

    setTimeout(() => {
        const initialHeights = [36, 52, 70, 84];
        const bars = document.querySelectorAll('.bar');
        bars.forEach((bar, index) => {
            bar.style.height = '0%';
            setTimeout(() => {
                bar.style.height = `${initialHeights[index]}%`;
            }, 100 * (index + 1));
        });
    }, 100);
});
