import { BookUserIcon, GlobeIcon, LockIcon } from "lucide-react";
import { CreateOauthClientFormStep1 } from "./create-oauth-client-form-step-1";
import { CreateOauthClientFormStep2 } from "./create-oauth-client-form-step-2";
import { CreateOauthClientFormStep3 } from "./create-oauth-client-form-step-3";

export const AuthClientFormSteps = [
  {
    title: "Información",
    icon: <BookUserIcon className="size-4" />,
    content: <CreateOauthClientFormStep1 />,
  },
  {
    title: "Redirect URIs",
    icon: <GlobeIcon className="size-4" />,
    content: <CreateOauthClientFormStep2 />,
  },
  {
    title: "Seguridad",
    icon: <LockIcon className="size-4" />,
    content: <CreateOauthClientFormStep3 />,
  },
];