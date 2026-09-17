document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (!menuToggle || !sidebar || !overlay) {
        return;
    }

    function toggleMenu() {
        const isOpen = sidebar.classList.toggle('open');

        overlay.classList.toggle('active', isOpen);

        menuToggle.setAttribute('aria-expanded', isOpen);

        const icon = menuToggle.querySelector('i');

        if (isOpen) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    }

    menuToggle.addEventListener('click', toggleMenu);

    overlay.addEventListener('click', toggleMenu);

    sidebar.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 900) {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');

                menuToggle.setAttribute('aria-expanded', 'false');

                const icon = menuToggle.querySelector('i');

                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');

            menuToggle.setAttribute('aria-expanded', 'false');

            const icon = menuToggle.querySelector('i');

            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
});

