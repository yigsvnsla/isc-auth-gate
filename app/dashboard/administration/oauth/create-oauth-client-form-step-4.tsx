import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { toast } from "@/components/ui/sonner";
import { OAuthClient } from "@better-auth/oauth-provider";
import { FC, useContext } from "react";
import { CheckIcon, CopyIcon, KeyRoundIcon, TriangleAlertIcon } from "lucide-react";
import { CreatedClientContext } from "./create-oauth-client-dialog";

export const CreatedClientStep: FC = () => {
  const client = useContext(CreatedClientContext);
  if (!client) return null;
  return <CreateOauthClientFormStep4 client={client} />;
};

export interface CreatedClientStepProps {
  client: OAuthClient;
}

const CredentialField: FC<{
  label: string;
  value: string;
  mono?: boolean;
}> = ({ label, value, mono }) => {
  const [copy, isCopied] = useCopyToClipboard();

  return (
    <Field orientation="vertical">
      <FieldLabel>{label}</FieldLabel>
      <div className="flex gap-2">
        <Input
          value={value}
          readOnly
          className={mono ? "font-mono text-xs" : undefined}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Copiar ${label}`}
          title="Copiar"
          onClick={() => {
            copy(value);
            toast.success("Copiado");
          }}
        >
          {isCopied ? <CheckIcon /> : <CopyIcon />}
        </Button>
      </div>
    </Field>
  );
};

export const CreateOauthClientFormStep4: FC<CreatedClientStepProps> = ({
  client,
}) => {
  const clientIdShort = `${client.client_id.slice(0, 12)}...`;

  return (
    <FieldSet>
      <FieldLegend>Credenciales del cliente</FieldLegend>
      <FieldDescription>
        Guarda estas credenciales ahora. El client secret no se mostrará
        nuevamente.
      </FieldDescription>
      <FieldGroup className="flex flex-col gap-4">
        <Alert>
          <TriangleAlertIcon data-icon="inline-start" />
          <AlertTitle className="capitalize">Guarda el client secret</AlertTitle>
          <AlertDescription>
            Por seguridad, el secret solo se muestra una vez. Si lo pierdes,
            deberás rotarlo desde el panel de administración.
          </AlertDescription>
        </Alert>

        <CredentialField
          label="Client ID"
          value={client.client_id}
          mono
        />

        {client.client_secret && (
          <CredentialField
            label="Client Secret"
            value={client.client_secret}
            mono
          />
        )}

        <Field orientation="vertical">
          <FieldLabel>Nombre</FieldLabel>
          <div className="flex items-center gap-2">
            <KeyRoundIcon className="text-muted-foreground size-4" />
            <span className="text-sm">{client.client_name || clientIdShort}</span>
          </div>
        </Field>

        {client.grant_types && client.grant_types.length > 0 && (
          <Field orientation="vertical">
            <FieldLabel>Grant types</FieldLabel>
            <div className="flex flex-wrap gap-1">
              {client.grant_types.map((grant) => (
                <Badge key={grant} variant="outline" className="font-mono text-[10px]">
                  {grant}
                </Badge>
              ))}
            </div>
          </Field>
        )}
      </FieldGroup>
    </FieldSet>
  );
};
