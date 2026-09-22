<?php

namespace App\Controller;

use App\Entity\Stars;
use App\Form\StarsType;
use App\Repository\StarsRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Bundle\SecurityBundle\Security;

#[IsGranted('IS_AUTHENTICATED_FULLY')] #  restriction pour que seuls les utilisateurs connectés puissent accéder aux pages du CRUD.
#[Route('/stars')]
final class StarsController extends AbstractController
{
    #[Route(name: 'app_user_stars', methods: ['GET'])]
    public function index(StarsRepository $starsRepository): Response
    {
        $user = $this->getUser();
        return $this->render('stars/index.html.twig', [
            'stars' => $starsRepository->findBy(['user' => $user]),
        ]);
    }

    #[Route('/new', name: 'app_stars_new', methods: ['GET', 'POST'])]
    public function new(Request $request, EntityManagerInterface $entityManager): Response
    {
        $star = new Stars();
        $form = $this->createForm(StarsType::class, $star);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $star->setUser($this->getUser());

            $entityManager->persist($star);
            $entityManager->flush();

            return $this->redirectToRoute(
                'app_stars_edit',
                ['id' => $star->getId()],
                Response::HTTP_SEE_OTHER
            );
        }

        return $this->render('stars/new.html.twig', [
            'star' => $star,
            'form' => $form,
        ]);
    }

    #[Route('/get-star/{id}', name: 'get_star', methods: ['GET'])]
    public function getStar(Stars $star): JsonResponse
    {
        return new JsonResponse($star->getStarProperties());
    }


    #[Route('/{id}', name: 'app_stars_show', methods: ['GET'])]
    public function show(Stars $star): Response
    {
        return $this->render('stars/show.html.twig', [
            'star' => $star,
        ]);
    }

    #[Route('/{id}/edit', name: 'app_stars_edit', methods: ['GET', 'POST'])]
    public function edit(Request $request, Stars $star, EntityManagerInterface $entityManager): Response
    {
        $form = $this->createForm(StarsType::class, $star);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $star->setUpdatedAt(new \DateTimeImmutable());

            $entityManager->flush();

            return $this->redirectToRoute(
                'app_user_stars',
                [],
                Response::HTTP_SEE_OTHER
            );
        }

        return $this->render('stars/edit.html.twig', [
            'star' => $star,
            'form' => $form,
        ]);
    }


    #[Route('/save-image/{id}', name: 'save_image', methods: ['POST'])]
    public function saveImage(
        int $id,
        Request $request,
        EntityManagerInterface $entityManager,
        StarsRepository $starsRepository
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['image'])) {
            return new JsonResponse(
                ['error' => 'Image manquante'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $imageData = $data['image'];

        // Vérifier et retirer le préfixe de l'image Base64
        if (!str_starts_with($imageData, 'data:image/png;base64,')) {
            return new JsonResponse(
                ['error' => 'Format d\'image invalide'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $base64 = str_replace(
            'data:image/png;base64,',
            '',
            $imageData
        );

        $decodedImage = base64_decode($base64, true);

        if ($decodedImage === false) {
            return new JsonResponse(
                ['error' => 'Erreur lors du décodage de l\'image'],
                Response::HTTP_BAD_REQUEST
            );
        }

        // Récupérer l'étoile
        $star = $starsRepository->find($id);

        if (!$star) {
            return new JsonResponse(
                ['error' => 'Étoile introuvable'],
                Response::HTTP_NOT_FOUND
            );
        }

        if ($star->getUser() !== $this->getUser()) {
            return new JsonResponse(
                ['error' => 'Accès non autorisé'],
                Response::HTTP_FORBIDDEN
            );
        }

        // Dossier de sauvegarde
        $directory = $this->getParameter('kernel.project_dir')
            . '/public/uploads/images';

        if (!is_dir($directory)) {
            mkdir($directory, 0775, true);
        }

        $fileName = 'star_' . $id . '.png';

        $absolutePath = $directory . '/' . $fileName;
        $filePath = '/uploads/images/' . $fileName;

        // Sauvegarder réellement le PNG décodé
        if (file_put_contents($absolutePath, $decodedImage) === false) {
            return new JsonResponse(
                ['error' => 'Échec de l\'enregistrement de l\'image'],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }

        // Enregistrer le chemin dans la BDD
        $star->setImageUrl($filePath);

        $entityManager->flush();

        return new JsonResponse([
            'message' => 'Image enregistrée avec succès',
            'path' => $filePath
        ]);
    }

    #[Route('/{id}', name: 'app_stars_delete', methods: ['POST'])]
    public function delete(Request $request, Stars $star, EntityManagerInterface $entityManager): Response
    {
        if ($this->isCsrfTokenValid('delete' . $star->getId(), $request->getPayload()->getString('_token'))) {
            $entityManager->remove($star);
            $entityManager->flush();
        }

        return $this->redirectToRoute('app_user_stars', [], Response::HTTP_SEE_OTHER);
    }
}
