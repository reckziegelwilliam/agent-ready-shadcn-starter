import { Injectable, BadRequestException } from '@nestjs/common';

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface Preferences {
  industry: string;
  companySize: string;
  referralSource: string;
}

interface OnboardingSubmitDto {
  personal: PersonalInfo;
  preferences: Preferences;
  plan: 'free' | 'pro' | 'enterprise';
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class OnboardingService {
  async submit(dto: OnboardingSubmitDto) {
    await delay(1000);

    if (!dto.personal?.firstName || !dto.personal?.lastName || !dto.personal?.email) {
      throw new BadRequestException('Missing required personal information');
    }

    if (!dto.preferences?.industry || !dto.preferences?.companySize || !dto.preferences?.referralSource) {
      throw new BadRequestException('Missing required preferences');
    }

    if (!dto.plan) {
      throw new BadRequestException('Plan selection is required');
    }

    return {
      message: 'Onboarding completed successfully',
      onboardingId: `onb_${Date.now()}`,
    };
  }
}
