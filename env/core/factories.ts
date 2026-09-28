import {
  applicationConfigSchema,
  ApplicationConfig,
  Environment,
  RawApplicationConfig,
} from "./schemas";

// TODO: tener en consideracion que a futuro podemos simplificar los metodos de factoria asi evitamos crear una clase por cada tipo de configuracion, y en su lugar tener un metodo que reciba el environment y devuelva la configuracion correspondiente. Esto es especialmente util si tenemos muchas configuraciones diferentes y queremos evitar la proliferacion de clases.

//* ---------------------------------------------------------
//*  Config Factory
//* ---------------------------------------------------------

export class ApplicationConfigFactory {
  static create(environment: Environment): ApplicationConfig {
    const rawConfig: RawApplicationConfig = (() => {
      switch (environment) {
        case "development":
          return new DevelopmentConfig();

        case "testing":
          return new TestingConfig();

        case "production":
          return new ProductionConfig();
      }
    })();

    return applicationConfigSchema.parse(rawConfig);
  }
}

//* ---------------------------------------------------------
//* Development Config Factory
//* ---------------------------------------------------------

export class DevelopmentConfig implements RawApplicationConfig {
  public readonly enviroment = "development" as const;

  public readonly database = {
    HOST: process.env.BETTER_AUTH_DATABASE_HOST,
    NAME: process.env.BETTER_AUTH_DATABASE_NAME,
    PORT: process.env.BETTER_AUTH_DATABASE_PORT,
    USER: process.env.BETTER_AUTH_DATABASE_USER,
    PASS: process.env.BETTER_AUTH_DATABASE_PASS,
    SSL: process.env.BETTER_AUTH_DATABASE_SSL,
    DEBUG: process.env.BETTER_AUTH_DATABASE_DEBUG,
    // TEST_ALLOW_TRUNCATE: process.env.BETTER_AUTH_TEST_ALLOW_TRUNCATE,
  };
}

//* ---------------------------------------------------------
//* Testing Config Factory
//* ---------------------------------------------------------

export class TestingConfig implements RawApplicationConfig {
  public readonly enviroment = "testing" as const;

  public readonly database = {
    HOST: process.env.BETTER_AUTH_DATABASE_HOST,
    NAME: process.env.BETTER_AUTH_DATABASE_NAME,
    PORT: process.env.BETTER_AUTH_DATABASE_PORT,
    USER: process.env.BETTER_AUTH_DATABASE_USER,
    PASS: process.env.BETTER_AUTH_DATABASE_PASS,
    SSL: process.env.BETTER_AUTH_DATABASE_SSL,
    DEBUG: process.env.BETTER_AUTH_DATABASE_DEBUG,
    // TEST_ALLOW_TRUNCATE: process.env.BETTER_AUTH_TEST_ALLOW_TRUNCATE,
  };
}

//* ---------------------------------------------------------
//* Production Config Factory
//* ---------------------------------------------------------

export class ProductionConfig implements RawApplicationConfig {
  public readonly enviroment = "production" as const;
  public readonly database = {
    HOST: process.env.BETTER_AUTH_DATABASE_HOST,
    NAME: process.env.BETTER_AUTH_DATABASE_NAME,
    PORT: process.env.BETTER_AUTH_DATABASE_PORT,
    USER: process.env.BETTER_AUTH_DATABASE_USER,
    PASS: process.env.BETTER_AUTH_DATABASE_PASS,
    SSL: process.env.BETTER_AUTH_DATABASE_SSL,
    DEBUG: process.env.BETTER_AUTH_DATABASE_DEBUG,
    // TEST_ALLOW_TRUNCATE: process.env.BETTER_AUTH_TEST_ALLOW_TRUNCATE,
  };
}
