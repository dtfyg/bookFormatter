import pymongo
from datetime import datetime

myclient = pymongo.MongoClient("mongodb://localhost:27017/")
mydb = myclient["bookData"]
mycol = mydb["books"]

# readBooksQuery = mycol.find({'read': True})
# print(readBooksQuery)

# for read in readBooksQuery:
    
#     print(read["name"])
print(datetime.today())