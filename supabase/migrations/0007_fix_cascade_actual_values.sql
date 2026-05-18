-- Migration 0007: Fix cascade shared goal updates to include actual_value and calculated_score
-- This ensures that progress check-ins by the primary owner are automatically synchronized to child goals.

CREATE OR REPLACE FUNCTION public.cascade_shared_goal_updates()
RETURNS TRIGGER AS $$
DECLARE
    child RECORD;
    new_score NUMERIC;
    safe_actual NUMERIC;
    weight_num NUMERIC;
    target_num NUMERIC;
BEGIN
    -- If this goal is updated and it is a parent (has children), update the child goals
    IF NEW.is_shared = TRUE THEN
        FOR child IN SELECT * FROM public.goals WHERE parent_goal_id = NEW.id LOOP
            weight_num := child.weight;
            target_num := NEW.target_value;
            new_score := 0;

            IF NEW.uom = 'Numeric (Min)' OR NEW.uom = '% (Min)' OR NEW.uom = 'Numeric' OR NEW.uom = '%' THEN
                IF target_num > 0 THEN
                    new_score := (NEW.actual_value / target_num) * weight_num;
                END IF;
            ELSIF NEW.uom = 'Numeric (Max)' OR NEW.uom = '% (Max)' THEN
                IF NEW.actual_value = 0 THEN
                    safe_actual := 0.0001;
                ELSE
                    safe_actual := NEW.actual_value;
                END IF;
                new_score := (target_num / safe_actual) * weight_num;
            ELSIF NEW.uom = 'Zero-based' THEN
                IF NEW.actual_value = 0 THEN
                    new_score := weight_num;
                ELSE
                    new_score := 0;
                END IF;
            ELSIF NEW.uom = 'Timeline' THEN
                IF NEW.status = 'Completed' THEN
                    new_score := weight_num;
                ELSE
                    new_score := 0;
                END IF;
            END IF;

            -- Cap score at 150% of weight to prevent infinite/massive mathematical explosions
            IF new_score > weight_num * 1.5 THEN
                new_score := weight_num * 1.5;
            END IF;

            UPDATE public.goals 
            SET 
                title = NEW.title,
                description = NEW.description,
                thrust_area = NEW.thrust_area,
                uom = NEW.uom,
                target_value = NEW.target_value,
                status = NEW.status,
                actual_value = NEW.actual_value,
                calculated_score = new_score
            WHERE id = child.id;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger with the new column list
DROP TRIGGER IF EXISTS trg_cascade_shared_goals ON public.goals;

CREATE TRIGGER trg_cascade_shared_goals
AFTER UPDATE OF title, description, thrust_area, uom, target_value, status, actual_value, calculated_score
ON public.goals
FOR EACH ROW
WHEN (NEW.is_shared = TRUE AND OLD.is_shared = TRUE)
EXECUTE FUNCTION public.cascade_shared_goal_updates();
