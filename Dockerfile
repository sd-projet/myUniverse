# Utiliser PHP 8.2 avec Apache
FROM php:8.2-apache

# Installer les extensions PHP
RUN apt-get update && apt-get install -y \
    libzip-dev unzip git curl libpq-dev \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql zip

# Installer Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Installer Symfony CLI
RUN curl -sS https://get.symfony.com/cli/installer | bash \
    && mv /root/.symfony5/bin/symfony /usr/local/bin/symfony

# Définir un utilisateur non root
RUN useradd -m symfony
WORKDIR /home/symfony
COPY . .
RUN chown -R symfony:symfony /home/symfony
USER symfony

# Copier le fichier .env s'il n'existe pas
RUN cp .env.example .env || touch .env

# Installer les dépendances Symfony
RUN composer install --no-interaction --optimize-autoloader --no-scripts
RUN composer run-script auto-scripts || true

# Configurer Apache pour pointer sur "public/"
WORKDIR /home/symfony
RUN ln -s /home/symfony/public /var/www/html

# Correction: Exécuter cette commande en root puis revenir à symfony
USER root
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf
USER symfony

# Exposer le port 10000 pour Render
EXPOSE 10000

# Lancer Apache
CMD ["apache2-foreground"]
