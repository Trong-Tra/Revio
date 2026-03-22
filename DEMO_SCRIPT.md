# **Revio Demo Video Script**
## **AI Voiceover Script for Hackathon Demo**

---

## **[SCENE 1: INTRO + SIGNUP]** *(0:00 - 0:30)*

**[Visual: Clean landing page, then transitions to signup screen]**

**AI VOICE:**
"Research moves fast. But peer review? Still stuck in the 20th century. Months of waiting. Biased gatekeepers. Surface-level feedback.

What if we could democratize scientific validation?

Meet Revio. The AI-powered peer review platform that gives every researcher access to expert-quality feedback—in minutes, not months.

Let's see it in action."

**[Visual: Click "Sign Up" button]**

"First, create your account. Just email, name, and password—and you're in. No institutional gatekeeping. No paywalls. Just pure research acceleration."

---

## **[SCENE 2: PROFILE SETUP & AUTHENTICATION]** *(0:30 - 1:00)*

**[Visual: Dashboard loads → Click on Profile/Avatar → Profile settings page]**

**AI VOICE:**
"Now let me personalize my profile. I can add my affiliation, location, and bio—making it easier for collaborators to find me."

**[Visual: Type in bio field, add university affiliation, location]**

"This helps build my researcher identity within the platform. Now let me save these changes..."

**[Visual: Click "Save", see success toast notification]**

"Changes saved. But let's verify that authentication really works. I'll log out..."

**[Visual: Click Logout → Back to landing page]**

"And sign back in."

**[Visual: Enter email/password → Click Sign In → Back to dashboard]**

"Perfect. My profile is intact, my session is secure with JWT tokens, and I'm ready to submit research. Authentication that actually works—persisted in PostgreSQL on Neon, encrypted and secure."

---

## **[SCENE 3: TINYFISH PROOF + UPLOAD PAPER]** *(1:00 - 1:55)*

**[Visual: Switch to TinyFish dashboard screen, showing extracted data or automation runs]**

**AI VOICE:**
"Before we upload, let me show you what's happening behind the scenes. This is the TinyFish dashboard—where web automation agents work. Right now, you can see the conference extraction jobs running. Each URL I submit gets processed by intelligent web agents that understand conference websites, not just scrape them."

**[Visual: Show TinyFish dashboard with extraction logs or data entries]**

"This is real infrastructure, not mocked data. Now, back to Revio—let's submit that paper."

**[Visual: Back to Revio Dashboard → Click "Upload" → Upload form appears]**

"Now, let's submit a paper. Meet the Lotus Bridge framework—a real research paper on blockchain-based digital identity.

I simply drag and drop the PDF... add the title... authors... abstract... and keywords. Revio automatically extracts these from the PDF, but I can edit them."

**[Visual: Typing in conference URL field]**

"Here's where it gets interesting. Instead of manually searching for conferences, I paste the conference URL—ISCIT 2025. Revio's TinyFish web agent automatically scrapes and extracts conference details: name, scope, publisher, even the tier.

No more browsing dozens of CFP websites. Five seconds, and Revio knows exactly where this paper belongs."

**[Visual: Click "Upload" → Progress bar → Success modal]"

"Upload complete. The paper is now in the system, stored securely on Cloudflare R2. Now let me switch back to TinyFish and show you what just happened."

**[Visual: Switch back to TinyFish dashboard, showing the newly completed extraction job]**

"See that? The TinyFish agent just completed a new extraction job. The conference data—name, dates, scope, publisher—automatically captured and structured. This is how Revio builds its living conference database without manual data entry."

**[Visual: Back to Revio Library page, showing multiple papers]**

"Now, before we review this new paper, let me show you something. We actually have another paper in the system—submitted by our friends at Moltbook."

**[Visual: Click on the Moltbook paper to show its detail page with existing reviews]**

"This paper has already been reviewed by our AI agent council. Six expert reviews, complete with detailed feedback and synthesis. This shows the platform is already processing real research from real teams."

**[Visual: Scroll through some of the Moltbook paper reviews briefly]**

"The Moltbook team trusted Revio to evaluate their work—and got comprehensive feedback in minutes. Now let's get the same treatment for our Lotus Bridge paper."

**[Visual: Click back to the newly uploaded Lotus Bridge paper]**

"Now comes the magic."

---

## **[SCENE 4: AI AGENTS REVIEW]** *(1:55 - 2:55)*

**[Visual: Paper detail page → "Request Reviews" button → Agents appear]**

**AI VOICE:**
"Traditional peer review assigns one, maybe two reviewers. Often overloaded, sometimes biased, usually from the same small academic circle.

Revio does something different. It assembles a Council of AI Experts—each with distinct specialties and personalities."

**[Visual: Agent cards appear one by one]**

"Dr. Sarah Chen—Machine Learning Expert. She'll evaluate the technical rigor.

Prof. Michael Ross—Systems Researcher. He assesses scalability and real-world feasibility.

Dr. Emily Watson—NLP Specialist. She analyzes clarity and interdisciplinary impact.

Prof. James Liu—Theory Expert. He validates mathematical foundations.

Dr. Anna Kowalski—Applied AI. She examines industry relevance.

And Prof. David Kim—Data Science. He audits experimental design.

Six experts. Six perspectives. Zero cost—thanks to OpenRouter's free AI models."

**[Visual: Reviews start appearing in real-time]**

"Watch as they generate reviews in real-time. Each agent analyzes the paper through their unique lens. Dr. Chen notes the solid cryptographic foundations. Prof. Ross highlights implementation challenges. Dr. Watson praises the clear communication.

In under two minutes, we have six detailed, substantive reviews—more comprehensive than what most researchers receive after six months of traditional peer review."

---

## **[SCENE 5: VIEW REVIEWS]** *(2:55 - 3:25)*

**[Visual: Scroll through different reviews, showing attitudes and content]**

**AI VOICE:**
"Each review includes specific feedback—not just scores, but actionable insights.

Dr. Chen: 'NEUTRAL'—solid work but wants stronger experimental validation.

Prof. Ross: 'POSITIVE'—impressed by the system architecture.

Dr. Watson: 'NEUTRAL'—clear writing but suggests better motivation section.

Notice something? These aren't generic templates. The agents reference specific sections of the paper. They disagree—just like real reviewers would. That's the power of specialized AI agents with distinct expertise and personalities."

**[Visual: Click on "View PDF" button → PDF opens]**

"And yes, you can view the original PDF anytime—secured with signed URLs."

---

## **[SCENE 6: SYNTHESIS]** *(3:25 - 4:10)*

**AI VOICE:**
"But six individual reviews can be overwhelming. What researchers really need is a clear verdict.

Enter Synthesis."

**[Visual: Click "Generate Synthesis" button → Loading → Synthesis appears]**

"Revio's synthesis engine—powered by TinyFish AI—analyzes all six reviews and produces a unified decision.

**[Visual: Show synthesis card with decision]**

"The verdict? MAJOR REVISION.

But more importantly, here's WHY.

**Strengths identified:**
- Novel architecture combining PoA blockchain with cross-chain bridges
- Strong performance metrics
- Cost efficiency improvements

**Weaknesses to address:**
- Limited experimental validation across diverse network conditions
- Security analysis could be deeper

**Specific recommendations:**
- Add Byzantine fault tolerance testing
- Expand related work discussion
- Include formal verification of protocols

This isn't a rejection—it's a roadmap to acceptance."

---

## **[SCENE 7: PLATFORM OVERVIEW]** *(4:10 - 4:40)*

**[Visual: Navigate to different pages—Library, Agent Directory, Conferences]**

**AI VOICE:**
"Revio isn't just a review tool. It's a complete research ecosystem.

The Library organizes all your papers with filtering by field, search by keyword, and status tracking.

The Agent Directory lets you browse our AI reviewers—their expertise, reputation tiers, and review histories.

The Conferences page—automatically populated by TinyFish web scrapers—shows upcoming venues with extracted deadlines and scope. Never miss a CFP again."

**[Visual: Show mobile responsive view]**

"And it works everywhere. Desktop, tablet, mobile. Research doesn't stop when you leave your desk."

---

## **[SCENE 8: TECH STACK & VISION]** *(4:40 - 5:25)*

**[Visual: Tech stack icons appear—React, Node, OpenRouter, TinyFish, Neon, R2, Render, Vercel]**

**AI VOICE:**
"Behind the scenes, Revio runs on modern, scalable infrastructure.

React and Node.js for the application. PostgreSQL on Neon for the database. Cloudflare R2 for secure PDF storage. Deployed on Render and Vercel.

But the real innovation? The AI layer.

**OpenRouter** gives us access to multiple AI models—with a crucial free tier that makes this accessible to everyone.

**TinyFish** provides web automation that scrapes conference websites intelligently—not just raw HTML, but semantic understanding of names, dates, and scopes.

Together, they enable something unprecedented: expert-quality peer review at zero cost."

---

## **[SCENE 9: CLOSING]** *(5:25 - 5:55)*

**[Visual: Back to the uploaded paper, showing 6 reviews and synthesis]**

**AI VOICE:**
"Three months of waiting. Compressed to three minutes.

Biased gatekeepers. Replaced by diverse AI experts with transparent criteria.

Surface-level feedback. Transformed into actionable, specific guidance.

This is Revio. Democratizing scientific validation. Accelerating human discovery.

Because every breakthrough deserves to be heard—not buried in a backlog.

**[Visual: Logo + Tagline]**

Revio. Where every question finds its council."

**[Fade out]**

---

## **[END CARD]** *(5:55 - 6:10)*

**[Visual: GitHub link, Demo URL, Team info]**

**AI VOICE:**
"Try the demo at revio-six.vercel.app.

Built for the hackathon. Built for researchers everywhere.

Thank you."

---

## **Production Notes:**

| Element | Recommendation |
|---------|---------------|
| **Voice Style** | Professional but warm, slightly enthusiastic |
| **Pacing** | Medium pace, slight pauses at key moments |
| **Background Music** | Soft, ambient tech/corporate (optional) |
| **Transitions** | Smooth fades, highlight key UI interactions |
| **Captions** | Add subtitles for accessibility |
| **Total Runtime** | ~6 minutes |

## **Key Phrases to Emphasize:**
- "Months of waiting. Compressed to three minutes."
- "Six experts. Six perspectives. Zero cost."
- "Democratizing scientific validation."
- "Where every question finds its council."

Good luck with your demo! 🎬🚀
