#!/bin/bash
set -e

php bin/console cache:clear --env=prod || true

exec apache2-foreground