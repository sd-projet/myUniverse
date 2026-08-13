FROM php:8.2-apache

# Extensions nécessaires
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
    && docker-php-ext-install gd pdo pdo_pgsql intl zip


# Active mod_rewrite pour Symfony (Apache)
RUN a2enmod rewrite

# Autorise Symfony à utiliser public/.htaccess
RUN printf '%s\n' \
    '<Directory /var/www/html/public>' \
    '    AllowOverride All' \
    '    Require all granted' \
    '</Directory>' \
    > /etc/apache2/conf-available/symfony.conf

RUN a2enconf symfony


RUN sed -ri -e 's!/var/www/html!/var/www/html/public!g' \
    /etc/apache2/sites-available/000-default.conf


# Copie du projet
COPY . /var/www/html

WORKDIR /var/www/html

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

RUN composer global config --no-plugins allow-plugins.symfony/flex true

# Installation des dépendances
RUN COMPOSER_ALLOW_SUPERUSER=1 composer install \
    --no-dev \
    --optimize-autoloader \
    --ignore-platform-reqs \
    --no-scripts

# Script de démarrage
COPY docker-entrypoint.sh /usr/local/bin/

RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Dossiers Symfony
RUN mkdir -p /var/www/html/var/cache \
    /var/www/html/var/log \
    /var/www/html/public

# Permissions
RUN chown -R www-data:www-data \
    /var/www/html/var \
    /var/www/html/public

# Port Render
EXPOSE 10000

ENV PORT=10000

RUN sed -i 's/Listen 80/Listen 10000/' \
    /etc/apache2/ports.conf

RUN sed -i 's/:80/:10000/' \
    /etc/apache2/sites-available/000-default.conf

CMD ["docker-entrypoint.sh"]