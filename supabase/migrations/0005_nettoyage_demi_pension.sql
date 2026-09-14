-- 14/09/2026 : nettoyage du projet Supabase cavalons-platform, désormais dédié à Cavalons Ventes.
-- Tous les objets de l'ancienne plateforme demi-pension (41 tables, 40 fonctions, 24 types, vue, déclencheur
-- d'inscription, politiques de stockage, 7 comptes de démonstration, historique de migrations) ont été supprimés
-- après sauvegarde (archive remise à la propriétaire). Les buckets vides « documents », « inspections », « journal »
-- et « photos » sont à supprimer depuis le tableau de bord Storage (impossible en SQL).
-- Cette migration est documentaire : la suppression a été exécutée directement sur le projet.
select 1;
