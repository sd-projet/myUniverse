# Utiliser une image PHP 8.2 avec Apache
FROM php:8.2-apache

# Installer les extensions PHP nécessaires
RUN apt-get update && apt-get install -y \
    libzip-dev unzip git curl libpq-dev \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql zip

# Installer Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Installer Symfony CLI (correction du chemin)
RUN curl -sS https://get.symfony.com/cli/installer | bash \
    && mv /root/.symfony5/bin/symfony /usr/local/bin/symfony

# Définir un utilisateur non root pour éviter les erreurs avec Composer
RUN useradd -m symfony
WORKDIR /home/symfony
COPY . .
RUN chown -R symfony:symfony /home/symfony
USER symfony

# Installer les dépendances Symfony sans exécuter les scripts
RUN composer install --no-interaction --optimize-autoloader --no-scripts

# Exécuter les auto-scripts Symfony après installation
RUN composer run-script auto-scripts || true

# Exposer le port 10000 pour Render
EXPOSE 10000

# Lancer Apache
CMD ["apache2-foreground"]
