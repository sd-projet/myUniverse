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
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Psr\Log\LoggerInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;


#[IsGranted('IS_AUTHENTICATED_FULLY')] #  restriction pour que seuls les utilisateurs connectés puissent accéder aux pages du CRUD.

#[Route('/stars')]
final class StarsController extends AbstractController
{
    #[Route(name: 'app_user_stars', methods: ['GET'])]
    public function index(StarsRepository $starsRepository): Response
    {
        $user = $this->getUser();
        return $this->render('stars/index.html.twig', [
            //'stars' => $starsRepository->findAll(),
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
            $star->setUser($this->getUser());  // Associer l'utilisateur connecté

            $modelFile = $form->get('modelFile')->getData();
    
            if ($modelFile) {
                $newFilename = uniqid() . '.' . $modelFile->guessExtension();
                
                try {
                    $modelFile->move(
                        $this->getParameter('models_directory'), // Défini dans services.yaml
                        $newFilename
                    );
                    $star->setModelPath($newFilename);
                } catch (FileException $e) {
                    $this->addFlash('error', 'Erreur lors de l’upload du modèle.');
                }
            }  
            $entityManager->persist($star);
            $entityManager->flush();

           return $this->redirectToRoute('app_user_stars', [], Response::HTTP_SEE_OTHER);
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
