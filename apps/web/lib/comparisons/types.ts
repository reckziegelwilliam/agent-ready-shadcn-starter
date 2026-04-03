export interface Annotation {
  lineStart: number;
  lineEnd: number;
  type: "fix" | "addition" | "improvement";
  title: string;
  description: string;
}

export interface ComparisonFile {
  filename: string;
  aiGenerated: string;
  production: string;
  aiAnnotations: Annotation[];
  prodAnnotations: Annotation[];
}

export interface ComparisonExample {
  slug: string;
  title: string;
  description: string;
  issueCount: number;
  files: ComparisonFile[];
}
