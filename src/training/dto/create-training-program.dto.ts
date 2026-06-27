import { TrainingLevel } from '../enums/training-level.enum';
import { TrainingProgramType } from '../enums/training-program-type.enum';

export class CreateTrainingProgramDto {
  type: TrainingProgramType;
  title: string;
  description?: string;
  durationHours?: number;
  level?: TrainingLevel;
  eventDate?: string;
  location?: string;
  price: number;
  totalSpots?: number;
}
