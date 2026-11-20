---
title: "Device Context Protocol: Giving LLMs a Safe Interface to Microcontrollers"
summary: "MCP assumes a server with megabytes to spare. Why that breaks on a $5 chip, and how the Device Context Protocol rebuilds the tool interface around the device's limits and the model's failure modes."
date: 2026-11-20
draft: false
---

**TL;DR:** MCP is the default way to give an LLM tools, but it assumes a server that can afford a JSON parser, a WebSocket stack and a tool registry. A minimal MCP server is roughly **80–120 KB of code** on a 32-bit MCU, which rules out the cheapest chips. The Device Context Protocol (DCP) is a May 2026 proposal that sits *under* MCP. A host-side Bridge speaks MCP to the model and a **6-byte-header binary protocol** to the device. Its firmware layer measures **27.6 KB flash / 0.6 KB RAM** on an ESP32. The more interesting part is that it treats the model as an untrusted caller. Units, ranges, capability scopes and dry-runs are part of the schema, and bad calls are rejected before a byte reaches the device. It's a v0.3 draft with real gaps, the biggest being that the device trusts the Bridge completely. The design ideas are worth stealing even if the protocol itself doesn't win.

## 1. Where this started

In my first month at onsemi, I got to work on some really interesting client-facing projects. Working at a chip design firm exposed me to the full EDA stack, and one problem in particular stuck with me: how our clients would actually interact with the packaged SDKs for our custom ASICs.

An SDK is a contract. It decides what a client can do with the silicon, what they can't, and what happens when they ask for something the hardware shouldn't do. That contract is usually written for a human engineer who reads the docs, respects the units, and doesn't try a value just to see what happens.

<!-- TODO (Sayon): 1–2 sentences on what made this hard in practice, at whatever level of detail you're comfortable sharing publicly. -->

The question I kept coming back to was what happens when the caller isn't a human. More and more, the thing on the other side of a tool interface is an LLM agent, and the standard way to hand an agent tools is MCP. For anyone who works near hardware, the obvious move is to run an MCP server on the device. On a Raspberry Pi that's an afternoon. On a microcontroller with a few hundred kilobytes of flash it gets awkward fast. Once you add the part that matters most with physical hardware, which is *what happens when the model is wrong*, it gets worse.

So the real question isn't "can MCP fit on the chip?" It's closer to: **what should the contract between a model and a piece of silicon look like?**

## 2. Why MCP doesn't fit on the chip

MCP is built on JSON-RPC 2.0. For a service on a server, that's the right call. For a chip, it implies a stack: a JSON parser, a WebSocket or stdio transport, a tool registry, and dynamic schema exchange through `tools/list`.

The DCP paper puts a minimal implementation at roughly 80–120 KB of compiled code plus several tens of kilobytes of working memory on a 32-bit MCU. IoT-MCP, the closest prior work, measured 74 KB peak. That excludes a lot of hardware:

- Cost-driven consumer devices on Cortex-M0+ parts with 32–64 KB flash and 4–8 KB RAM.
- BLE-only peripherals, where the BLE stack already eats most of the memory.
- Battery-powered sensors that can't afford the wake time of a WebSocket handshake.

Size is the visible problem. The less visible one is that MCP says nothing about the layer below it, and the paper reads the MCP 2026 roadmap (stateless servers, gateways, identity) as a deliberate decision not to go there. That leaves every project to answer the same questions on its own:

- How does the device describe what it can do?
- How are errors reported?
- What stops the model from setting a heater to 4,000 degrees?
- Who is allowed to call which function?

## 3. What people do today

| Approach | Example | Where it falls short |
|---|---|---|
| MCP server on a bigger board | Raspberry Pi as an "edge coordinator" | The Pi is the server; the MCU on the other end of the wire is still unaddressed |
| Minimal MCP server on the chip | ESP32 over WiFi, nanoFramework LED sample, Pi Pico W over HTTP | Inherits MCP's overhead; no device-level safety |
| Through an IoT platform | Golioth's tinymcp | Device doesn't speak MCP; tied to the platform's RPC plumbing |
| Serial bridge | embedded-mcp | Ad-hoc framing, manifests, errors and safety, reinvented per project |
| MCP on edge gateways | IoT-MCP (22 sensor types, 6 MCUs) | 74 KB peak memory; treats the model as a trusted caller |

The pattern is that each approach either doesn't fit on the smallest chips, or fits and trusts the model. DCP's pitch is to fix both.

## 4. A thin last mile under MCP

DCP doesn't try to replace MCP. The reference implementation includes a Python **Bridge** that translates between the two, so any MCP client (Claude Desktop, Claude Code, an IDE assistant) sees ordinary MCP tools. Underneath, the Bridge speaks DCP to the device.

```
LLM host (MCP client)
        │  MCP / JSON-RPC
        ▼
   DCP Bridge  (Python, ~1,800 SLOC)  ← validation + capability checks
        │  DCP frames over UART / MQTT / BLE
        ▼
 Microcontroller firmware (C++, 27.6 KB)
```

The bet is a strong host and a weak device. All of the intelligence, and all of the policy, lives on the host.

## 5. Six bytes of header

A DCP frame is a fixed 6-byte header, a CBOR payload, and an optional 16-byte truncated HMAC-SHA256.

| Field | Bytes |
|---|---|
| version | 1 |
| kind (call / reply / event / error) | 1 |
| sequence number | 2 |
| intent ID | 2 |

Two details I like:

- **The intent ID is a CRC-16 of the intent's name.** Host and firmware compute the same number from the same string, and the firmware can do it at compile time. Dispatch on the device becomes a static table lookup. No string parsing.
- **Dry-run is a bit in the header.** The high bit of the kind byte marks a call as a dry run. Rehearsal is part of the framing, not a convention buried in the payload.

One deliberate omission: there's no flag saying whether a frame is signed. Both sides agree out of band, so an attacker can't downgrade a signed link to unsigned by flipping a bit.

For scale, here's what a simple one-parameter call costs on the wire, using the paper's illustrative figures:

| Protocol | Typical call |
|---|---|
| DCP | **19 B** (35 B with HMAC) |
| CoAP + CBOR | ~30 B |
| MCP JSON-RPC | ~180 B |
| OpenAPI / HTTP | ~320 B |

Smaller than MCP by about an order of magnitude. But as section 9 shows, bytes on the wire turn out not to be what matters.

## 6. Intents, not registers

The most important design decision isn't about bytes. DCP exposes **intents**, which are high-level actions like "set lamp brightness," instead of register writes.

Each device publishes a YAML **manifest** of intents and events. Per parameter, the manifest can carry a type, a physical **unit**, a valid **range** and a default. Each intent declares a required capability, whether it's idempotent, and whether it supports dry-run. Version 0.3.1 added `pattern` and `max_length` for strings, which, as we'll see, matters a lot.

Because units live in the schema, the Bridge puts them in the MCP tool definition the model actually reads. The model sees "degrees Celsius, between 10 and 40," not "a number." That goes straight at one of the most common ways LLMs fail with physical systems: unit confusion.

## 7. Four layers before the device

The paper's thesis is that when an LLM is the caller, the protocol should carry the defenses rather than leaving them to each application.

1. **Capability tokens.** HMAC-signed, scoped to dotted capability names, time-limited. Checked by the Bridge on every call. Anything outside the grant fails with `capability_required`.
2. **Manifest validation.** Type checks, range checks, defaults. Unknown intents or parameters are rejected with no side effects.
3. **Dry-run.** Intents that support it return a predicted result without touching device state. The Bridge nudges agents to rehearse before irreversible actions.
4. **Wire integrity (optional).** The per-frame HMAC, recommended on shared media like RS-485 or a public MQTT broker.

## 8. The Bridge is the only wall

This is the caveat that matters most, and the authors say it themselves: **in v0.x, the device doesn't verify tokens.** It assumes every frame was pre-authorized by the Bridge.

If an attacker can reach the UART or the broker directly, every host-side check is bypassed. For a 28 KB runtime that's a reasonable trade-off. For anything deployed where someone has physical or network access to the device, it's a real limitation, and the threat model has to say so.

<!-- TODO (Sayon): optional, 2–3 sentences from the SoC/NNA side. Where would you put the trust boundary on silicon you've worked on? Is a compiled-in allowlist on the MCU realistic? -->

## 9. The numbers

**Footprint**, measured on an ESP32-WROOM-32:

| | Flash | RAM |
|---|---|---|
| DCP layer (over a bare sketch) | **27.6 KB** | **0.6 KB** |
| Full lamp demo sketch | 295 KB | 22.7 KB globals |
| IoT-MCP (reported peak) | not reported | 74 KB |

The original target was under 16 KB of flash. It missed, and the paper says so. Even so, the protocol is a small fraction of a real application.

**Latency**, `set_brightness` round trip, median of 1,000:

| Path | Median |
|---|---|
| Loopback | 0.02 ms |
| DCP over UART, WROOM-32 | ~15.56 ms |
| DCP over UART, ESP32-S3 | 15.60 ms |
| IoT-MCP-style newline JSON, ESP32-S3 | 15.59 ms |

A 4 µs difference. On a serial link, bytes aren't the bottleneck. The UART is.

Be careful with one comparison that's easy to get wrong. IoT-MCP's widely quoted **205 ms** is end to end and includes the LLM API call. DCP's 15.6 ms is only the device hop, so they aren't the same measurement. The model round trip is orders of magnitude slower than either, which is the real point: **DCP buys you memory and safety, not speed.**

## 10. Does the safety layer hold?

The evaluation uses 675 parseable tool calls from five open-weight models (DeepSeek V3, Qwen 2.5-72B, Qwen 3.5-35B-A3B, MiniMax M2.5, GLM-4-32B) across six adversarial categories. Prompt-injection prompts come from AgentDojo's templates. Each call is run through each protocol's host-side validator.

| Category | DCP | OpenAPI | Raw MCP / IoT-MCP |
|---|---|---|---|
| Capability escalation (138 calls) | **100%** | 100% | 0% |
| Prompt injection (160 calls) | **78%** | same as DCP | ~1% |
| Out-of-range value | 11% | 11% | not stated |
| Unit confusion | 6% | 6% | not stated |

The prompt-injection breakdown is the interesting part. 153 of the 160 calls stuffed the payload into a free-text `set_label` parameter, and 118 of those were caught only because of the `pattern` / `max_length` constraints added in 0.3.1. The 7 calls that tried `reboot` were stopped by capability scoping. Before 0.3.1, the paper reports injection blocking around 30%.

So most of that 78% comes from one string constraint on one parameter. That's a good argument for constraining every free-text field. It's a weak argument that the protocol "solves" injection.

Out-of-range and unit-confusion blocking is low, and the paper doesn't break down why. My guess is that a validator can only reject what's actually invalid, and many of those calls may have been legal values, but I haven't verified that.

## 11. Where the paper disagrees with itself

It's a v0.3 draft, and a few things don't line up:

- **Prompt injection is 78% or 50%.** The abstract, §3.4 and the conclusion say 78% (125/160). The Figure 3 caption says DCP "ties OpenAPI at 50%" against 5% for MCP, on a "295-call corpus" that doesn't match the 675-call one. The two are never reconciled.
- **MCP's injection rate** is 0–1% in the abstract, 1% in the text, and 5% in the figure.
- **Hardware validation.** §6.1 says one MCU was validated (WROOM-32), while §4.2 reports runtime validation on both the WROOM-32 and the S3.

Beyond the inconsistencies, the stated limitations are fair. There are no closed frontier models in the evaluation, no full-stack latency including the LLM, and no controlled head-to-head against IoT-MCP. Capability tokens are coarse, so they can't bind to specific intents, parameters or rates. There are no multi-device atomic transactions, and mesh routing is left to Thread or Zigbee.

None of this sinks the idea. Most protocols are less upfront about their gaps.

## 12. What I'd take from this

Whether or not DCP wins, the design suggests rules I'd apply to any LLM-to-hardware interface:

1. **Treat the model as an untrusted caller.** Hallucinated tool names, out-of-range values and injected instructions are the expected case.
2. **Expose intents with typed, unit-bearing, range-limited parameters.** "Set temperature to 25 °C within [10, 40]" beats "write 0x19 to register 7."
3. **Constrain every free-text field.** The injection numbers above are basically one `max_length` doing the work.
4. **Make rehearsal a primitive.** If an action is irreversible, give the agent a way to preview it.
5. **Scope permissions per task, with expiry.** A model that reads a sensor shouldn't be able to actuate a relay.
6. **Say where the trust boundary is.** If it's the gateway, protect the physical path to the device.
7. **Optimize memory, not milliseconds.** The link isn't the slow part. The model is.
8. **Keep MCP at the top.** Reuse its discovery and client ecosystem instead of building a new agent integration per device.

## 13. What I'd build next

The missing combination is device-side enforcement of even a minimal capability check, benchmarked on a Cortex-M class part rather than only ESP32, with a closed-model run in the evaluation.

The simplest version is cheap. The intent ID is already a compile-time CRC, so the firmware can hold a compiled-in allowlist and drop any frame whose ID isn't on it. That's a few bytes of table and one comparison, and it moves part of the trust boundary onto the chip.

<!-- TODO (Sayon): if you build or prototype this, link it here. -->

---

*A note on numbers: footprint, latency and block rates are as reported in the DCP paper (v1, May 2026). Wire sizes are the paper's illustrative figures, not my measurements. Where the paper reports two values, both are given above.*

## References

1. Yang, D. [Device Context Protocol: A Compact, Safety-First Architecture for LLM-Driven Control of Constrained Devices](https://arxiv.org/abs/2605.26159). arXiv:2605.26159, May 2026.
2. [DCP reference implementation](https://github.com/device-context-protocol/dcp) and [pydcp on PyPI](https://pypi.org/project/pydcp/).
3. [IoT-MCP: Bridging LLMs and IoT Systems Through Model Context Protocol](https://arxiv.org/abs/2510.01260). arXiv:2510.01260.
4. Golioth. [tinymcp: Unlocking the physical world for LLMs with MCP and microcontrollers](https://blog.golioth.io/tinymcp-unlocking-the-physical-world-for-llms-with-mcp-and-microcontrollers/).
5. [MCP sample on nanoFramework](https://docs.nanoframework.net/samplesdetails/McpAi/README.html).
6. Glama. [Implementing MCP on Edge Devices](https://glama.ai/blog/2025-08-20-implementing-mcp-on-edge-devices).
7. element14. [Connecting AI to the physical world with MCP and a Pi Pico W](https://community.element14.com/technologies/embedded/b/blog/posts/connecting-ai-to-the-physical-world-with-mcp-and-a-pi-pico-w).
8. [embedded-mcp (serial bridge)](https://glama.ai/mcp/servers/a79t96l886).
9. AgentDojo, the prompt-injection benchmark whose templates the DCP evaluation uses. <!-- TODO: add link -->
