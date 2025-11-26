-- Make company_id nullable in jobs table to allow admin-posted jobs without a company
ALTER TABLE jobs ALTER COLUMN company_id DROP NOT NULL;