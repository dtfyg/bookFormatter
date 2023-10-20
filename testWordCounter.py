import sys
from urllib import request
from urllib.request import Request, urlopen
import html
import time
import grequests
from selenium import webdriver

Test_string = "Hello sentence 1 is here. Sentence 2 is here."

# We get the url
# r = requests.get("https://novelingua.com/demon-prince-goes-to-the-academy-chapter-700/")
# soup = BeautifulSoup(r.content)

# # We get the words within paragrphs
# text_p = (''.join(s.findAll(text=True))for s in soup.findAll('p'))
# c_p = list(x.rstrip(punctuation).lower() for y in text_p for x in y.split())

# # We get the words within divs
# text_div = (''.join(s.findAll(text=True))for s in soup.findAll('div'))
# c_div = Counter((x.rstrip(punctuation).lower() for y in text_div for x in y.split()))

# # We sum the two countesr and get a list with words count from most to less common
# total = c_div + c_p
# list_most_common_words = total.most_common() 

# total = len(c_p)
# print(total)

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


def getBookPages(data):
      book1s = data.find('<div class="search_title">')
      print(data)
      book1s = data.find('<a href=', book1s)
      book1s = data.find('>', book1s)
      book1e = data.find('</a>', book1s)
      book1C = data[book1s:book1e]
      print(book1C)
      


links = []
n=1
while n < 3:
    links.append(
    'https://www.novelupdates.com/series-ranking/?rank=week&pg=' + str(n))
    n = n + 1
    # links.append('https://www.royalroad.com/fictions/trending')
# print(links)

# multiLinks = (grequests.get(u) for u in links)
# for i, resp in enumerate(grequests.map(multiLinks)):
#     #   print(resp.text) 
#       getBookPages(resp.text)

dr = webdriver.Chrome()
dr.get("https://www.novelupdates.com/series-ranking/?rank=week&pg=1")
bs = BeautifulSoup(dr.page_source,"lxml")
print(bs)