import type { Errors, RegisterData } from "../formModel";

export interface StepProps {
  data: RegisterData;
  update: (patch: Partial<RegisterData>) => void;
  errors: Errors;
}
