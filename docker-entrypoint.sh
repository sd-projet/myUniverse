#!/bin/bash
set -e

php bin/console cache:clear --env=prod

chown -R www-data:www-data /var/www/html/var
chmod -R 775 /var/www/html/var

exec apache2-foreground