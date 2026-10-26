#!/usr/bin/env python3
"""
Tanvir.Studio static site generator.

Usage:  python3 build/build.py
Edit SITE_URL below when you get your real domain, then run the script again.
Portfolio projects, hero video and About photo are edited in assets/js/site-data.js
(or with portfolio-editor.html), not in this file.
"""
import json
import os
import re
import urllib.parse
from datetime import date

try:
    from bs4 import BeautifulSoup, NavigableString, Comment
except ImportError:  # pragma: no cover
    raise SystemExit('Please run: pip install beautifulsoup4')

# ----------------------------------------------------------------------
# Settings
# ----------------------------------------------------------------------
SITE_URL = "https://tanvir.studio"          # replace with your real domain
BRAND = "Tanvir.Studio"
EMAIL = "tanvirislam.studio@gmail.com"
WHATSAPP_NUM = "8801627210499"
WHATSAPP = "+8801627210499"
PHONE = "+8801785837362"
LOCATION = "Mirpur 12, Dhaka, Bangladesh"
MAP_EMBED = "https://www.google.com/maps?q=Mirpur+12,+Dhaka,+Bangladesh&z=14&output=embed"
MAP_LINK = "https://www.google.com/maps/search/?api=1&query=Mirpur+12+Dhaka+Bangladesh"
FORM_ENDPOINT = "https://formsubmit.co/ajax/" + EMAIL
SOCIAL = {
    "facebook": "https://facebook.com/tanvirislam23",
    "instagram": "https://instagram.com/tanvir.studio",
    "linkedin": "https://linkedin.com/in/tanvirislam62",
    "youtube": "https://youtube.com/@tanvirislamofficial",
}
TODAY = date.today().isoformat()
OUT = os.environ.get("SITE_OUT") or os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

NAV = [
    ("Home", "index.html"),
    ("About", "about.html"),
    ("Services", "services.html"),
    ("Portfolio", "portfolio.html"),
    ("Pricing", "pricing.html"),
    ("Blog", "blog.html"),
]


def wa(msg="Hello Tanvir.Studio, I would like to discuss a project."):
    return f"https://wa.me/{WHATSAPP_NUM}?text=" + urllib.parse.quote(msg)


# ----------------------------------------------------------------------
# Icons
# ----------------------------------------------------------------------
ICONS = {
    "play": '<polygon points="6 4 20 12 6 20 6 4"/>',
    "film": '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 3v18M17 3v18M3 8h4M3 12h18M3 16h4M17 8h4M17 16h4"/>',
    "layers": '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    "pen": '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.6 7.6"/><circle cx="11" cy="11" r="2"/>',
    "arrow": '<path d="M5 12h14M13 6l6 6-6 6"/>',
    "check": '<polyline points="20 6 9 17 4 12"/>',
    "mail": '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/>',
    "chat": '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z"/>',
    "whatsapp": '<path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88zm8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.48-8.42z"/>',
    "instagram": '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
    "facebook": '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    "linkedin": '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
    "youtube": '<path d="M22.5 6.4a2.8 2.8 0 0 0-1.9-2C18.9 4 12 4 12 4s-6.9 0-8.6.4a2.8 2.8 0 0 0-1.9 2A29 29 0 0 0 1 11.8a29 29 0 0 0 .5 5.3A2.8 2.8 0 0 0 3.4 19c1.7.5 8.6.5 8.6.5s6.9 0 8.6-.5a2.8 2.8 0 0 0 1.9-2 29 29 0 0 0 .5-5.2 29 29 0 0 0-.5-5.4z"/><polygon points="9.8 15 15.5 11.8 9.8 8.5 9.8 15"/>',
    "clock": '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    "globe": '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    "shield": '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>',
    "zap": '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    "refresh": '<path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.5 9a9 9 0 0 1 14.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0 0 20.5 15"/>',
    "menu": '<path d="M3 7h18M3 12h18M3 17h18"/>',
    "close": '<path d="M18 6L6 18M6 6l12 12"/>',
    "plus": '<path d="M12 5v14M5 12h14"/>',
    "star": '<polygon points="12 2 15.1 8.3 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 8.9 8.3 12 2"/>',
    "target": '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    "users": '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    "calendar": '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    "dollar": '<path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    "award": '<circle cx="12" cy="8" r="7"/><polyline points="8.2 13.9 7 23 12 20 17 23 15.8 13.9"/>',
    "send": '<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>',
    "image": '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
    "sparkle": '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z"/>',
    "chevron": '<polyline points="9 18 15 12 9 6"/>',
    "pin": '<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    "phone": '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    "layout": '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
    "external": '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>',
}


def ic(name, cls=""):
    c = ("ic " + cls).strip()
    return f'<svg class="{c}" aria-hidden="true" focusable="false"><use href="#i-{name}"/></svg>'


def sprite():
    parts = "".join(f'<symbol id="i-{k}" viewBox="0 0 24 24">{v}</symbol>' for k, v in ICONS.items())
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">{parts}</svg>'


LOGO_MARK = ('<svg class="logo-mark" viewBox="0 0 40 40" aria-hidden="true"><rect class="lm-bg" width="40" height="40" rx="12"/>'
             '<path class="lm-play" d="M15 11.5v17l14-8.5z"/><circle class="lm-dot" cx="31" cy="10" r="3.5"/></svg>')

# ----------------------------------------------------------------------
# Blog thumbnail artwork (blue system)
# ----------------------------------------------------------------------
B, N, S, C, I = "#2252ff", "#081338", "#e3ecff", "#22c7ff", "#6a4bff"


def _dots():
    out = [f'<rect width="100" height="100" fill="{N}"/>']
    for i in range(6):
        for j in range(6):
            on = (i * 3 + j * 5) % 7 == 0
            out.append(f'<circle cx="{10 + i * 16}" cy="{10 + j * 16}" r="{5 if on else 2.4}" fill="{C if on else "#2b3f8f"}"/>')
    return "".join(out)


ART = {
    1: f'<rect width="100" height="100" fill="{B}"/><circle cx="68" cy="34" r="22" fill="{I}"/><circle cx="68" cy="34" r="9" fill="{C}"/><rect x="10" y="64" width="52" height="8" rx="4" fill="#fff"/><rect x="10" y="78" width="34" height="8" rx="4" fill="{N}"/>',
    2: f'<rect width="100" height="100" fill="{S}"/><circle cx="32" cy="68" r="34" fill="{B}"/><circle cx="72" cy="28" r="16" fill="none" stroke="{I}" stroke-width="6"/>',
    3: f'<rect width="100" height="100" fill="{N}"/><polygon points="20,80 50,20 80,80" fill="{B}"/><circle cx="74" cy="26" r="9" fill="{C}"/><rect x="14" y="86" width="72" height="3" fill="#fff"/>',
    4: f'<rect width="100" height="100" fill="#f3f7ff"/><rect x="10" y="10" width="46" height="46" rx="10" fill="{B}"/><rect x="44" y="44" width="46" height="46" rx="10" fill="{I}"/><circle cx="30" cy="76" r="12" fill="{C}"/>',
    6: f'<rect width="100" height="100" fill="{B}"/><g fill="none" stroke="#fff" stroke-width="2.5"><circle cx="50" cy="50" r="10"/><circle cx="50" cy="50" r="22"/><circle cx="50" cy="50" r="34"/><circle cx="50" cy="50" r="46"/></g><circle cx="50" cy="50" r="5" fill="{C}"/>',
    7: _dots(),
}


def art(v):
    return f'<svg class="art" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">{ART[v]}</svg>'


# ----------------------------------------------------------------------
# Content
# ----------------------------------------------------------------------
CATS = {
    "video": ("Video Editing", "film"),
    "motion": ("Motion Graphics", "layers"),
    "design": ("Graphic Design", "pen"),
}

SERVICES = [
    {
        "id": "video-editing", "key": "video", "icon": "film", "name": "Video Editing", "cls": "b-blue",
        "short": "Reels, YouTube videos, ads, interviews and brand films. We cut for pace, clean up the sound and color, and add captions.",
        "lead": "We take your raw footage and turn it into something people actually watch to the end.",
        "tags": ["Reels", "YouTube", "Ads", "Podcasts", "Brand films"],
        "deliver": ["Story and pacing edit", "Color correction and grading", "Audio cleanup and mixing", "Captions and subtitles",
                    "Titles, lower thirds and overlays", "Multi camera editing", "Platform ready exports", "Short clips from long footage"],
        "use": ["YouTube creators", "Ecommerce brands", "Agencies", "Podcasters", "Corporate teams", "Event organizers"],
        "formats": "16:9, 9:16, 1:1 and 4:5 in up to 4K",
        "draft": "First draft in 48 to 72 hours", "rev": "Up to 3 revision rounds",
    },
    {
        "id": "motion-graphics", "key": "motion", "icon": "layers", "name": "Motion Graphics", "cls": "b-navy",
        "short": "Animated logos, explainers, moving text and ad animation. Handy when an idea is hard to explain in a sentence.",
        "lead": "Short animation that explains your idea quickly and gives your brand a look people recognize in motion.",
        "tags": ["Logo animation", "Explainers", "Moving text", "Ads"],
        "deliver": ["Animated logo reveals", "2D explainer videos", "Kinetic typography", "Animated infographics",
                    "Social media animation", "App and product promos", "Title sequences", "Transparent alpha exports"],
        "use": ["Startups", "SaaS companies", "Marketing teams", "Course creators", "Agencies", "Nonprofits"],
        "formats": "MP4, MOV with alpha, GIF and Lottie ready files",
        "draft": "Style frames in 3 to 4 days", "rev": "Up to 3 revision rounds",
    },
    {
        "id": "graphic-design", "key": "design", "icon": "pen", "name": "Graphic Design", "cls": "b-light",
        "short": "Logos, brand kits, social posts, thumbnails and print layouts that all look like they belong together.",
        "lead": "Design that follows a system, so your logo, posts and documents match without anyone having to think about it.",
        "tags": ["Logos", "Brand kits", "Social posts", "Print"],
        "deliver": ["Logo design and variations", "Brand color and typography", "Brand guidelines document", "Social media templates",
                    "YouTube thumbnails", "Brochures, flyers and posters", "Presentation and pitch decks", "Packaging concepts"],
        "use": ["New businesses", "Personal brands", "Restaurants and retail", "Event teams", "Agencies", "Creators"],
        "formats": "AI, SVG, PDF, PNG and layered source files",
        "draft": "First concepts in 3 to 5 days", "rev": "Up to 3 revision rounds",
    },
]

PLANS = {
    "video": [
        {"n": "Starter", "p": 99, "u": "per video", "d": "Reels, short clips and simple edits.",
         "f": ["Up to 3 minutes of final video", "Clean cuts, pacing and transitions", "Color fix and audio cleanup", "Captions included", "2 revision rounds", "First draft in 72 hours"]},
        {"n": "Professional", "p": 249, "u": "per video", "d": "Clean, polished edits for brands and creators.", "hot": True,
         "f": ["Up to 8 minutes of final video", "Motion titles and lower thirds", "Sound design and music sync", "Color grading", "Exports for every platform", "3 revision rounds", "First draft in 48 hours"]},
        {"n": "Premium", "p": 549, "u": "per video", "d": "Longer films and multi-camera projects.",
         "f": ["Up to 20 minutes of final video", "Full story and pacing edit", "Full color grade", "Multi camera and B roll editing", "Thumbnail and cutdown versions", "5 revision rounds", "Priority delivery"]},
    ],
    "motion": [
        {"n": "Starter", "p": 149, "u": "per project", "d": "Logo animations and short social loops.",
         "f": ["Up to 15 seconds of animation", "Logo reveal or social loop", "Sound effects included", "Square and vertical exports", "2 revision rounds", "Delivery in 4 days"]},
        {"n": "Professional", "p": 349, "u": "per project", "d": "Explainers and branded ad animation.", "hot": True,
         "f": ["Up to 45 seconds of animation", "Custom 2D illustration and animation", "Storyboard and style frames", "Voice over sync and sound design", "Transparent and standard exports", "3 revision rounds", "Delivery in 7 days"]},
        {"n": "Premium", "p": 749, "u": "per project", "d": "Full explainers and a complete animation style for your brand.",
         "f": ["Up to 90 seconds of animation", "Scriptwriting support", "Detailed storyboard and art direction", "Custom characters and 3D style elements", "Reusable template files", "5 revision rounds", "Priority delivery"]},
    ],
    "design": [
        {"n": "Starter", "p": 79, "u": "per set", "d": "Social posts and quick design jobs.",
         "f": ["5 social media designs", "Your brand colors and fonts", "PNG and JPG exports", "2 revision rounds", "Delivery in 3 days"]},
        {"n": "Professional", "p": 199, "u": "per project", "d": "A logo and a starter brand kit.", "hot": True,
         "f": ["Logo with 2 concepts", "Color palette and fonts", "Business card and social profile set", "All file formats and variations", "3 revision rounds", "Delivery in 7 days"]},
        {"n": "Premium", "p": 449, "u": "per project", "d": "A complete brand kit, ready to use.",
         "f": ["3 logo concepts with full variations", "Brand guidelines document", "Stationery and social media kit", "Pitch deck or brochure layout", "Source files and handover", "5 revision rounds", "Priority delivery"]},
    ],
}

FAQS = [
    ("How does a project start?",
     "Send us a short brief: what you need, who it's for and when you need it. We'll reply with a few questions, then confirm the scope, timeline and price before any work begins."),
    ("How will we stay in touch?",
     "By email or WhatsApp, whichever you prefer. Drafts come as private links, so you can leave notes right on the video or design."),
    ("How does payment work?",
     "We quote in USD. Most projects start with a 50 percent deposit, and the rest is due when you approve the final version. Bank transfer and online payments both work."),
    ("How many changes can I ask for?",
     "Every package includes a set number of revision rounds, two on Starter and up to five on Premium. If you need more, extra rounds are priced up front so there are no surprises."),
    ("Will you sign an NDA?",
     "Yes. Send yours over before you share footage or scripts. We keep project files private either way."),
    ("Who owns the final files?",
     "You do. Once the final payment clears, the usage rights are yours. Project files are available on request."),
    ("How long does it take?",
     "A first draft usually takes 2 to 3 days for video and 3 to 5 days for design or motion work. Rush jobs are possible, just tell us your deadline up front."),
]

POSTS = [
    {
        "slug": "how-to-brief-a-video-editor", "title": "How to brief a video editor (and get a good first draft)",
        "desc": "A short checklist for briefing a video editor, so the first draft lands close to what you imagined and you save a few rounds of changes.",
        "cat": "Video Editing", "date": "2026-09-18", "read": "5 min read", "art": 1,
        "excerpt": "Most editing problems start before anyone opens the timeline. Here's what to send your editor on day one.",
        "body": [
            ("p", "Most editing problems start before anyone opens the timeline. A vague brief gets you a vague video, and then you spend three rounds of feedback saying what you could have said on day one."),
            ("p", "Here's the short list we ask every client for. Fill it in once and the first draft usually lands much closer to what you pictured."),
            ("h2", "Say what the video is for"),
            ("p", "Is it an ad, a product demo, a YouTube episode, a Reel? The answer changes the first three seconds, the length, the music and even how fast we cut. \"Make it look good\" is hard to act on. \"Get people to click the link at the end\" is easy."),
            ("h2", "Send the right material"),
            ("ul", ["The raw footage in a shared folder (Google Drive or Dropbox is fine)", "Your logo, fonts and brand colors", "Two or three videos you like, with a line on what you like about each", "Where it will be posted and the shape you need: 16:9, vertical or square", "Music you'd like to use, or a note on the mood", "Your deadline, and the day you want to see the first draft"]),
            ("quote", "One reference video saves a page of explaining."),
            ("h2", "Pick one person to give feedback"),
            ("p", "If three people comment separately, the notes often clash and the editor ends up guessing who's right. Choose one person to collect everything and send it in a single message. Time stamps help a lot: \"at 0:42, cut the second sentence\" beats \"the middle feels slow\"."),
            ("h2", "Plan for two rounds of changes"),
            ("p", "A good first draft gets you about 80 percent of the way there. The second round fixes details, and a third is usually only needed when the goal changed halfway through. Knowing this up front keeps the schedule realistic."),
            ("p", "If you'd like a hand with a project, <a href=\"/services.html#video-editing\">see how our video editing works</a> or <a href=\"/contact.html\">send us your brief</a>."),
        ],
    },
    {
        "slug": "motion-graphics-vs-animation", "title": "Motion graphics or animation? A quick way to choose",
        "desc": "Motion graphics and character animation are not the same thing. Here's the difference, and how to pick the right one for your next video.",
        "cat": "Motion Graphics", "date": "2026-09-04", "read": "4 min read", "art": 2,
        "excerpt": "People use the two words as if they mean the same thing. They don't, and mixing them up gets expensive.",
        "body": [
            ("p", "People use these two words as if they mean the same thing. It gets expensive when you ask for one and wanted the other."),
            ("h2", "Motion graphics: moving design"),
            ("p", "Think animated logos, moving text, icons that slide into place, charts that build themselves. It's made from shapes and type, not characters, so it's quicker to produce and easy to keep on brand. It's the right pick for explainers, product videos, intros and social ads."),
            ("h2", "Character animation: moving stories"),
            ("p", "Here characters act, talk and show emotion. It takes far more time because every movement is drawn or posed by hand. It makes sense if you want a mascot that will be used for years, or if the story depends on feeling."),
            ("h2", "A quick way to choose"),
            ("ul", ["You need to explain a product or process in under a minute: motion graphics.", "You want a mascot your brand will use for years: character animation.", "You need ten versions of one idea for social media: motion graphics with templates.", "The budget is tight: start with a short motion piece and build from there."]),
            ("quote", "Start with the smallest piece that does the job."),
            ("h2", "Build a system, not a one-off"),
            ("p", "A five second logo animation and a set of lower thirds can make a whole channel feel finished. Once those exist, longer explainers and campaign videos get easier, because the style is already decided. Have a look at our <a href=\"/services.html#motion-graphics\">motion graphics service</a> to see what's included."),
        ],
    },
    {
        "slug": "brand-identity-basics", "title": "The five things every small business needs for its brand",
        "desc": "A logo is only one part of a brand. These five things keep a small business looking consistent, from the website to the invoice.",
        "cat": "Graphic Design", "date": "2026-08-21", "read": "4 min read", "art": 4,
        "excerpt": "A logo is only one piece. These five things keep your business looking the same everywhere.",
        "body": [
            ("p", "A logo is only one piece. What makes a business look consistent is everything around it. If you're starting out on a small budget, these five things matter most."),
            ("h2", "The list"),
            ("ul", ["A logo in a few versions: horizontal, stacked, and an icon-only one for small spaces", "Two or three brand colors, with exact codes for screen and print", "One or two fonts, and a note on where each is used", "Templates for the posts you make most often", "A short guide, two or three pages, showing how to use all of the above"]),
            ("h2", "Why bother"),
            ("p", "People trust things that look the same everywhere. When your invoice, your Instagram page and your website feel like they come from one company, you look established, even if you started last month."),
            ("quote", "Consistency is what turns a nice logo into a brand."),
            ("h2", "What to do first"),
            ("p", "Start with the logo and colors. Then build templates for the one or two places where your customers find you. The guide can stay short. Our <a href=\"/services.html#graphic-design\">graphic design service</a> covers all five, and you can add them one at a time."),
        ],
    },
    {
        "slug": "working-with-a-remote-creative-studio", "title": "Working with a remote studio: what to agree on first",
        "desc": "Hiring a studio you'll never meet in person feels risky. These are the few things to agree on before work starts.",
        "cat": "Business", "date": "2026-08-07", "read": "4 min read", "art": 6,
        "excerpt": "Hiring a studio you'll never meet feels risky the first time. A few things on paper make it a lot less so.",
        "body": [
            ("p", "Hiring a studio you'll never meet in person feels risky the first time. It usually isn't, as long as a few things are agreed on paper before work starts."),
            ("h2", "Agree on the scope"),
            ("p", "Write down what you're getting: how many videos or designs, which formats and sizes, and how many rounds of changes are included. Most disagreements come from two people picturing different things."),
            ("h2", "Put the basics in writing"),
            ("ul", ["What will be delivered, and in which formats", "Dates for the first draft and the final files", "Price, deposit, and when the balance is due", "An NDA, if your material is confidential", "A line confirming that you own the final files"]),
            ("quote", "A clear scope matters more than where the team sits."),
            ("h2", "Keep feedback in one place"),
            ("p", "Use a review link where you can comment on exact moments, instead of long email chains. It also leaves a record of every decision, which helps on the next project."),
            ("h2", "Expect regular updates"),
            ("p", "A short message at each milestone is enough. It keeps things moving, and small questions get answered before they turn into delays. If you're comparing studios, ask how updates work. The answer tells you a lot. You can also <a href=\"/contact.html\">ask us</a> how we run projects."),
        ],
    },
]


# ----------------------------------------------------------------------
# Layout
# ----------------------------------------------------------------------


def url(path):
    return SITE_URL.rstrip("/") + "/" + ("" if path == "index.html" else path)


def org_schema():
    return {
        "@context": "https://schema.org", "@type": "ProfessionalService", "@id": SITE_URL + "/#organization",
        "name": BRAND, "url": SITE_URL + "/", "logo": SITE_URL + "/assets/img/logo.svg", "image": SITE_URL + "/assets/img/og-cover.png",
        "description": "Creative studio for video editing, motion graphics and graphic design.",
        "email": EMAIL, "telephone": WHATSAPP,
        "address": {"@type": "PostalAddress", "streetAddress": "Mirpur 12", "addressLocality": "Dhaka", "addressCountry": "BD"},
        "knowsAbout": ["Video editing", "Motion graphics", "Graphic design", "Brand identity", "Social media content"],
        "sameAs": list(SOCIAL.values()), "priceRange": "$$",
        "contactPoint": [{"@type": "ContactPoint", "contactType": "customer support", "email": EMAIL, "telephone": WHATSAPP, "availableLanguage": ["English", "Bengali"]}],
    }


def site_schema():
    return {"@context": "https://schema.org", "@type": "WebSite", "@id": SITE_URL + "/#website", "url": SITE_URL + "/", "name": BRAND,
            "publisher": {"@id": SITE_URL + "/#organization"}, "inLanguage": "en"}


def crumb_schema(items):
    return {"@context": "https://schema.org", "@type": "BreadcrumbList",
            "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": n, "item": url(p)} for i, (n, p) in enumerate(items)]}


def faq_schema(faqs):
    return {"@context": "https://schema.org", "@type": "FAQPage",
            "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faqs]}


def head(title, desc, path, schemas, og_type="website", published=None, page_key=""):
    full_title = title if BRAND in title else f"{title} | {BRAND}"
    canonical = url(path)
    ld = "".join(f'<script type="application/ld+json">{json.dumps(s, ensure_ascii=False)}</script>\n' for s in schemas)
    extra = ""
    if published:
        extra = f'<meta property="article:published_time" content="{published}">\n<meta property="article:author" content="{BRAND}">\n'
    return f"""<!doctype html>
<html lang="en" class="no-js" data-wa="{wa()}" data-page="{page_key}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{full_title}</title>
<meta name="description" content="{desc}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<meta name="author" content="{BRAND}">
<meta name="theme-color" content="#2252ff">
<link rel="canonical" href="{canonical}">
<link rel="alternate" hreflang="x-default" href="{canonical}">
<meta property="og:site_name" content="{BRAND}">
<meta property="og:type" content="{og_type}">
<meta property="og:title" content="{full_title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{SITE_URL}/assets/img/og-cover.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{BRAND} video editing, motion graphics and graphic design studio">
{extra}<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{full_title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{SITE_URL}/assets/img/og-cover.png">
<link rel="icon" type="image/svg+xml" href="assets/img/favicon.svg">
<link rel="manifest" href="site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://i.ytimg.com">
<link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@500;600;700;800&display=swap">
<link rel="stylesheet" href="assets/css/style.css">
<script>document.documentElement.className=document.documentElement.className.replace('no-js','js');try{{if(sessionStorage.getItem('ts-pre'))document.documentElement.classList.add('skip-pre')}}catch(e){{}}</script>
{ld}</head>
"""


def header(active):
    cur = ' aria-current="page"'
    links = "".join(f'<a href="{p}"{cur if n == active else ""}>{n}</a>' for n, p in NAV)
    return f"""<a class="skip-link" href="#main">Skip to content</a>
<div class="progress" aria-hidden="true"></div>
<div class="page-wipe" aria-hidden="true"></div>
<div class="preloader" aria-hidden="true"><div class="pre-inner"><svg class="pre-mark" viewBox="0 0 40 40"><rect width="40" height="40" rx="12" fill="#2252ff"/><path d="M15 11.5v17l14-8.5z" fill="#fff"/><circle cx="31" cy="10" r="3.5" fill="#22c7ff"/></svg><div class="pre-name">{BRAND}</div><div class="pre-bar"><i></i></div></div></div>
<header class="site-header">
<div class="container nav">
<a class="logo" href="index.html" aria-label="{BRAND} home">{LOGO_MARK}<b>Tanvir<span>.Studio</span></b></a>
<nav class="nav-links" id="site-nav" aria-label="Main navigation">
{links}
<a class="btn btn-sm" href="contact.html"{cur if active == "Contact" else ""} data-magnetic>Contact {ic("arrow")}</a>
</nav>
<button class="menu-btn" type="button" aria-label="Toggle menu" aria-expanded="false" aria-controls="site-nav">{ic("menu", "i-menu")}{ic("close", "i-close")}</button>
</div>
</header>
"""


def socials(cls=""):
    items = "".join(f'<a href="{u}" data-s="{n}" target="_blank" rel="noopener" aria-label="{n.title()}">{ic(n)}</a>' for n, u in SOCIAL.items())
    return f'<div class="socials {cls}">{items}</div>'


def footer():
    return f"""<footer class="site-footer">
<div class="container">
<div class="foot-grid">
<div>
<a class="logo" href="index.html" aria-label="{BRAND} home">{LOGO_MARK}<b>Tanvir<span>.Studio</span></b></a>
<p>Video editing, motion graphics and graphic design for businesses, creators and agencies.</p>
{socials()}
</div>
<div>
<h4>Studio</h4>
<ul>
<li><a href="index.html">Home</a></li><li><a href="about.html">About</a></li><li><a href="portfolio.html">Portfolio</a></li><li><a href="pricing.html">Pricing</a></li><li><a href="blog.html">Blog</a></li><li><a href="contact.html">Contact</a></li>
</ul>
</div>
<div>
<h4>Services</h4>
<ul>
<li><a href="services.html#video-editing">Video Editing</a></li><li><a href="services.html#motion-graphics">Motion Graphics</a></li><li><a href="services.html#graphic-design">Graphic Design</a></li>
</ul>
</div>
<div>
<h4>Get in touch</h4>
<ul class="foot-contact">
<li>{ic("mail")}<a href="mailto:{EMAIL}" data-s="email" data-s-text>{EMAIL}</a></li>
<li>{ic("chat")}<a href="{wa()}" data-s="whatsapp" data-s-text target="_blank" rel="noopener">{WHATSAPP}</a></li>
<li>{ic("pin")}<span data-s="location" data-s-text>{LOCATION}</span></li>
</ul>
</div>
</div>
</div>
<div class="foot-word" aria-hidden="true">Tanvir.Studio</div>
<div class="container foot-bar">
<span>&copy; <span data-year>2026</span> {BRAND}. All rights reserved.</span>
<span>Video Editing, Motion Graphics and Graphic Design</span>
</div>
</footer>
<a class="wa-float" href="{wa()}" data-s="whatsapp" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">{ic("whatsapp", "ic-fill")}<span class="wa-label">Chat on WhatsApp</span></a>
<button class="to-top" type="button" aria-label="Back to top">{ic("arrow")}</button>
{sprite()}
<script src="assets/js/config.js"></script>
<script src="assets/js/site-data.js" defer></script>
<script src="assets/js/cms.js" defer></script>
<script src="assets/js/media.js" defer></script>
<script src="assets/js/portfolio.js" defer></script>
<script src="assets/js/main.js" defer></script>
</body>
</html>
"""


def write(path, content):
    full = os.path.join(OUT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(content)


def page_key_of(path):
    return "home" if path == "index.html" else path.replace(".html", "")


def page(path, active, title, desc, main, schemas, og_type="website", published=None):
    key = page_key_of(path)
    html = head(title, desc, path, [org_schema(), site_schema()] + schemas, og_type, published, key)
    html += "<body>\n" + header(active) + '<main id="main">\n' + main + "\n</main>\n" + footer()
    write(path, cmsify(html, key, title, desc))


def ph_cards(items):
    colors = ["", " c2", " c3"]
    return "".join(f'<div class="ph-card{colors[i]}"><i>{ic(icon)}</i><div><b>{t}</b><span>{d}</span></div></div>' for i, (icon, t, d) in enumerate(items))


def page_hero(title, intro, crumbs, cards=None, word=""):
    cr = f'<a href="index.html">Home</a>{ic("chevron")}'
    for name, p in crumbs[:-1]:
        cr += f'<a href="{p}">{name}</a>{ic("chevron")}'
    cr += f'<span aria-current="page">{crumbs[-1][0]}</span>'
    side = f'<div class="ph-cards" data-reveal="left" data-delay="300">{ph_cards(cards)}</div>' if cards else ""
    return f"""<section class="page-hero" data-word="{word or crumbs[-1][0]}">
<div class="container ph-grid{' ph-solo' if not cards else ''}">
<div class="ph-main">
<nav class="crumbs" aria-label="Breadcrumb">{cr}</nav>
<h1 data-split>{title}</h1>
<p class="lead" data-reveal="up" data-delay="350">{intro}</p>
</div>
{side}
</div>
</section>"""


def cta_band(title="Got a project in mind?", text="Tell us what you're working on. We'll reply within one business day with a few questions, some ideas and a price."):
    return f"""<section class="section-tight">
<div class="container">
<div class="cta-panel" data-reveal="zoom">
<span class="shape sh1"></span><span class="shape sh2"></span><span class="shape sh3"></span>
<h2 data-split>{title}</h2>
<p>{text}</p>
<div class="hero-cta"><a class="btn btn-light" href="contact.html" data-magnetic>Contact {ic("arrow")}</a><a class="btn btn-outline-light" href="{wa()}" data-s="whatsapp" target="_blank" rel="noopener">{ic("whatsapp", "ic-fill")} WhatsApp</a></div>
</div>
</div>
</section>"""


def faq_block(faqs, key="home"):
    items = ""
    for q, a in faqs:
        items += f'<div class="faq-item"><button class="faq-q" type="button" aria-expanded="false"><span>{q}</span><span class="pm">{ic("plus")}</span></button><div class="faq-a"><div><p>{a}</p></div></div></div>\n'
    return f'<div class="faq" data-faq="{key}" data-reveal="up">{items}</div>'


def plan_card(p, key):
    badge = f'<span class="badge">{ic("star")} Most chosen</span>' if p.get("hot") else ""
    feats = "".join(f"<li>{ic('check')}<span>{f}</span></li>" for f in p["f"])
    msg = f"Hello Tanvir.Studio, I am interested in the {CATS[key][0]} {p['n']} package."
    return f"""<article class="plan{' hot' if p.get('hot') else ''}">
{badge}
<h3>{p['n']}</h3>
<p>{p['d']}</p>
<div class="price">${p['p']}<small>{p['u']}</small></div>
<ul>{feats}</ul>
<a class="btn" href="{wa(msg)}" target="_blank" rel="noopener">Choose {p['n']} {ic('arrow')}</a>
</article>"""


# ----------------------------------------------------------------------
# Pages
# ----------------------------------------------------------------------
STEPS = [
    ("Brief", "Tell us what you need, who it's for and where it will be used. Send references if you have them."),
    ("Plan", "We confirm scope, timeline and price in writing. For bigger jobs we share a storyboard or style frames first."),
    ("Draft", "We build the first version and send you a private link to review."),
    ("Finish", "You send your notes, we make the changes, and you get the final files in every size you need."),
]


def steps_html():
    return "".join(f'<div class="step" style="--k:{i}"><div class="num">0{i + 1}</div><h3>{t}</h3><p>{d}</p></div>' for i, (t, d) in enumerate(STEPS))


def build_home():
    bento = ""
    for s in SERVICES:
        chips = "".join(f'<span class="chip">{t}</span>' for t in s["tags"])
        bento += f"""<a class="bento-card {s['cls']}" href="services.html#{s['id']}" data-reveal="up" data-delay="{SERVICES.index(s) * 120}">
<span class="b-deco"></span>
<div class="b-ico">{ic(s['icon'])}</div>
<h3>{s['name']}</h3>
<p>{s['short']}</p>
<div class="svc-tags">{chips}</div>
<span class="b-link">See details {ic('arrow')}</span>
</a>
"""
    marq = [("Video Editing", False), ("Motion Graphics", True), ("Graphic Design", False), ("Logos and Branding", True), ("Reels and Shorts", False), ("Explainer Videos", True)]
    half = "".join(f'<span class="{"o" if o else ""}">{t}{ic("sparkle")}</span>' for t, o in marq)

    why = [
        ("target", "We start with your goal", "First we ask what the video or design has to do. Then we pick the style, not the other way round."),
        ("zap", "Drafts come fast", "You usually see a first version within two days, so changes happen early, not at the deadline."),
        ("shield", "Your work stays private", "We'll sign your NDA, and you own the final files once you've paid."),
        ("refresh", "Changes are included", "Every package has revision rounds. Send notes on a review link and we'll fix them."),
    ]
    why_html = "".join(f'<div class="why" data-reveal="up" data-delay="{i * 100}"><div class="why-ico">{ic(i_)}</div><h3>{t}</h3><p>{d}</p></div>' for i, (i_, t, d) in enumerate(why))

    hero = f"""<section class="hero">
<span class="hero-glow"></span>
<div class="container hero-grid">
<div>
<span class="pill" data-reveal="up">{ic("sparkle")} Video editing, motion graphics and graphic design</span>
<h1 class="hero-title" data-reveal="up" data-delay="150"><span class="ht-line">We make</span><span class="typed-line"><span class="typed" data-typed data-cms-attr="data-words" data-words="videos.|motion graphics.|logos and brands.|social media posts.">videos.</span><span class="caret" aria-hidden="true"></span></span></h1>
<p class="lead" data-reveal="up" data-delay="350">{BRAND} is a small studio that edits videos, animates ideas and designs brands. Send us your brief and we'll show you a first draft in about two days.</p>
<div class="hero-cta" data-reveal="up" data-delay="500">
<a class="btn" href="contact.html" data-magnetic>Contact {ic("arrow")}</a>
<a class="btn btn-ghost" href="portfolio.html" data-magnetic>View portfolio</a>
</div>
<div class="hero-trust" data-reveal="up" data-delay="650">
<span class="t"><i>{ic("zap")}</i>First draft in 2 days</span>
<span class="t"><i>{ic("refresh")}</i>Changes included</span>
<span class="t"><i>{ic("shield")}</i>Your files stay private</span>
</div>
</div>
<div class="stage" data-reveal="zoom" data-delay="350">
<div class="chip-float c1"><i>{ic("film")}</i>Video editing</div>
<div class="chip-float c2"><i>{ic("layers")}</i>Motion design</div>
<div class="video-card" data-tilt>
<div class="vc-bar"><i></i><i></i><i></i><em>Studio showreel</em></div>
<div class="player" data-hero-video data-title="Studio showreel"></div>
</div>
</div>
</div>
</section>"""

    main = f"""{hero}
<div class="marquee" aria-hidden="true"><div class="marquee-track">{half}{half}</div></div>

<section class="section" id="services">
<div class="container">
<div class="sec-head split">
<div><span class="pill">{ic("layers")} What we do</span><h2 data-split style="margin-top:18px">Three skills, one studio.</h2></div>
<p data-reveal="up">Most clients need a video, then an animated intro, then a logo that matches. Instead of juggling three freelancers, you brief one team.</p>
</div>
<div class="bento">{bento}</div>
</div>
</section>

<section class="section section-sky">
<div class="container">
<div class="sec-head split">
<div><span class="pill">{ic("image")} Portfolio</span><h2 data-split style="margin-top:18px">Recent work.</h2></div>
<p data-reveal="up">Tap any project to watch it or see it full size.</p>
</div>
<div class="work-cols" data-work-feature></div>
<div class="mt-l"><a class="link-arrow" href="portfolio.html">See all projects {ic("arrow")}</a></div>
</div>
</section>

<section class="section">
<div class="container why-wrap">
<div class="sticky">
<span class="pill">{ic("award")} Why work with us</span>
<h2 data-split>We keep projects simple.</h2>
<p class="lead" data-reveal="up">You shouldn't have to chase anyone for updates. This is how we keep things moving.</p>
<div data-reveal="up"><a class="btn" href="contact.html" data-magnetic>Contact {ic("arrow")}</a></div>
</div>
<div class="why-cards">{why_html}</div>
</div>
</section>

<section class="section band-navy">
<div class="container">
<div class="sec-head">
<span class="pill on-dark">{ic("refresh")} How it works</span>
<h2 data-split>From brief to final files.</h2>
<p data-reveal="up">Four steps, and you'll know what's happening at each one.</p>
</div>
<div class="process">{steps_html()}</div>
<div class="stats">
<div class="stat" data-reveal="up"><b data-count="150" data-suffix="+">150+</b><span>Projects delivered</span></div>
<div class="stat" data-reveal="up" data-delay="100"><b data-count="40" data-suffix="+">40+</b><span>Happy clients</span></div>
<div class="stat" data-reveal="up" data-delay="200"><b data-count="48" data-suffix="h">48h</b><span>Typical first draft</span></div>
<div class="stat" data-reveal="up" data-delay="300"><b data-count="5" data-suffix="">5</b><span>Revision rounds on Premium</span></div>
</div>
</div>
</section>

<section class="section">
<div class="container faq-wrap">
<div class="sticky">
<span class="pill">{ic("chat")} FAQ</span>
<h2 data-split>Questions before you start?</h2>
<p data-reveal="up">Quick answers on timing, payment and changes.</p>
</div>
{faq_block(FAQS[:5], "home")}
</div>
</section>

{cta_band()}
"""
    services_ld = {"@context": "https://schema.org", "@type": "ItemList", "name": "Creative services",
                   "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": s["name"], "url": url("services.html") + "#" + s["id"]} for i, s in enumerate(SERVICES)]}
    page("index.html", "Home",
         "Video Editing, Motion Graphics & Design",
         "Tanvir.Studio edits videos, animates ideas and designs brands. See our work, check pricing and get a first draft in about two days.",
         main, [services_ld, faq_schema(FAQS[:5])])


SKILLS = [("Video editing", 95), ("Motion graphics", 88), ("Graphic design", 90), ("Color grading", 80), ("Sound cleanup", 75), ("Brand identity", 85)]


def build_about():
    tools = [("Adobe Premiere Pro", "film"), ("After Effects", "layers"), ("DaVinci Resolve", "film"), ("Photoshop", "image"), ("Illustrator", "pen"), ("Figma", "layout")]
    tools_html = "".join(f'<span class="tool">{ic(i)}{n}</span>' for n, i in tools)
    values = [
        ("chat", "Say it plainly", "We explain things in simple words, and we'll tell you early if something won't work."),
        ("award", "Care about the details", "Timing, spacing, sound levels. The small things people notice without knowing why."),
        ("shield", "Do what we said", "Dates and prices don't change halfway through. If something slips, you'll hear it from us first."),
    ]
    values_html = "".join(f'<div class="value" data-reveal="up" data-delay="{i * 120}"><div class="vi">{ic(i_)}</div><h3>{t}</h3><p>{d}</p></div>' for i, (i_, t, d) in enumerate(values))
    skills_html = "".join(f'<div class="skill-card"><div class="skill-top"><b>{n}</b><span>{v}%</span></div><div class="skill-bar"><i style="--v:{v}%"></i></div></div>' for n, v in SKILLS)
    checks = ["What we make, and who we make it for", "How a project runs from brief to delivery", "What to send us so we can start quickly"]
    checks_html = "".join(f"<li>{ic('check')}<span>{c}</span></li>" for c in checks)
    cards = [("film", "Video, motion and design", "Three skills in one studio"), ("target", "A clear process", "Brief, plan, draft, finish"), ("shield", "Reliable delivery", "Dates we actually keep")]
    main = f"""{page_hero("About Us", "A small studio that handles video, motion and design, so you only have to brief one team.", [("About", "about.html")], cards)}

<section class="section-tight">
<div class="container about-split">
<div class="portrait" data-reveal="zoom" data-about-photo aria-label="Studio portrait">
<div class="mono" data-parallax="0.05">T.</div>
<div class="tag">{ic("film")} Video, motion and design</div>
</div>
<div class="about-text">
<span class="pill">{ic("users")} Who we are</span>
<h2 data-split style="margin-top:18px">One studio for the whole look of your brand.</h2>
<p data-reveal="up" style="margin-top:22px">{BRAND} started with a simple idea: if your video, your animation and your logo come from the same place, they match. No more passing files between three freelancers and hoping the colors line up.</p>
<p data-reveal="up">We work with business owners, YouTubers and agencies. Some arrive with a finished script. Others only have raw footage and a rough idea. Both are fine.</p>
<div class="hero-cta" data-reveal="up" style="margin-top:28px"><a class="btn" href="contact.html">Contact {ic("arrow")}</a><a class="btn btn-ghost" href="portfolio.html">See our work</a></div>
</div>
</div>
</section>

<section class="section section-sky">
<div class="container video-split">
<div data-reveal="left"><div class="video-card" data-tilt><div class="vc-bar"><i></i><i></i><i></i><em>About the studio</em></div><div class="player" data-about-video data-title="About the studio"></div></div></div>
<div>
<span class="pill">{ic("play")} Meet the person behind the studio</span>
<h2 data-split style="margin-top:18px">Hear it from me.</h2>
<p data-reveal="up" style="margin:18px 0 22px">A short video about the studio, the work we do and what it's like to work with us.</p>
<ul class="check-list" data-reveal="up">{checks_html}</ul>
</div>
</div>
</section>

<section class="section">
<div class="container">
<div class="sec-head split">
<div><span class="pill">{ic("star")} Skills</span><h2 data-split style="margin-top:18px">What we're good at.</h2></div>
<p data-reveal="up">The skills we use every week, and how comfortable we are with each.</p>
</div>
<div class="skill-grid skills" data-about="skill">{skills_html}</div>
</div>
</section>

<section class="section section-sky" data-about-section="journey" hidden>
<div class="container">
<div class="sec-head"><span class="pill">{ic("award")} Background</span><h2 data-split>Education and experience.</h2></div>
<div class="journey">
<div data-about-col="education"><h3 class="jh">Education</h3><div class="tl" data-about="education"></div></div>
<div data-about-col="experience"><h3 class="jh">Experience</h3><div class="tl" data-about="experience"></div></div>
</div>
</div>
</section>

<section class="section" data-about-section="achievement" hidden>
<div class="container">
<div class="sec-head"><span class="pill">{ic("award")} Achievements</span><h2 data-split>Awards and milestones.</h2></div>
<div class="achv-grid" data-about="achievement"></div>
</div>
</section>

<section class="section section-sky">
<div class="container">
<div class="sec-head split">
<div><span class="pill">{ic("layers")} Tools</span><h2 data-split style="margin-top:18px">Software we use every day.</h2></div>
<p data-reveal="up">We work in standard tools, so your files will open in any agency or in-house setup.</p>
</div>
<div class="tools" data-reveal="up">{tools_html}</div>
</div>
</section>

<section class="section">
<div class="container">
<div class="sec-head"><span class="pill">{ic("star")} How we like to work</span><h2 data-split>Three habits we stick to.</h2></div>
<div class="values">{values_html}</div>
</div>
</section>

<section class="section section-sky" data-gallery-section hidden>
<div class="container">
<div class="sec-head split">
<div><span class="pill">{ic("image")} Gallery</span><h2 data-split style="margin-top:18px">Tours and achievements.</h2></div>
<p data-reveal="up">A few moments from the road and the stage.</p>
</div>
<div class="filters" data-gfilters role="group" aria-label="Filter gallery">
<button class="filter active" type="button" data-gfilter="all" aria-pressed="true">All photos</button>
<button class="filter" type="button" data-gfilter="tour" aria-pressed="false">Tours</button>
<button class="filter" type="button" data-gfilter="achievement" aria-pressed="false">Achievements</button>
</div>
<div class="work-cols gallery" data-gallery></div>
</div>
</section>

{cta_band("Let's work together.", "Tell us about your project and we'll reply within one business day with next steps.")}
"""
    page("about.html", "About", "About Our Studio: Video, Motion and Design",
         "Meet the studio behind Tanvir.Studio. Skills, background, the tools we use and how we work on video editing, motion graphics and design projects.",
         main, [crumb_schema([("Home", "index.html"), ("About", "about.html")]),
                {"@context": "https://schema.org", "@type": "AboutPage", "url": url("about.html"), "name": "About " + BRAND}])


def build_services():
    blocks = ""
    for s in SERVICES:
        deliver = "".join(f"<li>{ic('check')}<span>{d}</span></li>" for d in s["deliver"])
        use = "".join(f'<span class="chip">{u}</span>' for u in s["use"])
        blocks += f"""<div class="svc-detail" id="{s['id']}">
<div class="side" data-reveal="left">
<div class="svc-ico">{ic(s['icon'])}</div>
<h2>{s['name']}</h2>
<p class="lead">{s['lead']}</p>
<div class="meta-row"><span class="meta">{ic('clock')}{s['draft']}</span><span class="meta">{ic('refresh')}{s['rev']}</span></div>
</div>
<div data-reveal="up">
<h3>What you get</h3>
<ul class="deliver">{deliver}</ul>
<div class="use-block"><h3>Good fit for</h3><div class="svc-tags">{use}</div></div>
<div class="use-block"><h3>Delivery formats</h3><p>{s['formats']}</p></div>
<div class="use-block"><a class="btn" href="pricing.html#{s['key']}">See {s['name'].lower()} pricing {ic('arrow')}</a></div>
</div>
</div>
"""
    cards = [("film", "Video editing", "Reels, ads and brand films"), ("layers", "Motion graphics", "Animation that explains"), ("pen", "Graphic design", "Logos, brands and layouts")]
    main = f"""{page_hero("Our Services", "Video editing, motion graphics and graphic design from one small team.", [("Services", "services.html")], cards)}
<section class="section-tight"><div class="container">{blocks}</div></section>

<section class="section band-navy">
<div class="container">
<div class="sec-head"><span class="pill on-dark">{ic("refresh")} Workflow</span><h2 data-split>How every project runs.</h2></div>
<div class="process">{steps_html()}</div>
</div>
</section>

<section class="section">
<div class="container faq-wrap">
<div class="sticky"><span class="pill">{ic("chat")} FAQ</span><h2 data-split>Service questions.</h2><p data-reveal="up">What people usually ask before sending a brief.</p></div>
{faq_block(FAQS, "services")}
</div>
</section>

{cta_band()}
"""
    svc_ld = [{"@context": "https://schema.org", "@type": "Service", "name": s["name"], "serviceType": s["name"], "description": s["lead"],
               "provider": {"@id": SITE_URL + "/#organization"}, "url": url("services.html") + "#" + s["id"]} for s in SERVICES]
    page("services.html", "Services", "Video, Motion & Graphic Design Services",
         "What we do and what's included: video editing, motion graphics and graphic design for businesses, creators and agencies. Ask for a quote.",
         main, svc_ld + [crumb_schema([("Home", "index.html"), ("Services", "services.html")]), faq_schema(FAQS)])


def build_portfolio():
    filters = '<button class="filter active" type="button" data-filter="all" aria-pressed="true">All work</button>'
    for k, (n, i) in CATS.items():
        filters += f'<button class="filter" type="button" data-filter="{k}" aria-pressed="false">{ic(i)}{n}</button>'
    cards = [("play", "Watch videos here", "No need to leave the page"), ("image", "See designs full size", "Tap any image to enlarge"), ("layers", "Filter by service", "Video, motion or design")]
    main = f"""{page_hero("Our Portfolio", "Videos, animations and designs we've made. Tap any project to watch it or see it full size.", [("Portfolio", "portfolio.html")], cards)}
<section class="section-tight">
<div class="container">
<div class="filters" data-filters role="group" aria-label="Filter portfolio">{filters}</div>
<div class="work-cols" data-work-grid></div>
</div>
</section>
{cta_band("Want something like this?", "Tell us about your project and we'll send you a few examples and a price.")}
"""
    ld = {"@context": "https://schema.org", "@type": "CollectionPage", "name": "Portfolio", "url": url("portfolio.html"),
          "about": ["Video editing", "Motion graphics", "Graphic design"]}
    page("portfolio.html", "Portfolio", "Portfolio: Video, Motion and Design",
         "Watch our video edits and animations and see our design work in full size. Browse the Tanvir.Studio portfolio by service.",
         main, [ld, crumb_schema([("Home", "index.html"), ("Portfolio", "portfolio.html")])])


def build_pricing():
    tabs, panels = "", ""
    for k, (n, i) in CATS.items():
        tabs += f'<button type="button" role="tab" data-tab="panel-{k}" aria-selected="false">{ic(i)}{n}</button>'
        panels += f'<div class="price-panel" id="panel-{k}" role="tabpanel"><div class="plans" data-plans="{k}">{"".join(plan_card(p, k) for p in PLANS[k])}</div></div>'
    rets = [("Creator monthly", "From $599 a month", "Up to 8 edited videos a month for YouTube, Shorts and Reels, thumbnails included."),
            ("Brand monthly", "From $1,290 a month", "Video, motion and design for ongoing campaigns, with priority scheduling."),
            ("Agency partner", "Custom pricing", "Extra production capacity with volume rates and a simple workflow.")]
    ret_html = "".join(f'<div class="ret" data-reveal="up" data-delay="{i * 100}"><h3>{t}</h3><div class="rp">{p}</div><p>{d}</p></div>' for i, (t, p, d) in enumerate(rets))
    pfaq = [FAQS[2], FAQS[3], FAQS[5], FAQS[4]]
    cards = [("dollar", "From $79", "Fixed prices in USD"), ("check", "Scope in writing", "No surprises later"), ("refresh", "Changes included", "2 to 5 revision rounds")]
    main = f"""{page_hero("Pricing", "Fixed packages in USD. You'll know what you're paying and what you're getting before we start.", [("Pricing", "pricing.html")], cards)}
<section class="section-tight">
<div class="container">
<div class="seg" role="tablist" aria-label="Choose a service"><span class="slider" aria-hidden="true"></span>{tabs}</div>
{panels}
<div class="note-box" data-reveal="up">{ic("dollar")}<p><strong>Prices are starting points.</strong> Send us your brief and we'll confirm the exact price before you pay anything. Rush delivery and extra revision rounds can be added.</p></div>
</div>
</section>

<section class="section section-sky">
<div class="container">
<div class="sec-head split"><div><span class="pill">{ic("calendar")} Monthly plans</span><h2 data-split style="margin-top:18px">Need work every month?</h2></div><p data-reveal="up">If you post every week or run constant campaigns, a monthly plan saves time and gets you faster turnaround.</p></div>
<div class="retainer">{ret_html}</div>
</div>
</section>

<section class="section">
<div class="container faq-wrap">
<div class="sticky"><span class="pill">{ic("chat")} FAQ</span><h2 data-split>Pricing questions.</h2><p data-reveal="up">How billing, changes and ownership work.</p></div>
{faq_block(pfaq, "pricing")}
</div>
</section>
{cta_band("Need a custom quote?", "Describe your project and we'll send a price within one business day.")}
"""
    offers = []
    for k, (n, i) in CATS.items():
        for p in PLANS[k]:
            offers.append({"@type": "Offer", "name": f"{n} {p['n']}", "price": str(p["p"]), "priceCurrency": "USD", "description": p["d"],
                           "url": url("pricing.html") + "#" + k, "availability": "https://schema.org/InStock", "seller": {"@id": SITE_URL + "/#organization"}})
    ld = {"@context": "https://schema.org", "@type": "OfferCatalog", "name": BRAND + " service packages", "itemListElement": offers}
    page("pricing.html", "Pricing", "Pricing: Video, Motion & Design Packages",
         "Clear USD prices for video editing, motion graphics and graphic design. Compare the Starter, Professional and Premium packages.",
         main, [ld, crumb_schema([("Home", "index.html"), ("Pricing", "pricing.html")]), faq_schema(pfaq)])


def build_contact():
    cfaq = [FAQS[1], FAQS[4], FAQS[6]]
    cards = [("clock", "Reply in 1 business day", "Usually much sooner"), ("whatsapp", "Chat on WhatsApp", "Quick answers, any time"), ("dollar", "Free quote", "No payment to get a price")]
    main = f"""{page_hero("Contact Us", "Tell us about your project. We reply within one business day.", [("Contact", "contact.html")], cards)}
<section class="section-tight" id="form">
<div class="container contact-grid">
<div data-reveal="left">
<span class="pill">{ic("chat")} Get in touch</span>
<h2 style="margin-top:18px">Contact details</h2>
<p style="margin-top:14px">Email, WhatsApp or the form. Use whichever is easiest for you.</p>
<div class="c-list">
<div class="c-item"><span class="ico">{ic("mail")}</span><div><b>Email</b><a href="mailto:{EMAIL}" data-s="email" data-s-text>{EMAIL}</a></div></div>
<div class="c-item"><span class="ico wa-ico">{ic("whatsapp", "ic-fill")}</span><div><b>WhatsApp</b><a href="{wa()}" data-s="whatsapp" data-s-text target="_blank" rel="noopener">{WHATSAPP}</a></div></div>
<div class="c-item"><span class="ico">{ic("phone")}</span><div><b>Phone</b><a href="tel:{PHONE}" data-s="phone" data-s-text>{PHONE}</a></div></div>
<div class="c-item"><span class="ico">{ic("pin")}</span><div><b>Studio</b><span data-s="location" data-s-text>{LOCATION}</span></div></div>
</div>
<a class="btn btn-wa" href="{wa()}" data-s="whatsapp" target="_blank" rel="noopener" data-magnetic>{ic("whatsapp", "ic-fill")} Chat on WhatsApp</a>
<div style="margin-top:32px"><b style="font-family:Sora,sans-serif">Follow us</b><div style="margin-top:14px">{socials("light")}</div></div>
</div>

<form class="form" id="contact-form" data-reveal="right" data-email="{EMAIL}" data-endpoint="{FORM_ENDPOINT}" novalidate>
<div class="form-body">
<h2>Tell us about your project</h2>
<p>The more you share, the better our first reply will be. Your message goes straight to our inbox.</p>
<div class="form-grid">
<div class="field" data-required><label for="f-name">Full name</label><input id="f-name" name="name" type="text" autocomplete="name" placeholder="Your name"><span class="msg">Please enter your name.</span></div>
<div class="field" data-required><label for="f-email">Email address</label><input id="f-email" name="email" type="email" autocomplete="email" placeholder="you@company.com"><span class="msg">Please enter a valid email address.</span></div>
<div class="field"><label for="f-company">Company or channel</label><input id="f-company" name="company" type="text" autocomplete="organization" placeholder="Optional"></div>
<div class="field" data-required><label for="f-service">What do you need?</label><select id="f-service" name="service"><option value="">Select a service</option><option>Video Editing</option><option>Motion Graphics</option><option>Graphic Design</option><option>More than one</option></select><span class="msg">Please choose a service.</span></div>
<div class="field full"><span class="lab" id="l-budget">Budget (USD)</span><div class="choices" role="group" aria-labelledby="l-budget">
<label class="choice"><input type="radio" name="budget" value="Under $500"><span>Under $500</span></label>
<label class="choice"><input type="radio" name="budget" value="$500 to $1,500"><span>$500 to $1,500</span></label>
<label class="choice"><input type="radio" name="budget" value="$1,500 to $5,000"><span>$1,500 to $5,000</span></label>
<label class="choice"><input type="radio" name="budget" value="$5,000 and above"><span>$5,000 and above</span></label>
</div></div>
<div class="field full"><label for="f-timeline">When do you need it?</label><select id="f-timeline" name="timeline"><option value="">Select a timeline</option><option>Urgent, under 1 week</option><option>1 to 2 weeks</option><option>2 to 4 weeks</option><option>No rush</option></select></div>
<div class="field full" data-required><label for="f-message">About your project</label><textarea id="f-message" name="message" placeholder="What are you making, who is it for, and do you have references or links to share?"></textarea><span class="msg">Please add a few details about your project.</span></div>
<input class="hp" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">
</div>
<div class="form-foot"><small>We keep your details private and sign an NDA on request.</small><button class="btn" type="submit" data-magnetic>Send message {ic("send")}</button></div>
</div>
<div class="form-ok" role="status"><div class="big">{ic("check")}</div><h2>Thank you</h2><p class="ok-text" style="margin-top:10px">Your message has been sent. We'll reply within one business day.</p></div>
</form>
</div>
</section>

<section class="section">
<div class="container">
<div class="sec-head split"><div><span class="pill">{ic("pin")} Visit us</span><h2 data-split style="margin-top:18px">Find our studio.</h2></div><p data-reveal="up">We're in Mirpur 12, Dhaka. Message us first so we can set aside time for you.</p></div>
<div class="map-wrap" data-reveal="up">
<div class="map-card"><b>{BRAND}</b><span data-s="location" data-s-text>{LOCATION}</span><a href="{MAP_LINK}" data-s="maplink" target="_blank" rel="noopener">Open in Google Maps {ic("external")}</a></div>
<iframe src="{MAP_EMBED}" data-s="map" title="{BRAND} location on Google Maps" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
</div>
</div>
</section>

<section class="section section-sky">
<div class="container faq-wrap">
<div class="sticky"><span class="pill">{ic("chat")} FAQ</span><h2 data-split>Before you write.</h2><p data-reveal="up">A few quick answers.</p></div>
{faq_block(cfaq, "contact")}
</div>
</section>
"""
    ld = {"@context": "https://schema.org", "@type": "ContactPage", "url": url("contact.html"), "name": "Contact " + BRAND,
          "mainEntity": {"@id": SITE_URL + "/#organization"}}
    page("contact.html", "Contact", "Contact Us: Start a Video or Design Project",
         "Send us your brief or chat on WhatsApp. Tanvir.Studio replies within one business day with questions, ideas and a price.",
         main, [ld, crumb_schema([("Home", "index.html"), ("Contact", "contact.html")]), faq_schema(cfaq)])



def fmt_date(d):
    y, m, dd = d.split("-")
    months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    return f"{months[int(m) - 1]} {int(dd)}, {y}"


# ----------------------------------------------------------------------
# CMS tagging: every editable text gets data-cms="page:slug" and is listed
# in assets/js/cms-manifest.js so the admin dashboard can edit it.
# ----------------------------------------------------------------------
MANIFEST = {"pages": {}}
PAGE_LABELS = {
    "404": ("Page not found", "404.html"),
    "home": ("Home", "index.html"), "about": ("About", "about.html"), "services": ("Services", "services.html"),
    "portfolio": ("Portfolio", "portfolio.html"), "pricing": ("Pricing", "pricing.html"), "contact": ("Contact", "contact.html"),
    "blog": ("Blog page", "blog.html"), "post": ("Blog article template", "blog/[article]"), "shared": ("Header and footer (all pages)", "every page"),
}
CMS_TAGS = {"h1", "h2", "h3", "h4", "p", "span", "a", "button", "li", "small", "label", "blockquote", "strong", "b", "em", "div"}
SKIP_TAGS = {"script", "style", "svg", "noscript", "select", "option", "textarea", "title", "head"}
SKIP_CLASSES = {"preloader", "viewer", "map-card", "foot-word", "marquee", "logo", "crumbs", "form-ok", "hp", "faq", "c-list",
                "socials", "foot-contact", "seg", "filters", "skip-link", "post-grid", "plans", "cat", "typed", "caret", "gfilters"}
SKIP_ATTRS = ("data-plans", "data-work-grid", "data-work-feature", "data-blog-list", "data-faq", "data-about", "data-gallery")
_global_keys = set()


def _slug(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:46] or "text"


def _eligible(el):
    if el.name not in CMS_TAGS:
        return None
    if any(el.has_attr(a) for a in ("data-s-text", "data-year", "data-tz")):
        return None
    for node in [el] + list(el.parents):
        if getattr(node, "name", None) in SKIP_TAGS:
            return None
        if set(node.get("class", []) if hasattr(node, "get") else []) & SKIP_CLASSES:
            return None
        if hasattr(node, "attrs") and any(a in node.attrs for a in SKIP_ATTRS):
            return None
    texts = [c for c in el.children if isinstance(c, NavigableString) and not isinstance(c, Comment) and c.strip()]
    if len(texts) != 1:
        return None
    for c in el.children:
        if getattr(c, "name", None) and c.get_text(strip=True):
            return None
    text = re.sub(r"\s+", " ", texts[0]).strip()
    if "{{" in text or len(text) < 2 or len(text) > 600:
        return None
    return text


def cmsify(html, page_key, title, desc):
    soup = BeautifulSoup(html, "html.parser")
    body = soup.body
    used = {}
    section = ""
    fields = MANIFEST["pages"].setdefault(page_key, {"label": PAGE_LABELS[page_key][0], "file": PAGE_LABELS[page_key][1], "fields": []})
    gfields = MANIFEST["pages"].setdefault("shared", {"label": PAGE_LABELS["shared"][0], "file": PAGE_LABELS["shared"][1], "fields": []})
    for el in list(body.find_all(True)):
        if el.name in ("h1", "h2") and el.get_text(strip=True) and "{{" not in el.get_text():
            section = re.sub(r"\s+", " ", el.get_text(" ", strip=True))[:70]
        if el.has_attr("data-cms-attr"):
            attr = el["data-cms-attr"]
            key = f"{page_key}:{attr.replace('data-', '')}"
            el["data-cms"] = key
            fields["fields"].append({"key": key, "text": el.get(attr, ""), "tag": "span", "section": "Headline typing words", "multiline": False,
                                     "label": "Words that type out in the headline", "hint": "Separate each phrase with the | symbol. They type one after another."})
            continue
        text = _eligible(el)
        if text is None:
            continue
        is_global = el.find_parent(["header", "footer"]) is not None
        prefix = "shared" if is_global else page_key
        key = f"{prefix}:{_slug(text)}"
        used[key] = used.get(key, 0) + 1
        if used[key] > 1:
            key = f"{key}-{used[key]}"
        el["data-cms"] = key
        entry = {"key": key, "text": text, "tag": el.name, "section": "Header and footer" if is_global else section,
                 "multiline": el.name in ("p", "blockquote") or len(text) > 70}
        if is_global:
            if key not in _global_keys:
                _global_keys.add(key)
                gfields["fields"].append(entry)
        else:
            fields["fields"].append(entry)
    if page_key != "post":
        full = title if BRAND in title else f"{title} | {BRAND}"
        MANIFEST["pages"][page_key]["seo"] = {"title": full, "description": desc}
    return str(soup)


# ----------------------------------------------------------------------
# Blog (loaded from Supabase) and the server rendered article template
# ----------------------------------------------------------------------
def fmt_date(d):
    y, m, dd = d.split("-")
    months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    return f"{months[int(m) - 1]} {int(dd)}, {y}"


def build_blog():
    main = f"""{page_hero("Our Blog", "Practical notes on video, motion and design, written for people who commission and make creative work.", [("Blog", "blog.html")], [("film", "Video tips", "Briefs, edits and feedback"), ("layers", "Motion ideas", "When animation helps"), ("pen", "Design advice", "Brands that stay consistent")])}
<section class="section-tight">
<div class="container">
<div data-blog-list><div class="empty-note"><h3>Loading articles</h3><p>Please wait a moment.</p></div></div>
<noscript><p>Please enable JavaScript to read our articles.</p></noscript>
<div class="news mt-l" data-reveal="up">
<div><h2 style="font-size:clamp(1.6rem,2.8vw,2.3rem)">Get new articles by email.</h2><p style="margin-top:10px">Short, useful tips on video, motion and design. No spam.</p></div>
<form data-newsletter><input type="email" aria-label="Email address" placeholder="Your email address" required><button class="btn" type="submit">Subscribe {ic('send')}</button></form>
</div>
</div>
</section>
"""
    ld = {"@context": "https://schema.org", "@type": "Blog", "name": BRAND + " Blog", "url": url("blog.html")}
    page("blog.html", "Blog", "Blog: Video, Motion and Design Tips",
         "Practical articles on video editing, motion graphics, brand identity and working with a remote creative studio.",
         main, [ld, crumb_schema([("Home", "index.html"), ("Blog", "blog.html")])])


def build_post_template():
    h = head("{{TITLE}}", "{{DESC}}", "{{PATH}}", [org_schema(), site_schema()], "article", "{{PUBLISHED}}", "post")
    h = h.replace("<head>\n", '<head>\n<base href="/">\n', 1).replace("</head>", "{{LD}}\n</head>")
    main = f"""<section class="page-hero sm">
<div class="deco" aria-hidden="true"><i class="d1"></i><i class="d2"></i><i class="d3"></i><i class="d4"></i></div>
<div class="container">
<nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a>{ic('chevron')}<a href="blog.html">Blog</a>{ic('chevron')}<span aria-current="page">{{{{CATEGORY}}}}</span></nav>
<div><span class="cat" style="margin-bottom:20px;background:#fff">{{{{CATEGORY}}}}</span></div>
<h1 data-split>{{{{TITLE_HTML}}}}</h1>
<div class="post-meta" data-reveal="up" data-delay="400"><span>{ic('calendar')}{{{{DATE}}}}</span><span>{ic('clock')}{{{{READ}}}}</span><span>{ic('pen')}By {BRAND}</span></div>
</div>
</section>
<section class="section-tight">
<div class="container">
{{{{COVER}}}}
<article class="article">
{{{{CONTENT}}}}
<div class="post-cta"><h3>Need help with a project like this?</h3><p>We edit videos, animate ideas and design brands.</p><div class="hero-cta"><a class="btn btn-sm" href="contact.html">Contact</a><a class="btn btn-sm btn-ghost" href="services.html">See our services</a></div></div>
<div class="share"><span>Share this article</span>
<div class="socials light"><a href="https://www.linkedin.com/sharing/share-offsite/?url={{{{SHARE_URL}}}}" target="_blank" rel="noopener" aria-label="Share on LinkedIn">{ic('linkedin')}</a><a href="https://www.facebook.com/sharer/sharer.php?u={{{{SHARE_URL}}}}" target="_blank" rel="noopener" aria-label="Share on Facebook">{ic('facebook')}</a></div></div>
</article>
</div>
</section>
<!--REL_START-->
<section class="section">
<div class="container">
<div class="sec-head"><h2 data-split>Keep reading.</h2></div>
<div class="post-grid" style="grid-template-columns:repeat(2,1fr);margin-top:0">{{{{RELATED}}}}</div>
</div>
</section>
<!--REL_END-->
{cta_band()}
"""
    html = h + "<body>\n" + header("Blog") + '<main id="main">\n' + main + "\n</main>\n" + footer()
    html = cmsify(html, "post", "", "")
    html = html.replace('href="#main"', 'href="/{{PATH}}#main"').replace(SITE_URL, "{{ORIGIN}}")
    write("lib/template.js", "// Generated by build/build.py. Do not edit.\nmodule.exports = " + json.dumps(html) + ";\n")


# ----------------------------------------------------------------------
# Seed data for Supabase (demo content you can edit or delete in the dashboard)
# ----------------------------------------------------------------------
DEMO_WORK = [
    ("Story Edit", "video", "https://www.youtube.com/watch?v=eRsGyueVLvQ", "", "Story driven edit with pacing, color and sound design.", True),
    ("Logo Reveal Animation", "motion", "https://res.cloudinary.com/demo/video/upload/dog.mp4", "16:9", "Short animated reveal prepared for social and video intros.", True),
    ("Brand Identity Concept", "design", "https://res.cloudinary.com/demo/image/upload/sample.jpg", "", "Visual identity concept with color and layout system.", True),
    ("Trailer Style Edit", "video", "https://www.youtube.com/watch?v=HOfdboHvshg", "", "Fast paced trailer cut with titles and sound mix.", True),
    ("Explainer Animation", "motion", "https://www.youtube.com/watch?v=TLkA0RELQ1g", "", "Animated storytelling for products and ideas.", True),
    ("Campaign Visual", "design", "https://res.cloudinary.com/demo/image/upload/cld-sample.jpg", "", "Campaign artwork prepared for web and print.", True),
    ("Feature Sequence Edit", "video", "https://www.youtube.com/watch?v=YE7VzlLtp-4", "", "Multi scene sequence with refined transitions.", False),
    ("Animated Short", "motion", "https://www.youtube.com/watch?v=Y-rmzh0PI3c", "", "Motion piece with custom timing and effects.", False),
    ("Social Media Kit", "design", "https://res.cloudinary.com/demo/image/upload/cld-sample-2.jpg", "", "Templates and post designs for consistent branding.", False),
    ("Sci-fi Sequence Edit", "video", "https://www.youtube.com/watch?v=R6MlUcmOul8", "", "Visual effects heavy edit with color grade.", False),
    ("Packaging Concept", "design", "https://res.cloudinary.com/demo/image/upload/cld-sample-3.jpg", "", "Packaging and label design concept.", False),
    ("Poster Series", "design", "https://res.cloudinary.com/demo/image/upload/cld-sample-4.jpg", "", "Poster artwork series for events and campaigns.", False),
]
FAQ_SHOW = {0: ["home", "services"], 1: ["home", "services", "contact"], 2: ["home", "services", "pricing"], 3: ["home", "services", "pricing"],
            4: ["home", "services", "pricing", "contact"], 5: ["services", "pricing"], 6: ["services", "contact"]}


def q(v):
    return "$q$" + str(v) + "$q$"


def post_html(p):
    out = ""
    for kind, val in p["body"]:
        if kind == "p":
            out += f"<p>{val}</p>\n"
        elif kind == "h2":
            out += f"<h2>{val}</h2>\n"
        elif kind == "ul":
            out += "<ul>" + "".join(f"<li>{x}</li>" for x in val) + "</ul>\n"
        elif kind == "quote":
            out += f"<blockquote>{val}</blockquote>\n"
    return out.strip()


def build_seed():
    sql = ["-- =====================================================================",
           "-- Tanvir.Studio CMS | demo content (run this SECOND, after 01_schema.sql)",
           "-- Everything here can be edited or deleted from the admin dashboard.",
           "-- Generated by build/build.py. Safe to run once; it skips tables that already have rows.",
           "-- =====================================================================", ""]
    sql.append("do $seed$ begin")
    sql.append("if not exists (select 1 from public.portfolio_items) then insert into public.portfolio_items (title, category, url, thumb, aspect, description, featured, sort_order) values")
    sql.append(",\n".join(f"({q(t)}, {q(c)}, {q(u)}, '', {q(a)}, {q(d)}, {'true' if f else 'false'}, {i})" for i, (t, c, u, a, d, f) in enumerate(DEMO_WORK)) + ";")
    sql.append("end if;")
    sql.append("if not exists (select 1 from public.pricing_plans) then insert into public.pricing_plans (service, name, price, unit, description, features, is_popular, sort_order) values")
    rows = []
    n = 0
    for k in CATS:
        for p in PLANS[k]:
            feats = "array[" + ", ".join(q(f) for f in p["f"]) + "]::text[]"
            rows.append(f"({q(k)}, {q(p['n'])}, {p['p']}, {q(p['u'])}, {q(p['d'])}, {feats}, {'true' if p.get('hot') else 'false'}, {n})")
            n += 1
    sql.append(",\n".join(rows) + ";")
    sql.append("end if;")
    sql.append("if not exists (select 1 from public.faqs) then insert into public.faqs (question, answer, show_on, sort_order) values")
    sql.append(",\n".join(f"({q(a)}, {q(b)}, array[{', '.join(q(x) for x in FAQ_SHOW[i])}]::text[], {i})" for i, (a, b) in enumerate(FAQS)) + ";")
    sql.append("end if;")
    sql.append("if not exists (select 1 from public.about_items) then insert into public.about_items (kind, title, level, sort_order) values")
    sql.append(",\n".join(f"('skill', {q(n)}, {v}, {i})" for i, (n, v) in enumerate(SKILLS)) + ";")
    sql.append("end if;")
    sql.append("end $seed$;")
    sql.append("")
    sql.append("insert into public.blog_posts (slug, title, excerpt, category, cover_url, content, read_time, seo_title, seo_description, published, published_at) values")
    rows = []
    for p in POSTS:
        rows.append(f"({q(p['slug'])}, {q(p['title'])}, {q(p['excerpt'])}, {q(p['cat'])}, '', {q(post_html(p))}, {q(p['read'])}, {q(p['title'] + ' | ' + BRAND)}, {q(p['desc'])}, true, {q(p['date'] + 'T09:00:00Z')})")
    sql.append(",\n".join(rows) + "\non conflict (slug) do nothing;")
    sql.append("")
    sql.append("insert into public.site_content (key, value) values ('settings.hero_video', 'https://www.youtube.com/watch?v=HOfdboHvshg') on conflict (key) do nothing;")
    write("supabase/02_seed.sql", "\n".join(sql) + "\n")


def build_extras():
    write("site.webmanifest", json.dumps({"name": BRAND, "short_name": "Tanvir", "start_url": "/", "display": "standalone",
                                           "background_color": "#ffffff", "theme_color": "#2252ff",
                                           "icons": [{"src": "assets/img/favicon.svg", "sizes": "any", "type": "image/svg+xml"}, {"src": "assets/img/icon-192.png", "sizes": "192x192", "type": "image/png"}, {"src": "assets/img/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable"}]}, indent=2))
    mark = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="12" fill="#2252ff"/><path d="M15 11.5v17l14-8.5z" fill="#fff"/><circle cx="31" cy="10" r="3.5" fill="#22c7ff"/></svg>'
    write("assets/img/favicon.svg", mark)
    write("assets/img/logo.svg", mark)
    order = ["home", "about", "services", "portfolio", "pricing", "contact", "blog", "post", "shared"]
    pages = {k: MANIFEST["pages"][k] for k in order if k in MANIFEST["pages"]}
    write("assets/js/cms-manifest.js", "/* Generated by build/build.py. Do not edit. */\nwindow.TS_MANIFEST = " + json.dumps({"pages": pages}, ensure_ascii=False, indent=1) + ";\n")


def build_icons():
    """PNG icons for iPhone/Android home screens and social previews (needs Pillow)."""
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        return
    for size, name in ((180, "apple-touch-icon.png"), (192, "icon-192.png"), (512, "icon-512.png")):
        scale = size / 40.0
        im = Image.new("RGB", (size, size), "#2252ff")
        d = ImageDraw.Draw(im)
        d.polygon([(15 * scale, 11.5 * scale), (15 * scale, 28.5 * scale), (29 * scale, 20 * scale)], fill="#ffffff")
        d.ellipse((27.5 * scale, 6.5 * scale, 34.5 * scale, 13.5 * scale), fill="#22c7ff")
        path = os.path.join(OUT, "assets/img", name)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        im.save(path, optimize=True)


def build_404():
    main = f"""<section class="page-hero" data-word="404">
<div class="container ph-grid ph-solo">
<div class="ph-main">
<h1>Page not found</h1>
<p class="lead">The page you're looking for has moved or doesn't exist. Try one of these instead.</p>
<div class="hero-cta" style="margin-top:26px"><a class="btn" href="index.html">Go to the home page {ic("arrow")}</a><a class="btn btn-ghost" href="portfolio.html">See our work</a><a class="btn btn-ghost" href="contact.html">Contact</a></div>
</div>
</div>
</section>
"""
    page("404.html", "", "Page Not Found", "The page you were looking for could not be found. Go back to the Tanvir.Studio home page, browse our work or contact us.", main, [])
    full = os.path.join(OUT, "404.html")
    html = open(full, encoding="utf-8").read().replace("index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1", "noindex, follow")
    html = html.replace('<head>', '<head>\n<base href="/">', 1)
    open(full, "w", encoding="utf-8").write(html)


def main():
    build_home()
    build_about()
    build_services()
    build_portfolio()
    build_pricing()
    build_contact()
    build_blog()
    build_post_template()
    build_404()
    build_seed()
    build_extras()
    build_icons()
    total = sum(len(v["fields"]) for v in MANIFEST["pages"].values())
    print("Built site into", OUT, "| editable text fields:", total)


if __name__ == "__main__":
    main()
