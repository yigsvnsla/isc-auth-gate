import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Tailwind,
} from "@react-email/components";

interface Props {
  user: { name: string; email: string };
}

export default function ExistingSignupEmail({ user }: Props) {
  return (
    <Html>
      <Preview>Sign-up attempt detected for your account</Preview>
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
                  Someone tried to create an account using your email address (
                  {user.email}). If this was you, try signing in instead.
                </Text>
                <Text className="mt-4 text-gray-700 dark:text-gray-300">
                  If this wasn&apos;t you, you can safely ignore this email.
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

ExistingSignupEmail.PreviewProps = {
  user: { name: "John Doe", email: "john@example.com" },
};
