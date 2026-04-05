import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { SettingsModule } from './settings/settings.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { TasksModule } from './tasks/tasks.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [HealthModule, AuthModule, SettingsModule, OnboardingModule, TasksModule, UploadsModule],
})
export class AppModule {}
