from fastapi import FastAPI, HTTPException, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from datetime import datetime, timezone
import os
import httpx
import asyncio
import uuid
import cloudinary
import cloudinary.utils
import time
import resend

load_dotenv()

app = FastAPI(title="Jewellery Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB setup
MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")

# Cloudinary setup
cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
    api_key=os.environ.get("CLOUDINARY_API_KEY"),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET"),
    secure=True
)

# Resend setup
resend.api_key = os.environ.get("RESEND_API_KEY")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")

# Telegram setup
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID")

@app.on_event("startup")
async def startup_db_client():
    app.mongodb_client = AsyncIOMotorClient(MONGO_URL)
    app.mongodb = app.mongodb_client[DB_NAME]
    # Seed initial data
    await seed_initial_data()

@app.on_event("shutdown")
async def shutdown_db_client():
    app.mongodb_client.close()

# ==================== PYDANTIC MODELS ====================

class GoldsmithProfile(BaseModel):
    name: str
    years_of_experience: int
    specializations: List[str]
    certifications: List[str]
    description: str
    location: str
    contact_phone: str
    contact_email: EmailStr
    gallery_images: List[str] = []

class GoldPrice(BaseModel):
    gold_24k: float
    gold_22k: float
    gold_18k: float
    silver: float
    timestamp: str
    source: str = "manual"

class JewelleryItem(BaseModel):
    item_id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    name: str
    type: str  # ring, chain, necklace, bangles, earrings
    occasion: str  # wedding, daily, festival
    gender: str  # male, female, unisex
    purity: str  # 24K, 22K, 18K
    weight_min: float
    weight_max: float
    labour_cost_per_gram: float
    making_complexity: str  # low, medium, high
    images: List[str]
    description: str
    is_featured: bool = False

class OrderIntent(BaseModel):
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    occasion: str
    timeline: str
    items: List[dict]
    total_estimate: float
    message: Optional[str] = ""

class ContactForm(BaseModel):
    name: str
    email: EmailStr
    phone: str
    subject: str
    message: str

class ChatMessage(BaseModel):
    message: str
    session_id: str

# ==================== GOLD PRICE ENGINE ====================

async def fetch_gold_price_from_api():
    """Fetch gold price from free API"""
    try:
        async with httpx.AsyncClient() as client:
            # Using Gold API (free tier)
            response = await client.get(
                "https://www.goldapi.io/api/XAU/INR",
                headers={"x-access-token": "goldapi-demo"},
                timeout=10
            )
            if response.status_code == 200:
                data = response.json()
                gold_per_gram = data.get("price_gram_24k", 0)
                return gold_per_gram
    except Exception as e:
        print(f"Gold API fetch error: {e}")
    return None

@app.get("/api/gold-price")
async def get_gold_price():
    """Get current gold and silver prices"""
    # Try to fetch from API
    api_price = await fetch_gold_price_from_api()
    
    # Get stored price from DB
    stored_price = await app.mongodb.gold_prices.find_one(
        {}, {"_id": 0}, sort=[("timestamp", -1)]
    )
    
    if api_price and api_price > 0:
        # Calculate other purities
        gold_24k = api_price
        gold_22k = gold_24k * (22/24)
        gold_18k = gold_24k * (18/24)
        silver = gold_24k / 80  # Approximate silver ratio
        
        price_data = {
            "gold_24k": round(gold_24k, 2),
            "gold_22k": round(gold_22k, 2),
            "gold_18k": round(gold_18k, 2),
            "silver": round(silver, 2),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source": "live"
        }
        # Store in DB
        await app.mongodb.gold_prices.insert_one({**price_data})
        return price_data
    
    if stored_price:
        return stored_price
    
    # Default fallback prices (Indian market approximation)
    return {
        "gold_24k": 7500.00,
        "gold_22k": 6875.00,
        "gold_18k": 5625.00,
        "silver": 95.00,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source": "default"
    }

@app.post("/api/gold-price")
async def update_gold_price(price: GoldPrice):
    """Manually update gold prices (admin)"""
    price_data = price.model_dump()
    price_data["timestamp"] = datetime.now(timezone.utc).isoformat()
    await app.mongodb.gold_prices.insert_one({**price_data})
    return {"status": "success", "message": "Gold price updated"}

# ==================== PRICE CALCULATOR ====================

@app.post("/api/calculate-price")
async def calculate_price(
    weight: float = Query(..., description="Weight in grams"),
    purity: str = Query(..., description="Gold purity: 24K, 22K, 18K"),
    labour_per_gram: float = Query(default=500, description="Labour cost per gram"),
    include_gst: bool = Query(default=True, description="Include 3% GST")
):
    """Calculate jewellery price with breakdown"""
    prices = await get_gold_price()
    
    purity_map = {
        "24K": prices["gold_24k"],
        "22K": prices["gold_22k"],
        "18K": prices["gold_18k"]
    }
    
    gold_rate = purity_map.get(purity, prices["gold_22k"])
    
    gold_value = gold_rate * weight
    labour_cost = labour_per_gram * weight
    subtotal = gold_value + labour_cost
    gst = subtotal * 0.03 if include_gst else 0
    total = subtotal + gst
    
    return {
        "breakdown": {
            "gold_rate_per_gram": round(gold_rate, 2),
            "weight": weight,
            "purity": purity,
            "gold_value": round(gold_value, 2),
            "labour_per_gram": labour_per_gram,
            "labour_cost": round(labour_cost, 2),
            "subtotal": round(subtotal, 2),
            "gst_rate": "3%" if include_gst else "0%",
            "gst_amount": round(gst, 2),
            "total": round(total, 2)
        },
        "estimate_range": {
            "min": round(total * 0.95, 2),
            "max": round(total * 1.05, 2)
        }
    }

# ==================== GOLDSMITH PROFILE ====================

@app.get("/api/goldsmith")
async def get_goldsmith_profile():
    """Get goldsmith profile"""
    profile = await app.mongodb.goldsmith.find_one({}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@app.post("/api/goldsmith")
async def update_goldsmith_profile(profile: GoldsmithProfile):
    """Update goldsmith profile"""
    profile_data = profile.model_dump()
    await app.mongodb.goldsmith.replace_one({}, profile_data, upsert=True)
    return {"status": "success", "message": "Profile updated"}

# ==================== JEWELLERY CATALOGUE ====================

@app.get("/api/jewellery")
async def get_jewellery(
    type: Optional[str] = None,
    occasion: Optional[str] = None,
    gender: Optional[str] = None,
    purity: Optional[str] = None,
    featured: Optional[bool] = None,
    min_weight: Optional[float] = None,
    max_weight: Optional[float] = None
):
    """Get jewellery catalogue with filters"""
    query = {}
    if type:
        query["type"] = type
    if occasion:
        query["occasion"] = occasion
    if gender:
        query["gender"] = gender
    if purity:
        query["purity"] = purity
    if featured is not None:
        query["is_featured"] = featured
    if min_weight:
        query["weight_max"] = {"$gte": min_weight}
    if max_weight:
        query["weight_min"] = {"$lte": max_weight}
    
    items = await app.mongodb.jewellery.find(query, {"_id": 0}).to_list(100)
    return {"items": items, "count": len(items)}

@app.get("/api/jewellery/{item_id}")
async def get_jewellery_item(item_id: str):
    """Get single jewellery item"""
    item = await app.mongodb.jewellery.find_one({"item_id": item_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@app.post("/api/jewellery")
async def create_jewellery(item: JewelleryItem):
    """Create new jewellery item"""
    item_data = item.model_dump()
    item_data["created_at"] = datetime.now(timezone.utc).isoformat()
    await app.mongodb.jewellery.insert_one({**item_data})
    return {"status": "success", "item_id": item_data["item_id"]}

# ==================== AI CHAT ASSISTANT ====================

@app.post("/api/chat")
async def chat_with_assistant(chat: ChatMessage):
    """AI-powered jewellery assistant"""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        # Get current gold prices for context
        prices = await get_gold_price()
        
        # Get catalogue summary for context
        jewellery_items = await app.mongodb.jewellery.find({}, {"_id": 0}).to_list(50)
        catalogue_summary = "\n".join([
            f"- {item['name']}: {item['type']}, {item['purity']}, {item['weight_min']}-{item['weight_max']}g, ₹{item['labour_cost_per_gram']}/g labour"
            for item in jewellery_items[:20]
        ])
        
        system_message = f"""You are an expert jewellery consultant for a traditional Indian goldsmith. 
Your role is to help customers discover the perfect jewellery based on their needs.

CURRENT GOLD PRICES (per gram):
- 24K Gold: ₹{prices['gold_24k']}
- 22K Gold: ₹{prices['gold_22k']}
- 18K Gold: ₹{prices['gold_18k']}
- Silver: ₹{prices['silver']}

AVAILABLE CATALOGUE:
{catalogue_summary}

PRICING FORMULA:
Final Price = (Gold Price × Weight × Purity Factor) + Labour Cost + 3% GST

GUIDELINES:
1. Ask about occasion, budget, and preferences
2. Recommend specific items from catalogue
3. Provide transparent price estimates
4. Explain purity differences when asked
5. Be warm, helpful, and build trust
6. Always suggest contacting for final customization
7. Prices are estimates - final pricing requires consultation

Keep responses concise and helpful. Use Indian Rupees (₹) for all prices."""

        # Get chat history
        history = await app.mongodb.chat_history.find(
            {"session_id": chat.session_id}, {"_id": 0}
        ).sort("timestamp", 1).to_list(20)
        
        llm_chat = LlmChat(
            api_key=os.environ.get("EMERGENT_LLM_KEY"),
            session_id=chat.session_id,
            system_message=system_message
        ).with_model("openai", "gpt-4o-mini")
        
        # Add history to context
        for msg in history[-10:]:  # Last 10 messages
            if msg["role"] == "user":
                llm_chat.add_user_message(msg["content"])
            else:
                llm_chat.add_assistant_message(msg["content"])
        
        user_message = UserMessage(text=chat.message)
        response = await llm_chat.send_message(user_message)
        
        # Store messages in history
        timestamp = datetime.now(timezone.utc).isoformat()
        await app.mongodb.chat_history.insert_many([
            {"session_id": chat.session_id, "role": "user", "content": chat.message, "timestamp": timestamp},
            {"session_id": chat.session_id, "role": "assistant", "content": response, "timestamp": timestamp}
        ])
        
        return {"response": response, "session_id": chat.session_id}
        
    except Exception as e:
        print(f"Chat error: {e}")
        # Fallback response
        return {
            "response": "I apologize, but I'm having trouble connecting right now. Please try again or contact us directly for assistance with your jewellery needs.",
            "session_id": chat.session_id
        }

# ==================== ORDER INTENT ====================

async def send_telegram_notification(message: str):
    """Send notification via Telegram"""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return False
    try:
        async with httpx.AsyncClient() as client:
            await client.post(
                f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
                json={"chat_id": TELEGRAM_CHAT_ID, "text": message, "parse_mode": "HTML"}
            )
        return True
    except Exception as e:
        print(f"Telegram error: {e}")
        return False

async def send_email_notification(to_email: str, subject: str, html_content: str):
    """Send notification via Resend"""
    if not os.environ.get("RESEND_API_KEY"):
        return False
    try:
        params = {
            "from": SENDER_EMAIL,
            "to": [to_email],
            "subject": subject,
            "html": html_content
        }
        await asyncio.to_thread(resend.Emails.send, params)
        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False

@app.post("/api/order-intent")
async def create_order_intent(order: OrderIntent):
    """Save order intent and send notifications"""
    order_data = order.model_dump()
    order_data["order_id"] = str(uuid.uuid4())[:8].upper()
    order_data["status"] = "pending"
    order_data["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await app.mongodb.order_intents.insert_one({**order_data})
    
    # Format items for notification
    items_text = "\n".join([
        f"• {item.get('name', 'Item')} - Est. ₹{item.get('estimate', 0):,.2f}"
        for item in order_data["items"]
    ])
    
    # Send Telegram notification
    telegram_msg = f"""🔔 <b>New Order Intent</b>

<b>Order ID:</b> {order_data['order_id']}
<b>Customer:</b> {order_data['customer_name']}
<b>Phone:</b> {order_data['customer_phone']}
<b>Email:</b> {order_data['customer_email']}
<b>Occasion:</b> {order_data['occasion']}
<b>Timeline:</b> {order_data['timeline']}

<b>Items:</b>
{items_text}

<b>Total Estimate:</b> ₹{order_data['total_estimate']:,.2f}

<b>Message:</b> {order_data.get('message', 'None')}"""
    
    await send_telegram_notification(telegram_msg)
    
    # Send email notification
    email_html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #064E3B;">New Order Intent Received</h2>
        <p><strong>Order ID:</strong> {order_data['order_id']}</p>
        <p><strong>Customer:</strong> {order_data['customer_name']}</p>
        <p><strong>Phone:</strong> {order_data['customer_phone']}</p>
        <p><strong>Email:</strong> {order_data['customer_email']}</p>
        <p><strong>Occasion:</strong> {order_data['occasion']}</p>
        <p><strong>Timeline:</strong> {order_data['timeline']}</p>
        <h3>Items:</h3>
        <ul>{''.join([f"<li>{item.get('name', 'Item')} - Est. ₹{item.get('estimate', 0):,.2f}</li>" for item in order_data['items']])}</ul>
        <p><strong>Total Estimate:</strong> ₹{order_data['total_estimate']:,.2f}</p>
        <p><strong>Message:</strong> {order_data.get('message', 'None')}</p>
    </div>
    """
    
    await send_email_notification(
        order_data['customer_email'],
        f"Order Intent #{order_data['order_id']} - Thank you for your interest!",
        email_html
    )
    
    return {
        "status": "success",
        "order_id": order_data["order_id"],
        "message": "Your order intent has been saved. We will contact you shortly!"
    }

# ==================== CONTACT FORM ====================

@app.post("/api/contact")
async def submit_contact(form: ContactForm):
    """Submit contact form and send notifications"""
    form_data = form.model_dump()
    form_data["inquiry_id"] = str(uuid.uuid4())[:8].upper()
    form_data["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await app.mongodb.contacts.insert_one({**form_data})
    
    # Send Telegram notification
    telegram_msg = f"""📩 <b>New Contact Inquiry</b>

<b>Name:</b> {form_data['name']}
<b>Email:</b> {form_data['email']}
<b>Phone:</b> {form_data['phone']}
<b>Subject:</b> {form_data['subject']}

<b>Message:</b>
{form_data['message']}"""
    
    await send_telegram_notification(telegram_msg)
    
    return {
        "status": "success",
        "inquiry_id": form_data["inquiry_id"],
        "message": "Thank you for your message. We will get back to you soon!"
    }

# ==================== CLOUDINARY UPLOAD ====================

@app.get("/api/cloudinary/signature")
async def get_cloudinary_signature(
    resource_type: str = Query("image", enum=["image", "video"]),
    folder: str = Query("jewellery")
):
    """Generate signed upload params for Cloudinary"""
    if not os.environ.get("CLOUDINARY_API_SECRET"):
        raise HTTPException(status_code=500, detail="Cloudinary not configured")
    
    timestamp = int(time.time())
    params = {
        "timestamp": timestamp,
        "folder": folder,
        "resource_type": resource_type
    }
    
    signature = cloudinary.utils.api_sign_request(
        params,
        os.environ.get("CLOUDINARY_API_SECRET")
    )
    
    return {
        "signature": signature,
        "timestamp": timestamp,
        "cloud_name": os.environ.get("CLOUDINARY_CLOUD_NAME"),
        "api_key": os.environ.get("CLOUDINARY_API_KEY"),
        "folder": folder,
        "resource_type": resource_type
    }

# ==================== EDUCATION CONTENT ====================

@app.get("/api/education")
async def get_education_content():
    """Get gold education content"""
    content = await app.mongodb.education.find({}, {"_id": 0}).to_list(20)
    if not content:
        return {"articles": get_default_education_content()}
    return {"articles": content}

def get_default_education_content():
    return [
        {
            "id": "purity",
            "title": "Understanding Gold Purity",
            "content": """
                <h3>24K vs 22K vs 18K Gold</h3>
                <p><strong>24 Karat (999 purity):</strong> Pure gold. Too soft for everyday jewellery, ideal for coins and bars.</p>
                <p><strong>22 Karat (916 purity):</strong> 91.6% pure gold. Perfect balance of purity and durability. Most popular for Indian jewellery.</p>
                <p><strong>18 Karat (750 purity):</strong> 75% pure gold. More durable, suitable for daily wear with intricate designs.</p>
            """,
            "icon": "gem"
        },
        {
            "id": "hallmark",
            "title": "BIS Hallmark Explained",
            "content": """
                <h3>What is BIS Hallmark?</h3>
                <p>BIS (Bureau of Indian Standards) Hallmark is a certification that guarantees the purity of gold. Look for:</p>
                <ul>
                    <li><strong>BIS Logo:</strong> Triangle with BIS written</li>
                    <li><strong>Purity Grade:</strong> 916 for 22K, 750 for 18K</li>
                    <li><strong>Assaying Center's Mark:</strong> Unique code of the testing center</li>
                    <li><strong>Jeweller's ID:</strong> Unique identification number</li>
                </ul>
            """,
            "icon": "shield-check"
        },
        {
            "id": "making-charges",
            "title": "Why Making Charges Differ",
            "content": """
                <h3>Understanding Making Charges</h3>
                <p>Making charges vary based on:</p>
                <ul>
                    <li><strong>Design Complexity:</strong> Intricate designs require more skill and time</li>
                    <li><strong>Machine vs Handmade:</strong> Handcrafted pieces cost more</li>
                    <li><strong>Weight:</strong> Heavier pieces may have lower per-gram charges</li>
                    <li><strong>Wastage:</strong> Some designs result in gold wastage during making</li>
                </ul>
                <p>Typical range: ₹300 - ₹1500 per gram depending on complexity.</p>
            """,
            "icon": "wrench"
        },
        {
            "id": "916-meaning",
            "title": "What Does 916 Mean?",
            "content": """
                <h3>Decoding 916</h3>
                <p>916 indicates the purity of gold in parts per thousand:</p>
                <p><strong>916 = 91.6% pure gold = 22 Karat</strong></p>
                <p>This means out of 1000 parts, 916 parts are pure gold and 84 parts are other metals (usually copper or silver) for strength.</p>
                <p>Similarly:</p>
                <ul>
                    <li>999 = 24K (99.9% pure)</li>
                    <li>750 = 18K (75% pure)</li>
                    <li>585 = 14K (58.5% pure)</li>
                </ul>
            """,
            "icon": "info"
        }
    ]

# ==================== SEED DATA ====================

async def seed_initial_data():
    """Seed initial data if database is empty"""
    
    # Seed goldsmith profile
    profile_exists = await app.mongodb.goldsmith.find_one({})
    if not profile_exists:
        default_profile = {
            "name": "Heritage Gold Artisans",
            "years_of_experience": 35,
            "specializations": ["Temple Jewellery", "Wedding Sets", "Antique Designs", "Daily Wear"],
            "certifications": ["BIS Certified", "Hallmark Licensed", "Traditional Craftsmanship Award"],
            "description": "Three generations of master goldsmiths crafting timeless pieces. We blend traditional artistry with modern precision, ensuring every piece tells a story of heritage and trust.",
            "location": "Jewellery Lane, T. Nagar, Chennai - 600017",
            "contact_phone": "+91 98765 43210",
            "contact_email": "contact@heritagegold.in",
            "gallery_images": [
                "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338",
                "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed",
                "https://images.unsplash.com/photo-1611652022419-a9419f74343d"
            ]
        }
        await app.mongodb.goldsmith.insert_one(default_profile)
    
    # Seed jewellery catalogue
    jewellery_exists = await app.mongodb.jewellery.find_one({})
    if not jewellery_exists:
        sample_jewellery = [
            {
                "item_id": "NECK001",
                "name": "Lakshmi Temple Necklace",
                "type": "necklace",
                "occasion": "wedding",
                "gender": "female",
                "purity": "22K",
                "weight_min": 40,
                "weight_max": 50,
                "labour_cost_per_gram": 800,
                "making_complexity": "high",
                "images": ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f"],
                "description": "Exquisite temple jewellery featuring Goddess Lakshmi motifs. Handcrafted by master artisans using traditional techniques.",
                "is_featured": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "item_id": "BANG001",
                "name": "Classic Gold Bangles (Pair)",
                "type": "bangles",
                "occasion": "daily",
                "gender": "female",
                "purity": "22K",
                "weight_min": 15,
                "weight_max": 20,
                "labour_cost_per_gram": 500,
                "making_complexity": "medium",
                "images": ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908"],
                "description": "Elegant plain bangles perfect for everyday wear. Comfortable and timeless design.",
                "is_featured": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "item_id": "RING001",
                "name": "Men's Classic Band",
                "type": "ring",
                "occasion": "daily",
                "gender": "male",
                "purity": "22K",
                "weight_min": 4,
                "weight_max": 6,
                "labour_cost_per_gram": 600,
                "making_complexity": "low",
                "images": ["https://images.unsplash.com/photo-1605100804763-247f67b3557e"],
                "description": "Sophisticated gold band for the modern gentleman. Perfect for weddings or daily wear.",
                "is_featured": False,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "item_id": "CHAIN001",
                "name": "Bismark Gold Chain",
                "type": "chain",
                "occasion": "daily",
                "gender": "male",
                "purity": "22K",
                "weight_min": 20,
                "weight_max": 30,
                "labour_cost_per_gram": 550,
                "making_complexity": "medium",
                "images": ["https://images.unsplash.com/photo-1599643477877-530eb83abc8e"],
                "description": "Bold and classic Bismark pattern chain. Sturdy construction for everyday confidence.",
                "is_featured": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "item_id": "EAR001",
                "name": "Jhumka Earrings",
                "type": "earrings",
                "occasion": "festival",
                "gender": "female",
                "purity": "22K",
                "weight_min": 8,
                "weight_max": 12,
                "labour_cost_per_gram": 700,
                "making_complexity": "high",
                "images": ["https://images.unsplash.com/photo-1630019852942-f89202989a59"],
                "description": "Traditional jhumka earrings with intricate filigree work. Perfect for festive occasions.",
                "is_featured": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "item_id": "NECK002",
                "name": "Mango Mala Set",
                "type": "necklace",
                "occasion": "wedding",
                "gender": "female",
                "purity": "22K",
                "weight_min": 60,
                "weight_max": 80,
                "labour_cost_per_gram": 900,
                "making_complexity": "high",
                "images": ["https://images.unsplash.com/photo-1611652022419-a9419f74343d"],
                "description": "Grand mango-shaped traditional necklace set. A bridal essential with matching earrings.",
                "is_featured": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        await app.mongodb.jewellery.insert_many(sample_jewellery)

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
