import useSWRMutation from "swr/mutation";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { FC } from "react";
import { BetterFetchError } from "better-auth/react";
import { SignInPopupOptions } from "better-auth/client/plugins";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";

interface MicrosoftLoginButtonProps {
  className?: string;
}

interface SignInSocialOauthClientArg {
  arg: SignInPopupOptions;
}

type SignInPopupResponseData = Awaited<ReturnType<typeof authClient.signIn.popup>>["data"];

const key = "/sign-up/social";

const fetcher = async (_key: string, { arg }: SignInSocialOauthClientArg) => {
  const { data, error } = await authClient.signIn.popup(arg);
  if (error) throw error;
  return data;
};

export const useSignInSocialOauthClientMutation = () => {
  return useSWRMutation<SignInPopupResponseData, BetterFetchError, string, SignInPopupOptions>(key, fetcher);
};

export const MicrosoftLoginButton: FC<MicrosoftLoginButtonProps> = ({ className }) => {
  const router = useRouter();
  const { trigger, isMutating } = useSignInSocialOauthClientMutation();

  async function submitHandler() {
    toast.promise(
      trigger({
        provider: "microsoft",
        callbackURL: "/dashboard",
        
      }),
      {
        loading: "Iniciando sesión con Microsoft...",
        success: () => {
          // 3. Ejecutar la redirección programática al resolverse el popup
          router.push("/dashboard");
          router.refresh(); // Opcional: Revalida Server Components en Next.js
          return "¡Sesión iniciada correctamente!";
        },
        error: (err) => `Error al iniciar sesión: ${err.message || err}`,
      },
    );
  }

  return (
    <Button
      className={cn("w-full cursor-pointer", className)}
      variant="outline"
      type="button"
      onClick={submitHandler}
      disabled={isMutating}
    >
      {isMutating ? (
        <Spinner />
      ) : (
        <>
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
        </>
      )}
    </Button>
  );
};
