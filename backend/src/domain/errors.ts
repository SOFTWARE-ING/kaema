export class HttpError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "HttpError";
  }
}

export const badRequest = (message: string) => new HttpError(400, message);
export const unauthorized = () => new HttpError(401, "Authentification requise.");
export const forbidden = () => new HttpError(403, "Accès refusé.");
export const notFound = (message = "Ressource introuvable.") => new HttpError(404, message);
export const conflict = (message: string) => new HttpError(409, message);
export const serviceUnavailable = (message: string) => new HttpError(503, message);
