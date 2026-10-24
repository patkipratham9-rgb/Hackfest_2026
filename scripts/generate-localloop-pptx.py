import sys
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_deck(output_path):
    prs = Presentation()
    # 16:9 Widescreen slides
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Color Palette
    C_FOREST = RGBColor(27, 56, 43)       # #1B382B - Deep Forest Green
    C_FOREST_LIGHT = RGBColor(39, 76, 60) # #274C3C - Forest Accent
    C_TERRACOTTA = RGBColor(224, 90, 54)  # #E05A36 - Vibrant Terracotta
    C_CREAM = RGBColor(251, 248, 243)     # #FBF8F3 - Warm Cream BG
    C_WHITE = RGBColor(255, 255, 255)     # #FFFFFF
    C_DARK = RGBColor(32, 35, 31)         # #20231F - Charcoal Text
    C_MUTED = RGBColor(114, 119, 111)     # #72776F - Subtitle text
    C_GOLD = RGBColor(212, 163, 115)      # #D4A373 - Accent Gold
    C_CARD_BG = RGBColor(245, 243, 238)   # Card container background
    C_CARD_BORDER = RGBColor(222, 223, 214)

    def set_slide_background(slide, color):
        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = color

    def add_header(slide, title_text, category_text="LOCALLOOP • HUBLI-DHARWAD HACKFEST 2026", light=False):
        header_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(1.1))
        tf = header_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        
        p_cat = tf.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.size = Pt(10)
        p_cat.font.bold = True
        p_cat.font.color.rgb = C_TERRACOTTA if not light else C_GOLD
        p_cat.space_after = Pt(4)

        p_title = tf.add_paragraph()
        p_title.text = title_text
        p_title.font.size = Pt(24)
        p_title.font.bold = True
        p_title.font.color.rgb = C_FOREST if not light else C_WHITE

    def add_card(slide, left, top, width, height, title, items, badge="", bg_color=C_CARD_BG, border_color=C_CARD_BORDER, title_color=C_FOREST):
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = bg_color
        shape.line.color.rgb = border_color
        shape.line.width = Pt(1.5)

        tb = slide.shapes.add_textbox(left + Inches(0.25), top + Inches(0.2), width - Inches(0.5), height - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p0 = tf.paragraphs[0]
        if badge:
            p0.text = badge.upper()
            p0.font.size = Pt(9)
            p0.font.bold = True
            p0.font.color.rgb = C_TERRACOTTA
            p0.space_after = Pt(2)
            p_title = tf.add_paragraph()
        else:
            p_title = p0

        p_title.text = title
        p_title.font.size = Pt(15)
        p_title.font.bold = True
        p_title.font.color.rgb = title_color
        p_title.space_after = Pt(10)

        for item in items:
            p_item = tf.add_paragraph()
            p_item.text = f"•  {item}"
            p_item.font.size = Pt(11)
            p_item.font.color.rgb = C_DARK if bg_color != C_FOREST else C_WHITE
            p_item.space_after = Pt(6)

    # -------------------------------------------------------------
    # SLIDE 1: TITLE SLIDE (Hero Dark Green)
    # -------------------------------------------------------------
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1, C_FOREST)

    # Logo Mark
    logo_bg = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(1.3), Inches(0.9), Inches(0.9))
    logo_bg.fill.solid()
    logo_bg.fill.fore_color.rgb = C_TERRACOTTA
    logo_bg.line.fill.background()
    ltb = s1.shapes.add_textbox(Inches(1.0), Inches(1.3), Inches(0.9), Inches(0.9))
    ltf = ltb.text_frame
    ltf.margin_top = Inches(0.08)
    lp = ltf.paragraphs[0]
    lp.text = "L"
    lp.alignment = PP_ALIGN.CENTER
    lp.font.size = Pt(40)
    lp.font.bold = True
    lp.font.color.rgb = C_WHITE

    # Title Box
    t_box = s1.shapes.add_textbox(Inches(1.0), Inches(2.4), Inches(11.3), Inches(3.2))
    ttf = t_box.text_frame
    ttf.word_wrap = True

    p0 = ttf.paragraphs[0]
    p0.text = "LocalLoop • Digital Titans"
    p0.font.size = Pt(14)
    p0.font.bold = True
    p0.font.color.rgb = C_GOLD
    p0.space_after = Pt(8)

    p1 = ttf.add_paragraph()
    p1.text = "Your City’s Hyperlocal Digital Marketplace."
    p1.font.size = Pt(36)
    p1.font.bold = True
    p1.font.color.rgb = C_WHITE
    p1.space_after = Pt(6)

    p2 = ttf.add_paragraph()
    p2.text = "Connecting authentic corner shops across Hubli-Dharwad with citywide shoppers."
    p2.font.size = Pt(20)
    p2.font.italic = True
    p2.font.color.rgb = C_TERRACOTTA
    p2.space_after = Pt(18)

    p3 = ttf.add_paragraph()
    p3.text = "Full-Stack Next.js 15 • Mobile Apps • Cashfree Hosted Payments • Firebase Phone OTP • 14 AI APIs • 908 Passing Tests"
    p3.font.size = Pt(12)
    p3.font.color.rgb = RGBColor(200, 210, 205)

    # Footer note
    f_box = s1.shapes.add_textbox(Inches(1.0), Inches(6.4), Inches(11.3), Inches(0.5))
    ftf = f_box.text_frame
    fp = ftf.paragraphs[0]
    fp.text = "Hackfest 2026 Presentation • Team Digital Titans • Lead: Pratham Patki (KLE Tech)"
    fp.font.size = Pt(11)
    fp.font.color.rgb = RGBColor(160, 180, 170)

    # -------------------------------------------------------------
    # SLIDE 2: THE PROBLEM & OUR SOLUTION
    # -------------------------------------------------------------
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2, C_CREAM)
    add_header(s2, "Hyperlocal Commerce: The Problem & LocalLoop Solution")

    add_card(s2, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             "The Tier-2/3 Hyperlocal Challenge", [
                 "Monopolistic Aggregators: 15% to 30% predatory commissions crush local corner shops and small artisans.",
                 "Erosion of Local Identity: Generic dark stores and algorithm-driven giants bypass historical Hubballi-Dharwad heritage.",
                 "High Delivery Markups: Shoppers pay extra delivery fees, surge pricing, and inflated catalog prices.",
                 "Complex Onboarding: Small mom-and-pop shops lack IT teams, POS integrations, and digital catalog pipelines."
             ], badge="MARKET GAP", border_color=RGBColor(240, 160, 140))

    add_card(s2, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.8), 
             "The LocalLoop Hyperlocal Answer", [
                 "0% Marketplace Commission: Corner shops retain 100% of their earnings with fair platform flat fees.",
                 "Dual Fulfillment Model: 1. Express 20-Min Counter Pick-up with QR/PIN and 2. Home Delivery via Map4Me.",
                 "Authentic Heritage Focus: Dedicated hubs for Dharwad Pedha, Mishra Sweets, Ilkal Sarees, and local spices.",
                 "AI-Powered Merchant Enablement: Multimodal listing generator, vision tagging, and auto-learning sales models."
             ], badge="OUR SOLUTION", bg_color=C_WHITE, border_color=C_FOREST_LIGHT)

    # -------------------------------------------------------------
    # SLIDE 3: APPLICATION SEPARATION & TWO DISTINCT APPS
    # -------------------------------------------------------------
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3, C_CREAM)
    add_header(s3, "Two Dedicated Applications: Shopper vs. Merchant")

    add_card(s3, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8),
             "User / Shopper Application (/)", [
                 "Hyperlocal Discovery: Pinpoint neighborhood browsing (Vidyanagar, Station Road, CBT Bus Stand).",
                 "Voice Search & Speech: Speech-to-Text (Mic) and spoken Text-to-Speech (Speaker) inside the search bar.",
                 "Cart & Dual Fulfillment: 1-tap cart with Home Delivery & Express Counter Slot Pick-up options.",
                 "Live Status & Pickup PIN: 4-stage tracking (Placed → Packed → Ready → Completed) with counter verification token.",
                 "Dedicated Phone App: Native Android flavor (com.localloop.user)."
             ], badge="SHOPPER EXPERIENCE", bg_color=C_WHITE)

    add_card(s3, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.8),
             "Merchant Cockpit Application (/seller)", [
                 "Separate Interface: Clean seller portal completely stripped of consumer categories, cart, and reorder tabs.",
                 "Live Order Pipeline: Kanban fulfillment board with counter PIN verification and pickup dispatch.",
                 "Product & Stock Studio: Real-time inventory adjustments, low-stock warnings, and photo uploads.",
                 "Business Profile & Compliance: Shop timing, holidays, bank details, IFSC, and PAN record management.",
                 "Dedicated Phone App: Native Android flavor (com.localloop.merchant)."
             ], badge="MERCHANT STUDIO", bg_color=C_WHITE)

    # -------------------------------------------------------------
    # SLIDE 4: AUTHENTICATION & SECURITY ENGINE
    # -------------------------------------------------------------
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4, C_CREAM)
    add_header(s4, "Multi-Factor Authentication & Zero-Trust Security")

    add_card(s4, Inches(0.8), Inches(1.8), Inches(3.7), Inches(4.8),
             "Firebase Phone OTP", [
                 "Client Web SDK: Dynamic loader with reCAPTCHA verification.",
                 "Regional Indian Policy: Phone normalization enforcing +91 10-digit mobile standards.",
                 "Revocation Check: Admin SDK verifies ID token validity and revocation status.",
                 "Firestore Security: Lockdown rule disallows direct client database modifications."
             ], badge="PHONE AUTH")

    add_card(s4, Inches(4.8), Inches(1.8), Inches(3.7), Inches(4.8),
             "Enterprise Rate Limiting", [
                 "Anti-Abuse Engine: In-memory sliding window limiter protecting OTP endpoints.",
                 "Cooldown Timers: 60-second cooldown per mobile number prevents SMS bombardment.",
                 "Lockout Defense: Max 5 incorrect attempts before temporary account lockout.",
                 "XSS Sanitization: DOMPurify & HTML entity encoding on all user inputs."
             ], badge="RATE DEFENSE")

    add_card(s4, Inches(8.8), Inches(1.8), Inches(3.7), Inches(4.8),
             "Session & Separation", [
                 "Persistent Sessions: User remains logged in until explicit sign-out.",
                 "Account Management: Edit profile details or permanently remove account with confirmation.",
                 "RLS Enforcement: Database Row-Level Security isolates seller tables from consumers.",
                 "Cookie Security: HttpOnly, SameSite=Strict cookies preventing session hijacking."
             ], badge="SESSION & RLS")

    # -------------------------------------------------------------
    # SLIDE 5: CASHFREE PAYMENT GATEWAY INTEGRATION
    # -------------------------------------------------------------
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5, C_CREAM)
    add_header(s5, "Cashfree Hosted Payment Gateway & Webhook Architecture")

    add_card(s5, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8),
             "Payment Session & Hosted Checkout", [
                 "Official JS SDK v3: Asynchronously mounted in root layout for instant hosted modal/redirect launch.",
                 "Server-Side Trusted Pricing: Product prices and order subtotals calculated exclusively in backend (in paise/INR).",
                 "Order Creation API: Strict customer validation (name, email, 10-digit Indian phone) with expiry and notify_url.",
                 "Interactive Return Page (/payment-result): Direct verification with Cashfree API, status badges, and cart clearing."
             ], badge="CHECKOUT WORKFLOW", bg_color=C_WHITE)

    add_card(s5, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.8),
             "Cryptographic Webhook Settlement", [
                 "Raw-Body HMAC Verification: Signature formula Base64(HMAC-SHA256(timestamp + rawBody, secret)) strictly verified.",
                 "Timing-Safe Equal: Uses crypto.timingSafeEqual to eliminate side-channel timing attack vulnerabilities.",
                 "Double Re-Verification: Order state marked PAID only after server-to-server re-query against Cashfree PG.",
                 "Standalone cashfree-store: Built full-stack Express + MySQL + Vite e-commerce microservice reference."
             ], badge="SETTLEMENT SECURITY", bg_color=C_WHITE)

    # -------------------------------------------------------------
    # SLIDE 6: COMPLETE 14 AI APIS ECOSYSTEM
    # -------------------------------------------------------------
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6, C_CREAM)
    add_header(s6, "Complete 14 AI APIs & Intelligent Cloud Ecosystem")

    add_card(s6, Inches(0.8), Inches(1.8), Inches(3.7), Inches(4.8),
             "Discovery & Vision AI", [
                 "Google Vertex AI Recommendations: Dynamic personalized goods discovery based on views and searches.",
                 "Typesense Search: Sub-50ms instant typo-tolerant search across shop names, lanes, and items.",
                 "Google Vertex AI Vision: Automatic product photo analysis, tagging, and authenticity checks.",
                 "Lily AI: Deep visual fashion and handcrafted goods attribute extraction."
             ], badge="DISCOVERY AI")

    add_card(s6, Inches(4.8), Inches(1.8), Inches(3.7), Inches(4.8),
             "Language & Voice AI", [
                 "Google Gemini API: Multimodal AI product listing assistant and merchant copy generator.",
                 "Google Dialogflow: Conversational customer service bot answering local shop queries 24/7.",
                 "Google Speech-to-Text: Real-time voice search in search bar supporting regional phonetics.",
                 "MonkeyLearn: Customer sentiment extraction and review analytics."
             ], badge="CONVERSATIONAL AI")

    add_card(s6, Inches(8.8), Inches(1.8), Inches(3.7), Inches(4.8),
             "Forecasting & Security AI", [
                 "Vertex AI Forecasting: Demand prediction for festive surges (Dharwad Pedha during Deepavali).",
                 "Google BigQuery ML: Predictive customer lifetime value and churn risk modeling.",
                 "Intelligence Node: Real-time price optimization against regional competitor pricing.",
                 "Sift Fraud Shield: Real-time transaction fraud scoring and account takeover prevention."
             ], badge="ANALYTICS & SHIELD")

    # -------------------------------------------------------------
    # SLIDE 7: 24/7 SECURE BOT & REAL-TIME ASSISTANCE
    # -------------------------------------------------------------
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7, C_CREAM)
    add_header(s7, "24/7 Secure Assistant Bot & Voice Commerce")

    add_card(s7, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8),
             "24/7 LocalLoop Assistant Bot", [
                 "Persistent UI Widget: Seamlessly docked on storefront and product discovery boards.",
                 "Daemon Background Process: Dedicated watchdog daemon (scripts/localloop-bot-daemon.mjs) ensuring 100% uptime.",
                 "Dialogflow & Gemini Engine: Answers shop timings, pickup directions, order tracking, and delivery queries.",
                 "Zero Latency Responses: Instant client-side fallbacks for continuous offline resilience."
             ], badge="VIRTUAL CONCIERGE", bg_color=C_WHITE)

    add_card(s7, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.8),
             "Voice-Enabled Hyperlocal Commerce", [
                 "Speech-to-Text Search Bar: One-tap microphone button enabling shoppers to speak their search query.",
                 "Text-to-Speech Audio Readout: Speaker icon vocalizes shop highlights, distance, and authentic specialties.",
                 "Accessibility First: Designed for senior citizens and non-English keyboard users across Karnataka.",
                 "Responsive & Tactile UI: Haptic-feel buttons, sound cues, and animated voice waveforms."
             ], badge="VOICE SEARCH & TTS", bg_color=C_WHITE)

    # -------------------------------------------------------------
    # SLIDE 8: DUAL DELIVERY & PINPOINT LOCATION PICKER
    # -------------------------------------------------------------
    s8 = prs.slides.add_slide(blank_layout)
    set_slide_background(s8, C_CREAM)
    add_header(s8, "Hyperlocal Fulfillment & Pinpoint Location Architecture")

    add_card(s8, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8),
             "Dual Fulfillment System", [
                 "1. Express Counter Pick-up: Pre-pack orders ready in 20 minutes with counter pickup token (e.g. LL-407). Zero waiting.",
                 "2. Doorstep Home Delivery: 35-45 minute neighborhood delivery via route-optimized delivery fleet.",
                 "Customer Convenience: Shoppers select preferred delivery mode directly in checkout modal.",
                 "Zero Markups: Same counter price guaranteed for both in-store pickup and home delivery."
             ], badge="FULFILLMENT MODES", bg_color=C_WHITE)

    add_card(s8, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.8),
             "Map4Me & Route4Me Smart Location", [
                 "Accurate Geolocation: Browser GPS detection with manual pinpoint override.",
                 "Multi-Address Vault: Tag and store pinpoint delivery addresses under Primary, Home, Office, or Others.",
                 "Route4Me Optimization: Multi-stop dispatch engine calculating optimal paths for neighborhood delivery.",
                 "Hyperlocal Range Filter: Dynamic distance computation displaying nearby authentic shops first."
             ], badge="SMART LOGISTICS", bg_color=C_WHITE)

    # -------------------------------------------------------------
    # SLIDE 9: MERCHANT COCKPIT & SALES ML ENGINE
    # -------------------------------------------------------------
    s9 = prs.slides.add_slide(blank_layout)
    set_slide_background(s9, C_CREAM)
    add_header(s9, "Merchant Cockpit, Photo Studio & Self-Learning ML")

    add_card(s9, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8),
             "Merchant Product & Photo Studio", [
                 "Custom Photo Upload: Merchants take and upload pictures of their authentic handmade products.",
                 "Real-Time Stock Adjustment: Incremental +/- buttons, low-stock alerts, and out-of-stock badges.",
                 "Full Catalog Management: Unit pricing, discount comparison, tags, and category assignment.",
                 "Automated Storefront Publishing: Newly uploaded products and stores appear in real-time on consumer marketplace."
             ], badge="CATALOG MANAGEMENT", bg_color=C_WHITE)

    add_card(s9, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.8),
             "Self-Learning Merchant Sales Engine", [
                 "Autonomous Trend Training: Analyzes sales history and predicts fast-depleting inventory.",
                 "Smart Stock Suggestions: Recommends restocking quantities ahead of weekends and holidays.",
                 "Basket Affinity Insights: Reveals items frequently purchased together (e.g. Pedha + Filter Coffee).",
                 "Revenue & Performance Analytics: Live Gross Merchandise Value (GMV), order volume, and fulfillment times."
             ], badge="SALES INTELLIGENCE", bg_color=C_WHITE)

    # -------------------------------------------------------------
    # SLIDE 10: BACKEND, DATABASE & ATOMIC INVENTORY
    # -------------------------------------------------------------
    s10 = prs.slides.add_slide(blank_layout)
    set_slide_background(s10, C_CREAM)
    add_header(s10, "PostgreSQL Database Architecture & Atomic Inventory")

    add_card(s10, Inches(0.8), Inches(1.8), Inches(3.7), Inches(4.8),
             "Declarative Schema", [
                 "9 Tracked Migrations: Declarative SQL migrations tracking all table structures.",
                 "Core Tables: profiles, stores, products, orders, order_items, reviews.",
                 "Optimized Indexes: Composite indexes on store_id, category, and order status for high throughput.",
                 "Multi-Database Support: Supabase PostgreSQL (primary) + MySQL 8/9 support."
             ], badge="DATABASE DDL")

    add_card(s10, Inches(4.8), Inches(1.8), Inches(3.7), Inches(4.8),
             "Atomic Order Locking", [
                 "RPC 'place_order_atomic': Executes orders within transactional row-level locks.",
                 "FOR UPDATE Concurrency: Prevents double-booking and race conditions under festive rush.",
                 "Stock Reservation: Automatically decrements inventory atomically upon payment verification.",
                 "Rollback Safety: Automatic transaction rollback on stock exhaustion or payment failure."
             ], badge="CONCURRENCY")

    add_card(s10, Inches(8.8), Inches(1.8), Inches(3.7), Inches(4.8),
             "Row-Level Security (RLS)", [
                 "Strict Tenant Isolation: Sellers can only modify products and orders belonging to their own store.",
                 "Customer Isolation: Customers can only access their own order history and address vault.",
                 "Anonymous Write Blocks: Disallows unauthenticated store and product creation.",
                 "Audit Logging: Detailed timestamps and status transition traces on all orders."
             ], badge="ACCESS CONTROL")

    # -------------------------------------------------------------
    # SLIDE 11: QUALITY ASSURANCE & TEST VERIFICATION
    # -------------------------------------------------------------
    s11 = prs.slides.add_slide(blank_layout)
    set_slide_background(s11, C_CREAM)
    add_header(s11, "Quality Assurance: 908/908 Automated Tests Passing")

    cards = [
        ("User Journey Suite", ["Discovery & Area Filtering", "Cart & LocalStorage Persistence", "Checkout Validation & Demo Order", "4-Stage Tracking (Placed to Completed)", "1-Tap Reorder Engine"], "40/40 PASSED"),
        ("Backend & RLS Suite", ["Supabase Client & Auth", "Declarative DDL & Indexes", "Atomic RPC 'place_order_atomic'", "State Machine Transition Guards", "Cashfree Credentials & Webhooks"], "40/40 PASSED"),
        ("Seller Portal Suite", ["Role Guard & Unauthorized Defense", "Product Creation, Edit & Delete", "Atomic Stock Counter Controls", "Store Settings & Status Toggles", "Growth Engine & Suggestion Cards"], "40/40 PASSED"),
        ("Auth & Apps Suite", ["Phone OTP Verification & Rate Limits", "Address Vault (Home, Office, Others)", "App Separation (User vs Merchant)", "Android Studio Phone Flavors", "XSS Sanitization & DOM Security"], "40/40 PASSED"),
        ("AI, Cashfree & Bot Suite", ["OTP API (Send & Verify)", "Hubli-Dharwad Hyperlocal Tagline", "Dual Delivery (Home vs Pickup)", "Cashfree Session & Webhook HMAC", "All 14 AI APIs & 24/7 Secure Bot"], "28/28 PASSED"),
        ("Next.js Production Build", ["Next.js 15.1.7 App Router", "24/24 Routes Compiled Cleanly", "TypeScript Zero Type Errors", "Optimized Static Chunks (105 kB)", "Tailwind CSS & Framer Motion Ready"], "24/24 ROUTES OK"),
    ]

    for i, (title, items, badge) in enumerate(cards):
        col = i % 3
        row = i // 3
        left = Inches(0.8 + col * 4.0)
        top = Inches(1.8 + row * 2.5)
        add_card(s11, left, top, Inches(3.7), Inches(2.3), title, items, badge=badge)

    # -------------------------------------------------------------
    # SLIDE 12: CLEAN SLATE & BRAND IDENTITY
    # -------------------------------------------------------------
    s12 = prs.slides.add_slide(blank_layout)
    set_slide_background(s12, C_CREAM)
    add_header(s12, "Brand Identity, Clean Slate & Community Focus")

    add_card(s12, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8),
             "Zero Dummy Data • Pure Onboarding", [
                 "Clean Slate Policy: Completely removed all dummy hardcoded shops, placeholder items, and mock catalogs.",
                 "Authentic Data Onboarding: Every store and item is organically created by merchants through the portal.",
                 "Real-Time Merchant Publishing: When a merchant uploads a product, it immediately appears on the user website.",
                 "Direct Contact Cleanup: Removed hardcoded placeholder contacts, replaced with clean customer trust policies."
             ], badge="AUTHENTICITY", bg_color=C_WHITE)

    add_card(s12, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.8),
             "Hyperlocal Hubli-Dharwad Heritage", [
                 "Signature Marketplace Tagline: 'Your city’s hyperlocal digital marketplace. Connecting authentic corner shops across Hubli-Dharwad with citywide shoppers.'",
                 "Prominent Placement: Featured on Home, Shopper Login, and Merchant Command Center.",
                 "Community Heritage: Celebrating Vidyanagar, Station Road, CBT Bus Stand, and local artisanal culture.",
                 "Mobile Responsive: Complete responsive optimization with touch-first tap targets and mobile drawer."
             ], badge="COMMUNITY PRIDE", bg_color=C_WHITE)

    # -------------------------------------------------------------
    # SLIDE 13: PROJECT SUMMARY & CONCLUSION (Dark Hero)
    # -------------------------------------------------------------
    s13 = prs.slides.add_slide(blank_layout)
    set_slide_background(s13, C_FOREST)

    add_header(s13, "LocalLoop • Production Readiness & Strategic Roadmap", light=True)

    add_card(s13, Inches(0.8), Inches(1.8), Inches(3.7), Inches(4.8),
             "Key Accomplishments", [
                 "Production-ready Next.js 15 full-stack app with 24 compiled routes.",
                 "Complete separation of Shopper and Merchant applications.",
                 "Full Cashfree hosted checkout & webhook settlement with paise precision.",
                 "All 14 requested AI APIs & 24/7 background watchdog bot integrated.",
                 "908 automated test assertions passing 100% across 5 test suites."
             ], badge="COMPLETED", bg_color=C_FOREST_LIGHT, border_color=C_TERRACOTTA, title_color=C_WHITE)

    add_card(s13, Inches(4.8), Inches(1.8), Inches(3.7), Inches(4.8),
             "Merchant Empowerment", [
                 "Zero platform commission saving merchants 15-30% on every order.",
                 "Express 20-minute counter pickup eliminates customer in-store queueing.",
                 "Self-learning AI inventory recommendations prevent festive stockouts.",
                 "Custom photo studio gives corner shops professional digital storefronts."
             ], badge="MERCHANT VALUE", bg_color=C_FOREST_LIGHT, border_color=C_TERRACOTTA, title_color=C_WHITE)

    add_card(s13, Inches(8.8), Inches(1.8), Inches(3.7), Inches(4.8),
             "Next Growth Horizons", [
                 "ONDC Network integration for open digital commerce protocol connectivity.",
                 "Expansion across North Karnataka (Belagavi, Dharwad, Bagalkot).",
                 "Autonomous EV rider fleet integration with real-time telematics.",
                 "Micro-loans & working capital financing for high-performing corner shops."
             ], badge="FUTURE ROADMAP", bg_color=C_FOREST_LIGHT, border_color=C_TERRACOTTA, title_color=C_WHITE)

    prs.save(output_path)
    print(f"Presentation successfully created at: {output_path}")

if __name__ == "__main__":
    out_file = sys.argv[1] if len(sys.argv) > 1 else "LocalLoop_Hackfest_Comprehensive_Overview.pptx"
    create_deck(out_file)
