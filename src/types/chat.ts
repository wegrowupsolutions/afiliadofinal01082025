
export interface Client {
  id: number;
  telefone: string;
  nome: string;
  email: string;
  sessionid: string;
  cpf_cnpj?: string;
  nome_pet?: string;
  porte_pet?: string;
  raca_pet?: string;
}

export interface AfiliadoBaseLead {
  id: number;
  name: string;
  remotejid: string;
  timestamp: string;
}

export interface ChatMessage {
  role: string;
  content: string;
  timestamp: string;
  type?: string;
}

export interface AfiliadoMensagem {
  id: number;
  remotejid: string;
  timestamp: string;
  conversation_history: string;
}

export interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  phone: string;
  email: string;
  address?: string;
  petName?: string;
  petType?: string;
  petBreed?: string;
  sessionId: string;
}
