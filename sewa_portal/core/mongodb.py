"""
MongoDB Connection Utility
Use this module to interact with MongoDB directly when needed.
Django ORM will use SQLite, but you can use MongoDB for specific collections.
"""

from pymongo import MongoClient
from django.conf import settings


class MongoDBConnection:
    """Singleton MongoDB connection"""
    _instance = None
    _client = None
    _db = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._client is None and settings.MONGODB_URI:
            self._client = MongoClient(settings.MONGODB_URI)
            self._db = self._client[settings.MONGODB_DB_NAME]
    
    @property
    def db(self):
        """Get the MongoDB database instance"""
        return self._db
    
    @property
    def client(self):
        """Get the MongoDB client instance"""
        return self._client
    
    def get_collection(self, collection_name):
        """Get a specific collection from MongoDB"""
        if self._db is not None:
            return self._db[collection_name]
        return None
    
    def close(self):
        """Close the MongoDB connection"""
        if self._client:
            self._client.close()
            self._client = None
            self._db = None


# Global instance
mongodb = MongoDBConnection()


# Usage example:
# from core.mongodb import mongodb
# 
# # Get a collection
# users_collection = mongodb.get_collection('users')
# 
# # Insert a document
# users_collection.insert_one({'name': 'John', 'email': 'john@example.com'})
# 
# # Query documents
# user = users_collection.find_one({'email': 'john@example.com'})
