import { Controller, Post, Body } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('submit')
  submit(
    @Body()
    body: {
      personal: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
      };
      preferences: {
        industry: string;
        companySize: string;
        referralSource: string;
      };
      plan: 'free' | 'pro' | 'enterprise';
    },
  ) {
    return this.onboardingService.submit(body);
  }
}
