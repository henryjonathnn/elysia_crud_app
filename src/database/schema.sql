CREATE TABLE IF NOT EXISTS game_accounts (
    id SERIAL PRIMARY KEY,
    game_name VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL,
    level INTEGER,
    price BIGINT,
    description TEXT,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)