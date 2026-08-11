function toggleModule(headerElement) {
    const moduleItem = headerElement.closest('.module-item');
    
    // Optional: Close other expanded modules (accordion style)
    // const allModules = document.querySelectorAll('.module-item');
    // allModules.forEach(item => {
    //     if (item !== moduleItem && item.classList.contains('expanded')) {
    //         item.classList.remove('expanded');
    //     }
    // });

    // Toggle current module
    moduleItem.classList.toggle('expanded');
}

// Add a quick keyboard shortcut listener for demonstration
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.focus();
        }
    }
});
