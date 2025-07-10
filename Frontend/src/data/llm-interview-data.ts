import { Subprocess, Question, ToBeOption } from "@/types/llm-interview";

export const moduleNames: { [key: string]: string } = {
  sourcing: "SAP Ariba Sourcing",
  contract: "SAP Ariba Contract Management",
  risk: "SAP Ariba Supplier Risk",
  lifecycle: "SAP Ariba Supplier Lifecycle and Performance",
  buying: "SAP Ariba Buying and Invoicing",
  guided: "SAP Ariba Guided Buying",
  invoice: "SAP Ariba Invoice Management"
};


export const sourcingSubprocesses: Subprocess[] = [
  {
    name: "Sourcing Requests",
    description: "Initiation of sourcing needs with documentation and approval workflows"
  },
  {
    name: "Sourcing Projects", 
    description: "Creation of projects encompassing sourcing events"
  },
  {
    name: "RFx Management",
    description: "Handling requests for information, proposals, quotations, and auctions"
  },
  {
    name: "Negotiation and Bidding",
    description: "Conducting supplier negotiations and bid evaluations"
  },
  {
    name: "Supplier Evaluation",
    description: "Assessing supplier responses and capabilities"
  },
  {
    name: "Contract Management",
    description: "Managing contract creation, approval, and compliance"
  },
  {
    name: "Task and Workflow Management",
    description: "Aligning sourcing activities with company policies and approvals"
  },
  {
    name: "Realize and Deploy",
    description: "Configuration, testing, and deployment of sourcing solutions"
  }
];

export const rfxQuestions: Question[] = [
  {
    question: "To start with RFx Management, could you please describe your current process for creating and managing RFx events across your global operations?",
    followUps: [
      "How do you handle supplier invitations and ensure that the right suppliers are engaged for each RFx event?",
      "What tools or methods do you use for evaluating supplier responses and making award decisions?",
      "Given the manual and decentralized approach, how do you currently ensure compliance with corporate sourcing policies during RFx events?",
      "Would you be interested in automated tools within SAP Ariba that can standardize RFx templates, automate supplier invitations, and provide transparent evaluation dashboards?"
    ]
  }
];

export const getUnderstandingText = (subprocessIndex: number): string[] => {
  if (subprocessIndex === 2) { // RFx Management
    return [
      "The customer currently operates a decentralized and manual RFx creation process across regional teams, leading to inconsistencies and delays.",
      "Supplier invitation and engagement are handled manually without centralized supplier discovery or control, resulting in participation by unapproved suppliers.",
      "Supplier evaluation is manual and inconsistent, with varying criteria and limited corporate visibility.",
      "There is no automated compliance enforcement, relying instead on training and audits, which poses governance risks.",
      "The customer is interested in automation and standardization tools for RFx templates, supplier invitations, and evaluation dashboards to improve efficiency and compliance globally."
    ];
  }
  return ["Understanding will be generated based on the conversation..."];
};

export const getToBeOptions = (): ToBeOption[] => {
  return [
    {
      title: "Centralized RFx Template Management",
      description: "Implement standardized RFx templates with automated supplier invitation workflows and centralized evaluation dashboards for consistent global sourcing processes."
    },
    {
      title: "Advanced Compliance & Automation",
      description: "Deploy comprehensive compliance automation with policy enforcement, supplier discovery tools, and real-time visibility across all regional sourcing activities."
    }
  ];
};