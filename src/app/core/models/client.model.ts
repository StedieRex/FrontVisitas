export interface AddressDTO {
  id?: number;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface ClientActiveDTO {
  id?: number;
  clientId?: number;
  creditNumber: string;
  name: string;
  despacho: string;
  portfolio: string;
  agentId: number | null; // ID del agente asignado (Relación 1 a 1 desde la perspectiva del cliente)
  addresses: AddressDTO[];
}