<?php

namespace App\Controller;

use App\Entity\Constellations;
use App\Entity\Stars;
use App\Form\ConstellationsType;
use App\Repository\ConstellationsRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;

#[IsGranted('IS_AUTHENTICATED_FULLY')] #  restriction pour que seuls les utilisateurs connectés puissent accéder aux pages du CRUD.
#[Route('/constellations')]
final class ConstellationsController extends AbstractController
{
    #[Route(name: 'app_user_constellations', methods: ['GET'])]
    public function index(ConstellationsRepository $constellationsRepository): Response
    {
        /*return $this->render('constellations/index.html.twig', [
            'constellations' => $constellationsRepository->findAll(),
        ]);*/

        $user = $this->getUser();

        return $this->render('constellations/index.html.twig', [
            'constellations' => $constellationsRepository->findBy(['user' => $user]),
        ]);
    }

    #[Route('/new', name: 'app_constellations_new', methods: ['GET', 'POST'])]
    public function create(Request $request, EntityManagerInterface $entityManager, Security $security): Response
    {
        $user = $security->getUser();
        $userStars = $entityManager->getRepository(Stars::class)->findBy(['user' => $user]);

        $constellation = new Constellations();
        $form = $this->createForm(ConstellationsType::class, $constellation, [
            'user_stars' => $userStars
        ]);

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            try {
                $constellation->setUser($user);
                $constellation->setCreatedAtValue(new \DateTimeImmutable());

                // Récupérer et valider les étoiles sélectionnées via le champ caché
                $etoileJson = $request->request->get('etoile_json');

                if (!empty($etoileJson)) {
                    $etoileArray = json_decode($etoileJson, true);

                    if (json_last_error() === JSON_ERROR_NONE && is_array($etoileArray)) {
                        // Suppression des doublons par nom
                        $etoileUniques = [];
                        foreach ($etoileArray as $etoile) {
                            if (!isset($etoileUniques[$etoile['name']])) {
                                $etoileUniques[$etoile['name']] = $etoile;
                            }
                        }
                        $constellation->setEtoile(array_values($etoileUniques));
                    } else {
                        $this->addFlash('danger', 'Les données des étoiles sont invalides.');
                    }
                }

                $linesJson = $request->request->get('lines_json');
                if (!empty($linesJson)) {
                    $linesArray = json_decode($linesJson, true);
                    if (json_last_error() === JSON_ERROR_NONE && is_array($linesArray)) {
                        $constellation->setLines($linesArray);
                    }
                }

                $entityManager->persist($constellation);
                $entityManager->flush();
                $entityManager->refresh($constellation);

                return $this->redirectToRoute('app_user_constellations', [], Response::HTTP_SEE_OTHER);
            } catch (\Exception $e) {
                $this->addFlash('danger', 'Une erreur est survenue lors de la création de la constellation.');
            }
        }

        return $this->render('constellations/new.html.twig', [
            'form' => $form->createView(),
            'etoiles_json' => json_encode($constellation->getEtoile() ?? []), // Vérification pour éviter les erreurs JS
            'userStars' => $userStars,
            'constellation' => $constellation,
        ]);
    }

    #[Route('/{id}', name: 'app_constellations_show', methods: ['GET'])]
    public function show(Constellations $constellation): Response
    {
        return $this->render('constellations/show.html.twig', [
            'constellation' => $constellation,
        ]);
    }

    #[Route('/{id}/edit', name: 'app_constellations_edit', methods: ['GET', 'POST'])]
    public function edit(Request $request, Constellations $constellation, EntityManagerInterface $entityManager, Security $security): Response
    {

        $user = $security->getUser();

        // Vérification si l'utilisateur est propriétaire de la constellation
        if ($constellation->getUser() !== $user) {
            throw $this->createAccessDeniedException("Vous n'avez pas l'autorisation de modifier cette constellation.");
        }

        $userStars = $entityManager->getRepository(Stars::class)->findBy(['user' => $user]);

        $form = $this->createForm(ConstellationsType::class, $constellation, [
            'user_stars' => $userStars
        ]);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            // Récupération et validation des étoiles sélectionnées
            $etoileJson = $request->request->get('etoile_json');

            if (!empty($etoileJson)) {
                $etoileArray = json_decode($etoileJson, true);

                if (json_last_error() === JSON_ERROR_NONE && is_array($etoileArray)) {
                    // Suppression des doublons en utilisant le nom comme clé
                    $uniqueEtoiles = [];
                    foreach ($etoileArray as $etoile) {
                        if (!isset($uniqueEtoiles[$etoile['name']])) {
                            $star = $entityManager->getRepository(Stars::class)->findOneBy(['name' => $etoile['name']]);
                            if ($star) {
                                $star->setXPosition($etoile['x']);
                                $star->setYPosition($etoile['y']);
                                $star->setZPosition($etoile['z'] ?? 0.0);
                                $entityManager->persist($star);
                            }

                            $uniqueEtoiles[$etoile['name']] = $etoile;
                        }
                    }
                    $constellation->setEtoile(array_values($uniqueEtoiles));
                } else {
                    $this->addFlash('danger', 'Les données des étoiles sont invalides.');
                }
            }

            $linesJson = $request->request->get('lines_json');
            if (!empty($linesJson)) {
                $linesArray = json_decode($linesJson, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($linesArray)) {
                    $constellation->setLines($linesArray);
                }
            }

            $entityManager->persist($constellation);
            $entityManager->flush();
            $entityManager->refresh($constellation);

            return $this->redirectToRoute('app_user_constellations', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('constellations/edit.html.twig', [
            'constellation' => $constellation,
            'form' => $form->createView(),
            'etoiles_json' => json_encode($constellation->getEtoile() ?? []), // Vérification pour éviter les erreurs JS
            'userStars' => $userStars,
        ]);
    }

    #[Route('/update-star', name: 'app_update_star', methods: ['POST'])]
    public function updateStarPosition(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['name'], $data['position'])) {
            return new JsonResponse(['error' => 'Données invalides'], Response::HTTP_BAD_REQUEST);
        }

        // Récupérer l'étoile via son nom
        $star = $entityManager->getRepository(Stars::class)->findOneBy(['name' => $data['name']]);

        if (!$star) {
            return new JsonResponse(['error' => 'Étoile non trouvée'], Response::HTTP_NOT_FOUND);
        }

        // Mise à jour de la position de l'étoile
        $star->setXPosition($data['position']['x']);
        $star->setYPosition($data['position']['y']);
        $star->setZPosition($data['position']['z']);

        $entityManager->persist($star);
        $entityManager->flush();

        // Mettre à jour la position de l'étoile dans la constellation
        $constellation = $entityManager->getRepository(Constellations::class)->findOneBy([
            'etoile' => $star
        ]);

        if ($constellation) {
            $starsInConstellation = $constellation->getEtoile();
            foreach ($starsInConstellation as $constellationStar) {
                if ($constellationStar->getName() === $star->getName()) {
                    $constellationStar->setXPosition($star->getXPosition());
                    $constellationStar->setYPosition($star->getYPosition());
                    $constellationStar->setZPosition($star->getZPosition());
                    $entityManager->persist($constellationStar);
                }
            }

            $entityManager->flush();
        }

        return new JsonResponse(['message' => 'Position mise à jour avec succès'], Response::HTTP_OK);
    }

    #[Route('/update-lines', name: 'app_update_lines', methods: ['POST'])]
    public function updateLines(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {

        $data = json_decode($request->getContent(), true);

        // Vérifier que l'ID et les lignes existent
        if (!$data || !isset($data['constellation_id']) || !isset($data['lines_etoiles'])) {
            return new JsonResponse(['error' => 'Données invalides'], Response::HTTP_BAD_REQUEST);
        }

        // Récupérer la constellation via l'ID
        $constellation = $entityManager->getRepository(Constellations::class)->find($data['constellation_id']);
        if (!$constellation) {
            return new JsonResponse(['error' => 'Constellation non trouvée'], Response::HTTP_NOT_FOUND);
        }

        // Mettre à jour les lignes
        $constellation->setLines($data['lines_etoiles']);
        $entityManager->persist($constellation);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Lignes mises à jour avec succès'], Response::HTTP_OK);
    }

    #[Route('/get-constellation-lines/{id}', name: 'app_get_constellation_lines', methods: ['GET'])]
    public function getConstellationLines(Constellations $constellation): JsonResponse
    {
        return new JsonResponse([
            'lines' => $constellation->getLines(),
            'etoile' => $constellation->getEtoile(),
        ]);
    }

    #[Route('/save-imageC/{id}', name: 'save_imageC', methods: ['POST'])]
    public function saveImageC(int $id, Request $request, EntityManagerInterface $entityManager, ConstellationsRepository $constellationsRepository): JsonResponse
    {
        // Récupérer les données de la requête
        $data = json_decode($request->getContent(), true);

        // Vérifier si l'image est présente dans les données
        if (!isset($data['image'])) {
            return new JsonResponse(['error' => 'Image manquante'], Response::HTTP_BAD_REQUEST);
        }

        $imageData = $data['image'];  // récupère l'image depuis les données

        // Traitement de l'image (par exemple, la décoder et l'enregistrer)
        $base64 = str_replace('data:image/png;base64,', '', $imageData);
        $decodedImage = base64_decode($base64);

        if ($decodedImage === false) {
            return new JsonResponse(['error' => 'Erreur lors du décodage de l\'image'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        // Sauvegarde de l'image dans un fichier (exemple)
        $fileName = 'constellations_' . $id . '.png';
        $filePath = 'uploads/images/' . $fileName;
        
        if (file_put_contents($filePath, $decodedImage) === false) {
            return new JsonResponse(['error' => 'Échec de l\'enregistrement de l\'image'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        // Mettre à jour l'entité avec le chemin de l'image
        $star = $constellationsRepository->find($id);
        $star->setImageUrl($filePath);
        $entityManager->flush();


        // Retourner une réponse JSON avec le chemin de l'image
        return new JsonResponse([
            'message' => 'Image enregistrée avec succès',
            'path' => $filePath
        ]);
    }


    #[Route('/{id}', name: 'app_constellations_delete', methods: ['POST'])]
    public function delete(Request $request, Constellations $constellation, EntityManagerInterface $entityManager): Response
    {
        if ($this->isCsrfTokenValid('delete' . $constellation->getId(), $request->getPayload()->getString('_token'))) {
            $entityManager->remove($constellation);
            $entityManager->flush();
        }

        return $this->redirectToRoute('app_user_constellations', [], Response::HTTP_SEE_OTHER);
    }
}
