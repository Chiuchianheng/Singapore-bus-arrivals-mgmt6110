# adversarial_collaboration.md
Chiu Chian-Heng, Group 3
predictions.md committed at Saturday 26 September 2026, 1:27 AM SGT; first comment for this set on my
board at Saturday 26 September 2026, 3:19 PM SGT

## The four-way table
### 1. Found by both
- Removing a saved stop is instant, with no confirmation or undo (my Finding 4)
  | raised by IKD, MML | my severity 2, theirs 2 (IKD), 2 (MML). Both
  groupmates filed it under heuristic 3; I filed it under heuristic 5.

### 2. Found by them, missed by me
- Add to my stops saves the last loaded code rather than the one in the box,
  and saves codes the app already knows are invalid | raised by IKD, MML |
  theirs 3 (IKD), 3 (MML) | arbiter NOT TAKEN
- The same invalid saved stop shows two different error messages in My stops,
  one in back-end language | raised by IKD | theirs 2 | arbiter NOT TAKEN
- "Seats available" does not say how crowded the bus is | raised by AK |
  theirs 2 | arbiter NOT TAKEN
- No shortcut to put the bus services I take most at the top of a stop's list |
  raised by AK | theirs 2 | arbiter NOT TAKEN
- The loaded stop is identified by its code, and its name is never shown |
  raised by AK, IKD | theirs 2 (AK), 2 (IKD) | arbiter NOT TAKEN
- A bus number gives no direction or destination | raised by AK | theirs 2 |
  arbiter NOT TAKEN
- "Last updated" shows a clock time rather than how long ago | raised by AK |
  theirs 1 | arbiter NOT TAKEN

### 3. Found by me, not by them
- A visitor who does not know the 5-digit code cannot find or choose a stop
  (my Finding 1) | my severity 4
- No way to find the stops nearest to me (my Finding 2) | my severity 3
- No list of recent searches, and Back leaves the site (my Finding 5) | my
  severity 2

### 4. Found by both, rated differently
- The Status check button shows developer text to visitors (my Finding 3) |
  raised by MML | my severity 2, theirs 1 | arbiter NOT TAKEN. MML filed it
  under heuristic 2 and the system; I filed it under heuristic 8 and the screen.
- A code for a stop that does not exist is reported as "no buses running" (my
  Finding 6) | raised by IKD, MML | my severity 3, theirs 2 (IKD), 3 (MML) |
  arbiter 3, decided by impact. The arbiter also judged that the missing stop
  name in IKD's finding is a separate problem, which I log in section 2 (Found by them, missed by me).

## My predictions, checked
- Expected finding 1 (my Finding 1): BROKE, expected at 4 and raised by nobody, because no
  groupmate reported that the product cannot be used without a stop code; AK
  and IKD raised related problems about the stop name, which are different.
- Expected finding 2 (my Finding 2): BROKE, expected at 3 and raised by nobody, because no
  groupmate looked for stops near them.
- Expected finding 3 (my Finding 4): HELD, expected at 2 and raised by IKD at 2 and MML at 2,
  because both removed a saved stop and found it gone at once.
- The heuristic I named as my product's worst: BROKE, because only one finding
  (AK, severity 2) fell under heuristic 6, while the severity 3 findings fell
  under heuristics 5 and 9.
- The finding that would show my evaluation was wrong: NOT RAISED, because no
  groupmate raised a finding under heuristic 1 at severity 3 or higher. The
  only heuristic 1 finding was AK's, about "Last updated" showing a clock time,
  at severity 1.

## Q1. Where was confirmation bias in my own evaluation?

The clearest trace is in the heuristics I marked as working. After my second pass I wrote down heuristics 1, 2, 4 and 10 as "done well", and in predictions.md I said so directly for heuristic 1: "I judged that the turning arrow and the 'Checking the road…' message were enough, and I tested the waits only on my own devices, already knowing where to look." For heuristic 2 I decided that every word on the results screen was clear, and for heuristic 10 that help appeared where it was needed. In each case I was judging words and screens I had written myself. Section 2 of my four-way table (Found by them, missed by me) shows what that cost: AK found a heuristic 2 problem ("Seats available" does not say how crowded a bus is) and a heuristic 10 problem (a bus number does not say where the bus goes), and IKD found a heuristic 4 problem and a heuristic 5 problem, Add to my stops saving a code I had never typed in the box.

I found this by comparing section 2 with the list of heuristics I had called "done well". Every finding in section 2 sits either in a heuristic I had cleared or on a path I never took. The same bias showed up while I was still evaluating: I first cleared heuristic 1 after pressing only Load, and only when I also tried Refresh did I see that its signal was just a small turning arrow. I also looked hardest where I already expected trouble, the stop code box, and logged Finding 1 there at severity 4. When I later gave that finding to AI Studio, it pointed out that my own earlier assessment had already listed the missing stop list as a known limitation, so it was a change I had wanted before any comment arrived.

## Q2. Which prediction broke, and what did it teach me?

The prediction that broke most clearly was my first expected finding. I predicted that my groupmates would raise Finding 1, that a visitor who does not know the 5-digit code cannot use the product, at severity 4, because "checking a bus is the first thing anyone does". None of my three groupmates raised it. My prediction that heuristic 6 was the product's worst also broke: only one finding, AK's at severity 2, fell under heuristic 6, while every severity 3 finding fell under heuristics 5 and 9.

It broke because my rating rested on an assumption about how often people do not know the code. My groupmates tested with codes they had, and they spent their effort on what happened after a stop loaded, which I had barely examined. Both coding agents said the same thing when I asked them to argue against my repair: my severity 4 came from my own belief, and no groupmate's observation supported it. I still repaired it, because the rules require a severity 4 to be fixed, but I learned that a severity I give alone measures my confidence as much as the problem. My finding that would have shown my evaluation was wrong was not raised either, since no groupmate rated a heuristic 1 problem at 3 or more. Looking back, I set that threshold high enough that it was unlikely to be met, which made it a weaker test than it should have been.

## Q3. Which groupmate finding did I nearly dismiss, and what did the evidence say?

I nearly dismissed AK's Finding 2, that there is no shortcut for the bus services a regular rider takes most. My first reaction was that My stops already does this, because a saved stop opens in one tap. I had the same reaction a second time, after I had added stop names to Saved stops. I did not take it to the blind arbiter, because I never wanted to rate it 0; instead I repeated his situation on my live address.

What I saw went against my first reading. My screenshot of stop 11149 showed six services, with 970 in sixth place, and My stops shows only the next three services to arrive, so a bus that is later than the others drops out of view altogether. Saved stops saves the step of typing a code, but not the step of finding your own bus in the list. I accepted it as a real problem at AK's severity of 2 and had a mock-up made of pinning a service. I did not build it, because it was raised by one groupmate at severity 2 and is a larger change than the problems more of my groupmates met, and my reply to AK says so.

## Q4. What did I revise, which heuristic does it serve, and how do I know it worked?

I made seven revisions, each in its own commit:

- My Finding 1, no way to find a stop without its code (heuristic 6, system then screen), commit 82f7be6: a second box searches the LTA stop list by stop name or road name.
- IKD's Finding 1, Add to my stops saved the wrong or an invalid code (heuristic 5, screen), commit 89b2627, also raised by MML.
- My Finding 6, a stop that does not exist looked like a stop with no buses (heuristic 9, system), commit e5a4450, raised by IKD and MML and rated 3 by the blind arbiter.
- My Finding 4, removing a saved stop was instant and final (heuristics 5 and 3, screen), commit 29b0abd, raised by IKD and MML.
- AK's Finding 3, the stop name was never shown (heuristic 6, screen once the stop list existed), commit 4d164e6, also raised by IKD.
- My Finding 3, Status check showed raw JSON (heuristic 2, screen), commit 750cbf4, using MML's repair rather than mine.
- AK's Finding 4, a bus number did not say where the bus goes (heuristic 10, system and screen), commit d5da5b5.

I know they worked because I walked each finding again on my live address in a private window after every push. For the stop data I did not trust the agent's reports: in a separate check of the final version, I checked six real stops, including 08138 Concorde Hotel S'Pore, against another site that uses LTA data, and I checked the 145 route against the operator's own journey planner. I have asked each groupmate to walk their findings again and reply under my answer on the board. Before: the screenshots in the ps4 folder of my repository, https://github.com/Chiuchianheng/Singapore-bus-arrivals-mgmt6110/tree/main/ps4, because the link to the earlier deployment asks for a Vercel sign-in. After: https://singapore-bus-arrivals-mgmt6110.vercel.app. Over the next week I will look for comments saying search returns a wrong or missing stop, and for any report that the next stops are wrong for a route.

The decisions were mine and the code was the agent's. One example: for Finding 1, AI Studio argued that I should add a few preset buttons for hub stops instead of a full search. I turned it down after checking two reference layouts from other bus arrival sites, because preset buttons would help only visitors at a few stops. I did accept its warnings about heuristics 8, 1 and 5, so the results list scrolls on its own, closes after a tap, and keeps words such as Opp and Aft so stops on opposite sides can be told apart. For Finding 3 an argument changed my repair completely: the agent showed that hiding Status check answered my own belief rather than MML's need, so I built her version.

## Q5. What did my users give me that I could not have found myself?

IKD's Finding 1. On the Stop tab she typed 123 and pressed Load, then changed the box to 00000 and pressed Add to my stops without pressing Load. The dialog offered to save Bus Stop 123, a code the app had just rejected, while the box showed a different code. I had never done this because I always use my product in the order I built it: type a code, press Load, look at the buses, then save. I knew that the button saved the last loaded stop, so the idea of changing the box first never occurred to me.

No amount of thinking harder would have found it, because it came from someone who did not know the order I expected. Asking the agent would not have found it either, since the agent answers the questions I think to ask. MML gave me something similar with Status check: I had treated it as a tool for me, and she pressed it because she wanted to know whether the live data was working.

## Q6. Did the AI help me confirm, or help me falsify?

It did both, and I could only tell which by checking my live address. When I used the "argue against my repair" prompt, the agents helped me falsify. Both of them challenged my severity 4 for Finding 1 as an assumption, AI Studio told me that Finding 1 was a change I had already wanted, and it showed me that my Status check repair served my belief rather than MML's need. The blind arbiter also did not split the difference between my 3 and IKD's 2; it rated Finding 6 at 3 because of what the error costs, and it said plainly that it did not decide by counting votes.

When it reported on its own work, it agreed with me far more readily than the evidence justified. It told me it had added "the complete, official directory of all 5,208 Singapore bus stops", but in one check, only two of five real stops were in it, and it later described the same file as third-party scraped data. It then reported "zero occurrences" of any hardcoded list while my browser was still serving a made-up 36-stop list from its cache, which I found because 08138 had the wrong name. It referred twice to files that did not exist or had been deleted, busStopsData.ts and bus-stops.json, and it produced a report marking the production deployment "Pass" before I had pushed anything. I never asked it whether the product was better now; its reports said so on their own. So I never trusted them. Every time, I tested the claim myself on the live address, against real LTA data, or against the operator's route planner.
