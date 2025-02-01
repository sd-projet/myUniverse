<?php

namespace App\Form;

use App\Entity\Constellations;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Bundle\SecurityBundle\Security;

use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use App\Entity\Stars;

class ConstellationsType extends AbstractType
{
    private Security $security;


    public function __construct(Security $security)
    {
        $this->security = $security;
    }

    public function buildForm(FormBuilderInterface $builder, array $options): void
    {/*
        $builder
            //->add('user_id')
            ->add('name')
            ->add('description')
            ->add('etoile')
           /* ->add('created_at', null, [
                'widget' => 'single_text',
            ])
            ->add('updated_at', null, [
                'widget' => 'single_text',
            ])
        ;*/
        
        $builder
            ->add('name', TextType::class, [
                'label' => 'Nom de la Constellation',
                'attr' => ['placeholder' => 'Nom de votre constellation']
            ])
            ->add('description', TextareaType::class, [
                'label' => 'Description',
                'attr' => ['placeholder' => 'Décrivez votre constellation']
            ])
            
            ->add('etoile', ChoiceType::class, [
                'label' => 'Ajouter des étoiles',
                'choices' => $options['user_stars'], // Tableau d'objets Stars
                'choice_label' => 'name', // Affiche le nom de chaque étoile
                //'choice_value' => 'id', // Utilise l'ID de l'étoile comme valeur
                'multiple' => true, // Permet la sélection multiple
                'expanded' => false, // Affichage sous forme de cases à cocher
                'attr' => ['class' => 'etoile-select'],
            ]);
           
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Constellations::class,
            'user_stars' => [],
        ]);
    }
}
