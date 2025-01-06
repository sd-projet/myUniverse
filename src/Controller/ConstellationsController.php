<?php

namespace App\Controller;

use App\Entity\Constellations;
use App\Form\ConstellationsType;
use App\Repository\ConstellationsRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

// Restreindre l'accès à l'ensemble du contrôleur
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
    public function new(Request $request, EntityManagerInterface $entityManager): Response
    {
        $constellation = new Constellations();
        $form = $this->createForm(ConstellationsType::class, $constellation);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $constellation->setUser($this->getUser());  // Associer l'utilisateur connecté
            $constellation->setCreatedAtValue(new \DateTimeImmutable());
            $entityManager->persist($constellation);
            $entityManager->flush();

            return $this->redirectToRoute('app_constellations_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('constellations/new.html.twig', [
            'constellation' => $constellation,
            'form' => $form,
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
    public function edit(Request $request, Constellations $constellation, EntityManagerInterface $entityManager): Response
    {
        $form = $this->createForm(ConstellationsType::class, $constellation);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->flush();

            return $this->redirectToRoute('app_constellations_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('constellations/edit.html.twig', [
            'constellation' => $constellation,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'app_constellations_delete', methods: ['POST'])]
    public function delete(Request $request, Constellations $constellation, EntityManagerInterface $entityManager): Response
    {
        if ($this->isCsrfTokenValid('delete' . $constellation->getId(), $request->getPayload()->getString('_token'))) {
            $entityManager->remove($constellation);
            $entityManager->flush();
        }

        return $this->redirectToRoute('app_constellations_index', [], Response::HTTP_SEE_OTHER);
    }
}
