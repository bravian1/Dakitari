export interface TriageResult {
  severity: 'low' | 'medium' | 'critical';
  condition_en: string;
  condition_sw: string;
  symptoms_en: string[];
  symptoms_sw: string[];
  actions_en: string[];
  actions_sw: string[];
  summary_en: string;
  summary_sw: string;
}

export interface Consultation {
  id: string;
  timestamp: number;
  transcript: string;
  result: TriageResult;
}
