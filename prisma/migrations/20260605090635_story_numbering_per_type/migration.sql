-- Numérotation des stories : séquence propre par projet ET par type (FEATURE-1, FIX-1)
-- Avant : storyNumber reposait sur une séquence autoincrement globale (numéros à trous
-- par projet, partagés entre FEATURE et FIX). Désormais le numéro est calculé
-- applicativement, par (projectId, type).
--
-- Migration écrite de façon défensive/idempotente : elle fonctionne que la colonne
-- possède ou non un défaut de séquence, et que l'ancien index existe ou non.

-- 1. Retirer le défaut (séquence autoincrement) — no-op si absent.
ALTER TABLE "stories" ALTER COLUMN "storyNumber" DROP DEFAULT;

-- 2. Supprimer l'ancienne contrainte unique (par projet, tous types confondus).
DROP INDEX IF EXISTS "stories_projectId_storyNumber_key";

-- 3. Re-numéroter les stories existantes en séquences propres par (projet, type).
--    ⚠️ Change les identifiants visibles existants (ex. FEATURE-12 → FEATURE-3).
--    Pour conserver les numéros existants et ne corriger que les futures stories,
--    retirer ce bloc avant d'appliquer la migration.
WITH renumbered AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY "projectId", "type"
           ORDER BY "storyNumber", "createdAt"
         ) AS num
  FROM "stories"
)
UPDATE "stories" s
SET "storyNumber" = r.num
FROM renumbered r
WHERE s.id = r.id;

-- 4. Nouvelle contrainte unique : numéro unique par projet ET par type.
CREATE UNIQUE INDEX IF NOT EXISTS "stories_projectId_type_storyNumber_key"
  ON "stories"("projectId", "type", "storyNumber");
