import { ExperienceRange } from '../enums/experience-range.enum';
import { Language } from '../enums/language.enum';
import { SkillLevel } from '../enums/skill-level.enum';
import { CreateLabourOnboardingUserDto } from './create-labour-onboarding-user.dto';
import { TradeSelectionDto } from './trade-selection.dto';

export class CreateLabourOnboardingDto {
  user: CreateLabourOnboardingUserDto;
  languages: Language[];
  zipCode: string;
  state: string;
  county: string;
  tradeSelections: TradeSelectionDto[];
  skillLevel: SkillLevel;
  experience: ExperienceRange;
  promoCode?: string;
}
