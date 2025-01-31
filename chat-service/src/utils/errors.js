// src/utils/errors.js

// Base error classes
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
  }
}

export class CallError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "CallError";
    this.details = details;
  }
}

// Specific error classes
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

export class AuthorizationError extends AppError {
  constructor(message) {
    super(message, 403);
  }
}

export class RecordingError extends CallError {
  constructor(message, details = {}) {
    super(message, details);
    this.name = "RecordingError";
  }
}

export class SchedulingError extends CallError {
  constructor(message, details = {}) {
    super(message, details);
    this.name = "SchedulingError";
  }
}

export class CallValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "CallValidationError";
    this.status = 400;
    this.details = details;
  }
}
