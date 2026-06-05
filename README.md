*Book Formatter* 

Scraps data from royalroad to store and sort

*Features*
- Periodically scrapes RoyalRoad for new fiction, updates, and metadata

- Extracts titles, authors, genres, tags, chapter counts, ratings, and descriptions

- Handles pagination, throttling, and anti‑scraping safeguards

- Detects and updates existing entries without duplicates

- Stores all scraped data in a mongodb database

- Normalized schema for books, authors, tags, and chapter metadata

- Filter by rating, popularity, update date, or completion status


*Setup and usage*
bash
git clone https://github.com/dtfyg/bookFormatter.git
cd into the file directory and use following for server
uvicorn main:app --host <HOST> --port <PORT> 
python royalRoadScrapper.py for scraping options
