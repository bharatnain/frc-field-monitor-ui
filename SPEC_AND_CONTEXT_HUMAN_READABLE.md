# FIRST Field Monitor: Human-Readable Product Brief

## What This Screen Is For
This screen is a live operational monitor for the **FIRST Robotics Competition** field, used mainly by the **FTA**.

Its main job is to help the FTA answer, as fast as possible:

- Which team or station has a problem?
- What kind of problem is it?
- Is it blocking the match, or happening during the match?
- Is the issue in the Driver Station, network chain, robot controller, or robot performance?
- Does someone need to act right now?

This is **not** primarily a post-match analytics view. Other tools already handle deep logs and after-action analysis.

## Real Actions This Screen Should Support
The screen should help the FTA quickly decide when to:

- Tell a team to move to the correct station
- Help reconnect a Driver Station
- Identify a missing robot radio
- Identify a missing roboRIO
- Spot battery brownout risk
- Notice weak radio signal
- Notice high bandwidth usage
- Notice general communication degradation

## Users And Viewing Conditions
- Primary user: **FTA**
- Typical use: both close-up and glance-based reading
- Expected viewing distance: from nearby up to about **12 feet**
- Layout must work fullscreen in both **16:9** and **4:3**
- The screen must preserve a clear **Red vs Blue alliance split**
- Alliance sides may be swappable in implementation, but the split itself is essential
- If the UI exposes a mirrored layout, such as `mirror=true`, it should also reverse the Red alliance card order so driver stations still read **1, 2, 3** from behind the driver station wall

## Global Header Context
The screen also includes a compact global header above the six team rows.

This header provides match-level context that helps the FTA interpret what they are seeing in the rows without turning the screen into a schedule dashboard.

The header should show:

- `Match Number`
- `Match Status`
- `Schedule Status`
- `Cycle`

### Cycle
`Cycle` is a neutral cadence indicator, not a judgment or target.

It exists to help the FTA track how the event is moving from one actual match start to the next.

Operationally, it should be based on the time between observed `MatchAuto` starts for consecutive matches.

The display can show:

- A currently running cycle with seconds, such as `4:12 running`
- The most recent completed cycle in a compact form, such as `8m last`
- A combined summary when both exist, such as `8m last | 0:15 run`

Before enough data exists, it can show neutral text such as `Waiting for next start`.

This is useful field context, but it should not imply that the software knows the one correct cycle time for a specific event.

## Core Mental Model
Each row represents:

**One team at one station**

That means the row anchor is:

- **Team Number** as the primary identifier
- **Station Number** as the secondary location cue

The row should not be designed as a grid of equal little boxes. The information has different importance levels and should be presented with clear hierarchy.

## Information Inside Each Row
Each row contains four kinds of information.

### 1. Connection Chain
This is the most important diagnostic relationship after team identity.

The chain is:

**DS -> Radio -> RIO**

These are not three equal status dots. They form a troubleshooting path that matches how FTAs actually think during field support.

### 2. Robot State
This is the robot's current control state, separate from hardware health.

Allowed states:

- Teleop Enabled
- Teleop Disabled
- Autonomous Enabled
- Autonomous Disabled

This state should stay visible during normal diagnostics, but it should not be visually confused with connection or hardware status. Stop or override modes may communicate that state through their issue badge instead of a separate status pill.

### 3. Performance Metrics
These are the live robot-health metrics in priority order:

1. Battery
2. BWU
3. Trip
4. Lost Packets

### 4. Blocking Or Override Actions
These are special pre-match action states, not normal diagnostics.

Examples:

- `TEAM MISMATCH`
- `MOVE TO RED 2`

When one of these exists, it should dominate the row.

## Element Definitions
### Team Number
- Primary row anchor
- The first thing people should be able to read
- The clearest identifier for the robot

### Station Number
- Secondary identity
- Tells staff where the team is physically located
- Must stay visible even during blocking states
- Less important than team number during live match triage

### DS
Driver Station state.

Known states:

- Connected and healthy
- Degraded
- Not connected

Operational meaning:

- Healthy DS: connected and working normally
- Warning/degraded DS: present but impaired
- Yellow `X`: not connected

Priority:

- Highest priority inside the connection chain
- If DS is not connected, the robot cannot function properly from the field

### Radio
Robot radio connectivity to the field network.

Known states:

- Not connected
- Connected with visible signal strength bars
- Special case: field sees robot radio but team DS does not

Operational meaning:

- Yellow `X`: field cannot see the robot radio
- Signal bars: radio strength between robot and field
- Lower bars may indicate a warning state
- Special slash/computer case: field sees the robot radio, but the team DS does not

Priority:

- Second in the connection chain
- Signal strength should be easy to read

### RIO
Robot controller state.

Known states:

- Connected
- Not connected

Operational meaning:

- White check circle: connected
- Yellow `X`: not connected

Priority:

- Third in the connection chain
- Still required for the robot to function

### Status
Combined robot control state.

Allowed values:

- Teleop Enabled
- Teleop Disabled
- Autonomous Enabled
- Autonomous Disabled

Purpose:

- Communicate what mode the robot is in
- Stay consistently visible
- Remain visually separate from hardware health

### Battery
Most important live performance metric.

Show:

- Current voltage
- Minimum voltage seen during the match

Important operational notes:

- A healthy battery is around the low-to-mid `13V` range
- The robot performs poorly below `6V`
- Treat `7V` and below as bad
- Low battery is one of the most important in-match intervention signals

### BWU
Bandwidth usage.

Show:

- Current BWU
- `Tx`
- `Rx`

Important operational notes:

- Teams are capped around `8 Mbps`
- Approaching the cap can cause degraded video and network behavior
- If several robots are heavy at once, the field network may feel congested
- `Tx` and `Rx` must always be labeled

### Trip
Trip time.

Meaning:

- Measures Rx and Tx packet timing between the robot radio and field radio

Important note:

- Do not hard-code strong severity assumptions for Trip in this UI
- Acceptable values vary by event and wireless environment
- It is useful live diagnostic context, but not a fixed universal alert rule

### Lost Packets
Low-priority diagnostic metric.

Purpose:

- Informational signal
- Should stay visible
- Should not compete visually with Battery or BWU

## Priority Rules
### Pre-Match Priority
Highest-priority pre-match states:

- `TEAM MISMATCH`
- `MOVE TO RED 2`

When present:

- The row should become an action surface
- Team and station must remain visible
- Normal diagnostics should recede

### In-Match Priority
Operational importance during a match:

1. Team identity
2. DS
3. Radio
4. RIO
5. Battery
6. Status
7. BWU
8. Trip
9. Lost Packets

Important nuance:

Battery is the most important **performance metric**, but the connection chain still comes first in actual triage.

## Severity Model
This is a **display model**, not a backend state model.

### Normal
Use when everything is healthy or expected.

Behavior:

- Calm row
- Minimal chrome
- No issue band
- No severity badge

### Degraded
Use when something is present but impaired.

Examples:

- DS degraded
- Weak radio signal
- High BWU if treated as warning

Behavior:

- Row gets issue styling
- The affected module gets stronger emphasis
- It should not look the same as critical

### Critical
Use when a serious issue exists and intervention is likely needed.

Examples:

- DS missing
- Radio missing
- RIO missing
- Battery at `8V` or below

Behavior:

- The affected module becomes a strong focal point
- The row gets issue styling
- It should clearly outrank degraded

### Blocking
Use for pre-match action states.

Examples:

- `TEAM MISMATCH`
- `MOVE TO RED 2`

Behavior:

- The row becomes a command/action surface
- Diagnostics fade into the background
- Team and station remain visible

## Layout Principles
### Keep The Alliance Split
- Red and Blue must remain visibly separated
- Alliance ownership should be obvious at a glance
- Left/right placement can be swappable, but the split itself is fundamental

### Be Color-Blind Friendly
Do not rely on red vs blue, or on background tint alone, to communicate issue severity.

Issue state should be expressed through:

- Shape
- Hierarchy
- Contrast
- Borders or bands
- Text
- Iconography where useful

### Avoid Visual Flattening
The old monitor treated everything like equal boxes. The redesign should not.

The UI should make it obvious:

- what matters most
- what is only supporting detail
- what needs immediate action

### Healthy Rows Should Stay Compact
The most common state is a healthy, in-match row. That common case should look calm and should not take unnecessary height.

### Exception Rows Can Expand Visually
Degraded, critical, and blocking rows can receive stronger treatment without redefining the whole layout.

## Design Concepts
The original spec describes three valid concept directions.

### Concept 1: Frozen Compact Baseline
This is the most refined compact concept and the baseline to preserve.

Best for:

- Close to mid-distance viewing
- High information density without losing hierarchy

Structure:

- Identity area
- Status area
- Compact connection chain
- Compact performance area

Characteristics:

- Team is strongest
- Station is secondary
- Status is a compact pill
- DS / Radio / RIO are compact chips
- Battery and BWU are grouped and prioritized
- Trip and Lost Packets are lighter trailing diagnostics
- Non-normal rows get a top issue band and severity badge

Why it exists:

It is the cleanest compact layout that preserves the underlying semantics.

### Concept 2: Stronger Visual Language
This keeps the same structure as Concept 1 but adds stronger visual identity and iconography.

Best for:

- Mid-distance viewing
- Users who benefit from clearer system shapes and icons

Characteristics:

- One clear icon per system block
- Small labeled cards for DS, Radio, and RIO
- Larger, more expressive status pill
- Battery and BWU become more card-like
- Trip and Lost Packets remain lighter than the primary metrics

Why it exists:

It improves glanceability without becoming purely distance-first.

### Concept 3: Distance-First Monitor View
This concept is specifically optimized for fullscreen viewing from several feet away.

Best for:

- Field monitor use
- Fast scanning from a distance
- A 6-team view: 3 Red and 3 Blue

Primary read path should answer:

- Which team?
- Is there an issue?
- What is the DS state?
- What is the Radio state?
- What is the RIO state?
- What is the Battery state?
- What mode is the robot in?

Structure:

- Large identity block with team number and station
- First row of large operational tiles: DS, Radio, RIO, Battery
- Dedicated mode block on the right
- Second line for quieter diagnostics: Battery Detail, BWU, Trip, Lost Packets

Blocking rows:

- Become strong command surfaces
- Use a large central message
- Do not need an extra "Assignment" label if the message is already clear

Why it exists:

It is the best concept for far-distance operational scanning.

## Constraints
- Preserve the alliance split
- Support fullscreen `16:9` and `4:3`
- Remain color-blind friendly
- Do not invent new backend robot states
- Assume no trend graphs
- Data updates every `0.5s` via SignalR
- Implementation target is React with Vite
- Layout should remain flexible
- Mobile adaptation may happen later, but was not part of this design effort

## Non-Goals
- Post-match log review
- Historical trend analysis
- Sticky event memory
- Over-reliance on fixed Trip thresholds

## Rules That Should Stay True In Any Future Revision
- Team Number is always the row anchor
- Station Number stays visible but secondary
- DS, Radio, and RIO are one connection chain
- Status is separate from connection health
- Battery is the highest-priority performance metric
- BWU must always label `Tx` and `Rx`
- Lost Packets is low priority
- Pre-match blocking states override normal diagnostics
- Healthy rows should stay compact
- Issue treatment should not rely only on background tint
- Alliance ownership and issue severity must remain visually separate
- The common case should feel calm
- The exception case should become obvious quickly
