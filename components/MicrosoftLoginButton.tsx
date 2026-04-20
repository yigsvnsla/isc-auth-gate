//import { authClient } from "@workspace/auth-config/lib/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { FC } from "react";
import useSWRMutation from "swr/mutation";

export const MicrosoftLoginButton: FC = () => {
  // const mutation = useSWRMutation("/sign-up/social", () =>
  //   toast.promise(
  //     authClient.signIn.social({
  //       provider: "microsoft",

  //       callbackURL: "http://localhost:3001/dashboard",
  //     }),
  //     {
  //       position: "top-center",
  //       loading: "Ingresando con Microsoft...",
  //       error: "Error al ingresar",
  //     },
  //   ),
  // );

  async function onSubmit() {
    // await mutation.trigger();
  }

  return (
    <Button className="cursor-pointer" variant="outline" type="button" onClick={onSubmit}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="256px"
        height="256px"
        viewBox="0 0 256 256"
        version="1.1"
        preserveAspectRatio="xMidYMid"
      >
        <title>Microsoft</title>
        <g>
          <polygon
            fill="#F1511B"
            points="121.666095 121.666095 0 121.666095 0 0 121.666095 0"
          />
          <polygon
            fill="#80CC28"
            points="256 121.666095 134.335356 121.666095 134.335356 0 256 0"
          />
          <polygon
            fill="#00ADEF"
            points="121.663194 256.002188 0 256.002188 0 134.336095 121.663194 134.336095"
          />
          <polygon
            fill="#FBBC09"
            points="256 256.002188 134.335356 256.002188 134.335356 134.336095 256 134.336095"
          />
        </g>
      </svg>
      Ingresar con Microsoft
    </Button>
  );
};
