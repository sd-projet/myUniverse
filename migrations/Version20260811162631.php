<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260811162631 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE constellations (id SERIAL NOT NULL, user_id INT NOT NULL, name VARCHAR(255) NOT NULL, description VARCHAR(255) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, etoile JSON NOT NULL, lines_etoiles JSON DEFAULT NULL, image_url VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_740EED1DA76ED395 ON constellations (user_id)');
        $this->addSql('COMMENT ON COLUMN constellations.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN constellations.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE constellation_stars (constellations_id INT NOT NULL, stars_id INT NOT NULL, PRIMARY KEY(constellations_id, stars_id))');
        $this->addSql('CREATE INDEX IDX_8CDB5E4F7ED755C1 ON constellation_stars (constellations_id)');
        $this->addSql('CREATE INDEX IDX_8CDB5E4FFFEAC122 ON constellation_stars (stars_id)');
        $this->addSql('CREATE TABLE events (id SERIAL NOT NULL, constellation_id INT NOT NULL, title VARCHAR(255) NOT NULL, description VARCHAR(255) NOT NULL, event_date DATE NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('COMMENT ON COLUMN events.event_date IS \'(DC2Type:date_immutable)\'');
        $this->addSql('COMMENT ON COLUMN events.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN events.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE partage (id SERIAL NOT NULL, user_id INT NOT NULL, star_id INT DEFAULT NULL, constellation_id INT DEFAULT NULL, description VARCHAR(255) DEFAULT NULL, image_url VARCHAR(255) DEFAULT NULL, data JSON NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_8B929E6EA76ED395 ON partage (user_id)');
        $this->addSql('CREATE INDEX IDX_8B929E6E2C3B70D7 ON partage (star_id)');
        $this->addSql('CREATE INDEX IDX_8B929E6EAFB95E03 ON partage (constellation_id)');
        $this->addSql('COMMENT ON COLUMN partage.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE stars (id SERIAL NOT NULL, user_id INT NOT NULL, name VARCHAR(255) NOT NULL, x_position DOUBLE PRECISION NOT NULL, y_position DOUBLE PRECISION NOT NULL, z_position DOUBLE PRECISION NOT NULL, brightness DOUBLE PRECISION NOT NULL, color VARCHAR(20) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, description VARCHAR(300) NOT NULL, size INT NOT NULL, event_date TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, model_path VARCHAR(255) DEFAULT NULL, image_url VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_11DC02CA76ED395 ON stars (user_id)');
        $this->addSql('COMMENT ON COLUMN stars.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN stars.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN stars.event_date IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE "user" (id SERIAL NOT NULL, roles JSON NOT NULL, email VARCHAR(180) NOT NULL, password VARCHAR(255) NOT NULL, name VARCHAR(255) NOT NULL, profile_picture VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE TABLE messenger_messages (id BIGSERIAL NOT NULL, body TEXT NOT NULL, headers TEXT NOT NULL, queue_name VARCHAR(190) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, available_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, delivered_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_75EA56E0FB7336F0 ON messenger_messages (queue_name)');
        $this->addSql('CREATE INDEX IDX_75EA56E0E3BD61CE ON messenger_messages (available_at)');
        $this->addSql('CREATE INDEX IDX_75EA56E016BA31DB ON messenger_messages (delivered_at)');
        $this->addSql('COMMENT ON COLUMN messenger_messages.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN messenger_messages.available_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN messenger_messages.delivered_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE OR REPLACE FUNCTION notify_messenger_messages() RETURNS TRIGGER AS $$
            BEGIN
                PERFORM pg_notify(\'messenger_messages\', NEW.queue_name::text);
                RETURN NEW;
            END;
        $$ LANGUAGE plpgsql;');
        $this->addSql('DROP TRIGGER IF EXISTS notify_trigger ON messenger_messages;');
        $this->addSql('CREATE TRIGGER notify_trigger AFTER INSERT OR UPDATE ON messenger_messages FOR EACH ROW EXECUTE PROCEDURE notify_messenger_messages();');
        $this->addSql('ALTER TABLE constellations ADD CONSTRAINT FK_740EED1DA76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE constellation_stars ADD CONSTRAINT FK_8CDB5E4F7ED755C1 FOREIGN KEY (constellations_id) REFERENCES constellations (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE constellation_stars ADD CONSTRAINT FK_8CDB5E4FFFEAC122 FOREIGN KEY (stars_id) REFERENCES stars (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE partage ADD CONSTRAINT FK_8B929E6EA76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE partage ADD CONSTRAINT FK_8B929E6E2C3B70D7 FOREIGN KEY (star_id) REFERENCES stars (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE partage ADD CONSTRAINT FK_8B929E6EAFB95E03 FOREIGN KEY (constellation_id) REFERENCES constellations (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE stars ADD CONSTRAINT FK_11DC02CA76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        // $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE constellations DROP CONSTRAINT FK_740EED1DA76ED395');
        $this->addSql('ALTER TABLE constellation_stars DROP CONSTRAINT FK_8CDB5E4F7ED755C1');
        $this->addSql('ALTER TABLE constellation_stars DROP CONSTRAINT FK_8CDB5E4FFFEAC122');
        $this->addSql('ALTER TABLE partage DROP CONSTRAINT FK_8B929E6EA76ED395');
        $this->addSql('ALTER TABLE partage DROP CONSTRAINT FK_8B929E6E2C3B70D7');
        $this->addSql('ALTER TABLE partage DROP CONSTRAINT FK_8B929E6EAFB95E03');
        $this->addSql('ALTER TABLE stars DROP CONSTRAINT FK_11DC02CA76ED395');
        $this->addSql('DROP TABLE constellations');
        $this->addSql('DROP TABLE constellation_stars');
        $this->addSql('DROP TABLE events');
        $this->addSql('DROP TABLE partage');
        $this->addSql('DROP TABLE stars');
        $this->addSql('DROP TABLE "user"');
        $this->addSql('DROP TABLE messenger_messages');
    }
}
