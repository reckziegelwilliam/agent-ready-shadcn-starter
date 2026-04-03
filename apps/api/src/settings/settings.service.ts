import { Injectable } from '@nestjs/common';

export interface Settings {
  profile: {
    name: string;
    email: string;
    bio: string;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    marketingEmails: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'default' | 'large';
  };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay() {
  return delay(600 + Math.random() * 200);
}

@Injectable()
export class SettingsService {
  private settings: Settings = {
    profile: {
      name: 'Demo User',
      email: 'demo@example.com',
      bio: 'Software developer who enjoys building great user experiences.',
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      marketingEmails: false,
    },
    appearance: {
      theme: 'system',
      fontSize: 'default',
    },
  };

  async getSettings(): Promise<Settings> {
    await randomDelay();
    return { ...this.settings };
  }

  async updateProfile(data: {
    name: string;
    bio: string;
  }): Promise<Settings> {
    await randomDelay();
    this.settings = {
      ...this.settings,
      profile: {
        ...this.settings.profile,
        name: data.name,
        bio: data.bio,
      },
    };
    return { ...this.settings };
  }

  async updateNotifications(data: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    marketingEmails: boolean;
  }): Promise<Settings> {
    await randomDelay();
    this.settings = {
      ...this.settings,
      notifications: { ...data },
    };
    return { ...this.settings };
  }

  async updateAppearance(data: {
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'default' | 'large';
  }): Promise<Settings> {
    await randomDelay();
    this.settings = {
      ...this.settings,
      appearance: { ...data },
    };
    return { ...this.settings };
  }
}
