-- CreateTable
CREATE TABLE "JobOffer" (
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "datePosted" TIMESTAMP(3) NOT NULL,
    "companyLogo" TEXT NOT NULL,
    "employmentType" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "JobOffer_pkey" PRIMARY KEY ("url")
);

-- AddForeignKey
ALTER TABLE "JobOffer" ADD CONSTRAINT "JobOffer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
