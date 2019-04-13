-- POST
CREATE TABLE hu.post
(
  post_id SERIAL PRIMARY KEY,
  slug NAME UNIQUE NOT NULL,
  author NAME NOT NULL,
  title NAME NOT NULL,
  content TEXT,
  create_time TIMESTAMP NOT NULL,
  last_update_time TIMESTAMP NOT NULL
);
-- CATEGORY
CREATE TABLE hu.category
(
  category_id SERIAL PRIMARY KEY,
  name NAME NOT NULL,
  description TEXT,
  create_time TIMESTAMP NOT NULL,
  last_update_time TIMESTAMP NOT NULL
);
-- TAG
CREATE TABLE hu.tag
(
  tag_id SERIAL PRIMARY KEY,
  name NAME NOT NULL,
  description TEXT,
  create_time TIMESTAMP NOT NULL,
  last_update_time TIMESTAMP NOT NULL
);
-- POST_CATEGORY
CREATE TABLE hu.post_category
(
  post_id INT NOT NULL,
  category_id INT NOT NULL
);
-- POST_TAG
CREATE TABLE hu.post_tag
(
  post_id INT NOT NULL,
  tag_id INT NOT NULL
);