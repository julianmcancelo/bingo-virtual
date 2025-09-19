-- Add game_id column to logs_partidas if it doesn't exist
ALTER TABLE `logs_partidas` 
ADD COLUMN IF NOT EXISTS `game_id` VARCHAR(255) NULL AFTER `partida_id`,
ADD INDEX IF NOT EXISTS `idx_logs_game_id` (`game_id`);

-- Add any other missing columns or indexes
-- This ensures the schema matches what the code expects
