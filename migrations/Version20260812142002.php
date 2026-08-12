<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260812142002 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Rename user table to users';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE "user" RENAME TO users');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE users RENAME TO "user"');
    }
}