CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  game VARCHAR(255) NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_name VARCHAR(150) NOT NULL,
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  rating INTEGER NOT NULL CHECK (rating >= 0 AND rating <= 5),
  body TEXT NOT NULL,
  votes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_reviews_lower_title ON reviews (LOWER(title));
CREATE INDEX IF NOT EXISTS idx_reviews_lower_game ON reviews (LOWER(game));
CREATE INDEX IF NOT EXISTS idx_reviews_tags ON reviews USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews (created_at DESC);

CREATE TABLE IF NOT EXISTS review_votes (
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  value SMALLINT NOT NULL CHECK (value IN (-1, 1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (review_id, user_id)
);

CREATE OR REPLACE FUNCTION refresh_review_votes_count() RETURNS TRIGGER AS $$
DECLARE
  target UUID;
BEGIN
  target := COALESCE(NEW.review_id, OLD.review_id);
  UPDATE reviews
  SET votes_count = COALESCE((SELECT COALESCE(SUM(value), 0) FROM review_votes WHERE review_id = target), 0),
      updated_at = CURRENT_TIMESTAMP
  WHERE id = target;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_review_votes_refresh ON review_votes;
CREATE TRIGGER trg_review_votes_refresh
AFTER INSERT OR UPDATE OR DELETE ON review_votes
FOR EACH ROW EXECUTE FUNCTION refresh_review_votes_count();

CREATE TABLE IF NOT EXISTS review_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_name VARCHAR(150) NOT NULL,
  body TEXT NOT NULL,
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_review_comments_review_created_at ON review_comments (review_id, created_at);

CREATE OR REPLACE FUNCTION refresh_review_comments_count() RETURNS TRIGGER AS $$
DECLARE
  target UUID;
BEGIN
  target := COALESCE(NEW.review_id, OLD.review_id);
  UPDATE reviews
  SET comments_count = COALESCE((SELECT COUNT(*) FROM review_comments WHERE review_id = target), 0),
      updated_at = CURRENT_TIMESTAMP
  WHERE id = target;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_review_comments_refresh_insert ON review_comments;
CREATE TRIGGER trg_review_comments_refresh_insert
AFTER INSERT OR DELETE ON review_comments
FOR EACH ROW EXECUTE FUNCTION refresh_review_comments_count();

DROP TRIGGER IF EXISTS trg_review_comments_refresh_update ON review_comments;
CREATE TRIGGER trg_review_comments_refresh_update
AFTER UPDATE OF review_id ON review_comments
FOR EACH ROW EXECUTE FUNCTION refresh_review_comments_count();
