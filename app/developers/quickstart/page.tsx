import { CodeBlock } from "@/components/reui/code-block";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  TriangleAlertIcon,
} from "lucide-react";
import { baseUrl } from "../layout";

export default function QuickstartPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quickstart</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-pretty">
          Registra tu aplicación, obtén tus credenciales y completa tu primera
          autorización.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">1. Registra tu aplicación</h2>
        <p className="text-muted-foreground text-sm">
          Solicita el registro de tu app con el equipo de administración o
          desde el panel de administración. Necesitarás:
        </p>
        <ul className="text-muted-foreground list-inside list-disc text-sm">
          <li>Un nombre y URL pública para tu aplicación</li>
          <li>Una o más redirect URIs de callback (HTTPS)</li>
          <li>
            El método de autenticación:{" "}
            <code className="bg-muted rounded px-1 font-mono text-xs">
              client_secret_basic
            </code>{" "}
            (confidencial) o{" "}
            <code className="bg-muted rounded px-1 font-mono text-xs">none</code>{" "}
            (público, requiere PKCE)
          </li>
        </ul>
        <p className="text-muted-foreground text-sm">
          Recibirás un <strong>client_id</strong> y un{" "}
          <strong>client_secret</strong> (solo para clientes confidenciales).
          El secret se muestra una única vez: guárdalo de forma segura.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">2. Verifica tu conexión</h2>
        <p className="text-muted-foreground text-sm">
          El endpoint de descubrimiento responde la configuración completa del
          servidor:
        </p>
        <CodeBlock
          language="bash"
          code={`curl -s ${baseUrl}/.well-known/oauth-authorization-server/api/auth | jq .`}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">3. Flujo recomendado</h2>
        <p className="text-muted-foreground text-sm">
          Para apps web y móviles usa{" "}
          <strong>Authorization Code + PKCE (S256)</strong>. La guía completa
          con pasos y ejemplos está en{" "}
          <a
            href="/developers/flows"
            className="text-primary underline underline-offset-2"
          >
            Authorization Code + PKCE
          </a>
          .
        </p>
      </section>

      <Alert>
        <TriangleAlertIcon data-icon="inline-start" />
        <AlertTitle className="capitalize">Requisitos de seguridad</AlertTitle>
        <AlertDescription>
          OAuth 2.1 exige PKCE para clientes públicos y transporte HTTPS en
          producción. Los tokens de acceso se emiten como JWT firmados con
          RS256 por el servidor.
        </AlertDescription>
      </Alert>
    </div>
  );
}
