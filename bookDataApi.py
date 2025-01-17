from fastapi import FastAPI
import pymongo
import json
from bson import json_util
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
client = pymongo.MongoClient("mongodb://localhost:27017/")
dbName = client["bookData"]
collection = dbName["books"]
app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# response example:
# {
#     "RC": 200,
#     "books": {
#         [book1, 5, 3, 10], [book2]
#      } 
# }
@app.get("/getBooks")
def getUnread():
  result = {"RC": 200, "books": {}}
  
  for x in collection.find({"read": False}):
      currName = x["name"]
      currCh = x["chapters"]
      currGenre = x["genre"]
      currPage = x["pages"]
      currRating = x["rating"]
      currSynopsis = x["synopsis"]
      result["books"][currName] = {"chapters": currCh, "genres": currGenre, "pages": currPage, "rating": currRating, "synopsis": currSynopsis } 
  return  result

class Item(BaseModel):
    book: str

@app.post("/completeBook/")
async def setComplete(item: Item):
  result = {"RC": 200, "completed": 1}
  collection.update_one({"name": item.book}, {"$set": {"read": True}})
  # print(item.book)
  return result

#filter book api
class filterObj(BaseModel):
    genre: list
    pages: int
    rating: float
    read: bool

@app.post("/getFilterBooks/")
async def getFiltered(item: filterObj):
  result = {"RC": 200, "books": {}}
  
  # collection.update_one({"name": item.book}, {"$set": {"read": True}})
  
  if (item.read == True):
     read = { '$exists': True}
  else:
     read = False
  
  if len(item.genre) > 0:
      filterQuery = {"genre": {'$all': item.genre}, "pages": {'$gte': item.pages}, "rating": {'$gte': item.rating}, "read": read}
  else:
      filterQuery = {"pages": {'$gte': item.pages}, "rating": {'$gte': item.rating}, "read": read}
  
  for x in collection.find(filterQuery):
      currName = x["name"]
      currCh = x["chapters"]
      currGenre = x["genre"]
      currPage = x["pages"]
      currRating = x["rating"]
      currSynopsis = x["synopsis"]
      result["books"][currName] = {"chapters": currCh, "genres": currGenre, "pages": currPage, "rating": currRating, "synopsis": currSynopsis } 
  return  result

from fastapi import FastAPI
import pymongo
import json
from bson import json_util
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
client = pymongo.MongoClient("mongodb://localhost:27017/")
dbName = client["bookData"]
collection = dbName["books"]
app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# response example:
# {
#     "RC": 200,
#     "books": {
#         [book1, 5, 3, 10], [book2]
#      } 
# }
@app.get("/getBooks")
def getUnread():
  result = {"RC": 200, "books": {}}
  
  for x in collection.find({"read": False}):
      currName = x["name"]
      currCh = x["chapters"]
      currGenre = x["genre"]
      currPage = x["pages"]
      currRating = x["rating"]
      currSynopsis = x["synopsis"]
      result["books"][currName] = {"chapters": currCh, "genres": currGenre, "pages": currPage, "rating": currRating, "synopsis": currSynopsis } 
  return  result

class Item(BaseModel):
    book: str

@app.post("/completeBook/")
async def setComplete(item: Item):
  result = {"RC": 200, "completed": 1}
  collection.update_one({"name": item.book}, {"$set": {"read": True}})
  # print(item.book)
  return result

#filter book api
class filterObj(BaseModel):
    genre: list
    pages: int
    rating: float
    read: bool
    sort_by: str 
    sort_order: int 

@app.post("/getFilterBooks/")
async def getFiltered(item: filterObj):
  result = {"RC": 200, "books": {}}
  
  # collection.update_one({"name": item.book}, {"$set": {"read": True}})
  
  if (item.read == True):
     read = { '$exists': True}
  else:
     read = False
  filterQuery = {
        "pages": {'$gte': item.pages},
        "rating": {'$gte': item.rating},
        "read": read
    }
  if item.genre:
     filterQuery["genre"] = {'$all': item.genre}
#   if len(item.genre) > 0:
#       filterQuery = {"genre": {'$all': item.genre}, "pages": {'$gte': item.pages}, "rating": {'$gte': item.rating}, "read": read}
#   else:
#       filterQuery = {"pages": {'$gte': item.pages}, "rating": {'$gte': item.rating}, "read": read}
  sortCriteria = []
  if item.sort_by:
     sortCriteria = [(item.sort_by, item.sort_order)]

    # MongoDB find with optional sort
  cursor = collection.find(filterQuery)
  if sortCriteria:
     cursor = cursor.sort(sortCriteria)
  for x in cursor:
      currName = x["name"]
      currCh = x["chapters"]
      currGenre = x["genre"]
      currPage = x["pages"]
      currRating = x["rating"]
      currSynopsis = x["synopsis"]
      result["books"][currName] = {"chapters": currCh, "genres": currGenre, "pages": currPage, "rating": currRating, "synopsis": currSynopsis } 
  return  result
