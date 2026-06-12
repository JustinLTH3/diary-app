-- Rename email column to username
ALTER TABLE "User" RENAME COLUMN "email" TO "username";

-- Rename the unique index to match the new column name
ALTER INDEX "User_email_key" RENAME TO "User_username_key";
