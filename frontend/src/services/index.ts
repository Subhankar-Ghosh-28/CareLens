import {
  DemoAbhaService,
  DemoConsentService,
  DemoOcrService,
  DemoVoiceService,
  DemoClinicalHistoryService,
  DemoTimelineService,
  DemoSummaryService,
  DemoAlertService,
  DemoHisService,
  DemoAuditService,
  resetDemoStores
} from './demoAdapters';

import {
  IAbhaService,
  IConsentService,
  IOcrService,
  IVoiceService,
  IClinicalHistoryService,
  ITimelineService,
  ISummaryService,
  IAlertService,
  IHisService,
  IAuditService
} from './interfaces';
import { BackendOcrService } from './backendOcrService';
import { BackendConsentService } from './backendConsentService';

// Service Registry with deterministic adapters
export const abhaService: IAbhaService = new DemoAbhaService();
export const consentService: IConsentService = new BackendConsentService();
export const ocrService: IOcrService = new BackendOcrService();
export const voiceService: IVoiceService = new DemoVoiceService();
export const clinicalHistoryService: IClinicalHistoryService = new DemoClinicalHistoryService();
export const timelineService: ITimelineService = new DemoTimelineService();
export const summaryService: ISummaryService = new DemoSummaryService();
export const alertService: IAlertService = new DemoAlertService();
export const hisService: IHisService = new DemoHisService();
export const auditService: IAuditService = new DemoAuditService();

export { resetDemoStores };
