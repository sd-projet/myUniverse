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

                $entityManager->persist($constellation);
                $entityManager->flush();

                return $this->redirectToRoute('app_user_constellations', [], Response::HTTP_SEE_OTHER);
            } catch (\Exception $e) {
                $this->addFlash('danger', 'Une erreur est survenue lors de la création de la constellation.');
            }
        }

        return $this->render('constellations/new.html.twig', [
            'form' => $form->createView(),
            'etoiles_json' => json_encode($constellation->getEtoile() ?? []), // Vérification pour éviter les erreurs JS
            'userStars' => $userStars

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
                            $uniqueEtoiles[$etoile['name']] = $etoile;
                        }
                    }
                    $constellation->setEtoile(array_values($uniqueEtoiles));
                } else {
                    $this->addFlash('danger', 'Les données des étoiles sont invalides.');
                }
            }

            $entityManager->flush();

            return $this->redirectToRoute('app_user_constellations', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('constellations/edit.html.twig', [
            'constellation' => $constellation,
            'form' => $form->createView(),
            'etoiles_json' => json_encode($constellation->getEtoile() ?? []), // Vérification pour éviter les erreurs JS
            'userStars' => $userStars,
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
