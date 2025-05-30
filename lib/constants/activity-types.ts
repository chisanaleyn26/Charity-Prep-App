/**
 * Common activity types for consistency across the application
 */
export const ActivityTypes = {
  // Page views
  PAGE_VIEW: 'page.view',
  
  // Compliance actions
  COMPLIANCE_SCORE_VIEW: 'compliance.score.view',
  SAFEGUARDING_LIST: 'safeguarding.list',
  SAFEGUARDING_CREATE: 'safeguarding.create',
  SAFEGUARDING_UPDATE: 'safeguarding.update',
  OVERSEAS_LIST: 'overseas.list',
  OVERSEAS_CREATE: 'overseas.create',
  OVERSEAS_UPDATE: 'overseas.update',
  
  // Document actions
  DOCUMENT_UPLOAD: 'document.upload',
  DOCUMENT_DOWNLOAD: 'document.download',
  DOCUMENT_VIEW: 'document.view',
  
  // Report actions
  REPORT_GENERATE: 'report.generate',
  REPORT_EXPORT: 'report.export',
  BOARD_PACK_CREATE: 'board_pack.create',
  ANNUAL_RETURN_GENERATE: 'annual_return.generate',
  CERTIFICATE_GENERATE: 'certificate.generate',
  
  // Export actions
  DATA_EXPORT: 'data.export',
  SCHEDULED_EXPORT_CREATE: 'scheduled_export.create',
  
  // AI actions
  AI_CHAT_MESSAGE: 'ai.chat.message',
  AI_COMPLIANCE_QUESTION: 'ai.compliance.question',
  AI_DOCUMENT_EXTRACT: 'ai.document.extract',
  
  // Search actions
  SEARCH_PERFORM: 'search.perform',
  
  // Settings actions
  PROFILE_UPDATE: 'profile.update',
  ORGANIZATION_UPDATE: 'organization.update',
  NOTIFICATION_SETTINGS_UPDATE: 'notification_settings.update',
  
  // Team actions
  MEMBER_INVITE: 'member.invite',
  MEMBER_REMOVE: 'member.remove',
  MEMBER_ROLE_CHANGE: 'member.role_change',
  
  // Auth actions
  LOGIN: 'auth.login',
  LOGOUT: 'auth.logout',
  PASSWORD_RESET: 'auth.password_reset'
} as const

/**
 * Common audit actions (for manual logging)
 */
export const AuditActions = {
  // Security events
  UNAUTHORIZED_ACCESS: 'security.unauthorized_access',
  SUSPICIOUS_ACTIVITY: 'security.suspicious_activity',
  
  // Data events
  BULK_DELETE: 'data.bulk_delete',
  DATA_EXPORT_SENSITIVE: 'data.export_sensitive',
  
  // System events
  INTEGRATION_CONNECTED: 'integration.connected',
  INTEGRATION_DISCONNECTED: 'integration.disconnected',
  
  // Billing events
  SUBSCRIPTION_CREATED: 'subscription.created',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
  PAYMENT_FAILED: 'payment.failed'
} as const