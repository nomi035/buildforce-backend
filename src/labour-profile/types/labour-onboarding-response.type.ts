import { ExperienceRange } from '../enums/experience-range.enum';
import { Language } from '../enums/language.enum';
import { SkillLevel } from '../enums/skill-level.enum';
import { TradeSelection } from '../types/trade-selection.type';

export type LabourOnboardingUserResponse = {
  id: number;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: string;
  isPhoneVerified: boolean;
};

export type LabourOnboardingResponse = {
  success: boolean;
  id: number;
  user: LabourOnboardingUserResponse;
  languages: Language[];
  zipCode: string;
  state: string;
  county: string;
  tradeSelections: TradeSelection[];
  skillLevel: SkillLevel;
  experience: ExperienceRange;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};
