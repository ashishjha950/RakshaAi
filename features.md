# RakshaAI Feature Blueprint (By Page)

This document breaks down the specific feature requirements and functionalities mapped to each screen in the RakshaAI application. It serves as a primary reference for feature completeness and scoping.

---

### 1. **Dashboard** (`/`)
* **Mode-Aware Greeting:** Dynamically updates UI and tool access based on whether the app is in Sahayak (Full) or Guardian (Stealth) mode.
* **Global SOS Status Indicator:** Shows whether the background voice/audio monitor is actively running.
* **Quick Access Widgets:** Direct, large touch targets jumping straight to critical tools (Safe Journey, Evidence, Disguise).
* **Fake Call Deterrent Widget (Sahayak Mode Only):** Instantly trigger the aggressive AI voice "fake call" simulation right from the main feed.

### 2. **SOS Triggers** (`/sos`)
* **One-Tap Emergency Alert:** Fire an immediate red-alert payload.
* **Integration with Global Safety Engine:** Routes the manual trigger through the central `SafetyContext`, granting the user a 3-second visual countdown window to cancel false positives.
* **Silent Execution:** Fallback GPS logic ensuring SOS proceeds silently even if hardware GPS permissions time out.

### 3. **Safe Journey** (`/safe-journey`)
* **Live GPS Plotting:** Uses high-accuracy device hardware to map the user’s exact location along a scheduled route.
* **Deviance Detection:** Constantly runs Haversine calculations against the planned geometry. Automatically triggers an SOS if the user wanders >300m off-path.
* **Suspicious Wait Timer:** Fires an automatic SOS if the user's velocity hits 0 for more than 5 uninterrupted minutes mid-journey.
* **Dynamic Risk Intelligence:** Modifies route risk scores dynamically based on time-of-day (e.g., higher multipliers for night travel) and alerts the user to real-time proximity threats sourced from existing crime databases.

### 4. **Disguise Mode** (`/disguise`)
* **Total UI Obfuscation:** The app visually completely transforms into either an iOS-clone Calculator or a minimalist Wellness Tracker app to fool peering attackers.
* **Covert AV Recording:** The absolute moment an SOS is triggered (e.g., via scream or keyword) while disguised, the app silently fires up the front-facing camera and microphone to compile a `.webm` video recording of the assault, purely in the background.
* **Vault PIN Requirement:** Disguise mode drops the recording into the encrypted Vault and can ONLY be exited by entering a registered 4-digit PIN sequence on the calculator keypad or wellness mood emojis.

### 5. **Evidence Capture Vault** (`/evidence`)
* **PIN Authentication Wall:** Prevents unauthorized viewing of sensitive files.
* **Cloudinary Auto-Upload:** Automatically shoots encrypted WebM recordings and photos to the Cloudinary backend, ensuring they aren't lost if the physical device is smashed.
* **Rapid Evidentiary Notes:** Quick-add feature to type out witness statements or license plates without leaving the app.

### 6. **Community Network** (`/community`)
* **Local Alert Feed:** Map-based display of local incident reports (e.g., "Suspicious activity near Park St.") flagged by others.
* **Volunteer Responder Opt-in:** Users can toggle themselves "active" to be part of the Helper Network. 
* **Proximity Matching:** When any user fires an SOS, the system calculates the nearest Volunteer Responders (within 3km) and dispatches aid requests to them instantly.

### 7. **Safety Heatmap** (`/heatmap`)
* **Hex-Bin Data Plotting:** Displays real historical "danger zone" data sourced locally. 
* **Route Intersection Checks:** Prevents or warns users if their planned `SafeJourney` intersects known high-crime hot spots.

### 8. **Sahayak AI Companion** (`/sahayak`)
* **Conversational AI Chat:** LLM interface that provides safety tips, routes to take, and emotional grounding assistance.
* **Interactive Tooling Block:** AI-driven fast responses for generating "Make an Excuse" scripts, or firing the Fake Call feature.

### 9. **Inner Circle** (`/inner-circle`)
* **Emergency Contact Roster:** Secure input and validation of up to 5 primary emergency contacts (SMS/Email handlers).
* **Tiered Alerts:** Defines exactly *who* gets notified based on the severity of the SOS (e.g. standard deviation vs. screamed keyword).

### 10. **Global Safety Provider (App-Wide)**
* *Not a single page, but the most important feature shell.*
* **Always-Listening Keyword Watcher:** Silently monitors device microphone for key phrases like "save me", "bachao", "rape".
* **Volume Spike Watcher:** Interprets an AnalyserNode frequency; fires if an aggressive, sustained noise (shout/scream) crosses 160 decibels for 4 sequential poll cycles. 
* **Global Countdown Overlay:** Intercepts the UI across *any* page with a flashing orange timer and cancellation option.
