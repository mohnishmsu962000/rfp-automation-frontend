export interface User {
    id: string;
    name: string;
    email: string;
    company_id: string;
    company_name: string;
  }
  
  export interface Document {
    id: string;
    user_id: string;
    company_id: string;
    filename: string;
    file_url: string;
    file_size?: number;
    uploaded_at: string;
    processed: boolean;
  }
  
  export interface Attribute {
    id: string;
    user_id: string;
    company_id: string;
    key: string;
    value: string;
    category: 'technical' | 'compliance' | 'business' | 'product';
    source_doc_id?: string;
    last_updated: string;
  }
  
  export interface RFPProject {
    id: string;
    user_id: string;
    company_id: string;
    rfp_name: string;
    rfp_file_url: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    created_at: string;
    updated_at: string;
    questions?: RFPQuestion[];
  }
  
  export interface RFPQuestion {
    id: string;
    project_id: string;
    question_text: string;
    answer_text: string | null;
    trust_score: number;
    source_type: string | null;
    user_edited: boolean;
    created_at: string;
    updated_at: string;
  }
  
  export interface UsageStats {
    documents: {
      used: number;
      limit: number;
      remaining: number;
    };
    rfps: {
      used: number;
      limit: number;
      remaining: number;
    };
    rephrase: {
      used: number;
      limit: number;
      remaining: number;
    };
    resync: {
      used: number;
      limit: number;
      remaining: number;
    };
  }