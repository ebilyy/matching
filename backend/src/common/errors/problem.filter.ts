import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { AppError } from './app-error';

type Problem = {
  code: string;
  message: string;
  status: number;
  details?: Record<string, unknown>;
};

// Framework exceptions that carry no domain code of their own.
const BY_STATUS: Record<number, Omit<Problem, 'status'>> = {
  [HttpStatus.UNAUTHORIZED]: {
    code: 'common.unauthenticated',
    message: 'Потрібна автентифікація.',
  },
  [HttpStatus.NOT_FOUND]: {
    code: 'common.not_found',
    message: 'Ресурс не знайдено.',
  },
};

const INTERNAL: Omit<Problem, 'status'> = {
  code: 'common.internal',
  message: 'Внутрішня помилка. Спробуйте ще раз.',
};

// Every error leaves the api as application/problem+json (RFC 9457).
@Catch()
export class ProblemFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const problem = this.toProblem(exception);
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(problem.status)
      .type('application/problem+json')
      .json(problem);
  }

  private toProblem(exception: unknown): Problem {
    if (exception instanceof AppError) {
      const { code, message, status, details } = exception;
      return details
        ? { code, message, status, details }
        : { code, message, status };
    }
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const known = BY_STATUS[status];
      if (known) return { ...known, status };
      if (status < 500) {
        return {
          code: 'common.validation_failed',
          message: 'Запит містить некоректні поля.',
          status: 422,
        };
      }
    }
    this.logger.error(exception);
    return { ...INTERNAL, status: HttpStatus.INTERNAL_SERVER_ERROR };
  }
}
