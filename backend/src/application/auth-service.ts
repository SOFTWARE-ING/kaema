import { badRequest, conflict, unauthorized } from "../domain/errors";
import type { DatabasePort } from "../domain/ports";
import { hashToken, issueAccessToken, newRefreshToken, refreshExpiresAt } from "../shared/security";

export class AuthService {
  constructor(private readonly database: DatabasePort) {}

  async register(input: { name: string; email: string; phone?: string; password: string }) {
    const db = this.database.client;
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    if (name.length < 2) throw badRequest("Le nom doit contenir au moins deux caractères.");
    if (await db.user.findUnique({ where: { email } })) throw conflict("Cette adresse e-mail est déjà utilisée.");
    let user: { id: string; name: string; email: string; phone: string | null; role: "CLIENT" | "ADMIN" };
    try {
      user = await db.user.create({
        data: { name, email, phone: input.phone?.trim(), passwordHash: await Bun.password.hash(input.password, { algorithm: "argon2id" }) },
        select: { id: true, name: true, email: true, phone: true, role: true },
      });
    } catch (error) {
      if ((error as { code?: string }).code === "P2002") throw conflict("Cette adresse e-mail est déjà utilisée.");
      throw error;
    }
    return { user, tokens: await this.createTokens(user) };
  }

  async login(email: string, password: string) {
    const user = await this.database.client.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user || !(await Bun.password.verify(password, user.passwordHash))) throw unauthorized();
    const safeUser = { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role };
    return { user: safeUser, tokens: await this.createTokens(safeUser) };
  }

  async refresh(token: string) {
    const db = this.database.client;
    const record = await db.refreshToken.findUnique({ where: { tokenHash: hashToken(token) }, include: { user: true } });
    if (!record || record.expiresAt <= new Date()) {
      if (record) await db.refreshToken.delete({ where: { id: record.id } });
      throw unauthorized();
    }
    const user = { id: record.user.id, name: record.user.name, email: record.user.email, phone: record.user.phone, role: record.user.role };
    const tokens = await db.$transaction(async (tx) => {
      const consumed = await tx.refreshToken.deleteMany({ where: { id: record.id, expiresAt: { gt: new Date() } } });
      if (!consumed.count) throw unauthorized();
      const refreshToken = newRefreshToken();
      await tx.refreshToken.create({ data: { tokenHash: hashToken(refreshToken), userId: user.id, expiresAt: refreshExpiresAt() } });
      return { accessToken: await issueAccessToken(user), refreshToken };
    });
    return { user, tokens };
  }

  async logout(token?: string) {
    if (token) await this.database.client.refreshToken.deleteMany({ where: { tokenHash: hashToken(token) } });
  }

  async me(id: string) {
    const user = await this.database.client.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, phone: true, role: true } });
    if (!user) throw unauthorized();
    return user;
  }

  private async createTokens(user: { id: string; role: "CLIENT" | "ADMIN" }) {
    const refreshToken = newRefreshToken();
    await this.database.client.refreshToken.create({ data: { tokenHash: hashToken(refreshToken), userId: user.id, expiresAt: refreshExpiresAt() } });
    return { accessToken: await issueAccessToken(user), refreshToken };
  }
}
