FIRST field monitor context

This screen is for the FIRST Robotics Competition field monitor used primarily by the FTA.

The FTA uses it in two main phases

Pre match

During match

It is not mainly a post match analytics screen. Post match there are other logs and tools.

Primary purpose

Help the FTA very quickly answer

which team or station has a problem

what kind of problem it is

whether it is blocking or in match

whether the issue is in the DS, robot network chain, robot controller, or robot performance

whether intervention is needed right now

Examples of real FTA actions driven by this screen

tell a team to move to the correct station

help reconnect a Driver Station

identify missing robot radio or missing RIO

identify battery brownout risk

spot low radio strength

notice high bandwidth usage that may affect robot function

notice general degraded communication

User and environment

Primary user is the FTA.

Viewing conditions

close at a computer

glancing from several feet away

up to about 12 feet

full screen field monitor

must work in 16:9 and 4:3

red and blue alliance split layout is important and should be preserved

left and right alliance sides can be swappable depending on where staff are standing

implementation note

the UI may expose this with a mirror layout toggle or query param such as mirror=true

when mirrored, the red alliance panel should also reverse its station card order so the displayed driver stations still read 1 2 3 from the perspective of someone standing behind the driver station wall

Global header context

Above the six team rows, the screen can include a compact global header for match level context.

This header is not meant to replace row triage. It gives the FTA quick orientation before they scan into team level exceptions.

Header elements

Match Number

Match Status

Schedule Status

Cycle

Cycle meaning

Cycle is a neutral cadence indicator, not a judgment or an attempt to define the one correct turnaround time for an event.

It should help the FTA understand match start to match start tempo using objective FMS state transitions.

The preferred anchor is time between distinct MatchAuto starts for consecutive matches.

This allows the display to show

running cycle time with seconds, such as 4:12 running

most recent completed cycle in compact form, such as 8m last

combined summary when both are known, such as 8m last | 0:15 run

If a completed cycle does not yet exist, neutral waiting text is acceptable.

Core data model

Each row is fundamentally

one team at one station

That row contains different classes of information that should not be visually flattened into equal boxes.

Row anchor

The anchor entity is

Team Number

Secondary context

Station Number

Station matters because it maps to the team’s physical location on the field side and where staff need to go.

System groups inside a row
1. Connection chain

This is the most important system relationship after team identity.

Elements

DS

Radio

RIO

Important semantic rule

These are not just three equal indicators. They form a diagnostic chain and should be read in this order

DS → Radio → RIO

Not because the protocol is literally that simplistic, but because that matches how the FTA triages problems on the field.

2. Robot state

Element

Status

This is a combined state, driven by the DS and robot control state.

Allowed states

Teleop Enabled

Teleop Disabled

Autonomous Enabled

Autonomous Disabled

This is important and always visible, but it should not be visually confused with hardware health.

3. Performance

Elements

Battery

BWU

Trip

Lost Pkts

Priority inside this group

Battery

BWU

Trip

Lost Pkts

4. Row override or blocking action

These are not ordinary diagnostics. These are action states.

Examples

TEAM MISMATCH

MOVE TO RED 2

These are pre match takeover states and should dominate the row when present.

Element definitions
Team Number

Primary row anchor.

Purpose

identify which robot the row belongs to

should be first readable element in every concept

Station Number

Secondary identity element.

Purpose

tells field staff where the team is physically located

should stay visible even in blocking states

less important than team number in live match diagnostics

DS

Driver Station state.

Known states

connected and working well

degraded

not connected

Interpretation

DS with yellow X means DS is not connected

DS circle with check means connected and healthy

DS warning state means present but degraded

Importance

highest priority in connection chain

if DS is not connected, robot cannot function properly from the field

Radio

Robot radio connectivity to field network.

Known states

not connected

visible with bars indicating signal strength

special case where field sees robot radio but DS does not

Interpretation

yellow X means cannot see robot radio

bars indicate signal strength between robot radio and field radio

lower bars may indicate a problem

special case computer slash means field radio sees robot radio but team DS does not

Importance

second in connection chain

should show signal strength clearly

low bars can be warning state

RIO

Robot controller state.

Known states

connected

not connected

Interpretation

yellow X means cannot see RIO

white check circle means RIO is connected

Importance

third in connection chain

still required for the robot to function

Status

Combined control state.

Allowed values

Teleop Enabled

Teleop Disabled

Autonomous Enabled

Autonomous Disabled

Purpose

communicate what state the robot is in

must be visible during normal diagnostics; stop and override modes may communicate it through their issue badge instead of a separate status pill

does not need the highest priority unless a mismatch is relevant

Battery

Most important live performance metric.

Displays

current voltage

minimum voltage seen during the match

Operational notes

high end is around 13.x V

robot does not do well below 6 V

assume 7 V and below is bad

battery low is one of the most important in match intervention signals

Purpose

identify brownout risk quickly

should be strongest metric in performance group

BWU

Bandwidth usage.

Displays

current BWU

Tx

Rx

Operational notes

teams are capped around 8 Mbps

if teams approach the cap, video and network behavior can degrade

if many robots are heavy at once, field network may become congested

Important

Tx and Rx must always be labeled

unlabeled stacked values are not acceptable

Trip

Trip time.

Meaning

measures Rx and Tx packets from robot radio to field radio

Important constraint

do not over contextualize with fixed severity thresholds in this tool

acceptable values vary by event and wifi context

still useful as live diagnostic info

Lost Pkts

Lost packets.

Purpose

informational diagnostic metric

lower priority than Battery and BWU

should remain visible but not compete visually

Priority model
Pre match blocking priority

Highest priority items pre match

TEAM MISMATCH

MOVE TO RED 2

Behavior

these should take over the row

team and station must remain visible

normal diagnostics should recede

In match priority

Highest importance during match

Team identity

DS

Radio

RIO

Battery

Status

BWU

Trip

Lost Pkts

Important nuance
Battery is the most important metric, but DS and connection chain are still operationally first in triage.

Severity model

This is a display model, not a backend state model.

Normal

Everything healthy or expected.

Behavior

calm row

minimal chrome

no issue band

no severity badge

Degraded

Something is present but impaired.

Examples

DS degraded

low radio bars

radio weak but not missing

high BWU situation if shown as degraded

Behavior

row gets issue treatment

affected module gets extra emphasis

should not look the same as critical

Critical

A major issue or likely intervention needed.

Examples

DS missing

Radio missing

RIO missing

Battery at 7 V or below

Behavior

affected module becomes strong visual focus

row gets issue treatment

should clearly outrank degraded

Blocking

Pre match action state.

Examples

TEAM MISMATCH

MOVE TO RED 2

Behavior

row becomes action surface

diagnostics recede

team and station remain visible

Layout principles that were agreed
Split alliance layout must remain

The screen should preserve left and right half ownership for Red and Blue.

Alliance side should be very obvious.

The left or right side may be swappable in actual implementation, but the split concept is fundamental.

Color blind friendly

Do not rely on red versus blue alone to communicate status or severity.

Alliance color is for side ownership only.
Issue state should come from

shape

hierarchy

contrast

borders or bands

text

iconography where useful

Avoid visual flattening

A major problem in the original monitor was that all values lived in equal boxes with weak hierarchy.

The redesign must prevent that.

Healthy rows should be compact

Common healthy match state is the most frequent case.
Healthy rows should not consume excess height.

Exception rows can earn stronger treatment

Critical, degraded, and blocking states can receive stronger treatment without redefining the whole layout.

Concept 1

Frozen concept

This is the most refined compact concept we built and the baseline concept to preserve.

Purpose

A compact operational row that balances density and hierarchy.

Intended viewing distance

Close to mid distance.
Works on operator screens and monitor views, but not purely optimized for far distance.

Row composition

Each row is still one team.

Main internal structure

identity area

status area

compact connection chain

compact performance area

Identity

Elements

Team Number

Station Number

issue severity badge when row is not normal

Hierarchy

Team is strongest

Station secondary

issue badge sits near team and station

Status

Single compact pill.
Uses a distinct visual family for

Auto

Teleop

Text examples

TELEOP

TELEOP OFF

AUTO

AUTO DISABLED

Connection chain

Healthy case uses compact chain chips.
Elements

DS

Radio

RIO

Healthy treatment

flat or nearly flat

minimal ring

radio bars shown for radio

DS and RIO shown as simple healthy indicators

Degraded and critical treatment

stronger local emphasis

module gets more contrast

Performance band

Compact grouped modules

Battery group

Elements

current voltage

min voltage

Structure

Battery group title

primary current value

secondary min value

BWU group

Elements

current BWU

Tx

Rx

Structure

BWU group title

primary BWU value

secondary Tx and Rx

Trailing diagnostics

Trip

Lost Pkts

These remain lighter than Battery and BWU.

Issue treatment

Final issue treatment in this concept

top issue band for non normal rows

severity badge near team block

issue modules can have stronger border

rest of row stays flatter

Why this concept exists

It is the cleanest compact concept that preserves semantics and keeps common rows reasonably short.

Concept 2

Visual language concept

This concept keeps the same core structure as the frozen concept but adds a stronger visual language.

Purpose

Increase glanceability through iconography and stronger module identity without going fully distance first.

Intended viewing distance

Mid distance.
Good when operators are not right on top of the screen.

Main visual language

One identifying icon per system block.

Examples

DS uses controller icon

Radio uses radio icon

RIO uses chip icon

Battery uses battery icon

BWU uses transfer or network style icon

Trip uses directional or transfer icon

Lost Pkts can use warning style icon

Important refinement
We removed duplicate icon repetition.
One icon should identify the system.
Text and bars should carry the state.

Connection modules

Each connection item becomes a small labeled card.

Examples

DS card

Radio card

RIO card

Each card has

system icon

system label

short state text

Examples of state text

Connected

Degraded

Missing

Link

Low Signal

Radio uniquely keeps signal bars.

Status

Larger visual status pill than frozen concept.
Auto and Teleop are visually distinct.
Disabled remains explicit in text.

Performance modules

Battery and BWU become more card like than in frozen concept.
Trip and Lost Pkts remain lighter trailing modules.

Issue treatment

Same overall issue treatment family as frozen concept

top issue band

severity badge near team

stronger local treatment on affected modules

Why this concept exists

It is a more expressive, slightly more visual version for field staff who benefit from stronger shape language.

Concept 3

Distance first concept

This is the concept specifically built for fullscreen monitor viewing at a distance.

Purpose

Maximize scan speed from several feet away on a 16:9 or 4:3 field monitor.

Intended viewing distance

Several feet away.
Field monitor.
Glance based reading.

Critical design assumption

The real match view should show 6 teams total

3 Red

3 Blue

So this concept was refined to show only 3 rows per alliance.

Primary read path

First line should answer

which team

whether there is an issue

DS state

Radio state

RIO state

Battery state

current match mode

Second line holds quieter diagnostics

Battery detail

BWU

Trip

Lost Pkts

Identity block

Larger than in other concepts.

Elements

Team Number in large type

Station below

severity badge if issue exists

Primary diagnostic tiles

First row of operational tiles

DS

Radio

RIO

BATT

These are broad, high contrast tiles.

Text is intentionally short

OK

WARN

OUT

Radio uses bars rather than sentence text.

Battery uses large current value.

State block

Larger dedicated mode block at the right side of the first line.

Examples

TELEOP

TELEOP OFF

AUTO

AUTO DISABLED

Secondary diagnostic band

Second line contains quieter metrics

Battery Detail

Bandwidth

Trip

Lost Pkts

These are still large enough to read, but lower in priority than first line tiles.

Blocking treatment

Blocking rows become strong command surfaces.
Large message in center.
No extra Assignment label is needed.
Top issue band remains.
Main blocking message is enough.

Issue treatment

Agreed issue treatment here

top issue band

stronger border on issue cells

flatter healthy cells

severity badge near team

Why this concept exists

It is the best concept for far distance operational scanning on a field monitor.

Constraints and non goals
Constraints

must preserve alliance split

must support 16:9 and 4:3 fullscreen layouts

must be color blind friendly

cannot invent new backend robot states that do not exist

no trend graphs were assumed

updates every 0.5 seconds via SignalR

implemented in React with Vite

flexible layout is important

future mobile adaptation may happen, but mobile was not designed here

Non goals

post match log review

advanced historical trend analysis

adding sticky event memory

over relying on subjective trip thresholds in this tool

Important content rules that should remain true in any future editing

Team Number is always the row anchor

Station Number remains visible but secondary

DS, Radio, and RIO belong to one connection chain

Status is separate from connection health

Battery is the highest priority performance metric

BWU must label Tx and Rx

Lost Pkts is low priority

Pre match blocking states override normal diagnostics

Healthy rows should be compact

Issue treatment should not depend only on background tint

Alliance ownership and issue severity must stay visually separate

The common case should look calm

The exception case should become obvious quickly