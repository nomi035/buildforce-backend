import { LabourOnboardingResponse } from './labour-onboarding-response.type';

export type LabourOnboardingListMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type LabourOnboardingListResponse = {
  data: LabourOnboardingResponse[];
  meta: LabourOnboardingListMeta;
};
