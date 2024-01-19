export interface CustomError extends SyntaxError {
  status?: number;
}
