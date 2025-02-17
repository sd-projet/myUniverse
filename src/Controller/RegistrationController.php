<?php

namespace App\Controller;

use App\Entity\User;
use App\Form\RegistrationFormType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;


class RegistrationController extends AbstractController
{
    #[Route('/register', name: 'app_register')]
    public function register(Request $request, UserPasswordHasherInterface $passwordHasher, EntityManagerInterface $entityManager): Response
    {
        $user = new User();
        $form = $this->createForm(RegistrationFormType::class, $user);
        $form->handleRequest($request);

        $response = new Response();
        $response->setCache([
            'no_cache' => true,
            'must_revalidate' => true,
            'no_store' => true,
        ]);

        if ($form->isSubmitted() && $form->isValid()) {
            // Hash le mot de passe
            $hashedPassword = $passwordHasher->hashPassword(
                $user,
                $form->get('password')->getData()
            );
            $user->setPassword($hashedPassword);

            // Attribution du rôle ROLE_USER
            $user->setRoles(['ROLE_USER']);

            // Enregistrement de l'utilisateur
            $entityManager->persist($user);
            $entityManager->flush();

            // Redirection vers la page de settings
            return $this->redirectToRoute('app_user_settings');
        }

        return $this->render('registration/register.html.twig', [
            'registrationForm' => $form->createView(),
            $response
        ]);
    }
}