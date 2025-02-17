class PasswordToggle {
    constructor(toggleSelector) {
        this.toggleIcons = document.querySelectorAll(toggleSelector);
        this.addToggleEventListeners();
    }

    addToggleEventListeners() {
        this.toggleIcons.forEach(icon => {
            icon.addEventListener("click", (event) => this.togglePasswordVisibility(event));
        });
    }

    togglePasswordVisibility(event) {
        let target = document.getElementById(event.target.getAttribute("data-target"));
        if (target.type === "password") {
            target.type = "text";
            event.target.classList.remove("fa-eye");
            event.target.classList.add("fa-eye-slash");
        } else {
            target.type = "password";
            event.target.classList.remove("fa-eye-slash");
            event.target.classList.add("fa-eye");
        }
    }
}

class AlertAutoDismiss {
    constructor(alertSelector) {
        this.alerts = document.querySelectorAll(alertSelector);
        this.dismissAlerts();
    }

    dismissAlerts() {
        this.alerts.forEach(alert => {
            setTimeout(() => {
                alert.style.opacity = "0";
                setTimeout(() => alert.remove(), 500);
            }, 3000);
        });
    }
}

// Création d'instances après le chargement du DOM
document.addEventListener("DOMContentLoaded", () => {
    new PasswordToggle(".togglePassword");
    new AlertAutoDismiss(".alert");
});
