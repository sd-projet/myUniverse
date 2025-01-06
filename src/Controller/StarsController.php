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

#[Route('/stars')]
final class StarsController extends AbstractController
{
    #[Route(name: 'app_user_stars', methods: ['GET'])]
    public function index(StarsRepository $starsRepository): Response
    {
        return $this->render('stars/index.html.twig', [
            'stars' => $starsRepository->findAll(),
        ]);
    }

    #[Route('/new', name: 'app_stars_new', methods: ['GET', 'POST'])]
    public function new(Request $request, EntityManagerInterface $entityManager): Response
    {
        $star = new Stars();
        $form = $this->createForm(StarsType::class, $star);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->persist($star);
            $entityManager->flush();

            return $this->redirectToRoute('app_user_stars', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('stars/new.html.twig', [
            'star' => $star,
            'form' => $form,
        ]);
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
            $entityManager->flush();

            return $this->redirectToRoute('app_user_stars', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('stars/edit.html.twig', [
            'star' => $star,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'app_stars_delete', methods: ['POST'])]
    public function delete(Request $request, Stars $star, EntityManagerInterface $entityManager): Response
    {
        if ($this->isCsrfTokenValid('delete'.$star->getId(), $request->getPayload()->getString('_token'))) {
            $entityManager->remove($star);
            $entityManager->flush();
        }

        return $this->redirectToRoute('app_stars_index', [], Response::HTTP_SEE_OTHER);
    }
}
