import { Resend } from 'resend'
import { InvitationEmail } from '@/components/email-templates/invitation-email'
import { WelcomeEmail } from '@/components/email-templates/welcome-email'
import { InvitationReminderEmail } from '@/components/email-templates/invitation-reminder-email'

// Initialize Resend client - will return null if API key is not set
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || apiKey === 're_your_resend_api_key') {
    console.warn('Resend API key not configured. Emails will not be sent.')
    return null
  }
  return new Resend(apiKey)
}

interface InvitationEmailParams {
  to: string
  inviterName: string
  organizationName: string
  invitationToken: string
  role: 'admin' | 'member' | 'viewer'
}

export async function sendInvitationEmail(params: InvitationEmailParams) {
  const { to, inviterName, organizationName, invitationToken, role } = params
  
  const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invitations/accept?token=${invitationToken}`
  
  const resend = getResendClient()
  
  // If Resend is not configured, just log and return success
  if (!resend) {
    console.log('📧 [Mock] Invitation email would be sent to:', to)
    console.log('Invitation URL:', invitationUrl)
    return { success: true, data: { id: 'mock-email-id' } }
  }
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'Charity Prep <noreply@charityprep.com>',
      to: [to],
      subject: `You're invited to join ${organizationName} on Charity Prep`,
      react: InvitationEmail({
        inviterName,
        organizationName,
        invitationUrl,
        role,
      }),
    })

    if (error) {
      console.error('Failed to send invitation email:', error)
      throw error
    }

    console.log('📧 Invitation email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Error sending invitation email:', error)
    // Don't throw - allow invitation to be created even if email fails
    return { success: false, error }
  }
}

/**
 * Send invitation reminder email
 */
export async function sendInvitationReminderEmail(
  params: InvitationEmailParams & { daysRemaining: number }
) {
  const { to, inviterName, organizationName, invitationToken, daysRemaining } = params
  
  const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invitations/accept?token=${invitationToken}`
  
  const resend = getResendClient()
  
  // If Resend is not configured, just log and return success
  if (!resend) {
    console.log('📧 [Mock] Reminder email would be sent to:', to)
    console.log('Days remaining:', daysRemaining)
    return { success: true, data: { id: 'mock-email-id' } }
  }
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'Charity Prep <noreply@charityprep.com>',
      to: [to],
      subject: `Reminder: Invitation to join ${organizationName}`,
      react: InvitationReminderEmail({
        inviterName,
        organizationName,
        invitationUrl,
        daysRemaining,
      }),
    })

    if (error) {
      console.error('Failed to send reminder email:', error)
      throw error
    }

    console.log('📧 Reminder email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Error sending reminder email:', error)
    return { success: false, error }
  }
}

/**
 * Send welcome email after user accepts invitation
 */
export async function sendWelcomeEmail(params: {
  to: string
  userName: string
  organizationName: string
  role: string
}) {
  const { to, userName, organizationName, role } = params
  
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
  
  const resend = getResendClient()
  
  // If Resend is not configured, just log and return success
  if (!resend) {
    console.log('📧 [Mock] Welcome email would be sent to:', to)
    console.log('Organization:', organizationName, 'Role:', role)
    return { success: true, data: { id: 'mock-email-id' } }
  }
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'Charity Prep <noreply@charityprep.com>',
      to: [to],
      subject: `Welcome to ${organizationName} on Charity Prep`,
      react: WelcomeEmail({
        userName,
        organizationName,
        role,
        dashboardUrl,
      }),
    })

    if (error) {
      console.error('Failed to send welcome email:', error)
      throw error
    }

    console.log('📧 Welcome email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return { success: false, error }
  }
}