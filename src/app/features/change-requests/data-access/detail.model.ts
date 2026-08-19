export interface CrComment {
  id: string;
  crId: string;
  author: string;
  body: string;
  createdAt: string;
}

export interface CrAttachment {
  id: string;
  crId: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
}
