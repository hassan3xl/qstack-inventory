import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /*
   * Serverside Environment variables, not available on the client.
   * Will throw if you access these on the client.
   */
  server: {
    DATABASE_URL: z.string().url().optional(),
    SECRET_KEY: z.string().min(1),
    ALGORITHM: z.string().default("HS256"),
    ACCESS_TOKEN_EXPIRE_MINUTES: z.string().transform(Number),
    REFRESH_TOKEN_EXPIRE_DAYS: z.string().transform(Number),
    NODE_ENV: z.enum(["development", "test", "production"]),
  },
  /*
   * Environment variables available on the client (and server).
   *
   * 💡 You'll get auto-completion for all variables in `client`.
   * 💡 All variables in `client` must be prefixed with `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_API_URL: z.string().url(),
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1),
  },
  /*
   * Due to how Next.js bundles environment variables on Edge and Client,
   * we need to manually destructure them to make sure all are included in bundle.
   *
   * 💡 You'll get a type error if any variable is missing from `runtimeEnv`.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    SECRET_KEY: process.env.SECRET_KEY,
    ALGORITHM: process.env.ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES: process.env.ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS: process.env.REFRESH_TOKEN_EXPIRE_DAYS,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  },
});
