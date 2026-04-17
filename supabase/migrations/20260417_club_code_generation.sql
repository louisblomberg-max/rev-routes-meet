-- Auto-generate invite codes for clubs that don't have one
UPDATE clubs
SET invite_code = LOWER(SUBSTR(MD5(RANDOM()::TEXT), 1, 8))
WHERE invite_code IS NULL;
