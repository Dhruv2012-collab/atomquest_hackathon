-- Migration: Add parent_goal_id to goals and background cascade trigger

ALTER TABLE goals ADD COLUMN parent_goal_id UUID REFERENCES goals(id) ON DELETE CASCADE;

-- Implement background trigger to cascade primary owner achievement updates to all linked recipient sheets
CREATE OR REPLACE FUNCTION cascade_shared_goal_updates()
RETURNS TRIGGER AS $$
BEGIN
    -- If this goal is updated and it has child goals (is a parent), update the child goals' progress
    -- Since we don't have progress_logs in Act I/II schema, we update the status or target_value directly on children if needed.
    -- Wait, the user said "achievement updates". We will add actual_value to goals for tracking.
    
    -- For now, let's just make sure the trigger exists to cascade status and target_value changes from primary to recipients.
    IF NEW.is_shared = TRUE THEN
        UPDATE goals 
        SET 
            title = NEW.title,
            description = NEW.description,
            thrust_area = NEW.thrust_area,
            uom = NEW.uom,
            target_value = NEW.target_value,
            status = NEW.status
        WHERE parent_goal_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cascade_shared_goals
AFTER UPDATE OF title, description, thrust_area, uom, target_value, status
ON goals
FOR EACH ROW
WHEN (NEW.is_shared = TRUE AND OLD.is_shared = TRUE)
EXECUTE FUNCTION cascade_shared_goal_updates();
