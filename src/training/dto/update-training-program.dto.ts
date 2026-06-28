import { TrainingLevel } from '../enums/training-level.enum';

export class UpdateTrainingProgramDto {
  title?: string;
  description?: string;
  durationHours?: number;
  level?: TrainingLevel;
  eventDate?: string;
  location?: string;
  price?: number;
  totalSpots?: number;
  isActive?: boolean;
}
