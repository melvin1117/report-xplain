export interface Report {
    id: string;
    created_at: string;
    metadata: ReportMetadata;
    report_type: string;
    report_name: string;
    summary: ReportSummaries;
    sections: ReportSection[];
    charts: ReportChart[];
    overall_suggestions: string;
    chatContext: ChatContext[];
  }
  
  export interface ReportMetadata {
    patient_name: string;
    age: string;
    gender: string;
    referred_by: string;
    registration_number: string;
    report_dates: ReportDates;
    lab_details: LabDetails;
  }
  
  export interface ReportDates {
    registered_on: string;
    collected_on: string;
    received_on: string;
    reported_on: string;
  }
  
  export interface LabDetails {
    lab_name: string;
    lab_incharge: string;
    pathologist: string;
    location: string | null;
  }
  
  export interface ReportSummaries {
    medical_summary: string;
    friendly_summary: string;
    ai_diagnosis_summary: string;
  }
  
  export interface ReportSection {
    section_title: string;
    description: string;
    metrics: ReportMetric[];
  }
  
  export interface ReportMetric {
    metric_name: string;
    metric_friendly_name: string;
    value: string;
    unit: string;
    reference_min: string;
    reference_max: string;
    medical_terminology: string;
    friendly_interpretation: string;
    status: string;
    suggestions?: string | null;
    motivational_message?: string | null;
  }
  
  export interface ReferenceRange {
    min: string;
    max: string;
  }
  
  export interface ReportChart {
    chart_title: string;
    chart_type: string; // e.g., 'pie' or 'bullet'
    chat_data: ChartData[];
    friendly_description: string;
  }
  
  export interface ChartData {
    // For pie charts:
    label?: string;
    // For bullet charts:
    parameter?: string;
    value: number;
    reference_range?: ReferenceRange;
  }
  
  export interface ChatContext {
    context_id: string;
    context_text: string;
  }
  