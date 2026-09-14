# prompts.md

Singapore Bus Arrivals — MGMT 6110 Problem Set 2

Live: https://singapore-bus-arrivals-mgmt6110.vercel.app/
Repo: https://github.com/Chiuchianheng/Singapore-bus-arrivals-mgmt6110

---

# Week 1 — front end, invented data

## Prompt 1 — master prompt

> ROLE: You are a senior front-end developer building a React web app.
>
> GOAL: Build the front end of a live bus arrival screen for one commuter in Singapore who wants to know, standing at or walking towards a stop, which bus is coming, how long it is, and whether there will be a seat. One screen.
>
> 1) Invented data for three bus stops: 11149, 04121 and 10169. Each stop has five to six bus services. Each service has a service number, and up to three upcoming buses. Each upcoming bus has: minutes until arrival, a load code, a vehicle type code, a feature code, and whether it is tracked or only scheduled.
> 2) Use the real code values the live feed uses, so the shape matches what I will replace this with later: load: SEA (seats available), SDA (standing available), LSD (limited standing); type: SD (single deck), DD (double deck), BD (bendy); feature: WAB (wheelchair accessible), or empty; tracked: true when the time comes from the bus's own GPS, false when it is only estimated from the timetable.
> 3) Some services must have only one or two upcoming buses, not three, because the real feed often has nothing for the second or third. Where there is none, the screen reads "no further bus" rather than showing a blank or an invalid time.
> 4) One row per service, sorted by how soon the next bus arrives. Each row shows: the service number, minutes until the next bus, minutes until the one after, and the seat situation in words, not codes. Under the arrival time, show the vehicle type and wheelchair label in small text, and mark rows that are only scheduled with "scheduled, not tracked".
> 5) Anything arriving in under one minute reads "Arr" rather than a number.
> 6) A stop code input with a Load button, plus a row of saved stops the user taps to switch between. Only the three invented stops return anything; any other code shows "No data for this stop code."
> 7) An "Add to my stops" button that saves the current stop code to the saved row. Saved stops persist between visits and can be removed. This lives on the one screen; do not build a settings page for it.
> 8) When there are no saved stops, that row reads "No saved stops yet. Load a stop and add it." rather than being empty.
> 9) Show a last-updated time held as a constant in the data file.
>
> OUTPUT: A running app. Keep every invented value in ONE data file of its own — the three stops, their services, and the last-updated time — so I can change them in one place, and shape it as a list of service objects each holding an array of upcoming buses, because that is the shape the live feed returns. One component per section. Readable on a phone at arm's length. In the footer, credit LTA DataMall as the source the live version will use, and add one line saying destination and waypoint names are not shown because they need a separate dataset of five thousand bus stops. When you are done, list the files you created and what each one holds.
>
> GUARDRAILS: Screens and invented data only. Do NOT call any outside service or fetch from any URL, including for images, icons or fonts. Do NOT call the Gemini API or any other model. Do NOT create an api folder or any serverless function; this is the front end only. No database, no login, no analytics. No map. No settings page. No dark mode toggle. No features I did not list. Never create a variable whose name starts with VITE_. Invented times and codes only, nothing confidential.
>
> CONTEXT: Individual Problem Set 2 for MGMT 6110 Human-AI Collaboration at SMU. This week is the front end; and I will replace the invented data with live arrivals from LTA DataMall through my own serverless function, so keep the data file shaped like the real response. I am not a programmer: when you make a choice I did not specify, say so in one line rather than burying it.

**What came back:** A working screen with three stops, service numbers, arrival times, seat wording and vehicle labels.

**What I changed next and why:** The three upcoming buses were laid out as three cards side by side, which is too cramped on a phone. "7 min" was forced onto two lines, which reads badly. Changed it to one row per service instead. The first question a commuter has is how long until the next bus, so that number should be the largest thing on the row and everything else should be smaller.

---

## Prompt 2 — compact rows instead of three cards

> The three upcoming buses are laid out as three cards side by side, which is too cramped: the minutes wrap onto two lines and every row needs a lot of vertical space. Change each service to a single compact row instead.
>
> Each row: the service number on the left, then the next bus arrival large, with the seat wording and the vehicle labels directly beneath it in small text, and then the two later arrivals as small plain numbers on the right, no cards and no boxes around them. Where a later bus does not exist, leave its slot showing a dash rather than an empty dotted box.
>
> The reader's first question is when the next bus comes, so that number should be the largest thing in the row and everything else should be quieter. Change nothing else.

**What came back:** The soonest bus is now the most prominent thing on each row, the two later arrivals sit small on the right, and a dash marks where there is no further bus.

**What I changed next and why:** The layout is right. However, the service number sits on a near-black block, which pulls the eye to the thing you read second, and the arrival time is both oversized and heavily bold. Softening both next.

---

## Prompt 3 — aligned table, two arrival columns

> Change the arrival list into an aligned table instead of free-form rows.
>
> A header row with three column labels: BUS SERVICE on the left, NEXT BUS and SUBSEQUENT BUS on the right, in small uppercase grey text.
>
> Under it, one row per service. The service number sits in a light grey rounded box on the left. The two arrival times sit in the two right-hand columns, each in its own light grey rounded box, aligned in a column so the eye can scan down them. Nothing is bold and nothing is oversized; the alignment does the work instead of weight.
>
> Put the seat wording and the vehicle labels underneath the service number in small grey text, including the "scheduled, not tracked" note where it applies, quietly and without an icon or colour.
>
> Drop the third arrival entirely. Two columns is what the real bus stop displays show, and the third bus is almost always a timetable estimate rather than a tracked one, so showing it implies more certainty than the data has.
>
> Where there is no subsequent bus, that box reads a dash. Change nothing else.

**What came back:** The table works. Columns line up, the service number sits in a grey box, and the two arrival times are easy to scan down. 961 shows a dash where there's no second bus, and 196 still has its "scheduled, not tracked" note.

**What I changed next and why:** Everything is the same weight now, so nothing catches my eye, and the "not tracked" note is so quiet I nearly missed it. I'm fixing several things in one go: make the numbers heavier, shrink the "min" so the digits stand out, bring back the note in brown, colour the seat labels green/amber/red like the real bus stop displays, and make anything arriving pulse.

---

## Prompt 4 — seven visual changes

> Seven changes to the row, all visual.
>
> 1) The minutes are too light. Take them up one step in weight — medium, not bold.
> 2) In each arrival cell, make the unit smaller than the number: the digits stay at the current size, and "min" drops to about two-thirds the size in a lighter grey, so the eye lands on the number first.
> 3) Replace "Arr" with "Arriving", preceded by a small filled dot, in green, at the same size as the other times, with the same smaller-unit treatment.
> 4) When a bus is arriving or under two minutes away, give that cell a soft pulse: a gentle fade between two shades of green, about two seconds each way. Breathing, not blinking. A hard flash is unpleasant on a phone and uncomfortable for people sensitive to motion. Nothing else on the screen animates.
> 5) Give the seat wording a coloured background pill: green for "Seats available", amber for "Standing available", red for "Limited standing". Keep the text small and on the same line as the deck type and WAB, which stay plain grey. These are the three colours the real bus stop displays use, so a commuter already reads them this way. The wording stays, so the colour is reinforcement rather than the only signal.
> 6) Make the "scheduled, not tracked" note visible again: a small clock glyph in front of it and brown text rather than grey, so a reader notices that this time came from the timetable rather than from the bus itself. Keep it small and on its own line under the labels.
> 7) Give the service number a light grey rounded background with dark text, so it reads as a label rather than plain text. Keep its current size.
>
> Change nothing else.

**What came back:** All seven landed. The "Arriving" cell has a green outline and pulses slowly, the seat labels are colour-coded, "min" is smaller than the digits, and 196's untracked note is visible again in brown with a clock.

**What I changed next and why:** Still missing the thing the real bus stop displays put at the very top. A single row of incoming buses with the soonest first. The table is sorted by arrival time already, but you have to read down it to work out which bus is closest. A banner puts that answer at eye level. Adding the "buses might not arrive in exact order" line with it, because some of these times come from the timetable rather than from the bus, so the order is an estimate and it's more honest to say so.

---

## Prompt 5 — incoming buses banner

> Add a banner above the table, the same shape the real LTA bus stop displays use.
>
> It reads "INCOMING BUSES" as a small uppercase label, and beside it, in small grey italic, "Buses might not arrive in exact order."
>
> Under the label, a horizontal row of chips, one per service, ordered by how soon that service's next bus arrives — soonest on the left. Each chip shows the arrival time above the service number. Anything arriving keeps the green treatment and the pulse it already has in the table.
>
> The table below stays exactly as it is, still ordered by arrival time.
>
> The note matters: some of these times come from the timetable rather than from the bus itself, so the order shown is an estimate, and saying so is more honest than implying the sequence is guaranteed.
>
> Change nothing else.

**What came back:** The banner showed up with the disclaimer, chips in order of soonest first, and the arriving one still pulsing green.

**What I changed next and why:** It's awkward to read. The time is on top and the route number underneath, but when I'm waiting for a bus I look for the number first. That's the thing I'm scanning for. So I flipped them round. I also let the chips size to their own content, because six boxes of identical width just look like one striped strip rather than six separate buses.

---

## Prompt 6 — flip the chip contents

> The incoming banner is hard to read. Swap the order inside each chip: the service number goes on top, large and dark, and the arrival time sits underneath it, smaller and grey. A commuter looks for the route number first and the time second, so that should be the reading order.
>
> Also widen the gap between chips slightly, and let the chips size to their content rather than all being the same width, so the row reads as separate items instead of one striped block.
>
> The arriving chip keeps its green treatment and pulse. Change nothing else.

**What came back:** The route number is on top now, bigger, with the time underneath in grey. Chips sized to their own content so they read as separate buses. The arriving one still pulses.

**What I changed next and why:** Two things. First, "Wheelchair" instead of "WAB". WAB is the code the feed uses, and if you actually need to know whether a bus takes a wheelchair, you shouldn't have to learn an abbreviation first. Second, the labels wrap badly on a phone: the last one drops to its own line and leaves a dot floating at the end of the line above. Nothing's actually wrong, it just looks wrong.

There's one thing I'm leaving alone for now. That hint line listing the three stops that work will be wrong as soon as I plug in the API, because then every stop in Singapore works. I'll deal with it when I get there.

---

## Prompt 7 — Wheelchair, and the wrap

> Two changes.
>
> 1) Replace the "WAB" label with "Wheelchair". WAB is the code the feed uses, not something a commuter reads, and anyone who needs this information should not have to learn an abbreviation to find it.
> 2) At phone width the label line breaks badly: "Wheelchair" will drop onto its own line and leave the separating dot stranded at the end of the line above. Keep the three labels together as a unit that wraps as a whole, or drop the dots and use spacing instead so there is no orphaned separator.
>
> Change nothing else.

**What came back:** No more stranded dots. "Wheelchair" reads properly now, on its own line under the seat and deck labels.

**What I changed next and why:** The single screen does what I specified. Adding the second screen next, for the question the first one doesn't answer.

---

## Prompt 8 — second screen

> Add a second screen, switched by a tab bar at the top, with no page reload.
>
> SCREEN 1 is everything that exists now. Label the tab "Stop".
>
> SCREEN 2, labelled "My stops", answers a different question. Screen 1 is for someone already standing at a stop. Screen 2 is for someone still at home deciding which stop to walk to, when there is more than one within reach.
>
> 1) It lists every saved stop, one row each, showing only the single soonest bus at that stop: the stop code, that service number, and how long until it arrives.
> 2) Rows are ordered by which stop has a bus coming soonest.
> 3) Each row also carries the seat wording for that one bus, with the same green, amber and red colours as screen 1.
> 4) Tapping a row switches to screen 1 with that stop loaded.
> 5) When nothing is saved, the screen reads "No saved stops yet. Find a stop on the Stop tab and add it." and nothing else.
> 6) Keep using the same invented data file; do not add a second one. Screen 2 reads the same three stops and picks the soonest service from each.
>
> Do not change screen 1 in any way. No settings page, no new data source, no map.

**What came back:** A tab bar with Stop and My stops. The second tab lists saved stops with the soonest bus at each, seat colour included, sorted by which arrives first.

**What I changed next and why:** It doesn't actually help. Both my saved stops happened to show "Arriving", which made it obvious the screen answers a question I don't have. People already know which bus they take. They're not choosing between stops, they're checking whether their bus is close. Showing only the single soonest service is useless if theirs is the third one. Changing it to show the next three services at each stop so they can find their own without tapping in.

---

## Prompt 9 — three services per saved stop

> On screen 2, each saved stop currently shows only the single soonest bus. Show the next three services at that stop instead, side by side on the same row: service number and arrival time for each, ordered soonest first.
>
> The reason is that a commuter already knows which bus they take. Showing only the soonest one is no help if their bus is the third one. Three gives them a decent chance of finding their own without tapping through.
>
> Keep the seat colour on each. Keep rows ordered by whichever stop has a bus coming soonest. Tapping anywhere on the row still opens that stop on screen 1. Change nothing else.

**What came back:** Three services per saved stop, seat colours on each, sorted by soonest.

**What I changed next and why:** Looking at it, I couldn't work out why one row had a 1 min bus in green and another had a 2 min bus in grey. Went back to my own prompt and found I'd written "under two minutes", so 2 min falls outside. The AI did exactly what I asked. The problem is the rule itself. Nobody looking at the screen can guess where the line is. Dropping the minute threshold entirely: only "Arriving" goes green, because that's a state the feed reports rather than a number I picked.

---

## Prompt 10 — only "Arriving" goes green

> Simplify the green highlight. Only a bus that is Arriving gets the green treatment and the pulse. Every other time, including one and two minutes, looks the same as the rest. Apply this on both screens.
>
> The reason is that a threshold in minutes reads as arbitrary on screen: a reader cannot tell why 1 min is green and 2 min is not, and a rule nobody can infer is worse than no rule. "Arriving" is a state the feed itself reports, not a number I picked.
>
> Change nothing else.

**What came back:** Only the Arriving cell is green now, on both screens. Everything else looks the same regardless of how many minutes away it is.

**What I changed next and why:** Nothing else on the front end. It does what I specified and I can stop fiddling with it. Time to replace the invented data with the real LTA feed, which is the actual point of this week.

---

# Week 2 — back end, live data

## Prompt 1 — master prompt, back end

> ROLE: You are a senior full-stack developer working in my existing project. Do not rewrite what is already there; add to it.
>
> GOAL: My screens currently show bus arrival times as hard-coded values in an invented data file. Replace them with real data from LTA DataMall, fetched through a serverless function of my own.
>
> 1) api/arrivals.js — takes a BusStopCode query parameter, calls https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=&lt;code&gt; with the credential in a header named exactly AccountKey, one word, and returns only the fields my screens need: for each service, the service number and up to two upcoming buses, each with minutes until arrival, load, type, feature and whether it is tracked. Nothing else.
> 2) api/health.js — reports whether the credential is configured (keyConfigured) and whether the upstream answered, including the HTTP status it returned. It must never print the credential or any part of it.
> 3) On both screens, replace the hard-coded values with the live ones, and decide what the user sees in each of these four cases: the data is loading, the data is empty, the upstream refused, and the upstream is unreachable. I want four different sentences, not one spinner:
>    - loading: "Checking the road…"
>    - empty: "No buses are running from this stop right now."
>    - refused: "LTA refused the request. Check the stop code."
>    - unreachable: "Cannot reach LTA right now."
>
> Screen 2 calls the function once per saved stop. Delete the invented data file and the hint line listing 11149, 04121 and 10169 as available stops, because every stop in Singapore works now.
>
> OUTPUT: Both functions at api/ in the PROJECT ROOT, siblings of package.json, never inside src/. If this project has a server entry file, register the same two routes there too, because that is the shape the preview can answer. If it has no server file, skip that and tell me so rather than inventing one. Make sure package.json contains "type": "module".
>
> BEFORE the fetch, if the credential is missing or empty, return 503 with a message naming the variable, and do not call the upstream at all. A missing variable is sent as the word "undefined" and looks exactly like a wrong credential, so stop it early.
>
> AFTER the fetch, check response.ok before reading the body. A refusal often has an empty body, so calling .json() on it throws and my function dies with a 500 instead of telling me what happened. On a non-2xx reply, return the upstream status and a one-line reason in your own JSON.
>
> Cache the response for twenty seconds with Cache-Control: s-maxage=20, stale-while-revalidate=40, matching how often LTA actually refreshes this feed. In the footer, credit the source in the exact form the provider's licence asks for.
>
> Five things in the real response below, all of which I confirmed by calling the endpoint myself, and all of which will break the screen if handled naively:
> - NextBus2 and NextBus3 can be objects whose every field is an EMPTY STRING, not null and not missing. An empty EstimatedArrival means no such bus; show a dash.
> - EstimatedArrival is an ISO timestamp, not minutes. Work out the minutes against the current time. A bus that has just left gives a negative number; show "Arriving" for anything under one minute rather than a negative.
> - Load is SEA, SDA or LSD. Map those to the wording already on my screen.
> - Type is SD, DD or BD. Feature WAB means wheelchair accessible.
> - Monitored is 1 when the time comes from the bus's own GPS and 0 when it is estimated from the timetable. When it is 0, Latitude and Longitude come back as "0.0", which is not a place. Those rows keep the "scheduled, not tracked" note.
>
> The upstream sorts by service number as text, so "51" comes after "195". Sort by arrival time instead.
>
> GUARDRAILS: Never write the credential into any file, comment or README. Never create a variable whose name starts with VITE_. Never call the upstream from browser code; every call happens inside api/. Never print the credential, or any part of it, in a response or a log. No new npm packages. No database, no login. Leave every screen I already have working exactly as it is.
>
> CONTEXT: Deployed on Vercel from GitHub. The credential lives only in a Vercel environment variable named LTA_ACCOUNT_KEY. A real response from the endpoint, called by hand just now, looks like this:
>
> `{"odata.metadata":"https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival","BusStopCode":"11149","Services":[{"ServiceNo":"111","Operator":"SBST","NextBus":{"OriginCode":"11009","DestinationCode":"11009","EstimatedArrival":"2026-09-12T19:44:31+08:00","Monitored":1,"Latitude":"1.2980416666666668","Longitude":"103.8036695","VisitNumber":"1","Load":"SEA","Feature":"WAB","Type":"SD"},"NextBus2":{"OriginCode":"11009","DestinationCode":"11009","EstimatedArrival":"2026-09-12T19:55:22+08:00","Monitored":0,"Latitude":"0.0","Longitude":"0.0","VisitNumber":"1","Load":"SEA","Feature":"WAB","Type":"DD"},"NextBus3":{"OriginCode":"11009","DestinationCode":"11009","EstimatedArrival":"2026-09-12T20:07:19+08:00","Monitored":0,"Latitude":"0.0","Longitude":"0.0","VisitNumber":"1","Load":"SEA","Feature":"WAB","Type":"DD"}},{"ServiceNo":"186","Operator":"SBST","NextBus":{"OriginCode":"52499","DestinationCode":"03239","EstimatedArrival":"2026-09-12T20:00:30+08:00","Monitored":1,"Latitude":"1.3225726666666666","Longitude":"103.82618566666666","VisitNumber":"1","Load":"SEA","Feature":"WAB","Type":"SD"},"NextBus2":{"OriginCode":"52499","DestinationCode":"03239","EstimatedArrival":"2026-09-12T20:18:44+08:00","Monitored":0,"Latitude":"0.0","Longitude":"0.0","VisitNumber":"1","Load":"SEA","Feature":"WAB","Type":"SD"},"NextBus3":{"OriginCode":"","DestinationCode":"","EstimatedArrival":"","Monitored":0,"Latitude":"","Longitude":"","VisitNumber":"","Load":"","Feature":"","Type":""}},{"ServiceNo":"195","Operator":"SBST","NextBus":{"OriginCode":"02101","DestinationCode":"02089","EstimatedArrival":"2026-09-12T19:47:26+08:00","Monitored":1,"Latitude":"1.3028868333333334","Longitude":"103.7980005","VisitNumber":"1","Load":"SEA","Feature":"WAB","Type":"SD"},"NextBus2":{"OriginCode":"02101","DestinationCode":"02089","EstimatedArrival":"2026-09-12T20:04:51+08:00","Monitored":1,"Latitude":"1.2817073333333333","Longitude":"103.80931133333333","VisitNumber":"1","Load":"SEA","Feature":"WAB","Type":"SD"},"NextBus3":{"OriginCode":"02101","DestinationCode":"02089","EstimatedArrival":"2026-09-12T20:22:31+08:00","Monitored":1,"Latitude":"1.2849865","Longitude":"103.8339415","VisitNumber":"1","Load":"SDA","Feature":"WAB","Type":"SD"}}]}`

**What came back:** Two functions at api/, both at the project root next to package.json. The invented data file was deleted, the hint line went with it, and the footer now carries the official Singapore Open Data Licence wording rather than a phrase it made up. It also changed types.ts, which I hadn't asked for but makes sense, because the real response has a different shape from my invented one.

**What I changed next and why:** The preview showed "Cannot reach LTA right now", which is correct, since the preview has no key and doesn't run the api folder. Pushed to GitHub, set LTA_ACCOUNT_KEY in Vercel, redeployed, and the real bus times came through. Then I checked the health endpoint and found it was missing the one thing that tells you whether the answer is current.

---

## Prompt 2 — a timestamp on the health check

> api/health.js is missing the time it was checked. Add a checkedAt field with the current timestamp, so anyone reading the response can tell whether it is fresh or cached. Change nothing else.

**What came back:** checkedAt added to every branch of the health response, not just the successful one, which is more than I asked for and the right call.

**What I changed next and why:** Moving on to the header. Right now if a classmate opens the site and sees nothing, they have no way to tell whether my code broke or LTA is down. Adding a status check button that opens the health endpoint, a manual refresh, and a line saying the page updates itself.

---

## Prompt 3 — three things in the header

> Add three things to the header.
>
> A "Status check" button that opens /api/health, so a classmate who sees no numbers can tell whether my code broke or LTA is down without asking me.
>
> A "Refresh" button that refetches the current stop immediately.
>
> A line under the title reading "Auto-refreshes every 20 seconds", and make the screen actually refetch on that interval. Twenty seconds is how often LTA refreshes this feed and it matches the cache I already set, so the page should not claim a rhythm the source does not have.
>
> Change nothing else.

**What came back:** Refresh and Status check buttons in the header, and the auto-refresh line now says 20 seconds. Preview shows "Cannot reach LTA right now" as expected, since the preview has no key and does not run the api folder.

**What I changed next and why:** Nothing. Pushing this to GitHub and redeploying, then testing the three states I have not seen yet.

---

## Prompt 4 — a 401 is a refusal, not an unreachable host

> I set LTA_ACCOUNT_KEY to a wrong value and redeployed. My health endpoint reported it correctly: keyConfigured true, upstreamStatus 401, upstreamOk false. But the screen said "Cannot reach LTA right now.", which is the unreachable sentence, not the refused one. A 401 is a refusal — LTA answered, it just said no.
>
> Fix the mapping between the four states. A non-2xx status from LTA, including 401 and 404, is the refused case and must show "LTA refused the request. Check the stop code." Only a genuine network failure, where no response comes back at all, shows "Cannot reach LTA right now."
>
> Change nothing else.

**What came back:** It edited src/services/ltaApi.ts. Any non-2xx from LTA now maps to refused; only a thrown network error maps to unreachable.

**What I changed next and why:** I still hadn't seen the fourth message fire for the reason it exists. A wrong key gets refused, not ignored, so the only way to see "cannot reach" was to make LTA genuinely unreachable. I broke the connection on purpose next.

---

## Prompt 5 — break the connection on purpose

> I want to see the unreachable state fire for the reason it exists, so I need to break the connection deliberately. In api/arrivals.js, change the upstream hostname to datamall2.mytransport.sgX so DNS cannot resolve it. Change nothing else. I will revert this immediately after I have the screenshot.

**What came back:** One letter added to the hostname. Deployed it, the screen said "Cannot reach LTA right now", and I had the fourth screenshot.

**What I changed next and why:** Put it back straight away. The site was broken while that was live.

---

## Prompt 6 — revert the hostname

> Revert the hostname in api/arrivals.js back to datamall2.mytransport.sg. I have the screenshot I needed. Change nothing else.

**What came back:** Hostname restored, nothing else touched. Pushed, redeployed, and the real arrivals came back.

**What I changed next and why:** Noticed the health timestamp was in the wrong time zone while I was checking it.

---

## Prompt 7 — checkedAt in Singapore time

> The checkedAt timestamp in api/health.js is in UTC while everything else on the screen is in Singapore time. Anyone comparing the two would think the data is eight hours stale. Return it in Singapore time with the +08:00 offset instead. Change nothing else.

**What came back:** The health response now ends +08:00 instead of Z.

**What I changed next and why:** Moving on to the stop code problem.

---

## Prompt 8 — tell a bad stop code apart from a quiet one

> I typed 0000, which is not a real stop code, and the screen said "No buses are running from this stop right now." That is the wrong sentence. LTA answers an unknown stop code with 200 and an empty Services array, exactly as it answers a real stop that has no buses at this hour, so my code cannot tell the two apart.
>
> Add a format check in api/arrivals.js before the fetch: a stop code must be exactly five digits. Anything else returns 400 with a reason, and the screen shows "Stop codes are five digits." without calling LTA at all.
>
> This does not solve the whole problem, because a five-digit code that does not exist will still come back empty and look like a quiet stop. Add one line under the empty message saying "If this stop code is new to you, check it against the sign at the stop." so a reader at least knows the other possibility exists.
>
> Change nothing else.

**What came back:** Both halves. 111 now gets "Stop codes are five digits." and never reaches LTA. 00000 still shows the empty message, but with the extra line underneath.

**What I changed next and why:** One last thing. People can't remember five-digit codes, so I let them name the stops they save.

---

## Prompt 9 — name your saved stops

> People cannot remember five-digit stop codes, so let them name the ones they save. When a stop is added to saved stops, ask for a short label — "Home", "Office", whatever they type. The chip then shows the label with the code underneath it in smaller text, so the name is what they read and the code is still there when they need it. Allow the label to be edited later, and allow it to be left blank, in which case the chip shows just the code as it does now.
>
> Keep this on the one screen; do not add a settings page. Labels persist in the browser alongside the codes. Screen 2 uses the label too.
>
> Change nothing else.

**What came back:** The chip shows the label on top with the stop code underneath, plus a pencil to edit and a cross to remove.

**What I changed next and why:** Nothing. The product does what I set out to build.
