/*
  # Création des tables de gestion de budget

  1. Nouvelles Tables
    - `budget_lines`
      - `id` (uuid, primary key)
      - `description` (text) - Nom de la ligne budgétaire (ex: Loyer)
      - `category` (text) - Catégorie (ex: Logement & charges fixes)
      - `planned_amount` (numeric) - Montant budgété
      - `created_at` (timestamptz)
    
    - `daily_expenses`
      - `id` (uuid, primary key)
      - `budget_line_id` (uuid, foreign key) - Référence à la ligne budgétaire
      - `amount` (numeric) - Montant de la dépense
      - `description` (text) - Description de la dépense
      - `expense_date` (date) - Date de la dépense
      - `created_at` (timestamptz)
  
  2. Sécurité
    - Enable RLS sur les deux tables
    - Les utilisateurs authentifiés peuvent gérer toutes les données
    
  3. Notes importantes
    - Les dépenses journalières sont liées aux lignes budgétaires
    - Le calcul du pourcentage de dépense se fait côté application
    - Les jauges afficheront la somme des dépenses par rapport au montant planifié
*/

-- Création de la table budget_lines
CREATE TABLE IF NOT EXISTS budget_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL,
  category text NOT NULL,
  planned_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Création de la table daily_expenses
CREATE TABLE IF NOT EXISTS daily_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_line_id uuid REFERENCES budget_lines(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  description text NOT NULL,
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE budget_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_expenses ENABLE ROW LEVEL SECURITY;

-- Politiques pour budget_lines
CREATE POLICY "Users can view all budget lines"
  ON budget_lines FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert budget lines"
  ON budget_lines FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update budget lines"
  ON budget_lines FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete budget lines"
  ON budget_lines FOR DELETE
  TO authenticated
  USING (true);

-- Politiques pour daily_expenses
CREATE POLICY "Users can view all daily expenses"
  ON daily_expenses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert daily expenses"
  ON daily_expenses FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update daily expenses"
  ON daily_expenses FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete daily expenses"
  ON daily_expenses FOR DELETE
  TO authenticated
  USING (true);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_daily_expenses_budget_line_id ON daily_expenses(budget_line_id);
CREATE INDEX IF NOT EXISTS idx_daily_expenses_expense_date ON daily_expenses(expense_date);