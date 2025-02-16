<?php

namespace App\Entity;

use App\Repository\PartageRepository;
use Doctrine\ORM\Mapping as ORM;


#[ORM\Entity(repositoryClass: PartageRepository::class)]
class Partage
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    //#[ORM\Column(length: 255)]
    //private ?string $user = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id', referencedColumnName: 'id', nullable: false)]
    private ?User $user = null;

    #[ORM\ManyToOne(targetEntity: Stars::class)]
    #[ORM\JoinColumn(nullable: true)] // Peut être null si c'est une constellation
    private ?Stars $star = null;

    #[ORM\ManyToOne(targetEntity: Constellations::class)]
    #[ORM\JoinColumn(nullable: true)] // Peut être null si c'est une étoile
    private ?Constellations $constellation = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $description = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $imageUrl = null;

    #[ORM\Column]
    private array $data = [];

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): static
    {
        $this->id = $id;

        return $this;
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

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getStar(): ?Stars
    {
        return $this->star;
    }

    public function setStar(?Stars $star): static
    {
        $this->star = $star;

        return $this;
    }

    public function getConstellation(): ?Constellations
    {
        return $this->constellation;
    }

    public function setConstellation(?Constellations $constellation): static
    {
        $this->constellation = $constellation;

        return $this;
    }

    public function getImageUrl(): ?string
    {
        return $this->imageUrl;
    }

    public function setImageUrl(?string $imageUrl): static
    {
        $this->imageUrl = $imageUrl;

        return $this;
    }

    public function getData(): array
    {
        return $this->data;
    }

    public function setData(array $data): static
    {
        $this->data = $data;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }


}
