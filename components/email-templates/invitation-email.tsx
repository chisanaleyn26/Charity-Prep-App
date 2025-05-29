import * as React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface InvitationEmailProps {
  inviterName: string
  organizationName: string
  invitationUrl: string
  role: 'admin' | 'member' | 'viewer'
}

export function InvitationEmail({
  inviterName,
  organizationName,
  invitationUrl,
  role,
}: InvitationEmailProps) {
  const roleDescriptions = {
    admin: 'with full administrative access to manage the organization',
    member: 'as a team member with access to view and edit compliance data',
    viewer: 'with read-only access to view compliance information',
  }

  return (
    <Html>
      <Head />
      <Preview>You&apos;ve been invited to join {organizationName} on Charity Prep</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>You&apos;re invited to join {organizationName}</Heading>
          
          <Text style={text}>
            {inviterName} has invited you to join {organizationName} on Charity Prep 
            as a <strong>{role}</strong> {roleDescriptions[role]}.
          </Text>

          <Text style={text}>
            Charity Prep helps UK charities streamline their compliance management, 
            from safeguarding to fundraising regulations, all in one place.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={invitationUrl}>
              Accept Invitation
            </Button>
          </Section>

          <Text style={text}>
            Or copy and paste this URL into your browser:
          </Text>
          <Link href={invitationUrl} style={link}>
            {invitationUrl}
          </Link>

          <Hr style={hr} />

          <Text style={footer}>
            This invitation will expire in 7 days. If you didn&apos;t expect this invitation, 
            you can safely ignore this email.
          </Text>

          <Text style={footer}>
            Charity Prep - Compliance made simple for UK charities
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.25',
  marginBottom: '24px',
}

const text = {
  color: '#555',
  fontSize: '16px',
  lineHeight: '1.5',
  marginBottom: '24px',
}

const buttonContainer = {
  marginBottom: '32px',
}

const button = {
  backgroundColor: '#B1FA63',
  borderRadius: '6px',
  color: '#243837',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
}

const link = {
  color: '#2754C5',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
}

const hr = {
  borderColor: '#dfe1e4',
  margin: '42px 0 26px',
}

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '1.5',
  marginBottom: '0',
}