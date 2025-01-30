// src/utils/errors.js
export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
    this.status = 404;
  }
}

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
    this.status = 400;
  }
}

export class PermissionError extends Error {
  constructor(message) {
    super(message);
    this.name = "PermissionError";
    this.status = 403;
  }
}

export class CallError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'CallError';
    this.details = details;
  }
}

export class SchedulingError extends CallError {
  constructor(message, details = {}) {
    super(message, details);
    this.name = 'SchedulingError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message) {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404);
  }
}

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
  }
}

