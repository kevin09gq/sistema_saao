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
        } else if (path.includes('/contratos/contratos.php')) {
            return 'contratos';
        } else if (path.includes('/nomina/')) {
            return 'nomina';
        } else if (path.includes('/empleados/views/form_registro.php')) {
            return 'empleados_registro';
        } else if (path.includes('/empleados/')) {
            return 'empleados';
        } else if (path.includes('/config/settings/views/configuracion.php')) {
            return 'configuracion';
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
    
    // Handle logout button click
    const btnSalir = document.querySelector('.btn-salir');
    if (btnSalir) {
        btnSalir.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Mostrar confirmación con SweetAlert2
            Swal.fire({
                title: '¿Cerrar sesión?',
                text: '¿Estás seguro de que deseas salir del sistema?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#22c55e',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, salir',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Redirigir a logout.php
                    window.location.href = '/sistema_saao/login/logout.php';
                }
            });
        });
    }
    
    // Reinitialize on window resize for responsive behavior
    window.addEventListener('resize', function() {
        handleHoverEffects();
    });
});