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
