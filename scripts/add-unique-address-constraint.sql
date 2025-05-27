-- Add unique constraint on normalized (lowercase) EVM addresses
-- This prevents future duplicate user records with different address casing

-- First, check for any remaining duplicates
-- (Run consolidate-duplicate-users.ts first if any are found)
SELECT 
    LOWER(evm_address) as normalized_address,
    COUNT(*) as user_count,
    STRING_AGG(id, ', ') as user_ids,
    STRING_AGG(evm_address, ', ') as addresses
FROM users 
WHERE evm_address IS NOT NULL 
GROUP BY LOWER(evm_address) 
HAVING COUNT(*) > 1;

-- If no duplicates exist, add the constraint
-- Note: This creates a functional index that enforces uniqueness on lowercase addresses

-- Option 1: Create a unique index on lowercase evm_address
CREATE UNIQUE INDEX CONCURRENTLY idx_users_evm_address_lower_unique 
ON users (LOWER(evm_address)) 
WHERE evm_address IS NOT NULL;

-- Option 2 (Alternative): Add a normalized column with constraint
-- ALTER TABLE users ADD COLUMN evm_address_normalized VARCHAR(42) GENERATED ALWAYS AS (LOWER(evm_address)) STORED;
-- CREATE UNIQUE INDEX idx_users_evm_address_normalized_unique ON users (evm_address_normalized);

-- Verify the constraint works
-- This should fail if you try to insert a duplicate address with different casing:
-- INSERT INTO users (id, evm_address) VALUES ('test-1', '0xABC123...'), ('test-2', '0xabc123...');

-- To remove the constraint later (if needed):
-- DROP INDEX idx_users_evm_address_lower_unique; 