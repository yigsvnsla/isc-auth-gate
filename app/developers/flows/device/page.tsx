import { CodeBlock } from "@/components/reui/code-block";
import { baseUrl } from "../../layout";

const issuer = `${baseUrl}/api/auth`;
const deviceGrant = "urn:ietf:params:oauth:grant-type:device_code";

export default function DeviceFlowPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Device Authorization (RFC 8628)
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-pretty">
          Para aplicaciones sin navegador: CLIs, TVs, consolas o dispositivos
          IoT. El dispositivo muestra un código; el usuario lo aprueba desde un
          navegador; el dispositivo recibe los tokens.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">
          1. Solicita un device code
        </h2>
        <p className="text-muted-foreground text-sm">
          Autentícate como cliente (Basic auth) y pide un device code. El
          cliente debe estar registrado con el grant type{" "}
          <code className="bg-muted rounded px-1 font-mono text-xs">
            {deviceGrant}
          </code>
          .
        </p>
        <CodeBlock
          language="bash"
          code={`curl -s -X POST "${issuer}/device/code" \\
  -H "Content-Type: application/json" \\
  -u "${"$"}{CLIENT_ID}:${"$"}{CLIENT_SECRET}" \\
  -d '{"client_id": "${"$"}{CLIENT_ID}", "scope": "openid profile email"}' | jq .`}
        />
        <p className="text-muted-foreground text-sm">
          Respuesta:{" "}
          <code className="bg-muted rounded px-1 font-mono text-xs">
            device_code
          </code>{" "}
          (para el polling),{" "}
          <code className="bg-muted rounded px-1 font-mono text-xs">
            user_code
          </code>{" "}
          (para el usuario),{" "}
          <code className="bg-muted rounded px-1 font-mono text-xs">
            verification_uri
          </code>{" "}
          y{" "}
          <code className="bg-muted rounded px-1 font-mono text-xs">
            interval
          </code>{" "}
          (segundos entre polls).
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">
          2. Muestra el código al usuario
        </h2>
        <p className="text-muted-foreground text-sm">
          El dispositivo muestra el{" "}
          <code className="bg-muted rounded px-1 font-mono text-xs">
            user_code
          </code>{" "}
          y la URL de verificación. El usuario entra en ella, ingresa el código
          y autoriza (o rechaza) el acceso con su sesión:
        </p>
        <CodeBlock
          language="text"
          code={`Verificación: ${baseUrl}/auth/device
Código:      XXXXXXXX`}
        />
        <p className="text-muted-foreground text-sm">
          Si el usuario no tiene sesión, la página lo lleva al login y vuelve a
          la verificación al autenticarse.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">3. Poll del token endpoint</h2>
        <p className="text-muted-foreground text-sm">
          El dispositivo consulta el token endpoint con el grant type device
          hasta recibir tokens o un error. Respeta el{" "}
          <code className="bg-muted rounded px-1 font-mono text-xs">
            interval
          </code>{" "}
          de la respuesta del paso 1.
        </p>
        <CodeBlock
          language="bash"
          code={`while true; do
  RESULT=$(curl -s -X POST "${issuer}/oauth2/token" \\
    -H "Content-Type: application/x-www-form-urlencoded" \\
    -u "${"$"}{CLIENT_ID}:${"$"}{CLIENT_SECRET}" \\
    -d "grant_type=${deviceGrant}" \\
    -d "device_code=${"$"}{DEVICE_CODE}" \\
    -d "client_id=${"$"}{CLIENT_ID}")

  ERROR=$(echo "${"$"}{RESULT}" | jq -r '.error // empty')
  case "${"$"}{ERROR}" in
    "authorization_pending") sleep ${"$"}{INTERVAL};;
    "slow_down") INTERVAL=$((INTERVAL + 5));;
    "expired_token"|"access_denied") echo "${"$"}{RESULT}" | jq .; exit 1;;
    "") echo "${"$"}{RESULT}" | jq .; exit 0;;
  esac
done`}
        />
        <p className="text-muted-foreground text-sm">
          Cuando el usuario aprueba, la respuesta incluye{" "}
          <code className="bg-muted rounded px-1 font-mono text-xs">
            access_token
          </code>
          ,{" "}
          <code className="bg-muted rounded px-1 font-mono text-xs">
            refresh_token
          </code>{" "}
          (si solicitaste{" "}
          <code className="bg-muted rounded px-1 font-mono text-xs">
            offline_access
          </code>
          ) e{" "}
          <code className="bg-muted rounded px-1 font-mono text-xs">
            id_token
          </code>{" "}
          (si solicitaste{" "}
          <code className="bg-muted rounded px-1 font-mono text-xs">
            openid
          </code>
          ).
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Errores</h2>
        <ul className="text-muted-foreground list-inside list-disc text-sm">
          <li>
            <code className="bg-muted rounded px-1 font-mono text-xs">
              authorization_pending
            </code>{" "}
            — el usuario aún no decide.
          </li>
          <li>
            <code className="bg-muted rounded px-1 font-mono text-xs">
              slow_down
            </code>{" "}
            — aumenta el intervalo de polling 5s.
          </li>
          <li>
            <code className="bg-muted rounded px-1 font-mono text-xs">
              expired_token
            </code>{" "}
            — el device code venció (30 min por defecto).
          </li>
          <li>
            <code className="bg-muted rounded px-1 font-mono text-xs">
              access_denied
            </code>{" "}
            — el usuario rechazó el acceso.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Ejemplo de referencia</h2>
        <p className="text-muted-foreground text-sm">
          El repo incluye un CLI de prueba que implementa este flujo:
        </p>
        <CodeBlock
          language="bash"
          code={`ISC_CLIENT_ID=... ISC_CLIENT_SECRET=... bun run oauth:device-cli`}
        />
      </section>
    </div>
  );
}