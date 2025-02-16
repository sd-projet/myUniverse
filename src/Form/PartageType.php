<?php
// src/Form/PostType.php

namespace App\Form;

use App\Entity\Partage;
use App\Entity\Stars;
use App\Entity\Constellations;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Doctrine\ORM\EntityRepository;

class PartageType extends AbstractType
{
    private Security $security;

    public function __construct(Security $security)
    {
        $this->security = $security;
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $user = $this->security->getUser();

        $builder
            ->add('description', TextareaType::class, [
                'label' => 'Description',
            ])
            ->add('constellation', EntityType::class, [
                'class' => Constellations::class,
                'query_builder' => function (EntityRepository $er) use ($user) {
                    return $er->createQueryBuilder('c')
                        ->where('c.user = :user')
                        ->setParameter('user', $user);
                },
                'choice_label' => 'name',
                'placeholder' => 'Choisir une constellation (facultatif)',
                'required' => false,
            ])
            ->add('star', EntityType::class, [
                'class' => Stars::class,
                'query_builder' => function (EntityRepository $er) use ($user) {
                    return $er->createQueryBuilder('s')
                        ->where('s.user = :user')
                        ->setParameter('user', $user);
                },
                'choice_label' => 'name',
                'placeholder' => 'Choisir une étoile (facultatif)',
                'required' => false,
            ])
            ->add('submit', SubmitType::class, ['label' => 'Publier']);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => Partage::class,
        ]);
    }
}
