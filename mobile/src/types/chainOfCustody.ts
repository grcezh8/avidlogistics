export interface CreateSignatureInput {
  chainOfCustodyEventId: number;
  signedBy: string;
  signatureType: string;
  signatureImageUrl?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface CreateChainOfCustodyEventInput {
  electionId: number;
  assetId: number;
  fromParty: string;
  toParty: string;
  sealNumber?: string;
  notes?: string;
  eventType?: string;
  fromOrg?: string;
  toOrg?: string;
  manifestId?: number;
}

export interface SignatureFormData {
  signerName: string;
  role: 'From' | 'To';
  notes?: string;
  signatureImage: string;
}
