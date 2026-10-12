-- ============================================================
-- AgileProjection · NT-AI Network — Demo Account Seed (Neon Postgres)
-- Run this in your Neon SQL editor after `prisma db push` (or `prisma db push:pg`)
-- ============================================================

-- Idempotent: deletes existing demo accounts first, then re-inserts.
DELETE FROM "Account" WHERE username IN ('admin','guest1','guest2','guest3','guest4','guest5','student@agileprojection.com');

INSERT INTO "Account" ("id", "username", "passwordHash", "role", "status", "passwordSetAt", "expiresAt", "fullName", "note", "createdAt", "updatedAt") VALUES
  ('acc_admin', 'admin', 'e32931fdfe5684efb812022a52d1851f:08ed211543d494f7b1cb9ed696ffb23c0c2f82089731d816dec47075ff2722003638e312f59b140c74ffb48d690b4c463392e9db9ecf7a39482b8939815dc000', 'admin', 'unlocked', NULL, NULL, 'AgileProjection Admin', 'Built-in administrator (never expires)', NOW(), NOW()),
  ('acc_guest1', 'guest1', 'c3c6fccb45dc090f51adf786b1262022:279cd55090d8ef445e88384ddc6b4134cd3b330fc50ebafbb0049d33060325e40c57d722567f870042463144f82510369bbecbd74fe98843e09bcc221bafcdff', 'guest', 'unlocked', NOW(), (NOW() + INTERVAL '2 days'), 'Guest User 1', 'Demo account — auto-unlocked (2-day window)', NOW(), NOW()),
  ('acc_guest2', 'guest2', '5a7dce41ff5221942b5252b4ec8f9507:36836e7827394af5a127d9c3d270178424e5fa1daa8b895c16da7f0cc105b04384a88f88e86e34785076fcc9c09666e8d8e0bdead8735ff2773aaf8481df7763', 'guest', 'unlocked', NOW(), (NOW() + INTERVAL '2 days'), 'Guest User 2', 'Demo account — auto-unlocked (2-day window)', NOW(), NOW()),
  ('acc_guest3', 'guest3', '01ee90e2cb62a9a3200abc0982cb0a0c:7278bcfcd29ba001eeaf4247777cff872ac94275d88e4557814c3726e658dc5a3452b5d703cad2c096ada776ba92515b057ca96749fd5fb7b252a7b092db8606', 'guest', 'unlocked', NOW(), (NOW() + INTERVAL '2 days'), 'Guest User 3', 'Demo account — auto-unlocked (2-day window)', NOW(), NOW()),
  ('acc_guest4', 'guest4', 'f9307274fbfa58c8234d80cf0ba14884:615ed484adcd2dbd2fafcad020ee3f960d30ec89cfba8fd9e058f594e2497866b81c815bcb076a1ccc798c00075b6127b30e8f88b8a6ebf4d0bc7a4b981b1d54', 'guest', 'unlocked', NOW(), (NOW() + INTERVAL '2 days'), 'Guest User 4', 'Demo account — auto-unlocked (2-day window)', NOW(), NOW()),
  ('acc_guest5', 'guest5', '61b088faf9f745612bae1d6bc68418a2:bb09c7042422d6be2f334d112deb86e5cddbe31855738265c947910da86d4660b34cc87b29a89dee6a39ee05688c3f488fb1e1f6708aa8ca79127c2c4548a964', 'guest', 'unlocked', NOW(), (NOW() + INTERVAL '2 days'), 'Guest User 5', 'Demo account — auto-unlocked (2-day window)', NOW(), NOW()),
  ('acc_student_demo', 'student@agileprojection.com', '8a66e060792d6e76c72cca0b91c6141f:10ef7c41f64a6c82f0816f6a6ece6912384408f0fa8ffb524e9c609fdcc7b4719bd0116347c5076246904e5ffe6a864b4b353e9862af615578b05e86a42f8634', 'guest', 'unlocked', NULL, NULL, 'Demo Student', 'Permanent demo student (auto-seeded, never expires)', NOW(), NOW());

-- Verify the inserts
SELECT "username", "role", "status", "fullName", "expiresAt" FROM "Account" ORDER BY "username";
