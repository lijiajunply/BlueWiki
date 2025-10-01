-- CreateTable
CREATE TABLE "Setting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "googleKey" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "smtpEmail" TEXT NOT NULL,
    "smtpPassword" TEXT NOT NULL,
    "smtpPost" INTEGER NOT NULL,
    "smtpServer" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Setting_smtpEmail_key" ON "Setting"("smtpEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_smtpPassword_key" ON "Setting"("smtpPassword");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_smtpPost_key" ON "Setting"("smtpPost");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_smtpServer_key" ON "Setting"("smtpServer");
