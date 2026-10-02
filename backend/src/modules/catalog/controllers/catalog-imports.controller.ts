import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { validationFailed } from '../../../common/errors/app-error';
import {
  ShopContextGuard,
  ShopId,
} from '../../../common/request-context/shop-context.guard';
import { parseColumnMapping } from '../../file-intake/dto/column-mapping.dto';
import {
  type ImportResponse,
  toImportResponse,
} from '../../file-intake/dto/import.dto';
import { ImportKind } from '../../file-intake/import.enums';
import { FileIntakeService } from '../../file-intake/services/file-intake.service';
import { SpooledUpload } from '../../file-intake/upload/upload';
import { CatalogUploadDto } from '../dto/catalog-upload.dto';

// openapi uploadCatalog (SAD §6 US-01, ADR-0002).
@Controller('catalog/imports')
@UseGuards(ShopContextGuard)
export class CatalogImportsController {
  constructor(private readonly intake: FileIntakeService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @SpooledUpload()
  async upload(
    @ShopId() shopId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: CatalogUploadDto,
  ): Promise<ImportResponse> {
    if (!file) {
      throw validationFailed([{ field: 'file', problem: 'is required' }]);
    }
    const columnMapping = parseColumnMapping(
      dto.column_mapping,
      ImportKind.Catalog,
    );
    // TODO(T03): manager_id from RequestContext once the credential names a manager.
    const row = await this.intake.accept({
      shopId,
      kind: ImportKind.Catalog,
      file,
      columnMapping,
    });
    return toImportResponse(row);
  }
}
