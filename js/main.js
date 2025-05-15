// Main JavaScript for the application

// Toggle mobile menu
const menuButton = document.getElementById('menuButton');
const navbarRight = document.getElementById('navbarRight');

if (menuButton && navbarRight) {
    menuButton.addEventListener('click', () => {
        navbarRight.classList.toggle('active');
        menuButton.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });
}

// Close mobile menu when clicking on a nav link
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            navbarRight.classList.remove('active');
            menuButton.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });
});

// Add active class to current page link
const currentLocation = location.href;
const menuItems = document.querySelectorAll('.nav-link');
const menuLength = menuItems.length;

for (let i = 0; i < menuLength; i++) {
    if (menuItems[i].href === currentLocation) {
        menuItems[i].classList.add('active');
    }
}

// Add scroll effect to navbar
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.classList.remove('scrolled');
        return;
    }
    
    if (currentScroll > lastScroll && !navbar.classList.contains('scroll-down')) {
        // Scroll down
        navbar.classList.remove('scrolled');
        navbar.classList.add('scroll-down');
    } else if (currentScroll < lastScroll && navbar.classList.contains('scroll-down')) {
        // Scroll up
        navbar.classList.add('scrolled');
        navbar.classList.remove('scroll-down');
    }
    
    lastScroll = currentScroll;
});
