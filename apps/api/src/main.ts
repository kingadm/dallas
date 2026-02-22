import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";

function parseOrigins(value?: string): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const origins = parseOrigins(config.get<string>("CORS_ORIGINS"));
  app.enableCors({
    origin: origins.length ? origins : true,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true
    })
  );

  const port = Number(config.get<string>("PORT") || 3001);
  await app.listen(port);
  console.log(`[api] listening on http://localhost:${port}`);
}

bootstrap();