<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\HttpFoundation\Request;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use App\Form\UserType;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use App\Service\CloudinaryService;

class UserController extends AbstractController
{
    #[Route('/parametres', name: 'app_user_settings')]
    #[IsGranted('ROLE_USER')]
    public function settings(
        Request $request, 
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher,
        CloudinaryService $cloudinaryService
         ): Response
    {
        $user = $this->getUser(); // Récupère l'utilisateur connecté

        $form = $this->createForm(UserType::class, $user);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            
            // Gestion du mot de passe
            $plainPassword = $form->get('plainPassword')->getData();
            $confirmPassword = $form->get('confirmPassword')->getData();

            if ($plainPassword && $plainPassword !== $confirmPassword) {
                $this->addFlash('error', 'Les mots de passe ne correspondent pas.');
                return $this->redirectToRoute('app_user_settings'); // Évite de continuer l'exécution
            }

            if ($plainPassword) {
                $hashedPassword = $passwordHasher->hashPassword($user, $plainPassword);
                $user->setPassword($hashedPassword);
            }

            /** @var UploadedFile|null $profilePictureFile */
            $profilePictureFile = $form->get('profilePicture')->getData();

            if ($profilePictureFile) {
                try {
                    $result = $cloudinaryService->upload(
                        $profilePictureFile->getPathname()
                    );

                    $user->setProfilePicture($result['secure_url']);

                } catch (\Throwable $e) {
                    $this->addFlash(
                        'error',
                        'Erreur Cloudinary : ' . $e->getMessage()
                    );

                    return $this->redirectToRoute('app_user_settings');
                }
            }

            // Sauvegarde dans la BDD
            $entityManager->persist($user);
            $entityManager->flush();

            $this->addFlash('success', 'Profil mis à jour avec succès !');
            return $this->redirectToRoute('app_user_settings');
        }

        return $this->render('user/settings.html.twig', [
            'form' => $form->createView(),
        ]);
    }
}
