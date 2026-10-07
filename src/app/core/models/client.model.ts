export interface AddressDTO {
  addressId: number;
  fullAddress: string;
}

export interface ClientActiveDTO {
  clientId: number;
  name: string;
  addresses: AddressDTO[];
}