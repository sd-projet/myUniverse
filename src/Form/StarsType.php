<?php

namespace App\Form;

use App\Entity\Stars;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\ColorType;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\Validator\Constraints\File;

class StarsType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('name')
            ->add('description')
            ->add('size')
            ->add('event_date', null, [
                'widget' => 'single_text',
            ])
            ->add('x_position')
            ->add('y_position')
            ->add('brightness')
            ->add('color', ColorType::class, [
                'label' => 'Couleur de l\'étoile',
                'attr' => [
                    'class' => 'form-control',
                ],
            ])
            ->add('modelFile', FileType::class, [
                'label' => 'Modèle 3D (GLB, OBJ, STL)',
                'mapped' => false,
                'required' => false,
                'constraints' => [
                    new File([
                        'maxSize' => '5M',
                        'mimeTypes' => [
                            'model/gltf-binary',
                            'model/gltf+json',
                            'model/stl',
                            'model/obj',
                        ],
                        'mimeTypesMessage' => 'Veuillez uploader un fichier 3D valide.',
                    ])
                ],
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Stars::class,
        ]);
    }
}
