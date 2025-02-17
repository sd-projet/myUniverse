# Utiliser PHP 8.2 avec Apache
FROM php:8.2-apache

# Installer les extensions PHP et dépendances système
RUN apt-get update && apt-get install -y \
    libzip-dev unzip git curl libpq-dev \
    libcurl4-openssl-dev libssl-dev \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql zip

# Installer Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Installer Symfony CLI
RUN curl -sS https://get.symfony.com/cli/installer | bash \
    && mv /root/.symfony5/bin/symfony /usr/local/bin/symfony

# Configurer Apache pour pointer sur "public/"
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf
RUN sed -i 's|DocumentRoot /var/www/html|DocumentRoot /home/symfony/public|' /etc/apache2/sites-available/000-default.conf

# Définir un utilisateur non root et préparer les fichiers
RUN useradd -m symfony
WORKDIR /home/symfony
COPY . . 

# Créer les dossiers nécessaires avant de changer les permissions
RUN mkdir -p /home/symfony/var /home/symfony/public \
    && chown -R www-data:www-data /home/symfony/var /home/symfony/public

# Passer à l'utilisateur symfony
USER symfony

# S'assurer que les permissions sont correctes
RUN chown -R symfony:symfony /home/symfony

# Copier le fichier .env s'il n'existe pas
RUN [ ! -f ".env" ] && cp .env.example .env || true

# Nettoyer le cache Composer pour éviter des problèmes
RUN composer clear-cache

# Installer les dépendances Symfony avec des logs détaillés
RUN composer install -vvv --no-interaction --optimize-autoloader --no-scripts

# Exposer le port 10000 pour Render
EXPOSE 10000

# Lancer Apache sur le port 10000
CMD ["apache2-foreground"]
