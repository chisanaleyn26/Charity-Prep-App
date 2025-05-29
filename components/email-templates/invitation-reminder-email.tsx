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

interface InvitationReminderEmailProps {
  inviterName: string
  organizationName: string
  invitationUrl: string
  daysRemaining: number
}

export function InvitationReminderEmail({
  inviterName,
  organizationName,
  invitationUrl,
  daysRemaining,
}: InvitationReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reminder: You&apos;re invited to join {organizationName} on Charity Prep</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={reminder}>REMINDER</Text>
          
          <Heading style={h1}>
            Your invitation to {organizationName} expires in {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
          </Heading>
          
          <Text style={text}>
            {inviterName} previously invited you to join {organizationName} on Charity Prep. 
            This invitation will expire soon.
          </Text>

          <Text style={text}>
            Don&apos;t miss out on the opportunity to collaborate with your team and help manage 
            your charity&apos;s compliance requirements efficiently.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={invitationUrl}>
              Accept Invitation Now
            </Button>
          </Section>

          <Text style={text}>
            Or copy and paste this URL into your browser:
          </Text>
          <Link href={invitationUrl} style={link}>
            {invitationUrl}
          </Link>

          <Hr style={hr} />

          <Text style={text}>
            <strong>Why join Charity Prep?</strong>
          </Text>

          <ul style={list}>
            <li style={listItem}>Streamline compliance management</li>
            <li style={listItem}>Collaborate with your team in real-time</li>
            <li style={listItem}>Never miss important deadlines</li>
            <li style={listItem}>Generate reports with one click</li>
          </ul>

          <Hr style={hr} />

          <Text style={footer}>
            If you don&apos;t want to join {organizationName}, you can safely ignore this email. 
            The invitation will expire automatically.
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

const reminder = {
  backgroundColor: '#FEF3C7',
  color: '#92400E',
  fontSize: '12px',
  fontWeight: '600',
  letterSpacing: '0.5px',
  padding: '4px 8px',
  borderRadius: '4px',
  display: 'inline-block',
  marginBottom: '16px',
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

const list = {
  paddingLeft: '20px',
  marginBottom: '24px',
}

const listItem = {
  color: '#555',
  fontSize: '16px',
  lineHeight: '1.75',
  marginBottom: '8px',
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