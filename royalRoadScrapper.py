import array
import string
import sys
from urllib import request
from bs4 import BeautifulSoup 
from urllib.request import Request, urlopen
import html
import time
import grequests
import requests
import re
import pymongo
import time;
from datetime import datetime
import schedule
import time
import pytz
from schedule import every, repeat, run_pending

numberPages = 10
genreFilter = []
minRating = 4
minPage = 1000
updateFrequency = 1
totalSpd = 0
bestRatedAr = []
popularAr = []
TrendingAr = []
currentBooks = []
currentRead = []
bookCounter = 1
lightBlue = "#dae8ed"
darkBlue = "#acd1ee"
client = pymongo.MongoClient("mongodb://localhost:27017/")
dbName = client["bookData"]
collection = dbName["books"]
dataGenTime = 0
checkReqTime = 0
testingMode = False


# finds the matching end bracket while searching html
def findMatchingBracket(content, startingK, startingL, stopK):
    nextStart = content.find(startingK, startingL)
    nextEnd = content.find(stopK, startingL)
    if nextStart < nextEnd:
        pCount = 2
        startingL = nextStart + len(startingK)
    else:
        pCount = 1
        startingL = nextEnd + len(stopK)
    #parameter Count
    while pCount > 0:
        nextStart = content.find(startingK, startingL)
        nextEnd = content.find(stopK, startingL)
        if nextStart < nextEnd:
            pCount = pCount + 1
            startingL = nextStart + len(startingK)
        else:
            pCount = pCount - 1
            startingL = nextEnd + len(stopK)
    return (startingL - len(stopK))

# checks if book meets the filter requirements and adds them to db
def meetsReqs(book, oldData):
    global currentBooks
    global currentRead
    global checkReqTime
    checkReqStart = time.time()
    if (float(book[1]) > minRating and float(book[2]) > minPage and not html.unescape(book[0]) in oldData and not book[0] in oldData):
        if book[0] not in currentBooks:
            currentBookData = { "name": html.unescape(book[0]), "genre": book[5], "read": False, "pages": book[2], "rating": book[1], "chapters": book[3], "synopsis": book[4], "platform": "RoyalRoad", "bookId": book[6]}
            collection.update_one({"bookId": book[6]}, {'$set': currentBookData}, upsert=True)
            currentBooks.append(book[0])
            checkReqEnd = time.time()
            checkReqTime += checkReqEnd-checkReqStart
            return True
        else: 
            checkReqEnd = time.time()
            checkReqTime += checkReqEnd-checkReqStart
            return False    
    else:
        checkReqEnd = time.time()
        checkReqTime += checkReqEnd-checkReqStart
        return False    

def formatBook(content, savedData):
    global bookCounter 
    global lightBlue
    global darkBlue
    global dataGenTime
    global testingMode
    dataGenStart = time.time()
    bookData = ''
    bookArray = []

    # get titles 
    titleStart = content.find('class="font-red-sunglo bold">') + len(
        'class="font-red-sunglo bold">')
    titleEnd = content.find('</a>', titleStart)
    title = content[titleStart:titleEnd]
    bookArray.append(html.unescape(title))

    # get rating
    ratingStart = content.find('aria-label="') + len('aria-label="')
    ratingEnd = content.find('">', ratingStart)
    rating = content[ratingStart:ratingEnd]
    ratingValueEnd = rating.find(" out")
    bookArray.append(float(rating[len('Rating: '):ratingValueEnd]))

    # get pages
    pageStart = content.find('fa fa-book" aria-hidden="true"></i>') + len(
        'fa fa-book" aria-hidden="true"></i>')
    pageStart = content.find('<span>', pageStart) + len('<span>')
    pageEnd = content.find('</span>', pageStart)
    pages = content[pageStart:pageEnd]
    bookArray.append(int(pages[0:len(pages) - 6].replace(',', '')))

    # get chapters
    chapterStart = content.find('fa fa-list" aria-hidden="true"></i>') + len(
        'fa fa-list" aria-hidden="true"></i>')
    chapterStart = content.find('<span>', chapterStart) + len('<span>')
    chapterEnd = content.find(' Chapters', chapterStart)
    chapters = content[chapterStart:chapterEnd]
   
    bookArray.append(int(chapters.replace(',', '')))

    # get synopsis
    synoStart = content.find(
        'class="margin-top-10 col-xs-12" style="display: none; word-wrap: break-word; overflow-wrap: break-word">'
    ) + len(
        'class="margin-top-10 col-xs-12" style="display: none; word-wrap: break-word; overflow-wrap: break-word">'
    )
    synoEnd = content.find('</div>', synoStart)
    syno = content[synoStart:synoEnd]
    pStart = syno.find('<p>')
    formattedSyno = ""
    while syno.find('<p>', pStart) > 0:
        pStart = syno.find('<p>', pStart) + len('<p>')
        pEnd = syno.find('</p>', pStart)
        formattedSyno = formattedSyno + syno[pStart:pEnd]
        pStart = pEnd
    finalSyno = ""
    finalSyno = formattedSyno
    bookArray.append(finalSyno)

    #get genres
    genreStart = content.find('<span class="label label-default label-sm bg-blue-hoki" style="overflow: hidden; display: inline-block; padding: 3px 5px;">') + len(
        '<span class="label label-default label-sm bg-blue-hoki" style="overflow: hidden; display: inline-block; padding: 3px 5px;">')
    firstEnd = content.find('</span>', genreStart)
    tagsArray = []
    firstTag = content[genreStart:firstEnd]
    tagsArray.append(firstTag)
    genreStart = firstEnd + len('</span>')
    totalGenreEnd = content.find('<label for="', genreStart)
    totalGenre = content[genreStart:totalGenreEnd]
    #next genres
    while totalGenre.find('<a class="label label-default label-sm bg-blue-dark fiction-tag" href=', genreStart) > 0:
        genreStart = totalGenre.find('<a class="label label-default label-sm bg-blue-dark fiction-tag" href=', genreStart) + len('<a class="label label-default label-sm bg-blue-dark fiction-tag" href=')
        genreStart = totalGenre.find('>', genreStart) + 1
        genreEnd = totalGenre.find('</a>', genreStart)
        tagsArray.append(totalGenre[genreStart:genreEnd])
        genreStart = genreEnd
    bookArray.append(tagsArray)

    #get titleId
    idStart = content.find('<a href="/fiction/') + len('<a href="/fiction/')
    idEnd = content.find('/', idStart)
    bookId = content[idStart:idEnd]
    bookArray.append(bookId)


    dataGenEnd = time.time()
    dataGenTime += dataGenEnd-dataGenStart
    meetsReqs(bookArray, savedData)


#  formats the webpage and gets all the fictions
#  page - string - html data of the page
def formatPage(page, saveData):
    pageS = page.find('<div class="fiction-list-item row">')
    while page.find('<div class="fiction-list-item row">', pageS) > 0:
        pageS = page.find('<div class="fiction-list-item row">', pageS)
        pageE = findMatchingBracket(
            page, "<div", pageS + len('<div class="fiction-list-item row">'),
            "</div>")
        formatBook(page[pageS:pageE], saveData)
        pageS = pageE


# gets summary of trending, best rated and popular pages
def getSummary():
    global testingMode
    global numberPages
    global minRating
    global minPage
    global st

    st = time.time()
    
    readBooksQuery = collection.find({'read': True})
    readBooksArray = []
    for read in readBooksQuery:
        readBooksArray.append(read["name"]) 
    oldData = readBooksArray
    if testingMode:
        print(oldData)

    links = []
    n = 1
    while n < int(numberPages):
        links.append('https://www.royalroad.com/fictions/best-rated?page=' +
                     str(n))
        n = n + 1
    n = 1
    while n < int(numberPages):
        links.append(
            'https://www.royalroad.com/fictions/weekly-popular?page=' + str(n))
        n = n + 1
    links.append('https://www.royalroad.com/fictions/trending')
    totalformattime = 0
    head = {"User-Agent": "Mozilla/5.0 (X11; CrOS x86_64 12871.102.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.141 Safari/537.36"}
    grequests
    multiLinks = (grequests.get(u, headers=head) for u in links)
    for i, resp in enumerate(grequests.map(multiLinks, size=10)):
        try:
            # soup = BeautifulSoup(resp.content, 'html5lib')
            # print(soup)
            formatPage(resp.text, oldData)
        except:
            print("Error, no text found.\n")
            # print("Error link: " + links[i])
           
        
    

def getSettings():
    global numberPages
    global minRating
    global minPage
    global updateFrequency

    settings = open(
        r"C:\Users\yiran\Documents\Visual Studio 2022\RoyalroadScrapper\settings.txt",
        "r",
        encoding="UTF-8")
    settings = settings.read()
    amountStart = settings.find("amount:") + len("amount:")
    amountEnd =  settings.find("|")
    numberPages = int(settings[amountStart:amountEnd])

    ratingStart = settings.find("rating:") + len("rating:")
    ratingEnd = settings.find("|", ratingStart)
    minRating = float(settings[ratingStart:ratingEnd])

    pageStart = settings.find("page:") + len("page:")
    pageEnd = settings.find("|", pageStart)
    minPage = int(settings[pageStart:pageEnd])

    updateStart = settings.find("updateFreq:") + len("updateFreq:")
    updateEnd = settings.find("|", updateStart)
    updateFrequency = int(settings[updateStart:updateEnd])

    

def updateSettings():
    global numberPages
    global minRating
    global minPage
    global updateFrequency
    updateStart = time.time()
    
    numberPages = int(input('Search pages amount?'))
    minRating = float(input('Min Rating?'))
    minPage = int(input('Min Page?'))
    updateFrequency = int(input('Update every x days?'))
    sys.stdout = open(
        r"C:\Users\yiran\Documents\Visual Studio 2022\RoyalroadScrapper\settings.txt",
        "w",
        encoding="UTF-8")
    print("amount:" + str(numberPages) + "|\n")
    print("rating:" + str(minRating) + "|\n")
    print("page:" + str(minPage) + "|\n")
    print("updateFreq:" + str(updateFrequency) + "|\n")
    sys.stdout.close()
    sys.stdout = sys.stderr
    updateEnd = time.time()
    print("Update time: " + str(updateEnd-updateStart)) 

def dailyUpdate():
    getSettings()
    getSummary()
    et = time.time()
    # get the execution time
    elapsed_time = et - st
    sys.stdout = sys.stderr
    print('Execution time:', elapsed_time, 'seconds')
    print('Last updated: ' + datetime.today().strftime('%Y-%m-%d %H:%M:%S'))

# UI switch
action = int(input("Enter 1 to update settings, enter 2 for daily updates: \r\n"))
schedule.every(int(updateFrequency)).day.at("00:30", "US/Pacific").do(dailyUpdate)
if action == 1:
    updateSettings()
    getSummary()
    et = time.time()
    # get the execution time
    elapsed_time = et - st
    print('Execution time:', elapsed_time, 'seconds')
    print('Data Gen time:', dataGenTime)
    print('Check req time:', checkReqTime)
elif action == 2:
    while True:
        n = schedule.idle_seconds()
        if n is None:
        # no more jobs
            break
        elif n > 0:
        # sleep exactly the right amount of time
            time.sleep(n)
        schedule.run_pending()
elif action == 3:
    testingMode = True
    print('Testing mode:')
    getSettings()
    getSummary()
    et = time.time()
    # get the execution time
    elapsed_time = et - st
    sys.stdout = sys.stderr
    print('Execution time:', elapsed_time, 'seconds')
    print('Last updated: ' + datetime.today().strftime('%Y-%m-%d %H:%M:%S'))
elif action ==  4:
    updateBooks = input('Set as read:')
    readBooks = list(map(str.strip, updateBooks.split("', '")))
    print(readBooks)
    # for b in readBooks:
    #     currentBookData = {"read": True}
    #     collection.update_one({"name": b}, {'$set': currentBookData})
        




