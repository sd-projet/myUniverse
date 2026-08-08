#!/bin/bash
set -e

mkdir -p /var/www/html/var/cache
mkdir -p /var/www/html/var/log

chown -R www-data:www-data /var/www/html/var
chmod -R 775 /var/www/html/var

php bin/console cache:clear --env=prod

exec apache2-foreground