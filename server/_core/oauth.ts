import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  // Login route - redirects to OAuth portal
  app.get("/api/oauth/login", (req: Request, res: Response) => {
    try {
      const oauthPortalUrl = process.env.VITE_OAUTH_PORTAL_URL;
      const appId = process.env.VITE_APP_ID;
      const protocol = req.protocol;
      const host = req.get('host');
      const redirectUri = `${protocol}://${host}/api/oauth/callback`;
      const state = Buffer.from(redirectUri).toString('base64');

      const url = new URL(`${oauthPortalUrl}/app-auth`);
      url.searchParams.set('appId', appId!);
      url.searchParams.set('redirectUri', redirectUri);
      url.searchParams.set('state', state);
      url.searchParams.set('type', 'signIn');

      res.redirect(302, url.toString());
    } catch (error) {
      console.error("[OAuth] Login redirect failed", error);
      res.status(500).json({ error: "Failed to initiate OAuth login" });
    }
  });

  // Callback route - handles OAuth response
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
