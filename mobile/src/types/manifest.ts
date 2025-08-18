export interface ManifestWithDetailsDto {
  manifestId: number;
  manifestNumber: string;
  electionId: number;
  fromFacilityId: number;
  toPollSiteId: number;
  pollSiteName: string;
  pollSiteDisplayName: string;
  status: string;
  itemCount: number;
  packedCount: number;
  createdDate: string;
  packedDate?: string;
  items: ManifestItemDto[];
}

export interface ManifestItemDto {
  manifestItemId: number;
  assetId: number;
  assetSerialNumber: string;
  assetType: string;
  sealNumber: string;
  isPacked: boolean;
  packedDate?: string;
  packedBy?: number;
}

export interface ManifestSummaryDto {
  manifestId: number;
  manifestNumber: string;
  electionId: number;
  fromFacilityId: number;
  toPollSiteId: number;
  status: string;
  itemCount: number;
  packedCount: number;
}
