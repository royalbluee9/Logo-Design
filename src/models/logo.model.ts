export interface Question {
  id: number;
  text: string;
  placeholder: string;
  type: 'text' | 'textarea';
}

export interface LogoPrompt {
  prompt: string;
  style: string;
}

export interface GeneratedLogo {
  prompt: string;
  style: string;
  base64Image: string;
}
