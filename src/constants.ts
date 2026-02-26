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
  "Francesco Renga",
];

export const ARTIST_SONGS: Record<string, string> = {
  Raf: "Ora e per sempre",
  "Tredici Pietro": "Uomo che cade",
  "Tommaso Paradiso": "I romantici",
  "Patty Pravo": "Opera",
  Fulminacci: "Stupida sfortuna",
  Luchè: "Labirinto",
  Arisa: "Magica favola",
  "Serena Brancale": "Qui con me",
  "Enrico Nigiotti": "Ogni volta che non so volare",
  "LDA e AKA 7even": "Poesie clandestine",
  "Malika Ayane": "Animali notturni",
  "Mara Sattei": "Le cose che non sai di me",
  Sayf: "Tu mi piaci tanto",
  "J-Ax": "Italia Starter Pack",
  "Fedez e Marco Masini": "Male necessario",
  Levante: "Sei tu",
  Ditonellapiaga: "Che fastidio!",
  "Samurai Jay": "Ossessione",
  "Ermal Meta": "Stella stellina",
  "Elettra Lamborghini": "Voilà",
  "Sal Da Vinci": "Per sempre sì",
  "Eddie Brock": "Avvoltoi",
  "Dargen D'Amico": "Ai Ai",
  Nayt: "Prima che",
  "Bambole di pezza": "Resta con me",
  "Leo Gassmann": "Naturale",
  "Maria Antonietta e Colombre": "La felicità e basta",
  "Michele Bravi": "Prima o poi",
  Chiello: "Ti penso sempre",
  "Francesco Renga": "Il meglio di me",
};

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
  serata3: [
    "Maria Antonietta e Colombre",
    "Leo Gassmann",
    "Malika Ayane",
    "Sal Da Vinci",
    "Tredici Pietro",
    "Raf",
    "Francesco Renga",
    "Eddie Brock",
    "Serena Brancale",
    "Samurai Jay",
    "Arisa",
    "Michele Bravi",
    "Luchè",
    "Mara Sattei",
    "Sayf",
  ],
};

export const NIGHTS = [
  { id: "serata1", name: "Serata 1", type: "standard" },
  { id: "serata2", name: "Serata 2", type: "standard" },
  { id: "serata3", name: "Serata 3", type: "standard" },
  { id: "cover", name: "Serata Cover", type: "cover" },
  { id: "finale", name: "Finale", type: "standard" },
];

export const CATEGORIES = [
  { id: "esibizione", name: "Esibizione" },
  { id: "outfit", name: "Outfit" },
  { id: "testo", name: "Testo" },
  { id: "musica", name: "Musica" },
  { id: "intonazione", name: "Intonazione" },
  { id: "stile", name: "Stile" },
  { id: "cringe", name: "Cringe" },
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
