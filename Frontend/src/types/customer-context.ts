export interface CustomerContextData {
  organizationalScope: string[];
  supplyChainComplexity: string[];
  complianceRisk: string[];
  sustainability: string[];
}

export interface ContextDimension {
  id: keyof CustomerContextData;
  title: string;
  options: string[];
}