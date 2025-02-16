<?php

namespace App\Controller;

use App\Entity\Partage;
use App\Form\PartageType;
use App\Repository\PartageRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\HttpFoundation\JsonResponse;


#[IsGranted('IS_AUTHENTICATED_FULLY')] #  restriction pour que seuls les utilisateurs connectés puissent accéder aux pages du CRUD.
#[Route('/partage')]
final class PartageController extends AbstractController
{
    #[Route(name: 'app_partage_index', methods: ['GET'])]
    public function index(PartageRepository $partageRepository): Response
    {
        return $this->render('partage/index.html.twig', [
            'partages' => $partageRepository->findAll(),
        ]);
    }

    #[Route('/new', name: 'app_partage_new', methods: ['GET', 'POST'])]
    public function new(Request $request, EntityManagerInterface $entityManager, Security $security): Response
    {
        $user = $security->getUser();

        $partage = new Partage();
        $form = $this->createForm(PartageType::class, $partage);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
             // Associer l'utilisateur connecté au post
            $partage->setUser($user);
            $partage->setCreatedAt(new \DateTimeImmutable());
        
            $entityManager->persist($partage);
            $entityManager->flush();

            return $this->redirectToRoute('app_partage_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('partage/new.html.twig', [
            'partage' => $partage,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'app_partage_show', methods: ['GET'])]
    public function show(Partage $partage): Response
    {
        return $this->render('partage/show.html.twig', [
            'partage' => $partage,
        ]);
    }

    #[Route('/{id}/edit', name: 'app_partage_edit', methods: ['GET', 'POST'])]
    public function edit(Request $request, Partage $partage, EntityManagerInterface $entityManager): Response
    {
        $form = $this->createForm(PartageType::class, $partage);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->flush();

            return $this->redirectToRoute('app_partage_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('partage/edit.html.twig', [
            'partage' => $partage,
            'form' => $form,
        ]);
    }

    #[Route('/save-image', name: 'save_image', methods: ['POST'])]
    public function saveImage(Request $request, EntityManagerInterface $entityManager, Security $security): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['image'])) {
            return new JsonResponse(['error' => 'Aucune image reçue'], Response::HTTP_BAD_REQUEST);
        }

        // Extraction de l'image Base64
        if (!preg_match('/^data:image\/png;base64,/', $data['image'])) {
            return new JsonResponse(['error' => 'Format d\'image invalide'], Response::HTTP_BAD_REQUEST);
        }

        $base64 = str_replace('data:image/png;base64,', '', $data['image']);
        $decodedImage = base64_decode($base64);

        if ($decodedImage === false) {
            return new JsonResponse(['error' => 'Échec du décodage de l\'image'], Response::HTTP_BAD_REQUEST);
        }

        // Nom du fichier unique
        $fileName = 'image_' . uniqid() . '.png';
        $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads/images/';

        if (!is_dir($uploadDir) && !mkdir($uploadDir, 0777, true) && !is_dir($uploadDir)) {
            return new JsonResponse(['error' => 'Impossible de créer le répertoire d\'upload'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        $filePath = $uploadDir . $fileName;

        // Enregistrement du fichier
        if (file_put_contents($filePath, $decodedImage) === false) {
            return new JsonResponse(['error' => 'Échec de l\'enregistrement de l\'image'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        $user = $security->getUser();

        // Sauvegarde en base de données
        $imageEntity = new Partage();

        $imageEntity->setUser($user);

        $imageEntity->setImageUrl($fileName);

        $entityManager->persist($imageEntity);
        $entityManager->flush();

        return new JsonResponse([
            'message' => 'Image enregistrée avec succès',
            'path' => '/uploads/images/' . $fileName
        ]);
    }

    #[Route('/{id}', name: 'app_partage_delete', methods: ['POST'])]
    public function delete(Request $request, Partage $partage, EntityManagerInterface $entityManager): Response
    {
        if ($this->isCsrfTokenValid('delete'.$partage->getId(), $request->getPayload()->getString('_token'))) {
            $entityManager->remove($partage);
            $entityManager->flush();
        }

        return $this->redirectToRoute('app_partage_index', [], Response::HTTP_SEE_OTHER);
    }
}
