/* ==========================================================
   TANVIR.STUDIO  |  SITE CONTENT (edit this file)
   ----------------------------------------------------------
   1) heroVideo   : YouTube link shown on the home page hero.
   2) aboutPhoto  : Optional Cloudinary / image link for the About page.
   3) portfolio   : Your projects. Paste ANY of these links in "url":
        - YouTube link  (watch, youtu.be, shorts)
        - Google Drive video/file link (set sharing to "Anyone with the link")
        - Cloudinary image link  (res.cloudinary.com/.../image/upload/...)
        - Cloudinary video link  (res.cloudinary.com/.../video/upload/...mp4)
        - Vimeo link or a direct .mp4 / image link
      category: "video"  |  "motion"  |  "design"
      aspect (optional): "16:9", "9:16", "1:1", "4:5" or "auto"
      thumb  (optional): a cover image link. YouTube and Cloudinary
                          covers are created automatically.
   TIP: open portfolio-editor.html to generate this list easily.
   The first 6 projects are also shown on the home page.
   NOTE: the links below are DEMO samples. Replace them with your own work.
   ========================================================== */
window.SITE_DATA = {
  heroVideo: "https://www.youtube.com/watch?v=HOfdboHvshg",
  aboutPhoto: "",
  portfolio: [
    { title: "Story Edit", category: "video", url: "https://www.youtube.com/watch?v=eRsGyueVLvQ", description: "Story driven edit with pacing, colour and sound design." },
    { title: "Logo Reveal Animation", category: "motion", url: "https://res.cloudinary.com/demo/video/upload/dog.mp4", aspect: "16:9", description: "Short animated reveal prepared for social and video intros." },
    { title: "Brand Identity Concept", category: "design", url: "https://res.cloudinary.com/demo/image/upload/sample.jpg", description: "Visual identity concept with colour and layout system." },
    { title: "Trailer Style Edit", category: "video", url: "https://www.youtube.com/watch?v=HOfdboHvshg", description: "Fast paced trailer cut with titles and sound mix." },
    { title: "Explainer Animation", category: "motion", url: "https://www.youtube.com/watch?v=TLkA0RELQ1g", description: "Animated storytelling for products and ideas." },
    { title: "Campaign Visual", category: "design", url: "https://res.cloudinary.com/demo/image/upload/cld-sample.jpg", description: "Campaign artwork prepared for web and print." },
    { title: "Feature Sequence Edit", category: "video", url: "https://www.youtube.com/watch?v=YE7VzlLtp-4", description: "Multi scene sequence with refined transitions." },
    { title: "Animated Short", category: "motion", url: "https://www.youtube.com/watch?v=Y-rmzh0PI3c", description: "Motion piece with custom timing and effects." },
    { title: "Social Media Kit", category: "design", url: "https://res.cloudinary.com/demo/image/upload/cld-sample-2.jpg", description: "Templates and post designs for consistent branding." },
    { title: "Sci-fi Sequence Edit", category: "video", url: "https://www.youtube.com/watch?v=R6MlUcmOul8", description: "Visual effects heavy edit with colour grade." },
    { title: "Packaging Concept", category: "design", url: "https://res.cloudinary.com/demo/image/upload/cld-sample-3.jpg", description: "Packaging and label design concept." },
    { title: "Poster Series", category: "design", url: "https://res.cloudinary.com/demo/image/upload/cld-sample-4.jpg", description: "Poster artwork series for events and campaigns." }
  ]
};
