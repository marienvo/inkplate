# Sonos Grouper Behavior Spec

## Purpose

Keep a Sonos household permanently grouped under one configured master speaker.
The service runs as a long-running process on a Raspberry Pi and periodically
corrects group drift when speakers become ungrouped.

## Design Goals

- Reliability over cleverness.
- Simple operations and clear logs.
- Safe to run continuously.
- Discovery-first setup with manual fallback.

## Configuration Contract

Configuration comes from environment variables.

### Discovery mode (primary)

- `SONOS_MASTER_NAME` is set.
- `soco.discover()` is used to discover speakers on the local network.
- Master is selected by case-insensitive match on `player_name`.
- Group members are all discovered speakers except:
  - the master speaker itself
  - names listed in `SONOS_EXCLUDED_SPEAKERS`

### Manual mode (fallback)

- Used only when `SONOS_MASTER_NAME` is not set.
- Requires both:
  - `SONOS_MASTER_IP`
  - `SONOS_SPEAKER_IPS` (comma-separated)
- Speakers are resolved directly by IP.

### Mode precedence

1. If `SONOS_MASTER_NAME` is set, use discovery mode.
2. Otherwise, if `SONOS_MASTER_IP` and `SONOS_SPEAKER_IPS` are set, use manual mode.
3. Otherwise, fail fast with a configuration error.

## Polling and Regrouping Behavior

- The service runs an infinite loop with sleep interval `POLL_INTERVAL_SECONDS`.
- Each cycle:
  1. Resolve current master and target member speakers (discovery or manual mode).
  2. For each member speaker:
     - If already grouped with master coordinator: log "already grouped".
     - If not grouped: attempt to join to master.
  3. Continue even when individual speakers are unreachable.

## Cooldown Behavior

- To avoid rapid repeated joins on unstable networks, track last join attempt per
  speaker IP.
- Skip a re-join when the previous attempt is newer than:
  - `cooldown_seconds = POLL_INTERVAL_SECONDS * 2`

## Dry-run Behavior

- When `DRY_RUN=true`, all regroup actions are logged, but no actual join call is
  executed.
- Group checks still run normally.

## Discovery Failure Handling

- If discovery returns no speakers:
  - log warning and skip the cycle
  - retry next cycle
- If discovery succeeds but master by name is not found:
  - log error and skip the cycle
  - retry next cycle

## Speaker Unavailability Handling

- If a non-master speaker cannot be reached:
  - log warning/error for that speaker
  - continue processing remaining speakers
- If master cannot be reached:
  - log clearly
  - skip regrouping for that cycle

## Logging Requirements

At minimum, logs must include:

- Startup
- Effective mode and key configuration (without secrets)
- Discovered/configured speakers (name + IP)
- Per-speaker grouped status
- Rejoin action
- Dry-run rejoin action
- Discovery failures
- Unreachable/timeout errors
- Unexpected loop errors (with stack trace)

## Extensibility Boundaries

- Keep implementation straightforward and split by responsibility:
  - config loading
  - SoCo interactions
  - regroup loop
- Avoid adding framework/runtime complexity.
