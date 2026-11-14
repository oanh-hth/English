-- Demo data for Part 4 exercises. Password hashes are fake (the course teaches bcrypt in Part 6).
INSERT INTO users (username, password_hash, daily_cap) VALUES ('mai', 'not-a-real-hash', 3), ('lan', 'not-a-real-hash', 10);

INSERT INTO notes (user_id, kind, text, meaning, example, stage, due, reps, lapses, created_at) VALUES
 (1, 'phrase', 'I will get back to you', 'reply later', 'Let me check and I will get back to you.', 0, '2026-11-15', 0, 0, '2026-11-14 09:00'),
 (1, 'phrase', 'run out of', 'have none left', 'We ran out of milk.', 1, '2026-11-14', 1, 0, '2026-11-10 09:00'),
 (1, 'phrase', 'hang out', 'spend time together', 'Want to hang out later?', 3, '2026-11-20', 4, 1, '2026-10-20 09:00'),
 (1, 'phrase', 'figure out', 'solve or understand', 'I cannot figure out this puzzle.', 2, '2026-11-13', 2, 0, '2026-11-01 09:00'),
 (1, 'word',   'reluctant', 'not wanting to do something', 'He was reluctant to leave.', 0, '2026-11-15', 0, 0, '2026-11-14 09:05'),
 (1, 'word',   'bummer', 'something disappointing', 'Oh, bummer, it is closed.', 5, '2026-12-20', 6, 2, '2026-09-01 09:00'),
 (2, 'phrase', 'catch up', 'talk after a while apart', 'Let us catch up this weekend.', 1, '2026-11-14', 1, 0, '2026-11-13 18:00'),
 (2, 'word',   'wrap up', 'finish', 'Let us wrap up the meeting.', 0, '2026-11-15', 0, 0, '2026-11-14 08:00');

INSERT INTO reviews (note_id, grade, stage_before, stage_after, reviewed_at) VALUES
 (2, 2, 0, 1, '2026-11-11 08:00'), (3, 2, 0, 1, '2026-10-21 08:00'), (3, 2, 1, 2, '2026-10-24 08:00'), (3, 3, 2, 3, '2026-10-31 08:00'),
 (3, 0, 3, 0, '2026-11-07 08:00'), (3, 2, 0, 1, '2026-11-08 08:00'), (4, 2, 1, 2, '2026-11-05 08:00');

INSERT INTO sentences (note_id, body, rating) VALUES
 (3, 'We hang out at the park every Sunday.', 'natural'), (4, 'I figured out the answer after lunch.', 'natural'), (2, 'We run out of time yesterday.', 'off');

INSERT INTO plants (user_id, type, started_on, harvested_on) VALUES (1, 'tomato', '2026-10-01', '2026-10-28'), (1, 'sunflower', '2026-10-29', NULL), (2, 'chilli', '2026-11-10', NULL);

INSERT INTO point_events (user_id, plant_id, day, source, points) VALUES
 (1, 1, '2026-10-01', 'water', 20), (1, 1, '2026-10-02', 'water', 20), (1, 1, '2026-10-02', 'review', 120), (1, 1, '2026-10-20', 'sentence', 300), (1, 1, '2026-10-27', 'mission', 140),
 (1, 2, '2026-10-29', 'water', 20), (1, 2, '2026-11-10', 'water', 20), (1, 2, '2026-11-10', 'review', 36), (1, 2, '2026-11-14', 'water', 20), (1, 2, '2026-11-14', 'note', 10),
 (2, 3, '2026-11-10', 'water', 20), (2, 3, '2026-11-13', 'water', 20), (2, 3, '2026-11-13', 'sentence', 12);

INSERT INTO missions (user_id, day, note_id, done) VALUES (1, '2026-11-13', 4, TRUE), (1, '2026-11-14', 2, FALSE);
