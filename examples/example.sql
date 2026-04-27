-- Flatwhite theme preview — SQL

CREATE TABLE users (
    id         SERIAL PRIMARY KEY,
    email      TEXT        NOT NULL UNIQUE,
    username   TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    role       TEXT        NOT NULL DEFAULT 'viewer',
    active     BOOLEAN     NOT NULL DEFAULT TRUE
);

CREATE TABLE posts (
    id          SERIAL PRIMARY KEY,
    author_id   INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       TEXT        NOT NULL,
    body        TEXT        NOT NULL DEFAULT '',
    published   BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tags (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE post_tags (
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag_id  INTEGER NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

CREATE INDEX idx_posts_author    ON posts(author_id);
CREATE INDEX idx_posts_published ON posts(published, created_at DESC);

-- Published posts with tag counts and author info
SELECT
    p.id,
    p.title,
    u.username         AS author,
    p.created_at,
    COUNT(pt.tag_id)   AS tag_count
FROM posts p
JOIN users           u  ON u.id  = p.author_id
LEFT JOIN post_tags  pt ON pt.post_id = p.id
WHERE
    p.published = TRUE
    AND u.active = TRUE
GROUP BY p.id, p.title, u.username, p.created_at
ORDER BY p.created_at DESC
LIMIT 20;

-- Top authors by published post count in the last 30 days
WITH recent AS (
    SELECT author_id, COUNT(*) AS post_count
    FROM posts
    WHERE published = TRUE
      AND created_at >= NOW() - INTERVAL '30 days'
    GROUP BY author_id
)
SELECT
    u.username,
    u.email,
    r.post_count
FROM recent r
JOIN users u ON u.id = r.author_id
ORDER BY r.post_count DESC
LIMIT 10;

-- Upsert user
INSERT INTO users (email, username, role)
VALUES ('alice@example.com', 'alice', 'editor')
ON CONFLICT (email) DO UPDATE
    SET username = EXCLUDED.username,
        role     = EXCLUDED.role;
