<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20241230165755 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE IF NOT EXISTS constellations (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, name VARCHAR(255) NOT NULL, description VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', etoile JSON NOT NULL, lines_etoiles JSON DEFAULT NULL, image_url VARCHAR(255) DEFAULT NULL, INDEX IDX_740EED1DA76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE IF NOT EXISTS constellation_stars (constellations_id INT NOT NULL, stars_id INT NOT NULL, INDEX IDX_8CDB5E4F7ED755C1 (constellations_id), INDEX IDX_8CDB5E4FFFEAC122 (stars_id), PRIMARY KEY(constellations_id, stars_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE IF NOT EXISTS events (id INT AUTO_INCREMENT NOT NULL, constellation_id INT NOT NULL, title VARCHAR(255) NOT NULL, description VARCHAR(255) NOT NULL, event_date DATE NOT NULL COMMENT \'(DC2Type:date_immutable)\', created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE IF NOT EXISTS partage (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, star_id INT DEFAULT NULL, constellation_id INT DEFAULT NULL, description VARCHAR(255) DEFAULT NULL, image_url VARCHAR(255) DEFAULT NULL, data JSON NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_8B929E6EA76ED395 (user_id), INDEX IDX_8B929E6E2C3B70D7 (star_id), INDEX IDX_8B929E6EAFB95E03 (constellation_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE IF NOT EXISTS stars (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, name VARCHAR(255) NOT NULL, x_position DOUBLE PRECISION NOT NULL, y_position DOUBLE PRECISION NOT NULL, z_position DOUBLE PRECISION NOT NULL, brightness DOUBLE PRECISION NOT NULL, color VARCHAR(20) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', description VARCHAR(300) NOT NULL, size INT NOT NULL, event_date DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', model_path VARCHAR(255) DEFAULT NULL, image_url VARCHAR(255) DEFAULT NULL, INDEX IDX_11DC02CA76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE IF NOT EXISTS user (id INT AUTO_INCREMENT NOT NULL, roles JSON NOT NULL, email VARCHAR(180) NOT NULL, password VARCHAR(255) NOT NULL, name VARCHAR(255) NOT NULL, profile_picture VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE IF NOT EXISTS messenger_messages (id BIGINT AUTO_INCREMENT NOT NULL, body LONGTEXT NOT NULL, headers LONGTEXT NOT NULL, queue_name VARCHAR(190) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', available_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', delivered_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_75EA56E0FB7336F0 (queue_name), INDEX IDX_75EA56E0E3BD61CE (available_at), INDEX IDX_75EA56E016BA31DB (delivered_at), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE constellations ADD CONSTRAINT FK_740EED1DA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE constellation_stars ADD CONSTRAINT FK_8CDB5E4F7ED755C1 FOREIGN KEY (constellations_id) REFERENCES constellations (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE constellation_stars ADD CONSTRAINT FK_8CDB5E4FFFEAC122 FOREIGN KEY (stars_id) REFERENCES stars (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE partage ADD CONSTRAINT FK_8B929E6EA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE partage ADD CONSTRAINT FK_8B929E6E2C3B70D7 FOREIGN KEY (star_id) REFERENCES stars (id)');
        $this->addSql('ALTER TABLE partage ADD CONSTRAINT FK_8B929E6EAFB95E03 FOREIGN KEY (constellation_id) REFERENCES constellations (id)');
        $this->addSql('ALTER TABLE stars ADD CONSTRAINT FK_11DC02CA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
    }


    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE constellations DROP FOREIGN KEY FK_740EED1DA76ED395');
        $this->addSql('ALTER TABLE constellation_stars DROP FOREIGN KEY FK_8CDB5E4F7ED755C1');
        $this->addSql('ALTER TABLE constellation_stars DROP FOREIGN KEY FK_8CDB5E4FFFEAC122');
        $this->addSql('ALTER TABLE partage DROP FOREIGN KEY FK_8B929E6EA76ED395');
        $this->addSql('ALTER TABLE partage DROP FOREIGN KEY FK_8B929E6E2C3B70D7');
        $this->addSql('ALTER TABLE partage DROP FOREIGN KEY FK_8B929E6EAFB95E03');
        $this->addSql('ALTER TABLE stars DROP FOREIGN KEY FK_11DC02CA76ED395');
        $this->addSql('DROP TABLE constellations');
        $this->addSql('DROP TABLE constellation_stars');
        $this->addSql('DROP TABLE events');
        $this->addSql('DROP TABLE partage');
        $this->addSql('DROP TABLE stars');
        $this->addSql('DROP TABLE user');
        $this->addSql('DROP TABLE messenger_messages');
    }
}
