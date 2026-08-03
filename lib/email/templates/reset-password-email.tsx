import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Tailwind,
} from "@react-email/components";

interface Props {
  user: { name: string; email: string };
  url: string;
}

export default function ResetPasswordEmail({ user, url }: Props) {
  return (
    <Html>
      <Preview>Reset your ISC Auth password</Preview>
      <Tailwind>
        <Head />
        <Body className="bg-gray-50 font-sans dark:bg-gray-950">
          <Container className="mx-auto my-12 max-w-140">
            <Section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900">
              <Section className="h-1 rounded-t-lg bg-blue-600" />
              <Section className="px-8 py-8">
                <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  ISC Auth
                </Text>
                <Text className="mt-6 text-gray-700 dark:text-gray-300">
                  Hi {user.name},
                </Text>
                <Text className="mt-2 text-gray-700 dark:text-gray-300">
                  Someone requested a password reset for your account. Click the
                  button below to set a new password.
                </Text>
                <Section className="my-8 text-center">
                  <Button
                    href={url}
                    className="rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white dark:bg-blue-500"
                  >
                    Reset Password
                  </Button>
                </Section>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  This link expires in 20 minutes. If you didn&apos;t request this,
                  you can safely ignore this email.
                </Text>
                <Hr className="my-6 border-gray-200 dark:border-gray-700" />
                <Text className="text-xs text-gray-400 dark:text-gray-500">
                  ISC Auth &mdash; Integrity Solutions
                </Text>
              </Section>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

ResetPasswordEmail.PreviewProps = {
  user: { name: "John Doe", email: "john@example.com" },
  url: "https://example.com/reset?token=abc123",
};
