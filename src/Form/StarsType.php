<?php

namespace App\Form;

use App\Entity\Stars;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\ColorType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\NumberType;

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
            ->add('x_position', NumberType::class, [
                'label' => 'Position X',
                'scale' => 1,
                'html5' => true,
                'attr' => [
                    'step' => '0.5',
                ],
            ])

            ->add('y_position', NumberType::class, [
                'label' => 'Position Y',
                'scale' => 1,
                'html5' => true,
                'attr' => [
                    'step' => '0.5',
                ],
            ])

            ->add('z_position', NumberType::class, [
                'label' => 'Position Z',
                'scale' => 1,
                'html5' => true,
                'attr' => [
                    'step' => '0.5',
                ],
            ])
            // ->add('brightness')
            ->add('brightness', ChoiceType::class, [
                'label' => 'Brillance',
                'choices' => [
                    'Aucune' => 0,
                    'Faible' => 0.5,
                    'Normale' => 1,
                    'Forte' => 1.5,
                    'Très forte' => 2,
                ],
            ])
            ->add('color', ColorType::class, [
                'label' => 'Couleur de l\'étoile',
                'attr' => [
                    'class' => 'form-control',
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
