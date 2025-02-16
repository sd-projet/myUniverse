# Utilisation d'une image PHP avec Composer préinstallé
FROM php:8.2-cli

# Installation de Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Copier ton application dans l'image Docker
COPY . /app
WORKDIR /app

# Installer les dépendances PHP via Composer
RUN composer install --no-interaction --optimize-autoloader

# Démarrer le serveur Symfony
CMD ["php", "-S", "0.0.0.0:8080", "-t", "public"]
