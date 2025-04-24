-- CreateTable
CREATE TABLE `HealthProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `gender` VARCHAR(191) NULL,
    `age` INTEGER NULL,
    `height` DOUBLE NULL,
    `weight` DOUBLE NULL,
    `targetWeight` DOUBLE NULL,
    `goal` VARCHAR(191) NULL,
    `timeline` VARCHAR(191) NULL,
    `foodRestrictions` TEXT NULL,
    `dislikedFoods` TEXT NULL,
    `symptoms` TEXT NULL,
    `activityLevel` VARCHAR(191) NULL,
    `exercisePreference` VARCHAR(191) NULL,

    UNIQUE INDEX `HealthProfile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WellnessPlan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `profileId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `duration` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `content` LONGTEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MealPlan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `planId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `meals` LONGTEXT NOT NULL,
    `calories` INTEGER NULL,
    `macros` TEXT NULL,
    `groceryList` TEXT NULL,
    `estimatedCost` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExercisePlan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `planId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `exercises` TEXT NOT NULL,
    `duration` INTEGER NULL,
    `intensity` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Recipe` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `mealPlanId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `ingredients` TEXT NOT NULL,
    `instructions` TEXT NOT NULL,
    `prepTime` INTEGER NULL,
    `calories` INTEGER NULL,
    `macros` TEXT NULL,
    `imageUrl` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProgressLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `profileId` INTEGER NOT NULL,
    `planId` INTEGER NULL,
    `date` DATETIME(3) NOT NULL,
    `weight` DOUBLE NULL,
    `mood` VARCHAR(191) NULL,
    `energy` INTEGER NULL,
    `sleep` INTEGER NULL,
    `notes` TEXT NULL,
    `aiMessage` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MealLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `mealPlanId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `mealType` VARCHAR(191) NOT NULL,
    `foods` TEXT NOT NULL,
    `completed` BOOLEAN NOT NULL DEFAULT false,
    `calories` INTEGER NULL,
    `notes` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExerciseLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `exercisePlanId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `completed` BOOLEAN NOT NULL DEFAULT false,
    `duration` INTEGER NULL,
    `feedback` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AIConsultation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `question` TEXT NOT NULL,
    `answer` LONGTEXT NOT NULL,
    `topic` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `HealthProfile` ADD CONSTRAINT `HealthProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WellnessPlan` ADD CONSTRAINT `WellnessPlan_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `HealthProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MealPlan` ADD CONSTRAINT `MealPlan_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `WellnessPlan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExercisePlan` ADD CONSTRAINT `ExercisePlan_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `WellnessPlan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Recipe` ADD CONSTRAINT `Recipe_mealPlanId_fkey` FOREIGN KEY (`mealPlanId`) REFERENCES `MealPlan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProgressLog` ADD CONSTRAINT `ProgressLog_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `HealthProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProgressLog` ADD CONSTRAINT `ProgressLog_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `WellnessPlan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MealLog` ADD CONSTRAINT `MealLog_mealPlanId_fkey` FOREIGN KEY (`mealPlanId`) REFERENCES `MealPlan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExerciseLog` ADD CONSTRAINT `ExerciseLog_exercisePlanId_fkey` FOREIGN KEY (`exercisePlanId`) REFERENCES `ExercisePlan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AIConsultation` ADD CONSTRAINT `AIConsultation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
