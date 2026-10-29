export class ResolutionError extends Error {
  code: "invalid_input" | "not_found" | "missing_key" | "provider_error";

  constructor(message: string, code: ResolutionError["code"] = "not_found") {
    super(message);
    this.name = "ResolutionError";
    this.code = code;
  }
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Erro inesperado";
}
