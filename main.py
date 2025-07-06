from fastapi import FastAPI
import pymongo
import json
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.responses import RedirectResponse
from fastapi.responses import JSONResponse
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
    # allow_origins=origins,
    allow_origins=["*"],
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
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
def serve_html():
    return FileResponse("C:/Users/yiran/Documents/Visual Studio 2022/RoyalroadScrapper/Results/bookRankings.html")
@app.get("/getBooks")
async def getUnread():
  result = {"RC": 200, "books": {}}
  
  for x in collection.find({"read": False}):
      currName = x["name"]
      currCh = x["chapters"]
      currGenre = x["genre"]
      currPage = x["pages"]
      currRating = x["rating"]
      currSynopsis = x["synopsis"]
      currBookmarked = x.get("bookmarked", False)
      currNote = x.get("note", "")
      result["books"][currName] = {"chapters": currCh, "genres": currGenre, "pages": currPage, "rating": currRating, "synopsis": currSynopsis, "bookmarked": currBookmarked, "note": currNote } 
  return  result

class Item(BaseModel):
    book: str
    
@app.post("/bookmark/")
async def bookmarkBook(item: Item):
    result = {"RC": 200, "bookmarked": 1}
    collection.update_one({"name": item.book}, {"$set": {"bookmarked": True}})
    return result



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
    bookmarked: bool

@app.post("/getFilterBooks/")
async def getFiltered(item: filterObj):
  result = {"RC": 200, "books": {}}
  
  # collection.update_one({"name": item.book}, {"$set": {"read": True}})
  
  if (item.read == True):
     read = { '$exists': True}
  else:
     read = False
  # filterQuery = {
  #       "pages": {'$gte': item.pages},
  #       "rating": {'$gte': item.rating},
  #       "$or": [
  #       {"bookmarked": item.bookmarked},
  #       {"bookmarked": {"$exists": False}} if item.bookmarked == False else {"bookmarked": {"$exists": True}}
  #   ]
  #   }
  filterQuery = {
    "pages": {"$gte": item.pages},
    "rating": {"$gte": item.rating},
  }
  if item.read == True:
    filterQuery["read"] = True
  elif item.read == False:
    filterQuery["$and"] = filterQuery.get("$and", []) + [
        {"$or": [
            {"read": False},
            {"read": {"$exists": False}}
        ]}
    ]
  if item.bookmarked == True:
    filterQuery["bookmarked"] = True
  elif item.bookmarked == False:
    filterQuery["$and"] = filterQuery.get("$and", []) + [
        {"$or": [
            {"bookmarked": False},
            {"bookmarked": {"$exists": False}}
        ]}
    ]

  if item.genre:
     filterQuery["genre"] = {'$all': item.genre}

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
      currBookmarked = x.get("bookmarked", False)
      currNote = x.get("note", "")
      result["books"][currName] = {"chapters": currCh, "genres": currGenre, "pages": currPage, "rating": currRating, "synopsis": currSynopsis, "bookmarked": currBookmarked, "note": currNote } 
  return  result


#filter book api
class note(BaseModel):
    book: str
    notestr: str 
@app.post("/addNote/")
async def getFiltered(item: note):
  result = {"RC": 200, "note": {item.notestr}}
  collection.update_one({"name": item.book}, {"$set": {"note": item.notestr}})
  return result