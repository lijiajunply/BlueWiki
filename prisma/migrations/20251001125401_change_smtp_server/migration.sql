-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Setting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "googleKey" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "smtpEmail" TEXT NOT NULL,
    "smtpPassword" TEXT NOT NULL,
    "smtpPost" INTEGER NOT NULL,
    "smtpServer" TEXT NOT NULL
);
INSERT INTO "new_Setting" ("googleKey", "id", "smtpEmail", "smtpPassword", "smtpPost", "smtpServer", "updatedAt") SELECT "googleKey", "id", "smtpEmail", "smtpPassword", "smtpPost", "smtpServer", "updatedAt" FROM "Setting";
DROP TABLE "Setting";
ALTER TABLE "new_Setting" RENAME TO "Setting";
CREATE UNIQUE INDEX "Setting_smtpEmail_key" ON "Setting"("smtpEmail");
CREATE UNIQUE INDEX "Setting_smtpPassword_key" ON "Setting"("smtpPassword");
CREATE UNIQUE INDEX "Setting_smtpPost_key" ON "Setting"("smtpPost");
CREATE UNIQUE INDEX "Setting_smtpServer_key" ON "Setting"("smtpServer");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
