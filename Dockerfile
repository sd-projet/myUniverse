FROM php:8.2-apache

# Installe les extensions nécessaires
RUN apt-get update && apt-get install -y \
    libpng-dev libjpeg-dev libfreetype6-dev zip unzip git \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd pdo pdo_mysql

# Active mod_rewrite pour Apache (nécessaire pour Symfony)
RUN a2enmod rewrite

# Copie les fichiers du projet
COPY . /var/www/html

# Définit le répertoire de travail
WORKDIR /var/www/html

# Installe Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Autorise les plugins Symfony en tant que root
RUN composer global config --no-plugins allow-plugins.symfony/flex true

# Installe les dépendances Symfony
RUN COMPOSER_ALLOW_SUPERUSER=1 composer install --no-dev --optimize-autoloader --ignore-platform-reqs

# Change les permissions
RUN chown -R www-data:www-data /var/www/html/var /var/www/html/public

# Expose le port 80
EXPOSE 80

# Commande de démarrage
CMD ["apache2-foreground"]
