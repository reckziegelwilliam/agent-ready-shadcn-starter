import { Controller, Get, Patch, Body } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Patch('profile')
  updateProfile(@Body() body: { name: string; bio: string }) {
    return this.settingsService.updateProfile(body);
  }

  @Patch('notifications')
  updateNotifications(
    @Body()
    body: {
      emailNotifications: boolean;
      pushNotifications: boolean;
      marketingEmails: boolean;
    },
  ) {
    return this.settingsService.updateNotifications(body);
  }

  @Patch('appearance')
  updateAppearance(
    @Body()
    body: {
      theme: 'light' | 'dark' | 'system';
      fontSize: 'small' | 'default' | 'large';
    },
  ) {
    return this.settingsService.updateAppearance(body);
  }
}
