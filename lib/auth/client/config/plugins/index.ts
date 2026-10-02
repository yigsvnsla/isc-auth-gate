import { BetterAuthAdminClientConfig } from "./admin";
import { BetterAuthApiKeyClientConfig } from "./api-key";
import { BetterAuthEmailOtpClientConfig } from "./email-otp";
import { BetterAuthInferAdditionalFieldsClientConfig } from "./infer-additional-fields";
import { BetterAuthLastLoginMethodClientConfig } from "./last-login";
import { BetterAuthMagicLinkClientConfig } from "./magic-link";
import { BetterAuthMultiSessionClientConfig } from "./multi-session";
import { BetterAuthOauthDeviceAuthorizationClientConfig } from "./oauth-device-authorization";
import { BetterAuthOauthPopupClientConfig } from "./oauth-popup";
import { BetterAuthOAuthProviderClientConfig } from "./oauth-provider";
import { BetterAuthOneTimeTokenClientConfig } from "./one-time-token";
import { BetterAuthOrganizationClientConfig } from "./organization";
import { BetterAuthPasskeyClientConfig } from "./pass-key";
import { BetterAuthPhoneNumberClientConfig } from "./phone";
import { BetterAuthTwoFactorClientConfig } from "./two-factor";
import { BetterAuthUsernameClientConfig } from "./username";

export {
  BetterAuthAdminClientConfig,
  BetterAuthApiKeyClientConfig,
  BetterAuthEmailOtpClientConfig,
  BetterAuthInferAdditionalFieldsClientConfig,
  BetterAuthLastLoginMethodClientConfig,
  BetterAuthMagicLinkClientConfig,
  BetterAuthMultiSessionClientConfig,
  BetterAuthOauthDeviceAuthorizationClientConfig,
  BetterAuthOauthPopupClientConfig,
  BetterAuthOAuthProviderClientConfig,
  BetterAuthOneTimeTokenClientConfig,
  BetterAuthOrganizationClientConfig,
  BetterAuthPasskeyClientConfig,
  BetterAuthPhoneNumberClientConfig,
  BetterAuthTwoFactorClientConfig,
  BetterAuthUsernameClientConfig,
};

/**
 * Plugins del cliente, espejo de los del servidor (lib/auth/server/config/plugins).
 *
 * Sin anotación de tipo a propósito: el array inferido conserva el tipo de
 * cada plugin y con él `authClient.organization.*`, `authClient.admin.*`, etc.
 */
export const BetterAuthClientPlugins = [
  BetterAuthAdminClientConfig,
  BetterAuthOrganizationClientConfig,
  BetterAuthOAuthProviderClientConfig,
  BetterAuthOauthDeviceAuthorizationClientConfig,
  BetterAuthOauthPopupClientConfig,
  BetterAuthTwoFactorClientConfig,
  BetterAuthInferAdditionalFieldsClientConfig,
  BetterAuthApiKeyClientConfig,
  BetterAuthUsernameClientConfig,
  BetterAuthPhoneNumberClientConfig,
  BetterAuthEmailOtpClientConfig,
  BetterAuthMagicLinkClientConfig,
  BetterAuthMultiSessionClientConfig,
  BetterAuthLastLoginMethodClientConfig,
  BetterAuthOneTimeTokenClientConfig,
  BetterAuthPasskeyClientConfig,
];
