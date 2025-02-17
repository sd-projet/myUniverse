// Classe pour gérer l'affichage du mot de passe (toggle visibilité)
class PasswordToggle {
    // Constructeur qui prend en paramètre le sélecteur des icônes pour afficher/masquer le mot de passe
    constructor(toggleSelector) {
        this.toggleIcons = document.querySelectorAll(toggleSelector); // Récupère toutes les icônes pour le toggle
        this.addToggleEventListeners(); // Ajoute les écouteurs d'événements pour chaque icône
    }

    // Ajoute un événement 'click' à chaque icône pour basculer la visibilité du mot de passe
    addToggleEventListeners() {
        this.toggleIcons.forEach(icon => {
            icon.addEventListener("click", (event) => this.togglePasswordVisibility(event));
        });
    }

    // Fonction qui bascule la visibilité du mot de passe
    togglePasswordVisibility(event) {
        // Récupère l'élément cible du mot de passe à afficher/masquer en utilisant l'attribut "data-target"
        let target = document.getElementById(event.target.getAttribute("data-target"));
        
        // Si le type du champ est "password", on le change en "text" pour afficher le mot de passe
        if (target.type === "password") {
            target.type = "text";
            // Change l'icône pour indiquer que le mot de passe est visible
            event.target.classList.remove("fa-eye");
            event.target.classList.add("fa-eye-slash");
        } else {
            // Si le type est déjà "text", on le remet en "password" pour masquer le mot de passe
            target.type = "password";
            // Change l'icône pour indiquer que le mot de passe est masqué
            event.target.classList.remove("fa-eye-slash");
            event.target.classList.add("fa-eye");
        }
    }
}

// Classe pour gérer la disparition automatique des alertes
class AlertAutoDismiss {
    // Constructeur qui prend en paramètre le sélecteur des alertes
    constructor(alertSelector) {
        this.alerts = document.querySelectorAll(alertSelector); // Récupère toutes les alertes
        this.dismissAlerts(); // Lance la fonction pour faire disparaître les alertes après un certain délai
    }

    // Fonction pour faire disparaître les alertes après un délai de 3 secondes
    dismissAlerts() {
        this.alerts.forEach(alert => {
            // Après 3 secondes, on diminue l'opacité de l'alerte pour la faire disparaître
            setTimeout(() => {
                alert.style.opacity = "0";
                // Après un autre délai (500ms), on supprime l'alerte du DOM
                setTimeout(() => alert.remove(), 500);
            }, 3000);
        });
    }
}

// Création des instances après que le DOM soit entièrement chargé
document.addEventListener("DOMContentLoaded", () => {
    new PasswordToggle(".togglePassword"); // Crée une instance de PasswordToggle pour gérer l'affichage des mots de passe
    new AlertAutoDismiss(".alert"); // Crée une instance d'AlertAutoDismiss pour gérer la disparition des alertes
});
