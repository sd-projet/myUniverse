<?php

namespace App\Controller;

use App\Repository\PartageRepository;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class HomeController extends AbstractController
{
    /*#[Route('/', name: 'app_home')]
    public function index(): Response
    {
        return $this->render('home/index.html.twig');
    }*/

    #[Route( '/',name: 'app_partage_all', methods: ['GET'])]
    public function indexHome(PartageRepository $partageRepository): Response
    {
        return $this->render('home/index.html.twig', [
            'partages' => $partageRepository->findAll(),
        ]);
    }

    #[Route('/dashboard', name: 'app_user_dashboard')]
    public function dashboard(): Response
    {
        return $this->render('dashboard/index.html.twig');
    }
}
