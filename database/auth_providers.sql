USE delivery;

CREATE TABLE auth_providers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    provider ENUM('GOOGLE','CREDENTIALS') NOT NULL,
    provider_id VARCHAR(255),
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    UNIQUE KEY unique_provider(provider, provider_id)
);