// Conectividad real contra PostgreSQL (SELECT 1). Exit 0 si conecta, 1 si no.
//
// ponytail: `drizzle-kit check` no va aquí — valida la consistencia del
// historial de migraciones, no la conexión. CI lo corre como paso aparte.
import { checkConnection } from "./check-connection";

const result = await checkConnection();

process.exit(result.isSuccess() ? 0 : 1);
