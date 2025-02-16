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

            $partage->setImageUrl(
                $partage->getStar() ? $partage->getStar()->getImageUrl() : 
                ($partage->getConstellation() ? $partage->getConstellation()->getImageUrl() : null)
            );
            
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
    public function edit(Request $request, Partage $partage, EntityManagerInterface $entityManager, Security $security): Response
    {
        $user = $security->getUser();

        $form = $this->createForm(PartageType::class, $partage);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $partage->setUser($user);

            $partage->setImageUrl(
                $partage->getStar() ? $partage->getStar()->getImageUrl() : 
                ($partage->getConstellation() ? $partage->getConstellation()->getImageUrl() : null)
            );
            
            $entityManager->flush();

            return $this->redirectToRoute('app_partage_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('partage/edit.html.twig', [
            'partage' => $partage,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'app_partage_delete', methods: ['POST'])]
    public function delete(Request $request, Partage $partage, EntityManagerInterface $entityManager): Response
    {
        if ($this->isCsrfTokenValid('delete' . $partage->getId(), $request->getPayload()->getString('_token'))) {
            $entityManager->remove($partage);
            $entityManager->flush();
        }

        return $this->redirectToRoute('app_partage_index', [], Response::HTTP_SEE_OTHER);
    }
}
