export {
  loadHealthState as loadHealthFoundationState,
  saveHealthState as saveHealthFoundationState,
  getHealthDay as getHealthDailyRecord,
  upsertHealthDay as upsertHealthDailyRecord,
  addHealthValue as addHealthMetricValue,
  hydrateFromCurrentModules as hydrateHealthFoundationFromCurrentModules,
  applyHealthImportPayload,
  appleHealthPortPlaceholder,
} from "./health/healthStore";

export { healthMetricDefinitions as healthMetricCatalog } from "./health/healthMetrics";
export type {
  HealthMetricKey,
  HealthMetricDefinition,
  HealthDailyRecord,
  HealthFoundationState,
  HealthImportPayload,
  AppleHealthPort,
} from "./health/healthTypes";
