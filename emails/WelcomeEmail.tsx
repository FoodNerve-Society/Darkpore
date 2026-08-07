import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Font,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  firstName: string;
  role: string;
}

export const WelcomeEmail = ({
  firstName,
  role,
}: WelcomeEmailProps) => {
  const displayRole = role || 'Value Chain Actors';

  return (
    <Html>
      <Head>
        <Font
          fontFamily="Outfit"
          fallbackFontFamily="Helvetica"
          webFont={{
            url: 'https://fonts.gstatic.com/s/outfit/v11/QGYyz_MVcBeNP4NJtEtq.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Welcome to the Vanguard.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>FOOD NERVE</Heading>
          
          <Text style={text}>
            {firstName},
          </Text>
          <Text style={text}>
            Your position on the list is secured.
          </Text>
          <Text style={text}>
            You are now part of an exclusive vanguard of <strong>{displayRole}</strong> positioned at the forefront of the African agricultural ecosystem.
          </Text>
          <Text style={text}>
            When the gateway opens, you will be among the very first to receive dispatch briefings, early access to the <em>Meet</em> calendar, and high-level trade intelligence.
          </Text>
          <Text style={text}>
            Keep a close watch on this inbox. The paradigm is shifting.
          </Text>
          <Text style={footer}>
            — The Food Nerve Ecosystem
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;

const main = {
  backgroundColor: '#050505',
  fontFamily: 'Outfit, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: '#0f172a',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  margin: '40px auto',
  padding: '40px',
  maxWidth: '500px',
};

const h1 = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '800',
  letterSpacing: '2px',
  margin: '0 0 32px',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#e2e8f0',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 20px',
};

const footer = {
  color: '#94a3b8',
  fontSize: '15px',
  fontWeight: '600',
  marginTop: '40px',
};
