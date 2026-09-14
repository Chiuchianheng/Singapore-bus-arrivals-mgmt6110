# assessment.md

Singapore Bus Arrivals — MGMT 6110 Problem Set 2

Live: https://singapore-bus-arrivals-mgmt6110.vercel.app/
Health: https://singapore-bus-arrivals-mgmt6110.vercel.app/api/health

---

## Front-end criteria

### 1. After loading a stop, the soonest bus is visible without scrolling

You type your bus stop code, press Load, and the INCOMING BUSES row is right there. You can see which bus is coming first and how many minutes away it is, without touching the screen again. Scrolling down is for the rest — every service at that stop with its own minutes, seat situation and vehicle type.

**Result: Met.** Tested on a phone. The incoming row lands above the fold once a stop is loaded.

---

### 2. A five-digit code is never the only thing to go on

Nobody remembers a stop code like 11149. If you've saved a stop, you should be able to spot it in your list without reading the number.

**Result: Partly met.** You can give each saved stop a name when you add it — "Home", "Office", whatever you want. Each saved stop shows its name in larger text with the code underneath in smaller text, so you spot the name first but the number is still there when you need it. Names stick between visits, and you can edit them or leave them blank.

However, it doesn't fix all. Naming a stop only helps once you have already saved it. The first time, you still have to type five digits you may not know.

There's no way to look a stop up by name in my app. I'd need LTA's list of all five thousand stops for that, which is a separate download. So if you're standing at the stop, the code is printed on the pole and you're fine. If you're sitting at home and want to check a stop you've never used, you can't. This product assumes you already know which stop you take.

---

### 3. Every number on the screen came from LTA, not from me

No made-up times, no made-up occupancy, no estimates of my own.

**Result: Met.** The minutes are worked out from the arrival timestamp LTA sends against the current time. The seat wording is their SEA / SDA / LSD code translated into English. Same for the deck type and the wheelchair label. The only thing I add is the wording. The values themselves are all theirs.

There is one thing I deliberately don't show: where the bus is going, and which stops it passes. LTA gives me a destination, but it's another five-digit code, and turning that into a name needs a list of all five thousand stops that I don't fetch. Rather than hide that, I put a line in the footer saying so.

---

### 4. You can tell how old the numbers are

If what you are looking at is stale, you shouldn't have to ask me.

**Result: Met.** The header shows when the data was last fetched, in Singapore time, and the page refetches every twenty seconds. I sat and watched the timestamp for a full cycle to check it actually moves. Otherwise "auto-refreshes every 20 seconds" would just be a claim in the subtitle with nothing behind it.

The twenty seconds isn't a number I picked. It's how often LTA refreshes this feed, and it's the same number in my cache header, so I'm not asking more often than there's anything new to get.

---

### 5. A mistyped stop code tells you what went wrong

Type something wrong and you should get a sentence you can act on.

**Result: Partly met.** Anything that isn't five digits now gets "Stop codes are five digits." and never reaches LTA. That's safe to check because LTA defines a bus stop code as exactly five digits, printed on the pole. It's their rule, not a threshold I invented.

What I still can't fix is a five-digit code that doesn't exist. `00000` comes back from LTA as a success with an empty list, which is identical to a real stop at two in the morning. I can't tell the two apart, so I add a line under the empty message: "If this stop code is new to you, check it against the sign at the stop." That doesn't solve it. It just stops the screen from sounding certain about something it can't know.

I only found this because I typed a stop code that didn't exist. The message looked perfectly normal and was quietly wrong.

---

## Back-end criteria

### 6. An empty answer is still an answer

Most apps only get tested when there's data. I wanted to know what mine does when LTA has nothing to give.

**Result: Met.** At 01:55 I loaded stop 11149. The buses had finished for the night, so LTA sent back an empty list, and the screen said "No buses are running from this stop right now." The same stop had six services on it at ten that evening.

One thing it gets wrong. That same message also shows up if you type a five-digit code that doesn't exist. LTA answers both the same way, so my app can't tell "no buses right now" from "that stop isn't real". See criterion 5.

---

### 7. Someone who isn't me can tell whether it's working

If a classmate opens this and sees no bus times, they should be able to work out what's wrong without messaging me to ask.

**Result: Met.** There's a Status check button at the top. Press it and you get this:

```json
{"checkedAt":"2026-09-14T02:03:10.598+08:00",
 "keyConfigured":true,
 "upstreamStatus":200,
 "upstreamOk":true}
```

Read it as a sentence: I checked at 02:03, my key is in place, LTA answered normally, so yes, it's working.

I got the time wrong at first. It came back eight hours behind everything else on the page, because it was in a different time zone. Anyone comparing the two would think the data was a day old. I changed it to Singapore time.

---

### 8. The page never calls LTA itself

Anyone can look at what a website sends from their browser. My key must never be in there.

**Result: Met.** When you load a stop, your browser asks my server, and my server asks LTA. The key only ever exists on my server. Nobody opening the site can see it.

One thing I checked: where the server code sits in my project. Put it in the wrong folder and nothing warns you. The site still builds, still deploys, and quietly serves the homepage instead of bus times.

---

### 9. I don't ask more often than the source changes

**Result: Met.** My page reloads every twenty seconds. That's the same rhythm LTA uses, so every time I ask, there's actually something new to get. If I asked every second, nineteen of those twenty requests would hand me back an answer I already had.

One thing to watch: the My stops screen asks separately for every stop you've saved. Save two stops, that's two requests. Save thirty, that's thirty. Right now I only have two, so it's fine. But nothing in the app stops someone saving thirty, and I haven't dealt with that.

---

### 10. When it breaks, it says something useful

**Result: Met, but I got it wrong the first time.**

There are four ways this can go wrong, and each one gets its own message:

| | |
|---|---|
| Loading | "Checking the road…" |
| No buses | "No buses are running from this stop right now." |
| LTA says no | "LTA refused the request. Check the stop code." |
| LTA doesn't answer | "Cannot reach LTA right now." |

The last two look similar but mean opposite things. One means something's broken and you need to go fix it. The other means just wait, it'll come back.

To test the third one, I went into Vercel, swapped my key for the word WRONG, and redeployed. LTA rejected it, which is what I wanted. But the screen said "Cannot reach LTA right now."

That's a wrong message. LTA wasn't down at all. It answered me straight away, it just didn't like my key. My own status check said as much: it reported that a key was there and that LTA had turned it away. Anyone seeing "cannot reach" on the screen would think the service was down and sit there waiting, when the problem was sitting in my settings.

So I went back and changed how my code sorts the two apart. Now anything where LTA answers and turns me away counts as a refusal, and only a request that never reaches anywhere counts as unreachable. The wrong key was still sitting in my settings, so I just redeployed and loaded the same stop again. This time it said "LTA refused the request." Correct. Then I put the real key back.

That left the fourth message, which I still hadn't seen. A wrong key gets rejected, not ignored, so the only way to trigger it was for LTA to actually go down, and it wasn't going to do that for my benefit. So I changed one letter in LTA's address inside my own code, which sent my request somewhere that doesn't exist. The screen said "Cannot reach LTA right now." Then I put the letter back and checked the real data came home.

The four sentences took me ten minutes to write. Checking that they actually fire at the right moments took a lot longer, and I only found the mistake because I broke my own app on purpose.

## Part 8 — Assessing the collaboration

### Q1 — Where did the agent make you faster, and by how much?

The front end. I cannot write React. Ten prompts over about three hours gave me an arrivals table, colour-coded seat labels, a pulsing "Arriving" state, a second screen and saved stops with editable names. This isn't a case of the agent being faster than me. Left alone, none of it would exist.

The table is the clearest example of the other kind, the things I could describe but not build. In Prompt 3 I showed the agent a photo of a real LTA bus stop display and said I wanted that shape. One prompt, about ninety seconds, and I had aligned columns with headers. I knew exactly what I wanted. I just had no idea how to make columns line up, and I changed my mind about that layout twice afterwards.

That's the split. One kind of task I couldn't do at all. The other kind I could describe in a sentence but would have spent an afternoon learning to build, for something I'd then throw away.

What I did with the time. CollabTrack, what I did in Problem Set 1, made claims I couldn't connect to any real source, so I threw it away and started again. Later, once the bus screen worked, I noticed it only answered one question: what's coming at this stop, right now, while I'm standing at it. It couldn't help someone still at home choosing between two stops nearby. So I added a second screen showing every saved stop at once, and then let people give those stops names, because nobody remembers a five-digit code. Neither of those was in my original plan. Both were only possible because building was cheap.

The rest of the time went on testing. Because deploying was quick, I could break my key on purpose, watch the wrong message appear, fix it, then misspell LTA's address in my own code to see what a dead connection looks like. Four deployments to check four sentences. If each had cost me an afternoon, I'd have written the four sentences, decided they looked fine, and never found out one of them fired at the wrong moment.

One thing was faster by hand. Setting the key in Vercel took forty seconds. Asking the agent how to do it would have taken longer than doing it.

---

### Q2 — Where did it cost you time, and whose fault was that?

The worst of it was my own fault, and it happened before I'd written a single prompt. I spent most of Saturday evening changing my mind about what to build. CollabTrack with public holidays, then exchange rates, then carparks, then buses, then the weather, then back to buses again. Each time I'd call a service by hand, hit something it couldn't do, and go looking for one that had no catch. There isn't one. Every public API has something it won't tell you, and I burned hours finding that out the slow way.

That wasn't the agent misunderstanding me. I was asking before I had decided. By the time I settled on buses it was past eight o'clock, and the only reason I finished is that the front end turned out to be cheap to build.

The other one is smaller, but it's the one that taught me something. In Prompt 4 I asked for a green highlight on any bus "arriving or under two minutes away." The agent did exactly that. Later I looked at my own screen and couldn't work out why a 1 min bus was green and a 2 min bus wasn't. I assumed it was a bug and was about to ask the agent to fix it. Then I read my own prompt back. "Under two minutes" excludes two minutes. The agent was right and I was wrong.

The real problem wasn't the boundary. It was that I'd never decided what the rule should be. I'd typed a number that sounded reasonable without thinking about whether anyone looking at the screen could work out where the line was. Nobody can. So in Prompt 10 I removed the threshold entirely. Only a bus that is already Arriving gets highlighted now, because whether a bus is arriving comes from LTA's own timing rather than from a cutoff I invented.

The two need different fixes. The first one is just me. I should have worked out what I was building before I started asking for it. The second is about who I blamed. When the screen didn't do what I expected, I assumed the agent had got it wrong. It hadn't. I had.

---

### Q3 — Did it ever hand you something that looked right and was not?

Twice, and both times what fooled me was a sentence that read perfectly well.

The first one I only caught because I broke my own product. After Prompt 11 the agent told me it had built all four states with the four sentences I'd asked for. It listed them back at me, word for word, and they matched. So I believed it and moved on. Then I went into Vercel, set my key to "WRONG", and redeployed to see what the refusal looked like. LTA turned me away, and my screen said "Cannot reach LTA right now." That's the message for LTA being down. LTA wasn't down. It answered me straight away, it just didn't like my key. The agent hadn't lied. All four sentences were there, exactly as I'd written them. They were just attached to the wrong situations, and there was nothing in what it said to tell me that.

The second one is worse. I typed 00000, which isn't a real stop code, and the screen told me "No buses are running from this stop right now." It should have told me the stop doesn't exist. But LTA replies to a fake code exactly the same way it replies to a real stop with nothing running, so my app can't tell which is which. It picked one and said it like it knew. And the sentence looks completely normal, so there's nothing to make you doubt it. I only found it because I typed a code I knew was fake. If I'd stuck to real ones, it would have gone out like that and I'd never have known.

---

### Q4 — What did you have to know in order to supervise it?

To catch the first mistake, I had to know what a 401 actually means.

My screen said "Cannot reach LTA right now", which sounds like LTA has gone down. But I'd just pressed Status check and got a 401 back. That number only exists because LTA read my request, looked at my key, and turned me away. If it had really been unreachable, I'd have got nothing at all. So whatever was on my screen, it wasn't the truth.

That's all it took. I never looked at the code. I just knew that if something came back at all, LTA was still there.

The other thing was realising the data isn't shaped the way you'd assume, and that it was worth twenty minutes to go and look before letting the agent build anything on top of it. So I called LTA myself and read what came back. There were five things in there that would have broken my screen if the agent had been left guessing. A bus with no second journey doesn't come back as nothing. It comes back looking like a bus, with every field empty. Arrival times are clock times, so working out the minutes is on my side. Occupancy is three letters nobody would read. An untracked bus says it's at 0.0, which is somewhere in the Atlantic. And the list comes sorted by service number as text, which puts 51 after 195. None of that was clever on my part. I opened the reply and read it. The only judgement involved was deciding it was worth opening at all.

Then there's the one I didn't catch. To have spotted the 00000 problem, I'd have needed to know that as far as LTA is concerned, a stop code that doesn't exist and a real stop with no buses running are the same thing. Both come back as a success with an empty list, and there's nothing in the reply to tell you which one you're looking at. I went looking and couldn't find that written down anywhere. The only way to find out is to type a fake code yourself and see what your screen says, and I only did that by accident while I was checking something else.

Therefore, the honest answer is that some things can't be supervised by knowing more. I supervise them by typing something wrong on purpose and seeing what my product says back.

---

### Q5 — Which decisions did you keep, and should you have kept more or fewer?

Here's my side of it, roughly in order.

Throwing CollabTrack away rather than trying to patch it, once I realised every number on it came from a file I'd written myself. Then picking which service to build on. I tried several and turned most of them down. Carparks only hand you codes with no names attached, so nobody would know where they were. The rain forecast had all 47 areas saying the same thing when I checked, and I couldn't count on it raining the day somebody opened my product. Air quality only reports by five regions, and sorting 47 areas into those 5 myself would have been me making up a precision that doesn't exist. Temperature came back with 18 stations sitting between 28.9 and 30.2 degrees, which isn't going to help anybody decide anything.

The four sentences were mine: "Checking the road…" while it loads, "No buses are running from this stop right now." when there's nothing, "LTA refused the request. Check the stop code." when LTA turns me away, and "Cannot reach LTA right now." when nothing comes back at all. I wrote them into Prompt 11 before the agent built a thing, and that's the only reason I caught one of them being wrong later. If I'd just said "handle errors", it would have put a spinner there and I'd probably have accepted it. That would have made the agent the one choosing what shows up when something goes wrong.

After that, dropping the third arrival column, because those times are mostly guesses from a timetable. Changing WAB to Wheelchair. Pulling out the two-minute green rule once I realised nobody could tell where the line was. Leaving destinations off and saying why in the footer instead of quietly not mentioning it. Adding the second screen, then letting people name their saved stops.

**Things I should have handed over.** I spent five rounds of prompts, maybe forty minutes, on how things looked. How big "min" should be next to the number. Whether the service number sat on black or grey. None of that needed me. I could have said make it readable on a phone once and spent those forty minutes on something that mattered.

**More I should have kept.** Two things showed up that I never decided on. After Prompt 1 the agent added a line telling people to try stops 11149, 04121 or 10169. I hadn't asked for that. It was fine while my data was fake, but once the real API went in, every stop in Singapore works, so that line would have been wrong. The other one is the browser. If you type 111 into the box, it suggests codes you've typed before. That isn't my app doing it, it's just this laptop remembering. On someone else's computer nothing would come up. It looks like a feature I built. I saw it and left it there.

---

### Q6 — Now scale it up: what does this mean for a team of thirty?

I only found my mistake because I broke my own app on purpose and watched what happened. I never read the code.

For a team with thirty people, nobody has time to read everyone's code anyway. And in my case it wouldn't have helped. There was nothing wrong with the code. All four of my error messages were sitting there exactly as I'd written them. They were just attached to the wrong problems, so my screen ended up telling people to wait for a service that hadn't gone down at all.

The danger at thirty people isn't that someone makes a bad call. It's that each person ends up with a couple of things they never chose, like I did, and nobody can see anyone else's. I had two in one weekend on one small product. Thirty people would have sixty, spread across something nobody can see all of at once.

So I wouldn't review the code. I'd review what happens when things break, and I'd make people show it rather than write about it. Thursday afternoon, before anything goes out on Friday, you break your own key in front of a colleague and let them watch what a user would see. If you can't show them that, it doesn't go out.

The thing I wouldn't let an agent decide is what appears when the product fails. It looks like a small technical thing and it isn't. On a normal day it's worth nothing. On the morning something breaks, it's the only part of the product anyone sees. And nobody would catch it if an agent had quietly decided that anyway. Error messages only show up after something has already gone wrong, and by then whoever wrote that prompt has moved on to something else. So the thing we'd have to start checking isn't whether the code works. It's whether anyone has ever sat there and watched it not work.
