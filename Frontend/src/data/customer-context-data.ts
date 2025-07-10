import { ContextDimension } from "@/types/customer-context";

export const contextDimensions = [
  {
    id: "organizationalScope",
    title: "Organizational Scope",
    groups: [
      {
        label: "Scope",
        options: ["Local", "Regional", "Global"]
      },
      {
        label: "ERP Landscape",
        options: ["Single ERP", "Multi-ERP", "Joint Ventures"]
      }
    ]
  },
  {
    id: "supplyChainComplexity",
    title: "Supply Chain Complexity",
    groups: [
      {
        label: "Structure",
        options: ["Simple", "Moderate", "High"]
      },
      {
        label: "Execution",
        options: ["Engineer-to-Order", "Make-to-Stock", "Assemble-to-Order"]
      }
    ]
  },
  {
    id: "complianceRisk",
    title: "Compliance, Risk & Governance",
    groups: [
      {
        label: "Governance Model",
        options: ["Manual", "Semi-Automated", "Automated"]
      },
      {
        label: "Risk Level",
        options: ["Low", "Medium", "High"]
      }
    ]
  },
  {
    id: "sustainability",
    title: "Sustainability Objectives",
    groups: [
      {
        label: "Maturity",
        options: ["Basic", "Intermediate", "Advanced"]
      },
      {
        label: "Focus",
        options: ["ESG", "Supplier Collaboration", "Circular Economy"]
      }
    ]
  },

]