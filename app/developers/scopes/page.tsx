import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const scopes = [
  {
    name: "openid",
    description: "Requerido para OIDC. Devuelve un id_token con el sub del usuario.",
    requires: "Obligatorio si usas OIDC",
  },
  {
    name: "profile",
    description: "Datos básicos del perfil: name, picture, given_name, family_name.",
    requires: "—",
  },
  {
    name: "email",
    description: "Dirección de correo y estado de verificación.",
    requires: "—",
  },
  {
    name: "offline_access",
    description:
      "Permite emitir refresh_token para acceder en segundo plano cuando el usuario no está conectado.",
    requires: "Solicítalo solo si lo necesitas",
  },
];

export default function ScopesPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scopes</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-pretty">
          Los scopes definen los permisos que tu aplicación solicita. El
          usuario los revisa en la pantalla de consentimiento antes de
          autorizar.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {scopes.map((scope) => (
          <Card key={scope.name}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono">
                  {scope.name}
                </Badge>
                <CardTitle className="text-sm font-normal">
                  {scope.requires}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">{scope.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Cómo solicitarlos</h2>
        <p className="text-muted-foreground text-sm">
          En el authorize request, separados por espacio:
        </p>
        <code className="bg-muted block w-fit rounded-md px-3 py-2 font-mono text-xs">
          scope=openid+profile+email+offline_access
        </code>
        <p className="text-muted-foreground text-sm">
          Los scopes que tu cliente puede solicitar están limitados a los
          configurados en su registro. El consentimiento es incremental: si
          una app ya autorizada pide scopes nuevos, el usuario deberá volver a
          aceptar.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Consentimiento</h2>
        <p className="text-muted-foreground text-sm">
          La primera vez que una app solicita acceso, el usuario ve la pantalla
          de consentimiento con los scopes pedidos. Si acepta, la decisión se
          guarda y las siguientes autorizaciones con los mismos scopes se
          procesan sin preguntar. Los clientes marcados como{" "}
          <strong>trusted</strong> omiten la pantalla por completo.
        </p>
      </section>
    </div>
  );
}
