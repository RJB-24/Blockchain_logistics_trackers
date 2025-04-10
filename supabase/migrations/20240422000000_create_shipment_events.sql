
-- Create tables for blockchain supply chain management

-- Table for shipment events
CREATE TABLE IF NOT EXISTS shipment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  blockchain_tx_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for faster queries
CREATE INDEX shipment_events_shipment_id_idx ON shipment_events(shipment_id);
CREATE INDEX shipment_events_event_type_idx ON shipment_events(event_type);
CREATE INDEX shipment_events_created_at_idx ON shipment_events(created_at);

-- Set up RLS policies
ALTER TABLE shipment_events ENABLE ROW LEVEL SECURITY;

-- Everyone can view events
CREATE POLICY "Events are viewable by all authenticated users"
ON shipment_events
FOR SELECT
TO authenticated
USING (true);

-- Only managers and drivers can create events
CREATE POLICY "Managers and drivers can create events"
ON shipment_events
FOR INSERT
TO authenticated
WITH CHECK (
  (
    SELECT role FROM user_roles WHERE user_id = auth.uid() AND role IN ('manager', 'driver')
  ) IS NOT NULL
);

-- Create table for shipment documents
CREATE TABLE IF NOT EXISTS shipment_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL,
  document_hash TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  blockchain_tx_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Add indexes for faster queries
CREATE INDEX shipment_documents_shipment_id_idx ON shipment_documents(shipment_id);
CREATE INDEX shipment_documents_document_type_idx ON shipment_documents(document_type);

-- Set up RLS policies
ALTER TABLE shipment_documents ENABLE ROW LEVEL SECURITY;

-- Documents are viewable by authenticated users
CREATE POLICY "Documents are viewable by all authenticated users"
ON shipment_documents
FOR SELECT
TO authenticated
USING (true);

-- Only managers can create documents
CREATE POLICY "Managers can create documents"
ON shipment_documents
FOR INSERT
TO authenticated
WITH CHECK (
  (
    SELECT role FROM user_roles WHERE user_id = auth.uid() AND role = 'manager'
  ) IS NOT NULL
);

-- Create table for smart contracts
CREATE TABLE IF NOT EXISTS smart_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id TEXT NOT NULL UNIQUE,
  contract_type TEXT NOT NULL,
  parties TEXT[] NOT NULL,
  terms JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'created',
  blockchain_tx_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for faster queries
CREATE INDEX smart_contracts_contract_type_idx ON smart_contracts(contract_type);
CREATE INDEX smart_contracts_status_idx ON smart_contracts(status);
CREATE INDEX smart_contracts_parties_idx ON smart_contracts USING GIN (parties);

-- Set up RLS policies
ALTER TABLE smart_contracts ENABLE ROW LEVEL SECURITY;

-- Contracts are viewable by authenticated users
CREATE POLICY "Contracts are viewable by all authenticated users"
ON smart_contracts
FOR SELECT
TO authenticated
USING (true);

-- Only managers can create contracts
CREATE POLICY "Managers can create contracts"
ON smart_contracts
FOR INSERT
TO authenticated
WITH CHECK (
  (
    SELECT role FROM user_roles WHERE user_id = auth.uid() AND role = 'manager'
  ) IS NOT NULL
);

-- Only managers can update contracts
CREATE POLICY "Managers can update contracts"
ON smart_contracts
FOR UPDATE
TO authenticated
USING (
  (
    SELECT role FROM user_roles WHERE user_id = auth.uid() AND role = 'manager'
  ) IS NOT NULL
);
