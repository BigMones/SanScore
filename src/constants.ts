export const ARTISTS = [
  "Raf",
  "Tredici Pietro",
  "Tommaso Paradiso",
  "Patty Pravo",
  "Fulminacci",
  "Luchè",
  "Arisa",
  "Serena Brancale",
  "Enrico Nigiotti",
  "LDA e AKA 7even",
  "Malika Ayane",
  "Mara Sattei",
  "Sayf",
  "J-Ax",
  "Fedez e Marco Masini",
  "Levante",
  "Ditonellapiaga",
  "Samurai Jay",
  "Ermal Meta",
  "Elettra Lamborghini",
  "Sal Da Vinci",
  "Eddie Brock",
  "Dargen D'Amico",
  "Nayt",
  "Bambole di pezza",
  "Leo Gassmann",
  "Maria Antonietta e Colombre",
  "Michele Bravi",
  "Chiello",
  "Francesco Renga"
];

export const NIGHT_ARTISTS: Record<string, string[]> = {
  serata2: [
    "Patty Pravo",
    "LDA e AKA 7even",
    "Enrico Nigiotti",
    "Tommaso Paradiso",
    "Elettra Lamborghini",
    "Ermal Meta",
    "Levante",
    "Bambole di pezza",
    "Chiello",
    "J-Ax",
    "Nayt",
    "Fulminacci",
    "Fedez e Marco Masini",
    "Dargen D'Amico",
    "Ditonellapiaga",
  ],
};

export const NIGHTS = [
  { id: 'serata1', name: 'Serata 1', type: 'standard' },
  { id: 'serata2', name: 'Serata 2', type: 'standard' },
  { id: 'serata3', name: 'Serata 3', type: 'standard' },
  { id: 'cover', name: 'Serata Cover', type: 'cover' },
  { id: 'finale', name: 'Finale', type: 'standard' }
];

export const CATEGORIES = [
  { id: 'esibizione', name: 'Esibizione' },
  { id: 'outfit', name: 'Outfit' },
  { id: 'testo', name: 'Testo' },
  { id: 'musica', name: 'Musica' },
  { id: 'intonazione', name: 'Intonazione' },
  { id: 'stile', name: 'Stile' },
  { id: 'cringe', name: 'Cringe' }
];

export interface Rating {
  id?: number;
  user_id?: number;
  username?: string;
  night_id: string;
  artist_name: string;
  esibizione: number;
  outfit: number;
  testo: number;
  musica: number;
  intonazione: number;
  stile: number;
  cringe: number;
  comment?: string;
}

export interface Compagnia {
  id: number;
  name: string;
  code: string;
  owner_id: number;
}
