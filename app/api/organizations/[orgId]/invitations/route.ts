import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { 
  createInvitation, 
  listInvitations 
} from '@/features/teams/services/invitation.service'
import { sendInvitationEmail } from '@/lib/email/invitation'

const InviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'member', 'viewer'])
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Verify user is admin
    const { data: member } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single()
    
    if (!member || member.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can view invitations' },
        { status: 403 }
      )
    }
    
    const invitations = await listInvitations(orgId, supabase)
    
    return NextResponse.json({ invitations })
  } catch (error) {
    console.error('Failed to list invitations:', error)
    return NextResponse.json(
      { error: 'Failed to list invitations' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Parse request body
    const body = await request.json()
    const { email, role } = InviteSchema.parse(body)
    
    // Verify user is admin
    const { data: member } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single()
    
    if (!member || member.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can send invitations' },
        { status: 403 }
      )
    }
    
    // Check user limit
    const { data: canInvite } = await supabase
      .rpc('check_organization_user_limit', { org_id: orgId })
    
    if (!canInvite) {
      return NextResponse.json(
        { error: 'Organization has reached its user limit. Please upgrade your subscription.' },
        { status: 403 }
      )
    }
    
    // Get organization details
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', orgId)
      .single()
    
    // Get inviter details
    const { data: inviter } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', user.id)
      .single()
    
    // Create invitation - pass the supabase client to preserve auth context
    const invitation = await createInvitation(orgId, email, role, user.id, supabase)
    
    // Send invitation email
    try {
      await sendInvitationEmail({
        to: email,
        inviterName: inviter?.full_name || inviter?.email || 'A team member',
        organizationName: org?.name || 'your organization',
        invitationToken: invitation.invitation_token,
        role
      })
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError)
      // Don't fail the request if email fails
    }
    
    return NextResponse.json({ 
      invitation,
      message: 'Invitation sent successfully'
    })
    
  } catch (error) {
    console.error('Failed to create invitation:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    )
  }
}