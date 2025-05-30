-- Add mock data for organization 4c24aad5-7856-4e1b-a859-5043f73b7de6

-- Add overseas activities
INSERT INTO overseas_activities (
  organization_id, 
  activity_name, 
  country_code, 
  activity_type, 
  start_date, 
  status, 
  beneficiaries_count, 
  budget_amount, 
  partner_organization,
  description,
  impact_metrics
) VALUES 
-- Clean Water Initiative in Kenya
('4c24aad5-7856-4e1b-a859-5043f73b7de6', 'Clean Water Initiative', 'KE', 'development', '2023-03-01', 'active', 5000, 150000.00, 'Water Aid Kenya', 'Providing clean water access to rural communities through well construction and water purification systems', '{"wells_built": 12, "people_served": 5000, "villages_reached": 8}'),

-- Medical Camp in Bangladesh
('4c24aad5-7856-4e1b-a859-5043f73b7de6', 'Mobile Medical Camps', 'BD', 'healthcare', '2023-05-15', 'active', 3000, 80000.00, 'Doctors Without Borders', 'Providing free medical services and essential medicines to underserved communities', '{"patients_treated": 3000, "vaccines_administered": 1200, "health_workshops": 15}'),

-- Education Support in India
('4c24aad5-7856-4e1b-a859-5043f73b7de6', 'Rural Education Program', 'IN', 'education', '2022-09-01', 'active', 1500, 120000.00, 'Pratham Education Foundation', 'Supporting primary education in rural areas through teacher training and learning materials', '{"schools_supported": 25, "teachers_trained": 60, "students_reached": 1500}'),

-- Emergency Relief in Turkey
('4c24aad5-7856-4e1b-a859-5043f73b7de6', 'Earthquake Relief Response', 'TR', 'emergency_relief', '2023-02-10', 'completed', 10000, 250000.00, 'Turkish Red Crescent', 'Emergency shelter, food, and medical aid for earthquake victims', '{"families_helped": 2000, "shelters_provided": 500, "meals_distributed": 30000}'),

-- Women's Empowerment in Uganda
('4c24aad5-7856-4e1b-a859-5043f73b7de6', 'Women Skills Training Program', 'UG', 'capacity_building', '2023-01-15', 'active', 500, 60000.00, 'Women for Women International', 'Vocational training and microfinance support for women entrepreneurs', '{"women_trained": 500, "businesses_started": 120, "loans_distributed": 200}'),

-- Healthcare Support in Ghana
('4c24aad5-7856-4e1b-a859-5043f73b7de6', 'Maternal Health Program', 'GH', 'healthcare', '2023-04-01', 'active', 2000, 90000.00, 'Ghana Health Service', 'Improving maternal and child health through prenatal care and nutrition programs', '{"mothers_supported": 2000, "health_checks": 8000, "nutrition_kits": 1500}');

-- Add income records
INSERT INTO income_records (
  organization_id,
  source,
  amount,
  date,
  category,
  is_recurring,
  donor_count,
  notes
) VALUES
('4c24aad5-7856-4e1b-a859-5043f73b7de6', 'Individual Donations', 250000.00, '2023-01-15', 'donations', false, 150, 'Q1 individual giving campaign'),
('4c24aad5-7856-4e1b-a859-5043f73b7de6', 'Corporate Partnership - Tech Corp', 500000.00, '2023-02-01', 'corporate', true, NULL, '3-year partnership agreement'),
('4c24aad5-7856-4e1b-a859-5043f73b7de6', 'Government Grant - Education', 750000.00, '2023-03-10', 'grants', false, NULL, 'Department of Education grant for rural schools'),
('4c24aad5-7856-4e1b-a859-5043f73b7de6', 'Charity Gala Event', 180000.00, '2023-04-20', 'events', false, NULL, 'Annual fundraising gala'),
('4c24aad5-7856-4e1b-a859-5043f73b7de6', 'Monthly Giving Program', 85000.00, '2023-05-01', 'donations', true, 425, 'Regular monthly donors'),
('4c24aad5-7856-4e1b-a859-5043f73b7de6', 'Foundation Grant - Healthcare', 300000.00, '2023-06-15', 'grants', false, NULL, 'Smith Foundation healthcare initiative');

-- Add fundraising events
INSERT INTO fundraising_events (
  organization_id,
  event_name,
  event_date,
  event_type,
  location,
  target_amount,
  raised_amount,
  attendees_count,
  status,
  description
) VALUES
('4c24aad5-7856-4e1b-a859-5043f73b7de6', 'Spring Charity Gala 2023', '2023-04-20', 'gala', 'London Hilton Park Lane', 200000.00, 180000.00, 300, 'completed', 'Annual black-tie fundraising gala with auction and entertainment'),
('4c24aad5-7856-4e1b-a859-5043f73b7de6', 'Marathon for Education', '2023-09-15', 'sporting', 'Hyde Park, London', 100000.00, 0, 0, 'upcoming', '10K run to support our education programs'),
('4c24aad5-7856-4e1b-a859-5043f73b7de6', 'Virtual Quiz Night', '2023-02-10', 'virtual', 'Online', 15000.00, 18500.00, 150, 'completed', 'Online trivia event with celebrity host'),
('4c24aad5-7856-4e1b-a859-5043f73b7de6', 'Christmas Market Stall', '2022-12-15', 'community', 'Camden Market, London', 5000.00, 6200.00, 500, 'completed', 'Selling charity merchandise and homemade goods'),
('4c24aad5-7856-4e1b-a859-5043f73b7de6', 'Summer Garden Party', '2023-07-20', 'social', 'Kensington Gardens', 50000.00, 0, 0, 'upcoming', 'Afternoon tea and entertainment in beautiful gardens');

-- Add documents
INSERT INTO documents (
  organization_id,
  name,
  type,
  category,
  file_path,
  file_size,
  mime_type,
  status,
  tags,
  metadata
) VALUES
('4c24aad5-7856-4e1b-a859-5043f73b7de6', 'Annual Report 2022', 'report', 'governance', 'documents/annual-report-2022.pdf', 2048000, 'application/pdf', 'processed', ARRAY['annual report', 'financial', 'governance'], '{"year": 2022, "pages": 48, "sections": ["financials", "impact", "governance"]}'),
('4c24aad5-7856-4e1b-a859-5043f73b7de6', 'Board Meeting Minutes - May 2023', 'minutes', 'governance', 'documents/board-minutes-may-2023.pdf', 512000, 'application/pdf', 'processed', ARRAY['board', 'minutes', 'governance'], '{"meeting_date": "2023-05-15", "attendees": 8, "duration_minutes": 120}'),
('4c24aad5-7856-4e1b-a859-5043f73b7de6', 'Safeguarding Policy 2023', 'policy', 'compliance', 'documents/safeguarding-policy-2023.pdf', 1024000, 'application/pdf', 'processed', ARRAY['policy', 'safeguarding', 'compliance'], '{"version": "2.0", "approved_date": "2023-01-10", "review_date": "2024-01-10"}'),
('4c24aad5-7856-4e1b-a859-5043f73b7de6', 'Grant Agreement - Education Project', 'contract', 'financial', 'documents/grant-agreement-education.pdf', 768000, 'application/pdf', 'processed', ARRAY['grant', 'contract', 'education'], '{"grant_amount": 750000, "start_date": "2023-03-01", "end_date": "2024-02-29"}'),
('4c24aad5-7856-4e1b-a859-5043f73b7de6', 'Impact Report Q2 2023', 'report', 'operations', 'documents/impact-report-q2-2023.pdf', 3072000, 'application/pdf', 'processed', ARRAY['impact', 'quarterly', 'report'], '{"quarter": "Q2", "year": 2023, "beneficiaries_reached": 15000}');