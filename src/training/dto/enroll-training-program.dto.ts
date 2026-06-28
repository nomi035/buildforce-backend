export class EnrollTrainingProgramDto {
  /** Required for guest enrollments (no JWT) */
  name?: string;
  email?: string;
  phone?: string;
}
