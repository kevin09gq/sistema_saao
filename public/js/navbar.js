// Navbar functionality and interactions
document.addEventListener('DOMContentLoaded', function() {
    // Navbar active state management
    function initializeNavbar() {
        // Get current page identifier
        const currentPage = getCurrentPage();
        
        // Set active class on the appropriate nav link
        const navLinks = document.querySelectorAll('.nav-link[data-page]');
        navLinks.forEach(link => {
            if (link.getAttribute('data-page') === currentPage) {
                link.classList.add('active');
            }
        });
        
        // Force reflow to ensure styles are applied
        const navbar = document.querySelector('.navbar-custom');
        if (navbar) {
            navbar.offsetHeight; // Trigger reflow
        }
    }
    
    // Function to determine current page
    function getCurrentPage() {
        const path = window.location.pathname;
        
        if (path.includes('/index.php') || path === '/' || path === '/sistema_saao/' || path === '/sistema_saao') {
            return 'inicio';
        } else if (path.includes('/gafetes/')) {
            return 'gafetes';
        } else if (path.includes('/nomina/')) {
            return 'nomina';
        } else if (path.includes('/empleados/')) {
            return 'empleados';
        }
        
        return 'inicio'; // default
    }
    
    // Add scrolled class on scroll for shadow effect
    function handleScroll() {
        const navbar = document.querySelector('.navbar-custom');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    }
    
    // Handle navbar link hover effects
    function handleHoverEffects() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            // Mouse enter event
            link.addEventListener('mouseenter', function() {
                this.classList.add('hover');
            });
            
            // Mouse leave event
            link.addEventListener('mouseleave', function() {
                this.classList.remove('hover');
            });
            
            // Focus event for accessibility
            link.addEventListener('focus', function() {
                this.classList.add('hover');
            });
            
            // Blur event for accessibility
            link.addEventListener('blur', function() {
                this.classList.remove('hover');
            });
        });
    }
    
    // Initialize navbar
    initializeNavbar();
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Handle hover effects
    handleHoverEffects();
    
    // Reinitialize on window resize for responsive behavior
    window.addEventListener('resize', function() {
        handleHoverEffects();
    });
});