import { IsNotEmpty, IsString } from 'class-validator';

// Text parts of openapi CatalogUpload; `file` is taken by the upload interceptor.
// column_mapping is a JSON string here and is parsed by parseColumnMapping.
export class CatalogUploadDto {
  @IsString()
  @IsNotEmpty()
  column_mapping: string;
}
