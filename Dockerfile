# Utilisation de l'image officielle PHP avec Apache
FROM php:8.1-apache

# Installer les extensions PHP nécessaires
RUN apt-get update && apt-get install -y \
    libzip-dev unzip git curl \
    && docker-php-ext-install pdo pdo_mysql zip

# Installer Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Définir le répertoire de travail
WORKDIR /var/www/html

# Copier le projet Symfony dans l'image Docker
COPY . .

# Installer les dépendances Symfony
RUN composer install --no-interaction --optimize-autoloader

# Donner les bonnes permissions aux fichiers
RUN chown -R www-data:www-data /var/www/html/var /var/www/html/public

# Exposer le port 80 pour Apache
EXPOSE 10000 

# Démarrer Apache
CMD ["apache2-foreground"]
