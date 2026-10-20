# Remote match acceptance feasibility

Status on 2026-10-18: **UNSUPPORTED**. No authorized, tested third-party acceptance path has been established. This is a conservative product decision, not proof that no private partner integration could ever exist.

| Area | Evidence and conclusion | Implemented behavior |
| --- | --- | --- |
| Official CS2 matchmaking | Steam OpenID authenticates identity; it does not control the CS2 game client. The reviewed public Steam API material does not establish an authorized queue-prompt detection or acceptance route for this companion. | No queue detection or Accept control. |
| FACEIT CS2 | Data API provides public records and match data. Its matchmaking resource reads do not establish permission to accept a player's match. | Read-only player/match APIs. |
| FACEIT events | Official webhook docs list match-created/configuring/ready/finished/cancelled events and application subscription scopes. “Ready” is not documented evidence of a native CS2 confirmation prompt. | Authenticated ready/finished/cancelled in-app updates only when configured. |
| Authorized confirmation | No tested acceptance endpoint or approved partner capability was available in this task. | `canAccept=false`, `status=unsupported`. |
| Mobile-to-PC | Network transport alone cannot grant an API capability. Windows availability does not establish a supported game-control mechanism. | Read-only companion design below; no agent or remote controls. |

## Sources inspected

- [Steam OpenID and Web API](https://steamcommunity.com/dev)
- [Steamworks authentication](https://partner.steamgames.com/doc/features/auth)
- [Steam Web API overview](https://partner.steamgames.com/doc/webapi_overview)
- [FACEIT Data API](https://docs.faceit.com/docs/data-api/)
- [FACEIT endpoint reference](https://docs.faceit.com/docs/data-api/data/)
- [FACEIT webhooks](https://docs.faceit.com/docs/webhooks/)

The Valve Developer Community GSI page returned HTTP 403 during research. Its current contents were **not verified**, and no affirmative claim about current CS2 GSI queue detection is made here. Revisit with accessible authoritative documentation and a controlled game-client test before changing capabilities.

## State model

The shared type includes disconnected, connected, waiting, match_found, notification_sent, accept_available, accepted, expired, unsupported. The production capability endpoint returns unsupported. No sample event can transition live state into accept_available. Do not equate a successful webhook receipt with a detected native match-found prompt.

## Optional Windows companion design (not implemented)

- User initiates pairing on both devices using a short-lived, one-use challenge. Bind enrollment to the authenticated account, expire and revoke device credentials, store Windows keys with DPAPI.
- Listen only on loopback for an explicitly authorized, documented telemetry source. Validate payload schemas and an installation-specific secret.
- Send only necessary read-only events via outbound HTTPS, authenticated per device, with timestamps and deduplication IDs. No public inbound PC port.
- Provide a visible connection indicator, pause/unpair controls, bounded retention and an audit of received data.
- No screenshots/OCR of game prompts, input simulation, memory reads, hooks, Game Coordinator commands, packet manipulation or anti-cheat bypasses are implemented.
- A separate authorized acceptance integration, with explicit documented permission and end-to-end tests, would be required to expose Accept.
