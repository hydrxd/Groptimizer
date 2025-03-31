from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any, Dict
from datetime import datetime, timedelta, timezone
import motor.motor_asyncio
import bcrypt
from jose import jwt
import uvicorn
from neo4j import GraphDatabase
import os
from google import genai
from google.genai import types
import xml.etree.ElementTree as ET

def load_schema(xml_file="schema.xml"):
    tree = ET.parse(xml_file)
    root = tree.getroot()
    schema = {}

    # Parse MongoDB collections
    mongo_db = root.find("MongoDB/Database")
    mongo_name = mongo_db.get("name")
    schema[mongo_name] = {}

    for collection in mongo_db.findall("Collection"):
        collection_name = collection.get("name")
        schema[mongo_name][collection_name] = {}
        for field in collection.findall("Field"):
            schema[mongo_name][collection_name][field.get("name")] = field.get("type")

    # Parse Neo4j nodes and relationships
    neo4j_db = root.find("Neo4j/Database")
    neo4j_name = neo4j_db.get("name")
    schema[neo4j_name] = {"Nodes": {}, "Relationships": {}}

    for node in neo4j_db.findall("Node"):
        node_name = node.get("name")
        schema[neo4j_name]["Nodes"][node_name] = {}
        for prop in node.findall("Property"):
            schema[neo4j_name]["Nodes"][node_name][prop.get("name")] = prop.get("type")

    for relationship in neo4j_db.findall("Relationship"):
        rel_name = relationship.get("name")
        schema[neo4j_name]["Relationships"][rel_name] = {}
        for prop in relationship.findall("Property"):
            schema[neo4j_name]["Relationships"][rel_name][prop.get("name")] = prop.get("type")

    return schema

# Load schema at startup
DATABASE_SCHEMA = load_schema()


# ---------------------
# Configuration & Setup
# ---------------------

MONGO_DETAILS = "mongodb://localhost:27017"
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DETAILS)
db = client.inventory_app
users_collection = db.get_collection("users")
listings_collection = db.get_collection("listings")
requests_collection = db.get_collection("requests")
notifications_collection = db.get_collection("notifications")

NEO4J_URI = "bolt://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "hydridhydrid"
neo4j_driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

app = FastAPI()

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# ---------------------
# Utility Functions
# ---------------------

def hash_password(password: str) -> str:
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_user_by_email(email: str) -> Optional[Dict]:
    return await users_collection.find_one({"email": email})

async def get_user_by_id(user_id: str) -> Optional[Dict]:
    return await users_collection.find_one({"id": user_id})

async def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.JWTError:
        raise credentials_exception
    user = await get_user_by_email(email)
    if user is None:
        raise credentials_exception
    return user

def validate_mongo_data(collection_name, data):
    if collection_name not in DATABASE_SCHEMA["inventory_app"]:
        raise ValueError(f"Collection {collection_name} is not defined in schema.")

    schema = DATABASE_SCHEMA["inventory_app"][collection_name]
    for key, value in data.items():
        if key not in schema:
            raise ValueError(f"Invalid field {key} for collection {collection_name}.")
    return True

def validate_neo4j_data(node_or_rel, entity_type, data):
    if entity_type not in DATABASE_SCHEMA["cities_db"][node_or_rel]:
        raise ValueError(f"{entity_type} is not defined in Neo4j schema.")

    schema = DATABASE_SCHEMA["cities_db"][node_or_rel][entity_type]
    for key, value in data.items():
        if key not in schema:
            raise ValueError(f"Invalid field {key} for {entity_type}.")
    return True


# ---------------------
# Pydantic Models
# ---------------------

class UserModel(BaseModel):
    id: Optional[str] = None
    name: str
    email: EmailStr
    password: str
    role: str  # "supermarket", "food_bank", "consumer"
    location: str
    created_at: Optional[datetime] = None

class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str
    location: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class ListingModel(BaseModel):
    id: Optional[str] = None
    #supermarket_id: str
    title: str
    description: str
    category: str
    quantity: int
    expiry_date: datetime
    location: str
    image_url: Optional[str] = None
    created_at: Optional[datetime] = None

class RequestModel(BaseModel):
    id: Optional[str] = None
    listing_id: str
    requester_id: str
    location: str
    status: str  # "pending", "approved", "declined"
    notes: Optional[str] = None
    created_at: Optional[datetime] = None

class RequestCreate(BaseModel):
    listing_id: str
    notes: Optional[str] = None

class RequestUpdate(BaseModel):
    listing_id: Optional[str] = None
    requester_id: Optional[str] = None
    status: Optional[str] = None  # "pending", "approved", "declined"
    notes: Optional[str] = None

class NotificationModel(BaseModel):
    id: Optional[str] = None
    user_id: str
    type: str  # e.g., "new_listing", "request_received", "request_status_update"
    message: str
    is_read: bool = False
    created_at: Optional[datetime] = None

class MatchingRequest(BaseModel):
    listing_id: str

# Models for managing Neo4j data
class CityModel(BaseModel):
    name: str

class NeighborRelationshipModel(BaseModel):
    city_a: str
    city_b: str
    distance: float  # Added distance field

# ---------------------
# API Routes
# ---------------------

# Auth Routes
@app.post("/api/auth/register", response_model=Dict[str, Any])
async def register(user: UserModel):
    if await get_user_by_email(user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    user.password = hash_password(user.password)
    user.id = str(await users_collection.count_documents({}) + 1)
    user.created_at = datetime.now(timezone.utc)
    await users_collection.insert_one(user.dict())
    return {"msg": "User registered successfully", "user_id": user.id}

@app.post("/api/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await get_user_by_email(form_data.username)
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    token = create_access_token({"sub": user["email"], "role": user["role"]})
    curr_role = user['role']
    return {"access_token": token, "role": curr_role, "token_type": "bearer"}

@app.get("/api/users/{user_id}", response_model=UserOut)
async def get_user(user_id: str, current_user: Dict = Depends(get_current_user)):
    user = await get_user_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut(**user)

@app.put("/api/users/{user_id}", response_model=UserOut)
async def update_user(user_id: str, user_update: UserModel, current_user: Dict = Depends(get_current_user)):
    user = await get_user_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    update_data = user_update.dict(exclude_unset=True)
    if "password" in update_data:
        update_data["password"] = hash_password(update_data["password"])
    await users_collection.update_one({"id": user_id}, {"$set": update_data})
    user = await get_user_by_id(user_id)
    return UserOut(**user)

# Listings Routes
@app.post("/api/listings", response_model=Dict[str, Any])
async def create_listing(listing: ListingModel, current_user: Dict = Depends(get_current_user)):
    if current_user["role"] != "supermarket":
        raise HTTPException(status_code=403, detail="Only supermarkets can create listings")

    listing_dict = listing.dict()
    listing_dict["id"] = str(await listings_collection.count_documents({}) + 1)
    listing_dict["created_at"] = datetime.now(timezone.utc)

    # Validate data against XML schema
    validate_mongo_data("listings", listing_dict)

    await listings_collection.insert_one(listing_dict)
    return {"msg": "Listing created successfully", "listing_id": listing_dict["id"]}


@app.get("/api/listings", response_model=List[ListingModel])
async def get_listings(skip: int = 0, limit: int = 10):
    listings_cursor = listings_collection.find().skip(skip).limit(limit)
    listings = await listings_cursor.to_list(length=limit)
    return listings

@app.get("/api/listings/{listing_id}", response_model=ListingModel)
async def get_listing(listing_id: str):
    listing = await listings_collection.find_one({"id": listing_id})
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    return ListingModel(**listing)

@app.put("/api/listings/{listing_id}", response_model=Dict[str, Any])
async def update_listing(listing_id: str, listing_update: ListingModel, current_user: Dict = Depends(get_current_user)):
    listing = await listings_collection.find_one({"id": listing_id})
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing["supermarket_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this listing")
    update_data = listing_update.dict(exclude_unset=True)
    await listings_collection.update_one({"id": listing_id}, {"$set": update_data})
    return {"msg": "Listing updated successfully"}

@app.delete("/api/listings/{listing_id}", response_model=Dict[str, Any])
async def delete_listing(listing_id: str, current_user: Dict = Depends(get_current_user)):
    listing = await listings_collection.find_one({"id": listing_id})
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing["supermarket_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this listing")
    await listings_collection.delete_one({"id": listing_id})
    return {"msg": "Listing deleted successfully"}

# Requests Routes
@app.post("/api/requests", response_model=Dict[str, Any])
async def create_request(req: RequestCreate, current_user: Dict = Depends(get_current_user)):
    new_request = {
        "id": str(await requests_collection.count_documents({}) + 1),
        "listing_id": req.listing_id,
        "requester_id": current_user["id"],
        "location": current_user["location"],
        "status": "pending",
        "notes": req.notes,
        "created_at": datetime.now(timezone.utc)
    }
    await requests_collection.insert_one(new_request)
    return {"msg": "Request created successfully", "request_id": new_request["id"]}

@app.get("/api/requests", response_model=List[RequestModel])
async def get_requests(current_user: Dict = Depends(get_current_user)):
    role = current_user["role"]
    if role == "supermarket":
        listings = await listings_collection.find({"supermarket_id": current_user["id"]}).to_list(length=100)
        listing_ids = [listing["id"] for listing in listings]
        cursor = requests_collection.find({"listing_id": {"$in": listing_ids}})
    else:
        cursor = requests_collection.find({"requester_id": current_user["id"]})
    requests_list = await cursor.to_list(length=100)
    return requests_list

@app.get("/api/requests/{request_id}", response_model=RequestModel)
async def get_request(request_id: str, current_user: Dict = Depends(get_current_user)):
    req = await requests_collection.find_one({"id": request_id})
    if req is None:
        raise HTTPException(status_code=404, detail="Request not found")
    return RequestModel(**req)

@app.put("/api/requests/{request_id}", response_model=Dict[str, Any])
async def update_request(request_id: str, req_update: RequestUpdate, current_user: Dict = Depends(get_current_user)):
    req = await requests_collection.find_one({"id": request_id})
    if req is None:
        raise HTTPException(status_code=404, detail="Request not found")
    listing = await listings_collection.find_one({"id": req["listing_id"]})
    if listing is None or listing["supermarket_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this request")
    update_data = req_update.dict(exclude_unset=True)
    await requests_collection.update_one({"id": request_id}, {"$set": update_data})
    return {"msg": "Request updated successfully"}

# Notifications Routes
@app.get("/api/notifications", response_model=List[NotificationModel])
async def get_notifications(current_user: Dict = Depends(get_current_user)):
    cursor = notifications_collection.find({"user_id": current_user["id"]})
    notifications = await cursor.to_list(length=100)
    return notifications

@app.put("/api/notifications/{notification_id}/read", response_model=Dict[str, Any])
async def mark_notification_read(notification_id: str, current_user: Dict = Depends(get_current_user)):
    await notifications_collection.update_one({"id": notification_id, "user_id": current_user["id"]}, {"$set": {"is_read": True}})
    return {"msg": "Notification marked as read"}

# Admin Routes (Assumes current_user has admin privileges)
@app.get("/api/admin/users", response_model=List[UserOut])
async def admin_get_users(current_user: Dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    cursor = users_collection.find()
    users = await cursor.to_list(length=100)
    return [UserOut(**user) for user in users]

@app.get("/api/admin/listings", response_model=List[ListingModel])
async def admin_get_listings(current_user: Dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    cursor = listings_collection.find()
    listings = await cursor.to_list(length=100)
    return [ListingModel(**listing) for listing in listings]

@app.get("/api/admin/requests", response_model=List[RequestModel])
async def admin_get_requests(current_user: Dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    cursor = requests_collection.find()
    requests_list = await cursor.to_list(length=100)
    return [RequestModel(**req) for req in requests_list]

@app.get("/api/admin/stats", response_model=Dict[str, Any])
async def admin_stats(current_user: Dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    user_count = await users_collection.count_documents({})
    listing_count = await listings_collection.count_documents({})
    request_count = await requests_collection.count_documents({})
    return {
        "user_count": user_count,
        "listing_count": listing_count,
        "request_count": request_count,
    }

# Automated Matching Route
def generate_matching_suggestions(listing: dict, bank_info: list) -> str:
    """
    Build a prompt from listing details and nearby cities, call Gemini LLM,
    and return its generated text.
    """
    # Construct the prompt text using listing and food bank context
    prompt_text = f"""
Listing Details:
Title: {listing.get('title')}
Description: {listing.get('description')}
Category: {listing.get('category')}
Quantity: {listing.get('quantity')}
Expiry Date: {listing.get('expiry_date')}
Location: {listing.get('location')}

Nearby Food Banks:
{chr(10).join(bank_info)}

Based on the above information, provide matching suggestions for 2 possible ideal food banks that could receive this listing. Return your answer as JSON with the keys:
- "inventory_item_id": string,
- "recommended_food_bank_id": string,
- "explanation": string.
"""
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    model = "gemini-2.0-flash"
    contents = [
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=prompt_text)]
        )
    ]
    generate_content_config = types.GenerateContentConfig(
        temperature=1,
        top_p=0.95,
        top_k=40,
        max_output_tokens=8192,
        response_mime_type="text/plain",
    )
    output = ""
    for chunk in client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_content_config,
    ):
        output += chunk.text
    return output

# Updated Matching Endpoint with LLM integration
@app.post("/api/matching", response_model=Dict[str, Any])
async def matching_endpoint(match_req: MatchingRequest, current_user: Dict = Depends(get_current_user)):
    # Restrict to supermarket and admin roles
    if current_user.get("role") not in ["supermarket", "admin"]:
        raise HTTPException(status_code=403, detail="Only supermarkets can access matching suggestions")

    listing_id = match_req.listing_id
    listing = await listings_collection.find_one({"id": listing_id})
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    # Use food bank's location from current_user instead of listing's location
    food_bank_location = listing['location']
    if not food_bank_location:
        raise HTTPException(status_code=400, detail="Food bank location not set")

    # Get neighboring cities and distances from Neo4j
    def get_relevant_cities_and_distances(tx, city: str):
        query = """
        MATCH (c:City {name: $city})-[r:NEIGHBOR_OF]-(neighbor)
        RETURN neighbor.name AS city, r.distance AS distance
        """
        result = tx.run(query, city=city)
        return [{"city": record["city"], "distance": record["distance"]} for record in result]

    with neo4j_driver.session() as session:
        try:
            cities_data = session.read_transaction(get_relevant_cities_and_distances, food_bank_location)
            cities_data.append({"city": food_bank_location, "distance": 0})  # Add the current city with 0 distance
        except Exception as e:
            raise HTTPException(status_code=500, detail="Error querying Neo4j: " + str(e))

    # Query food banks in the relevant cities
    city_names = [entry["city"] for entry in cities_data]
    food_banks = await users_collection.find(
        {"location": {"$in": city_names}, "role": "food_bank"},
        {"_id": 0, "name": 1, "location": 1}
    ).to_list(None)

    # Create a mapping of city -> food banks
    food_banks_by_city = {}
    for fb in food_banks:
        city = fb["location"]
        if city not in food_banks_by_city:
            food_banks_by_city[city] = []
        food_banks_by_city[city].append(fb["name"])

    # Format data for the LLM prompt
    bank_info = []
    for entry in cities_data:
        city = entry["city"]
        distance = entry["distance"]
        banks = food_banks_by_city.get(city, [])
        for bank in banks:
            bank_info.append(f"{bank} (City: {city}, Distance: {distance} km)")

    llm_response = generate_matching_suggestions(listing, bank_info)
    return {
        "listing_id": listing_id,
        "matches_llm_output": llm_response
    }



# Neo4j City Management Routes
@app.post("/api/cities")
async def create_city(city: CityModel):
    city_data = {"name": city.name}
    
    # Validate Neo4j data
    validate_neo4j_data("Nodes", "City", city_data)

    query = "CREATE (c:City {name: $name})"
    with neo4j_driver.session() as session:
        session.run(query, name=city.name)

    return {"msg": f"City {city.name} created successfully"}


@app.post("/api/cities/neighbors", response_model=Dict[str, Any])
async def create_neighbor_relationship(neighbor: NeighborRelationshipModel, current_user: Dict = Depends(get_current_user)):
    with neo4j_driver.session() as session:
        try:
            session.write_transaction(
                lambda tx: tx.run("""
                    MATCH (a:City {name: $city_a}), (b:City {name: $city_b})
                    MERGE (a)-[r:NEIGHBOR_OF]->(b)
                    ON CREATE SET r.distance = $distance
                    MERGE (b)-[r2:NEIGHBOR_OF]->(a)
                    ON CREATE SET r2.distance = $distance
                """, city_a=neighbor.city_a, city_b=neighbor.city_b, distance=neighbor.distance)
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail="Error creating neighbor relationship: " + str(e))
    return {
        "msg": f"Neighbor relationship between {neighbor.city_a} and {neighbor.city_b} created successfully with distance {neighbor.distance}."
    }

# ---------------------
# Run the Application
# ---------------------

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
