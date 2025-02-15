<?php

namespace App\Form;

use App\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\Validator\Constraints\File;


class UserType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
        ->add('profilePicture', FileType::class, [
            'label' => 'Photo de profil',
            'mapped' => false,
            'required' => false,
            'attr' => [
                'class' => 'dropzone',
            ],
            'constraints' => [
                new File([
                    'maxSize' => '2M',
                    'mimeTypes' => ['image/jpeg', 'image/png', 'image/webp'],
                    'mimeTypesMessage' => 'Veuillez télécharger une image valide (JPG, PNG, WEBP).',
                ]),
            ],
        ])
        ->add('name', TextType::class, [
            'constraints' => [
                new Assert\NotBlank(),
                new Assert\Length(['max' => 100]),
            ],
            'label' => 'Nom utilisateur', // Label pour le champ 'name'
        ])
        ->add('email', EmailType::class, [
            'constraints' => [
                new Assert\NotBlank(),
                new Assert\Email(),
            ],
            'label' => 'Adresse email',
        ])
            ->add('plainPassword', PasswordType::class, [
                'label' => 'Nouveau mot de passe',
                'mapped' => false,
                'required' => false,
                'attr' => ['class' => 'password-field']
            ])
            
            ->add('confirmPassword', PasswordType::class, [
                'label' => 'Confirmer le nouveau mot de passe',
                'mapped' => false,
                'required' => false,
                'attr' => ['id' => 'confirmPassword'],
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => User::class,
        ]);
    }
}
