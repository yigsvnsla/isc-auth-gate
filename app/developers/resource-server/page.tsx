import { CodeBlock } from "@/components/reui/code-block";
import { baseUrl } from "../layout";

const issuer = `${baseUrl}/api/auth`;

export default function ResourceServerPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Resource Server</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-pretty">
          Protege tus APIs validando los access tokens que emite ISC Auth. Los
          tokens son JWT firmados con RS256; puedes verificarlos localmente
          con las claves del jwks o de forma remota con el endpoint de
          introspect.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">1. Verificación local (recomendada)</h2>
        <p className="text-muted-foreground text-sm">
          Descarga las claves públicas desde el jwks_uri y valida la firma,
          issuer, audience y expiración sin llamadas de red por request:
        </p>
        <CodeBlock
          language="bash"
          code={`# JWKS publico
curl -s ${issuer}/jwks | jq .`}
        />
        <p className="text-muted-foreground text-sm">
          Los access tokens usan:
        </p>
        <ul className="text-muted-foreground list-inside list-disc text-sm">
          <li>
            <strong>iss</strong>: {issuer}
          </li>
          <li>
            <strong>aud</strong>: tu API (configurado en el cliente)
          </li>
          <li>
            <strong>exp</strong>: expiración (por defecto 1 hora)
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">
          2. Verificación remota (introspect)
        </h2>
        <p className="text-muted-foreground text-sm">
          El endpoint de introspect valida el token en el servidor y devuelve
          sus claims:
        </p>
        <CodeBlock
          language="bash"
          code={`curl -s -X POST "${issuer}/oauth2/introspect" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -u "${"$"}{CLIENT_ID}:${"$"}{CLIENT_SECRET}" \\
  -d "token=${"$"}{ACCESS_TOKEN}" | jq .`}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">3. Ejemplo de API protegida</h2>
        <p className="text-muted-foreground text-sm">
          ISC Auth incluye un ejemplo en{" "}
          <code className="bg-muted rounded px-1 font-mono text-xs">
            /api/oauth-example
          </code>{" "}
          que verifica el Bearer token y responde el{" "}
          <code className="bg-muted rounded px-1 font-mono text-xs">sub</code>{" "}
          y los scopes autorizados:
        </p>
        <CodeBlock
          language="bash"
          code={`curl -s ${baseUrl}/api/oauth-example \\
  -H "Authorization: Bearer ${"$"}{ACCESS_TOKEN}" | jq .`}
        />
        <p className="text-muted-foreground text-sm">
          Con scopes válidos responde{" "}
          <code className="bg-muted rounded px-1 font-mono text-xs">
            {"{ \"sub\": \"...\", \"scopes\": [...] }"}
          </code>{" "}
          y sin token responde{" "}
          <code className="bg-muted rounded px-1 font-mono text-xs">401</code>.
        </p>
      </section>
    </div>
  );
}
