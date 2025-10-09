/*
  # Correction des politiques RLS pour accès public

  1. Modifications
    - Suppression des anciennes politiques restrictives
    - Création de nouvelles politiques permettant l'accès public (anon)
    - Les utilisateurs anonymes peuvent maintenant gérer les données
  
  2. Sécurité
    - RLS reste activé sur les tables
    - Accès public autorisé pour tous les utilisateurs (anon et authenticated)
    
  3. Notes importantes
    - Cette configuration est adaptée pour une application à utilisateur unique
    - Pour une application multi-utilisateurs, l'authentification sera nécessaire
*/

-- Supprimer les anciennes politiques pour budget_lines
DROP POLICY IF EXISTS "Users can view all budget lines" ON budget_lines;
DROP POLICY IF EXISTS "Users can insert budget lines" ON budget_lines;
DROP POLICY IF EXISTS "Users can update budget lines" ON budget_lines;
DROP POLICY IF EXISTS "Users can delete budget lines" ON budget_lines;

-- Supprimer les anciennes politiques pour daily_expenses
DROP POLICY IF EXISTS "Users can view all daily expenses" ON daily_expenses;
DROP POLICY IF EXISTS "Users can insert daily expenses" ON daily_expenses;
DROP POLICY IF EXISTS "Users can update daily expenses" ON daily_expenses;
DROP POLICY IF EXISTS "Users can delete daily expenses" ON daily_expenses;

-- Nouvelles politiques pour budget_lines (accès public)
CREATE POLICY "Anyone can view budget lines"
  ON budget_lines FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert budget lines"
  ON budget_lines FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update budget lines"
  ON budget_lines FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete budget lines"
  ON budget_lines FOR DELETE
  TO anon, authenticated
  USING (true);

-- Nouvelles politiques pour daily_expenses (accès public)
CREATE POLICY "Anyone can view daily expenses"
  ON daily_expenses FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert daily expenses"
  ON daily_expenses FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update daily expenses"
  ON daily_expenses FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete daily expenses"
  ON daily_expenses FOR DELETE
  TO anon, authenticated
  USING (true);