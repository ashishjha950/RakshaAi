Go through the entire rakshaai-mobile codebase and implement full functionality for each screen, but strictly follow the existing system architecture (SafetyEngine, SOSService, LocationService, SafetyContext).

CRITICAL RULES (DO NOT VIOLATE):

* NO direct API calls from any screen
* ALL emergency triggers MUST go through SafetyContext → SafetyEngine → SOSService
* UI components must remain dumb (no business logic inside screens)
* Reuse existing services in /src/core and /src/services only
* Do NOT introduce parallel logic or duplicate flows

---

IMPLEMENTATION REQUIREMENTS (PAGE-WISE):

1. Dashboard (SahayakScreen.tsx)

* Add quick-access emergency actions:

  * SOS trigger button → SafetyContext.triggerSOS("manual_button")
  * Start/Stop monitoring toggle → SafetyEngine.startMonitoring()
* Show real-time system status:

  * Monitoring active/inactive
  * Last known location timestamp
* Add quick shortcuts:

  * Open Safe Journey
  * Open Disguise Mode
* OPTIONAL: basic AI chat UI (no heavy logic)

---

2. Safe Journey (SafeJourneyScreen.tsx)

* Implement route tracking using LocationService
* Add:

  * Start Journey
  * End Journey
* Continuously monitor user movement
* Detect:

  * Route deviation
  * Long inactivity
* On anomaly:
  → SafetyContext.triggerSOS("route_deviation", true)
* Display:

  * Live location
  * Journey status (safe / risk)

---

3. Community (CommunityScreen.tsx)

* Implement:

  * List of nearby alerts/posts
  * SOS events from other users (read-only)
* Add:

  * Ability to view details (location, time)
* DO NOT:

  * Trigger SOS from here
* Integrate notifications via backend/Firebase

---

4. My Data (HomeScreen.tsx)

* Show:

  * Total SOS triggered
  * Last SOS status
  * Last known location
* Display system health:

  * Permissions granted/missing
  * Monitoring status
* Pull all data via services (no direct logic)

---

5. Evidence Capture (EvidenceScreen.tsx)

* Implement:

  * Start/Stop recording (audio/video)
* On trigger:

  * Save file locally
  * Upload via backend (Cloudinary/S3)
* Link recordings with:

  * timestamp
  * SOS event (if active)
* Add:

  * Secure access (PIN/biometric if available)

---

6. Disguise Mode (DisguiseModeScreen.tsx)

* Implement fake calculator UI
* Add hidden trigger:

  * secret input → SafetyContext.triggerSOS("disguise_trigger")
* Ensure:

  * NO visible UI changes when triggered
* Keep interaction natural and believable

---

7. Inner Circle (InnerCircleScreen.tsx)

* Implement:

  * Add/remove contacts
  * Store in backend/local DB
* Ensure:

  * SOSService uses this contact list
* Add:

  * Priority contact marking

---

CROSS-CUTTING REQUIREMENTS:

* All screens must subscribe to SafetyContext for:

  * system status
  * SOS state

* Add global feedback:

  * "SOS sent"
  * "Retrying..."
  * "Fallback triggered"

* Ensure:

  * App works in background (where applicable)
  * No crashes on permission denial

---

DELIVERABLE:

* Fully wired screens with real functionality
* No placeholder UI
* No broken architecture
* Clean integration with existing core system

---

IMPORTANT:

Do NOT redesign UI.
Do NOT add new architecture.
Only implement missing functionality while respecting the current system design.
