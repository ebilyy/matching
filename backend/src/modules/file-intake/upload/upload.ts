import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
  PayloadTooLargeException,
  UseInterceptors,
  applyDecorators,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { diskStorage } from 'multer';
import { unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { extname } from 'node:path';
import { catchError, finalize, type Observable, throwError } from 'rxjs';
import { AppError } from '../../../common/errors/app-error';

// PRD §6.1, SAD §8.
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

// The extension decides; browsers report CSV as text/csv, application/vnd.ms-excel
// or octet-stream. Content is verified by the parser (T09 → unreadable_file).
const ACCEPTED_EXTENSIONS = new Set(['.xlsx', '.csv']);

export const fileTooLarge = () =>
  new AppError('import.file_too_large', 413, 'Файл більший за 50 МБ.');

export const unsupportedMediaType = () =>
  new AppError(
    'import.unsupported_media_type',
    415,
    'Підтримуються лише XLSX і CSV.',
  );

// Maps multer's size error to the contract code and removes the spooled file
// however the request ends: the original lives in S3 from here on.
@Injectable()
class SpooledUploadInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    return next.handle().pipe(
      catchError((error: unknown) =>
        throwError(() =>
          error instanceof PayloadTooLargeException ? fileTooLarge() : error,
        ),
      ),
      finalize(() => {
        if (request.file) void unlink(request.file.path).catch(() => undefined);
      }),
    );
  }
}

// One XLSX/CSV file in the `file` part, spooled to a temp file so neither the
// api nor the S3 upload holds it in memory. Text parts stay small (column_mapping).
export function SpooledUpload(field = 'file') {
  return applyDecorators(
    UseInterceptors(
      SpooledUploadInterceptor,
      FileInterceptor(field, {
        storage: diskStorage({ destination: tmpdir() }),
        // Cyrillic filenames arrive as raw UTF-8 without a charset parameter.
        defParamCharset: 'utf8',
        limits: {
          fileSize: MAX_UPLOAD_BYTES,
          files: 1,
          fields: 10,
          fieldSize: 1024 * 1024,
        },
        fileFilter: (_req, file, done) => {
          if (
            ACCEPTED_EXTENSIONS.has(extname(file.originalname).toLowerCase())
          ) {
            done(null, true);
          } else {
            done(unsupportedMediaType(), false);
          }
        },
      }),
    ),
  );
}
