"""
View MongoDB Data - Resume Builder
Simple script to view all data stored in your MongoDB Atlas database
"""
import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import json
from datetime import datetime

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def view_database_data():
    try:
        # Connect to MongoDB
        mongo_url = os.environ.get('MONGO_URL')
        db_name = os.environ.get('DB_NAME', 'resume_builder')
        
        client = AsyncIOMotorClient(mongo_url)
        db = client[db_name]
        
        print("\n" + "="*70)
        print(f"📊 VIEWING DATA FROM: {db_name}")
        print("="*70 + "\n")
        
        # List all collections
        collections = await db.list_collection_names()
        
        if not collections:
            print("❌ No collections found. Database is empty.")
            print("   Upload a resume to create data!\n")
            client.close()
            return
        
        # View data from each collection
        for collection_name in collections:
            collection = db[collection_name]
            count = await collection.count_documents({})
            
            print(f"\n📁 Collection: {collection_name}")
            print(f"   Total documents: {count}")
            print("-" * 70)
            
            if count == 0:
                print("   (Empty - no data yet)\n")
                continue
            
            # Get all documents
            cursor = collection.find({}).limit(10)  # Limit to 10 for display
            documents = await cursor.to_list(length=10)
            
            for i, doc in enumerate(documents, 1):
                print(f"\n   📄 Document #{i}:")
                
                # Remove MongoDB _id for cleaner display
                if '_id' in doc:
                    del doc['_id']
                
                # Display key information based on collection
                if collection_name == 'resumes':
                    print(f"      Resume ID: {doc.get('id', 'N/A')}")
                    print(f"      Created: {doc.get('created_at', 'N/A')}")
                    print(f"      Sections: {len(doc.get('sections', []))}")
                    print(f"      Text Preview: {doc.get('raw_text', '')[:100]}...")
                    
                elif collection_name == 'ats_scores':
                    print(f"      Score ID: {doc.get('id', 'N/A')}")
                    print(f"      Resume ID: {doc.get('resume_id', 'N/A')}")
                    print(f"      Overall Score: {doc.get('overall_score', 0)}%")
                    print(f"      Keyword Score: {doc.get('keyword_score', 0)}%")
                    print(f"      Formatting Score: {doc.get('formatting_score', 0)}%")
                    print(f"      Section Score: {doc.get('section_score', 0)}%")
                    
                elif collection_name == 'enhanced_resumes':
                    print(f"      Enhanced ID: {doc.get('id', 'N/A')}")
                    print(f"      Original Resume ID: {doc.get('original_resume_id', 'N/A')}")
                    print(f"      Enhancement Type: {doc.get('enhancement_type', 'N/A')}")
                    print(f"      Created: {doc.get('created_at', 'N/A')}")
                
                print()
            
            if count > 10:
                print(f"   ... and {count - 10} more documents\n")
        
        print("\n" + "="*70)
        print("✅ Data viewing complete!")
        print("="*70 + "\n")
        
        client.close()
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}\n")

if __name__ == "__main__":
    asyncio.run(view_database_data())
