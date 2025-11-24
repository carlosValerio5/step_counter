CREATE TABLE IF NOT EXISTS user_profile (
    id INTEGER PRIMARY KEY,
    height_meters REAL,
    height_feet REAL,
    height_inches REAL,
    weight_kilos REAL,
    weight_pounds REAL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
);

CREATE INDEX IF NOT EXISTS user_profile_created_at ON user_profile 
(created_at);

CREATE INDEX IF NOT EXISTS user_profile_updated_at ON user_profile
(updated_at);

CREATE TABLE IF NOT EXISTS user_preferences (
    id INTEGER PRIMARY KEY,
    target_steps INTEGER,
    target_calories INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS user_preferences_created_at ON user_preferences 
(created_at);

CREATE INDEX IF NOT EXISTS user_preferences_updated_at ON user_preferences
(updated_at);