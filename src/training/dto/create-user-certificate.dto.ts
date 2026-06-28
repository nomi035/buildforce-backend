import { CertificateStatus } from '../enums/certificate-status.enum';

export class CreateUserCertificateDto {
  userId: number;
  programId?: number;
  title: string;
  issuedDate: string;
  expiryDate: string;
  status?: CertificateStatus;
}
