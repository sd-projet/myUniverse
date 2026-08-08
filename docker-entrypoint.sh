#!/bin/bash

set -e

mkdir -p /var/www/html/var/cache
mkdir -p /var/www/html/var/log

php bin/console cache:clear --env=prod
php bin/console importmap:install --env=prod
php bin/console asset-map:compile --env=prod

chown -R www-data:www-data /var/www/html/var
chmod -R 775 /var/www/html/var

exec apache2-foreground