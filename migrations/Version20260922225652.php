<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260922225652 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP SEQUENCE user_id_seq CASCADE');
        $this->addSql('ALTER TABLE partage DROP CONSTRAINT FK_8B929E6E2C3B70D7');
        $this->addSql('ALTER TABLE partage DROP CONSTRAINT FK_8B929E6EAFB95E03');
        $this->addSql('ALTER TABLE partage ADD CONSTRAINT FK_8B929E6E2C3B70D7 FOREIGN KEY (star_id) REFERENCES stars (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE partage ADD CONSTRAINT FK_8B929E6EAFB95E03 FOREIGN KEY (constellation_id) REFERENCES constellations (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('CREATE SEQUENCE user_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('ALTER TABLE partage DROP CONSTRAINT fk_8b929e6e2c3b70d7');
        $this->addSql('ALTER TABLE partage DROP CONSTRAINT fk_8b929e6eafb95e03');
        $this->addSql('ALTER TABLE partage ADD CONSTRAINT fk_8b929e6e2c3b70d7 FOREIGN KEY (star_id) REFERENCES stars (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE partage ADD CONSTRAINT fk_8b929e6eafb95e03 FOREIGN KEY (constellation_id) REFERENCES constellations (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }
}
