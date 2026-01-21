"""
MongoDB Database Setup and Verification Script
Run this to verify your MongoDB connection and create the database
"""
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import asyncio

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def verify_and_setup_database():
    try:
        # Get MongoDB URL from environment
        mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        db_name = os.environ.get('DB_NAME', 'resume_builder')
        
        print("=" * 60)
        print("MongoDB Connection Test")
        print("=" * 60)
        print(f"Connecting to: {mongo_url}")
        print(f"Database name: {db_name}")
        print("-" * 60)
        
        # Connect to MongoDB
        client = AsyncIOMotorClient(mongo_url)
        db = client[db_name]
        
        # Test connection
        await client.admin.command('ping')
        print("✅ Successfully connected to MongoDB!")
        
        # List existing collections
        collections = await db.list_collection_names()
        print(f"\n📂 Existing collections in '{db_name}':")
        if collections:
            for coll in collections:
                count = await db[coll].count_documents({})
                print(f"   - {coll}: {count} documents")
        else:
            print("   (No collections yet - will be created automatically)")
        
        # Show what collections will be used
        print(f"\n📋 Collections that will be created by the app:")
        print("   - resumes: Store original resume data")
        print("   - ats_scores: Store ATS scoring results")
        print("   - enhanced_resumes: Store AI-enhanced resumes")
        
        # Database stats
        stats = await db.command("dbStats")
        print(f"\n📊 Database Statistics:")
        print(f"   - Size on disk: {stats.get('dataSize', 0) / 1024:.2f} KB")
        print(f"   - Number of collections: {stats.get('collections', 0)}")
        
        print("\n" + "=" * 60)
        print("✅ MongoDB is ready for the Resume Builder application!")
        print("=" * 60)
        
        client.close()
        
    except Exception as e:
        print("\n" + "=" * 60)
        print("❌ Error connecting to MongoDB:")
        print("=" * 60)
        print(f"Error: {str(e)}")
        print("\nTroubleshooting:")
        print("1. Make sure MongoDB service is running")
        print("2. Check that MONGO_URL in .env is correct")
        print("3. Verify MongoDB is listening on port 27017")
        print("=" * 60)

if __name__ == "__main__":
    asyncio.run(verify_and_setup_database())
