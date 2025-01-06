<?php

namespace App\Entity;

use App\Repository\ConstellationsRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ConstellationsRepository::class)]
#[ORM\HasLifecycleCallbacks]  // Permet d'utiliser les événements de Doctrine
class Constellations
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id', referencedColumnName: 'id', nullable: false)]
    private ?User $user = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column(length: 255)]
    private ?string $description = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private ?\DateTimeImmutable $created_at = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private ?\DateTimeImmutable $updated_at = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setUser(User $user): static
    {
        $this->user = $user;
        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): static
    {
        $this->description = $description;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->created_at;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updated_at;
    }

    #[ORM\PrePersist]  // Exécuté avant qu'une entité soit insérée en base de données
    public function setCreatedAtValue(): void
    {
        $this->created_at = new \DateTimeImmutable();
        $this->updated_at = new \DateTimeImmutable(); // Aussi initialisé lors de la création
    }

    #[ORM\PreUpdate]  // Exécuté avant qu'une entité soit mise à jour
    public function setUpdatedAtValue(): void
    {
        $this->updated_at = new \DateTimeImmutable();
    }
}
