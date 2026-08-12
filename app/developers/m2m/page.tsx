import { CodeBlock } from "@/components/reui/code-block";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { TriangleAlertIcon } from "lucide-react";
import { baseUrl } from "../layout";

const issuer = `${baseUrl}/api/auth`;

export default function M2MPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Machine to Machine
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-pretty">
          El grant{" "}
          <code className="bg-muted rounded px-1 font-mono text-xs">
            client_credentials
          </code>{" "}
          permite que servicios y backends se autentiquen sin intervención del
          usuario. El cliente debe estar registrado con este grant type.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">1. Obtén un token</h2>
        <p className="text-muted-foreground text-sm">
          Solo necesitas las credenciales del cliente:
        </p>
        <CodeBlock
          language="bash"
          code={`CLIENT_ID="tu_client_id"
CLIENT_SECRET="tu_client_secret"

curl -s -X POST "${issuer}/oauth2/token" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -u "${"$"}{CLIENT_ID}:${"$"}{CLIENT_SECRET}" \\
  -d "grant_type=client_credentials" \\
  -d "scope=profile" | jq .`}
        />
        <p className="text-muted-foreground text-sm">
          La respuesta incluye un{" "}
          <code className="bg-muted rounded px-1 font-mono text-xs">
            access_token
          </code>{" "}
          (JWT firmado). El{" "}
          <code className="bg-muted rounded px-1 font-mono text-xs">sub</code>{" "}
          del token es el{" "}
          <code className="bg-muted rounded px-1 font-mono text-xs">
            client_id
          </code>
          , no un usuario.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">
          2. Usa el token contra tus APIs
        </h2>
        <CodeBlock
          language="bash"
          code={`curl -s ${baseUrl}/api/oauth-example \\
  -H "Authorization: Bearer ${"$"}{ACCESS_TOKEN}" | jq .`}
        />
      </section>

      <Alert>
        <TriangleAlertIcon data-icon="inline-start" />
        <AlertTitle className="capitalize">Buenas prácticas</AlertTitle>
        <AlertDescription>
          Guarda el secret en un secret manager, rota el client secret
          periódicamente y limita los scopes al mínimo necesario para el
          servicio.
        </AlertDescription>
      </Alert>
    </div>
  );
}
