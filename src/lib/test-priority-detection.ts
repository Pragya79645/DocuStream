/**
 * Test cases for AI Priority Detection
 * 
 * This file contains sample document content to test the AI's ability to 
 * correctly assign priority levels based on urgency indicators.
 */

export const priorityTestCases = [
  {
    title: "Emergency Safety Protocol - Immediate Action Required",
    content: `
      URGENT: Emergency Safety Protocol Update
      
      Due to a critical safety incident reported at Station 5, all personnel must 
      immediately implement the following emergency procedures:
      
      1. Suspend all train operations on Line 2 effective immediately
      2. Conduct emergency safety briefings for all staff by end of day
      3. Report any similar safety concerns within 24 hours
      
      This directive requires IMMEDIATE compliance and must be executed ASAP.
      Any delays could result in serious safety risks.
      
      Contact Emergency Response Team: 1800-METRO-911
    `,
    expectedPriority: "high",
    reason: "Contains 'URGENT', 'immediately', 'ASAP', 'critical' and safety-related emergency content"
  },
  
  {
    title: "New Policy Implementation Timeline",
    content: `
      Metro Operations Policy Update - Implementation Required
      
      The following policy changes will be implemented over the next 30 days:
      
      1. Updated passenger safety protocols (Deadline: October 15, 2025)
      2. New ticketing system training for all staff (Training starts: September 25, 2025)
      3. Revised maintenance schedules (Effective: October 1, 2025)
      
      All department heads should schedule training sessions and ensure staff
      compliance within the specified timeframes.
      
      For questions, contact HR at hr@kmrl.gov.in
    `,
    expectedPriority: "medium",
    reason: "Policy changes with specific implementation timelines and training requirements"
  },
  
  {
    title: "Monthly Newsletter - September 2025",
    content: `
      KMRL Monthly Newsletter - September 2025
      
      Welcome to our monthly update highlighting achievements and upcoming events.
      
      This Month's Highlights:
      - Successfully completed 1 million passenger journeys
      - Launched new mobile app with improved features
      - Employee of the month: Rajesh Kumar, Maintenance Team
      
      Upcoming Events:
      - Annual company picnic - October 20, 2025
      - Professional development workshop series starting November
      - Year-end performance reviews scheduled for December
      
      Thank you for your continued dedication to KMRL's mission.
    `,
    expectedPriority: "low",
    reason: "Informational newsletter with no immediate action items or urgent deadlines"
  },
  
  {
    title: "Regulatory Compliance Deadline - Environmental Audit",
    content: `
      Environmental Compliance Audit - Action Required
      
      The Ministry of Environment has scheduled a compliance audit for October 5, 2025.
      
      Required actions before audit date:
      1. Complete environmental impact assessment reports
      2. Update waste management documentation
      3. Verify all emission control systems are operational
      4. Prepare compliance certificates for review
      
      This is a regulatory requirement and non-compliance may result in
      operational penalties. All documentation must be ready 7 days before audit.
      
      Department leads should coordinate with Legal and Operations teams.
    `,
    expectedPriority: "high",
    reason: "Regulatory compliance with specific near-term deadline and penalty consequences"
  },
  
  {
    title: "Training Material Update - Signal Operations",
    content: `
      Updated Training Materials Available - Signal Operations
      
      New training materials for signal operations have been developed and are
      now available in the training portal.
      
      Contents include:
      - Updated signal protocols
      - New safety procedures
      - Emergency response guidelines
      - Equipment maintenance procedures
      
      Scheduled training sessions:
      - Batch 1: October 10-12, 2025
      - Batch 2: October 17-19, 2025
      - Batch 3: October 24-26, 2025
      
      Please register for your preferred batch through the HR portal.
    `,
    expectedPriority: "medium",
    reason: "Training materials with scheduled sessions requiring action within reasonable timeframe"
  }
];

/**
 * Function to test priority detection
 * This can be used to validate that the AI correctly assigns priorities
 */
export function validatePriorityDetection(detectedPriority: string, expectedPriority: string, title: string) {
  const isCorrect = detectedPriority === expectedPriority;
  
  console.log(`
    Test: ${title}
    Expected: ${expectedPriority}
    Detected: ${detectedPriority}
    Result: ${isCorrect ? '✅ PASS' : '❌ FAIL'}
  `);
  
  return isCorrect;
}