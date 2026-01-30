/*
  # GRC Compliance Registry Schema

  ## Overview
  This migration creates the database schema for a GRC (Governance, Risk, and Compliance) 
  dashboard focused on finance compliance tracking with support for other compliance categories.

  ## New Tables
  
  ### `compliance_categories`
  Stores different compliance categories (e.g., Finance, IT, Legal)
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Category name (e.g., "Finance", "IT Security")
  - `description` (text) - Category description
  - `color` (text) - Color code for UI display
  - `created_at` (timestamptz) - Record creation timestamp
  
  ### `compliance_items`
  Stores individual compliance requirements and their tracking information
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Owner of the compliance item
  - `category_id` (uuid, foreign key) - Reference to compliance category
  - `title` (text) - Compliance requirement title
  - `description` (text) - Detailed description
  - `status` (text) - Current status: 'compliant', 'non_compliant', 'in_progress', 'pending'
  - `priority` (text) - Priority level: 'low', 'medium', 'high', 'critical'
  - `due_date` (date) - Compliance deadline
  - `last_reviewed_date` (date) - Last review date
  - `assigned_to` (text) - Person/team responsible
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on all tables
  - Users can only view and manage their own compliance items
  - Categories are readable by all authenticated users

  ## Indexes
  - Index on user_id for fast queries
  - Index on category_id for filtering
  - Index on status for dashboard metrics
*/

-- Create compliance_categories table
CREATE TABLE IF NOT EXISTS compliance_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  color text DEFAULT '#3b82f6',
  created_at timestamptz DEFAULT now()
);

-- Create compliance_items table
CREATE TABLE IF NOT EXISTS compliance_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid REFERENCES compliance_categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('compliant', 'non_compliant', 'in_progress', 'pending')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  due_date date,
  last_reviewed_date date,
  assigned_to text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS compliance_items_user_id_idx ON compliance_items(user_id);
CREATE INDEX IF NOT EXISTS compliance_items_category_id_idx ON compliance_items(category_id);
CREATE INDEX IF NOT EXISTS compliance_items_status_idx ON compliance_items(status);
CREATE INDEX IF NOT EXISTS compliance_items_due_date_idx ON compliance_items(due_date);

-- Enable Row Level Security
ALTER TABLE compliance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for compliance_categories
CREATE POLICY "Categories are viewable by authenticated users"
  ON compliance_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Categories can be inserted by authenticated users"
  ON compliance_categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for compliance_items
CREATE POLICY "Users can view own compliance items"
  ON compliance_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own compliance items"
  ON compliance_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own compliance items"
  ON compliance_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own compliance items"
  ON compliance_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert default compliance categories - Finance compliance subcategories
INSERT INTO compliance_categories (name, description, color) VALUES
  ('Financial Reporting', 'Financial statements, disclosures, and reporting requirements', '#dc2626'),
  ('Tax Compliance', 'Tax filings, payments, and regulatory tax requirements', '#dc2626'),
  ('Audit & Controls', 'Internal controls, audit requirements, and risk management', '#000000'),
  ('Regulatory Compliance', 'Banking regulations, SOX, GAAP, and other financial regulations', '#dc2626'),
  ('Budget & Forecasting', 'Budget compliance, forecasting accuracy, and variance analysis', '#000000'),
  ('Accounts Payable/Receivable', 'AP/AR processes, payment terms, and collection compliance', '#dc2626'),
  ('Capital Management', 'Capital allocation, debt compliance, and liquidity requirements', '#000000')
ON CONFLICT DO NOTHING;
