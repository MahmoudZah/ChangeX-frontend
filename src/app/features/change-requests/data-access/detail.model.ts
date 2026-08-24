export interface DetailResponseDto {
  id: string;
  crid: string;
  attachment: string;
  comment: string;
  state: string;
  uploadedTime: string;
}

export interface CrDetail {
  id: string;
  crId: string;
  attachmentUrl: string;
  fileName: string;
  fileType: string;
  comment: string;
  state: string;
  uploadedAt: string;
}
