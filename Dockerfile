FROM php:8.2-apache

# Installe les extensions nécessaires
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    libicu-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd pdo pdo_mysql intl zip

# Active mod_rewrite pour Apache (nécessaire pour Symfony)
RUN a2enmod rewrite

RUN sed -ri -e 's!/var/www/html!/var/www/html/public!g' \
    /etc/apache2/sites-available/000-default.conf

RUN sed -ri -e 's!/var/www/!/var/www/html/public!g' \
    /etc/apache2/apache2.conf

# Copie les fichiers du projet
COPY . /var/www/html

# Définit le répertoire de travail
WORKDIR /var/www/html

# Installe Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Autorise les plugins Symfony en tant que root
RUN composer global config --no-plugins allow-plugins.symfony/flex true

# Installe les dépendances Symfony
RUN COMPOSER_ALLOW_SUPERUSER=1 composer install \
    --no-dev \
    --optimize-autoloader \
    --ignore-platform-reqs

# Compile les assets Symfony
RUN php bin/console asset-map:compile --env=prod

# Ajout du script de démarrage
COPY docker-entrypoint.sh /usr/local/bin/

RUN chmod +x /usr/local/bin/docker-entrypoint.sh


# Création des dossiers nécessaires Symfony
RUN mkdir -p /var/www/html/var/cache \
    /var/www/html/var/log \
    /var/www/html/public

# Permissions
RUN chown -R www-data:www-data /var/www/html/var /var/www/html/public

# Expose le port 80
EXPOSE 80

ENV PORT=10000

RUN sed -i 's/Listen 80/Listen 10000/' /etc/apache2/ports.conf

RUN sed -i 's/:80/:10000/' /etc/apache2/sites-available/000-default.conf

# Commande de démarrage
CMD ["docker-entrypoint.sh"]