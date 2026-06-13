import { AvailabilityStatus } from '../enums/availability-status.enum';
import { LabourRole } from '../enums/labour-role.enum';
import { LabourTrade } from '../enums/labour-trade.enum';
import { CreateLabourUserDto } from './create-labour-user.dto';

export class CreateLabourProfileDto {
  phoneVerificationToken: string;
  user: CreateLabourUserDto;
  bio?: string;
  skills?: string[];
  trade?: LabourTrade;
  role?: LabourRole;
  experienceYears?: number;
  hourlyRate?: number;
  availability?: AvailabilityStatus;
  certifications?: string[];
  dateOfBirth?: Date;
  location?: string;
  emergencyContact?: string;
}
