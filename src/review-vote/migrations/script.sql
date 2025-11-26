CREATE TABLE IF NOT EXISTS review_votes (
  id         SERIAL PRIMARY KEY,
  review_id  INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  value      SMALLINT NOT NULL CHECK (value IN (-1, 1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ
);

-- un user solo puede votar una vez por review
CREATE UNIQUE INDEX IF NOT EXISTS ux_review_votes_review_user
  ON review_votes (review_id, user_id);
