<?php

namespace App\Entity;

use App\Repository\ConstellationsRepository;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\EntityManagerInterface;


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

    #[ORM\Column(type: 'json')]
    private ?array $etoile = [];

    #[ORM\ManyToMany(targetEntity: Stars::class, inversedBy: 'constellations')]
    #[ORM\JoinTable(name: 'constellation_stars')]
    private Collection $stars;

    public function __construct()
    {
        $this->stars = new ArrayCollection();
    }

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

    #[ORM\PreUpdate]
    public function setUpdatedAtValue(): void
    {
        $this->updated_at = new \DateTimeImmutable();
    }

    public function getEtoile(): array
    {
        //return $this->etoile;
        return $this->etoile ?? [];
    }

    public function setEtoile(array $etoile): static
    {
        $this->etoile[] = $etoile;
        return $this;
    }

    public function getEtoileObjects(EntityManagerInterface $entityManager): array
    {
        if (empty($this->etoile)) {
            return [];
        }
        return $entityManager->getRepository(Stars::class)->findBy(['id' => $this->etoile]);
    }


    public function addStar(Stars $star): self
    {
        if (!$this->stars->contains($star)) {
            $this->stars[] = $star;
        }

        return $this;
    }
}
