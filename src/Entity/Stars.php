<?php

namespace App\Entity;

use App\Repository\StarsRepository;
use Doctrine\ORM\Mapping as ORM;
use App\Entity\User;

#[ORM\Entity(repositoryClass: StarsRepository::class)]
class Stars
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id', referencedColumnName: 'id', nullable: false)]
    private ?User $user = null;

    #[ORM\Column]
    private ?int $constellation_id = null;

    #[ORM\ManyToOne(targetEntity: Constellations::class, inversedBy: 'stars')]
    #[ORM\JoinColumn(name: 'constellation_id', referencedColumnName: 'id', nullable: true)]
    private ?Constellations $constellation = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column]
    private ?float $x_position = null;

    #[ORM\Column]
    private ?float $y_position = null;

    #[ORM\Column]
    private ?float $z_position = null;

    #[ORM\Column]
    private ?float $brightness = null;

    #[ORM\Column(length: 20)]
    private ?string $color = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $created_at = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $updated_at = null;

    #[ORM\Column(length: 300)]
    private ?string $description = null;

    #[ORM\Column]
    private ?int $size = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $event_date = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $modelPath = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $imageUrl = null;


    public function __construct()
    {
        $this->created_at = new \DateTimeImmutable();
        $this->updated_at = new \DateTimeImmutable();
    }


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


    public function getConstellationId(): ?int
    {
        return $this->constellation_id;
    }

    public function setConstellationId(int $constellation_id): static
    {
        $this->constellation_id = $constellation_id;

        return $this;
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

    public function getXPosition(): ?float
    {
        return $this->x_position;
    }

    public function setXPosition(float $x_position): static
    {
        $this->x_position = $x_position;

        return $this;
    }

    public function getYPosition(): ?float
    {
        return $this->y_position;
    }

    public function setYPosition(float $y_position): static
    {
        $this->y_position = $y_position;

        return $this;
    }

    public function getZPosition(): ?float
    {
        return $this->z_position;
    }

    public function setZPosition(float $z_position): static
    {
        $this->z_position = $z_position;

        return $this;
    }

    public function getBrightness(): ?float
    {
        return $this->brightness;
    }

    public function setBrightness(float $brightness): static
    {
        $this->brightness = $brightness;

        return $this;
    }

    public function getColor(): ?string
    {
        return $this->color;
    }

    public function setColor(string $color): static
    {
        $this->color = $color;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->created_at;
    }

    public function setCreatedAt(\DateTimeImmutable $created_at): static
    {
        $this->created_at = $created_at;

        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updated_at;
    }

    public function setUpdatedAt(\DateTimeImmutable $updated_at): static
    {
        $this->updated_at = $updated_at;

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

    public function getSize(): ?int
    {
        return $this->size;
    }

    public function setSize(int $size): static
    {
        $this->size = $size;

        return $this;
    }

    public function getEventDate(): ?\DateTimeImmutable
    {
        return $this->event_date;
    }

    public function setEventDate(\DateTimeImmutable $event_date): static
    {
        $this->event_date = $event_date;

        return $this;
    }

    public function getModelPath(): ?string
    {
        return $this->modelPath;
    }

    public function setModelPath(string $modelPath): static
    {
        $this->modelPath = $modelPath;
        return $this;
    }

    public function __toString(): string
    {
        return $this->name ?? 'Unnamed Star'; // Retourne le nom de l'étoile
    }

    public function getStarProperties(): array
    {
        return [
            'name' => $this->name,
            'description' => $this->description,
            'size' => $this->size,
            'color' => $this->color,
            'brightness' => $this->brightness,
            'event_date' => $this->event_date->format('Y-m-d'),
            'x_position' => $this->x_position,
            'y_position' => $this->y_position,
            'modelPath' => $this->modelPath,
        ];
    }

    public function getConstellation(): ?Constellations
    {
        return $this->constellation;
    }

    public function setConstellation(?Constellations $constellation): self
    {
        $this->constellation = $constellation;
        return $this;
    }

    public function getImageUrl(): ?string
    {
        return $this->imageUrl;
    }

    public function setImageUrl(?string $imageUrl): self
    {
        $this->imageUrl = $imageUrl;

        return $this;
    }
}
