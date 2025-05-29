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

interface WelcomeEmailProps {
  userName: string
  organizationName: string
  role: string
  dashboardUrl: string
}

export function WelcomeEmail({
  userName,
  organizationName,
  role,
  dashboardUrl,
}: WelcomeEmailProps) {
  const roleFeatures = {
    admin: [
      'Full access to all compliance modules',
      'Manage team members and permissions',
      'Configure organization settings',
      'Generate and export reports',
      'Access billing and subscription management',
    ],
    member: [
      'View and edit compliance data',
      'Upload and manage documents',
      'Generate compliance reports',
      'Collaborate with team members',
      'Track deadlines and activities',
    ],
    viewer: [
      'View compliance status and scores',
      'Read organization documents',
      'Access compliance reports',
      'Monitor team activities',
      'Stay informed on compliance updates',
    ],
  }

  const features = roleFeatures[role as keyof typeof roleFeatures] || roleFeatures.member

  return (
    <Html>
      <Head />
      <Preview>Welcome to {organizationName} on Charity Prep</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to {organizationName}!</Heading>
          
          <Text style={text}>
            Hi {userName},
          </Text>

          <Text style={text}>
            You&apos;ve successfully joined {organizationName} as a <strong>{role}</strong> 
            on Charity Prep. We&apos;re excited to have you on board!
          </Text>

          <Text style={text}>
            As a {role}, you can:
          </Text>

          <ul style={list}>
            {features.map((feature, index) => (
              <li key={index} style={listItem}>{feature}</li>
            ))}
          </ul>

          <Section style={buttonContainer}>
            <Button style={button} href={dashboardUrl}>
              Go to Dashboard
            </Button>
          </Section>

          <Hr style={hr} />

          <Heading style={h2}>Quick Start Guide</Heading>

          <Text style={text}>
            <strong>1. Complete your profile</strong><br />
            Add your full name and profile picture to help your team recognize you.
          </Text>

          <Text style={text}>
            <strong>2. Explore the dashboard</strong><br />
            Get familiar with the compliance score, recent activities, and upcoming deadlines.
          </Text>

          <Text style={text}>
            <strong>3. Check compliance modules</strong><br />
            Review safeguarding, fundraising, and overseas activities compliance status.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            Need help? Check out our <Link href="https://charityprep.com/help" style={link}>Help Center</Link> or 
            reply to this email for support.
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

const h2 = {
  color: '#333',
  fontSize: '20px',
  fontWeight: '600',
  lineHeight: '1.25',
  marginBottom: '16px',
  marginTop: '0',
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
  fontSize: '16px',
  textDecoration: 'underline',
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