export interface User {
  id: string;
  email: string;
  password?: string;
  paid: boolean;
  pending: boolean; // Gardé pour compatibilité, mais moins utilisé avec la nouvelle logique
  transactionId?: string; // Nouveau champ pour stocker l'ID de transaction
  paymentDate: string | null;
  expiresAt: string | null;
  paymentTimer: number | null;
}

export interface Choice {
  id?: string;
  text?: string;
  letter: string;
  isCorrect: boolean;
}

export interface QCMItem {
  q: string;
  r: string[];
  c: string[];
}

export interface Chapter {
  id: string;
  title: string;
  qcms: QCMItem[];
}

export interface SavedResponse {
  selected: string[];
  score: number;
  goodTexts?: string;
}

export type UserResponses = Record<string, Record<number, SavedResponse>>;